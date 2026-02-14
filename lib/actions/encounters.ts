'use server'

import { createClient } from '@/lib/supabase/server'
import { encounterFilterSchema, encounterIdSchema } from '@/lib/validations/encounters'
import type { Encounter, Appointment, Location } from '@/types/database'
import type { VitalSigns, EncounterType } from '@/lib/validations/encounters'
import { ZodError } from 'zod'

// ============================================
// Result types for server actions
// ============================================

interface ActionSuccess<T> {
  success: true
  data: T
}

interface ActionError {
  success: false
  error: string
  fieldErrors?: Record<string, string>
}

type ActionResult<T> = ActionSuccess<T> | ActionError

// ============================================
// Extended encounter types with joined data
// ============================================

export interface EncounterWithProvider extends Encounter {
  encounter_type: EncounterType | null
  subjective: string | null
  objective: string | null
  assessment: string | null
  provider_name: string | null
  provider_specialty: string | null
}

export interface EncounterDetail extends EncounterWithProvider {
  appointment: Pick<Appointment, 'id' | 'appointment_type' | 'scheduled_start' | 'scheduled_end' | 'title'> | null
  location_detail: Pick<Location, 'id' | 'name' | 'city' | 'state' | 'location_type'> | null
}

// ============================================
// Encounter filter types
// ============================================

interface EncounterFilters {
  encounter_type?: string
  date_from?: string
  date_to?: string
}

// ============================================
// getPatientEncounters
// ============================================

export async function getPatientEncounters(
  userId: string,
  filters?: EncounterFilters
): Promise<ActionResult<EncounterWithProvider[]>> {
  try {
    // Validate filters if provided
    if (filters) {
      const filterResult = encounterFilterSchema.safeParse(filters)
      if (!filterResult.success) {
        const fieldErrors: Record<string, string> = {}
        for (const issue of (filterResult.error as ZodError).issues) {
          const fieldName = issue.path.join('.')
          if (fieldName && !fieldErrors[fieldName]) {
            fieldErrors[fieldName] = issue.message
          }
        }
        return {
          success: false,
          error: 'Invalid filter parameters.',
          fieldErrors,
        }
      }
    }

    const supabase = await createClient()

    // First get the patient_profile id for this user
    const { data: patientProfile } = await supabase
      .from('patient_profiles')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (!patientProfile) {
      // No patient profile yet — return empty array (not an error)
      return { success: true, data: [] }
    }

    // Build query with provider join
    let query = supabase
      .from('encounters')
      .select(`
        *,
        physician:physician_profiles!encounters_physician_id_fkey(
          user_id,
          specialty,
          profiles:profiles!physician_profiles_user_id_fkey(
            first_name,
            last_name
          )
        )
      `)
      .eq('patient_id', patientProfile.id)
      .order('check_in_time', { ascending: false, nullsFirst: false })

    // Apply encounter_type filter
    if (filters?.encounter_type && filters.encounter_type !== '') {
      query = query.eq('encounter_type', filters.encounter_type)
    }

    // Apply date range filters
    if (filters?.date_from && filters.date_from !== '') {
      query = query.gte('check_in_time', `${filters.date_from}T00:00:00.000Z`)
    }
    if (filters?.date_to && filters.date_to !== '') {
      query = query.lte('check_in_time', `${filters.date_to}T23:59:59.999Z`)
    }

    const { data: encounters, error } = await query

    if (error) {
      return {
        success: false,
        error: 'Could not load encounters. Please try again.',
      }
    }

    // Flatten the physician name from the joined data
    const result: EncounterWithProvider[] = (encounters ?? []).map((encounter) => {
      const rec = encounter as Record<string, unknown>
      const physician = rec.physician as {
        user_id: string
        specialty: string | null
        profiles: { first_name: string | null; last_name: string | null }
      } | null

      const providerName = physician?.profiles
        ? `${physician.profiles.first_name ?? ''} ${physician.profiles.last_name ?? ''}`.trim()
        : null

      const { physician: _removed, ...rest } = rec
      return {
        ...rest,
        provider_name: providerName || null,
        provider_specialty: physician?.specialty ?? null,
      } as EncounterWithProvider
    })

    return { success: true, data: result }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred while loading encounters.',
    }
  }
}

// ============================================
// getEncounterById
// ============================================

