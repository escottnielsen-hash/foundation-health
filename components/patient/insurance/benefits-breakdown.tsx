'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { elementId } from '@/lib/utils/element-ids'
import { formatCurrency } from '@/lib/utils/format'
import type { OonBenefitsSummary } from '@/lib/actions/insurance'
import { ArrowRight, TrendingDown, TrendingUp } from 'lucide-react'

interface BenefitsBreakdownProps {
  summary: OonBenefitsSummary
}

function ProgressBar({ value, max, label, metLabel }: { value: number; max: number; label: string; metLabel: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className="font-medium text-gray-900">{metLabel}</span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-gray-100">
        <div
          className={`h-2.5 rounded-full transition-all ${
            pct >= 100 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-blue-500'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>{formatCurrency(value)} met</span>
        <span>{formatCurrency(max)} total</span>
      </div>
    </div>
  )
}

function ComparisonRow({
  label,
  innValue,
  oonValue,
}: {
  label: string
  innValue: string
  oonValue: string
}) {
  return (
    <div className="grid grid-cols-3 gap-4 py-3">
      <div className="text-sm font-medium text-gray-700">{label}</div>
      <div className="text-sm text-center">
        <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
          {innValue}
        </span>
      </div>
      <div className="text-sm text-center">
        <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
          {oonValue}
        </span>
      </div>
    </div>
  )
}

export function BenefitsBreakdown({ summary }: BenefitsBreakdownProps) {
  const v = summary.verification

  const hasOonData = v.oon_deductible_individual !== null || v.oon_coinsurance_pct !== null
  const hasInnData = v.inn_deductible_individual !== null || v.inn_coinsurance_pct !== null

  if (!hasOonData) {
    return (
      <Card id={elementId('insurance', 'benefits', 'pending')}>
        <CardContent className="py-12 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6 text-amber-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Benefits Not Yet Verified
          </h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Your out-of-network benefits will be displayed here once our team
            completes the verification with your insurance company.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div id={elementId('insurance', 'benefits', 'breakdown')} className="space-y-6">
      {/* Deductible & OOP Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">OON Benefits Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {v.oon_deductible_individual !== null && (
            <ProgressBar
              value={v.oon_deductible_met ?? 0}
              max={v.oon_deductible_individual}
              label="OON Deductible"
              metLabel={`${summary.deductible_met_pct}% met`}
            />
          )}

          {v.oon_out_of_pocket_max !== null && (
            <ProgressBar
              value={v.oon_out_of_pocket_met ?? 0}
              max={v.oon_out_of_pocket_max}
              label="OON Out-of-Pocket Maximum"
              metLabel={`${summary.oop_met_pct}% met`}
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-blue-50 p-4">
              <p className="text-xs font-medium text-blue-600 uppercase tracking-wider mb-1">
                Deductible Remaining
              </p>
              <p className="text-xl font-bold text-blue-900">
                {formatCurrency(summary.oon_deductible_remaining)}
              </p>
            </div>
            <div className="rounded-lg bg-purple-50 p-4">
              <p className="text-xs font-medium text-purple-600 uppercase tracking-wider mb-1">
                OOP Max Remaining
              </p>
              <p className="text-xl font-bold text-purple-900">
                {formatCurrency(summary.oon_oop_remaining)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* In-Network vs Out-of-Network Comparison */}
      {hasInnData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              In-Network vs Out-of-Network
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-gray-100">
              {/* Header */}
              <div className="grid grid-cols-3 gap-4 px-4 py-3 bg-gray-50 rounded-t-lg">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Benefit
                </div>
                <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider text-center flex items-center justify-center gap-1">
                  <TrendingDown className="w-3 h-3" />
                  In-Network
                </div>
                <div className="text-xs font-semibold text-amber-600 uppercase tracking-wider text-center flex items-center justify-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Out-of-Network
                </div>
              </div>

              <div className="px-4 divide-y divide-gray-100">
                <ComparisonRow
                  label="Deductible"
                  innValue={
                    v.inn_deductible_individual !== null
                      ? formatCurrency(v.inn_deductible_individual)
                      : 'N/A'
                  }
                  oonValue={
                    v.oon_deductible_individual !== null
                      ? formatCurrency(v.oon_deductible_individual)
                      : 'N/A'
                  }
                />
                <ComparisonRow
                  label="Coinsurance"
                  innValue={
                    v.inn_coinsurance_pct !== null
                      ? `${v.inn_coinsurance_pct}%`
                      : 'N/A'
                  }
                  oonValue={
                    v.oon_coinsurance_pct !== null
                      ? `${v.oon_coinsurance_pct}%`
                      : 'N/A'
                  }
                />
                {v.oon_out_of_pocket_max !== null && (
                  <ComparisonRow
                    label="OOP Maximum"
                    innValue="N/A"
                    oonValue={formatCurrency(v.oon_out_of_pocket_max)}
                  />
                )}
                {v.oon_deductible_family !== null && (
                  <ComparisonRow
                    label="Family Deductible"
                    innValue="N/A"
                    oonValue={formatCurrency(v.oon_deductible_family)}
                  />
                )}
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-amber-50 border border-amber-100 p-4">
              <p className="text-xs text-amber-800">
                <strong>Important:</strong> As an out-of-network provider, Foundation Health
                charges are subject to your OON benefits. Your insurance may pay based on
                their allowed amount, which can differ from our billed charges. The coinsurance
                percentage shown represents your share of the allowed amount after meeting
                your deductible.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
