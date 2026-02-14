'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Select } from '@/components/ui/select'
import { SUPERBILL_STATUSES } from '@/lib/validations/superbills'

export function SuperbillFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentStatus = searchParams.get('status') ?? ''

  const handleStatusChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value
      const params = new URLSearchParams(searchParams.toString())

      if (value) {
        params.set('status', value)
      } else {
        params.delete('status')
      }

      const query = params.toString()
      router.push(query ? `${pathname}?${query}` : pathname)
    },
    [router, pathname, searchParams]
  )

  return (
    <div className="w-48">
      <Select
        value={currentStatus}
        onChange={handleStatusChange}
        aria-label="Filter by status"
      >
        <option value="">All Statuses</option>
        {SUPERBILL_STATUSES.map((status) => (
          <option key={status.value} value={status.value}>
            {status.label}
          </option>
        ))}
      </Select>
    </div>
  )
}
