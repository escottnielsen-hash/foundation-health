'use client'

import type React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { elementId } from '@/lib/utils/element-ids'
import type { CollectionRatePoint } from '@/types/revenue'

// ============================================
// Types
// ============================================

interface CollectionRateTrendProps {
  data: CollectionRatePoint[]
}

interface TooltipPayloadItem {
  name: string
  value: number
  color: string
  dataKey: string
  payload: {
    period: string
    collectionRate: number
    claimCount: number
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

function formatPeriodLabel(label: string | number | React.ReactNode): React.ReactNode {
  const str = String(label)
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
  const parts = value.split('-')
  if (parts.length === 2) {
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ]
    const monthIndex = parseInt(parts[1], 10) - 1
    if (monthIndex >= 0 && monthIndex < 12) {
      return monthNames[monthIndex]
    }
  }
  return value
}

// ============================================
// Custom Tooltip
// ============================================

function RateTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const data = payload[0].payload
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg">
      <p className="mb-1 text-xs font-medium text-gray-500">
        {String(formatPeriodLabel(data.period))}
      </p>
      <div className="space-y-0.5 text-xs">
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Collection Rate:</span>
          <span className="font-semibold text-gray-900">
            {data.collectionRate}%
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Claims:</span>
          <span className="font-medium text-gray-700">
            {data.claimCount}
          </span>
        </div>
      </div>
    </div>
  )
}

// ============================================
// CollectionRateTrend Component
// ============================================

export function CollectionRateTrend({ data }: CollectionRateTrendProps) {
  // Calculate average collection rate
  const validPoints = data.filter((d) => d.claimCount > 0)
  const avgRate =
    validPoints.length > 0
      ? Math.round(
          (validPoints.reduce((sum, d) => sum + d.collectionRate, 0) /
            validPoints.length) *
            10
        ) / 10
      : 0

  return (
    <Card id={elementId('revenue', 'chart', 'collection-rate')}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Collection Rate Trend</CardTitle>
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-900">{avgRate}%</p>
            <p className="text-xs text-gray-500">average</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
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
                domain={[0, 100]}
                tickFormatter={(v: number) => `${v}%`}
              />
              <Tooltip
                content={<RateTooltip />}
                labelFormatter={formatPeriodLabel}
              />
              {/* Target line at 80% */}
              <ReferenceLine
                y={80}
                stroke="#f59e0b"
                strokeDasharray="5 5"
                label={{
                  value: 'Target 80%',
                  position: 'insideTopRight',
                  fill: '#f59e0b',
                  fontSize: 11,
                }}
              />
              <Line
                type="monotone"
                dataKey="collectionRate"
                name="Collection Rate"
                stroke="#0f766e"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#0f766e', strokeWidth: 0 }}
                activeDot={{ r: 5, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
