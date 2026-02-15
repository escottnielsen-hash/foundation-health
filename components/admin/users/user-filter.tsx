'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectItem } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { inputId, btnId } from '@/lib/utils/element-ids'
import type { UserListFilter } from '@/types/settings'

// ============================================
// Role options for filter
// ============================================

const ROLE_OPTIONS = [
  { value: '', label: 'All Roles' },
  { value: 'patient', label: 'Patient' },
  { value: 'physician', label: 'Physician' },
  { value: 'staff', label: 'Staff' },
  { value: 'admin', label: 'Admin' },
] as const

// ============================================
// User Filter Bar
// ============================================

interface UserFilterProps {
  currentFilters: UserListFilter
  onFilterChange: (filters: UserListFilter) => void
}

export function UserFilterBar({
  currentFilters,
  onFilterChange,
}: UserFilterProps) {
  const handleSearchChange = (value: string) => {
    onFilterChange({
      ...currentFilters,
      search: value,
      page: 1,
    })
  }

  const handleRoleChange = (value: string) => {
    onFilterChange({
      ...currentFilters,
      role: value as UserListFilter['role'],
      page: 1,
    })
  }

  const handleReset = () => {
    onFilterChange({
      page: 1,
      per_page: 20,
    })
  }

  return (
    <div className="flex flex-col md:flex-row gap-3 mb-4">
      <div className="flex-1 space-y-1">
        <Label htmlFor={inputId('user-search')} className="text-xs">
          Search
        </Label>
        <Input
          id={inputId('user-search')}
          type="text"
          placeholder="Search by name or email..."
          value={currentFilters.search ?? ''}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="h-9"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor={inputId('user-role')} className="text-xs">
          Role
        </Label>
        <Select
          id={inputId('user-role')}
          value={currentFilters.role ?? ''}
          onChange={(e) => handleRoleChange(e.target.value)}
          className="h-9"
        >
          {ROLE_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </Select>
      </div>

      <div className="flex items-end">
        <Button
          id={btnId('reset', 'user-filters')}
          type="button"
          variant="outline"
          size="sm"
          onClick={handleReset}
        >
          Reset
        </Button>
      </div>
    </div>
  )
}
