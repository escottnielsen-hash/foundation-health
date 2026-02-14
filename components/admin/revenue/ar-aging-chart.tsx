'use client'

import type React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils/format'
import { elementId } from '@/lib/utils/element-ids'
import type { ArAgingBucket } from '@/types/revenue'

// ============================================
// Constants
// ============================================

const BUCKET_COLORS: Record<string, string> = {
  '0-30': '#22c55e',   // green-500
  '31-60': '#f59e0b',  // amber-500
  '61-90': '#f97316',  // orange-500
  '90+': '#ef4444',    // red-500
}

// ============================================
// Types
// ============================================

interface ArAgingChartProps {
  data: ArAgingBucket[]
}

interface TooltipPayloadItem {
  name: string
  value: number
  color: string
  dataKey: string
  payload: {
    bucket: string
    amount: number
    claims: number
  }
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayloadItem[]
  label?: string
}

// ============================================
// Helpers
// ============================================

function formatCurrencyShort(cents: number): string {
  const dollars = cents / 100
  if (dollars >= 1_000_000) {
    return `$${(dollars / 1_000_000).toFixed(1)}M`
  }
  if (dollars >= 1_000) {
    return `$${(dollars / 1_000).toFixed(1)}k`
  }
  return `$${dollars.toFixed(0)}`
}

// ============================================
// Custom Tooltip
// ============================================

function AgingTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const data = payload[0].payload
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg">
      <p className="mb-1 text-xs font-medium text-gray-900">
        {data.bucket} days
      </p>
      <div className="space-y-0.5 text-xs">
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Outstanding:</span>
          <span className="font-semibold text-gray-900">
            {formatCurrency(data.amount)}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Claims:</span>
          <span className="font-medium text-gray-700">{data.claims}</span>
        </div>
      </div>
    </div>
  )
}

// ============================================
// ArAgingChart Component
// ============================================

export function ArAgingChart({ data }: ArAgingChartProps) {
  const chartData = data.map((d) => ({
    bucket: `${d.bucket} days`,
    amount: d.totalAmountCents,
    claims: d.claimCount,
  }))

  const totalOutstanding = data.reduce(
    (sum, d) => sum + d.totalAmountCents,
    0
  )
  const totalClaims = data.reduce((sum, d) => sum + d.claimCount, 0)

  return (
    <Card id={elementId('revenue', 'chart', 'ar-aging')}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Accounts Receivable Aging</CardTitle>
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">
              {formatCurrency(totalOutstanding)}
            </p>
            <p className="text-xs text-gray-500">
              {totalClaims} outstanding claims
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="bucket"
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => formatCurrencyShort(v)}
              />
              <Tooltip content={<AgingTooltip />} />
              <Bar
                dataKey="amount"
                name="Outstanding"
                radius={[6, 6, 0, 0]}
                maxBarSize={60}
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.bucket}
                    fill={BUCKET_COLORS[entry.bucket] ?? '#9ca3af'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Aging breakdown cards */}
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {data.map((bucket) => {
            const color = BUCKET_COLORS[bucket.bucket] ?? '#9ca3af'
            const percentage =
              totalOutstanding > 0
                ? Math.round(
                    (bucket.totalAmountCents / totalOutstanding) * 100
                  )
                : 0

            return (
              <div
                key={bucket.bucket}
                className="rounded-lg border border-gray-100 p-3"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs font-medium text-gray-500">
                    {bucket.bucket} days
                  </span>
                </div>
                <p className="mt-1 text-sm font-bold text-gray-900">
                  {formatCurrency(bucket.totalAmountCents)}
                </p>
                <p className="text-xs text-gray-400">
                  {bucket.claimCount} claims ({percentage}%)
                </p>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
