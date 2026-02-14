import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPatientClaims, getClaimsSummary } from '@/lib/actions/claims'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ClaimCard } from '@/components/patient/claims/claim-card'
import { ClaimFilter } from '@/components/patient/claims/claim-filter'
import { elementId } from '@/lib/utils/element-ids'
import {
  DollarSign,
  FileCheck,
  Clock,
  XCircle,
} from 'lucide-react'

interface ClaimsPageProps {
  searchParams: Promise<{
    status?: string
    payer?: string
    date_from?: string
    date_to?: string
    sort_by?: string
    sort_order?: string
  }>
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}

export default async function ClaimsPage({ searchParams }: ClaimsPageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const resolvedParams = await searchParams
  const filters = {
    status: resolvedParams.status,
    payer: resolvedParams.payer,
    date_from: resolvedParams.date_from,
    date_to: resolvedParams.date_to,
    sort_by: resolvedParams.sort_by,
    sort_order: resolvedParams.sort_order,
  }

  const hasFilters = resolvedParams.status || resolvedParams.payer || resolvedParams.date_from || resolvedParams.date_to

  const [claimsResult, summaryResult] = await Promise.all([
    getPatientClaims(user.id, hasFilters || resolvedParams.sort_by || resolvedParams.sort_order ? filters : undefined),
    getClaimsSummary(user.id),
  ])

  if (!claimsResult.success) {
    return (
      <div id={elementId('claims', 'error')} className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Unable to load claims
        </h2>
        <p className="text-gray-500">{claimsResult.error}</p>
      </div>
    )
  }

  const claims = claimsResult.data
  const summary = summaryResult.success ? summaryResult.data : null

  return (
    <div id={elementId('claims', 'page', 'container')}>
      {/* Page Header */}
      <div id={elementId('claims', 'header')} className="mb-8">
        <h1
          id={elementId('claims', 'title')}
          className="text-3xl font-bold text-gray-900"
        >
          Insurance Claims
        </h1>
        <p
          id={elementId('claims', 'subtitle')}
          className="text-gray-600 mt-1"
        >
          Track your out-of-network insurance claims, reimbursements, and appeals
        </p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div
          id={elementId('claims', 'summary', 'cards')}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Billed
              </CardTitle>
              <DollarSign className="w-4 h-4 text-gray-400" />
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(summary.totalBilled)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {summary.totalClaims} {summary.totalClaims === 1 ? 'claim' : 'claims'} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Paid
              </CardTitle>
              <FileCheck className="w-4 h-4 text-emerald-500" />
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-2xl font-bold text-emerald-600">
                {formatCurrency(summary.totalPaid)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {summary.paidClaims} {summary.paidClaims === 1 ? 'claim' : 'claims'} paid
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-gray-600">
                Pending
              </CardTitle>
              <Clock className="w-4 h-4 text-amber-500" />
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-2xl font-bold text-amber-600">
                {formatCurrency(summary.pendingAmount)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {summary.pendingClaims} {summary.pendingClaims === 1 ? 'claim' : 'claims'} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-gray-600">
                Denial Rate
              </CardTitle>
              <XCircle className="w-4 h-4 text-red-500" />
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-2xl font-bold text-gray-900">
                {summary.denialRate}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {summary.deniedClaims} {summary.deniedClaims === 1 ? 'claim' : 'claims'} denied
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter Bar */}
      <div
        id={elementId('claims', 'toolbar')}
        className="mb-6"
      >
        <ClaimFilter />
        <p className="text-sm text-gray-500 mt-3">
          {claims.length} {claims.length === 1 ? 'claim' : 'claims'} found
        </p>
      </div>

      {/* Claims List */}
      {claims.length === 0 ? (
        <Card id={elementId('claims', 'empty')}>
          <CardContent className="py-12 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <FileCheck className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              No claims found
            </h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              {hasFilters
                ? 'No claims match the selected filters. Try adjusting your search criteria.'
                : 'Your insurance claims will appear here after services are rendered and claims are submitted to your insurance carrier.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div id={elementId('claims', 'list')} className="space-y-3">
          {claims.map((claim) => (
            <ClaimCard
              key={claim.id}
              id={claim.id}
              claimNumber={claim.claim_number}
              payerName={claim.payer_name}
              status={claim.claim_status}
              serviceDate={claim.service_date}
              billedAmount={claim.billed_amount}
              paidAmount={claim.paid_amount}
              denialReason={claim.denial_reason}
              appealDeadline={claim.appeal_deadline}
            />
          ))}
        </div>
      )}
    </div>
  )
}
