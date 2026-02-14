'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { elementId } from '@/lib/utils/element-ids'
import { formatCurrency } from '@/lib/utils/format'
import type { InsuranceVerification } from '@/types/database'
import { Calculator, DollarSign, ArrowDown, HelpCircle } from 'lucide-react'

interface ReimbursementEstimatorProps {
  verification: InsuranceVerification
}

interface EstimateResult {
  serviceCost: number
  allowedAmount: number
  deductibleRemaining: number
  deductibleApplied: number
  amountAfterDeductible: number
  coinsurancePct: number
  insurancePays: number
  patientResponsibility: number
}

export function ReimbursementEstimator({ verification }: ReimbursementEstimatorProps) {
  const [serviceCostInput, setServiceCostInput] = useState('')
  const [estimate, setEstimate] = useState<EstimateResult | null>(null)
  const [hasCalculated, setHasCalculated] = useState(false)

  const isVerified = verification.verification_status === 'verified'
  const hasOonData = verification.oon_deductible_individual !== null || verification.oon_coinsurance_pct !== null

  const calculateEstimate = useCallback(() => {
    const costDollars = parseFloat(serviceCostInput)
    if (isNaN(costDollars) || costDollars <= 0) {
      return
    }

    const serviceCostCents = Math.round(costDollars * 100)

    const oonDeductible = verification.oon_deductible_individual ?? 0
    const oonDeductibleMet = verification.oon_deductible_met ?? 0
    const oonDeductibleRemaining = Math.max(0, oonDeductible - oonDeductibleMet)
    const oonCoinsurancePct = verification.oon_coinsurance_pct ?? 40

    // Estimated allowed amount (insurer typically allows 60-80% of billed for OON)
    const allowedAmount = verification.estimated_allowed_amount ?? Math.round(serviceCostCents * 0.7)

    // Apply deductible
    const deductibleApplied = Math.min(oonDeductibleRemaining, allowedAmount)
    const amountAfterDeductible = Math.max(0, allowedAmount - deductibleApplied)

    // Insurance pays their portion (100% - patient's coinsurance %)
    const insurancePays = Math.round(amountAfterDeductible * ((100 - oonCoinsurancePct) / 100))
    const patientResponsibility = Math.max(0, serviceCostCents - insurancePays)

    setEstimate({
      serviceCost: serviceCostCents,
      allowedAmount,
      deductibleRemaining: oonDeductibleRemaining,
      deductibleApplied,
      amountAfterDeductible,
      coinsurancePct: oonCoinsurancePct,
      insurancePays,
      patientResponsibility,
    })
    setHasCalculated(true)
  }, [serviceCostInput, verification])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      calculateEstimate()
    }
  }

  if (!isVerified || !hasOonData) {
    return (
      <Card id={elementId('insurance', 'estimator', 'disabled')}>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calculator className="w-5 h-5 text-gray-400" />
            Reimbursement Estimator
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Calculator className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">
              The reimbursement estimator will be available once your insurance benefits
              have been verified.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card id={elementId('insurance', 'estimator')}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Calculator className="w-5 h-5 text-blue-600" />
          Reimbursement Estimator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Input Section */}
        <div className="space-y-3">
          <label
            htmlFor="service-cost-input"
            className="text-sm font-medium text-gray-700"
          >
            Enter service cost (cash price)
          </label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="service-cost-input"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g., 5000.00"
                value={serviceCostInput}
                onChange={(e) => setServiceCostInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-9"
              />
            </div>
            <Button onClick={calculateEstimate} disabled={!serviceCostInput}>
              Calculate
            </Button>
          </div>
        </div>

        {/* Estimate Results */}
        {hasCalculated && estimate && (
          <>
            <Separator />

            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-900">
                Estimated Breakdown
              </h4>

              <div className="rounded-lg border border-gray-100 overflow-hidden">
                {/* Service Cost */}
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
                  <span className="text-sm text-gray-600">Service Cost (Cash Price)</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(estimate.serviceCost)}
                  </span>
                </div>

                <div className="px-4 py-2 flex items-center justify-center">
                  <ArrowDown className="w-4 h-4 text-gray-300" />
                </div>

                {/* Allowed Amount */}
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-gray-600">Estimated Allowed Amount</span>
                    <div className="group relative">
                      <HelpCircle className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 rounded-lg bg-gray-900 px-3 py-2 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        The amount your insurance considers reasonable for this service from an out-of-network provider. This is typically less than the billed charge.
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {formatCurrency(estimate.allowedAmount)}
                  </span>
                </div>

                {/* Deductible Applied */}
                <div className="flex items-center justify-between px-4 py-3 bg-red-50/50">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-gray-600">Deductible Applied</span>
                    <span className="text-xs text-gray-400">
                      ({formatCurrency(estimate.deductibleRemaining)} remaining)
                    </span>
                  </div>
                  <span className="text-sm font-medium text-red-600">
                    -{formatCurrency(estimate.deductibleApplied)}
                  </span>
                </div>

                {/* Amount After Deductible */}
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-gray-600">Amount After Deductible</span>
                  <span className="text-sm font-medium text-gray-700">
                    {formatCurrency(estimate.amountAfterDeductible)}
                  </span>
                </div>

                {/* Coinsurance */}
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-gray-600">
                      Your Coinsurance ({estimate.coinsurancePct}%)
                    </span>
                    <div className="group relative">
                      <HelpCircle className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 rounded-lg bg-gray-900 px-3 py-2 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        For out-of-network services, you typically pay a higher coinsurance percentage than you would for in-network services.
                      </div>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {Math.round(estimate.amountAfterDeductible * (estimate.coinsurancePct / 100))} cents
                  </span>
                </div>

                <Separator />

                {/* Insurance Pays */}
                <div className="flex items-center justify-between px-4 py-3 bg-emerald-50">
                  <span className="text-sm font-semibold text-emerald-800">
                    Estimated Insurance Payment
                  </span>
                  <span className="text-lg font-bold text-emerald-700">
                    {formatCurrency(estimate.insurancePays)}
                  </span>
                </div>

                {/* Patient Responsibility */}
                <div className="flex items-center justify-between px-4 py-4 bg-blue-50">
                  <span className="text-sm font-semibold text-blue-800">
                    Estimated Patient Responsibility
                  </span>
                  <span className="text-lg font-bold text-blue-700">
                    {formatCurrency(estimate.patientResponsibility)}
                  </span>
                </div>
              </div>

              {/* Savings callout */}
              {estimate.insurancePays > 0 && (
                <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-4">
                  <p className="text-sm text-emerald-800">
                    <strong>Estimated Savings:</strong> By submitting your superbill, you may recover
                    approximately <strong>{formatCurrency(estimate.insurancePays)}</strong> from your insurance.
                    This represents{' '}
                    <strong>
                      {Math.round((estimate.insurancePays / estimate.serviceCost) * 100)}%
                    </strong>{' '}
                    of the service cost.
                  </p>
                </div>
              )}

              {/* Disclaimer */}
              <div className="rounded-lg bg-gray-50 border border-gray-100 p-4">
                <p className="text-xs text-gray-500 leading-relaxed">
                  <strong>Disclaimer:</strong> This estimate is based on your verified
                  out-of-network benefits and is provided for informational purposes only.
                  Actual reimbursement amounts are determined by your insurance company and
                  may differ based on their review of the claim, allowed amounts, and any
                  additional policy provisions. Foundation Health does not guarantee any
                  specific reimbursement amount.
                </p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
