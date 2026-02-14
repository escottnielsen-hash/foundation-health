import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import {
  getRevenueOverview,
  getRevenueByLocation,
  getRevenueTimeSeries,
  getMembershipRevenue,
} from '@/lib/actions/admin/revenue'
import { RevenueKpiCards } from '@/components/admin/revenue/revenue-kpi-cards'
import { RevenueByLocation } from '@/components/admin/revenue/revenue-by-location'
import { RevenueTimeSeries } from '@/components/admin/revenue/revenue-time-series'
import { MembershipBreakdown } from '@/components/admin/revenue/membership-breakdown'
import { elementId } from '@/lib/utils/element-ids'

// ============================================
// Revenue Dashboard Page (Server Component)
// ============================================

export default async function RevenueOverviewPage() {
  const [overview, locationRevenue, timeSeries, membershipData] =
    await Promise.all([
      getRevenueOverview(),
      getRevenueByLocation(),
      getRevenueTimeSeries('monthly'),
      getMembershipRevenue(),
    ])

  return (
    <div className="space-y-6" id={elementId('admin', 'revenue', 'page')}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Revenue Overview
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Track total revenue, membership income, and per-location financial
            performance.
          </p>
        </div>
        <Link
          href="/admin/revenue/claims"
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
        >
          Claims Analytics
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* KPI Cards */}
      <RevenueKpiCards overview={overview} />

      {/* Revenue Over Time */}
      <RevenueTimeSeries data={timeSeries} />

      {/* Revenue by Location + Membership Breakdown */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueByLocation data={locationRevenue} />
        <MembershipBreakdown data={membershipData} />
      </div>
    </div>
  )
}
