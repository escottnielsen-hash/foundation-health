'use server'

import { createClient } from '@/lib/supabase/server'
import {
  QPA_REFERENCE_DATA,
  filterQpaByCategory,
  getFoundationChargeCents,
} from '@/lib/data/qpa-reference'
import type { QpaReference } from '@/lib/data/qpa-reference'
import {
  calculatorInputSchema,
} from '@/lib/validations/reimbursement'
import type {
  ReimbursementEstimate,
  EstimateLineItem,
} from '@/lib/validations/reimbursement'
import { ZodError } from 'zod'

// ============================================
// Result types for server actions
// ============================================

interface ActionSuccess<T> {
  success: true
  data: T
}

interface ActionError {
  success: false
  error: string
  fieldErrors?: Record<string, string>
}

type ActionResult<T> = ActionSuccess<T> | ActionError

// ============================================
// QPA reference with computed charge
// ============================================

export interface QpaReferenceWithCharge extends QpaReference {
  foundationChargeCents: number
}

// ============================================
// getQpaReferences
// ============================================

export async function getQpaReferences(
  category?: QpaReference['category']
): Promise<ActionResult<QpaReferenceWithCharge[]>> {
  try {
    const references = category
      ? filterQpaByCategory(category)
      : QPA_REFERENCE_DATA

    const withCharges: QpaReferenceWithCharge[] = references.map((ref) => ({
      ...ref,
      foundationChargeCents: getFoundationChargeCents(ref),
    }))

    return { success: true, data: withCharges }
  } catch {
    return {
      success: false,
      error: 'Could not load QPA reference data.',
    }
  }
}

// ============================================
// calculateReimbursementEstimate
// ============================================

export async function calculateReimbursementEstimate(input: {
  procedures: {
    cptCode: string
    description: string
    chargeAmountCents: number
    qpaAmountCents: number
  }[]
  insurance: {
    oonDeductible: number
    oonDeductibleMet: number
    oonCoinsurancePct: number
    oonOutOfPocketMax: number
    oonOutOfPocketMet: number
  }
}): Promise<ActionResult<ReimbursementEstimate>> {
  try {
    // Validate input
    const result = calculatorInputSchema.safeParse(input)
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of (result.error as ZodError).issues) {
        const fieldName = issue.path.join('.')
        if (fieldName && !fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message
        }
      }
      return {
        success: false,
        error: 'Invalid calculator input.',
        fieldErrors,
      }
    }

    const { procedures, insurance } = result.data

    // Build line items
    const lineItems: EstimateLineItem[] = procedures.map((proc) => ({
      cptCode: proc.cptCode,
      description: proc.description,
      foundationChargeCents: proc.chargeAmountCents,
      qpaAmountCents: proc.qpaAmountCents,
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

    // Step 1: Remaining deductible
    const deductibleRemainingCents = Math.max(
      0,
      insurance.oonDeductible - insurance.oonDeductibleMet
    )

    // Step 2: Apply deductible
    const deductibleAppliedCents = Math.min(
      deductibleRemainingCents,
      totalEstimatedAllowedCents
    )
    const afterDeductibleCents = Math.max(
      0,
      totalEstimatedAllowedCents - deductibleAppliedCents
    )

    // Step 3: Coinsurance
    const insurerCoinsurancePct = (100 - insurance.oonCoinsurancePct) / 100
    const insurerShareBeforeOopCents = Math.round(
      afterDeductibleCents * insurerCoinsurancePct
    )
    const patientCoinsuranceCents =
      afterDeductibleCents - insurerShareBeforeOopCents

    // Step 4: OOP max check
    const oopRemainingCents = Math.max(
      0,
      insurance.oonOutOfPocketMax - insurance.oonOutOfPocketMet
    )
    const rawPatientOopCents = deductibleAppliedCents + patientCoinsuranceCents

    let oopMaxProtectionCents = 0
    let finalPatientOopFromAllowedCents = rawPatientOopCents

    if (rawPatientOopCents > oopRemainingCents) {
      oopMaxProtectionCents = rawPatientOopCents - oopRemainingCents
      finalPatientOopFromAllowedCents = oopRemainingCents
    }

    // Step 5: Insurance payment
    const estimatedInsurancePaymentCents =
      totalEstimatedAllowedCents - finalPatientOopFromAllowedCents

    // Step 6: Patient responsibility
    const estimatedPatientResponsibilityCents = Math.max(
      0,
      totalChargesCents - estimatedInsurancePaymentCents
    )

    return {
      success: true,
      data: {
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
      },
    }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred while calculating the estimate.',
    }
  }
}

// ============================================
// Financial Summary Types
// ============================================

export interface PatientFinancialSummary {
  totalChargedCents: number
  totalInsuranceReimbursedCents: number
  totalPendingReimbursementCents: number
  totalPatientPaidCents: number
  netOutOfPocketCents: number
  claimCount: number
  pendingClaimCount: number
}

