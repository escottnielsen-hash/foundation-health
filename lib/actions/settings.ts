'use server'

import { createClient } from '@/lib/supabase/server'
import { settingsProfileSchema, passwordChangeSchema } from '@/lib/validations/settings'
import type { SettingsProfileFormData } from '@/lib/validations/settings'
import type { Profile, PhysicianProfile, PatientProfile } from '@/types/database'
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
// getSettingsProfile — fetch profile data for settings page
// ============================================

export interface SettingsProfileBundle {
  profile: Profile
  physicianProfile: PhysicianProfile | null
  patientProfile: PatientProfile | null
}

export async function getSettingsProfile(): Promise<ActionResult<SettingsProfileBundle>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated.' }
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return { success: false, error: 'Could not load your profile.' }
    }

    let physicianProfile: PhysicianProfile | null = null
    let patientProfile: PatientProfile | null = null

    if (profile.role === 'physician') {
      const { data: physician } = await supabase
        .from('physician_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
      physicianProfile = (physician as PhysicianProfile) ?? null
    }

    if (profile.role === 'patient') {
      const { data: patient } = await supabase
        .from('patient_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
      patientProfile = (patient as PatientProfile) ?? null
    }

    return {
      success: true,
      data: {
        profile: profile as Profile,
        physicianProfile,
        patientProfile,
      },
    }
  } catch {
    return { success: false, error: 'An unexpected error occurred.' }
  }
}

// ============================================
// updateProfile — update current user's profile
// ============================================

export async function updateProfile(
  formData: SettingsProfileFormData
): Promise<ActionResult<{ updated: true }>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated.' }
    }

    const parsed = settingsProfileSchema.safeParse(formData)

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

    // Fetch the current profile to know the role
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!currentProfile) {
      return { success: false, error: 'Profile not found.' }
    }

    // Update the profiles table
    const profileUpdate: Record<string, string | null> = {
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone || null,
    }

    // Only patients get address + DOB editable
    if (currentProfile.role === 'patient') {
      profileUpdate.date_of_birth = data.date_of_birth || null
      profileUpdate.address_line1 = data.address_line1 || null
      profileUpdate.address_line2 = data.address_line2 || null
      profileUpdate.city = data.city || null
      profileUpdate.state = data.state || null
      profileUpdate.zip_code = data.zip_code || null
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .update(profileUpdate)
      .eq('id', user.id)

    if (profileError) {
      return { success: false, error: 'Failed to update profile.' }
    }

    // Update patient-specific fields (emergency contact)
    if (currentProfile.role === 'patient') {
      const { data: existingPatient } = await supabase
        .from('patient_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      const patientUpdate = {
        emergency_contact_name: data.emergency_contact_name || null,
        emergency_contact_phone: data.emergency_contact_phone || null,
        emergency_contact_relationship: data.emergency_contact_relationship || null,
      }

      if (existingPatient) {
        await supabase
          .from('patient_profiles')
          .update(patientUpdate)
          .eq('user_id', user.id)
      }
    }

    // Update physician-specific fields (bio)
    if (currentProfile.role === 'physician' && data.bio !== undefined) {
      const { data: existingPhysician } = await supabase
        .from('physician_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (existingPhysician) {
        await supabase
          .from('physician_profiles')
          .update({ bio: data.bio || null })
          .eq('user_id', user.id)
      }
    }

    return { success: true, data: { updated: true } }
  } catch {
    return { success: false, error: 'An unexpected error occurred while saving your profile.' }
  }
}

// ============================================
// changePassword — password change via Supabase Auth
// ============================================

export async function changePassword(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
): Promise<ActionResult<{ changed: true }>> {
  try {
    const parsed = passwordChangeSchema.safeParse({
      current_password: currentPassword,
      new_password: newPassword,
      confirm_password: confirmPassword,
    })

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

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || !user.email) {
      return { success: false, error: 'Not authenticated.' }
    }

    // Verify current password by attempting sign-in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    })

    if (signInError) {
      return {
        success: false,
        error: 'Current password is incorrect.',
        fieldErrors: { current_password: 'Current password is incorrect' },
      }
    }

    // Update to new password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (updateError) {
      return { success: false, error: 'Failed to update password. Please try again.' }
    }

    return { success: true, data: { changed: true } }
  } catch {
    return { success: false, error: 'An unexpected error occurred.' }
  }
}
