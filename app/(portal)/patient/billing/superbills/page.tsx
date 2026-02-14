import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPatientSuperbills } from '@/lib/actions/superbills'
import { Card, CardContent } from '@/components/ui/card'
import { SuperbillCard } from '@/components/billing/superbill-card'
import { SuperbillFilter } from '@/components/billing/superbill-filter'
import { InsuranceSubmissionGuide } from '@/components/billing/insurance-submission-guide'
import { elementId } from '@/lib/utils/element-ids'

interface SuperbillsPageProps {
  searchParams: Promise<{ status?: string }>
}

export default async function SuperbillsPage({ searchParams }: SuperbillsPageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const resolvedParams = await searchParams
  const filters = resolvedParams.status
    ? { status: resolvedParams.status }
    : undefined

  const result = await getPatientSuperbills(user.id, filters)

  if (!result.success) {
    return (
      <div id={elementId('superbills', 'error')} className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Unable to load superbills
        </h2>
        <p className="text-gray-500">{result.error}</p>
      </div>
    )
  }

  const superbills = result.data

  return (
    <div id={elementId('superbills', 'page', 'container')}>
      {/* Page Header */}
      <div id={elementId('superbills', 'header')} className="mb-8">
        <h1
          id={elementId('superbills', 'title')}
          className="text-3xl font-bold text-gray-900"
        >
          Superbills
        </h1>
        <p
          id={elementId('superbills', 'subtitle')}
          className="text-gray-600 mt-1"
        >
          Download and submit superbills to your insurance for out-of-network reimbursement
        </p>
      </div>

      {/* Understanding Your Superbill Info Card */}
      <div className="mb-8">
        <Card className="border-blue-100 bg-blue-50/30">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg
                  className="w-4 h-4 text-blue-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-blue-900 mb-1">
                  Understanding Your Superbill
                </h3>
                <p className="text-xs text-blue-700 leading-relaxed">
                  A superbill is an itemized receipt for medical services that includes
                  diagnosis codes (ICD-10), procedure codes (CPT), and charges. As an
                  out-of-network patient at Foundation Health, you can submit your superbill
                  to your insurance company for reimbursement. Most patients recover 60-80%
                  of their costs. Click on any superbill below to view the full details and
                  download it for submission.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <div
        id={elementId('superbills', 'toolbar')}
        className="mb-6 flex items-center justify-between"
      >
        <SuperbillFilter />
        <p className="text-sm text-gray-500">
          {superbills.length} {superbills.length === 1 ? 'superbill' : 'superbills'} found
        </p>
      </div>

      {/* Superbills List */}
      {superbills.length === 0 ? (
        <Card id={elementId('superbills', 'empty')}>
          <CardContent className="py-12 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              No superbills found
            </h3>
            <p className="text-gray-500 text-sm">
              {resolvedParams.status
                ? 'No superbills match the selected status. Try selecting a different filter.'
                : 'Your superbills will appear here after your visits are completed and billing is processed.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div id={elementId('superbills', 'list')} className="space-y-3">
          {superbills.map((superbill) => (
            <SuperbillCard
              key={superbill.id}
              id={superbill.id}
              dateOfService={superbill.date_of_service}
              providerName={superbill.provider_name}
              diagnosisCodes={superbill.diagnosis_codes}
              totalChargeCents={superbill.total_charges_cents}
              status={superbill.status}
            />
          ))}
        </div>
      )}

      {/* Insurance Submission Guide (below the list) */}
      <div className="mt-10">
        <InsuranceSubmissionGuide />
      </div>
    </div>
  )
}
