import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getClaimDetail } from '@/lib/actions/claims'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ClaimStatusBadge } from '@/components/patient/claims/claim-status-badge'
import { ClaimLineItems } from '@/components/patient/claims/claim-line-items'
import { ClaimTimeline } from '@/components/patient/claims/claim-timeline'
import { ClaimFinancialSummary } from '@/components/patient/claims/claim-financial-summary'
import { ClaimNoteForm } from '@/components/patient/claims/claim-note-form'
import { elementId } from '@/lib/utils/element-ids'
import { format } from 'date-fns'
import {
  ArrowLeft,
  Calendar,
  Building2,
  MapPin,
  User,
  AlertTriangle,
  FileText,
} from 'lucide-react'

interface ClaimDetailPageProps {
  params: Promise<{ id: string }>
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'N/A'
  try {
    return format(new Date(dateStr), 'MMM d, yyyy')
  } catch {
    return dateStr
  }
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return 'N/A'
  try {
    return format(new Date(dateStr), 'MMM d, yyyy — h:mm a')
  } catch {
    return dateStr
  }
}

export default async function ClaimDetailPage({ params }: ClaimDetailPageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const resolvedParams = await params
  const result = await getClaimDetail(resolvedParams.id, user.id)

  if (!result.success) {
    return (
      <div id={elementId('claim-detail', 'error')} className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Unable to load claim
        </h2>
        <p className="text-gray-500 mb-4">{result.error}</p>
        <Link
          href="/patient/claims"
          className="text-primary-600 hover:underline text-sm font-medium"
        >
          Back to Claims
        </Link>
      </div>
    )
  }

  const claim = result.data

  const isOverdueAppeal =
    claim.claim_status === 'denied' &&
    claim.appeal_deadline &&
    new Date(claim.appeal_deadline) < new Date()

  const isUrgentAppeal =
    claim.claim_status === 'denied' &&
    claim.appeal_deadline &&
    !isOverdueAppeal &&
    new Date(claim.appeal_deadline).getTime() - Date.now() < 14 * 24 * 60 * 60 * 1000

  const daysUntilDeadline =
    claim.appeal_deadline
      ? Math.ceil(
          (new Date(claim.appeal_deadline).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        )
      : null

  return (
    <div id={elementId('claim-detail', 'page', 'container')}>
      {/* Back link */}
      <Link
        href="/patient/claims"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Claims
      </Link>

      {/* Page Header */}
      <div id={elementId('claim-detail', 'header')} className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-gray-900">
            {claim.claim_number
              ? `Claim ${claim.claim_number}`
              : 'Claim Detail'}
          </h1>
          <ClaimStatusBadge status={claim.claim_status} />
          {claim.idr_eligible && (
            <Badge variant="outline" className="text-indigo-600 border-indigo-300">
              IDR Eligible
            </Badge>
          )}
        </div>
        <p className="text-gray-600 text-sm">
          Submitted {formatDateTime(claim.submitted_at)}
        </p>
      </div>

      {/* Appeal deadline warning */}
      {(isUrgentAppeal || isOverdueAppeal) && (
        <div
          id={elementId('claim-detail', 'appeal-warning')}
          className={`rounded-lg p-4 mb-6 flex items-start gap-3 ${
            isOverdueAppeal
              ? 'bg-red-50 border border-red-200'
              : 'bg-amber-50 border border-amber-200'
          }`}
        >
          <AlertTriangle
            className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
              isOverdueAppeal ? 'text-red-600' : 'text-amber-600'
            }`}
          />
          <div>
            <p
              className={`text-sm font-semibold ${
                isOverdueAppeal ? 'text-red-800' : 'text-amber-800'
              }`}
            >
              {isOverdueAppeal
                ? 'Appeal Deadline Has Passed'
                : `Appeal Deadline in ${daysUntilDeadline} Days`}
            </p>
            <p
              className={`text-sm mt-0.5 ${
                isOverdueAppeal ? 'text-red-600' : 'text-amber-600'
              }`}
            >
              {isOverdueAppeal
                ? `The appeal deadline was ${formatDate(claim.appeal_deadline)}. You may still contact your insurer to discuss options.`
                : `Your appeal must be submitted by ${formatDate(claim.appeal_deadline)}. Contact Foundation Health for assistance with your appeal.`}
            </p>
          </div>
        </div>
      )}

      {/* Denial reason */}
      {claim.claim_status === 'denied' && claim.denial_reason && (
        <div
          id={elementId('claim-detail', 'denial-reason')}
          className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
        >
          <p className="text-sm font-semibold text-red-800 mb-1">
            Denial Reason
          </p>
          <p className="text-sm text-red-700">{claim.denial_reason}</p>
        </div>
      )}

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: details and line items */}
        <div className="lg:col-span-2 space-y-6">
          {/* Claim Details Card */}
          <Card id={elementId('claim-detail', 'info')}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-500" />
                Claim Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Service Date</p>
                  <p className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    {formatDate(claim.service_date)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Payer</p>
                  <p className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-gray-400" />
                    {claim.payer_name ?? 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Member ID</p>
                  <p className="text-sm font-medium text-gray-900">
                    {claim.member_id ?? 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Group Number</p>
                  <p className="text-sm font-medium text-gray-900">
                    {claim.group_number ?? 'N/A'}
                  </p>
                </div>
                {claim.place_of_service && (
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Place of Service</p>
                    <p className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      {claim.place_of_service}
                    </p>
                  </div>
                )}
                {claim.rendering_provider && (
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Rendering Provider</p>
                    <p className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      {claim.rendering_provider}
                    </p>
                  </div>
                )}
                {claim.referring_provider && (
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Referring Provider</p>
                    <p className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      {claim.referring_provider}
                    </p>
                  </div>
                )}
                {claim.eob_received_at && (
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">EOB Received</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(claim.eob_received_at)}
                    </p>
                  </div>
                )}
              </div>

              {/* Notes */}
              {claim.notes && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Notes</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {claim.notes}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Line Items */}
          <Card id={elementId('claim-detail', 'line-items')}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">
                Line Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ClaimLineItems lineItems={claim.line_items ?? []} />
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card id={elementId('claim-detail', 'activity')}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">
                Activity Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ClaimTimeline activities={claim.activities ?? []} />
            </CardContent>
          </Card>

          {/* Add Note */}
          <Card id={elementId('claim-detail', 'add-note')}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">
                Add a Note
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ClaimNoteForm claimId={claim.id} />
            </CardContent>
          </Card>
        </div>

        {/* Right column: financial summary */}
        <div className="space-y-6">
          <ClaimFinancialSummary claim={claim} />
        </div>
      </div>
    </div>
  )
}
