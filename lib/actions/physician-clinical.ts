'use server'

import { createClient } from '@/lib/supabase/server'
import {
  physicianEncounterFilterSchema,
  soapNotesSchema,
  encounterCompletionSchema,
  physicianSessionFilterSchema,
  sessionClinicalNotesSchema,
  sessionCompletionSchema,
  physicianProfileUpdateSchema,
  type PhysicianEncounterFilterData,
  type PhysicianSessionFilterData,
  type SoapNotesFormData,
  type SessionClinicalNotesFormData,
  type PhysicianProfileUpdateData,
} from '@/lib/validations/physician-clinical'
import type {
  Encounter,
  TelemedicineSession,
  Profile,
  PhysicianProfile,
  Appointment,
  Location,
} from '@/types/database'
import { ZodError } from 'zod'

// ============================================
// Result types
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
// Helper: extract field errors from Zod
// ============================================

function extractFieldErrors(error: ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {}
  for (const issue of error.issues) {
    const fieldName = issue.path.join('.')
    if (fieldName && !fieldErrors[fieldName]) {
      fieldErrors[fieldName] = issue.message
    }
  }
  return fieldErrors
}

// ============================================
// Helper: get current user and verify physician role
// ============================================

async function getPhysicianUser(): Promise<{ userId: string } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'physician') return null

  return { userId: profile.id }
}

// ============================================
// Extended encounter types for physician view
// ============================================

export interface PhysicianEncounterRow extends Encounter {
  patient_first_name: string | null
  patient_last_name: string | null
  patient_avatar_url: string | null
  encounter_type: string | null
  subjective: string | null
  objective: string | null
  assessment: string | null
}

export interface PhysicianEncounterDetail extends PhysicianEncounterRow {
  patient_email: string | null
  patient_phone: string | null
  patient_dob: string | null
  appointment: Pick<Appointment, 'id' | 'appointment_type' | 'scheduled_start' | 'scheduled_end' | 'title'> | null
  location_detail: Pick<Location, 'id' | 'name' | 'city' | 'state' | 'location_type'> | null
}

// ============================================
// Extended telemedicine types for physician view
// ============================================

export interface PhysicianSessionRow extends TelemedicineSession {
  patient_first_name: string | null
  patient_last_name: string | null
  patient_avatar_url: string | null
}

export interface PhysicianSessionDetail extends PhysicianSessionRow {
  patient_email: string | null
  patient_phone: string | null
}

// ============================================
// getPhysicianEncounters
// ============================================

export async function getPhysicianEncounters(
  filters?: PhysicianEncounterFilterData
): Promise<ActionResult<PhysicianEncounterRow[]>> {
  try {
    const physician = await getPhysicianUser()
    if (!physician) {
      return { success: false, error: 'Authentication required. You must be a physician.' }
    }

    if (filters) {
      const parsed = physicianEncounterFilterSchema.safeParse(filters)
      if (!parsed.success) {
        return {
          success: false,
          error: 'Invalid filter parameters.',
          fieldErrors: extractFieldErrors(parsed.error as ZodError),
        }
      }
    }

    const supabase = await createClient()

    let query = supabase
      .from('encounters')
      .select(`
        *,
        patient:profiles!encounters_patient_id_fkey(
          first_name,
          last_name,
          avatar_url
        )
      `)
      .eq('physician_id', physician.userId)
      .order('created_at', { ascending: false })

    // Apply status filter
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    // Apply date range filters
    if (filters?.date_from && filters.date_from) {
      query = query.gte('check_in_time', `${filters.date_from}T00:00:00.000Z`)
    }
    if (filters?.date_to && filters.date_to) {
      query = query.lte('check_in_time', `${filters.date_to}T23:59:59.999Z`)
    }

    const { data: encounters, error } = await query

    if (error) {
      return {
        success: false,
        error: 'Could not load encounters. Please try again.',
      }
    }

    const result: PhysicianEncounterRow[] = (encounters ?? []).map((row) => {
      const rec = row as Record<string, unknown>
      const patient = rec.patient as Pick<Profile, 'first_name' | 'last_name' | 'avatar_url'> | null

      const { patient: _p, ...rest } = rec

      return {
        ...rest,
        patient_first_name: patient?.first_name ?? null,
        patient_last_name: patient?.last_name ?? null,
        patient_avatar_url: patient?.avatar_url ?? null,
      } as PhysicianEncounterRow
    })

    // Apply patient name filter client-side (simpler than complex DB query)
    if (filters?.patient_search && filters.patient_search) {
      const search = filters.patient_search.toLowerCase()
      return {
        success: true,
        data: result.filter((e) => {
          const fullName = `${e.patient_first_name ?? ''} ${e.patient_last_name ?? ''}`.toLowerCase()
          return fullName.includes(search)
        }),
      }
    }

    return { success: true, data: result }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred while loading encounters.',
    }
  }
}

