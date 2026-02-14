'use server'

import { createClient } from '@/lib/supabase/server'
import {
  locationFilterSchema,
  locationIdSchema,
  locationSlugSchema,
} from '@/lib/validations/locations'
import type { LocationFilterData } from '@/lib/validations/locations'
import type {
  Location,
  PhysicianProfile,
  Profile,
  ProviderLocation,
  ServiceCatalog,
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
}

type ActionResult<T> = ActionSuccess<T> | ActionError

// ============================================
// Joined types
// ============================================

export interface LocationWithProviderCount extends Location {
  provider_count: number
}

export interface LocationProvider {
  id: string
  is_primary: boolean
  days_available: string[] | null
  physician_profiles: (Pick<
    PhysicianProfile,
    'id' | 'specialty' | 'credentials' | 'years_of_experience' | 'bio' | 'accepting_new_patients'
  > & {
    profiles: Pick<Profile, 'first_name' | 'last_name' | 'avatar_url'> | null
  }) | null
}

export interface LocationServiceItem {
  id: string
  is_available: boolean
  service_catalog: ServiceCatalog | null
}

// ============================================
// getLocations — fetch locations with optional filters
// ============================================

export async function getLocations(
  filters?: LocationFilterData
): Promise<ActionResult<Location[]>> {
  try {
    // Validate filters if provided
    if (filters) {
      const filterResult = locationFilterSchema.safeParse(filters)
      if (!filterResult.success) {
        const firstIssue = (filterResult.error as ZodError).issues[0]
        return {
          success: false,
          error: firstIssue?.message ?? 'Invalid filter parameters.',
        }
      }
    }

    const supabase = await createClient()

    let query = supabase
      .from('locations')
      .select('*')
      .eq('is_active', true)

    // Filter by state
    if (filters?.state && filters.state !== '') {
      query = query.eq('state', filters.state)
    }

    // Filter by type
    if (filters?.type) {
      query = query.eq('location_type', filters.type)
    }

    // Search by name or city
    if (filters?.search && filters.search !== '') {
      const term = `%${filters.search}%`
      query = query.or(`name.ilike.${term},city.ilike.${term}`)
    }

    query = query.order('location_type', { ascending: true }).order('name', { ascending: true })

    const { data, error } = await query

    if (error) {
      return {
        success: false,
        error: 'Could not load locations. Please try again.',
      }
    }

    return { success: true, data: (data ?? []) as Location[] }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred while loading locations.',
    }
  }
}

// ============================================
// getLocationById — full location detail
// ============================================

export async function getLocationById(
  locationId: string
): Promise<ActionResult<Location>> {
  try {
    const idResult = locationIdSchema.safeParse({ id: locationId })
    if (!idResult.success) {
      const firstIssue = (idResult.error as ZodError).issues[0]
      return {
        success: false,
        error: firstIssue?.message ?? 'Invalid location ID.',
      }
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('id', locationId)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      return {
        success: false,
        error: 'Location not found or is no longer available.',
      }
    }

    return { success: true, data: data as Location }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred while loading the location.',
    }
  }
}

// ============================================
// getLocationBySlug — for marketing pages
// ============================================

export async function getLocationBySlug(
  slug: string
): Promise<ActionResult<Location>> {
  try {
    const slugResult = locationSlugSchema.safeParse({ slug })
    if (!slugResult.success) {
      const firstIssue = (slugResult.error as ZodError).issues[0]
      return {
        success: false,
        error: firstIssue?.message ?? 'Invalid location slug.',
      }
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      return {
        success: false,
        error: 'Location not found.',
      }
    }

    return { success: true, data: data as Location }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred while loading the location.',
    }
  }
}

// ============================================
// getLocationProviders — providers at a location
// ============================================

export async function getLocationProviders(
  locationId: string
): Promise<ActionResult<LocationProvider[]>> {
  try {
    const idResult = locationIdSchema.safeParse({ id: locationId })
    if (!idResult.success) {
      const firstIssue = (idResult.error as ZodError).issues[0]
      return {
        success: false,
        error: firstIssue?.message ?? 'Invalid location ID.',
      }
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('provider_locations')
      .select(`
        id,
        is_primary,
        days_available,
        physician_profiles (
          id,
          specialty,
          credentials,
          years_of_experience,
          bio,
          accepting_new_patients,
          profiles!physician_profiles_user_id_fkey (
            first_name,
            last_name,
            avatar_url
          )
        )
      `)
      .eq('location_id', locationId)

    if (error) {
      return {
        success: false,
        error: 'Could not load providers for this location.',
      }
    }

    return { success: true, data: (data ?? []) as unknown as LocationProvider[] }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred while loading providers.',
    }
  }
}

// ============================================
// getLocationServices — services at a location
// ============================================

export async function getLocationServices(
  locationId: string
): Promise<ActionResult<LocationServiceItem[]>> {
  try {
    const idResult = locationIdSchema.safeParse({ id: locationId })
    if (!idResult.success) {
      const firstIssue = (idResult.error as ZodError).issues[0]
      return {
        success: false,
        error: firstIssue?.message ?? 'Invalid location ID.',
      }
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('location_services')
      .select(`
        id,
        is_available,
        service_catalog (*)
      `)
      .eq('location_id', locationId)
      .eq('is_available', true)

    if (error) {
      return {
        success: false,
        error: 'Could not load services for this location.',
      }
    }

    return { success: true, data: (data ?? []) as unknown as LocationServiceItem[] }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred while loading services.',
    }
  }
}

// ============================================
// getLocationStates — distinct states from active locations
// ============================================

export async function getLocationStates(): Promise<ActionResult<string[]>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('locations')
      .select('state')
      .eq('is_active', true)
      .not('state', 'is', null)

    if (error) {
      return {
        success: false,
        error: 'Could not load location states.',
      }
    }

    const states = [
      ...new Set(
        (data ?? [])
          .map((d) => (d as unknown as { state: string | null }).state)
          .filter((s): s is string => s !== null && s !== '')
      ),
    ].sort()

    return { success: true, data: states }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred while loading states.',
    }
  }
}
