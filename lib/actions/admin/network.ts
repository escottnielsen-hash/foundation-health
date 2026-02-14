'use server'

import { createClient } from '@/lib/supabase/server'
import type { LocationType } from '@/types/database'
import type {
  NetworkNode,
  NetworkOverview,
  NetworkStatus,
  NetworkStats,
  LocationAppointmentStat,
  PatientVolumeTrendPoint,
  RevenueByLocation,
  ProviderUtilizationStat,
  DateRange,
} from '@/types/network'

// ============================================
// Helper: determine node health status
// ============================================

function deriveStatus(
  activeProviders: number,
  todayAppointments: number
): NetworkStatus {
  if (activeProviders === 0) return 'critical'
  if (todayAppointments === 0 && activeProviders > 0) return 'warning'
  return 'healthy'
}

// ============================================
// getNetworkOverview
// All locations with provider count, today's
// appointment count, and derived status.
// ============================================

export async function getNetworkOverview(): Promise<NetworkOverview> {
  const supabase = await createClient()

  // Fetch all active locations
  const { data: locations } = await supabase
    .from('locations')
    .select('id, name, location_type, is_critical_access, city, state, latitude, longitude')
    .eq('is_active', true)
    .order('location_type', { ascending: true })

  if (!locations || locations.length === 0) {
    return {
      hub: null,
      spokes: [],
      totalProviders: 0,
      totalAppointmentsToday: 0,
      networkUtilization: 0,
    }
  }

  // Build today range
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)

  // Fetch provider counts per location
  const { data: providerLocations } = await supabase
    .from('provider_locations')
    .select('location_id, physician_id')

  // Fetch today's appointments per location
  const { data: todayAppointments } = await supabase
    .from('appointments')
    .select('id, location_id')
    .gte('scheduled_start', todayStart.toISOString())
    .lte('scheduled_start', todayEnd.toISOString())
    .in('status', ['scheduled', 'confirmed', 'in_progress', 'completed'])

  // Count providers per location
  const providerCountMap = new Map<string, number>()
  if (providerLocations) {
    for (const pl of providerLocations) {
      if (pl.location_id) {
        providerCountMap.set(
          pl.location_id,
          (providerCountMap.get(pl.location_id) ?? 0) + 1
        )
      }
    }
  }

  // Count appointments per location
  const appointmentCountMap = new Map<string, number>()
  if (todayAppointments) {
    for (const apt of todayAppointments) {
      if (apt.location_id) {
        appointmentCountMap.set(
          apt.location_id,
          (appointmentCountMap.get(apt.location_id) ?? 0) + 1
        )
      }
    }
  }

  // Build nodes
  const nodes: NetworkNode[] = locations.map((loc) => {
    const activeProviders = providerCountMap.get(loc.id) ?? 0
    const todayAppts = appointmentCountMap.get(loc.id) ?? 0
    return {
      id: loc.id,
      name: loc.name,
      locationType: loc.location_type as LocationType,
      isCriticalAccess: loc.is_critical_access ?? false,
      city: loc.city ?? null,
      state: loc.state ?? null,
      activeProviderCount: activeProviders,
      todayAppointmentCount: todayAppts,
      status: deriveStatus(activeProviders, todayAppts),
      latitude: loc.latitude ?? null,
      longitude: loc.longitude ?? null,
    }
  })

  const hub = nodes.find((n) => n.locationType === 'hub') ?? null
  const spokes = nodes.filter((n) => n.locationType === 'spoke')

  const totalProviders = nodes.reduce((sum, n) => sum + n.activeProviderCount, 0)
  const totalAppointmentsToday = nodes.reduce((sum, n) => sum + n.todayAppointmentCount, 0)

  // Utilization: percentage of providers that have at least one appointment today
  // We approximate as: appointments / (providers * 8 slots) * 100
  const maxSlots = totalProviders * 8
  const networkUtilization = maxSlots > 0
    ? Math.min(100, Math.round((totalAppointmentsToday / maxSlots) * 100))
    : 0

  return {
    hub,
    spokes,
    totalProviders,
    totalAppointmentsToday,
    networkUtilization,
  }
}

