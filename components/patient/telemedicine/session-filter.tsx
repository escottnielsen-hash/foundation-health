'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Select, SelectItem } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { elementId } from '@/lib/utils/element-ids'

const SESSION_TYPES = [
  { value: 'pre_op_consult', label: 'Pre-Op Consult' },
  { value: 'post_op_followup', label: 'Post-Op Follow-Up' },
  { value: 'general_consult', label: 'General Consultation' },
  { value: 'second_opinion', label: 'Second Opinion' },
  { value: 'urgent_care', label: 'Urgent Care' },
]

const SESSION_STATUSES = [
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'waiting_room', label: 'In Waiting Room' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'no_show', label: 'No Show' },
]

export function SessionFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentType = searchParams.get('type') ?? ''
  const currentStatus = searchParams.get('status') ?? ''

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
      id={elementId('telemedicine', 'filter', 'container')}
      className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
    >
      <div className="flex items-center gap-2">
        <Label
          htmlFor={elementId('telemedicine', 'filter', 'type')}
          className="text-sm font-medium text-gray-700 whitespace-nowrap"
        >
          Type:
        </Label>
        <div className="w-48">
          <Select
            id={elementId('telemedicine', 'filter', 'type')}
            value={currentType}
            onChange={(e) => updateFilter('type', e.target.value)}
          >
            <option value="">All Types</option>
            {SESSION_TYPES.map((st) => (
              <SelectItem key={st.value} value={st.value}>
                {st.label}
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Label
          htmlFor={elementId('telemedicine', 'filter', 'status')}
          className="text-sm font-medium text-gray-700 whitespace-nowrap"
        >
          Status:
        </Label>
        <div className="w-44">
          <Select
            id={elementId('telemedicine', 'filter', 'status')}
            value={currentStatus}
            onChange={(e) => updateFilter('status', e.target.value)}
          >
            <option value="">All Statuses</option>
            {SESSION_STATUSES.map((ss) => (
              <SelectItem key={ss.value} value={ss.value}>
                {ss.label}
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>
    </div>
  )
}
