import { z } from 'zod'
import type { InvoiceStatus } from '@/types/database'

// ============================================
// Invoice status constants
// ============================================

export const INVOICE_STATUSES: { value: InvoiceStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'paid', label: 'Paid' },
  { value: 'partially_paid', label: 'Partially Paid' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'void', label: 'Cancelled' },
  { value: 'refunded', label: 'Refunded' },
]

// ============================================
// Invoice status display config
// ============================================

export const INVOICE_STATUS_CONFIG: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' }
> = {
  draft: { label: 'Draft', variant: 'outline' },
  sent: { label: 'Sent', variant: 'default' },
  paid: { label: 'Paid', variant: 'success' },
  partially_paid: { label: 'Partially Paid', variant: 'warning' },
  overdue: { label: 'Overdue', variant: 'destructive' },
  void: { label: 'Cancelled', variant: 'outline' },
  refunded: { label: 'Refunded', variant: 'outline' },
}

// ============================================
// Invoice filter validation schema
// ============================================

export const invoiceFilterSchema = z.object({
  status: z
    .enum(['draft', 'sent', 'paid', 'partially_paid', 'overdue', 'void', 'refunded'])
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

export type InvoiceFilterData = z.infer<typeof invoiceFilterSchema>

// ============================================
// Invoice ID validation schema
// ============================================

export const invoiceIdSchema = z.object({
  id: z
    .string()
    .uuid('Invalid invoice ID format'),
})

export type InvoiceIdData = z.infer<typeof invoiceIdSchema>

// ============================================
// Line item type (JSONB shape from the database)
// ============================================

export interface InvoiceLineItem {
  service_id?: string | null
  name: string
  cpt_code?: string | null
  description?: string | null
  qty: number
  unit_price: number
  discount?: number
  total: number
}
