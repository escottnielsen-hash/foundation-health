'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Select } from '@/components/ui/select'
import { elementId } from '@/lib/utils/element-ids'
import { VERIFICATION_STATUSES } from '@/lib/validations/insurance'

export function InsuranceFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentStatus = searchParams.get('status') ?? ''

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    const params = new URLSearchParams(searchParams.toString())

    if (value) {
      params.set('status', value)
    } else {
      params.delete('status')
    }

    router.push(`/patient/insurance?${params.toString()}`)
  }

  return (
    <div
      id={elementId('insurance', 'filter')}
      className="flex items-center gap-3"
    >
      <label
        htmlFor="insurance-status-filter"
        className="text-sm font-medium text-gray-600 whitespace-nowrap"
      >
        Status:
      </label>
      <Select
        id="insurance-status-filter"
        value={currentStatus}
        onChange={handleStatusChange}
        className="w-40"
      >
        <option value="">All</option>
        {VERIFICATION_STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </Select>
    </div>
  )
}
