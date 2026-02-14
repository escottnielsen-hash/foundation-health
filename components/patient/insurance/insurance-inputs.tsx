'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useCalculatorStore } from '@/lib/stores/calculator-store'
import { inputId, btnId } from '@/lib/utils/element-ids'
import { formatCurrency } from '@/lib/utils/format'
import {
  ChevronLeft,
  ChevronRight,
  Shield,
  HelpCircle,
  AlertCircle,
} from 'lucide-react'

// ============================================
// Helper: Convert dollars to cents for storage
// ============================================

function dollarsToCents(dollars: string): number {
  const parsed = parseFloat(dollars)
  if (isNaN(parsed) || parsed < 0) return 0
  return Math.round(parsed * 100)
}

function centsToDollars(cents: number): string {
  if (cents === 0) return ''
  return (cents / 100).toFixed(2)
}

// ============================================
// InsuranceInputs Component
// ============================================

export function InsuranceInputs() {
  const { insuranceDetails, setInsuranceDetails, nextStep, prevStep } =
    useCalculatorStore()

  // Local state for string-based inputs (allowing user to type freely)
  const [deductible, setDeductible] = useState(
    centsToDollars(insuranceDetails.oonDeductible)
  )
  const [deductibleMet, setDeductibleMet] = useState(
    centsToDollars(insuranceDetails.oonDeductibleMet)
  )
  const [coinsurance, setCoinsurance] = useState(
    insuranceDetails.oonCoinsurancePct > 0
      ? insuranceDetails.oonCoinsurancePct.toString()
      : ''
  )
  const [oopMax, setOopMax] = useState(
    centsToDollars(insuranceDetails.oonOutOfPocketMax)
  )
  const [oopMet, setOopMet] = useState(
    centsToDollars(insuranceDetails.oonOutOfPocketMet)
  )

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    const deductibleCents = dollarsToCents(deductible)
    const deductibleMetCents = dollarsToCents(deductibleMet)
    const coinsurancePct = parseFloat(coinsurance)
    const oopMaxCents = dollarsToCents(oopMax)
    const oopMetCents = dollarsToCents(oopMet)

    if (!deductible || deductibleCents <= 0) {
      newErrors.deductible = 'Please enter your OON deductible amount'
    }

    if (deductibleMetCents > deductibleCents) {
      newErrors.deductibleMet =
        'Amount met cannot exceed your total deductible'
    }

    if (!coinsurance || isNaN(coinsurancePct)) {
      newErrors.coinsurance = 'Please enter your OON coinsurance percentage'
    } else if (coinsurancePct < 0 || coinsurancePct > 100) {
      newErrors.coinsurance = 'Coinsurance must be between 0% and 100%'
    }

    if (!oopMax || oopMaxCents <= 0) {
      newErrors.oopMax = 'Please enter your OON out-of-pocket maximum'
    }

    if (oopMetCents > oopMaxCents) {
      newErrors.oopMet =
        'Amount met cannot exceed your out-of-pocket maximum'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (!validate()) return

    // Sync to store
    setInsuranceDetails({
      oonDeductible: dollarsToCents(deductible),
      oonDeductibleMet: dollarsToCents(deductibleMet),
      oonCoinsurancePct: parseFloat(coinsurance) || 0,
      oonOutOfPocketMax: dollarsToCents(oopMax),
      oonOutOfPocketMet: dollarsToCents(oopMet),
    })

    nextStep()
  }

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
        <Shield className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
        <div>
          <p className="text-sm font-medium text-blue-900">
            Out-of-Network Benefit Details
          </p>
          <p className="mt-1 text-xs text-blue-700">
            Enter your insurance plan's OON benefit details. You can find these
            on your insurance card, benefits summary, or by calling your
            insurer. If you have already had your benefits verified by our
            team, those values should be pre-populated.
          </p>
        </div>
      </div>

      {/* Deductible Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
              1
            </span>
            OON Deductible
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-gray-500">
            The amount you must pay out-of-pocket for OON services before your
            insurance begins to cover costs.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={inputId('oon-deductible')} required>
                Annual OON Deductible
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  $
                </span>
                <Input
                  id={inputId('oon-deductible')}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="5,000.00"
                  value={deductible}
                  onChange={(e) => setDeductible(e.target.value)}
                  className="pl-7"
                  error={errors.deductible}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor={inputId('oon-deductible-met')}>
                Amount Already Met This Year
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  $
                </span>
                <Input
                  id={inputId('oon-deductible-met')}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={deductibleMet}
                  onChange={(e) => setDeductibleMet(e.target.value)}
                  className="pl-7"
                  error={errors.deductibleMet}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coinsurance Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
              2
            </span>
            OON Coinsurance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-2">
            <HelpCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gray-400" />
            <p className="text-xs text-gray-500">
              After your deductible is met, your plan pays a percentage and you
              pay the rest. For example, if your OON coinsurance is 40%, you pay
              40% and your insurer pays 60% of the allowed amount.
            </p>
          </div>
          <div className="max-w-xs space-y-2">
            <Label htmlFor={inputId('oon-coinsurance')} required>
              Your OON Coinsurance (%)
            </Label>
            <div className="relative">
              <Input
                id={inputId('oon-coinsurance')}
                type="number"
                min="0"
                max="100"
                step="1"
                placeholder="40"
                value={coinsurance}
                onChange={(e) => setCoinsurance(e.target.value)}
                className="pr-8"
                error={errors.coinsurance}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                %
              </span>
            </div>
          </div>
          {coinsurance && !isNaN(parseFloat(coinsurance)) && (
            <p className="text-xs text-gray-600">
              Your insurer will pay{' '}
              <span className="font-semibold">
                {100 - parseFloat(coinsurance)}%
              </span>{' '}
              of the allowed amount after deductible.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Out-of-Pocket Max Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
              3
            </span>
            OON Out-of-Pocket Maximum
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-xs text-gray-500">
            The most you will pay for OON covered services in a plan year.
            After you reach this amount, your plan pays 100% of the allowed
            amount.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={inputId('oon-oop-max')} required>
                Annual OON Out-of-Pocket Max
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  $
                </span>
                <Input
                  id={inputId('oon-oop-max')}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="12,000.00"
                  value={oopMax}
                  onChange={(e) => setOopMax(e.target.value)}
                  className="pl-7"
                  error={errors.oopMax}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor={inputId('oon-oop-met')}>
                Amount Already Met This Year
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  $
                </span>
                <Input
                  id={inputId('oon-oop-met')}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={oopMet}
                  onChange={(e) => setOopMet(e.target.value)}
                  className="pl-7"
                  error={errors.oopMet}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important Note */}
      <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <div>
          <p className="text-sm font-medium text-amber-900">
            Important Disclaimer
          </p>
          <p className="mt-1 text-xs text-amber-700">
            This estimate is based on the information you provide and assumes
            your insurer uses the Qualifying Payment Amount (QPA) as the allowed
            amount. Actual reimbursement may vary based on your specific plan
            terms, the insurer&apos;s payment methodology, and any applicable
            plan exclusions. This is not a guarantee of payment.
          </p>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4">
        <Button
          id={btnId('back', 'procedures')}
          variant="outline"
          onClick={prevStep}
        >
          <ChevronLeft className="mr-1.5 h-4 w-4" />
          Back to Procedures
        </Button>
        <Button
          id={btnId('next', 'estimate')}
          onClick={handleNext}
        >
          View Estimate
          <ChevronRight className="ml-1.5 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
