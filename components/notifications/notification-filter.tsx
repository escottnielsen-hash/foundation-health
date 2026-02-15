'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Select, SelectItem } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { NOTIFICATION_TYPES, NOTIFICATION_READ_STATUSES } from '@/lib/validations/notifications'
import { elementId } from '@/lib/utils/element-ids'

// ============================================
// NotificationFilter component
// ============================================

export function NotificationFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentType = searchParams.get('type') ?? ''
  const currentReadStatus = searchParams.get('read_status') ?? ''

  const updateFilter = useCallback(
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

  return (
    <div
      id={elementId('notifications', 'filter', 'container')}
      className="flex flex-col gap-3 sm:flex-row sm:items-center"
    >
      {/* Type filter */}
      <div className="flex items-center gap-2">
        <Label
          htmlFor={elementId('notifications', 'filter', 'type')}
          className="text-sm font-medium text-gray-700 whitespace-nowrap"
        >
          Type:
        </Label>
        <div className="w-44">
          <Select
            id={elementId('notifications', 'filter', 'type')}
            value={currentType}
            onChange={(e) => updateFilter('type', e.target.value)}
          >
            <option value="">All Types</option>
            {NOTIFICATION_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>

      {/* Read status filter */}
      <div className="flex items-center gap-2">
        <Label
          htmlFor={elementId('notifications', 'filter', 'read-status')}
          className="text-sm font-medium text-gray-700 whitespace-nowrap"
        >
          Status:
        </Label>
        <div className="w-36">
          <Select
            id={elementId('notifications', 'filter', 'read-status')}
            value={currentReadStatus}
            onChange={(e) => updateFilter('read_status', e.target.value)}
          >
            {NOTIFICATION_READ_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>
    </div>
  )
}
