'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Select, SelectItem } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { ENCOUNTER_TYPES } from '@/lib/validations/encounters'
import { elementId } from '@/lib/utils/element-ids'

export function EncounterFilter() {
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
      id={elementId('encounters', 'filter', 'container')}
      className="flex items-center gap-3"
    >
      <Label
        htmlFor={elementId('encounters', 'filter', 'type')}
        className="text-sm font-medium text-gray-700 whitespace-nowrap"
      >
        Filter by type:
      </Label>
      <div className="w-52">
        <Select
          id={elementId('encounters', 'filter', 'type')}
          value={currentType}
          onChange={(e) => handleFilterChange(e.target.value)}
        >
          <option value="">All Encounters</option>
          {ENCOUNTER_TYPES.map((et) => (
            <SelectItem key={et.value} value={et.value}>
              {et.label}
            </SelectItem>
          ))}
        </Select>
      </div>
    </div>
  )
}
