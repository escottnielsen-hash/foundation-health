'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { ZodError } from 'zod'
import {
  locationFormSchema,
  generateSlug,
  type LocationFormData,
} from '@/lib/validations/admin/locations'
import type { Location, Json } from '@/types/database'

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
// Auth helper — verify admin role
// ============================================

async function requireAdmin(): Promise<{ userId: string; practiceId: string | null }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role
  if (role !== 'admin' && role !== 'staff') {
    redirect('/patient/dashboard')
  }

  // Get associated practice (if any)
  const { data: staff } = await supabase
    .from('practice_staff')
    .select('practice_id')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .limit(1)
    .single()

  return { userId: user.id, practiceId: staff?.practice_id ?? null }
}

// ============================================
// getAdminLocations — all locations including inactive
// ============================================

export async function getAdminLocations(): Promise<ActionResult<Location[]>> {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      return { success: false, error: 'Could not load locations.' }
    }

    return { success: true, data: (data ?? []) as Location[] }
  } catch {
    return { success: false, error: 'An unexpected error occurred.' }
  }
}

// ============================================
// getAdminLocationById — full location for editing
// ============================================

export async function getAdminLocationById(
  locationId: string
): Promise<ActionResult<Location>> {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('id', locationId)
      .single()

    if (error || !data) {
      return { success: false, error: 'Location not found.' }
    }

    return { success: true, data: data as Location }
  } catch {
    return { success: false, error: 'An unexpected error occurred.' }
  }
}

// ============================================
// updateLocation — update with Zod validation
// ============================================

