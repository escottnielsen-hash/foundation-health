'use server'

import { createClient } from '@/lib/supabase/server'
import type { ProviderFilterData } from '@/lib/validations/providers'
import type {
  PhysicianProfile,
  Profile,
  Location,
  ServiceCatalog,
  ProviderLocation,
  ProviderService,
} from '@/types/database'

// ============================================
// Types for joined query results
// ============================================

export interface ProviderWithProfile extends PhysicianProfile {
  profiles: Pick<Profile, 'first_name' | 'last_name' | 'avatar_url' | 'email'> | null
}

export interface ProviderWithLocations extends ProviderWithProfile {
  provider_locations: Array<
    Pick<ProviderLocation, 'id' | 'is_primary' | 'days_available'> & {
      locations: Location | null
    }
  >
}

export interface ProviderWithServices {
  id: string
  physician_id: string
  service_id: string
  is_primary: boolean
  custom_price: number | null
  service_catalog: ServiceCatalog | null
}

export interface ProviderFull extends ProviderWithProfile {
  provider_locations: Array<
    Pick<ProviderLocation, 'id' | 'is_primary' | 'days_available'> & {
      locations: Location | null
    }
  >
  provider_services: Array<
    Pick<ProviderService, 'id' | 'is_primary' | 'custom_price'> & {
      service_catalog: ServiceCatalog | null
    }
  >
}

// ============================================
// getProviders — fetch providers with optional filters
// ============================================

export async function getProviders(
  filters?: ProviderFilterData
): Promise<{ data: ProviderWithLocations[]; error: string | null }> {
  const supabase = await createClient()

  let query = supabase
    .from('physician_profiles')
    .select(`
      *,
      profiles!physician_profiles_user_id_fkey (
        first_name,
        last_name,
        avatar_url,
        email
      ),
      provider_locations (
        id,
        is_primary,
        days_available,
        locations (*)
      )
    `)
    .eq('is_active', true)
    .eq('is_verified', true)

  // Filter by specialty
  if (filters?.specialty) {
    query = query.eq('specialty', filters.specialty)
  }

  // Filter by location (via junction table)
  if (filters?.location_id) {
    query = query.filter(
      'provider_locations.location_id',
      'eq',
      filters.location_id
    )
  }

  // Search by name (first or last name via the joined profiles)
  if (filters?.search) {
    const searchTerm = `%${filters.search}%`
    query = query.or(
      `profiles.first_name.ilike.${searchTerm},profiles.last_name.ilike.${searchTerm}`
    )
  }

  query = query.order('created_at', { ascending: false })

  const { data, error } = await query

  if (error) {
    return { data: [], error: error.message }
  }

  // When filtering by location, only return providers that actually have matches
  let results = (data ?? []) as unknown as ProviderWithLocations[]

  if (filters?.location_id) {
    results = results.filter(
      (p) => p.provider_locations && p.provider_locations.length > 0
    )
  }

  // When searching by name, filter out providers where profiles didn't match
  if (filters?.search) {
    const term = filters.search.toLowerCase()
    results = results.filter((p) => {
      if (!p.profiles) return false
      const first = (p.profiles.first_name ?? '').toLowerCase()
      const last = (p.profiles.last_name ?? '').toLowerCase()
      return first.includes(term) || last.includes(term)
    })
  }

  return { data: results, error: null }
}

// ============================================
// getProviderById — full provider detail
// ============================================

export async function getProviderById(
  providerId: string
): Promise<{ data: ProviderFull | null; error: string | null }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('physician_profiles')
    .select(`
      *,
      profiles!physician_profiles_user_id_fkey (
        first_name,
        last_name,
        avatar_url,
        email
      ),
      provider_locations (
        id,
        is_primary,
        days_available,
        locations (*)
      ),
      provider_services (
        id,
        is_primary,
        custom_price,
        service_catalog (*)
      )
    `)
    .eq('id', providerId)
    .single()

  if (error) {
    return { data: null, error: error.message }
  }

  return { data: data as unknown as ProviderFull, error: null }
}

// ============================================
// getProviderLocations — provider's practice locations
// ============================================

export async function getProviderLocations(
  providerId: string
): Promise<{ data: Location[]; error: string | null }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('provider_locations')
    .select(`
      locations (*)
    `)
    .eq('physician_id', providerId)

  if (error) {
    return { data: [], error: error.message }
  }

  const locations = (data ?? [])
    .map((pl) => (pl as unknown as { locations: Location | null }).locations)
    .filter((l): l is Location => l !== null)

  return { data: locations, error: null }
}

// ============================================
// getProviderServices — services offered by provider
// ============================================

export async function getProviderServices(
  providerId: string
): Promise<{ data: ServiceCatalog[]; error: string | null }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('provider_services')
    .select(`
      service_catalog (*)
    `)
    .eq('physician_id', providerId)

  if (error) {
    return { data: [], error: error.message }
  }

  const services = (data ?? [])
    .map(
      (ps) =>
        (ps as unknown as { service_catalog: ServiceCatalog | null })
          .service_catalog
    )
    .filter((s): s is ServiceCatalog => s !== null)

  return { data: services, error: null }
}

// ============================================
// getSpecialties — distinct list of specialties
// ============================================

export async function getSpecialties(): Promise<{
  data: string[]
  error: string | null
}> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('physician_profiles')
    .select('specialty')
    .eq('is_active', true)
    .eq('is_verified', true)
    .not('specialty', 'is', null)

  if (error) {
    return { data: [], error: error.message }
  }

  const specialties = [
    ...new Set(
      (data ?? [])
        .map((d) => (d as unknown as { specialty: string | null }).specialty)
        .filter((s): s is string => s !== null)
    ),
  ].sort()

  return { data: specialties, error: null }
}

// ============================================
// getLocations — all active locations
// ============================================

export async function getLocations(): Promise<{
  data: Location[]
  error: string | null
}> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true })

  if (error) {
    return { data: [], error: error.message }
  }

  return { data: (data ?? []) as Location[], error: null }
}
