import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getPatientVerifications } from '@/lib/actions/insurance'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { VerificationCard } from '@/components/patient/insurance/verification-card'
import { InsuranceFilter } from '@/components/patient/insurance/insurance-filter'
import { elementId } from '@/lib/utils/element-ids'
import { Shield, Plus, FileCheck, AlertCircle } from 'lucide-react'

interface InsurancePageProps {
  searchParams: Promise<{ status?: string }>
}

export default async function InsurancePage({ searchParams }: InsurancePageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const resolvedParams = await searchParams
  const filters = resolvedParams.status
    ? { status: resolvedParams.status }
    : undefined

  const result = await getPatientVerifications(user.id, filters)

  if (!result.success) {
    return (
      <div id={elementId('insurance', 'error')} className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Unable to load insurance information
        </h2>
        <p className="text-gray-500">{result.error}</p>
      </div>
    )
  }

  const verifications = result.data

  // Summary counts
  const pendingCount = verifications.filter(v => v.verification_status === 'pending').length
  const verifiedCount = verifications.filter(v => v.verification_status === 'verified').length
  const totalCount = verifications.length

  return (
    <div id={elementId('insurance', 'page', 'container')}>
      {/* Page Header */}
      <div id={elementId('insurance', 'header')} className="mb-8 flex items-start justify-between">
        <div>
          <h1
            id={elementId('insurance', 'title')}
            className="text-3xl font-bold text-gray-900"
          >
            Insurance & Benefits
          </h1>
          <p
            id={elementId('insurance', 'subtitle')}
            className="text-gray-600 mt-1"
          >
            Verify your out-of-network benefits and estimate reimbursement
          </p>
        </div>
        <Link href="/patient/insurance/verify">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Request Verification
          </Button>
        </Link>
      </div>

      {/* OON Info Banner */}
      <div className="mb-8">
        <Card className="border-blue-100 bg-blue-50/30">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Shield className="w-4 h-4 text-blue-700" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-blue-900 mb-1">
                  Out-of-Network Benefits at Foundation Health
                </h3>
                <p className="text-xs text-blue-700 leading-relaxed">
                  Foundation Health operates as an out-of-network (OON) provider. You pay for
                  services upfront at our transparent cash prices, then submit a superbill to your
                  insurance for OON reimbursement. Most patients with PPO plans recover 50-80% of
                  their costs. Submit a verification request below to check your specific OON benefits
                  before your visit.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      {totalCount > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
                <p className="text-xs text-gray-500">Total Policies</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <FileCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{verifiedCount}</p>
                <p className="text-xs text-gray-500">Verified</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
                <p className="text-xs text-gray-500">Pending</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter Bar */}
      <div
        id={elementId('insurance', 'toolbar')}
        className="mb-6 flex items-center justify-between"
      >
        <InsuranceFilter />
        <p className="text-sm text-gray-500">
          {verifications.length} {verifications.length === 1 ? 'verification' : 'verifications'} found
        </p>
      </div>

      {/* Verifications List */}
      {verifications.length === 0 ? (
        <Card id={elementId('insurance', 'empty')}>
          <CardContent className="py-12 text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              No insurance verifications
            </h3>
            <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
              {resolvedParams.status
                ? 'No verifications match the selected status. Try selecting a different filter.'
                : 'Submit a verification request to check your out-of-network benefits before your visit. This helps you understand your estimated costs and reimbursement.'}
            </p>
            {!resolvedParams.status && (
              <Link href="/patient/insurance/verify">
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Request Verification
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div id={elementId('insurance', 'list')} className="space-y-3">
          {verifications.map((verification) => (
            <VerificationCard
              key={verification.id}
              verification={verification}
            />
          ))}
        </div>
      )}
    </div>
  )
}
