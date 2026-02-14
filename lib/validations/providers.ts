import { z } from 'zod'

// ============================================
// Provider filter validation schema
// ============================================

export const providerFilterSchema = z.object({
  specialty: z
    .string()
    .optional()
    .or(z.literal('')),
  location_id: z
    .string()
    .uuid('Invalid location ID')
    .optional()
    .or(z.literal('')),
  search: z
    .string()
    .max(200, 'Search query must be 200 characters or fewer')
    .optional()
    .or(z.literal('')),
})

export type ProviderFilterData = z.infer<typeof providerFilterSchema>

// ============================================
// Provider ID validation schema
// ============================================

export const providerIdSchema = z.object({
  id: z.string().uuid('Invalid provider ID'),
})

export type ProviderIdData = z.infer<typeof providerIdSchema>

// ============================================
// Provider specialty constants
// ============================================

export const PROVIDER_SPECIALTIES = [
  { value: 'Orthopedic Surgery', label: 'Orthopedic Surgery' },
  { value: 'Sports Medicine', label: 'Sports Medicine' },
  { value: 'Joint Replacement', label: 'Joint Replacement' },
  { value: 'Spine Surgery', label: 'Spine Surgery' },
  { value: 'Pain Management', label: 'Pain Management' },
  { value: 'Physical Medicine & Rehabilitation', label: 'Physical Medicine & Rehabilitation' },
] as const
