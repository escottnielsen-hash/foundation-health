'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { elementId } from '@/lib/utils/element-ids'
import type { ClaimWithDetails } from '@/types/database'
import { DollarSign, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react'

interface ClaimFinancialSummaryProps {
  claim: ClaimWithDetails
}

function formatCurrency(cents: number | null): string {
  if (cents == null) return '--'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}

function formatMultiplier(multiplier: number | null): string {
  if (multiplier == null) return '--'
  return `${multiplier.toFixed(1)}x QPA`
}

interface FinancialRowProps {
  label: string
  value: string
  highlight?: 'positive' | 'negative' | 'warning' | 'neutral'
  bold?: boolean
}

function FinancialRow({ label, value, highlight = 'neutral', bold = false }: FinancialRowProps) {
  const colorClasses: Record<string, string> = {
    positive: 'text-emerald-600',
    negative: 'text-red-600',
    warning: 'text-amber-600',
    neutral: 'text-gray-900',
  }

  return (
    <div className="flex items-center justify-between py-2">
      <span className={`text-sm ${bold ? 'font-medium' : ''} text-gray-600`}>
        {label}
      </span>
      <span
        className={`text-sm ${bold ? 'font-semibold' : 'font-medium'} ${colorClasses[highlight]}`}
      >
        {value}
      </span>
    </div>
  )
}

export function ClaimFinancialSummary({ claim }: ClaimFinancialSummaryProps) {
  const billedAmount = claim.billed_amount
  const qpaAmount = claim.qpa_amount
  const allowedAmount = claim.allowed_amount
  const paidAmount = claim.paid_amount
  const patientResponsibility = claim.patient_responsibility

  // Calculate the gap between billed and paid
  const unpaidAmount = paidAmount != null
    ? billedAmount - paidAmount
    : null

  // Calculate percentage paid
  const paidPercentage = paidAmount != null && billedAmount > 0
    ? Math.round((paidAmount / billedAmount) * 100)
    : null

  return (
    <Card id={elementId('claims', 'financial', 'summary')}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-gray-500" />
          Financial Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {/* Billed vs QPA comparison */}
        <div className="bg-blue-50 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              No Surprises Act Comparison
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-blue-600 mb-0.5">Billed Amount</p>
              <p className="text-lg font-semibold text-blue-900">
                {formatCurrency(billedAmount)}
              </p>
            </div>
            <div>
              <p className="text-xs text-blue-600 mb-0.5">QPA (Qualifying Payment)</p>
              <p className="text-lg font-semibold text-blue-900">
                {formatCurrency(qpaAmount)}
              </p>
            </div>
          </div>
          {claim.billed_multiplier != null && (
            <p className="text-sm text-blue-700 mt-2 font-medium">
              Billed at {formatMultiplier(claim.billed_multiplier)}
            </p>
          )}
        </div>

        {/* Line items */}
        <FinancialRow
          label="Total Billed"
          value={formatCurrency(billedAmount)}
          bold
        />
        <FinancialRow
          label="Qualifying Payment Amount (QPA)"
          value={formatCurrency(qpaAmount)}
        />
        <FinancialRow
          label="Billed Multiplier"
          value={formatMultiplier(claim.billed_multiplier)}
        />

        <Separator className="my-2" />

        <FinancialRow
          label="Allowed Amount"
          value={formatCurrency(allowedAmount)}
        />
        <FinancialRow
          label="Amount Paid"
          value={formatCurrency(paidAmount)}
          highlight={paidAmount != null && paidAmount > 0 ? 'positive' : 'neutral'}
          bold
        />
        <FinancialRow
          label="Patient Responsibility"
          value={formatCurrency(patientResponsibility)}
          highlight={patientResponsibility != null && patientResponsibility > 0 ? 'warning' : 'neutral'}
        />

        {unpaidAmount != null && unpaidAmount > 0 && (
          <>
            <Separator className="my-2" />
            <FinancialRow
              label="Outstanding Balance"
              value={formatCurrency(unpaidAmount)}
              highlight="negative"
              bold
            />
          </>
        )}

        {/* Payment progress */}
        {paidPercentage != null && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">Payment Progress</span>
              <span className="text-xs font-medium text-gray-700">
                {paidPercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  paidPercentage >= 100
                    ? 'bg-emerald-500'
                    : paidPercentage >= 50
                    ? 'bg-blue-500'
                    : 'bg-amber-500'
                }`}
                style={{ width: `${Math.min(paidPercentage, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* IDR eligibility notice */}
        {claim.idr_eligible && (
          <div className="mt-4 flex items-start gap-2 bg-indigo-50 rounded-lg p-3">
            <AlertTriangle className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-indigo-800">
                IDR Eligible
              </p>
              <p className="text-xs text-indigo-600 mt-0.5">
                This claim is eligible for Independent Dispute Resolution under the No Surprises Act.
              </p>
            </div>
          </div>
        )}

        {/* Paid confirmation */}
        {claim.claim_status === 'paid' && (
          <div className="mt-4 flex items-start gap-2 bg-emerald-50 rounded-lg p-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-emerald-800">
                Claim Paid in Full
              </p>
              <p className="text-xs text-emerald-600 mt-0.5">
                This claim has been fully resolved and paid.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