export async function getEncounterById(
  encounterId: string,
  userId: string
): Promise<ActionResult<EncounterDetail>> {
  try {
    // Validate encounter ID
    const idResult = encounterIdSchema.safeParse({ id: encounterId })
    if (!idResult.success) {
      return {
        success: false,
        error: 'Invalid encounter ID.',
      }
    }

    const supabase = await createClient()

    // Get patient profile to verify ownership
    const { data: patientProfile } = await supabase
      .from('patient_profiles')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (!patientProfile) {
      return {
        success: false,
        error: 'Patient profile not found.',
      }
    }

    const { data: encounter, error } = await supabase
      .from('encounters')
      .select(`
        *,
        physician:physician_profiles!encounters_physician_id_fkey(
          user_id,
          specialty,
          profiles:profiles!physician_profiles_user_id_fkey(
            first_name,
            last_name
          )
        ),
        appointment:appointments!encounters_appointment_id_fkey(
          id,
          appointment_type,
          scheduled_start,
          scheduled_end,
          title
        ),
        location_detail:locations!encounters_location_id_fkey(
          id,
          name,
          city,
          state,
          location_type
        )
      `)
      .eq('id', encounterId)
      .eq('patient_id', patientProfile.id)
      .single()

    if (error || !encounter) {
      return {
        success: false,
        error: 'Encounter not found or you do not have access.',
      }
    }

    const rec = encounter as Record<string, unknown>
    const physician = rec.physician as {
      user_id: string
      specialty: string | null
      profiles: { first_name: string | null; last_name: string | null }
    } | null

    const providerName = physician?.profiles
      ? `${physician.profiles.first_name ?? ''} ${physician.profiles.last_name ?? ''}`.trim()
      : null

    const appointmentData = rec.appointment as Pick<
      Appointment,
      'id' | 'appointment_type' | 'scheduled_start' | 'scheduled_end' | 'title'
    > | null

    const locationData = rec.location_detail as Pick<
      Location,
      'id' | 'name' | 'city' | 'state' | 'location_type'
    > | null

    const { physician: _physician, appointment: _appt, location_detail: _loc, ...rest } = rec

    return {
      success: true,
      data: {
        ...rest,
        provider_name: providerName || null,
        provider_specialty: physician?.specialty ?? null,
        appointment: appointmentData,
        location_detail: locationData,
      } as EncounterDetail,
    }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred while loading the encounter.',
    }
  }
}

// ============================================
// getEncounterDiagnoses
// ============================================

export interface DiagnosisCode {
  code: string
  description: string | null
}

export async function getEncounterDiagnoses(
  encounterId: string
): Promise<ActionResult<DiagnosisCode[]>> {
  try {
    const idResult = encounterIdSchema.safeParse({ id: encounterId })
    if (!idResult.success) {
      return { success: false, error: 'Invalid encounter ID.' }
    }

    const supabase = await createClient()

    const { data: encounter, error } = await supabase
      .from('encounters')
      .select('diagnosis_codes')
      .eq('id', encounterId)
      .single()

    if (error || !encounter) {
      return { success: false, error: 'Could not load diagnoses.' }
    }

    // diagnosis_codes is a TEXT[] in the database
    const codes = (encounter.diagnosis_codes as string[] | null) ?? []

    // Map codes to DiagnosisCode objects
    // In a full implementation, these would be looked up from an ICD-10 reference table.
    // For now, we return the code as-is with a null description.
    const diagnoses: DiagnosisCode[] = codes.map((code) => ({
      code,
      description: null,
    }))

    return { success: true, data: diagnoses }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred while loading diagnoses.',
    }
  }
}

// ============================================
// getEncounterProcedures
// ============================================

export interface ProcedureCode {
  code: string
  description: string | null
}

export async function getEncounterProcedures(
  encounterId: string
): Promise<ActionResult<ProcedureCode[]>> {
  try {
    const idResult = encounterIdSchema.safeParse({ id: encounterId })
    if (!idResult.success) {
      return { success: false, error: 'Invalid encounter ID.' }
    }

    const supabase = await createClient()

    const { data: encounter, error } = await supabase
      .from('encounters')
      .select('procedure_codes')
      .eq('id', encounterId)
      .single()

    if (error || !encounter) {
      return { success: false, error: 'Could not load procedures.' }
    }

    // procedure_codes is a TEXT[] in the database
    const codes = (encounter.procedure_codes as string[] | null) ?? []

    // Map codes to ProcedureCode objects
    const procedures: ProcedureCode[] = codes.map((code) => ({
      code,
      description: null,
    }))

    return { success: true, data: procedures }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred while loading procedures.',
    }
  }
}
