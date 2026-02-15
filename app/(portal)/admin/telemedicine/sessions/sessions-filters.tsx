'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { RotateCcw } from 'lucide-react'
import { elementId } from '@/lib/utils/element-ids'

// ============================================
// Types
// ============================================

interface SessionsFiltersProps {
  physicians: { id: string; full_name: string }[]
  currentStatus: string
  currentType: string
  currentPhysician: string
  currentFrom: string
  currentTo: string
}

// ============================================
// SessionsFilters Component
// ============================================

export function SessionsFilters({
  physicians,
  currentStatus,
  currentType,
  currentPhysician,
  currentFrom,
  currentTo,
}: SessionsFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`/admin/telemedicine/sessions?${params.toString()}`)
    },
    [router, searchParams]
  )

  const clearFilters = useCallback(() => {
    router.push('/admin/telemedicine/sessions')
  }, [router])

  const hasActiveFilters =
    currentStatus || currentType || currentPhysician || currentFrom || currentTo

  return (
    <Card id={elementId('admin', 'telemedicine', 'filters')}>
      <CardContent className="p-4">
        <div className="flex flex-wrap items-end gap-3">
          {/* Status Filter */}
          <div className="min-w-[150px] flex-1">
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Status
            </label>
            <Select
              value={currentStatus}
              onChange={(e) => updateFilter('status', e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="requested">Requested</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No Show</option>
            </Select>
          </div>

          {/* Type Filter */}
          <div className="min-w-[130px] flex-1">
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Type
            </label>
            <Select
              value={currentType}
              onChange={(e) => updateFilter('type', e.target.value)}
            >
              <option value="">All Types</option>
              <option value="video">Video</option>
              <option value="audio">Audio</option>
              <option value="chat">Chat</option>
            </Select>
          </div>

          {/* Physician Filter */}
          <div className="min-w-[180px] flex-1">
            <label className="mb-1 block text-xs font-medium text-gray-500">
              Physician
            </label>
            <Select
              value={currentPhysician}
              onChange={(e) => updateFilter('physician', e.target.value)}
            >
              <option value="">All Physicians</option>
              {physicians.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name}
                </option>
              ))}
            </Select>
          </div>

          {/* Date From */}
          <div className="min-w-[150px] flex-1">
            <label className="mb-1 block text-xs font-medium text-gray-500">
              From Date
            </label>
            <Input
              type="date"
              value={currentFrom}
              onChange={(e) => updateFilter('from', e.target.value)}
            />
          </div>

          {/* Date To */}
          <div className="min-w-[150px] flex-1">
            <label className="mb-1 block text-xs font-medium text-gray-500">
              To Date
            </label>
            <Input
              type="date"
              value={currentTo}
              onChange={(e) => updateFilter('to', e.target.value)}
            />
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="flex-shrink-0"
            >
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              Clear
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
