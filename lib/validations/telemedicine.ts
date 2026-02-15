import { z } from 'zod'

// ============================================
// Telemedicine enum values
// ============================================

export const sessionTypes = [
  'pre_op_consult',
  'post_op_followup',
  'general_consult',
  'second_opinion',
  'urgent_care',
] as const

export type SessionTypeValue = (typeof sessionTypes)[number]

export const sessionTypeLabels: Record<SessionTypeValue, string> = {
  pre_op_consult: 'Pre-Operative Consultation',
  post_op_followup: 'Post-Operative Follow-Up',
  general_consult: 'General Consultation',
  second_opinion: 'Second Opinion',
  urgent_care: 'Urgent Care',
}

export const sessionStatuses = [
  'scheduled',
  'waiting_room',
  'in_progress',
  'completed',
  'cancelled',
  'no_show',
] as const

export type SessionStatusValue = (typeof sessionStatuses)[number]

export const sessionStatusLabels: Record<SessionStatusValue, string> = {
  scheduled: 'Scheduled',
  waiting_room: 'Waiting Room',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No Show',
}

export const messageTypes = [
  'text',
  'image',
  'file',
  'system',
] as const

// ============================================
// Common helpers
// ============================================

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// ============================================
// Session request schema (patient requesting a new session)
// ============================================

export const sessionRequestSchema = z.object({
  session_type: z.enum(sessionTypes, {
    message: 'Please select a session type',
  }),
  physician_id: z
    .string()
    .regex(uuidRegex, 'Invalid physician selection'),
  scheduled_start: z
    .string()
    .min(1, 'Scheduled start time is required')
    .refine(
      (val) => !isNaN(Date.parse(val)),
      'Please provide a valid date and time'
    ),
  scheduled_duration_minutes: z
    .number()
    .int('Duration must be a whole number')
    .min(15, 'Minimum session duration is 15 minutes')
    .max(120, 'Maximum session duration is 120 minutes')
    .default(30),
  chief_complaint: z
    .string()
    .max(2000, 'Chief complaint must be 2,000 characters or fewer')
    .optional()
    .or(z.literal('')),
  patient_state: z
    .string()
    .max(100, 'State must be 100 characters or fewer')
    .optional()
    .or(z.literal('')),
  appointment_id: z
    .string()
    .regex(uuidRegex, 'Invalid appointment ID')
    .optional()
    .or(z.literal('')),
})

export type SessionRequestFormData = z.infer<typeof sessionRequestSchema>

// ============================================
// Session status update schema (staff/physician)
// ============================================

export const sessionStatusUpdateSchema = z.object({
  session_id: z
    .string()
    .regex(uuidRegex, 'Invalid session ID'),
  status: z.enum(sessionStatuses, {
    message: 'Please select a valid status',
  }),
  clinical_notes: z
    .string()
    .max(5000, 'Clinical notes must be 5,000 characters or fewer')
    .optional()
    .or(z.literal('')),
  follow_up_instructions: z
    .string()
    .max(3000, 'Follow-up instructions must be 3,000 characters or fewer')
    .optional()
    .or(z.literal('')),
})

export type SessionStatusUpdateFormData = z.infer<typeof sessionStatusUpdateSchema>

// ============================================
// Send message schema
// ============================================

export const sendMessageSchema = z.object({
  session_id: z
    .string()
    .regex(uuidRegex, 'Invalid session ID'),
  content: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(5000, 'Message must be 5,000 characters or fewer'),
  message_type: z.enum(messageTypes).default('text'),
})

export type SendMessageFormData = z.infer<typeof sendMessageSchema>

// ============================================
// Session filters schema
// ============================================

export const sessionFiltersSchema = z.object({
  status: z.enum(sessionStatuses).optional(),
  session_type: z.enum(sessionTypes).optional(),
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

export type SessionFiltersData = z.infer<typeof sessionFiltersSchema>