// ============================================
// getNetworkStats — aggregate all chart data
// ============================================

export async function getNetworkStats(dateRange: DateRange): Promise<NetworkStats> {
  const [
    appointmentsByLocation,
    patientVolumeTrends,
    revenueByLocation,
    providerUtilization,
  ] = await Promise.all([
    getLocationAppointmentStats(dateRange),
    getPatientVolumeTrends(dateRange),
    getRevenueByLocation(dateRange),
    getProviderUtilization(dateRange),
  ])

  return {
    appointmentsByLocation,
    patientVolumeTrends,
    revenueByLocation,
    providerUtilization,
  }
}

// ============================================
// getLocationAppointmentStats
// ============================================

export async function getLocationAppointmentStats(
  dateRange: DateRange
): Promise<LocationAppointmentStat[]> {
  const supabase = await createClient()

  const { data: locations } = await supabase
    .from('locations')
    .select('id, name, location_type')
    .eq('is_active', true)

  const { data: appointments } = await supabase
    .from('appointments')
    .select('id, location_id')
    .gte('scheduled_start', dateRange.from)
    .lte('scheduled_start', dateRange.to)
    .in('status', ['scheduled', 'confirmed', 'in_progress', 'completed'])

  const countMap = new Map<string, number>()
  if (appointments) {
    for (const apt of appointments) {
      if (apt.location_id) {
        countMap.set(apt.location_id, (countMap.get(apt.location_id) ?? 0) + 1)
      }
    }
  }

  return (locations ?? []).map((loc) => ({
    locationId: loc.id,
    locationName: loc.name,
    locationType: loc.location_type as LocationType,
    appointmentCount: countMap.get(loc.id) ?? 0,
  }))
}

// ============================================
// getPatientVolumeTrends
// Daily appointment counts per location
// ============================================

async function getPatientVolumeTrends(
  dateRange: DateRange
): Promise<PatientVolumeTrendPoint[]> {
  const supabase = await createClient()

  const { data: locations } = await supabase
    .from('locations')
    .select('id, name')
    .eq('is_active', true)

  const { data: appointments } = await supabase
    .from('appointments')
    .select('id, location_id, scheduled_start')
    .gte('scheduled_start', dateRange.from)
    .lte('scheduled_start', dateRange.to)
    .in('status', ['scheduled', 'confirmed', 'in_progress', 'completed'])
    .order('scheduled_start', { ascending: true })

  if (!locations || !appointments) return []

  // Build a map of location_id -> name
  const locationNameMap = new Map<string, string>()
  for (const loc of locations) {
    locationNameMap.set(loc.id, loc.name)
  }

  // Group by date + location
  const dateLocationMap = new Map<string, Map<string, number>>()
  for (const apt of appointments) {
    if (!apt.location_id || !apt.scheduled_start) continue
    const dateKey = apt.scheduled_start.split('T')[0]
    if (!dateLocationMap.has(dateKey)) {
      dateLocationMap.set(dateKey, new Map())
    }
    const locMap = dateLocationMap.get(dateKey)!
    const locName = locationNameMap.get(apt.location_id) ?? 'Unknown'
    locMap.set(locName, (locMap.get(locName) ?? 0) + 1)
  }

  // Generate all dates in range so chart has no gaps
  const allDates: string[] = []
  const current = new Date(dateRange.from)
  const end = new Date(dateRange.to)
  while (current <= end) {
    allDates.push(current.toISOString().split('T')[0])
    current.setDate(current.getDate() + 1)
  }

  const locationNames = locations.map((l) => l.name)

  return allDates.map((date) => {
    const locMap = dateLocationMap.get(date)
    const point: PatientVolumeTrendPoint = { date }
    for (const name of locationNames) {
      point[name] = locMap?.get(name) ?? 0
    }
    return point
  })
}

