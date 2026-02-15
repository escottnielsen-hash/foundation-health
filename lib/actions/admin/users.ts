'use server'

import { createClient } from '@/lib/supabase/server'
import { userSearchFilterSchema, userIdSchema } from '@/lib/validations/admin-users'
import type { UserListItem, UserDetail, UserActivitySummary } from '@/types/settings'
import type { Profile } from '@/types/database'
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
}

type ActionResult<T> = ActionSuccess<T> | ActionError

// ============================================
// Helper: verify admin role
// ============================================

async function verifyAdmin(): Promise<{ userId: string } | ActionError> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated.' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return { success: false, error: 'Access denied. Admin role required.' }
  }

  return { userId: user.id }
}

// ============================================
// getUsers — list users with pagination, search, role filter
// ============================================

export interface UsersListResult {
  users: UserListItem[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export async function getUsers(
  filters: Record<string, unknown> = {}
): Promise<ActionResult<UsersListResult>> {
  try {
    const adminCheck = await verifyAdmin()
    if ('success' in adminCheck) return adminCheck

    const parsed = userSearchFilterSchema.safeParse(filters)
    if (!parsed.success) {
      return { success: false, error: 'Invalid filter parameters.' }
    }

    const { search, role, page, per_page } = parsed.data
    const offset = (page - 1) * per_page

    const supabase = await createClient()

    let query = supabase
      .from('profiles')
      .select('id, email, first_name, last_name, phone, role, avatar_url, email_verified, onboarding_completed, last_login_at, created_at, updated_at', { count: 'exact' })

    // Apply search filter
    if (search) {
      query = query.or(`email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`)
    }

    // Apply role filter
    if (role) {
      query = query.eq('role', role)
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + per_page - 1)

    const { data: users, error, count } = await query

    if (error) {
      return { success: false, error: 'Failed to load users.' }
    }

    const total = count ?? 0

    return {
      success: true,
      data: {
        users: (users ?? []) as UserListItem[],
        total,
        page,
        per_page,
        total_pages: Math.ceil(total / per_page),
      },
    }
  } catch {
    return { success: false, error: 'An unexpected error occurred.' }
  }
}

// ============================================
// getUserById — single user detail
// ============================================

export interface UserDetailResult {
  user: UserDetail
  activity: UserActivitySummary
}

export async function getUserById(
  userId: string
): Promise<ActionResult<UserDetailResult>> {
  try {
    const adminCheck = await verifyAdmin()
    if ('success' in adminCheck) return adminCheck

    const idParsed = userIdSchema.safeParse({ id: userId })
    if (!idParsed.success) {
      const issue = (idParsed.error as ZodError).issues[0]
      return { success: false, error: issue?.message ?? 'Invalid user ID.' }
    }

    const supabase = await createClient()

    const { data: user, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error || !user) {
      return { success: false, error: 'User not found.' }
    }

    const profile = user as Profile

    const activity = await getUserActivitySummary(userId)

    return {
      success: true,
      data: {
        user: {
          id: profile.id,
          email: profile.email,
          first_name: profile.first_name ?? null,
          last_name: profile.last_name ?? null,
          phone: profile.phone ?? null,
          role: profile.role,
          avatar_url: profile.avatar_url ?? null,
          email_verified: profile.email_verified,
          onboarding_completed: profile.onboarding_completed,
          last_login_at: profile.last_login_at ?? null,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
          date_of_birth: profile.date_of_birth ?? null,
          address_line1: profile.address_line1 ?? null,
          address_line2: profile.address_line2 ?? null,
          city: profile.city ?? null,
          state: profile.state ?? null,
          zip_code: profile.zip_code ?? null,
          country: profile.country ?? null,
          timezone: profile.timezone ?? null,
          two_factor_enabled: profile.two_factor_enabled,
          phone_verified: profile.phone_verified,
        },
        activity: activity,
      },
    }
  } catch {
    return { success: false, error: 'An unexpected error occurred.' }
  }
}

// ============================================
// getUserActivitySummary — activity counts
// ============================================

async function getUserActivitySummary(
  userId: string
): Promise<UserActivitySummary> {
  const supabase = await createClient()

  // Fetch profile for last_login_at
  const { data: profile } = await supabase
    .from('profiles')
    .select('last_login_at')
    .eq('id', userId)
    .single()

  // Get patient profile id if exists
  const { data: patientProfile } = await supabase
    .from('patient_profiles')
    .select('id')
    .eq('user_id', userId)
    .single()

  let totalAppointments = 0
  let totalEncounters = 0
  let totalClaims = 0
  let totalInvoices = 0

  if (patientProfile) {
    const patientId = patientProfile.id

    const { count: appointmentCount } = await supabase
      .from('appointments')
      .select('id', { count: 'exact', head: true })
      .eq('patient_id', patientId)
    totalAppointments = appointmentCount ?? 0

    const { count: encounterCount } = await supabase
      .from('encounters')
      .select('id', { count: 'exact', head: true })
      .eq('patient_id', patientId)
    totalEncounters = encounterCount ?? 0

    const { count: claimCount } = await supabase
      .from('insurance_claims')
      .select('id', { count: 'exact', head: true })
      .eq('patient_id', patientId)
    totalClaims = claimCount ?? 0

    const { count: invoiceCount } = await supabase
      .from('invoices')
      .select('id', { count: 'exact', head: true })
      .eq('patient_id', patientId)
    totalInvoices = invoiceCount ?? 0
  }

  // Also check physician appointments
  const { data: physicianProfile } = await supabase
    .from('physician_profiles')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (physicianProfile) {
    const { count: physApptCount } = await supabase
      .from('appointments')
      .select('id', { count: 'exact', head: true })
      .eq('physician_id', physicianProfile.id)
    totalAppointments += (physApptCount ?? 0)

    const { count: physEncCount } = await supabase
      .from('encounters')
      .select('id', { count: 'exact', head: true })
      .eq('physician_id', physicianProfile.id)
    totalEncounters += (physEncCount ?? 0)
  }

  return {
    total_appointments: totalAppointments,
    total_encounters: totalEncounters,
    total_claims: totalClaims,
    total_invoices: totalInvoices,
    last_login_at: profile?.last_login_at ?? null,
  }
}
