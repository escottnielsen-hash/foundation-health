'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectItem } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { inputId, btnId } from '@/lib/utils/element-ids'
import type { AuditLogFilter } from '@/types/settings'

// ============================================
// Audit actions for the filter dropdown
// ============================================

const AUDIT_ACTIONS = [
  { value: '', label: 'All Actions' },
  { value: 'create', label: 'Create' },
  { value: 'read', label: 'Read' },
  { value: 'update', label: 'Update' },
  { value: 'delete', label: 'Delete' },
  { value: 'login', label: 'Login' },
  { value: 'logout', label: 'Logout' },
  { value: 'export', label: 'Export' },
  { value: 'share', label: 'Share' },
] as const

// ============================================
// Audit Log Filter
// ============================================

interface AuditLogFilterProps {
  currentFilters: AuditLogFilter
  onFilterChange: (filters: AuditLogFilter) => void
}

export function AuditLogFilterBar({
  currentFilters,
  onFilterChange,
}: AuditLogFilterProps) {
  const handleChange = (key: keyof AuditLogFilter, value: string) => {
    onFilterChange({
      ...currentFilters,
      [key]: value,
      page: 1, // Reset page when filters change
    })
  }

  const handleReset = () => {
    onFilterChange({
      page: 1,
      per_page: 25,
    })
  }

  return (
    <div className="flex flex-col md:flex-row gap-3 mb-4">
      <div className="space-y-1">
        <Label htmlFor={inputId('audit-date-from')} className="text-xs">
          From
        </Label>
        <Input
          id={inputId('audit-date-from')}
          type="date"
          value={currentFilters.date_from ?? ''}
          onChange={(e) => handleChange('date_from', e.target.value)}
          className="h-9"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor={inputId('audit-date-to')} className="text-xs">
          To
        </Label>
        <Input
          id={inputId('audit-date-to')}
          type="date"
          value={currentFilters.date_to ?? ''}
          onChange={(e) => handleChange('date_to', e.target.value)}
          className="h-9"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor={inputId('audit-action')} className="text-xs">
          Action
        </Label>
        <Select
          id={inputId('audit-action')}
          value={currentFilters.action ?? ''}
          onChange={(e) => handleChange('action', e.target.value)}
          className="h-9"
        >
          {AUDIT_ACTIONS.map((a) => (
            <SelectItem key={a.value} value={a.value}>
              {a.label}
            </SelectItem>
          ))}
        </Select>
      </div>

      <div className="space-y-1">
        <Label htmlFor={inputId('audit-table')} className="text-xs">
          Entity Type
        </Label>
        <Input
          id={inputId('audit-table')}
          type="text"
          placeholder="e.g. profiles"
          value={currentFilters.table_name ?? ''}
          onChange={(e) => handleChange('table_name', e.target.value)}
          className="h-9"
        />
      </div>

      <div className="flex items-end">
        <Button
          id={btnId('reset', 'audit-filters')}
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
