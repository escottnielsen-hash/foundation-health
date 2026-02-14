import { z } from 'zod'

// ============================================
// Location type constants
// ============================================

export const LOCATION_TYPES = [
  { value: 'hub', label: 'Hub' },
  { value: 'spoke', label: 'Spoke' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'virtual', label: 'Virtual' },
] as const

export const LOCATION_TYPE_VALUES = ['hub', 'spoke', 'mobile', 'virtual'] as const

// ============================================
// Days of the week
// ============================================

export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const

// ============================================
// Common amenities
// ============================================

export const COMMON_AMENITIES = [
  'Wheelchair Accessible',
  'Free Parking',
  'Valet Parking',
  'Public Transit Nearby',
  'Wi-Fi',
  'Cafe/Coffee',
  'Pharmacy On-Site',
  'Lab On-Site',
  'Imaging On-Site',
  'Telehealth Room',
  'Private Waiting Room',
  'Pediatric Area',
  'Lactation Room',
  'Multi-Language Staff',
  'EV Charging',
] as const

// ============================================
// Operating hours entry schema
// ============================================

export const operatingHoursEntrySchema = z.object({
  day: z.string(),
  open: z.string().regex(/^\d{2}:\d{2}$/, 'Use HH:MM format').or(z.literal('')),
  close: z.string().regex(/^\d{2}:\d{2}$/, 'Use HH:MM format').or(z.literal('')),
  closed: z.boolean(),
})

export type OperatingHoursEntry = z.infer<typeof operatingHoursEntrySchema>

// ============================================
// Location form validation schema
// ============================================

export const locationFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(200, 'Name must be 200 characters or fewer'),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(200, 'Slug must be 200 characters or fewer')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase letters, numbers, and hyphens only')
    .optional()
    .or(z.literal('')),
  location_type: z.enum(LOCATION_TYPE_VALUES, {
    message: 'Please select a valid location type',
  }),
  description: z
    .string()
    .max(2000, 'Description must be 2000 characters or fewer')
    .optional()
    .or(z.literal('')),
  tagline: z
    .string()
    .max(300, 'Tagline must be 300 characters or fewer')
    .optional()
    .or(z.literal('')),
  address_line1: z
    .string()
    .max(200, 'Address must be 200 characters or fewer')
    .optional()
    .or(z.literal('')),
  address_line2: z
    .string()
    .max(200, 'Address must be 200 characters or fewer')
    .optional()
    .or(z.literal('')),
  city: z
    .string()
    .max(100, 'City must be 100 characters or fewer')
    .optional()
    .or(z.literal('')),
  state: z
    .string()
    .max(50, 'State must be 50 characters or fewer')
    .optional()
    .or(z.literal('')),
  zip_code: z
    .string()
    .max(20, 'Zip code must be 20 characters or fewer')
    .optional()
    .or(z.literal('')),
  county: z
    .string()
    .max(100, 'County must be 100 characters or fewer')
    .optional()
    .or(z.literal('')),
  country: z
    .string()
    .max(100, 'Country must be 100 characters or fewer')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .max(30, 'Phone must be 30 characters or fewer')
    .optional()
    .or(z.literal('')),
  fax: z
    .string()
    .max(30, 'Fax must be 30 characters or fewer')
    .optional()
    .or(z.literal('')),
  email: z
    .string()
    .email('Invalid email address')
    .optional()
    .or(z.literal('')),
  latitude: z
    .number()
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90')
    .optional()
    .nullable(),
  longitude: z
    .number()
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180')
    .optional()
    .nullable(),
  travel_info: z
    .string()
    .max(2000, 'Travel info must be 2000 characters or fewer')
    .optional()
    .or(z.literal('')),
  accommodation_info: z
    .string()
    .max(2000, 'Accommodation info must be 2000 characters or fewer')
    .optional()
    .or(z.literal('')),
  concierge_info: z
    .string()
    .max(2000, 'Concierge info must be 2000 characters or fewer')
    .optional()
    .or(z.literal('')),
  amenities: z.array(z.string()).optional(),
  operating_hours: z.array(operatingHoursEntrySchema).optional(),
  is_active: z.boolean(),
  is_critical_access: z.boolean().optional(),
  npi: z
    .string()
    .max(20, 'NPI must be 20 characters or fewer')
    .optional()
    .or(z.literal('')),
  timezone: z
    .string()
    .max(50, 'Timezone must be 50 characters or fewer')
    .optional()
    .or(z.literal('')),
})

export type LocationFormData = z.infer<typeof locationFormSchema>

// ============================================
// Slug generation utility
// ============================================

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// ============================================
// Default operating hours
// ============================================

export function getDefaultOperatingHours(): OperatingHoursEntry[] {
  return DAYS_OF_WEEK.map((day) => ({
    day,
    open: day === 'Saturday' || day === 'Sunday' ? '' : '08:00',
    close: day === 'Saturday' || day === 'Sunday' ? '' : '17:00',
    closed: day === 'Saturday' || day === 'Sunday',
  }))
}
