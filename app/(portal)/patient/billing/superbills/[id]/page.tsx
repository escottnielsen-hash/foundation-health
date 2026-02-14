import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getSuperbillById } from '@/lib/actions/superbills'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SuperbillHeader } from '@/components/billing/superbill-header'
import { DiagnosisCodes, ProcedureCodes } from '@/components/billing/superbill-codes'
import { InsuranceSubmissionGuide } from '@/components/billing/insurance-submission-guide'
import { SUPERBILL_STATUS_CONFIG, PLACE_OF_SERVICE_CODES } from '@/lib/validations/superbills'
import { elementId } from '@/lib/utils/element-ids'
import { format } from 'date-fns'

interface SuperbillDetailPageProps {
  params: Promise<{ id: string }>
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}

function formatDate(dateStr: string): string {
  try {
    return format(new Date(dateStr + 'T00:00:00'), 'MMMM d, yyyy')
  } catch {
    return dateStr
  }
}

export default async function SuperbillDetailPage({ params }: SuperbillDetailPageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { id } = await params
  const result = await getSuperbillById(id, user.id)

  if (!result.success) {
    notFound()
  }

  const superbill = result.data

  const statusConfig = SUPERBILL_STATUS_CONFIG[superbill.status] ?? {
    label: superbill.status,
    variant: 'outline' as const,
  }

  const placeOfServiceLabel =
    PLACE_OF_SERVICE_CODES[superbill.place_of_service_code] ??
    `Code ${superbill.place_of_service_code}`

  return (
    <div id={elementId('superbill-detail', 'page', 'container')}>
      {/* Back Navigation */}
      <div className="mb-6">
        <Link
          href="/patient/billing/superbills"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary-600 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Superbills
        </Link>
      </div>

      {/* Page Header with Status */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Superbill</h1>
          <p className="text-gray-500 mt-1">
            Date of Service: {formatDate(superbill.date_of_service)}
          </p>
        </div>
        <Badge variant={statusConfig.variant} className="text-sm px-3 py-1">
          {statusConfig.label}
        </Badge>
      </div>

      {/* Main Superbill Card */}
      <Card className="mb-8 border-gray-200 shadow-sm">
        <CardContent className="p-8">
          {/* Practice Info Header */}
          <SuperbillHeader
            practiceName={superbill.practice_name ?? 'Foundation Health'}
            practiceNpi={superbill.practice_npi}
            practiceTaxId={superbill.practice_tax_id}
            practiceAddressLine1={superbill.practice_address_line1}
            practiceAddressLine2={superbill.practice_address_line2}
            practiceCity={superbill.practice_city}
            practiceState={superbill.practice_state}
            practiceZipCode={superbill.practice_zip_code}
            practicePhone={superbill.practice_phone}
          />

          {/* Two-Column Layout: Patient Info & Provider Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Patient Information */}
            <div className="rounded-lg border border-gray-100 p-4 bg-gray-50/50">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Patient Information
              </h3>
              <div className="space-y-2">
                {superbill.patient_name && (
                  <div>
                    <p className="text-sm font-medium text-gray-900">{superbill.patient_name}</p>
                  </div>
                )}
                {superbill.patient_dob && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400">DOB:</span>
                    <span className="text-gray-700">{formatDate(superbill.patient_dob)}</span>
                  </div>
                )}
                {superbill.patient_insurance_provider && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400">Insurance:</span>
                    <span className="text-gray-700">{superbill.patient_insurance_provider}</span>
                  </div>
                )}
                {superbill.patient_insurance_policy_number && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400">Policy #:</span>
                    <span className="text-gray-700 font-mono text-xs">
                      {superbill.patient_insurance_policy_number}
                    </span>
                  </div>
                )}
                {superbill.patient_insurance_group_number && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400">Group #:</span>
                    <span className="text-gray-700 font-mono text-xs">
                      {superbill.patient_insurance_group_number}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Provider Information */}
            <div className="rounded-lg border border-gray-100 p-4 bg-gray-50/50">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Rendering Provider
              </h3>
              <div className="space-y-2">
                {superbill.provider_name && (
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Dr. {superbill.provider_name}
                      {superbill.provider_credentials && (
                        <span className="text-gray-500 font-normal">
                          , {superbill.provider_credentials}
                        </span>
                      )}
                    </p>
                  </div>
                )}
                {superbill.provider_specialty && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400">Specialty:</span>
                    <span className="text-gray-700">{superbill.provider_specialty}</span>
                  </div>
                )}
                {superbill.provider_npi && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-400">NPI:</span>
                    <span className="text-gray-700 font-mono text-xs">{superbill.provider_npi}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Service Details Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="rounded-lg border border-gray-100 p-3 bg-gray-50/50">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Date of Service
              </p>
              <p className="text-sm font-medium text-gray-900">
                {formatDate(superbill.date_of_service)}
              </p>
            </div>
            <div className="rounded-lg border border-gray-100 p-3 bg-gray-50/50">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Place of Service
              </p>
              <p className="text-sm font-medium text-gray-900">
                {placeOfServiceLabel}
                <span className="text-gray-400 text-xs ml-1">
                  (POS {superbill.place_of_service_code})
                </span>
              </p>
            </div>
            {superbill.location_name && (
              <div className="rounded-lg border border-gray-100 p-3 bg-gray-50/50">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                  Location
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {superbill.location_name}
                </p>
                {superbill.location_city && superbill.location_state && (
                  <p className="text-xs text-gray-500">
                    {superbill.location_city}, {superbill.location_state}
                  </p>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Diagnosis Codes */}
          <DiagnosisCodes codes={superbill.diagnosis_codes} />

          <Separator />

          {/* Procedure Codes */}
          <ProcedureCodes codes={superbill.procedure_codes} />

          <Separator />

          {/* Total Charges */}
          <div className="flex items-center justify-between py-5">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Total Charges
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Amount billed for all services rendered
              </p>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(superbill.total_charges_cents)}
            </p>
          </div>

          {/* Reimbursement Info (if applicable) */}
          {superbill.status === 'reimbursed' && superbill.reimbursement_amount_cents != null && (
            <>
              <Separator />
              <div className="flex items-center justify-between py-5">
                <div>
                  <h3 className="text-sm font-semibold text-emerald-700 uppercase tracking-wider">
                    Reimbursement Received
                  </h3>
                  {superbill.insurance_submitted_at && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      Submitted on{' '}
                      {format(new Date(superbill.insurance_submitted_at), 'MMM d, yyyy')}
                    </p>
                  )}
                </div>
                <p className="text-2xl font-bold text-emerald-700">
                  {formatCurrency(superbill.reimbursement_amount_cents)}
                </p>
              </div>
            </>
          )}

          {/* Notes */}
          {superbill.notes && (
            <>
              <Separator />
              <div className="py-4">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  Notes
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {superbill.notes}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 mb-10">
        <Button variant="default" disabled>
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Download Superbill (PDF)
        </Button>
        <Button variant="outline" asChild>
          <Link href="/patient/billing/superbills">
            Back to All Superbills
          </Link>
        </Button>
      </div>

      {/* Submit to Insurance Instructions */}
      <div className="mb-8">
        <InsuranceSubmissionGuide />
      </div>
    </div>
  )
}
