'use server'

import { createClient } from '@/lib/supabase/server'
import {
  conciergeRequestSchema,
  type ConciergeRequestFormData,
} from '@/lib/validations/concierge'
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
// Concierge request row type
// ============================================

export interface ConciergeRequest {
  id: string
  patient_id: string
  location: string
  request_type: string
  details: string
  preferred_date: string | null
  special_requirements: string | null
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  notes: string | null
  created_at: string
  updated_at: string
}

// ============================================
// submitConciergeRequest
// ============================================

export async function submitConciergeRequest(
  userId: string,
  formData: ConciergeRequestFormData
): Promise<ActionResult<{ requestId: string }>> {
  try {
    // Validate with Zod v4
    const parsed = conciergeRequestSchema.safeParse(formData)

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

    // Get patient profile
    const { data: patientProfile } = await supabase
      .from('patient_profiles')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (!patientProfile) {
      return {
        success: false,
        error: 'Patient profile not found. Please complete your profile first.',
      }
    }

    // Insert concierge request
    const { data: newRequest, error: insertError } = await supabase
      .from('concierge_requests')
      .insert({
        patient_id: patientProfile.id,
        location: data.location,
        request_type: data.request_type,
        details: data.details,
        preferred_date: data.preferred_date || null,
        special_requirements: data.special_requirements || null,
        status: 'pending',
      })
      .select('id')
      .single()

    if (insertError || !newRequest) {
      return {
        success: false,
        error: 'Failed to submit your concierge request. Please try again.',
      }
    }

    return {
      success: true,
      data: { requestId: newRequest.id },
    }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred while submitting your request.',
    }
  }
}

// ============================================
// getPatientConciergeRequests
// ============================================

export async function getPatientConciergeRequests(
  userId: string
): Promise<ActionResult<ConciergeRequest[]>> {
  try {
    const supabase = await createClient()

    // Get patient profile
    const { data: patientProfile } = await supabase
      .from('patient_profiles')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (!patientProfile) {
      return { success: true, data: [] }
    }

    const { data: requests, error } = await supabase
      .from('concierge_requests')
      .select('*')
      .eq('patient_id', patientProfile.id)
      .order('created_at', { ascending: false })

    if (error) {
      return {
        success: false,
        error: 'Could not load your concierge requests. Please try again.',
      }
    }

    return {
      success: true,
      data: (requests ?? []) as ConciergeRequest[],
    }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred while loading your requests.',
    }
  }
}
