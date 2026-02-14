'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Select, SelectItem } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { CLAIM_STATUSES } from '@/lib/validations/claims'
import { elementId } from '@/lib/utils/element-ids'
import { X } from 'lucide-react'

export function ClaimFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentStatus = searchParams.get('status') ?? ''
  const currentPayer = searchParams.get('payer') ?? ''
  const currentDateFrom = searchParams.get('date_from') ?? ''
  const currentDateTo = searchParams.get('date_to') ?? ''
  const currentSortBy = searchParams.get('sort_by') ?? ''
  const currentSortOrder = searchParams.get('sort_order') ?? ''

  const hasActiveFilters = currentStatus || currentPayer || currentDateFrom || currentDateTo

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  const clearAllFilters = useCallback(() => {
    const params = new URLSearchParams()
    if (currentSortBy) params.set('sort_by', currentSortBy)
    if (currentSortOrder) params.set('sort_order', currentSortOrder)
    router.push(`${pathname}?${params.toString()}`)
  }, [router, pathname, currentSortBy, currentSortOrder])

  return (
    <div
      id={elementId('claims', 'filter', 'container')}
      className="space-y-4"
    >
      <div className="flex flex-wrap items-end gap-4">
        {/* Status filter */}
        <div className="w-44">
          <Label
            htmlFor={elementId('claims', 'filter', 'status')}
            className="text-xs font-medium text-gray-600 mb-1 block"
          >
            Status
          </Label>
          <Select
            id={elementId('claims', 'filter', 'status')}
            value={currentStatus}
            onChange={(e) => updateParam('status', e.target.value)}
          >
            <option value="">All Statuses</option>
            {CLAIM_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </Select>
        </div>

        {/* Payer filter */}
        <div className="w-48">
          <Label
            htmlFor={elementId('claims', 'filter', 'payer')}
            className="text-xs font-medium text-gray-600 mb-1 block"
          >
            Payer
          </Label>
          <Input
            id={elementId('claims', 'filter', 'payer')}
            type="text"
            placeholder="Search payer..."
            value={currentPayer}
            onChange={(e) => updateParam('payer', e.target.value)}
            className="h-11"
          />
        </div>

        {/* Date from */}
        <div className="w-40">
          <Label
            htmlFor={elementId('claims', 'filter', 'date-from')}
            className="text-xs font-medium text-gray-600 mb-1 block"
          >
            From
          </Label>
          <Input
            id={elementId('claims', 'filter', 'date-from')}
            type="date"
            value={currentDateFrom}
            onChange={(e) => updateParam('date_from', e.target.value)}
            className="h-11"
          />
        </div>

        {/* Date to */}
        <div className="w-40">
          <Label
            htmlFor={elementId('claims', 'filter', 'date-to')}
            className="text-xs font-medium text-gray-600 mb-1 block"
          >
            To
          </Label>
          <Input
            id={elementId('claims', 'filter', 'date-to')}
            type="date"
            value={currentDateTo}
            onChange={(e) => updateParam('date_to', e.target.value)}
            className="h-11"
          />
        </div>

        {/* Sort */}
        <div className="w-40">
          <Label
            htmlFor={elementId('claims', 'filter', 'sort')}
            className="text-xs font-medium text-gray-600 mb-1 block"
          >
            Sort By
          </Label>
          <Select
            id={elementId('claims', 'filter', 'sort')}
            value={currentSortBy}
            onChange={(e) => updateParam('sort_by', e.target.value)}
          >
            <option value="">Date (Newest)</option>
            <SelectItem value="service_date">Service Date</SelectItem>
            <SelectItem value="billed_amount">Amount</SelectItem>
            <SelectItem value="status">Status</SelectItem>
            <SelectItem value="created_at">Created</SelectItem>
          </Select>
        </div>

        {/* Sort order */}
        <div className="w-28">
          <Label
            htmlFor={elementId('claims', 'filter', 'order')}
            className="text-xs font-medium text-gray-600 mb-1 block"
          >
            Order
          </Label>
          <Select
            id={elementId('claims', 'filter', 'order')}
            value={currentSortOrder}
            onChange={(e) => updateParam('sort_order', e.target.value)}
          >
            <option value="">Desc</option>
            <SelectItem value="asc">Asc</SelectItem>
            <SelectItem value="desc">Desc</SelectItem>
          </Select>
        </div>

        {/* Clear filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="flex items-center gap-1 text-gray-500 hover:text-gray-700"
          >
            <X className="w-3 h-3" />
            Clear
          </Button>
        )}
      </div>
    </div>
  )
}