export interface ReimbursementHistoryItem {
  id: string
  claimDate: string
  serviceDate: string
  description: string
  cptCode: string | null
  chargedAmountCents: number
  allowedAmountCents: number
  insurancePaidCents: number
  patientResponsibilityCents: number
  status: string
  statusDate: string | null
  payerName: string | null
}

// ============================================
// getPatientFinancialSummary
// ============================================

export async function getPatientFinancialSummary(
  userId: string
): Promise<ActionResult<PatientFinancialSummary>> {
  try {
    const supabase = await createClient()

    // Get patient profile
    const { data: patientProfile } = await supabase
      .from('patient_profiles')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (!patientProfile) {
      return {
        success: true,
        data: {
          totalChargedCents: 0,
          totalInsuranceReimbursedCents: 0,
          totalPendingReimbursementCents: 0,
          totalPatientPaidCents: 0,
          netOutOfPocketCents: 0,
          claimCount: 0,
          pendingClaimCount: 0,
        },
      }
    }

    // Query reimbursement_claims table
    const { data: claims, error } = await supabase
      .from('reimbursement_claims')
      .select(
        'id, status, charged_amount, allowed_amount, insurance_paid, patient_responsibility'
      )
      .eq('patient_id', patientProfile.id)

    if (error) {
      // If the table does not exist yet, return empty data
      return {
        success: true,
        data: {
          totalChargedCents: 0,
          totalInsuranceReimbursedCents: 0,
          totalPendingReimbursementCents: 0,
          totalPatientPaidCents: 0,
          netOutOfPocketCents: 0,
          claimCount: 0,
          pendingClaimCount: 0,
        },
      }
    }

    const allClaims = claims ?? []

    const paidStatuses = ['paid', 'approved', 'partially_approved']
    const pendingStatuses = ['pending', 'submitted', 'in_review', 'appealed']

    const totalChargedCents = allClaims.reduce(
      (sum, c) => sum + Number(c.charged_amount ?? 0),
      0
    )

    const totalInsuranceReimbursedCents = allClaims
      .filter((c) => paidStatuses.includes(c.status ?? ''))
      .reduce((sum, c) => sum + Number(c.insurance_paid ?? 0), 0)

    const totalPendingReimbursementCents = allClaims
      .filter((c) => pendingStatuses.includes(c.status ?? ''))
      .reduce((sum, c) => sum + Number(c.allowed_amount ?? 0), 0)

    const totalPatientPaidCents = allClaims
      .filter((c) => paidStatuses.includes(c.status ?? ''))
      .reduce((sum, c) => sum + Number(c.patient_responsibility ?? 0), 0)

    const netOutOfPocketCents = totalChargedCents - totalInsuranceReimbursedCents

    const pendingClaimCount = allClaims.filter((c) =>
      pendingStatuses.includes(c.status ?? '')
    ).length

    return {
      success: true,
      data: {
        totalChargedCents,
        totalInsuranceReimbursedCents,
        totalPendingReimbursementCents,
        totalPatientPaidCents,
        netOutOfPocketCents,
        claimCount: allClaims.length,
        pendingClaimCount,
      },
    }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred while loading financial summary.',
    }
  }
}

// ============================================
// getReimbursementHistory
// ============================================

export async function getReimbursementHistory(
  userId: string
): Promise<ActionResult<ReimbursementHistoryItem[]>> {
  try {
    const supabase = await createClient()

    // Get patient profile
    const { data: patientProfile } = await supabase
      .from('patient_profiles')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (!patientProfile) {
      return { success: true, data: [] }
    }

    const { data: claims, error } = await supabase
      .from('reimbursement_claims')
      .select(
        `
        id,
        claim_date,
        service_date,
        description,
        cpt_code,
        charged_amount,
        allowed_amount,
        insurance_paid,
        patient_responsibility,
        status,
        status_date,
        payer_name
      `
      )
      .eq('patient_id', patientProfile.id)
      .order('service_date', { ascending: false })

    if (error) {
      // If table does not exist yet, return empty
      return { success: true, data: [] }
    }

    const history: ReimbursementHistoryItem[] = (claims ?? []).map((claim) => ({
      id: claim.id ?? '',
      claimDate: claim.claim_date ?? '',
      serviceDate: claim.service_date ?? '',
      description: claim.description ?? 'Service',
      cptCode: claim.cpt_code ?? null,
      chargedAmountCents: Number(claim.charged_amount ?? 0),
      allowedAmountCents: Number(claim.allowed_amount ?? 0),
      insurancePaidCents: Number(claim.insurance_paid ?? 0),
      patientResponsibilityCents: Number(claim.patient_responsibility ?? 0),
      status: claim.status ?? 'pending',
      statusDate: claim.status_date ?? null,
      payerName: claim.payer_name ?? null,
    }))

    return { success: true, data: history }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred while loading reimbursement history.',
    }
  }
}
