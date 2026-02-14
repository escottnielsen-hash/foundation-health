'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Select, SelectItem } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { INVOICE_STATUSES } from '@/lib/validations/invoices'
import { elementId } from '@/lib/utils/element-ids'

export function InvoiceFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentStatus = searchParams.get('status') ?? ''
  const currentDateFrom = searchParams.get('date_from') ?? ''
  const currentDateTo = searchParams.get('date_to') ?? ''

  const updateParams = useCallback(
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

  const handleClearFilters = useCallback(() => {
    router.push(pathname)
  }, [router, pathname])

  const hasActiveFilters = currentStatus || currentDateFrom || currentDateTo

  return (
    <div
      id={elementId('invoices', 'filter', 'container')}
      className="flex flex-wrap items-end gap-4"
    >
      {/* Status Filter */}
      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor={elementId('invoices', 'filter', 'status')}
          className="text-xs font-medium text-gray-500 uppercase tracking-wide"
        >
          Status
        </Label>
        <div className="w-44">
          <Select
            id={elementId('invoices', 'filter', 'status')}
            value={currentStatus}
            onChange={(e) => updateParams('status', e.target.value)}
          >
            <option value="">All Statuses</option>
            {INVOICE_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>

      {/* Date From */}
      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor={elementId('invoices', 'filter', 'date-from')}
          className="text-xs font-medium text-gray-500 uppercase tracking-wide"
        >
          From
        </Label>
        <Input
          id={elementId('invoices', 'filter', 'date-from')}
          type="date"
          value={currentDateFrom}
          onChange={(e) => updateParams('date_from', e.target.value)}
          className="w-40"
        />
      </div>

      {/* Date To */}
      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor={elementId('invoices', 'filter', 'date-to')}
          className="text-xs font-medium text-gray-500 uppercase tracking-wide"
        >
          To
        </Label>
        <Input
          id={elementId('invoices', 'filter', 'date-to')}
          type="date"
          value={currentDateTo}
          onChange={(e) => updateParams('date_to', e.target.value)}
          className="w-40"
        />
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearFilters}
          className="text-gray-500"
        >
          Clear Filters
        </Button>
      )}
    </div>
  )
}
