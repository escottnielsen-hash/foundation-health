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
  ReferenceLine,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils/format'
import { elementId } from '@/lib/utils/element-ids'
import type { LocationRevenue } from '@/types/revenue'

// ============================================
// Constants
// ============================================

const LOCATION_COLORS = [
  '#0f766e', // teal-700
  '#2563eb', // blue-600
  '#7c3aed', // violet-600
  '#ea580c', // orange-600
  '#059669', // emerald-600
  '#dc2626', // red-600
]

// ============================================
// Types
// ============================================

interface RevenueByLocationProps {
  data: LocationRevenue[]
}

interface TooltipPayloadItem {
  name: string
  value: number
  color: string
  dataKey: string
  payload: {
    name: string
    fullName: string
    revenue: number
    target: number
    collectionRate: number
    percentOfTarget: number
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

function LocationTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const data = payload[0].payload
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg">
      <p className="mb-1 text-xs font-medium text-gray-900">
        {data.fullName}
      </p>
      <div className="space-y-0.5 text-xs">
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Revenue:</span>
          <span className="font-semibold text-gray-900">
            {formatCurrency(data.revenue)}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Target:</span>
          <span className="font-medium text-gray-700">
            {formatCurrency(data.target)}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">% of Target:</span>
          <span className="font-medium text-gray-700">
            {data.percentOfTarget}%
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Collection Rate:</span>
          <span className="font-medium text-gray-700">
            {data.collectionRate}%
          </span>
        </div>
      </div>
    </div>
  )
}

// ============================================
// RevenueByLocation Component
// ============================================

export function RevenueByLocation({ data }: RevenueByLocationProps) {
  const chartData = data.map((d) => ({
    name: d.locationName
      .replace(' Clinic', '')
      .replace(' Hospital', '')
      .replace(' Center', ''),
    fullName: d.locationName,
    revenue: d.totalRevenueCents,
    target: d.targetRevenueCents,
    collectionRate: d.averageCollectionRate,
    percentOfTarget: d.percentOfTarget,
  }))

  const totalRevenue = data.reduce((sum, d) => sum + d.totalRevenueCents, 0)

  return (
    <Card id={elementId('revenue', 'chart', 'by-location')}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Revenue by Location</CardTitle>
          <span className="text-sm font-semibold text-gray-900">
            {formatCurrency(totalRevenue)} total
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="name"
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
              <Tooltip content={<LocationTooltip />} />
              <Bar
                dataKey="revenue"
                name="Revenue"
                radius={[6, 6, 0, 0]}
                maxBarSize={60}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={entry.fullName}
                    fill={LOCATION_COLORS[index % LOCATION_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Location cards with target progress */}
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((loc, i) => (
            <div
              key={loc.locationId}
              className="flex items-center gap-3 rounded-lg bg-gray-50 px-3 py-2"
            >
              <span
                className="h-3 w-3 flex-shrink-0 rounded-full"
                style={{
                  backgroundColor:
                    LOCATION_COLORS[i % LOCATION_COLORS.length],
                }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="truncate text-xs font-medium text-gray-700">
                    {loc.locationName
                      .replace(' Clinic', '')
                      .replace(' Hospital', '')}
                  </p>
                  <Badge
                    variant={
                      loc.percentOfTarget >= 80
                        ? 'success'
                        : loc.percentOfTarget >= 50
                          ? 'warning'
                          : 'outline'
                    }
                    className="ml-1 text-xs"
                  >
                    {loc.percentOfTarget}%
                  </Badge>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, loc.percentOfTarget)}%`,
                      backgroundColor:
                        LOCATION_COLORS[i % LOCATION_COLORS.length],
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
