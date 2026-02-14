import { z } from 'zod'

// ============================================
// Concierge request types
// ============================================

export const conciergeRequestTypes = [
  'accommodation_booking',
  'transportation_arrangement',
  'restaurant_reservation',
  'activity_planning',
  'medical_records_transfer',
  'special_dietary_needs',
  'accessibility_requirements',
] as const

export type ConciergeRequestType = (typeof conciergeRequestTypes)[number]

export const conciergeRequestTypeLabels: Record<ConciergeRequestType, string> = {
  accommodation_booking: 'Accommodation Booking',
  transportation_arrangement: 'Transportation Arrangement',
  restaurant_reservation: 'Restaurant Reservation',
  activity_planning: 'Activity Planning',
  medical_records_transfer: 'Medical Records Transfer',
  special_dietary_needs: 'Special Dietary Needs',
  accessibility_requirements: 'Accessibility Requirements',
}

// ============================================
// Concierge location options
// ============================================

export const conciergeLocations = [
  'moab',
  'park-city',
  'powder-mountain',
  'camas',
] as const

export type ConciergeLocation = (typeof conciergeLocations)[number]

export const conciergeLocationLabels: Record<ConciergeLocation, string> = {
  moab: 'Moab, Utah',
  'park-city': 'Park City, Utah',
  'powder-mountain': 'Powder Mountain, Utah',
  camas: 'Camas, Washington',
}

// ============================================
// Validation schema (Zod v4)
// ============================================

export const conciergeRequestSchema = z.object({
  request_type: z.enum(conciergeRequestTypes, {
    message: 'Please select a request type',
  }),
  location: z.enum(conciergeLocations, {
    message: 'Please select a location',
  }),
  details: z
    .string()
    .min(10, 'Please provide at least 10 characters describing your request')
    .max(2000, 'Details must be 2,000 characters or fewer'),
  preferred_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional()
    .or(z.literal('')),
  special_requirements: z
    .string()
    .max(1000, 'Special requirements must be 1,000 characters or fewer')
    .optional()
    .or(z.literal('')),
})

export type ConciergeRequestFormData = z.infer<typeof conciergeRequestSchema>
