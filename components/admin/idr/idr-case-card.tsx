import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { elementId } from '@/lib/utils/element-ids'
import { IDR_STATUS_CONFIG } from '@/lib/validations/idr'
import type { IdrCaseWithClaim } from '@/lib/actions/idr'
import type { IdrCaseStatus } from '@/types/database'
import { ArrowRight, Calendar, DollarSign, Building2, AlertTriangle } from 'lucide-react'

interface IdrCaseCardProps {
  idrCase: IdrCaseWithClaim
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatCurrency(amount: number | null): string {
  if (amount === null || amount === 0) return '-'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount / 100)
}

function formatCurrencyDollars(amount: number | null): string {
  if (amount === null || amount === 0) return '-'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

function isDeadlineApproaching(dateString: string | null): boolean {
  if (!dateString) return false
  const deadline = new Date(dateString)
  const now = new Date()
  const daysUntil = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return daysUntil >= 0 && daysUntil <= 7
}

export function IdrCaseCard({ idrCase }: IdrCaseCardProps) {
  const statusConfig = IDR_STATUS_CONFIG[idrCase.status as IdrCaseStatus] ?? {
    label: idrCase.status.replace(/_/g, ' '),
    variant: 'outline' as const,
  }

  const providerOffer = idrCase.provider_offer_amount ?? idrCase.provider_proposed_amount
  const payerOffer = idrCase.payer_offer_amount ?? idrCase.payer_proposed_amount
  const disputedAmount = idrCase.disputed_amount
  const deadlineApproaching = isDeadlineApproaching(idrCase.decision_due_date ?? idrCase.offers_due_date)

  return (
    <Card
      id={elementId('admin', 'idr', 'case', idrCase.id)}
      className={`transition-shadow hover:shadow-md ${deadlineApproaching ? 'border-amber-300 ring-1 ring-amber-200' : ''}`}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-bold text-gray-900">
                {idrCase.case_number ?? `IDR-${idrCase.id.slice(0, 8)}`}
              </span>
              <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
              {deadlineApproaching && (
                <Badge variant="warning" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Deadline Soon
                </Badge>
              )}
            </div>

            <p className="text-sm text-gray-500 mb-3">
              Claim: {idrCase.claim_number ?? '-'}
            </p>

            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-500">
                <Building2 className="h-3.5 w-3.5" />
                <span>{idrCase.payer_name ?? 'Unknown Payer'}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <Calendar className="h-3.5 w-3.5" />
                <span>Filed: {formatDate(idrCase.created_at)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <DollarSign className="h-3.5 w-3.5" />
                <span>Disputed: {formatCurrencyDollars(disputedAmount)}</span>
              </div>
              {idrCase.idr_entity && (
                <div className="flex items-center gap-2 text-gray-500">
                  <Building2 className="h-3.5 w-3.5" />
                  <span>Entity: {idrCase.idr_entity}</span>
                </div>
              )}
            </div>

            {(providerOffer !== null || payerOffer !== null) && (
              <div className="mt-3 flex items-center gap-4 border-t border-gray-100 pt-3">
                <div>
                  <span className="text-xs text-gray-500">Our Offer</span>
                  <p className="text-sm font-semibold text-emerald-700">
                    {formatCurrency(providerOffer)}
                  </p>
                </div>
                <div className="h-6 w-px bg-gray-200" />
                <div>
                  <span className="text-xs text-gray-500">Payer Offer</span>
                  <p className="text-sm font-semibold text-red-700">
                    {formatCurrency(payerOffer)}
                  </p>
                </div>
                {idrCase.decision_amount !== null && (
                  <>
                    <div className="h-6 w-px bg-gray-200" />
                    <div>
                      <span className="text-xs text-gray-500">Decision</span>
                      <p className="text-sm font-semibold text-blue-700">
                        {formatCurrency(idrCase.decision_amount)}
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <Button variant="ghost" size="sm" asChild>
            <Link href={`/admin/claims/idr/${idrCase.id}`}>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
