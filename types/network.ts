import type { LocationType } from '@/types/database'

// ============================================
// Network Node — location + live stats
// ============================================

export type NetworkStatus = 'healthy' | 'warning' | 'critical'

export interface NetworkNode {
  id: string
  name: string
  locationType: LocationType
  isCriticalAccess: boolean
  city: string | null
  state: string | null
  activeProviderCount: number
  todayAppointmentCount: number
  status: NetworkStatus
  latitude: number | null
  longitude: number | null
}

export interface NetworkOverview {
  hub: NetworkNode | null
  spokes: NetworkNode[]
  totalProviders: number
  totalAppointmentsToday: number
  networkUtilization: number
}

// ============================================
// Network Stats — chart data structures
// ============================================

export interface DateRange {
  from: string // ISO date string
  to: string   // ISO date string
  preset: DateRangePreset
}

export type DateRangePreset = 'today' | '7d' | '30d' | '90d' | 'custom'

export interface LocationAppointmentStat {
  locationId: string
  locationName: string
  locationType: LocationType
  appointmentCount: number
}

export interface PatientVolumeTrend {
  date: string
  locationId: string
  locationName: string
  appointmentCount: number
}

export interface PatientVolumeTrendPoint {
  date: string
  [locationName: string]: string | number // dynamic keys for each location
}

export interface RevenueByLocation {
  locationId: string
  locationName: string
  locationType: LocationType
  totalRevenueCents: number
}

export interface ProviderUtilizationStat {
  locationId: string
  locationName: string
  locationType: LocationType
  totalProviders: number
  activeProviders: number
  utilizationPercent: number
}

export interface NetworkStats {
  appointmentsByLocation: LocationAppointmentStat[]
  patientVolumeTrends: PatientVolumeTrendPoint[]
  revenueByLocation: RevenueByLocation[]
  providerUtilization: ProviderUtilizationStat[]
}

// ============================================
// Location color mapping for charts
// ============================================

export const LOCATION_COLORS: Record<string, string> = {
  'Moab Regional Hospital': '#0f766e',   // teal-700  — hub
  'Park City Clinic': '#2563eb',         // blue-600  — spoke
  'Powder Mountain Clinic': '#7c3aed',   // violet-600 — spoke
  'Camas Clinic': '#ea580c',             // orange-600 — spoke
}

export const LOCATION_COLORS_ARRAY = [
  '#0f766e', // teal-700
  '#2563eb', // blue-600
  '#7c3aed', // violet-600
  '#ea580c', // orange-600
  '#059669', // emerald-600
  '#dc2626', // red-600
]
