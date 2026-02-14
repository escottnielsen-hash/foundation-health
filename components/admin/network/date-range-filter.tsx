'use client'

import { useCallback, useMemo } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import type { DateRangePreset, DateRange } from '@/types/network'

// ============================================
// Presets
// ============================================

const PRESETS: { label: string; value: DateRangePreset }[] = [
  { label: 'Today', value: 'today' },
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: '90 Days', value: '90d' },
]

// ============================================
// Helper: build date range from preset
// ============================================

export function buildDateRange(preset: DateRangePreset, customFrom?: string, customTo?: string): DateRange {
  const now = new Date()
  const to = new Date(now)
  to.setHours(23, 59, 59, 999)

  let from: Date

  switch (preset) {
    case 'today':
      from = new Date(now)
      from.setHours(0, 0, 0, 0)
      break
    case '7d':
      from = new Date(now)
      from.setDate(from.getDate() - 7)
      from.setHours(0, 0, 0, 0)
      break
    case '30d':
      from = new Date(now)
      from.setDate(from.getDate() - 30)
      from.setHours(0, 0, 0, 0)
      break
    case '90d':
      from = new Date(now)
      from.setDate(from.getDate() - 90)
      from.setHours(0, 0, 0, 0)
      break
    case 'custom':
      from = customFrom ? new Date(customFrom) : new Date(now)
      if (customTo) {
        to.setTime(new Date(customTo).getTime())
        to.setHours(23, 59, 59, 999)
      }
      break
    default:
      from = new Date(now)
      from.setDate(from.getDate() - 30)
      from.setHours(0, 0, 0, 0)
  }

  return {
    from: from.toISOString(),
    to: to.toISOString(),
    preset,
  }
}

// ============================================
// parseDateRangeFromParams
// ============================================

export function parseDateRangeFromParams(
  searchParams: URLSearchParams
): DateRange {
  const preset = (searchParams.get('range') ?? '30d') as DateRangePreset
  const customFrom = searchParams.get('from') ?? undefined
  const customTo = searchParams.get('to') ?? undefined
  return buildDateRange(preset, customFrom, customTo)
}

// ============================================
// DateRangeFilter Component
// ============================================

export function DateRangeFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentPreset = (searchParams.get('range') ?? '30d') as DateRangePreset
  const customFrom = searchParams.get('from') ?? ''
  const customTo = searchParams.get('to') ?? ''

  const setPreset = useCallback(
    (preset: DateRangePreset) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('range', preset)
      if (preset !== 'custom') {
        params.delete('from')
        params.delete('to')
      }
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  const handleCustomDateChange = useCallback(
    (field: 'from' | 'to', value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('range', 'custom')
      params.set(field, value)
      // Preserve the other date if set
      if (field === 'from' && !params.get('to')) {
        params.set('to', new Date().toISOString().split('T')[0])
      }
      if (field === 'to' && !params.get('from')) {
        const d = new Date()
        d.setDate(d.getDate() - 30)
        params.set('from', d.toISOString().split('T')[0])
      }
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  const isCustom = currentPreset === 'custom'

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Preset buttons */}
      <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-0.5">
        {PRESETS.map((preset) => (
          <button
            key={preset.value}
            onClick={() => setPreset(preset.value)}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              currentPreset === preset.value
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            )}
          >
            {preset.label}
          </button>
        ))}
        <button
          onClick={() => setPreset('custom')}
          className={cn(
            'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            isCustom
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          )}
        >
          Custom
        </button>
      </div>

      {/* Custom date inputs */}
      {isCustom && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={customFrom}
            onChange={(e) => handleCustomDateChange('from', e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <span className="text-sm text-gray-400">to</span>
          <input
            type="date"
            value={customTo}
            onChange={(e) => handleCustomDateChange('to', e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      )}
    </div>
  )
}
