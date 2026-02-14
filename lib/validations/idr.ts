import { z } from 'zod'
import type { AppealStatus, AppealType, IdrCaseStatus, ClaimStatus } from '@/types/database'

// ============================================
// Appeal type constants
// ============================================

export const APPEAL_TYPES: { value: AppealType; label: string }[] = [
  { value: 'internal_first', label: '1st Level Internal' },
  { value: 'internal_second', label: '2nd Level Internal' },
  { value: 'external', label: 'External Review' },
  { value: 'state_review', label: 'State Review' },
]

// ============================================
// Appeal status display config
// ============================================

export const APPEAL_STATUS_CONFIG: Record<
  AppealStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' }
> = {
  draft: { label: 'Draft', variant: 'outline' },
  submitted: { label: 'Submitted', variant: 'default' },
  in_review: { label: 'In Review', variant: 'warning' },
  upheld: { label: 'Upheld (Denied)', variant: 'destructive' },
  overturned: { label: 'Overturned (Won)', variant: 'success' },
  partially_overturned: { label: 'Partially Overturned', variant: 'warning' },
  withdrawn: { label: 'Withdrawn', variant: 'outline' },
}

// ============================================
// IDR status display config
// ============================================

export const IDR_STATUS_CONFIG: Record<
  IdrCaseStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' }
> = {
  initiated: { label: 'Initiated', variant: 'outline' },
  entity_selected: { label: 'Entity Selected', variant: 'default' },
  offer_submitted: { label: 'Offer Submitted', variant: 'default' },
  counter_submitted: { label: 'Counter Submitted', variant: 'warning' },
  under_review: { label: 'Under Review', variant: 'warning' },
  decided_provider: { label: 'Decided - Provider Won', variant: 'success' },
  decided_payer: { label: 'Decided - Payer Won', variant: 'destructive' },
  settled: { label: 'Settled', variant: 'success' },
  withdrawn: { label: 'Withdrawn', variant: 'outline' },
  administratively_closed: { label: 'Admin. Closed', variant: 'outline' },
}

// ============================================
// Claims status display config
// ============================================

export const CLAIM_STATUS_CONFIG: Record<
  ClaimStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' }
> = {
  draft: { label: 'Draft', variant: 'outline' },
  submitted: { label: 'Submitted', variant: 'default' },
  acknowledged: { label: 'Acknowledged', variant: 'default' },
  in_review: { label: 'In Review', variant: 'warning' },
  pending: { label: 'Pending', variant: 'warning' },
  denied: { label: 'Denied', variant: 'destructive' },
  partially_paid: { label: 'Partially Paid', variant: 'warning' },
  paid: { label: 'Paid', variant: 'success' },
  appealed: { label: 'Appealed', variant: 'secondary' },
  idr_initiated: { label: 'IDR Initiated', variant: 'default' },
  idr_resolved: { label: 'IDR Resolved', variant: 'success' },
  closed: { label: 'Closed', variant: 'outline' },
}

// ============================================
// IDR filter validation schema
// ============================================

export const idrFilterSchema = z.object({
  status: z
    .enum([
      'initiated',
      'entity_selected',
      'offer_submitted',
      'counter_submitted',
      'under_review',
      'decided_provider',
      'decided_payer',
      'settled',
      'withdrawn',
      'administratively_closed',
    ])
    .optional()
    .or(z.literal('')),
  date_from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional()
    .or(z.literal('')),
  date_to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional()
    .or(z.literal('')),
})

export type IdrFilterData = z.infer<typeof idrFilterSchema>

// ============================================
// Claims filter validation schema
// ============================================

export const claimsFilterSchema = z.object({
  status: z
    .enum([
      'draft',
      'submitted',
      'acknowledged',
      'pending',
      'denied',
      'partially_paid',
      'paid',
      'appealed',
    ])
    .optional()
    .or(z.literal('')),
  date_from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional()
    .or(z.literal('')),
  date_to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional()
    .or(z.literal('')),
  search: z.string().optional().or(z.literal('')),
})

export type ClaimsFilterData = z.infer<typeof claimsFilterSchema>

// ============================================
// Appeal filter validation schema
// ============================================

export const appealFilterSchema = z.object({
  appeal_type: z
    .enum(['internal_first', 'internal_second', 'external', 'state_review'])
    .optional()
    .or(z.literal('')),
  status: z
    .enum(['draft', 'submitted', 'in_review', 'upheld', 'overturned', 'partially_overturned', 'withdrawn'])
    .optional()
    .or(z.literal('')),
})

export type AppealFilterData = z.infer<typeof appealFilterSchema>

// ============================================
// IDR Case ID validation
// ============================================

export const idrCaseIdSchema = z.object({
  id: z.string().uuid('Invalid IDR case ID format'),
})

export type IdrCaseIdData = z.infer<typeof idrCaseIdSchema>
