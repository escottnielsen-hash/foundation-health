import { z } from 'zod'

// ============================================
// Claim status constants
// ============================================

export const CLAIM_STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'acknowledged', label: 'Acknowledged' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_review', label: 'In Review' },
  { value: 'partially_paid', label: 'Partially Paid' },
  { value: 'paid', label: 'Paid' },
  { value: 'denied', label: 'Denied' },
  { value: 'appealed', label: 'Appealed' },
  { value: 'idr_initiated', label: 'IDR Initiated' },
  { value: 'idr_resolved', label: 'IDR Resolved' },
  { value: 'closed', label: 'Closed' },
] as const

export const CLAIM_STATUS_VALUES = CLAIM_STATUSES.map((s) => s.value)

// ============================================
// Claim activity type constants
// ============================================

export const CLAIM_ACTIVITY_TYPES = [
  { value: 'submitted', label: 'Claim Submitted' },
  { value: 'acknowledged', label: 'Claim Acknowledged' },
  { value: 'info_requested', label: 'Information Requested' },
  { value: 'denied', label: 'Claim Denied' },
  { value: 'partially_paid', label: 'Partially Paid' },
  { value: 'paid', label: 'Paid in Full' },
  { value: 'appeal_filed', label: 'Appeal Filed' },
  { value: 'idr_initiated', label: 'IDR Initiated' },
  { value: 'idr_resolved', label: 'IDR Resolved' },
  { value: 'note_added', label: 'Note Added' },
  { value: 'eob_received', label: 'EOB Received' },
] as const

// ============================================
// Claim filter schema (Zod v4)
// ============================================

export const claimFilterSchema = z.object({
  status: z
    .enum([
      'draft', 'submitted', 'acknowledged', 'pending', 'in_review',
      'partially_paid', 'paid', 'denied', 'appealed',
      'idr_initiated', 'idr_resolved', 'closed',
    ])
    .optional()
    .or(z.literal('')),
  payer: z
    .string()
    .max(200, 'Payer name is too long')
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
  sort_by: z
    .enum(['service_date', 'billed_amount', 'status', 'created_at'])
    .optional()
    .or(z.literal('')),
  sort_order: z
    .enum(['asc', 'desc'])
    .optional()
    .or(z.literal('')),
})

export type ClaimFilterData = z.infer<typeof claimFilterSchema>

// ============================================
// Claim note schema (Zod v4)
// ============================================

export const claimNoteSchema = z.object({
  claim_id: z
    .string()
    .uuid('Invalid claim ID format'),
  note: z
    .string()
    .min(1, 'Note cannot be empty')
    .max(2000, 'Note cannot exceed 2000 characters'),
})

export type ClaimNoteData = z.infer<typeof claimNoteSchema>

// ============================================
// Claim ID schema
// ============================================

export const claimIdSchema = z.object({
  id: z
    .string()
    .uuid('Invalid claim ID format'),
})

export type ClaimIdData = z.infer<typeof claimIdSchema>

// ============================================
// Claim status display configuration
// ============================================

export const CLAIM_STATUS_CONFIG: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' }
> = {
  draft: { label: 'Draft', variant: 'outline' },
  submitted: { label: 'Submitted', variant: 'default' },
  acknowledged: { label: 'Acknowledged', variant: 'secondary' },
  pending: { label: 'Pending', variant: 'warning' },
  in_review: { label: 'In Review', variant: 'warning' },
  partially_paid: { label: 'Partially Paid', variant: 'warning' },
  paid: { label: 'Paid', variant: 'success' },
  denied: { label: 'Denied', variant: 'destructive' },
  appealed: { label: 'Appealed', variant: 'secondary' },
  idr_initiated: { label: 'IDR Initiated', variant: 'default' },
  idr_resolved: { label: 'IDR Resolved', variant: 'success' },
  closed: { label: 'Closed', variant: 'outline' },
}

// ============================================
// Activity type display configuration
// ============================================

export const CLAIM_ACTIVITY_CONFIG: Record<
  string,
  { label: string; iconColor: string }
> = {
  submitted: { label: 'Claim Submitted', iconColor: 'text-blue-500' },
  acknowledged: { label: 'Claim Acknowledged', iconColor: 'text-blue-400' },
  info_requested: { label: 'Information Requested', iconColor: 'text-amber-500' },
  denied: { label: 'Claim Denied', iconColor: 'text-red-500' },
  partially_paid: { label: 'Partial Payment', iconColor: 'text-amber-500' },
  paid: { label: 'Paid in Full', iconColor: 'text-emerald-500' },
  appeal_filed: { label: 'Appeal Filed', iconColor: 'text-purple-500' },
  idr_initiated: { label: 'IDR Initiated', iconColor: 'text-indigo-500' },
  idr_resolved: { label: 'IDR Resolved', iconColor: 'text-emerald-500' },
  note_added: { label: 'Note Added', iconColor: 'text-gray-500' },
  eob_received: { label: 'EOB Received', iconColor: 'text-blue-500' },
}
