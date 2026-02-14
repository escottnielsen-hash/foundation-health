import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { elementId } from '@/lib/utils/element-ids'
import type { IdrCaseWithClaim } from '@/lib/actions/idr'
import {
  ArrowUp,
  ArrowDown,
  Minus,
  DollarSign,
  Target,
  TrendingUp,
} from 'lucide-react'

interface OfferComparisonProps {
  idrCase: IdrCaseWithClaim
}

function formatCents(cents: number | null): string {
  if (cents === null || cents === 0) return '$0.00'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100)
}

function formatDollars(dollars: number | null): string {
  if (dollars === null || dollars === 0) return '$0.00'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(dollars)
}

function calculateMultiplier(amount: number | null, qpa: number | null): string {
  if (!amount || !qpa || qpa === 0) return '-'
  const multiplier = amount / qpa
  return `${multiplier.toFixed(1)}x`
}

export function OfferComparison({ idrCase }: OfferComparisonProps) {
  const providerOffer = idrCase.provider_offer_amount ?? idrCase.provider_proposed_amount
  const payerOffer = idrCase.payer_offer_amount ?? idrCase.payer_proposed_amount
  const qpaAmount = idrCase.qpa_amount ?? idrCase.qualifying_payment_amount
  const billedAmount = idrCase.provider_billed_amount ?? idrCase.billed_amount
  const decisionAmount = idrCase.decision_amount ?? idrCase.final_determined_amount
  const hasDecision = decisionAmount !== null && decisionAmount > 0

  // Determine if amounts are in cents or dollars
  // provider_offer_amount (enhanced) is in cents, billed_amount (from claims) is in dollars
  const providerOfferFormatted = providerOffer !== null ? formatCents(providerOffer) : '-'
  const payerOfferFormatted = payerOffer !== null ? formatCents(payerOffer) : 'Not submitted'
  const qpaFormatted = qpaAmount !== null ? formatCents(qpaAmount) : '-'
  const billedFormatted = billedAmount !== null ? formatDollars(billedAmount) : '-'
  const decisionFormatted = decisionAmount !== null ? formatCents(decisionAmount) : '-'

  const providerMultiplier = providerOffer && qpaAmount ? calculateMultiplier(providerOffer, qpaAmount) : '-'
  const payerMultiplier = payerOffer && qpaAmount ? calculateMultiplier(payerOffer, qpaAmount) : '-'
  const decisionMultiplier = decisionAmount && qpaAmount ? calculateMultiplier(decisionAmount, qpaAmount) : '-'

  const spread = providerOffer !== null && payerOffer !== null
    ? providerOffer - payerOffer
    : null

  return (
    <Card id={elementId('admin', 'idr', 'offer-comparison')}>
      <CardHeader>
        <CardTitle className="text-base">Baseball-Style Offer Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        {/* QPA Reference */}
        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-800">QPA Reference</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-blue-600">Qualifying Payment Amount</span>
              <p className="text-lg font-bold text-blue-900">{qpaFormatted}</p>
            </div>
            <div>
              <span className="text-xs text-blue-600">Provider Billed Amount</span>
              <p className="text-lg font-bold text-blue-900">{billedFormatted}</p>
            </div>
          </div>
        </div>

        {/* Side-by-side comparison */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Provider Column */}
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-200">
                <ArrowUp className="h-4 w-4 text-emerald-700" />
              </div>
              <div>
                <span className="text-xs text-emerald-600">Provider Offer</span>
                <p className="text-xs text-emerald-500">(Our Position)</p>
              </div>
            </div>
            <p className="text-2xl font-bold text-emerald-900">{providerOfferFormatted}</p>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="success" className="text-xs">
                {providerMultiplier} QPA
              </Badge>
            </div>
          </div>

          {/* Payer Column */}
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-200">
                <ArrowDown className="h-4 w-4 text-red-700" />
              </div>
              <div>
                <span className="text-xs text-red-600">Payer Offer</span>
                <p className="text-xs text-red-500">(Insurer Position)</p>
              </div>
            </div>
            <p className="text-2xl font-bold text-red-900">{payerOfferFormatted}</p>
            {payerOffer !== null && (
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="destructive" className="text-xs">
                  {payerMultiplier} QPA
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Spread */}
        {spread !== null && (
          <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Minus className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-semibold text-gray-700">Spread Between Offers</span>
              </div>
              <span className="text-lg font-bold text-gray-900">{formatCents(spread)}</span>
            </div>
          </div>
        )}

        {/* Decision */}
        {hasDecision && (
          <>
            <Separator className="mb-6" />
            <div className="rounded-lg border-2 border-indigo-300 bg-indigo-50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="h-5 w-5 text-indigo-600" />
                <span className="text-sm font-semibold text-indigo-800">IDR Decision</span>
              </div>
              <p className="text-3xl font-bold text-indigo-900">{decisionFormatted}</p>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="default" className="text-xs">
                  {decisionMultiplier} QPA
                </Badge>
                {idrCase.prevailing_party && (
                  <Badge
                    variant={idrCase.prevailing_party === 'provider' ? 'success' : 'destructive'}
                    className="text-xs"
                  >
                    {idrCase.prevailing_party === 'provider' ? 'Provider Won' : 'Payer Won'}
                  </Badge>
                )}
              </div>
            </div>
          </>
        )}

        {/* Financial Impact */}
        {hasDecision && (
          <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-semibold text-gray-700">Financial Impact</span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-xs text-gray-500">Decision vs QPA</span>
                <p className="font-semibold text-gray-900">
                  {qpaAmount && decisionAmount
                    ? formatCents(decisionAmount - qpaAmount)
                    : '-'}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500">Decision vs Payer Offer</span>
                <p className="font-semibold text-gray-900">
                  {payerOffer !== null && decisionAmount
                    ? formatCents(decisionAmount - payerOffer)
                    : '-'}
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500">IDR Fee</span>
                <p className="font-semibold text-gray-900">
                  {idrCase.idr_fee_amount
                    ? `${formatCents(idrCase.idr_fee_amount)} (${idrCase.idr_fee_paid_by ?? 'TBD'})`
                    : '-'}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