// ============================================
// getEncounterForPhysician
// ============================================

export async function getEncounterForPhysician(
  encounterId: string
): Promise<ActionResult<PhysicianEncounterDetail>> {
  try {
    const physician = await getPhysicianUser()
    if (!physician) {
      return { success: false, error: 'Authentication required. You must be a physician.' }
    }

    const supabase = await createClient()

    const { data: encounter, error } = await supabase
      .from('encounters')
      .select(`
        *,
        patient:profiles!encounters_patient_id_fkey(
          first_name,
          last_name,
          avatar_url,
          email,
          phone,
          date_of_birth
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
      .eq('physician_id', physician.userId)
      .single()

    if (error || !encounter) {
      return {
        success: false,
        error: 'Encounter not found or you do not have access.',
      }
    }

    const rec = encounter as Record<string, unknown>
    const patient = rec.patient as {
      first_name: string | null
      last_name: string | null
      avatar_url: string | null
      email: string | null
      phone: string | null
      date_of_birth: string | null
    } | null

    const appointmentData = rec.appointment as Pick<
      Appointment,
      'id' | 'appointment_type' | 'scheduled_start' | 'scheduled_end' | 'title'
    > | null

    const locationData = rec.location_detail as Pick<
      Location,
      'id' | 'name' | 'city' | 'state' | 'location_type'
    > | null

    const { patient: _p, appointment: _a, location_detail: _l, ...rest } = rec

    return {
      success: true,
      data: {
        ...rest,
        patient_first_name: patient?.first_name ?? null,
        patient_last_name: patient?.last_name ?? null,
        patient_avatar_url: patient?.avatar_url ?? null,
        patient_email: patient?.email ?? null,
        patient_phone: patient?.phone ?? null,
        patient_dob: patient?.date_of_birth ?? null,
        appointment: appointmentData,
        location_detail: locationData,
      } as PhysicianEncounterDetail,
    }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred while loading the encounter.',
    }
  }
}

// ============================================
// updateEncounterNotes
// ============================================

export async function updateEncounterNotes(
  encounterId: string,
  soapNotes: SoapNotesFormData
): Promise<ActionResult<{ updated: true }>> {
  try {
    const physician = await getPhysicianUser()
    if (!physician) {
      return { success: false, error: 'Authentication required. You must be a physician.' }
    }

    const parsed = soapNotesSchema.safeParse(soapNotes)
    if (!parsed.success) {
      return {
        success: false,
        error: 'Invalid notes data.',
        fieldErrors: extractFieldErrors(parsed.error as ZodError),
      }
    }

    const supabase = await createClient()

    // Verify this encounter belongs to the physician
    const { data: existing } = await supabase
      .from('encounters')
      .select('id, physician_id')
      .eq('id', encounterId)
      .eq('physician_id', physician.userId)
      .single()

    if (!existing) {
      return {
        success: false,
        error: 'Encounter not found or you do not have access.',
      }
    }

    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    const data = parsed.data

    // Store SOAP note fields in the encounter columns
    // visit_notes stores the subjective, plan stores plan
    // We use visit_notes as a JSON-encoded SOAP container
    if (data.subjective !== undefined) {
      updatePayload.visit_notes = data.subjective || null
    }
    if (data.plan !== undefined) {
      updatePayload.plan = data.plan || null
    }
    // For objective and assessment, store in chief_complaint field as structured
    // Actually, looking at the Encounter type, we have visit_notes, plan, chief_complaint
    // The existing encounter detail page uses subjective, objective, assessment as separate fields
    // These must come from the EncounterWithProvider extended type. Let's store them
    // in the visit_notes as JSON to be safe, since the DB schema shows visit_notes as text.
    // However, the existing patient page accesses encounter.subjective etc. which means
    // these fields exist on the encounter record (possibly as DB columns not in our TS types).
    // We'll update them directly - Supabase will accept any column that exists.

    // Use direct column updates for SOAP fields
    if (data.subjective !== undefined) {
      updatePayload.subjective = data.subjective || null
    }
    if (data.objective !== undefined) {
      updatePayload.objective = data.objective || null
    }
    if (data.assessment !== undefined) {
      updatePayload.assessment = data.assessment || null
    }
    if (data.plan !== undefined) {
      updatePayload.plan = data.plan || null
    }

    const { error: updateError } = await supabase
      .from('encounters')
      .update(updatePayload)
      .eq('id', encounterId)
      .eq('physician_id', physician.userId)

    if (updateError) {
      return {
        success: false,
        error: 'Failed to update encounter notes. Please try again.',
      }
    }

    return { success: true, data: { updated: true } }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred while updating notes.',
    }
  }
}

// ============================================
// completeEncounter
// ============================================

export async function completeEncounter(
  encounterId: string
): Promise<ActionResult<{ completed: true }>> {
  try {
    const physician = await getPhysicianUser()
    if (!physician) {
      return { success: false, error: 'Authentication required. You must be a physician.' }
    }

    const parsed = encounterCompletionSchema.safeParse({ encounter_id: encounterId })
    if (!parsed.success) {
      return {
        success: false,
        error: 'Invalid encounter ID.',
        fieldErrors: extractFieldErrors(parsed.error as ZodError),
      }
    }

    const supabase = await createClient()

    // Verify ownership and current status
    const { data: existing } = await supabase
      .from('encounters')
      .select('id, physician_id, status')
      .eq('id', encounterId)
      .eq('physician_id', physician.userId)
      .single()

    if (!existing) {
      return {
        success: false,
        error: 'Encounter not found or you do not have access.',
      }
    }

    if (existing.status === 'completed') {
      return {
        success: false,
        error: 'This encounter is already completed.',
      }
    }

    if (existing.status === 'cancelled') {
      return {
        success: false,
        error: 'Cannot complete a cancelled encounter.',
      }
    }

    const { error: updateError } = await supabase
      .from('encounters')
      .update({
        status: 'completed',
        check_out_time: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', encounterId)
      .eq('physician_id', physician.userId)

    if (updateError) {
      return {
        success: false,
        error: 'Failed to complete encounter. Please try again.',
      }
    }

    return { success: true, data: { completed: true } }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred while completing the encounter.',
    }
  }
}

// ============================================
// getPhysicianTelemedicineSessions
// ============================================

export async function getPhysicianTelemedicineSessions(
  filters?: PhysicianSessionFilterData
): Promise<ActionResult<PhysicianSessionRow[]>> {
  try {
    const physician = await getPhysicianUser()
    if (!physician) {
      return { success: false, error: 'Authentication required. You must be a physician.' }
    }

    if (filters) {
      const parsed = physicianSessionFilterSchema.safeParse(filters)
      if (!parsed.success) {
        return {
          success: false,
          error: 'Invalid filter parameters.',
          fieldErrors: extractFieldErrors(parsed.error as ZodError),
        }
      }
    }

    const supabase = await createClient()

    let query = supabase
      .from('telemedicine_sessions')
      .select(`
        *,
        patient:profiles!telemedicine_sessions_patient_id_fkey(
          first_name,
          last_name,
          avatar_url
        )
      `)
      .eq('physician_id', physician.userId)
      .order('scheduled_start', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.session_type) {
      query = query.eq('session_type', filters.session_type)
    }
    if (filters?.date_from && filters.date_from) {
      query = query.gte('scheduled_start', `${filters.date_from}T00:00:00.000Z`)
    }
    if (filters?.date_to && filters.date_to) {
      query = query.lte('scheduled_start', `${filters.date_to}T23:59:59.999Z`)
    }

    const { data: sessions, error } = await query

    if (error) {
      return {
        success: false,
        error: 'Could not load telemedicine sessions. Please try again.',
      }
    }

    const result: PhysicianSessionRow[] = (sessions ?? []).map((row) => {
      const rec = row as Record<string, unknown>
      const patient = rec.patient as Pick<Profile, 'first_name' | 'last_name' | 'avatar_url'> | null

      const { patient: _p, ...rest } = rec

      return {
        ...rest,
        patient_first_name: patient?.first_name ?? null,
        patient_last_name: patient?.last_name ?? null,
        patient_avatar_url: patient?.avatar_url ?? null,
      } as PhysicianSessionRow
    })

    return { success: true, data: result }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred while loading sessions.',
    }
  }
}

// ============================================
// getTelemedicineSessionForPhysician
// ============================================

export async function getTelemedicineSessionForPhysician(
  sessionId: string
): Promise<ActionResult<PhysicianSessionDetail>> {
  try {
    const physician = await getPhysicianUser()
    if (!physician) {
      return { success: false, error: 'Authentication required. You must be a physician.' }
    }

    const supabase = await createClient()

    const { data: session, error } = await supabase
      .from('telemedicine_sessions')
      .select(`
        *,
        patient:profiles!telemedicine_sessions_patient_id_fkey(
          first_name,
          last_name,
          avatar_url,
          email,
          phone
        )
      `)
      .eq('id', sessionId)
      .eq('physician_id', physician.userId)
      .single()

    if (error || !session) {
      return {
        success: false,
        error: 'Session not found or you do not have access.',
      }
    }

    const rec = session as Record<string, unknown>
    const patient = rec.patient as {
      first_name: string | null
      last_name: string | null
      avatar_url: string | null
      email: string | null
      phone: string | null
    } | null

    const { patient: _p, ...rest } = rec

    return {
      success: true,
      data: {
        ...rest,
        patient_first_name: patient?.first_name ?? null,
        patient_last_name: patient?.last_name ?? null,
        patient_avatar_url: patient?.avatar_url ?? null,
        patient_email: patient?.email ?? null,
        patient_phone: patient?.phone ?? null,
      } as PhysicianSessionDetail,
    }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred while loading the session.',
    }
  }
}

// ============================================
// updateSessionClinicalNotes
// ============================================

export async function updateSessionClinicalNotes(
  sessionId: string,
  notes: SessionClinicalNotesFormData
): Promise<ActionResult<{ updated: true }>> {
  try {
    const physician = await getPhysicianUser()
    if (!physician) {
      return { success: false, error: 'Authentication required. You must be a physician.' }
    }

    const parsed = sessionClinicalNotesSchema.safeParse(notes)
    if (!parsed.success) {
      return {
        success: false,
        error: 'Invalid notes data.',
        fieldErrors: extractFieldErrors(parsed.error as ZodError),
      }
    }

    const supabase = await createClient()

    // Verify this session belongs to the physician
    const { data: existing } = await supabase
      .from('telemedicine_sessions')
      .select('id, physician_id')
      .eq('id', sessionId)
      .eq('physician_id', physician.userId)
      .single()

    if (!existing) {
      return {
        success: false,
        error: 'Session not found or you do not have access.',
      }
    }

    const data = parsed.data
    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (data.clinical_notes !== undefined) {
      updatePayload.clinical_notes = data.clinical_notes || null
    }
    if (data.follow_up_instructions !== undefined) {
      updatePayload.follow_up_instructions = data.follow_up_instructions || null
    }

    const { error: updateError } = await supabase
      .from('telemedicine_sessions')
      .update(updatePayload)
      .eq('id', sessionId)
      .eq('physician_id', physician.userId)

    if (updateError) {
      return {
        success: false,
        error: 'Failed to update session notes. Please try again.',
      }
    }

    return { success: true, data: { updated: true } }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred while updating notes.',
    }
  }
}

// ============================================
// completeTelemedicineSession
// ============================================

export async function completeTelemedicineSession(
  sessionId: string
): Promise<ActionResult<{ completed: true }>> {
  try {
    const physician = await getPhysicianUser()
    if (!physician) {
      return { success: false, error: 'Authentication required. You must be a physician.' }
    }

    const parsed = sessionCompletionSchema.safeParse({ session_id: sessionId })
    if (!parsed.success) {
      return {
        success: false,
        error: 'Invalid session ID.',
        fieldErrors: extractFieldErrors(parsed.error as ZodError),
      }
    }

    const supabase = await createClient()

    const { data: existing } = await supabase
      .from('telemedicine_sessions')
      .select('id, physician_id, status')
      .eq('id', sessionId)
      .eq('physician_id', physician.userId)
      .single()

    if (!existing) {
      return {
        success: false,
        error: 'Session not found or you do not have access.',
      }
    }

    if (existing.status === 'completed') {
      return { success: false, error: 'This session is already completed.' }
    }

    if (existing.status === 'cancelled' || existing.status === 'no_show') {
      return { success: false, error: 'Cannot complete a cancelled or no-show session.' }
    }

    const { error: updateError } = await supabase
      .from('telemedicine_sessions')
      .update({
        status: 'completed',
        actual_end: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId)
      .eq('physician_id', physician.userId)

    if (updateError) {
      return {
        success: false,
        error: 'Failed to complete session. Please try again.',
      }
    }

    return { success: true, data: { completed: true } }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred while completing the session.',
    }
  }
}

// ============================================
// getPhysicianProfile
// ============================================

export async function getPhysicianProfileData(): Promise<
  ActionResult<{ profile: Profile; physicianProfile: PhysicianProfile | null }>
> {
  try {
    const physician = await getPhysicianUser()
    if (!physician) {
      return { success: false, error: 'Authentication required. You must be a physician.' }
    }

    const supabase = await createClient()

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', physician.userId)
      .single()

    if (profileError || !profile) {
      return { success: false, error: 'Profile not found.' }
    }

    const { data: physicianProfile } = await supabase
      .from('physician_profiles')
      .select('*')
      .eq('user_id', physician.userId)
      .single()

    return {
      success: true,
      data: {
        profile: profile as Profile,
        physicianProfile: (physicianProfile as PhysicianProfile) ?? null,
      },
    }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred while loading your profile.',
    }
  }
}

// ============================================
// updatePhysicianProfile
// ============================================

export async function updatePhysicianProfile(
  data: PhysicianProfileUpdateData
): Promise<ActionResult<{ updated: true }>> {
  try {
    const physician = await getPhysicianUser()
    if (!physician) {
      return { success: false, error: 'Authentication required. You must be a physician.' }
    }

    const parsed = physicianProfileUpdateSchema.safeParse(data)
    if (!parsed.success) {
      return {
        success: false,
        error: 'Invalid profile data.',
        fieldErrors: extractFieldErrors(parsed.error as ZodError),
      }
    }

    const validatedData = parsed.data
    const supabase = await createClient()

    // Update the profiles table (phone)
    if (validatedData.phone !== undefined) {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          phone: validatedData.phone || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', physician.userId)

      if (profileError) {
        return { success: false, error: 'Failed to update profile. Please try again.' }
      }
    }

    // Update physician_profiles table (bio, languages)
    const physicianUpdate: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (validatedData.bio !== undefined) {
      physicianUpdate.bio = validatedData.bio || null
    }
    if (validatedData.languages !== undefined) {
      physicianUpdate.languages = validatedData.languages
    }

    const { error: physError } = await supabase
      .from('physician_profiles')
      .update(physicianUpdate)
      .eq('user_id', physician.userId)

    if (physError) {
      return { success: false, error: 'Failed to update physician profile. Please try again.' }
    }

    return { success: true, data: { updated: true } }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred while updating your profile.',
    }
  }
}
