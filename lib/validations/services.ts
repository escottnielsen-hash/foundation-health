import { z } from 'zod'

// ============================================
// Service filter validation schema
// ============================================

export const serviceFilterSchema = z.object({
  category: z
    .string()
    .optional()
    .or(z.literal('')),
  search: z
    .string()
    .max(200, 'Search query must be 200 characters or fewer')
    .optional()
    .or(z.literal('')),
  sort_by: z
    .enum(['price_asc', 'price_desc', 'name_asc', 'name_desc'])
    .optional()
    .or(z.literal('')),
})

export type ServiceFilterData = z.infer<typeof serviceFilterSchema>

// ============================================
// Service ID validation schema
// ============================================

export const serviceIdSchema = z.object({
  id: z.string().uuid('Invalid service ID'),
})

export type ServiceIdData = z.infer<typeof serviceIdSchema>

// ============================================
// Service category constants
// ============================================

export const SERVICE_CATEGORIES = [
  { value: 'primary_care', label: 'Primary Care' },
  { value: 'consultation', label: 'Consultation' },
  { value: 'surgical', label: 'Surgical' },
  { value: 'diagnostic', label: 'Diagnostic' },
  { value: 'imaging', label: 'Imaging' },
  { value: 'lab', label: 'Laboratory' },
  { value: 'procedure', label: 'Procedure' },
  { value: 'telehealth', label: 'Telehealth' },
  { value: 'wellness', label: 'Wellness' },
  { value: 'rehabilitation', label: 'Rehabilitation' },
] as const

// ============================================
// Sort option constants
// ============================================

export const SERVICE_SORT_OPTIONS = [
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'name_asc', label: 'Name: A to Z' },
  { value: 'name_desc', label: 'Name: Z to A' },
] as const

// ============================================
// Helper to get category display label
// ============================================

export function getCategoryLabel(category: string): string {
  const found = SERVICE_CATEGORIES.find((c) => c.value === category)
  return found
    ? found.label
    : category
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase())
}
