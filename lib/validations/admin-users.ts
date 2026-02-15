import { z } from 'zod'

// ============================================
// User search filter schema
// ============================================

export const userSearchFilterSchema = z.object({
  search: z
    .string()
    .max(200, 'Search query must be 200 characters or fewer')
    .optional()
    .or(z.literal('')),
  role: z
    .string()
    .optional()
    .or(z.literal('')),
  page: z.coerce.number().int().min(1).optional().default(1),
  per_page: z.coerce.number().int().min(1).max(100).optional().default(20),
})

export type UserSearchFilterData = z.infer<typeof userSearchFilterSchema>

// ============================================
// User ID validation
// ============================================

export const userIdSchema = z.object({
  id: z
    .string()
    .uuid('Invalid user ID format'),
})

export type UserIdData = z.infer<typeof userIdSchema>
