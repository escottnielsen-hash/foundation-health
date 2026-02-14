'use client'

import type React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { elementId } from '@/lib/utils/element-ids'
import type { RevenueTimePoint } from '@/types/revenue'

// ============================================
// Types
// ============================================

interface RevenueTimeSeriesProps {
  data: RevenueTimePoint[]
}

interface TooltipPayloadItem {
  name: string
  value: number
  color: string
  dataKey: string
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

function formatPeriodLabel(label: string | number | React.ReactNode): React.ReactNode {
  const str = String(label)
  // "2025-01" -> "Jan 2025"
  if (str.includes('-W')) {
    return str // week format as-is
  }
  const parts = str.split('-')
  if (parts.length === 2) {
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ]
    const monthIndex = parseInt(parts[1], 10) - 1
    if (monthIndex >= 0 && monthIndex < 12) {
      return `${monthNames[monthIndex]} ${parts[0]}`
    }
  }
  return str
}

function formatAxisTick(value: string): string {
  if (value.includes('-W')) {
    return value
  }
  const parts = value.split('-')
  if (parts.length === 2) {
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ]
    const monthIndex = parseInt(parts[1], 10) - 1
    if (monthIndex >= 0 && monthIndex < 12) {
      return `${monthNames[monthIndex]}`
    }
  }
  return value
}

// ============================================
// Custom Tooltip
// ============================================

function RevenueTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg">
      <p className="mb-1 text-xs font-medium text-gray-500">
        {String(formatPeriodLabel(label ?? ''))}
      </p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-700">{entry.name}:</span>
          <span className="font-semibold text-gray-900">
            {formatCurrencyShort(entry.value)}
          </span>
        </div>
      ))}
    </div>
  )
}

// ============================================
// RevenueTimeSeries Component
// ============================================

export function RevenueTimeSeries({ data }: RevenueTimeSeriesProps) {
  return (
    <Card id={elementId('revenue', 'chart', 'time-series')}>
      <CardHeader>
        <CardTitle className="text-base">Revenue Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="period"
                tickFormatter={formatAxisTick}
                tick={{ fontSize: 11, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => formatCurrencyShort(v)}
              />
              <Tooltip
                content={<RevenueTooltip />}
                labelFormatter={formatPeriodLabel}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
              />
              <Line
                type="monotone"
                dataKey="totalRevenueCents"
                name="Total Revenue"
                stroke="#0f766e"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
              <Line
                type="monotone"
                dataKey="membershipRevenueCents"
                name="Membership"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
                strokeDasharray="5 5"
              />
              <Line
                type="monotone"
                dataKey="claimsPaidCents"
                name="Claims Paid"
                stroke="#7c3aed"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
                strokeDasharray="3 3"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
