import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getOonBenefitsSummary } from '@/lib/actions/insurance'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { VerificationStatusBadge } from '@/components/patient/insurance/verification-status-badge'
import { BenefitsBreakdown } from '@/components/patient/insurance/benefits-breakdown'
import { ReimbursementEstimator } from '@/components/patient/insurance/reimbursement-estimator'
import { elementId } from '@/lib/utils/element-ids'
import { formatCurrency } from '@/lib/utils/format'
import { format } from 'date-fns'
import {
  ArrowLeft,
  Shield,
  Building2,
  CreditCard,
  Calendar,
  Clock,
  FileCheck,
  Hash,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Timer,
} from 'lucide-react'

interface VerificationDetailPageProps {
  params: Promise<{ id: string }>
}

function formatDate(dateStr: string): string {
  try {
    return format(new Date(dateStr), 'MMMM d, yyyy')
  } catch {
    return dateStr
  }
}

function formatDateTime(dateStr: string): string {
  try {
    return format(new Date(dateStr), 'MMM d, yyyy h:mm a')
  } catch {
    return dateStr
  }
}

function StatusTimelineItem({
  icon: Icon,
  label,
  date,
  isActive,
  isCompleted,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  date?: string | null
  isActive: boolean
  isCompleted: boolean
}) {
  return (
    <div className="flex items-start gap-3">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isCompleted
            ? 'bg-emerald-100'
            : isActive
              ? 'bg-blue-100'
              : 'bg-gray-100'
        }`}
      >
        <Icon
          className={`w-4 h-4 ${
            isCompleted
              ? 'text-emerald-600'
              : isActive
                ? 'text-blue-600'
                : 'text-gray-400'
          }`}
        />
      </div>
      <div>
        <p
          className={`text-sm font-medium ${
            isCompleted || isActive ? 'text-gray-900' : 'text-gray-400'
          }`}
        >
          {label}
        </p>
        {date && (
          <p className="text-xs text-gray-500">{formatDateTime(date)}</p>
        )}
      </div>
    </div>
  )
}

export default async function VerificationDetailPage({ params }: VerificationDetailPageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { id } = await params
  const result = await getOonBenefitsSummary(id, user.id)

  if (!result.success) {
    notFound()
  }

  const summary = result.data
  const verification = summary.verification
  const isVerified = verification.verification_status === 'verified'
  const isFailed = verification.verification_status === 'failed'
  const isExpired = verification.verification_status === 'expired'

  return (
    <div id={elementId('insurance', 'detail', 'container')}>
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
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">
              {verification.payer_name}
            </h1>
            <VerificationStatusBadge status={verification.verification_status} />
          </div>
          <p className="text-gray-600">
            Verification details and out-of-network benefits
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Policy Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                Policy Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Insurance Company
                  </p>
                  <p className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    {verification.payer_name}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Member ID
                  </p>
                  <p className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-gray-400" />
                    {verification.member_id}
                  </p>
                </div>

                {verification.group_number && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Group Number
                    </p>
                    <p className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                      <Hash className="w-4 h-4 text-gray-400" />
                      {verification.group_number}
                    </p>
                  </div>
                )}

                {verification.plan_type && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Plan Type
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      <Badge variant="outline">{verification.plan_type}</Badge>
                    </p>
                  </div>
                )}

                {verification.payer_id && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Payer ID
                    </p>
                    <p className="text-sm text-gray-700">{verification.payer_id}</p>
                  </div>
                )}

                {verification.reference_number && (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Reference Number
                    </p>
                    <p className="text-sm text-gray-700 flex items-center gap-1.5">
                      <FileCheck className="w-4 h-4 text-gray-400" />
                      {verification.reference_number}
                    </p>
                  </div>
                )}
              </div>

              {verification.notes && (
                <>
                  <Separator className="my-6" />
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Notes
                    </p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {verification.notes}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Benefits Breakdown */}
          {isVerified && <BenefitsBreakdown summary={summary} />}

          {/* Failed/Expired Messages */}
          {isFailed && (
            <Card className="border-red-100">
              <CardContent className="py-8 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
                  <XCircle className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Verification Failed
                </h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto mb-4">
                  We were unable to verify your benefits with the information provided.
                  This may be due to incorrect policy details or the policy may not be active.
                </p>
                <Link href="/patient/insurance/verify">
                  <Button className="gap-2">
                    Submit New Request
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {isExpired && (
            <Card className="border-amber-100">
              <CardContent className="py-8 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center mb-4">
                  <Timer className="w-6 h-6 text-amber-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Verification Expired
                </h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto mb-4">
                  This verification has expired. Benefits information may no longer be
                  accurate. Please submit a new verification request for current benefits.
                </p>
                <Link href="/patient/insurance/verify">
                  <Button className="gap-2">
                    Request New Verification
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Reimbursement Estimator */}
          <ReimbursementEstimator verification={verification} />
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Status Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Verification Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <StatusTimelineItem
                  icon={FileCheck}
                  label="Request Submitted"
                  date={verification.created_at}
                  isActive={verification.verification_status === 'pending'}
                  isCompleted={true}
                />

                <div className="ml-4 h-4 w-px bg-gray-200" />

                <StatusTimelineItem
                  icon={Clock}
                  label="Under Review"
                  date={
                    verification.verification_status === 'pending'
                      ? null
                      : verification.created_at
                  }
                  isActive={verification.verification_status === 'pending'}
                  isCompleted={verification.verification_status !== 'pending'}
                />

                <div className="ml-4 h-4 w-px bg-gray-200" />

                {isFailed ? (
                  <StatusTimelineItem
                    icon={XCircle}
                    label="Verification Failed"
                    date={verification.verified_at}
                    isActive={true}
                    isCompleted={false}
                  />
                ) : isExpired ? (
                  <StatusTimelineItem
                    icon={AlertCircle}
                    label="Expired"
                    date={verification.updated_at}
                    isActive={true}
                    isCompleted={false}
                  />
                ) : (
                  <StatusTimelineItem
                    icon={CheckCircle2}
                    label="Benefits Verified"
                    date={verification.verified_at}
                    isActive={false}
                    isCompleted={isVerified}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Summary */}
          {isVerified && (
            <Card className="border-emerald-100 bg-emerald-50/30">
              <CardContent className="p-5">
                <h3 className="text-sm font-semibold text-emerald-900 mb-3">
                  Quick OON Summary
                </h3>
                <div className="space-y-3">
                  {verification.oon_deductible_individual !== null && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-emerald-700">OON Deductible</span>
                      <span className="text-sm font-semibold text-emerald-900">
                        {formatCurrency(verification.oon_deductible_individual)}
                      </span>
                    </div>
                  )}
                  {verification.oon_deductible_met !== null && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-emerald-700">Deductible Met</span>
                      <span className="text-sm font-semibold text-emerald-900">
                        {formatCurrency(verification.oon_deductible_met)}
                      </span>
                    </div>
                  )}
                  {verification.oon_coinsurance_pct !== null && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-emerald-700">Your Coinsurance</span>
                      <span className="text-sm font-semibold text-emerald-900">
                        {verification.oon_coinsurance_pct}%
                      </span>
                    </div>
                  )}
                  {verification.oon_out_of_pocket_max !== null && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-emerald-700">OOP Maximum</span>
                      <span className="text-sm font-semibold text-emerald-900">
                        {formatCurrency(verification.oon_out_of_pocket_max)}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Dates */}
          <Card>
            <CardContent className="p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Dates
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Submitted</p>
                    <p className="text-sm text-gray-700">
                      {formatDate(verification.created_at)}
                    </p>
                  </div>
                </div>
                {verification.verified_at && (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <div>
                      <p className="text-xs text-gray-400">Verified</p>
                      <p className="text-sm text-gray-700">
                        {formatDate(verification.verified_at)}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-400">Last Updated</p>
                    <p className="text-sm text-gray-700">
                      {formatDate(verification.updated_at)}
                    </p>
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
