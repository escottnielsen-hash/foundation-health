'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { PHYSICIAN_ENCOUNTER_STATUS_OPTIONS } from '@/lib/validations/physician-clinical'

export function EncounterFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentStatus = searchParams.get('status') ?? ''
  const currentDateFrom = searchParams.get('date_from') ?? ''
  const currentDateTo = searchParams.get('date_to') ?? ''
  const currentSearch = searchParams.get('patient_search') ?? ''

  const updateFilters = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`?${params.toString()}`)
    },
    [router, searchParams]
  )

  const clearFilters = useCallback(() => {
    router.push('?')
  }, [router])

  const hasFilters = currentStatus || currentDateFrom || currentDateTo || currentSearch

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-500">Status</label>
        <Select
          value={currentStatus}
          onChange={(e) => updateFilters('status', e.target.value)}
          className="w-[160px]"
        >
          <option value="">All Statuses</option>
          {PHYSICIAN_ENCOUNTER_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-500">From</label>
        <Input
          type="date"
          value={currentDateFrom}
          onChange={(e) => updateFilters('date_from', e.target.value)}
          className="w-[150px]"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-500">To</label>
        <Input
          type="date"
          value={currentDateTo}
          onChange={(e) => updateFilters('date_to', e.target.value)}
          className="w-[150px]"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-500">Patient</label>
        <Input
          type="text"
          placeholder="Search patient name..."
          value={currentSearch}
          onChange={(e) => updateFilters('patient_search', e.target.value)}
          className="w-[200px]"
        />
      </div>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          Clear
        </Button>
      )}
    </div>
  )
}
