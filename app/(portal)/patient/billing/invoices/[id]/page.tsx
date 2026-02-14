import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getInvoiceById } from '@/lib/actions/invoices'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { InvoiceLineItems } from '@/components/billing/invoice-line-items'
import { InvoiceDetailActions } from '@/components/billing/invoice-detail-actions'
import { INVOICE_STATUS_CONFIG } from '@/lib/validations/invoices'
import { elementId } from '@/lib/utils/element-ids'
import type { InvoiceStatus } from '@/types/database'

// ============================================
// Helpers
// ============================================

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '--'
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(dateStr))
  } catch {
    return dateStr
  }
}

function formatDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return '--'
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(dateStr))
  } catch {
    return dateStr
  }
}

function isPayable(status: string): boolean {
  const payableStatuses: InvoiceStatus[] = ['sent', 'partially_paid', 'overdue']
  return payableStatuses.includes(status as InvoiceStatus)
}

// ============================================
// Page
// ============================================

interface InvoiceDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function InvoiceDetailPage({
  params,
}: InvoiceDetailPageProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const resolvedParams = await params
  const invoiceId = resolvedParams.id

  const result = await getInvoiceById(invoiceId, user.id)

  if (!result.success) {
    notFound()
  }

  const invoice = result.data

  const statusConfig = INVOICE_STATUS_CONFIG[invoice.status] ?? {
    label: invoice.status,
    variant: 'outline' as const,
  }

  return (
    <div id={elementId('invoice-detail', 'page', 'container')}>
      {/* Back Navigation */}
      <div id={elementId('invoice-detail', 'back')} className="mb-6">
        <Link href="/patient/billing/invoices">
          <Button variant="ghost" size="sm" className="gap-2 text-gray-600">
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
            Back to Invoices
          </Button>
        </Link>
      </div>

      {/* Invoice Header */}
      <div
        id={elementId('invoice-detail', 'header')}
        className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">
              {invoice.invoice_number ?? 'Draft Invoice'}
            </h1>
            <Badge variant={statusConfig.variant} className="text-sm">
              {statusConfig.label}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <span>
              Issued {formatDate(invoice.issued_at ?? invoice.created_at)}
            </span>
            {invoice.due_date && (
              <span
                className={
                  invoice.status === 'overdue'
                    ? 'text-red-600 font-medium'
                    : ''
                }
              >
                Due {formatDate(invoice.due_date)}
              </span>
            )}
            {invoice.practice_name && (
              <span>{invoice.practice_name}</span>
            )}
          </div>
        </div>

        {/* Actions */}
        <InvoiceDetailActions
          invoiceId={invoice.id}
          userId={user.id}
          showPayButton={isPayable(invoice.status) && invoice.amount_due > 0}
        />
      </div>

      {/* Amount Summary Bar */}
      <Card
        id={elementId('invoice-detail', 'amount-bar')}
        className={
          invoice.status === 'overdue'
            ? 'border-red-200 bg-red-50/40 mb-8'
            : invoice.status === 'paid'
              ? 'border-emerald-200 bg-emerald-50/40 mb-8'
              : 'mb-8'
        }
      >
        <CardContent className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">
                Total
              </p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(invoice.total)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">
                Paid
              </p>
              <p className="text-xl font-bold text-emerald-700">
                {formatCurrency(invoice.amount_paid)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">
                Balance Due
              </p>
              <p
                className={`text-xl font-bold ${
                  invoice.amount_due > 0 ? 'text-amber-700' : 'text-gray-900'
                }`}
              >
                {formatCurrency(invoice.amount_due)}
              </p>
            </div>
            {invoice.membership_tier_applied && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">
                  Membership Rate
                </p>
                <p className="text-xl font-bold text-primary-700">
                  {invoice.membership_tier_applied.charAt(0).toUpperCase() +
                    invoice.membership_tier_applied.slice(1)}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Patient Info */}
      <Card
        id={elementId('invoice-detail', 'patient-info')}
        className="mb-6"
      >
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Patient Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <MetadataField
              label="Name"
              value={invoice.patient_name ?? 'N/A'}
            />
            <MetadataField
              label="Email"
              value={invoice.patient_email ?? 'N/A'}
            />
            {invoice.encounter_date && (
              <MetadataField
                label="Visit Date"
                value={formatDate(invoice.encounter_date)}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Line Items */}
      <Card id={elementId('invoice-detail', 'line-items')} className="mb-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Services</CardTitle>
          <CardDescription>
            Itemized list of services on this invoice
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InvoiceLineItems
            lineItems={invoice.line_items_parsed}
            subtotal={invoice.subtotal}
            taxAmount={invoice.tax_amount}
            discountAmount={invoice.discount_amount}
            total={invoice.total}
          />
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card id={elementId('invoice-detail', 'payments')} className="mb-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Payment History</CardTitle>
          <CardDescription>
            Payments recorded against this invoice
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invoice.payments.length === 0 ? (
            <div className="py-6 text-center text-sm text-gray-500">
              No payments recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {invoice.payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-emerald-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(payment.amount / 100)}
                        <span className="ml-1 text-xs text-gray-400 uppercase">
                          {payment.currency}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDateTime(payment.paid_at ?? payment.created_at)}
                        {payment.payment_method_type && (
                          <>
                            {' '}
                            via {payment.payment_method_type}
                            {payment.payment_method_last4 &&
                              ` ending ${payment.payment_method_last4}`}
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      payment.status === 'succeeded' ? 'success' : 'outline'
                    }
                    className="text-xs"
                  >
                    {payment.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      {invoice.notes && (
        <Card id={elementId('invoice-detail', 'notes')} className="mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {invoice.notes}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ============================================
// Helper components
// ============================================

function MetadataField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">{value}</dd>
    </div>
  )
}