// ============================================
// getRevenueByLocation
// ============================================

export async function getRevenueByLocation(
  dateRange: DateRange
): Promise<RevenueByLocation[]> {
  const supabase = await createClient()

  const { data: locations } = await supabase
    .from('locations')
    .select('id, name, location_type')
    .eq('is_active', true)

  // Invoices are tied to encounters which have location_id
  const { data: encounters } = await supabase
    .from('encounters')
    .select('id, location_id')
    .gte('created_at', dateRange.from)
    .lte('created_at', dateRange.to)

  const encounterLocationMap = new Map<string, string>()
  if (encounters) {
    for (const enc of encounters) {
      if (enc.location_id) {
        encounterLocationMap.set(enc.id, enc.location_id)
      }
    }
  }

  const encounterIds = encounters?.map((e) => e.id) ?? []

  let invoices: Array<{ encounter_id: string | null; total: number }> = []
  if (encounterIds.length > 0) {
    const { data } = await supabase
      .from('invoices')
      .select('encounter_id, total')
      .in('encounter_id', encounterIds)
      .in('status', ['paid', 'partially_paid'])

    invoices = data ?? []
  }

  // Sum revenue per location
  const revenueMap = new Map<string, number>()
  for (const inv of invoices) {
    if (inv.encounter_id) {
      const locId = encounterLocationMap.get(inv.encounter_id)
      if (locId) {
        revenueMap.set(locId, (revenueMap.get(locId) ?? 0) + Math.round(inv.total * 100))
      }
    }
  }

  return (locations ?? []).map((loc) => ({
    locationId: loc.id,
    locationName: loc.name,
    locationType: loc.location_type as LocationType,
    totalRevenueCents: revenueMap.get(loc.id) ?? 0,
  }))
}

// ============================================
// getProviderUtilization
// ============================================

export async function getProviderUtilization(
  dateRange: DateRange
): Promise<ProviderUtilizationStat[]> {
  const supabase = await createClient()

  const { data: locations } = await supabase
    .from('locations')
    .select('id, name, location_type')
    .eq('is_active', true)

  // All providers per location
  const { data: providerLocations } = await supabase
    .from('provider_locations')
    .select('location_id, physician_id')

  // Appointments in range — get distinct physicians who had appointments
  const { data: appointments } = await supabase
    .from('appointments')
    .select('physician_id, location_id')
    .gte('scheduled_start', dateRange.from)
    .lte('scheduled_start', dateRange.to)
    .in('status', ['scheduled', 'confirmed', 'in_progress', 'completed'])

  // Total providers per location
  const totalProvidersMap = new Map<string, Set<string>>()
  if (providerLocations) {
    for (const pl of providerLocations) {
      if (!pl.location_id) continue
      if (!totalProvidersMap.has(pl.location_id)) {
        totalProvidersMap.set(pl.location_id, new Set())
      }
      totalProvidersMap.get(pl.location_id)!.add(pl.physician_id)
    }
  }

  // Active providers (had at least one appointment in range) per location
  const activeProvidersMap = new Map<string, Set<string>>()
  if (appointments) {
    for (const apt of appointments) {
      if (!apt.location_id) continue
      if (!activeProvidersMap.has(apt.location_id)) {
        activeProvidersMap.set(apt.location_id, new Set())
      }
      activeProvidersMap.get(apt.location_id)!.add(apt.physician_id)
    }
  }

  return (locations ?? []).map((loc) => {
    const total = totalProvidersMap.get(loc.id)?.size ?? 0
    const active = activeProvidersMap.get(loc.id)?.size ?? 0
    return {
      locationId: loc.id,
      locationName: loc.name,
      locationType: loc.location_type as LocationType,
      totalProviders: total,
      activeProviders: active,
      utilizationPercent: total > 0 ? Math.round((active / total) * 100) : 0,
    }
  })
}
