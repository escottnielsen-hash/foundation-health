import { z } from 'zod'

// ============================================
// Location filter validation schema
// ============================================

export const locationFilterSchema = z.object({
  state: z
    .string()
    .max(2, 'State code must be 2 characters or fewer')
    .optional()
    .or(z.literal('')),
  type: z
    .enum(['hub', 'spoke', 'mobile', 'virtual'])
    .optional()
    .or(z.literal('')),
  search: z
    .string()
    .max(200, 'Search query must be 200 characters or fewer')
    .optional()
    .or(z.literal('')),
})

export type LocationFilterData = z.infer<typeof locationFilterSchema>

// ============================================
// Location ID validation schema
// ============================================

export const locationIdSchema = z.object({
  id: z.string().uuid('Invalid location ID'),
})

export type LocationIdData = z.infer<typeof locationIdSchema>

// ============================================
// Location slug validation schema
// ============================================

export const locationSlugSchema = z.object({
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(100, 'Slug must be 100 characters or fewer')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
})

export type LocationSlugData = z.infer<typeof locationSlugSchema>

// ============================================
// State constants
// ============================================

export const LOCATION_STATES = [
  { value: 'UT', label: 'Utah' },
  { value: 'WA', label: 'Washington' },
] as const

// ============================================
// Location type constants
// ============================================

export const LOCATION_TYPES = [
  { value: 'hub', label: 'Hub' },
  { value: 'spoke', label: 'Spoke' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'virtual', label: 'Virtual' },
] as const

// ============================================
// Helper to get location type display label
// ============================================

export function getLocationTypeLabel(type: string): string {
  const found = LOCATION_TYPES.find((t) => t.value === type)
  return found ? found.label : type.charAt(0).toUpperCase() + type.slice(1)
}

// ============================================
// Helper to get state display label
// ============================================

export function getStateLabel(code: string): string {
  const found = LOCATION_STATES.find((s) => s.value === code)
  return found ? found.label : code
}
