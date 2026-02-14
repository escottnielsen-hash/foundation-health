'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import {
  patientRegisterSchema,
  physicianRegisterSchema,
  type PatientRegisterInput,
  type PhysicianRegisterInput,
} from '@/lib/validations/auth'

type ActionResult = {
  success: boolean
  error?: string
  redirectTo?: string
}

async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from Server Component — cookie setting silently ignored
          }
        },
      },
    }
  )
}

export async function registerPatient(
  formData: PatientRegisterInput
): Promise<ActionResult> {
  // Validate input server-side
  const parsed = patientRegisterSchema.safeParse(formData)
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]
    return { success: false, error: firstError.message }
  }

  const { firstName, lastName, email, password, phone } = parsed.data

  const supabase = await createSupabaseServerClient()

  // Step 1: Create auth user — role is set server-side, never from client input
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        role: 'patient',
      },
    },
  })

  if (authError) {
    return { success: false, error: authError.message }
  }

  if (!authData.user) {
    return { success: false, error: 'Failed to create user account' }
  }

  const userId = authData.user.id

  // Step 2: Create profile record
  const { error: profileError } = await supabase.from('profiles').insert({
    id: userId,
    role: 'patient',
    first_name: firstName,
    last_name: lastName,
    email,
    phone: phone || null,
    onboarding_completed: false,
  })

  if (profileError) {
    // Best-effort cleanup: if profile creation fails, the auth user still exists.
    // An admin or background job should reconcile orphaned auth users.
    console.error('[registerPatient] Profile creation failed:', profileError)
    return {
      success: false,
      error: 'Account created but profile setup failed. Please contact support.',
    }
  }

  // Step 3: Create patient-specific profile record
  const { error: patientError } = await supabase
    .from('patient_profiles')
    .insert({
      id: userId,
      hipaa_acknowledged_at: new Date().toISOString(),
    })

  if (patientError) {
    console.error('[registerPatient] Patient profile creation failed:', patientError)
    // Non-fatal — the patient can complete this later during onboarding
  }

  return {
    success: true,
    redirectTo: '/login?message=Check your email to verify your account',
  }
}

export async function registerPhysician(
  formData: PhysicianRegisterInput
): Promise<ActionResult> {
  // Validate input server-side
  const parsed = physicianRegisterSchema.safeParse(formData)
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]
    return { success: false, error: firstError.message }
  }

  const {
    firstName,
    lastName,
    email,
    password,
    phone,
    npi,
    licenseNumber,
    licenseState,
    specialty,
  } = parsed.data

  const supabase = await createSupabaseServerClient()

  // Step 1: Create auth user — role is set server-side, never from client input
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        role: 'physician',
      },
    },
  })

  if (authError) {
    return { success: false, error: authError.message }
  }

  if (!authData.user) {
    return { success: false, error: 'Failed to create user account' }
  }

  const userId = authData.user.id

  // Step 2: Create profile record
  const { error: profileError } = await supabase.from('profiles').insert({
    id: userId,
    role: 'physician',
    first_name: firstName,
    last_name: lastName,
    email,
    phone: phone || null,
    onboarding_completed: false,
  })

  if (profileError) {
    console.error('[registerPhysician] Profile creation failed:', profileError)
    return {
      success: false,
      error: 'Account created but profile setup failed. Please contact support.',
    }
  }

  // Step 3: Create physician-specific profile record
  const { error: physicianError } = await supabase
    .from('physician_profiles')
    .insert({
      id: userId,
      npi_number: npi,
      license_number: licenseNumber,
      license_state: licenseState,
      license_expiry: new Date(
        Date.now() + 365 * 24 * 60 * 60 * 1000
      )
        .toISOString()
        .split('T')[0],
      specialty,
      verification_status: 'pending',
    })

  if (physicianError) {
    console.error(
      '[registerPhysician] Physician profile creation failed:',
      physicianError
    )
    return {
      success: false,
      error: 'Account created but credential setup failed. Please contact support.',
    }
  }

  return {
    success: true,
    redirectTo:
      '/login?message=Check your email to verify your account. Your credentials will be reviewed within 24-48 hours.',
  }
}
