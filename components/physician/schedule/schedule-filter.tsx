'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { APPOINTMENT_TYPES } from '@/lib/validations/physician-portal'

// ============================================
// Schedule Filter Component
// ============================================

export function ScheduleFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const dateFrom = searchParams.get('date_from') ?? ''
  const dateTo = searchParams.get('date_to') ?? ''
  const appointmentType = searchParams.get('type') ?? ''

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`/physician/schedule?${params.toString()}`)
    },
    [router, searchParams]
  )

  const clearFilters = useCallback(() => {
    router.push('/physician/schedule')
  }, [router])

  const hasFilters = dateFrom || dateTo || appointmentType

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="min-w-[140px]">
        <Label htmlFor="date_from" className="mb-1 block text-xs font-medium text-slate-600">
          From
        </Label>
        <Input
          id="date_from"
          type="date"
          value={dateFrom}
          onChange={(e) => updateFilter('date_from', e.target.value)}
          className="h-9 text-sm"
        />
      </div>

      <div className="min-w-[140px]">
        <Label htmlFor="date_to" className="mb-1 block text-xs font-medium text-slate-600">
          To
        </Label>
        <Input
          id="date_to"
          type="date"
          value={dateTo}
          onChange={(e) => updateFilter('date_to', e.target.value)}
          className="h-9 text-sm"
        />
      </div>

      <div className="min-w-[160px]">
        <Label htmlFor="appointment_type" className="mb-1 block text-xs font-medium text-slate-600">
          Type
        </Label>
        <Select
          id="appointment_type"
          value={appointmentType}
          onChange={(e) => updateFilter('type', e.target.value)}
          className="h-9 text-sm"
        >
          <option value="">All Types</option>
          {APPOINTMENT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </Select>
      </div>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9">
          Clear
        </Button>
      )}
    </div>
  )
}