export async function updateLocation(
  locationId: string,
  formData: LocationFormData
): Promise<ActionResult<Location>> {
  try {
    await requireAdmin()

    const parseResult = locationFormSchema.safeParse(formData)
    if (!parseResult.success) {
      const firstIssue = (parseResult.error as ZodError).issues[0]
      return {
        success: false,
        error: firstIssue?.message ?? 'Validation failed.',
      }
    }

    const validated = parseResult.data
    const slug = validated.slug || generateSlug(validated.name)

    const supabase = await createClient()

    const updatePayload: Record<string, unknown> = {
      name: validated.name,
      slug,
      location_type: validated.location_type,
      description: validated.description || null,
      tagline: validated.tagline || null,
      address_line1: validated.address_line1 || null,
      address_line2: validated.address_line2 || null,
      city: validated.city || null,
      state: validated.state || null,
      zip_code: validated.zip_code || null,
      county: validated.county || null,
      country: validated.country || null,
      phone: validated.phone || null,
      fax: validated.fax || null,
      email: validated.email || null,
      latitude: validated.latitude ?? null,
      longitude: validated.longitude ?? null,
      travel_info: validated.travel_info || null,
      accommodation_info: validated.accommodation_info || null,
      concierge_info: validated.concierge_info || null,
      amenities: (validated.amenities ?? []) as unknown as Json,
      operating_hours: (validated.operating_hours ?? []) as unknown as Json,
      is_active: validated.is_active,
      is_critical_access: validated.is_critical_access ?? false,
      npi: validated.npi || null,
      timezone: validated.timezone || null,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('locations')
      .update(updatePayload)
      .eq('id', locationId)
      .select()
      .single()

    if (error) {
      return { success: false, error: 'Failed to update location.' }
    }

    revalidatePath('/admin/locations')
    revalidatePath(`/admin/locations/${locationId}`)

    return { success: true, data: data as Location }
  } catch {
    return { success: false, error: 'An unexpected error occurred.' }
  }
}

// ============================================
// createLocation — create new location
// ============================================

export async function createLocation(
  formData: LocationFormData
): Promise<ActionResult<Location>> {
  try {
    const { practiceId } = await requireAdmin()

    const parseResult = locationFormSchema.safeParse(formData)
    if (!parseResult.success) {
      const firstIssue = (parseResult.error as ZodError).issues[0]
      return {
        success: false,
        error: firstIssue?.message ?? 'Validation failed.',
      }
    }

    const validated = parseResult.data
    const slug = validated.slug || generateSlug(validated.name)

    const supabase = await createClient()

    // If no practiceId from staff, try to get a default practice
    let resolvedPracticeId = practiceId
    if (!resolvedPracticeId) {
      const { data: practice } = await supabase
        .from('practices')
        .select('id')
        .eq('is_active', true)
        .limit(1)
        .single()

      resolvedPracticeId = practice?.id ?? null
    }

    if (!resolvedPracticeId) {
      return { success: false, error: 'No practice found. Cannot create location.' }
    }

    const insertPayload: Record<string, unknown> = {
      practice_id: resolvedPracticeId,
      name: validated.name,
      slug,
      location_type: validated.location_type,
      description: validated.description || null,
      tagline: validated.tagline || null,
      address_line1: validated.address_line1 || null,
      address_line2: validated.address_line2 || null,
      city: validated.city || null,
      state: validated.state || null,
      zip_code: validated.zip_code || null,
      county: validated.county || null,
      country: validated.country || null,
      phone: validated.phone || null,
      fax: validated.fax || null,
      email: validated.email || null,
      latitude: validated.latitude ?? null,
      longitude: validated.longitude ?? null,
      travel_info: validated.travel_info || null,
      accommodation_info: validated.accommodation_info || null,
      concierge_info: validated.concierge_info || null,
      amenities: (validated.amenities ?? []) as unknown as Json,
      operating_hours: (validated.operating_hours ?? []) as unknown as Json,
      is_active: validated.is_active,
      is_critical_access: validated.is_critical_access ?? false,
      npi: validated.npi || null,
      timezone: validated.timezone || null,
    }

    const { data, error } = await supabase
      .from('locations')
      .insert(insertPayload)
      .select()
      .single()

    if (error) {
      return { success: false, error: 'Failed to create location.' }
    }

    revalidatePath('/admin/locations')

    return { success: true, data: data as Location }
  } catch {
    return { success: false, error: 'An unexpected error occurred.' }
  }
}

// ============================================
// toggleLocationActive — toggle is_active
// ============================================

export async function toggleLocationActive(
  locationId: string
): Promise<ActionResult<Location>> {
  try {
    await requireAdmin()
    const supabase = await createClient()

    // Fetch current state
    const { data: current, error: fetchError } = await supabase
      .from('locations')
      .select('is_active')
      .eq('id', locationId)
      .single()

    if (fetchError || !current) {
      return { success: false, error: 'Location not found.' }
    }

    const { data, error } = await supabase
      .from('locations')
      .update({
        is_active: !current.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', locationId)
      .select()
      .single()

    if (error) {
      return { success: false, error: 'Failed to update location status.' }
    }

    revalidatePath('/admin/locations')

    return { success: true, data: data as Location }
  } catch {
    return { success: false, error: 'An unexpected error occurred.' }
  }
}

// ============================================
// getAdminDashboardStats — aggregate stats
// ============================================

export interface AdminDashboardStats {
  totalLocations: number
  activeLocations: number
  activeProviders: number
  totalPatients: number
  appointmentsToday: number
}

export async function getAdminDashboardStats(): Promise<ActionResult<AdminDashboardStats>> {
  try {
    await requireAdmin()
    const supabase = await createClient()

    // Total locations
    const { count: totalLocations } = await supabase
      .from('locations')
      .select('id', { count: 'exact', head: true })

    // Active locations
    const { count: activeLocations } = await supabase
      .from('locations')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true)

    // Active providers
    const { count: activeProviders } = await supabase
      .from('physician_profiles')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true)

    // Total patients
    const { count: totalPatients } = await supabase
      .from('patient_profiles')
      .select('id', { count: 'exact', head: true })

    // Appointments today
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    const { count: appointmentsToday } = await supabase
      .from('appointments')
      .select('id', { count: 'exact', head: true })
      .gte('scheduled_start', todayStart.toISOString())
      .lte('scheduled_start', todayEnd.toISOString())
      .in('status', ['scheduled', 'confirmed', 'in_progress'])

    return {
      success: true,
      data: {
        totalLocations: totalLocations ?? 0,
        activeLocations: activeLocations ?? 0,
        activeProviders: activeProviders ?? 0,
        totalPatients: totalPatients ?? 0,
        appointmentsToday: appointmentsToday ?? 0,
      },
    }
  } catch {
    return { success: false, error: 'An unexpected error occurred.' }
  }
}

// ============================================
// getLocationProviderCount — providers per location
// ============================================

export async function getLocationProviderCounts(): Promise<
  ActionResult<Record<string, number>>
> {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('provider_locations')
      .select('location_id')

    if (error) {
      return { success: false, error: 'Could not load provider counts.' }
    }

    const counts: Record<string, number> = {}
    for (const row of data ?? []) {
      const locId = row.location_id
      counts[locId] = (counts[locId] ?? 0) + 1
    }

    return { success: true, data: counts }
  } catch {
    return { success: false, error: 'An unexpected error occurred.' }
  }
}
