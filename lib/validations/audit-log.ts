import { z } from 'zod'

// ============================================
// Audit log filter schema
// ============================================

export const auditLogFilterSchema = z.object({
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
  user_id: z
    .string()
    .uuid('Invalid user ID format')
    .optional()
    .or(z.literal('')),
  action: z
    .string()
    .optional()
    .or(z.literal('')),
  table_name: z
    .string()
    .optional()
    .or(z.literal('')),
  page: z.coerce.number().int().min(1).optional().default(1),
  per_page: z.coerce.number().int().min(1).max(100).optional().default(25),
})

export type AuditLogFilterData = z.infer<typeof auditLogFilterSchema>
