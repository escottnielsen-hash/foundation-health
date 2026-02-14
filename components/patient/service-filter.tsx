'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Select, SelectItem } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { elementId } from '@/lib/utils/element-ids'
import { SERVICE_SORT_OPTIONS, getCategoryLabel } from '@/lib/validations/services'

interface ServiceFilterProps {
  categories: string[]
}

export function ServiceFilter({ categories }: ServiceFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentCategory = searchParams.get('category') ?? ''
  const currentSearch = searchParams.get('search') ?? ''
  const currentSort = searchParams.get('sort_by') ?? ''

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

  const handleCategoryChange = useCallback(
    (value: string) => {
      updateParams('category', value)
    },
    [updateParams]
  )

  const handleSortChange = useCallback(
    (value: string) => {
      updateParams('sort_by', value)
    },
    [updateParams]
  )

  const handleSearchChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set('search', value)
      } else {
        params.delete('search')
      }
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams]
  )

  return (
    <div
      id={elementId('services', 'filter', 'container')}
      className="flex flex-col gap-4 sm:flex-row sm:items-end"
    >
      {/* Search Input */}
      <div className="flex-1 min-w-0">
        <Label
          htmlFor={elementId('services', 'filter', 'search')}
          className="text-sm font-medium text-gray-700 mb-1.5 block"
        >
          Search services
        </Label>
        <Input
          id={elementId('services', 'filter', 'search')}
          type="search"
          placeholder="Search by name..."
          defaultValue={currentSearch}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </div>

      {/* Category Select */}
      <div className="w-full sm:w-52">
        <Label
          htmlFor={elementId('services', 'filter', 'category')}
          className="text-sm font-medium text-gray-700 mb-1.5 block"
        >
          Category
        </Label>
        <Select
          id={elementId('services', 'filter', 'category')}
          value={currentCategory}
          onChange={(e) => handleCategoryChange(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {getCategoryLabel(cat)}
            </SelectItem>
          ))}
        </Select>
      </div>

      {/* Sort Select */}
      <div className="w-full sm:w-52">
        <Label
          htmlFor={elementId('services', 'filter', 'sort')}
          className="text-sm font-medium text-gray-700 mb-1.5 block"
        >
          Sort by
        </Label>
        <Select
          id={elementId('services', 'filter', 'sort')}
          value={currentSort}
          onChange={(e) => handleSortChange(e.target.value)}
        >
          <option value="">Default</option>
          {SERVICE_SORT_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </Select>
      </div>
    </div>
  )
}
