import { z } from 'zod'

// ============================================
// Schedule filter validation schema (Zod v4)
// ============================================

export const scheduleFilterSchema = z.object({
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
  appointment_type: z
    .string()
    .optional()
    .or(z.literal('')),
  location_id: z
    .string()
    .optional()
    .or(z.literal('')),
})

export type ScheduleFilterData = z.infer<typeof scheduleFilterSchema>

// ============================================
// Patient search validation schema
// ============================================

export const patientSearchSchema = z.object({
  search_query: z
    .string()
    .max(200, 'Search query must be 200 characters or fewer')
    .optional()
    .or(z.literal('')),
  sort_by: z
    .string()
    .optional()
    .or(z.literal('')),
  date_from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .optional()
    .or(z.literal('')),
})

export type PatientSearchData = z.infer<typeof patientSearchSchema>

// ============================================
// Appointment type constants
// ============================================

export const APPOINTMENT_TYPES = [
  { value: 'consultation', label: 'Consultation' },
  { value: 'follow_up', label: 'Follow-Up' },
  { value: 'procedure', label: 'Procedure' },
  { value: 'telehealth', label: 'Telehealth' },
  { value: 'urgent_care', label: 'Urgent Care' },
  { value: 'preventive', label: 'Preventive' },
  { value: 'other', label: 'Other' },
] as const

// ============================================
// Patient sort options
// ============================================

export const PATIENT_SORT_OPTIONS = [
  { value: 'last_visit_desc', label: 'Last Visit (Newest)' },
  { value: 'last_visit_asc', label: 'Last Visit (Oldest)' },
  { value: 'name_asc', label: 'Name (A-Z)' },
  { value: 'name_desc', label: 'Name (Z-A)' },
] as const
