import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { verifyPaymentSession } from '@/lib/actions/checkout'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  CheckCircle2,
  FileText,
  LayoutDashboard,
  Receipt,
  ArrowRight,
} from 'lucide-react'

// ============================================
// Helper
// ============================================

function formatUSD(cents: number): string {
  const dollars = cents / 100
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(dollars)
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

// ============================================
// Page
// ============================================

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const params = await searchParams
  const sessionId = params.session_id

  if (!sessionId) {
    redirect('/patient/billing')
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: payment, error } = await verifyPaymentSession(sessionId)

  if (error || !payment) {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
              <Receipt className="h-7 w-7 text-amber-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Payment Verification Pending
            </h2>
            <p className="mt-2 max-w-sm text-center text-sm text-gray-500">
              {error ||
                'We could not verify your payment at this time. If you were charged, your payment will still be processed.'}
            </p>
            <Link
              href="/patient/billing"
              className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
            >
              Go to Billing
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      {/* Success Card */}
      <Card className="overflow-hidden">
        {/* Green top accent */}
        <div className="h-1.5 bg-gradient-to-r from-emerald-400 to-emerald-600" />

        <CardHeader className="text-center">
          {/* Success icon with animation ring */}
          <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-9 w-9 text-emerald-600" />
          </div>
          <CardTitle className="text-xl">Payment Successful</CardTitle>
          <CardDescription>
            Your payment has been processed successfully
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Payment Details */}
          <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Amount Paid</span>
                <span className="text-lg font-bold text-gray-900">
                  {formatUSD(payment.amount_total)}
                </span>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Date</span>
                <span className="text-sm font-medium text-gray-700">
                  {formatDate(payment.payment_date)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Time</span>
                <span className="text-sm font-medium text-gray-700">
                  {formatTime(payment.payment_date)}
                </span>
              </div>

              {payment.invoice_id && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Invoice Reference
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    {payment.invoice_id.slice(0, 8).toUpperCase()}
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Status</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                  <CheckCircle2 className="h-3 w-3" />
                  Complete
                </span>
              </div>
            </div>
          </div>

          {/* Superbill Notice */}
          <Alert variant="success" icon={false}>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              <strong className="font-semibold">Superbill Generation:</strong>{' '}
              Your superbill will be automatically generated and available in
              your billing dashboard. You can submit it to your insurance
              provider for potential out-of-network reimbursement.
            </AlertDescription>
          </Alert>

          {/* Action Links */}
          <div className="space-y-2 pt-2">
            {payment.invoice_id && (
              <Link
                href={`/patient/billing?invoice=${payment.invoice_id}`}
                className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                <span className="flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-gray-400" />
                  View Invoice
                </span>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </Link>
            )}

            <Link
              href="/patient/billing?tab=superbills"
              className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-400" />
                View Superbills
              </span>
              <ArrowRight className="h-4 w-4 text-gray-400" />
            </Link>

            <Link
              href="/patient/dashboard"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-700"
            >
              <LayoutDashboard className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
