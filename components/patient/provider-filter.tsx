'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import { Select, SelectItem } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { elementId } from '@/lib/utils/element-ids'
import { PROVIDER_SPECIALTIES } from '@/lib/validations/providers'
import type { Location } from '@/types/database'

interface ProviderFilterProps {
  locations: Location[]
  specialties: string[]
}

export function ProviderFilter({ locations, specialties }: ProviderFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const currentSpecialty = searchParams.get('specialty') ?? ''
  const currentLocationId = searchParams.get('location_id') ?? ''
  const currentSearch = searchParams.get('search') ?? ''

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value)
        } else {
          params.delete(key)
        }
      }
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`)
      })
    },
    [router, pathname, searchParams]
  )

  const handleClearAll = useCallback(() => {
    startTransition(() => {
      router.push(pathname)
    })
  }, [router, pathname])

  // Merge dynamic specialties from DB with the constant list
  const allSpecialties = Array.from(
    new Set([
      ...PROVIDER_SPECIALTIES.map((s) => s.value),
      ...specialties,
    ])
  ).sort()

  const hasActiveFilters = currentSpecialty || currentLocationId || currentSearch

  return (
    <div
      id={elementId('providers', 'filter', 'container')}
      className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        {/* Search */}
        <div className="flex-1 min-w-0">
          <Label
            htmlFor={elementId('providers', 'filter', 'search')}
            className="text-sm font-medium text-gray-700 mb-1.5 block"
          >
            Search by name
          </Label>
          <Input
            id={elementId('providers', 'filter', 'search')}
            type="search"
            placeholder="Search providers..."
            defaultValue={currentSearch}
            onChange={(e) => {
              const value = e.target.value
              // Debounce via small timeout
              const timeout = setTimeout(() => {
                updateParams({ search: value })
              }, 300)
              return () => clearTimeout(timeout)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                updateParams({ search: (e.target as HTMLInputElement).value })
              }
            }}
          />
        </div>

        {/* Specialty filter */}
        <div className="w-full sm:w-56">
          <Label
            htmlFor={elementId('providers', 'filter', 'specialty')}
            className="text-sm font-medium text-gray-700 mb-1.5 block"
          >
            Specialty
          </Label>
          <Select
            id={elementId('providers', 'filter', 'specialty')}
            value={currentSpecialty}
            onChange={(e) => updateParams({ specialty: e.target.value })}
          >
            <option value="">All Specialties</option>
            {allSpecialties.map((specialty) => (
              <SelectItem key={specialty} value={specialty}>
                {specialty}
              </SelectItem>
            ))}
          </Select>
        </div>

        {/* Location filter */}
        <div className="w-full sm:w-56">
          <Label
            htmlFor={elementId('providers', 'filter', 'location')}
            className="text-sm font-medium text-gray-700 mb-1.5 block"
          >
            Location
          </Label>
          <Select
            id={elementId('providers', 'filter', 'location')}
            value={currentLocationId}
            onChange={(e) => updateParams({ location_id: e.target.value })}
          >
            <option value="">All Locations</option>
            {locations.map((loc) => (
              <SelectItem key={loc.id} value={loc.id}>
                {loc.name} — {loc.city}, {loc.state}
              </SelectItem>
            ))}
          </Select>
        </div>

        {/* Clear button */}
        {hasActiveFilters && (
          <Button
            id={elementId('providers', 'filter', 'clear')}
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            disabled={isPending}
            className="whitespace-nowrap text-gray-500 hover:text-gray-700"
          >
            Clear filters
          </Button>
        )}
      </div>

      {isPending && (
        <div className="mt-3 text-xs text-gray-400">Updating results...</div>
      )}
    </div>
  )
}
