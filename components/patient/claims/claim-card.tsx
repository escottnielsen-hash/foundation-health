'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { ClaimStatusBadge } from '@/components/patient/claims/claim-status-badge'
import { elementId } from '@/lib/utils/element-ids'
import type { ClaimStatus } from '@/types/database'
import { format } from 'date-fns'
import { ChevronRight, Calendar, Building2, DollarSign } from 'lucide-react'

interface ClaimCardProps {
  id: string
  claimNumber: string | null
  payerName: string | null
  status: ClaimStatus
  serviceDate: string | null
  billedAmount: number
  paidAmount: number | null
  denialReason: string | null
  appealDeadline: string | null
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'N/A'
  try {
    return format(new Date(dateStr), 'MMM d, yyyy')
  } catch {
    return dateStr
  }
}

export function ClaimCard({
  id,
  claimNumber,
  payerName,
  status,
  serviceDate,
  billedAmount,
  paidAmount,
  denialReason,
  appealDeadline,
}: ClaimCardProps) {
  const router = useRouter()

  const handleClick = () => {
    router.push(`/patient/claims/${id}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      router.push(`/patient/claims/${id}`)
    }
  }

  const isOverdueAppeal =
    status === 'denied' &&
    appealDeadline &&
    new Date(appealDeadline) < new Date()

  const isUrgentAppeal =
    status === 'denied' &&
    appealDeadline &&
    !isOverdueAppeal &&
    new Date(appealDeadline).getTime() - Date.now() < 14 * 24 * 60 * 60 * 1000

  return (
    <Card
      id={elementId('claims', 'item', id)}
      className="hover:border-primary/30 hover:shadow-md transition-all cursor-pointer"
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Header row: claim number + status */}
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-base font-semibold text-gray-900 truncate">
                {claimNumber ? `Claim ${claimNumber}` : 'Claim (Pending Number)'}
              </h3>
              <ClaimStatusBadge status={status} />
            </div>

            {/* Denial reason */}
            {status === 'denied' && denialReason && (
              <p className="text-sm text-red-600 mb-2 line-clamp-1">
                Denied: {denialReason}
              </p>
            )}

            {/* Appeal deadline warning */}
            {isUrgentAppeal && (
              <p className="text-sm text-amber-600 font-medium mb-2">
                Appeal deadline: {formatDate(appealDeadline)}
              </p>
            )}
            {isOverdueAppeal && (
              <p className="text-sm text-red-600 font-medium mb-2">
                Appeal deadline passed: {formatDate(appealDeadline)}
              </p>
            )}

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
              {serviceDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(serviceDate)}
                </span>
              )}
              {payerName && (
                <span className="flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  {payerName}
                </span>
              )}
              <span className="flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                Billed: {formatCurrency(billedAmount)}
              </span>
              {paidAmount != null && paidAmount > 0 && (
                <span className="flex items-center gap-1 text-emerald-600">
                  <DollarSign className="w-3 h-3" />
                  Paid: {formatCurrency(paidAmount)}
                </span>
              )}
            </div>
          </div>

          {/* Right: Chevron */}
          <div className="flex-shrink-0 text-gray-300 mt-1">
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
