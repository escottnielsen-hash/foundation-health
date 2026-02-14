'use client'

import type React from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils/format'
import { elementId } from '@/lib/utils/element-ids'
import type { MembershipRevenueBreakdown } from '@/types/revenue'

// ============================================
// Constants
// ============================================

const TIER_COLORS: Record<string, string> = {
  platinum: '#6366f1', // indigo-500
  gold: '#f59e0b',     // amber-500
  silver: '#9ca3af',   // gray-400
}

const TIER_COLORS_ARRAY = ['#6366f1', '#f59e0b', '#9ca3af', '#059669']

// ============================================
// Types
// ============================================

interface MembershipBreakdownProps {
  data: MembershipRevenueBreakdown[]
}

interface TooltipPayloadItem {
  name: string
  value: number
  payload: {
    name: string
    displayName: string
    value: number
    activeMembers: number
    monthlyRevenue: number
    fill: string
  }
}

interface CustomTooltipProps {
  active?: boolean
  payload?: TooltipPayloadItem[]
}

// ============================================
// Custom Tooltip
// ============================================

function MembershipTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  const data = payload[0].payload
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg">
      <p className="mb-1 text-xs font-medium text-gray-900">
        {data.displayName}
      </p>
      <div className="space-y-0.5 text-xs">
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Total Revenue:</span>
          <span className="font-semibold text-gray-900">
            {formatCurrency(data.value)}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Monthly Revenue:</span>
          <span className="font-medium text-gray-700">
            {formatCurrency(data.monthlyRevenue)}
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-gray-500">Active Members:</span>
          <span className="font-medium text-gray-700">
            {data.activeMembers}
          </span>
        </div>
      </div>
    </div>
  )
}

// ============================================
// Custom Legend
// ============================================

interface CustomLegendPayloadItem {
  value: string
  color: string
}

interface CustomLegendProps {
  payload?: CustomLegendPayloadItem[]
}

function CustomLegend({ payload }: CustomLegendProps) {
  if (!payload) return null
  return (
    <div className="flex justify-center gap-4 pt-2">
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs font-medium text-gray-600">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  )
}

// ============================================
// MembershipBreakdown Component
// ============================================

export function MembershipBreakdown({ data }: MembershipBreakdownProps) {
  const chartData = data.map((d) => ({
    name: d.tierName,
    displayName: d.displayName,
    value: d.totalRevenueCents,
    activeMembers: d.activeMembers,
    monthlyRevenue: d.monthlyRevenueCents,
    fill:
      TIER_COLORS[d.tierName] ??
      TIER_COLORS_ARRAY[data.indexOf(d) % TIER_COLORS_ARRAY.length],
  }))

  const totalMembers = data.reduce((sum, d) => sum + d.activeMembers, 0)
  const totalRevenue = data.reduce((sum, d) => sum + d.totalRevenueCents, 0)

  return (
    <Card id={elementId('revenue', 'chart', 'membership')}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Membership Revenue</CardTitle>
          <span className="text-sm text-gray-500">
            {totalMembers} active members
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          {/* Donut Chart */}
          <div className="h-56 w-56 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  dataKey="value"
                  nameKey="displayName"
                  paddingAngle={2}
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<MembershipTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Tier breakdown list */}
          <div className="flex-1 space-y-3">
            {data.map((tier) => {
              const color =
                TIER_COLORS[tier.tierName] ??
                TIER_COLORS_ARRAY[data.indexOf(tier) % TIER_COLORS_ARRAY.length]

              return (
                <div key={tier.tierName} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {tier.displayName}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(tier.totalRevenueCents)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pl-5 text-xs text-gray-500">
                    <span>{tier.activeMembers} members</span>
                    <span>{tier.percentOfTotal}% of total</span>
                  </div>
                  <div className="ml-5 h-1.5 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${tier.percentOfTotal}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
