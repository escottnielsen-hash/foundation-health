'use server'

import { createClient } from '@/lib/supabase/server'
import { profileSchema, documentFilterSchema } from '@/lib/validations/patient'
import type { ProfileFormData } from '@/lib/validations/patient'
import type { Profile, PatientProfile, HealthRecord } from '@/types/database'
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
// Combined profile type (profiles + patient_profiles)
// ============================================

export interface FullPatientProfile {
  profile: Profile
  patientProfile: PatientProfile | null
}

// ============================================
// getPatientProfile
// ============================================

export async function getPatientProfile(
  userId: string
): Promise<ActionResult<FullPatientProfile>> {
  try {
    const supabase = await createClient()

    // Fetch the base profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return {
        success: false,
        error: 'Could not load your profile. Please try again.',
      }
    }

    // Fetch the patient-specific profile
    const { data: patientProfile, error: patientError } = await supabase
      .from('patient_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    // patient_profiles may not exist yet for a new user, that is OK
    if (patientError && patientError.code !== 'PGRST116') {
      return {
        success: false,
        error: 'Could not load patient details. Please try again.',
      }
    }

    return {
      success: true,
      data: {
        profile: profile as Profile,
        patientProfile: (patientProfile as PatientProfile) ?? null,
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
// updatePatientProfile
// ============================================

export async function updatePatientProfile(
  userId: string,
  formData: ProfileFormData
): Promise<ActionResult<{ updated: true }>> {
  try {
    // Validate with Zod v4 — uses .issues, not .errors
    const parsed = profileSchema.safeParse(formData)

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of (parsed.error as ZodError).issues) {
        const fieldName = issue.path.join('.')
        if (fieldName && !fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message
        }
      }
      return {
        success: false,
        error: 'Please fix the errors in the form.',
        fieldErrors,
      }
    }

    const data = parsed.data
    const supabase = await createClient()

    // Update the profiles table (first_name, last_name, phone, date_of_birth, address fields)
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone || null,
        date_of_birth: data.date_of_birth || null,
        address_line1: data.address_line1 || null,
        address_line2: data.address_line2 || null,
        city: data.city || null,
        state: data.state || null,
        zip_code: data.zip_code || null,
      })
      .eq('id', userId)

    if (profileError) {
      return {
        success: false,
        error: 'Failed to update profile. Please try again.',
      }
    }

    // Update the patient_profiles table (emergency contact fields)
    // First check if the patient profile exists
    const { data: existingPatient } = await supabase
      .from('patient_profiles')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (existingPatient) {
      const { error: patientError } = await supabase
        .from('patient_profiles')
        .update({
          emergency_contact_name: data.emergency_contact_name || null,
          emergency_contact_phone: data.emergency_contact_phone || null,
        })
        .eq('user_id', userId)

      if (patientError) {
        return {
          success: false,
          error: 'Failed to update emergency contact information. Please try again.',
        }
      }
    } else {
      // Create a patient_profiles row if it does not exist
      const { error: insertError } = await supabase
        .from('patient_profiles')
        .insert({
          user_id: userId,
          emergency_contact_name: data.emergency_contact_name || null,
          emergency_contact_phone: data.emergency_contact_phone || null,
        })

      if (insertError) {
        return {
          success: false,
          error: 'Failed to create patient profile. Please try again.',
        }
      }
    }

    return { success: true, data: { updated: true } }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred while saving your profile.',
    }
  }
}

// ============================================
// getPatientDocuments
// ============================================

export interface PatientDocument extends HealthRecord {
  physician_name?: string | null
}

interface DocumentFilters {
  record_type?: string
}

export async function getPatientDocuments(
  userId: string,
  filters?: DocumentFilters
): Promise<ActionResult<PatientDocument[]>> {
  try {
    // Validate filters if provided
    if (filters) {
      const filterResult = documentFilterSchema.safeParse(filters)
      if (!filterResult.success) {
        return {
          success: false,
          error: 'Invalid filter parameters.',
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

    // Build query
    let query = supabase
      .from('health_records')
      .select(`
        *,
        physician:physician_profiles!health_records_physician_id_fkey(
          user_id,
          profiles:profiles!physician_profiles_user_id_fkey(
            first_name,
            last_name
          )
        )
      `)
      .eq('patient_id', patientProfile.id)
      .order('record_date', { ascending: false })

    // Apply record_type filter
    if (filters?.record_type && filters.record_type !== '') {
      query = query.eq('record_type', filters.record_type)
    }

    const { data: records, error } = await query

    if (error) {
      return {
        success: false,
        error: 'Could not load health records. Please try again.',
      }
    }

    // Flatten the physician name from the joined data
    const documents: PatientDocument[] = (records ?? []).map((record) => {
      const rec = record as Record<string, unknown>
      const physician = rec.physician as {
        user_id: string
        profiles: { first_name: string | null; last_name: string | null }
      } | null

      const physicianName = physician?.profiles
        ? `${physician.profiles.first_name ?? ''} ${physician.profiles.last_name ?? ''}`.trim()
        : null

      // Strip the nested physician object and return a flat document
      const { physician: _removed, ...rest } = rec
      return {
        ...rest,
        physician_name: physicianName || null,
      } as PatientDocument
    })

    return { success: true, data: documents }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred while loading health records.',
    }
  }
}

// ============================================
// getDocumentById
// ============================================

export async function getDocumentById(
  documentId: string,
  userId: string
): Promise<ActionResult<PatientDocument>> {
  try {
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

    const { data: record, error } = await supabase
      .from('health_records')
      .select(`
        *,
        physician:physician_profiles!health_records_physician_id_fkey(
          user_id,
          profiles:profiles!physician_profiles_user_id_fkey(
            first_name,
            last_name
          )
        )
      `)
      .eq('id', documentId)
      .eq('patient_id', patientProfile.id)
      .single()

    if (error || !record) {
      return {
        success: false,
        error: 'Health record not found or you do not have access.',
      }
    }

    const rec = record as Record<string, unknown>
    const physician = rec.physician as {
      user_id: string
      profiles: { first_name: string | null; last_name: string | null }
    } | null

    const physicianName = physician?.profiles
      ? `${physician.profiles.first_name ?? ''} ${physician.profiles.last_name ?? ''}`.trim()
      : null

    const { physician: _removed, ...rest } = rec

    return {
      success: true,
      data: {
        ...rest,
        physician_name: physicianName || null,
      } as PatientDocument,
    }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred while loading the health record.',
    }
  }
}
