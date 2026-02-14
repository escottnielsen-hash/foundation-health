'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { elementId, formId, inputId } from '@/lib/utils/element-ids'
import { verificationRequestSchema, PLAN_TYPES } from '@/lib/validations/insurance'
import { requestVerification } from '@/lib/actions/insurance'
import { createClient } from '@/lib/supabase/client'
import {
  Shield,
  ArrowLeft,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'

export default function VerifyInsurancePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [serverError, setServerError] = useState<string | null>(null)

  const [payerName, setPayerName] = useState('')
  const [payerId, setPayerId] = useState('')
  const [memberId, setMemberId] = useState('')
  const [groupNumber, setGroupNumber] = useState('')
  const [planType, setPlanType] = useState('')
  const [notes, setNotes] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setServerError(null)

    const formData = {
      payer_name: payerName,
      payer_id: payerId,
      member_id: memberId,
      group_number: groupNumber,
      plan_type: planType,
      notes,
    }

    const parseResult = verificationRequestSchema.safeParse(formData)
    if (!parseResult.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of parseResult.error.issues) {
        const fieldName = issue.path.join('.')
        if (fieldName && !fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message
        }
      }
      setErrors(fieldErrors)
      return
    }

    setIsSubmitting(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const result = await requestVerification(user.id, formData)

      if (!result.success) {
        if (result.fieldErrors) {
          setErrors(result.fieldErrors)
        }
        setServerError(result.error)
        setIsSubmitting(false)
        return
      }

      setSubmitted(true)
    } catch {
      setServerError('An unexpected error occurred. Please try again.')
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div id={elementId('insurance', 'verify', 'success')} className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-6">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Verification Request Submitted
            </h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Our team will verify your out-of-network benefits with your insurance company.
              You will be notified once the verification is complete, typically within 2-3
              business days.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/patient/insurance">
                <Button variant="outline" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Insurance
                </Button>
              </Link>
              <Link href="/patient/insurance/verify">
                <Button
                  className="gap-2"
                  onClick={() => {
                    setSubmitted(false)
                    setPayerName('')
                    setPayerId('')
                    setMemberId('')
                    setGroupNumber('')
                    setPlanType('')
                    setNotes('')
                  }}
                >
                  Submit Another
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div id={elementId('insurance', 'verify', 'container')}>
      {/* Back Link */}
      <div className="mb-6">
        <Link
          href="/patient/insurance"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Insurance
        </Link>
      </div>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Request Benefits Verification</h1>
        <p className="text-gray-600 mt-1">
          Provide your insurance details and we will verify your out-of-network benefits
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Insurance Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form
                id={formId('verification-request')}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                {serverError && (
                  <div className="rounded-lg bg-red-50 border border-red-100 p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{serverError}</p>
                  </div>
                )}

                {/* Insurance Company */}
                <div className="space-y-2">
                  <label
                    htmlFor={inputId('payer-name')}
                    className="block text-sm font-medium text-gray-700"
                  >
                    Insurance Company <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id={inputId('payer-name')}
                    type="text"
                    placeholder="e.g., Blue Cross Blue Shield, Aetna, UnitedHealthcare"
                    value={payerName}
                    onChange={(e) => setPayerName(e.target.value)}
                    className={errors.payer_name ? 'border-red-500' : ''}
                  />
                  {errors.payer_name && (
                    <p className="text-sm text-red-500">{errors.payer_name}</p>
                  )}
                </div>

                {/* Payer ID */}
                <div className="space-y-2">
                  <label
                    htmlFor={inputId('payer-id')}
                    className="block text-sm font-medium text-gray-700"
                  >
                    Payer ID
                    <span className="text-gray-400 font-normal ml-1">(optional)</span>
                  </label>
                  <Input
                    id={inputId('payer-id')}
                    type="text"
                    placeholder="Found on your insurance card or EOB"
                    value={payerId}
                    onChange={(e) => setPayerId(e.target.value)}
                    className={errors.payer_id ? 'border-red-500' : ''}
                  />
                  {errors.payer_id && (
                    <p className="text-sm text-red-500">{errors.payer_id}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Member ID */}
                  <div className="space-y-2">
                    <label
                      htmlFor={inputId('member-id')}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Member ID <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id={inputId('member-id')}
                      type="text"
                      placeholder="Your member or subscriber ID"
                      value={memberId}
                      onChange={(e) => setMemberId(e.target.value)}
                      className={errors.member_id ? 'border-red-500' : ''}
                    />
                    {errors.member_id && (
                      <p className="text-sm text-red-500">{errors.member_id}</p>
                    )}
                  </div>

                  {/* Group Number */}
                  <div className="space-y-2">
                    <label
                      htmlFor={inputId('group-number')}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Group Number
                      <span className="text-gray-400 font-normal ml-1">(optional)</span>
                    </label>
                    <Input
                      id={inputId('group-number')}
                      type="text"
                      placeholder="Group or policy number"
                      value={groupNumber}
                      onChange={(e) => setGroupNumber(e.target.value)}
                      className={errors.group_number ? 'border-red-500' : ''}
                    />
                    {errors.group_number && (
                      <p className="text-sm text-red-500">{errors.group_number}</p>
                    )}
                  </div>
                </div>

                {/* Plan Type */}
                <div className="space-y-2">
                  <label
                    htmlFor={inputId('plan-type')}
                    className="block text-sm font-medium text-gray-700"
                  >
                    Plan Type
                    <span className="text-gray-400 font-normal ml-1">(optional)</span>
                  </label>
                  <Select
                    id={inputId('plan-type')}
                    value={planType}
                    onChange={(e) => setPlanType(e.target.value)}
                    error={errors.plan_type}
                  >
                    <option value="">Select plan type</option>
                    {PLAN_TYPES.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </Select>
                </div>

                <Separator />

                {/* Insurance Card Upload Placeholder */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Insurance Card Images
                    <span className="text-gray-400 font-normal ml-1">(optional)</span>
                  </label>
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                      <Upload className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500 mb-1">
                      Upload front and back of your insurance card
                    </p>
                    <p className="text-xs text-gray-400">
                      Image upload will be available in a future update. Our team can verify
                      your benefits using the information provided above.
                    </p>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <label
                    htmlFor={inputId('notes')}
                    className="block text-sm font-medium text-gray-700"
                  >
                    Additional Notes
                    <span className="text-gray-400 font-normal ml-1">(optional)</span>
                  </label>
                  <textarea
                    id={inputId('notes')}
                    rows={3}
                    className="flex w-full rounded-lg border border-input bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                    placeholder="Any additional information about your coverage or specific services you are seeking..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                  {errors.notes && (
                    <p className="text-sm text-red-500">{errors.notes}</p>
                  )}
                </div>

                {/* Submit */}
                <div className="flex items-center justify-end gap-4 pt-2">
                  <Link href="/patient/insurance">
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                  <Button type="submit" disabled={isSubmitting} className="gap-2">
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4" />
                        Submit Verification Request
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="border-amber-100 bg-amber-50/30">
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold text-amber-900 mb-2">
                Where to Find Your Information
              </h3>
              <ul className="space-y-2 text-xs text-amber-800">
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold text-amber-800">1</span>
                  <span><strong>Member ID</strong> is on the front of your insurance card, often labeled as ID# or Member#</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold text-amber-800">2</span>
                  <span><strong>Group Number</strong> is usually on the front of your card, labeled as Group# or GRP#</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold text-amber-800">3</span>
                  <span><strong>Plan Type</strong> (PPO, HMO, etc.) is printed on your card, often near the plan name</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-bold text-amber-800">4</span>
                  <span><strong>Payer ID</strong> can be found on your Explanation of Benefits (EOB) or by calling the number on the back of your card</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                What Happens Next?
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-blue-700">1</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-700">Submit Request</p>
                    <p className="text-xs text-gray-500">Provide your insurance information</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-blue-700">2</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-700">Team Verification</p>
                    <p className="text-xs text-gray-500">We contact your insurer to verify OON benefits</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-blue-700">3</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-700">Benefits Summary</p>
                    <p className="text-xs text-gray-500">View your deductibles, coinsurance, and estimated reimbursement</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-emerald-700">4</span>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-700">Plan Your Visit</p>
                    <p className="text-xs text-gray-500">Use the estimator to understand your costs</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
