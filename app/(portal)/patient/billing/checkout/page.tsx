import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getCheckoutInvoice } from '@/lib/actions/checkout'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckoutButton } from '@/components/billing/checkout-button'
import {
  ArrowLeft,
  FileText,
  Shield,
  Receipt,
  Info,
} from 'lucide-react'

// ============================================
// Helper
// ============================================

function formatUSD(dollars: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(dollars)
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// ============================================
// Page
// ============================================

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ invoice_id?: string }>
}) {
  const params = await searchParams
  const invoiceId = params.invoice_id

  if (!invoiceId) {
    redirect('/patient/billing')
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: invoice, error } = await getCheckoutInvoice(
    invoiceId,
    user.id
  )

  if (error || !invoice) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Link
          href="/patient/billing"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Billing
        </Link>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
              <FileText className="h-7 w-7 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Invoice Not Available
            </h2>
            <p className="mt-2 text-center text-sm text-gray-500">
              {error || 'The requested invoice could not be found.'}
            </p>
            <Link
              href="/patient/billing"
              className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
            >
              Return to Billing
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Back Link */}
      <Link
        href="/patient/billing"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Billing
      </Link>

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Payment Checkout
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Review your invoice and complete your payment securely
        </p>
      </div>

      {/* Order Summary Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <Receipt className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">Order Summary</CardTitle>
                <CardDescription>
                  Invoice {invoice.invoice_number ?? invoice.id.slice(0, 8)}
                </CardDescription>
              </div>
            </div>
            {invoice.membership_tier_applied && (
              <Badge variant="secondary" className="text-xs capitalize">
                {invoice.membership_tier_applied} pricing
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Practice Name */}
          {invoice.practice_name && (
            <p className="text-sm text-gray-500">
              {invoice.practice_name}
            </p>
          )}

          {/* Line Items */}
          <div className="rounded-lg border border-gray-100 bg-gray-50/50">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-2 border-b border-gray-100 px-4 py-2.5">
              <div className="col-span-6 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Service
              </div>
              <div className="col-span-2 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                Qty
              </div>
              <div className="col-span-2 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                Price
              </div>
              <div className="col-span-2 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                Total
              </div>
            </div>

            {/* Line Items */}
            {invoice.line_items.length > 0 ? (
              invoice.line_items.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 gap-2 border-b border-gray-50 px-4 py-3 last:border-b-0"
                >
                  <div className="col-span-6">
                    <p className="text-sm font-medium text-gray-900">
                      {item.name}
                    </p>
                    {item.cpt_code && (
                      <p className="mt-0.5 text-xs text-gray-400">
                        CPT: {item.cpt_code}
                      </p>
                    )}
                  </div>
                  <div className="col-span-2 flex items-center justify-end text-sm text-gray-600">
                    {item.qty}
                  </div>
                  <div className="col-span-2 flex items-center justify-end text-sm text-gray-600">
                    {formatUSD(item.unit_price)}
                  </div>
                  <div className="col-span-2 flex items-center justify-end text-sm font-medium text-gray-900">
                    {formatUSD(item.total)}
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500">
                Medical services
              </div>
            )}
          </div>

          {/* Totals */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-700">{formatUSD(invoice.subtotal)}</span>
            </div>

            {invoice.discount_amount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Discount</span>
                <span className="text-emerald-600">
                  -{formatUSD(invoice.discount_amount)}
                </span>
              </div>
            )}

            {invoice.tax_amount > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Tax</span>
                <span className="text-gray-700">
                  {formatUSD(invoice.tax_amount)}
                </span>
              </div>
            )}

            {invoice.amount_paid > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Previously Paid</span>
                <span className="text-gray-700">
                  -{formatUSD(invoice.amount_paid)}
                </span>
              </div>
            )}

            <Separator className="my-2" />

            <div className="flex items-center justify-between">
              <span className="text-base font-semibold text-gray-900">
                Total Due
              </span>
              <span className="text-xl font-bold text-gray-900">
                {formatUSD(invoice.amount_due)}
              </span>
            </div>
          </div>

          {/* Due Date */}
          {invoice.due_date && (
            <p className="text-xs text-gray-400">
              Due by {formatDate(invoice.due_date)}
            </p>
          )}
        </CardContent>

        <CardFooter className="flex-col space-y-4">
          {/* Pay Button */}
          <CheckoutButton
            invoiceId={invoice.id}
            amountDue={invoice.amount_due}
          />

          {/* Security Notice */}
          <div className="flex items-start gap-2 rounded-lg bg-gray-50 px-4 py-3">
            <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
            <p className="text-xs leading-relaxed text-gray-500">
              Your payment is processed securely through Stripe. Foundation
              Health does not store your card details. All transactions are
              encrypted and PCI-DSS compliant.
            </p>
          </div>
        </CardFooter>
      </Card>

      {/* Price Transparency Notice */}
      <Alert variant="default" icon={false}>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong className="font-semibold">Price Transparency:</strong>{' '}
          Foundation Health is a cash-pay practice. The prices listed reflect
          our transparent, upfront pricing. After payment, a superbill will be
          generated that you can submit to your insurance for potential
          out-of-network reimbursement.
        </AlertDescription>
      </Alert>

      {/* Invoice Notes */}
      {invoice.notes && (
        <Card>
          <CardContent className="py-4">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
              Notes
            </p>
            <p className="mt-1 text-sm text-gray-600">{invoice.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
