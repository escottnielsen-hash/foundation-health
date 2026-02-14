'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { elementId } from '@/lib/utils/element-ids'
import { SUPERBILL_STATUS_CONFIG } from '@/lib/validations/superbills'
import type { SuperbillStatus } from '@/types/database'
import type { DiagnosisCodeEntry } from '@/types/database'
import { format } from 'date-fns'

interface SuperbillCardProps {
  id: string
  dateOfService: string
  providerName: string | null
  diagnosisCodes: DiagnosisCodeEntry[]
  totalChargeCents: number
  status: SuperbillStatus
}

export function SuperbillCard({
  id,
  dateOfService,
  providerName,
  diagnosisCodes,
  totalChargeCents,
  status,
}: SuperbillCardProps) {
  const router = useRouter()

  const handleClick = () => {
    router.push(`/patient/billing/superbills/${id}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      router.push(`/patient/billing/superbills/${id}`)
    }
  }

  const formatDate = (dateStr: string): string => {
    try {
      return format(new Date(dateStr + 'T00:00:00'), 'MMM d, yyyy')
    } catch {
      return dateStr
    }
  }

  const formatCurrency = (cents: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100)
  }

  const statusConfig = SUPERBILL_STATUS_CONFIG[status] ?? {
    label: status,
    variant: 'outline' as const,
  }

  const diagnosisSummary =
    diagnosisCodes.length === 0
      ? 'No diagnoses'
      : diagnosisCodes.length === 1
        ? diagnosisCodes[0].code
        : `${diagnosisCodes[0].code} + ${diagnosisCodes.length - 1} more`

  return (
    <Card
      id={elementId('superbills', 'item', id)}
      className="hover:border-primary/30 hover:shadow-md transition-all cursor-pointer"
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          {/* Left: Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1.5">
              <h3 className="text-base font-semibold text-gray-900">
                {formatDate(dateOfService)}
              </h3>
              <Badge variant={statusConfig.variant}>
                {statusConfig.label}
              </Badge>
            </div>

            <p className="text-sm text-gray-600 mb-2">
              {diagnosisSummary}
            </p>

            <div className="flex items-center gap-4 text-xs text-gray-400">
              {providerName && (
                <span className="flex items-center gap-1">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Dr. {providerName}
                </span>
              )}
              <span className="flex items-center gap-1">
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                {diagnosisCodes.length} {diagnosisCodes.length === 1 ? 'diagnosis' : 'diagnoses'}
              </span>
            </div>
          </div>

          {/* Right: Amount + Chevron */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-right">
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(totalChargeCents)}
              </p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">
                Total Charges
              </p>
            </div>
            <div className="text-gray-300 mt-0.5">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
