import { create } from 'zustand'
import type {
  ReimbursementEstimate,
  EstimateLineItem,
} from '@/lib/validations/reimbursement'

// ============================================
// Types
// ============================================

export interface SelectedProcedure {
  cptCode: string
  description: string
  chargeAmountCents: number
  qpaAmountCents: number
}

interface InsuranceDetails {
  oonDeductible: number
  oonDeductibleMet: number
  oonCoinsurancePct: number
  oonOutOfPocketMax: number
  oonOutOfPocketMet: number
}

interface CalculatorState {
  // Step tracking
  currentStep: 1 | 2 | 3

  // Selected services
  selectedProcedures: SelectedProcedure[]

  // Insurance details (all values in cents except coinsurance pct)
  insuranceDetails: InsuranceDetails

  // Calculation results
  estimate: ReimbursementEstimate | null

  // Actions — navigation
  setStep: (step: 1 | 2 | 3) => void
  nextStep: () => void
  prevStep: () => void

  // Actions — procedures
  addProcedure: (proc: SelectedProcedure) => void
  removeProcedure: (cptCode: string) => void
  clearProcedures: () => void

  // Actions — insurance
  setInsuranceDetails: (details: Partial<InsuranceDetails>) => void

  // Actions — calculate
  recalculate: () => void

  // Actions — reset
  reset: () => void
}

// ============================================
// Default values
// ============================================

const DEFAULT_INSURANCE: InsuranceDetails = {
  oonDeductible: 500_000, // $5,000
  oonDeductibleMet: 0,
  oonCoinsurancePct: 40, // 40% — patient pays 40% after deductible
  oonOutOfPocketMax: 1_200_000, // $12,000
  oonOutOfPocketMet: 0,
}

// ============================================
// Calculation Logic
// ============================================

/**
 * Performs the full OON reimbursement estimate calculation.
 *
 * Most OON plans reimburse based on the "allowed amount" which is often
 * the QPA or a percentage of billed charges. For this calculator, we assume
 * the insurer uses QPA as the allowed/recognized amount (most common
 * approach post No Surprises Act).
 *
 * Flow:
 * 1. Sum up all recognized/allowed amounts (QPA-based)
 * 2. Apply remaining OON deductible
 * 3. Apply coinsurance to the amount after deductible
 * 4. Check against OOP max
 * 5. Patient responsibility = total charges - insurance payment
 */
