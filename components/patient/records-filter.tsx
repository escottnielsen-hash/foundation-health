'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Select, SelectItem } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { RECORD_TYPES } from '@/lib/validations/patient'
import { elementId } from '@/lib/utils/element-ids'

export function RecordsFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentType = searchParams.get('type') ?? ''

  const handleFilterChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set('type', value)
      } else {
        params.delete('type')
      }
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  return (
    <div
      id={elementId('records', 'filter', 'container')}
      className="flex items-center gap-3"
    >
      <Label
        htmlFor={elementId('records', 'filter', 'type')}
        className="text-sm font-medium text-gray-700 whitespace-nowrap"
      >
        Filter by type:
      </Label>
      <div className="w-48">
        <Select
          id={elementId('records', 'filter', 'type')}
          value={currentType}
          onChange={(e) => handleFilterChange(e.target.value)}
        >
          <option value="">All Records</option>
          {RECORD_TYPES.map((rt) => (
            <SelectItem key={rt.value} value={rt.value}>
              {rt.label}
            </SelectItem>
          ))}
        </Select>
      </div>
    </div>
  )
}
