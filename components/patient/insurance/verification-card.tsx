'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { VerificationStatusBadge } from '@/components/patient/insurance/verification-status-badge'
import { elementId } from '@/lib/utils/element-ids'
import { formatCurrency } from '@/lib/utils/format'
import type { InsuranceVerification } from '@/types/database'
import { format } from 'date-fns'
import { Shield, ChevronRight, Building2, CreditCard } from 'lucide-react'

interface VerificationCardProps {
  verification: InsuranceVerification
}

export function VerificationCard({ verification }: VerificationCardProps) {
  const router = useRouter()

  const handleClick = () => {
    router.push(`/patient/insurance/${verification.id}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      router.push(`/patient/insurance/${verification.id}`)
    }
  }

  const formatDate = (dateStr: string): string => {
    try {
      return format(new Date(dateStr), 'MMM d, yyyy')
    } catch {
      return dateStr
    }
  }

  const planTypeLabel = verification.plan_type ?? 'N/A'

  const deductibleDisplay = verification.oon_deductible_individual !== null
    ? formatCurrency(verification.oon_deductible_individual)
    : 'Not verified'

  const coinsuranceDisplay = verification.oon_coinsurance_pct !== null
    ? `${verification.oon_coinsurance_pct}%`
    : 'Not verified'

  return (
    <Card
      id={elementId('insurance', 'verification', verification.id)}
      className="hover:border-primary/30 hover:shadow-md transition-all cursor-pointer"
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-base font-semibold text-gray-900 truncate">
                  {verification.payer_name}
                </h3>
                <VerificationStatusBadge status={verification.verification_status} />
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 mb-2">
                <span className="flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5" />
                  {verification.member_id}
                </span>
                {verification.group_number && (
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5" />
                    Group: {verification.group_number}
                  </span>
                )}
                <span className="text-xs text-gray-400">
                  {planTypeLabel}
                </span>
              </div>

              {verification.verification_status === 'verified' && (
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span>OON Deductible: {deductibleDisplay}</span>
                  <span>OON Coinsurance: {coinsuranceDisplay}</span>
                </div>
              )}

              {verification.verification_status === 'pending' && (
                <p className="text-xs text-amber-600">
                  Verification in progress. We will update your benefits once confirmed.
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-right">
              <p className="text-xs text-gray-400">
                Submitted {formatDate(verification.created_at)}
              </p>
              {verification.verified_at && (
                <p className="text-xs text-emerald-600">
                  Verified {formatDate(verification.verified_at)}
                </p>
              )}
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
