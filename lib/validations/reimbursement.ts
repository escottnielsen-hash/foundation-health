import { z } from 'zod'

// ============================================
// Reimbursement calculator input schemas
// ============================================

/**
 * Schema for a single selected procedure in the calculator
 */
export const selectedProcedureSchema = z.object({
  cptCode: z.string().min(1, 'CPT code is required'),
  description: z.string().min(1, 'Description is required'),
  chargeAmountCents: z.number().int().min(0, 'Charge amount must be positive'),
  qpaAmountCents: z.number().int().min(0, 'QPA amount must be positive'),
})

export type SelectedProcedureData = z.infer<typeof selectedProcedureSchema>

/**
 * Schema for OON insurance benefit details
 */
export const insuranceDetailsSchema = z.object({
  oonDeductible: z
    .number()
    .int()
    .min(0, 'Deductible must be zero or positive')
    .max(100_000_00, 'Deductible seems too high'),
  oonDeductibleMet: z
    .number()
    .int()
    .min(0, 'Deductible met must be zero or positive'),
  oonCoinsurancePct: z
    .number()
    .min(0, 'Coinsurance must be between 0% and 100%')
    .max(100, 'Coinsurance must be between 0% and 100%'),
  oonOutOfPocketMax: z
    .number()
    .int()
    .min(0, 'Out-of-pocket max must be zero or positive')
    .max(500_000_00, 'Out-of-pocket max seems too high'),
  oonOutOfPocketMet: z
    .number()
    .int()
    .min(0, 'Out-of-pocket met must be zero or positive'),
})

export type InsuranceDetailsData = z.infer<typeof insuranceDetailsSchema>

/**
 * Full calculator input schema — combines procedures + insurance details
 */
export const calculatorInputSchema = z
  .object({
    procedures: z
      .array(selectedProcedureSchema)
      .min(1, 'Select at least one procedure'),
    insurance: insuranceDetailsSchema,
  })
  .refine(
    (data) => data.insurance.oonDeductibleMet <= data.insurance.oonDeductible,
    {
      message: 'Deductible met cannot exceed total deductible',
      path: ['insurance', 'oonDeductibleMet'],
    }
  )
  .refine(
    (data) =>
      data.insurance.oonOutOfPocketMet <= data.insurance.oonOutOfPocketMax,
    {
      message: 'Out-of-pocket met cannot exceed out-of-pocket max',
      path: ['insurance', 'oonOutOfPocketMet'],
    }
  )

export type CalculatorInputData = z.infer<typeof calculatorInputSchema>

// ============================================
// Calculator result types
// ============================================

export interface EstimateLineItem {
  cptCode: string
  description: string
  foundationChargeCents: number
  qpaAmountCents: number
  estimatedAllowedCents: number
}

export interface ReimbursementEstimate {
  lineItems: EstimateLineItem[]
  totalChargesCents: number
  totalQpaCents: number
  totalEstimatedAllowedCents: number
  deductibleRemainingCents: number
  deductibleAppliedCents: number
  coinsuranceAmountCents: number
  estimatedInsurancePaymentCents: number
  estimatedPatientResponsibilityCents: number
  oopMaxProtectionCents: number
}

// ============================================
// Financial summary filter schema
// ============================================

export const financialSummaryFilterSchema = z.object({
  year: z
    .number()
    .int()
    .min(2020, 'Year must be 2020 or later')
    .max(2030, 'Year must be 2030 or earlier')
    .optional(),
})

export type FinancialSummaryFilterData = z.infer<typeof financialSummaryFilterSchema>

// ============================================
// Reimbursement status constants
// ============================================

export const REIMBURSEMENT_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'submitted', label: 'Submitted to Insurer' },
  { value: 'in_review', label: 'In Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'partially_approved', label: 'Partially Approved' },
  { value: 'denied', label: 'Denied' },
  { value: 'paid', label: 'Payment Received' },
  { value: 'appealed', label: 'Under Appeal' },
] as const

export type ReimbursementStatusValue = (typeof REIMBURSEMENT_STATUSES)[number]['value']

export const REIMBURSEMENT_STATUS_CONFIG: Record<
  string,
  {
    label: string
    variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'
  }
> = {
  pending: { label: 'Pending', variant: 'outline' },
  submitted: { label: 'Submitted', variant: 'default' },
  in_review: { label: 'In Review', variant: 'warning' },
  approved: { label: 'Approved', variant: 'success' },
  partially_approved: { label: 'Partially Approved', variant: 'warning' },
  denied: { label: 'Denied', variant: 'destructive' },
  paid: { label: 'Paid', variant: 'success' },
  appealed: { label: 'Under Appeal', variant: 'secondary' },
}
