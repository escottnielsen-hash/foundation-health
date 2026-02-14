import Link from 'next/link'
import { getNetworkOverview } from '@/lib/actions/admin/network'
import { HubSpokeDiagram } from '@/components/admin/network/hub-spoke-diagram'
import { NetworkSummary } from '@/components/admin/network/network-summary'
import { Badge } from '@/components/ui/badge'

export const metadata = {
  title: 'Network Overview | Foundation Health',
  description: 'Hub-spoke network visualization and health dashboard',
}

export default async function NetworkOverviewPage() {
  const overview = await getNetworkOverview()

  const totalLocations = (overview.hub ? 1 : 0) + overview.spokes.length

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Network Overview</h1>
          <p className="mt-1 text-sm text-gray-500">
            Foundation Health hub-and-spoke practice network
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/network/stats"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
          >
            <ChartIcon className="h-4 w-4" />
            Network Analytics
          </Link>
        </div>
      </div>

      {/* Summary stats */}
      <NetworkSummary
        totalAppointmentsToday={overview.totalAppointmentsToday}
        totalProviders={overview.totalProviders}
        networkUtilization={overview.networkUtilization}
        locationCount={totalLocations}
      />

      {/* Hub-Spoke Diagram */}
      <div className="rounded-xl border border-gray-200 bg-gradient-to-b from-gray-50/80 to-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Practice Network</h2>
            <p className="text-sm text-gray-500">
              Click on a location to view details
            </p>
          </div>
          <div className="hidden items-center gap-4 sm:flex">
            <StatusLegend />
          </div>
        </div>
        <HubSpokeDiagram hub={overview.hub} spokes={overview.spokes} />
        {/* Mobile legend */}
        <div className="mt-6 flex items-center justify-center gap-4 sm:hidden">
          <StatusLegend />
        </div>
      </div>

      {/* Location cards — quick reference grid */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">All Locations</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {overview.hub && (
            <LocationQuickCard
              node={overview.hub}
              isHub
            />
          )}
          {overview.spokes.map((spoke) => (
            <LocationQuickCard
              key={spoke.id}
              node={spoke}
              isHub={false}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================
// Status Legend
// ============================================

function StatusLegend() {
  return (
    <>
      <div className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
        <span className="text-xs text-gray-500">Healthy</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
        <span className="text-xs text-gray-500">Warning</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <span className="text-xs text-gray-500">Critical</span>
      </div>
    </>
  )
}

// ============================================
// Location Quick Card
// ============================================

import type { NetworkNode } from '@/types/network'

function LocationQuickCard({
  node,
  isHub,
}: {
  node: NetworkNode
  isHub: boolean
}) {
  const statusColors = {
    healthy: 'border-l-emerald-400',
    warning: 'border-l-amber-400',
    critical: 'border-l-red-400',
  }

  return (
    <Link
      href={`/admin/network/${node.id}`}
      className="group block rounded-xl border border-gray-200 border-l-4 bg-white p-4 shadow-sm transition-all hover:shadow-md"
      style={{
        borderLeftColor:
          node.status === 'healthy'
            ? '#34d399'
            : node.status === 'warning'
              ? '#fbbf24'
              : '#f87171',
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
            {node.name}
          </h3>
          {node.city && node.state && (
            <p className="mt-0.5 text-xs text-gray-500">
              {node.city}, {node.state}
            </p>
          )}
        </div>
        <Badge variant={isHub ? 'success' : 'outline'} className="shrink-0">
          {isHub ? 'Hub' : 'Spoke'}
        </Badge>
      </div>

      <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
        <div>
          <span className="font-semibold text-gray-900">{node.activeProviderCount}</span>{' '}
          providers
        </div>
        <div>
          <span className="font-semibold text-gray-900">{node.todayAppointmentCount}</span>{' '}
          appts today
        </div>
      </div>

      {isHub && node.isCriticalAccess && (
        <div className="mt-2">
          <Badge variant="warning" className="text-xs">
            Critical Access Hospital
          </Badge>
        </div>
      )}
    </Link>
  )
}

// ============================================
// Inline SVG Icon
// ============================================

function ChartIcon({ className }: { className?: string }) {
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
      <line x1="18" x2="18" y1="20" y2="10" />
      <line x1="12" x2="12" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="14" />
    </svg>
  )
}
