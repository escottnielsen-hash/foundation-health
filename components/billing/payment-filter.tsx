'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Select, SelectItem } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

// ============================================
// PaymentFilter Component
// ============================================

export function PaymentFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentStatus = searchParams.get('status') ?? 'all'
  const currentDateFrom = searchParams.get('dateFrom') ?? ''
  const currentDateTo = searchParams.get('dateTo') ?? ''

  const updateFilters = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())

      if (value && value !== 'all') {
        params.set(key, value)
      } else {
        params.delete(key)
      }

      router.push(`/patient/billing/payments?${params.toString()}`)
    },
    [router, searchParams]
  )

  const clearFilters = useCallback(() => {
    router.push('/patient/billing/payments')
  }, [router])

  const hasActiveFilters = currentStatus !== 'all' || currentDateFrom || currentDateTo

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
      {/* Status Filter */}
      <div className="w-full sm:w-48">
        <label className="mb-1.5 block text-xs font-medium text-gray-600">
          Status
        </label>
        <Select
          value={currentStatus}
          onChange={(e) => updateFilters('status', e.target.value)}
        >
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="succeeded">Succeeded</SelectItem>
          <SelectItem value="failed">Failed</SelectItem>
          <SelectItem value="refunded">Refunded</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
        </Select>
      </div>

      {/* Date From */}
      <div className="w-full sm:w-44">
        <label className="mb-1.5 block text-xs font-medium text-gray-600">
          From
        </label>
        <Input
          type="date"
          value={currentDateFrom}
          onChange={(e) => updateFilters('dateFrom', e.target.value)}
          className="text-sm"
        />
      </div>

      {/* Date To */}
      <div className="w-full sm:w-44">
        <label className="mb-1.5 block text-xs font-medium text-gray-600">
          To
        </label>
        <Input
          type="date"
          value={currentDateTo}
          onChange={(e) => updateFilters('dateTo', e.target.value)}
          className="text-sm"
        />
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="gap-1.5 text-gray-500"
        >
          <X className="h-3.5 w-3.5" />
          Clear
        </Button>
      )}
    </div>
  )
}
