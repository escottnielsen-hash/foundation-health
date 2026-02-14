import { z } from 'zod'

// ============================================
// Superbill status constants
// ============================================

export const SUPERBILL_STATUSES = [
  { value: 'generated', label: 'Generated' },
  { value: 'submitted_to_insurance', label: 'Submitted to Insurance' },
  { value: 'reimbursed', label: 'Reimbursed' },
  { value: 'denied', label: 'Denied' },
  { value: 'pending_review', label: 'Pending Review' },
] as const

export type SuperbillStatusValue =
  | 'generated'
  | 'submitted_to_insurance'
  | 'reimbursed'
  | 'denied'
  | 'pending_review'

// ============================================
// Superbill status display configuration
// ============================================

export const SUPERBILL_STATUS_CONFIG: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' }
> = {
  generated: { label: 'Generated', variant: 'default' },
  submitted_to_insurance: { label: 'Submitted', variant: 'warning' },
  reimbursed: { label: 'Reimbursed', variant: 'success' },
  denied: { label: 'Denied', variant: 'destructive' },
  pending_review: { label: 'Pending Review', variant: 'outline' },
}

// ============================================
// Place of service codes
// ============================================

export const PLACE_OF_SERVICE_CODES: Record<string, string> = {
  '02': 'Telehealth',
  '11': 'Office',
  '21': 'Inpatient Hospital',
  '22': 'Outpatient Hospital',
}

// ============================================
// Superbill filter validation schema (Zod v4)
// ============================================

export const superbillFilterSchema = z.object({
  status: z
    .enum(['generated', 'submitted_to_insurance', 'reimbursed', 'denied', 'pending_review'])
    .optional()
    .or(z.literal('')),
})

export type SuperbillFilterData = z.infer<typeof superbillFilterSchema>

// ============================================
// Superbill ID validation schema
// ============================================

export const superbillIdSchema = z.object({
  id: z
    .string()
    .uuid('Invalid superbill ID format'),
})

export type SuperbillIdData = z.infer<typeof superbillIdSchema>
