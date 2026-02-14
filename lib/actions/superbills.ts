'use server'

import { createClient } from '@/lib/supabase/server'
import { superbillFilterSchema, superbillIdSchema } from '@/lib/validations/superbills'
import type {
  Superbill,
  DiagnosisCodeEntry,
  ProcedureCodeEntry,
  SuperbillStatus,
} from '@/types/database'
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
// Extended superbill types with joined data
// ============================================

export interface SuperbillWithProvider extends Superbill {
  provider_name: string | null
  provider_npi: string | null
  provider_credentials: string | null
  provider_specialty: string | null
}

export interface SuperbillDetail extends SuperbillWithProvider {
  patient_name: string | null
  patient_dob: string | null
  patient_insurance_provider: string | null
  patient_insurance_policy_number: string | null
  patient_insurance_group_number: string | null
  practice_name: string | null
  practice_npi: string | null
  practice_tax_id: string | null
  practice_address_line1: string | null
  practice_address_line2: string | null
  practice_city: string | null
  practice_state: string | null
  practice_zip_code: string | null
  practice_phone: string | null
  location_name: string | null
  location_address_line1: string | null
  location_city: string | null
  location_state: string | null
  location_zip_code: string | null
}

// ============================================
// Superbill filter types
// ============================================

interface SuperbillFilters {
  status?: string
}

// ============================================
// getPatientSuperbills
// ============================================

export async function getPatientSuperbills(
  userId: string,
  filters?: SuperbillFilters
): Promise<ActionResult<SuperbillWithProvider[]>> {
  try {
    // Validate filters if provided
    if (filters) {
      const filterResult = superbillFilterSchema.safeParse(filters)
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
      return { success: true, data: [] }
    }

    // Build query with provider join
    let query = supabase
      .from('superbills')
      .select(`
        *,
        physician:physician_profiles!superbills_provider_id_fkey(
          user_id,
          npi,
          credentials,
          specialty,
          profiles:profiles!physician_profiles_user_id_fkey(
            first_name,
            last_name
          )
        )
      `)
      .eq('patient_id', patientProfile.id)
      .order('date_of_service', { ascending: false })

    // Apply status filter
    if (filters?.status && filters.status !== '') {
      query = query.eq('status', filters.status)
    }

    const { data: superbills, error } = await query

    if (error) {
      return {
        success: false,
        error: 'Could not load superbills. Please try again.',
      }
    }

    // Flatten the physician name from joined data
    const result: SuperbillWithProvider[] = (superbills ?? []).map((superbill) => {
      const rec = superbill as Record<string, unknown>
      const physician = rec.physician as {
        user_id: string
        npi: string | null
        credentials: string | null
        specialty: string | null
        profiles: { first_name: string | null; last_name: string | null }
      } | null

      const providerName = physician?.profiles
        ? `${physician.profiles.first_name ?? ''} ${physician.profiles.last_name ?? ''}`.trim()
        : null

      const { physician: _removed, ...rest } = rec
      return {
        ...rest,
        diagnosis_codes: (rest.diagnosis_codes ?? []) as DiagnosisCodeEntry[],
        procedure_codes: (rest.procedure_codes ?? []) as ProcedureCodeEntry[],
        status: rest.status as SuperbillStatus,
        provider_name: providerName || null,
        provider_npi: physician?.npi ?? null,
        provider_credentials: physician?.credentials ?? null,
        provider_specialty: physician?.specialty ?? null,
      } as SuperbillWithProvider
    })

    return { success: true, data: result }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred while loading superbills.',
    }
  }
}

// ============================================
// getSuperbillById
// ============================================