function calculateEstimate(
  procedures: SelectedProcedure[],
  insurance: InsuranceDetails
): ReimbursementEstimate {
  // Build line items
  const lineItems: EstimateLineItem[] = procedures.map((proc) => ({
    cptCode: proc.cptCode,
    description: proc.description,
    foundationChargeCents: proc.chargeAmountCents,
    qpaAmountCents: proc.qpaAmountCents,
    // Most insurers use QPA as their allowed/recognized amount for OON
    estimatedAllowedCents: proc.qpaAmountCents,
  }))

  const totalChargesCents = lineItems.reduce(
    (sum, item) => sum + item.foundationChargeCents,
    0
  )
  const totalQpaCents = lineItems.reduce(
    (sum, item) => sum + item.qpaAmountCents,
    0
  )
  const totalEstimatedAllowedCents = lineItems.reduce(
    (sum, item) => sum + item.estimatedAllowedCents,
    0
  )

  // Step 1: Determine remaining deductible
  const deductibleRemainingCents = Math.max(
    0,
    insurance.oonDeductible - insurance.oonDeductibleMet
  )

  // Step 2: Apply deductible against the allowed amount
  const deductibleAppliedCents = Math.min(
    deductibleRemainingCents,
    totalEstimatedAllowedCents
  )

  const afterDeductibleCents = Math.max(
    0,
    totalEstimatedAllowedCents - deductibleAppliedCents
  )

  // Step 3: Coinsurance — the insurer pays (100 - coinsurance%) of the remainder
  // Example: if coinsurance is 40%, patient pays 40%, insurer pays 60%
  const insurerCoinsurancePct = (100 - insurance.oonCoinsurancePct) / 100
  const insurerShareBeforeOopCents = Math.round(
    afterDeductibleCents * insurerCoinsurancePct
  )
  const patientCoinsuranceCents = afterDeductibleCents - insurerShareBeforeOopCents

  // Step 4: Check out-of-pocket max
  // Patient OOP = deductible applied + coinsurance share
  const oopRemainingCents = Math.max(
    0,
    insurance.oonOutOfPocketMax - insurance.oonOutOfPocketMet
  )
  const rawPatientOopCents = deductibleAppliedCents + patientCoinsuranceCents

  // If patient would exceed OOP max, insurer picks up the excess
  let oopMaxProtectionCents = 0
  let finalPatientOopFromAllowedCents = rawPatientOopCents

  if (rawPatientOopCents > oopRemainingCents) {
    oopMaxProtectionCents = rawPatientOopCents - oopRemainingCents
    finalPatientOopFromAllowedCents = oopRemainingCents
  }

  // Step 5: Insurance payment = allowed amount - patient's share of allowed
  const estimatedInsurancePaymentCents =
    totalEstimatedAllowedCents - finalPatientOopFromAllowedCents

  // Step 6: Patient responsibility = total charges - insurance payment
  // Since Foundation charges more than allowed, patient covers the difference
  const estimatedPatientResponsibilityCents = Math.max(
    0,
    totalChargesCents - estimatedInsurancePaymentCents
  )

  return {
    lineItems,
    totalChargesCents,
    totalQpaCents,
    totalEstimatedAllowedCents,
    deductibleRemainingCents,
    deductibleAppliedCents,
    coinsuranceAmountCents: patientCoinsuranceCents,
    estimatedInsurancePaymentCents,
    estimatedPatientResponsibilityCents,
    oopMaxProtectionCents,
  }
}

// ============================================
// Store
// ============================================

export const useCalculatorStore = create<CalculatorState>((set, get) => ({
  currentStep: 1,
  selectedProcedures: [],
  insuranceDetails: { ...DEFAULT_INSURANCE },
  estimate: null,

  // Navigation
  setStep: (step) => set({ currentStep: step }),

  nextStep: () => {
    const { currentStep } = get()
    if (currentStep < 3) {
      const nextStep = (currentStep + 1) as 1 | 2 | 3
      set({ currentStep: nextStep })

      // Auto-calculate when moving to step 3
      if (nextStep === 3) {
        get().recalculate()
      }
    }
  },

  prevStep: () => {
    const { currentStep } = get()
    if (currentStep > 1) {
      set({ currentStep: (currentStep - 1) as 1 | 2 | 3 })
    }
  },

  // Procedures
  addProcedure: (proc) => {
    const { selectedProcedures } = get()
    const exists = selectedProcedures.some((p) => p.cptCode === proc.cptCode)
    if (!exists) {
      set({ selectedProcedures: [...selectedProcedures, proc] })
    }
  },

  removeProcedure: (cptCode) => {
    const { selectedProcedures } = get()
    set({
      selectedProcedures: selectedProcedures.filter(
        (p) => p.cptCode !== cptCode
      ),
    })
  },

  clearProcedures: () => {
    set({ selectedProcedures: [] })
  },

  // Insurance
  setInsuranceDetails: (details) => {
    const { insuranceDetails } = get()
    set({
      insuranceDetails: { ...insuranceDetails, ...details },
    })
  },

  // Calculate
  recalculate: () => {
    const { selectedProcedures, insuranceDetails } = get()
    if (selectedProcedures.length === 0) {
      set({ estimate: null })
      return
    }
    const estimate = calculateEstimate(selectedProcedures, insuranceDetails)
    set({ estimate })
  },

  // Reset
  reset: () => {
    set({
      currentStep: 1,
      selectedProcedures: [],
      insuranceDetails: { ...DEFAULT_INSURANCE },
      estimate: null,
    })
  },
}))
