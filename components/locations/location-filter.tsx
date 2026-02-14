'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import { Select, SelectItem } from '@/components/ui/select'
import { LOCATION_STATES, LOCATION_TYPES } from '@/lib/validations/locations'
import { elementId } from '@/lib/utils/element-ids'

// ============================================
// Props
// ============================================

interface LocationFilterProps {
  states?: string[]
}

// ============================================
// Component
// ============================================

export function LocationFilter({ states }: LocationFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const currentState = searchParams.get('state') ?? ''
  const currentType = searchParams.get('type') ?? ''

  const updateFilters = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())

      if (value === '' || value === undefined) {
        params.delete(key)
      } else {
        params.set(key, value)
      }

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false })
      })
    },
    [router, pathname, searchParams]
  )

  // Use provided states or fallback to constants
  const stateOptions = states
    ? states.map((s) => {
        const found = LOCATION_STATES.find((ls) => ls.value === s)
        return { value: s, label: found ? found.label : s }
      })
    : LOCATION_STATES.map((s) => ({ value: s.value, label: s.label }))

  return (
    <div
      id={elementId('locations', 'filter')}
      className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        {/* State filter */}
        <div className="flex-1">
          <label
            htmlFor="location-filter-state"
            className="mb-1.5 block text-xs font-medium text-gray-500 uppercase tracking-wide"
          >
            State
          </label>
          <Select
            id="location-filter-state"
            value={currentState}
            onChange={(e) => updateFilters('state', e.target.value)}
            disabled={isPending}
          >
            <SelectItem value="">All States</SelectItem>
            {stateOptions.map((state) => (
              <SelectItem key={state.value} value={state.value}>
                {state.label}
              </SelectItem>
            ))}
          </Select>
        </div>

        {/* Type filter */}
        <div className="flex-1">
          <label
            htmlFor="location-filter-type"
            className="mb-1.5 block text-xs font-medium text-gray-500 uppercase tracking-wide"
          >
            Type
          </label>
          <Select
            id="location-filter-type"
            value={currentType}
            onChange={(e) => updateFilters('type', e.target.value)}
            disabled={isPending}
          >
            <SelectItem value="">All Types</SelectItem>
            {LOCATION_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </Select>
        </div>

        {/* Clear filters */}
        {(currentState || currentType) && (
          <button
            type="button"
            className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors whitespace-nowrap pb-2.5"
            onClick={() => {
              startTransition(() => {
                router.push(pathname, { scroll: false })
              })
            }}
            disabled={isPending}
          >
            Clear Filters
          </button>
        )}
      </div>

      {isPending && (
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
          Updating results...
        </div>
      )}
    </div>
  )
}