export async function getSuperbillById(
  superbillId: string,
  userId: string
): Promise<ActionResult<SuperbillDetail>> {
  try {
    // Validate superbill ID
    const idResult = superbillIdSchema.safeParse({ id: superbillId })
    if (!idResult.success) {
      return {
        success: false,
        error: 'Invalid superbill ID.',
      }
    }

    const supabase = await createClient()

    // Get patient profile to verify ownership
    const { data: patientProfile } = await supabase
      .from('patient_profiles')
      .select('id, insurance_provider, insurance_policy_number, insurance_group_number')
      .eq('user_id', userId)
      .single()

    if (!patientProfile) {
      return {
        success: false,
        error: 'Patient profile not found.',
      }
    }

    // Get patient's profile info (name, DOB)
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('first_name, last_name, date_of_birth')
      .eq('id', userId)
      .single()

    const { data: superbill, error } = await supabase
      .from('superbills')
      .select(`
        *,
        physician:physician_profiles!superbills_provider_id_fkey(
          user_id,
          npi,
          credentials,
          specialty,
          practice_id,
          profiles:profiles!physician_profiles_user_id_fkey(
            first_name,
            last_name
          )
        ),
        location:locations!superbills_location_id_fkey(
          id,
          name,
          address_line1,
          city,
          state,
          zip_code
        )
      `)
      .eq('id', superbillId)
      .eq('patient_id', patientProfile.id)
      .single()

    if (error || !superbill) {
      return {
        success: false,
        error: 'Superbill not found or you do not have access.',
      }
    }

    const rec = superbill as Record<string, unknown>
    const physician = rec.physician as {
      user_id: string
      npi: string | null
      credentials: string | null
      specialty: string | null
      practice_id: string | null
      profiles: { first_name: string | null; last_name: string | null }
    } | null

    const location = rec.location as {
      id: string
      name: string
      address_line1: string | null
      city: string | null
      state: string | null
      zip_code: string | null
    } | null

    const providerName = physician?.profiles
      ? `${physician.profiles.first_name ?? ''} ${physician.profiles.last_name ?? ''}`.trim()
      : null

    const patientName = userProfile
      ? `${userProfile.first_name ?? ''} ${userProfile.last_name ?? ''}`.trim()
      : null

    // Fetch practice info if available
    let practiceData: {
      name: string
      npi: string | null
      tax_id: string | null
      address_line1: string | null
      address_line2: string | null
      city: string | null
      state: string | null
      zip_code: string | null
      phone: string | null
    } | null = null

    if (physician?.practice_id) {
      const { data: practice } = await supabase
        .from('practices')
        .select('name, npi, tax_id, address_line1, address_line2, city, state, zip_code, phone')
        .eq('id', physician.practice_id)
        .single()
      practiceData = practice
    }

    const { physician: _physician, location: _loc, ...rest } = rec

    return {
      success: true,
      data: {
        ...rest,
        diagnosis_codes: (rest.diagnosis_codes ?? []) as DiagnosisCodeEntry[],
        procedure_codes: (rest.procedure_codes ?? []) as ProcedureCodeEntry[],
        status: rest.status as SuperbillStatus,
        provider_name: providerName || null,
        provider_npi: physician?.npi ?? null,
        provider_credentials: physician?.credentials ?? null,
        provider_specialty: physician?.specialty ?? null,
        patient_name: patientName || null,
        patient_dob: userProfile?.date_of_birth ?? null,
        patient_insurance_provider: patientProfile.insurance_provider ?? null,
        patient_insurance_policy_number: patientProfile.insurance_policy_number ?? null,
        patient_insurance_group_number: patientProfile.insurance_group_number ?? null,
        practice_name: practiceData?.name ?? 'Foundation Health',
        practice_npi: practiceData?.npi ?? null,
        practice_tax_id: practiceData?.tax_id ?? null,
        practice_address_line1: practiceData?.address_line1 ?? null,
        practice_address_line2: practiceData?.address_line2 ?? null,
        practice_city: practiceData?.city ?? null,
        practice_state: practiceData?.state ?? null,
        practice_zip_code: practiceData?.zip_code ?? null,
        practice_phone: practiceData?.phone ?? null,
        location_name: location?.name ?? null,
        location_address_line1: location?.address_line1 ?? null,
        location_city: location?.city ?? null,
        location_state: location?.state ?? null,
        location_zip_code: location?.zip_code ?? null,
      } as SuperbillDetail,
    }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred while loading the superbill.',
    }
  }
}

// ============================================
// generateSuperbill
// ============================================

export async function generateSuperbill(
  encounterId: string,
  userId: string
): Promise<ActionResult<Superbill>> {
  try {
    // Validate encounter ID
    const idResult = superbillIdSchema.safeParse({ id: encounterId })
    if (!idResult.success) {
      return {
        success: false,
        error: 'Invalid encounter ID.',
      }
    }

    const supabase = await createClient()

    // Get patient profile
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

    // Fetch the encounter with all related data
    const { data: encounter, error: encounterError } = await supabase
      .from('encounters')
      .select('*')
      .eq('id', encounterId)
      .eq('patient_id', patientProfile.id)
      .single()

    if (encounterError || !encounter) {
      return {
        success: false,
        error: 'Encounter not found or you do not have access.',
      }
    }

    // Check if superbill already exists for this encounter
    const { data: existingSuperbill } = await supabase
      .from('superbills')
      .select('id')
      .eq('encounter_id', encounterId)
      .single()

    if (existingSuperbill) {
      return {
        success: false,
        error: 'A superbill has already been generated for this encounter.',
      }
    }

    const enc = encounter as Record<string, unknown>

    // Build diagnosis codes from encounter data
    const rawDiagnosisCodes = (enc.diagnosis_codes as string[] | null) ?? []
    const diagnosisCodes: DiagnosisCodeEntry[] = rawDiagnosisCodes.map((code) => ({
      code,
      description: code, // In production, lookup from ICD-10 reference table
    }))

    // Build procedure codes from encounter data
    const rawProcedureCodes = (enc.procedure_codes as string[] | null) ?? []
    const procedureCodes: ProcedureCodeEntry[] = rawProcedureCodes.map((code) => ({
      code,
      description: code, // In production, lookup from CPT reference table
      modifier: null,
      charge_cents: 0, // In production, lookup from service catalog
    }))

    // Calculate total charges
    const totalChargesCents = procedureCodes.reduce(
      (sum, proc) => sum + proc.charge_cents,
      0
    )

    // Determine place of service
    const isTelehealth = enc.is_telehealth as boolean | undefined
    const placeOfServiceCode = isTelehealth ? '02' : '11'

    // Determine date of service
    const checkInTime = enc.check_in_time as string | null
    const dateOfService = checkInTime
      ? checkInTime.split('T')[0]
      : new Date().toISOString().split('T')[0]

    // Insert the superbill
    const { data: newSuperbill, error: insertError } = await supabase
      .from('superbills')
      .insert({
        patient_id: patientProfile.id,
        encounter_id: encounterId,
        provider_id: enc.physician_id as string,
        location_id: (enc.location_id as string | null) ?? null,
        date_of_service: dateOfService,
        place_of_service_code: placeOfServiceCode,
        diagnosis_codes: diagnosisCodes,
        procedure_codes: procedureCodes,
        total_charges_cents: totalChargesCents,
        status: 'generated',
      })
      .select()
      .single()

    if (insertError || !newSuperbill) {
      return {
        success: false,
        error: 'Failed to generate superbill. Please try again.',
      }
    }

    return { success: true, data: newSuperbill as Superbill }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred while generating the superbill.',
    }
  }
}
