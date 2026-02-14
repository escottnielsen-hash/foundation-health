import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import {
  getClaimsAnalytics,
  getCollectionRateByPayer,
  getArAgingReport,
  getCollectionRateTrend,
} from '@/lib/actions/admin/revenue'
import { ClaimsFunnel } from '@/components/admin/revenue/claims-funnel'
import { PayerPerformanceTable } from '@/components/admin/revenue/payer-performance-table'
import { ArAgingChart } from '@/components/admin/revenue/ar-aging-chart'
import { CollectionRateTrend } from '@/components/admin/revenue/collection-rate-trend'
import { elementId } from '@/lib/utils/element-ids'

// ============================================
// Claims Analytics Page (Server Component)
// ============================================

export default async function ClaimsAnalyticsPage() {
  const [claimsData, payerData, arAging, collectionTrend] = await Promise.all([
    getClaimsAnalytics(),
    getCollectionRateByPayer(),
    getArAgingReport(),
    getCollectionRateTrend(),
  ])

  return (
    <div className="space-y-6" id={elementId('admin', 'claims', 'page')}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Link
              href="/admin/revenue"
              className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 transition-colors hover:text-gray-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Revenue
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Claims Analytics
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Track claims lifecycle, collection rates, payer performance, and
            accounts receivable aging.
          </p>
        </div>
      </div>

      {/* Claims Funnel */}
      <ClaimsFunnel data={claimsData} />

      {/* Collection Rate Trend + AR Aging */}
      <div className="grid gap-6 lg:grid-cols-2">
        <CollectionRateTrend data={collectionTrend} />
        <ArAgingChart data={arAging} />
      </div>

      {/* Payer Performance Table */}
      <PayerPerformanceTable data={payerData} />
    </div>
  )
}
