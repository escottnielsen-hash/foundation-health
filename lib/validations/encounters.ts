import { z } from 'zod'

// ============================================
// Encounter type constants
// ============================================

export const ENCOUNTER_TYPES = [
  { value: 'office_visit', label: 'Office Visit' },
  { value: 'telehealth', label: 'Telehealth' },
  { value: 'surgical', label: 'Surgical' },
  { value: 'follow_up', label: 'Follow-Up' },
  { value: 'consultation', label: 'Consultation' },
  { value: 'emergency', label: 'Emergency' },
] as const

export type EncounterType =
  | 'office_visit'
  | 'telehealth'
  | 'surgical'
  | 'follow_up'
  | 'consultation'
  | 'emergency'

// ============================================
// Encounter filter validation schema (Zod v4)
// ============================================

export const encounterFilterSchema = z.object({
  encounter_type: z
    .enum(['office_visit', 'telehealth', 'surgical', 'follow_up', 'consultation', 'emergency'])
    .optional()
    .or(z.literal('')),
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

export type EncounterFilterData = z.infer<typeof encounterFilterSchema>

// ============================================
// Encounter ID validation schema
// ============================================

export const encounterIdSchema = z.object({
  id: z
    .string()
    .uuid('Invalid encounter ID format'),
})

export type EncounterIdData = z.infer<typeof encounterIdSchema>

// ============================================
// Encounter status display helpers
// ============================================

export const ENCOUNTER_STATUS_CONFIG: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' }
> = {
  checked_in: { label: 'Checked In', variant: 'secondary' },
  in_progress: { label: 'In Progress', variant: 'default' },
  completed: { label: 'Completed', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
}

// ============================================
// Vital signs type definition
// ============================================

export interface VitalSigns {
  blood_pressure_systolic?: number | null
  blood_pressure_diastolic?: number | null
  heart_rate?: number | null
  respiratory_rate?: number | null
  temperature?: number | null
  temperature_unit?: 'F' | 'C' | null
  oxygen_saturation?: number | null
  weight_lbs?: number | null
  height_inches?: number | null
  bmi?: number | null
  pain_level?: number | null
}
