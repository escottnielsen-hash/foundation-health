import { z } from 'zod'

// ============================================
// Verification status constants
// ============================================

export const VERIFICATION_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'verified', label: 'Verified' },
  { value: 'failed', label: 'Failed' },
  { value: 'expired', label: 'Expired' },
] as const

export type VerificationStatusValue = 'pending' | 'verified' | 'failed' | 'expired'

// ============================================
// Verification status display configuration
// ============================================

export const VERIFICATION_STATUS_CONFIG: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' }
> = {
  pending: { label: 'Pending', variant: 'warning' },
  verified: { label: 'Verified', variant: 'success' },
  failed: { label: 'Failed', variant: 'destructive' },
  expired: { label: 'Expired', variant: 'outline' },
}

// ============================================
// Plan type constants
// ============================================

export const PLAN_TYPES = [
  { value: 'PPO', label: 'PPO - Preferred Provider Organization' },
  { value: 'HMO', label: 'HMO - Health Maintenance Organization' },
  { value: 'EPO', label: 'EPO - Exclusive Provider Organization' },
  { value: 'POS', label: 'POS - Point of Service' },
  { value: 'HDHP', label: 'HDHP - High Deductible Health Plan' },
  { value: 'Medicare', label: 'Medicare' },
  { value: 'Medicaid', label: 'Medicaid' },
  { value: 'Tricare', label: 'Tricare' },
  { value: 'Other', label: 'Other' },
] as const

// ============================================
// Verification request schema (Zod v4)
// ============================================

export const verificationRequestSchema = z.object({
  payer_name: z
    .string()
    .min(1, 'Insurance company name is required')
    .max(200, 'Insurance company name must be less than 200 characters'),
  payer_id: z
    .string()
    .max(50, 'Payer ID must be less than 50 characters')
    .optional()
    .or(z.literal('')),
  member_id: z
    .string()
    .min(1, 'Member ID is required')
    .max(50, 'Member ID must be less than 50 characters'),
  group_number: z
    .string()
    .max(50, 'Group number must be less than 50 characters')
    .optional()
    .or(z.literal('')),
  plan_type: z
    .enum(['PPO', 'HMO', 'EPO', 'POS', 'HDHP', 'Medicare', 'Medicaid', 'Tricare', 'Other'])
    .optional()
    .or(z.literal('')),
  notes: z
    .string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional()
    .or(z.literal('')),
})

export type VerificationRequestData = z.infer<typeof verificationRequestSchema>

// ============================================
// Insurance filter schema (Zod v4)
// ============================================

export const insuranceFilterSchema = z.object({
  status: z
    .enum(['pending', 'verified', 'failed', 'expired'])
    .optional()
    .or(z.literal('')),
})

export type InsuranceFilterData = z.infer<typeof insuranceFilterSchema>

// ============================================
// Verification ID validation schema
// ============================================

export const verificationIdSchema = z.object({
  id: z
    .string()
    .uuid('Invalid verification ID format'),
})

export type VerificationIdData = z.infer<typeof verificationIdSchema>
