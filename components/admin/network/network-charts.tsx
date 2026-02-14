'use client'

import type React from 'react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type {
  LocationAppointmentStat,
  PatientVolumeTrendPoint,
  RevenueByLocation,
  ProviderUtilizationStat,
} from '@/types/network'
import { LOCATION_COLORS, LOCATION_COLORS_ARRAY } from '@/types/network'

// ============================================
// Shared helpers
// ============================================

function getLocationColor(name: string, index: number): string {
  return LOCATION_COLORS[name] ?? LOCATION_COLORS_ARRAY[index % LOCATION_COLORS_ARRAY.length]
}

function formatCurrencyShort(cents: number): string {
  const dollars = cents / 100
  if (dollars >= 1000) {
    return `$${(dollars / 1000).toFixed(1)}k`
  }
  return `$${dollars.toFixed(0)}`
}

// ============================================
// Custom Tooltip
// ============================================

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
  formatter?: (value: number) => string
}

function ChartTooltip({ active, payload, label, formatter }: CustomTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg">
      <p className="mb-1 text-xs font-medium text-gray-500">{label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-700">{entry.name}:</span>
          <span className="font-semibold text-gray-900">
            {formatter ? formatter(entry.value) : entry.value}
          </span>
        </div>
      ))}
    </div>
  )
}

// ============================================
// Appointments by Location (Bar Chart)
// ============================================

interface AppointmentsByLocationChartProps {
  data: LocationAppointmentStat[]
}

export function AppointmentsByLocationChart({ data }: AppointmentsByLocationChartProps) {
  const chartData = data.map((d) => ({
    name: d.locationName.replace(' Clinic', '').replace(' Hospital', ''),
    fullName: d.locationName,
    appointments: d.appointmentCount,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Appointments by Location</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
              />
              <Tooltip
                content={<ChartTooltip />}
              />
              <Bar
                dataKey="appointments"
                name="Appointments"
                radius={[6, 6, 0, 0]}
                maxBarSize={60}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={entry.fullName}
                    fill={getLocationColor(entry.fullName, index)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// Patient Volume Trends (Line Chart)
// ============================================

interface PatientVolumeTrendsChartProps {
  data: PatientVolumeTrendPoint[]
  locationNames: string[]
}

export function PatientVolumeTrendsChart({
  data,
  locationNames,
}: PatientVolumeTrendsChartProps) {
  const formatDate = (label: string | number | React.ReactNode) => {
    const dateStr = String(label)
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Patient Volume Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fontSize: 11, fill: '#6b7280' }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#6b7280' }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                content={<ChartTooltip />}
                labelFormatter={formatDate}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
              />
              {locationNames.map((name, i) => (
                <Line
                  key={name}
                  type="monotone"
                  dataKey={name}
                  name={name}
                  stroke={getLocationColor(name, i)}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 0 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// Revenue by Location (Bar Chart)
// ============================================

interface RevenueByLocationChartProps {
  data: RevenueByLocation[]
}

export function RevenueByLocationChart({ data }: RevenueByLocationChartProps) {
  const chartData = data.map((d) => ({
    name: d.locationName.replace(' Clinic', '').replace(' Hospital', ''),
    fullName: d.locationName,
    revenue: d.totalRevenueCents,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Revenue by Location</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
              <Tooltip
                content={
                  <ChartTooltip
                    formatter={(v: number) => formatCurrencyShort(v)}
                  />
                }
              />
              <Bar
                dataKey="revenue"
                name="Revenue"
                radius={[6, 6, 0, 0]}
                maxBarSize={60}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={entry.fullName}
                    fill={getLocationColor(entry.fullName, index)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// Provider Utilization (Bar Chart)
// ============================================

interface ProviderUtilizationChartProps {
  data: ProviderUtilizationStat[]
}

export function ProviderUtilizationChart({ data }: ProviderUtilizationChartProps) {
  const chartData = data.map((d) => ({
    name: d.locationName.replace(' Clinic', '').replace(' Hospital', ''),
    fullName: d.locationName,
    utilization: d.utilizationPercent,
    active: d.activeProviders,
    total: d.totalProviders,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Provider Utilization</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
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
                domain={[0, 100]}
                tickFormatter={(v: number) => `${v}%`}
              />
              <Tooltip
                content={
                  <ChartTooltip
                    formatter={(v: number) => `${v}%`}
                  />
                }
              />
              <Bar
                dataKey="utilization"
                name="Utilization"
                radius={[6, 6, 0, 0]}
                maxBarSize={60}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={entry.fullName}
                    fill={getLocationColor(entry.fullName, index)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend with detailed breakdown */}
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {data.map((loc, i) => (
            <div
              key={loc.locationId}
              className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2"
            >
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: getLocationColor(loc.locationName, i) }}
              />
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-gray-700">
                  {loc.locationName.replace(' Clinic', '').replace(' Hospital', '')}
                </p>
                <p className="text-xs text-gray-500">
                  {loc.activeProviders}/{loc.totalProviders} active
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
