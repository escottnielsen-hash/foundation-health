import { z } from 'zod'

// ============================================
// Common helpers
// ============================================

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// ============================================
// Encounter filter schema (physician side)
// ============================================

export const physicianEncounterFilterSchema = z.object({
  status: z
    .enum(['checked_in', 'in_progress', 'completed', 'cancelled'])
    .optional(),
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
  patient_search: z
    .string()
    .max(200, 'Search query must be 200 characters or fewer')
    .optional()
    .or(z.literal('')),
})

export type PhysicianEncounterFilterData = z.infer<typeof physicianEncounterFilterSchema>

// ============================================
// SOAP notes schema
// ============================================

export const soapNotesSchema = z.object({
  subjective: z
    .string()
    .max(5000, 'Subjective notes must be 5,000 characters or fewer')
    .optional()
    .or(z.literal('')),
  objective: z
    .string()
    .max(5000, 'Objective notes must be 5,000 characters or fewer')
    .optional()
    .or(z.literal('')),
  assessment: z
    .string()
    .max(5000, 'Assessment notes must be 5,000 characters or fewer')
    .optional()
    .or(z.literal('')),
  plan: z
    .string()
    .max(5000, 'Plan notes must be 5,000 characters or fewer')
    .optional()
    .or(z.literal('')),
})

export type SoapNotesFormData = z.infer<typeof soapNotesSchema>

// ============================================
// Session notes schema (for telemedicine)
// ============================================

export const sessionClinicalNotesSchema = z.object({
  clinical_notes: z
    .string()
    .max(5000, 'Clinical notes must be 5,000 characters or fewer')
    .optional()
    .or(z.literal('')),
  follow_up_instructions: z
    .string()
    .max(5000, 'Follow-up instructions must be 5,000 characters or fewer')
    .optional()
    .or(z.literal('')),
})

export type SessionClinicalNotesFormData = z.infer<typeof sessionClinicalNotesSchema>

// ============================================
// Encounter completion schema
// ============================================

export const encounterCompletionSchema = z.object({
  encounter_id: z
    .string()
    .regex(uuidRegex, 'Invalid encounter ID format'),
})

export type EncounterCompletionData = z.infer<typeof encounterCompletionSchema>

// ============================================
// Session completion schema
// ============================================

export const sessionCompletionSchema = z.object({
  session_id: z
    .string()
    .regex(uuidRegex, 'Invalid session ID format'),
})

export type SessionCompletionData = z.infer<typeof sessionCompletionSchema>

// ============================================
// Physician telemedicine filter schema
// ============================================

export const physicianSessionFilterSchema = z.object({
  status: z
    .enum(['scheduled', 'waiting_room', 'in_progress', 'completed', 'cancelled', 'no_show'])
    .optional(),
  session_type: z
    .enum(['pre_op_consult', 'post_op_followup', 'general_consult', 'second_opinion', 'urgent_care'])
    .optional(),
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

export type PhysicianSessionFilterData = z.infer<typeof physicianSessionFilterSchema>

// ============================================
// Physician profile update schema
// ============================================

export const physicianProfileUpdateSchema = z.object({
  phone: z
    .string()
    .max(30, 'Phone number must be 30 characters or fewer')
    .optional()
    .or(z.literal('')),
  bio: z
    .string()
    .max(2000, 'Bio must be 2,000 characters or fewer')
    .optional()
    .or(z.literal('')),
  languages: z
    .array(z.string().max(50))
    .optional(),
})

export type PhysicianProfileUpdateData = z.infer<typeof physicianProfileUpdateSchema>

// ============================================
// Encounter status display config
// ============================================

export const PHYSICIAN_ENCOUNTER_STATUS_OPTIONS = [
  { value: 'checked_in', label: 'Checked In' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
] as const

export const PHYSICIAN_SESSION_STATUS_OPTIONS = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'waiting_room', label: 'Waiting Room' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'no_show', label: 'No Show' },
] as const

export const PHYSICIAN_SESSION_TYPE_OPTIONS = [
  { value: 'pre_op_consult', label: 'Pre-Op Consultation' },
  { value: 'post_op_followup', label: 'Post-Op Follow-Up' },
  { value: 'general_consult', label: 'General Consultation' },
  { value: 'second_opinion', label: 'Second Opinion' },
  { value: 'urgent_care', label: 'Urgent Care' },
] as const
