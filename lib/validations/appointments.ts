import { z } from 'zod'

// ============================================
// Booking validation schema (Zod v4)
// ============================================

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const bookingSchema = z.object({
  service_id: z
    .string()
    .regex(uuidRegex, 'Invalid service selection'),
  provider_id: z
    .string()
    .regex(uuidRegex, 'Invalid provider selection'),
  appointment_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  appointment_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Time must be in HH:mm format'),
  notes: z
    .string()
    .max(1000, 'Notes must be 1000 characters or fewer')
    .optional()
    .or(z.literal('')),
})

export type BookingFormData = z.infer<typeof bookingSchema>

// ============================================
// Cancel validation schema
// ============================================

export const cancelSchema = z.object({
  appointment_id: z
    .string()
    .regex(uuidRegex, 'Invalid appointment ID'),
})

export type CancelFormData = z.infer<typeof cancelSchema>
