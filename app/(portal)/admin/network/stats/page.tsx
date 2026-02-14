import Link from 'next/link'
import { Suspense } from 'react'
import { getNetworkStats, getNetworkOverview } from '@/lib/actions/admin/network'
import {
  AppointmentsByLocationChart,
  PatientVolumeTrendsChart,
  RevenueByLocationChart,
  ProviderUtilizationChart,
} from '@/components/admin/network/network-charts'
import { DateRangeFilter, parseDateRangeFromParams } from '@/components/admin/network/date-range-filter'
import { NetworkSummary } from '@/components/admin/network/network-summary'
import type { DateRangePreset } from '@/types/network'

export const metadata = {
  title: 'Network Analytics | Foundation Health',
  description: 'Network performance analytics and charts',
}

interface StatsPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function NetworkStatsPage({ searchParams }: StatsPageProps) {
  const resolvedParams = await searchParams

  // Build URLSearchParams from resolved searchParams
  const urlParams = new URLSearchParams()
  for (const [key, value] of Object.entries(resolvedParams)) {
    if (typeof value === 'string') {
      urlParams.set(key, value)
    }
  }

  const dateRange = parseDateRangeFromParams(urlParams)

  const [stats, overview] = await Promise.all([
    getNetworkStats(dateRange),
    getNetworkOverview(),
  ])

  const totalLocations = (overview.hub ? 1 : 0) + overview.spokes.length

  // Extract location names for the line chart
  const locationNames = stats.appointmentsByLocation.map((l) => l.locationName)

  // Date range label for display
  const rangeLabels: Record<DateRangePreset, string> = {
    today: 'Today',
    '7d': 'Last 7 Days',
    '30d': 'Last 30 Days',
    '90d': 'Last 90 Days',
    custom: 'Custom Range',
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/network"
              className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Network
            </Link>
          </div>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">Network Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">
            Performance metrics across all locations &mdash; {rangeLabels[dateRange.preset]}
          </p>
        </div>
      </div>

      {/* Date range filter */}
      <Suspense fallback={<div className="h-10 w-80 animate-pulse rounded-lg bg-gray-200" />}>
        <DateRangeFilter />
      </Suspense>

      {/* Network summary */}
      <NetworkSummary
        totalAppointmentsToday={overview.totalAppointmentsToday}
        totalProviders={overview.totalProviders}
        networkUtilization={overview.networkUtilization}
        locationCount={totalLocations}
      />

      {/* Charts grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <AppointmentsByLocationChart data={stats.appointmentsByLocation} />
        <RevenueByLocationChart data={stats.revenueByLocation} />
      </div>

      {/* Full-width line chart */}
      <PatientVolumeTrendsChart
        data={stats.patientVolumeTrends}
        locationNames={locationNames}
      />

      {/* Provider utilization */}
      <ProviderUtilizationChart data={stats.providerUtilization} />
    </div>
  )
}

// ============================================
// Inline SVG Icon
// ============================================

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  )
}
