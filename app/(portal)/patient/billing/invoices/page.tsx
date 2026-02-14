import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getPatientInvoices, getInvoiceSummary } from '@/lib/actions/invoices'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { InvoiceSummary } from '@/components/billing/invoice-summary'
import { InvoiceFilter } from '@/components/billing/invoice-filter'
import { INVOICE_STATUS_CONFIG } from '@/lib/validations/invoices'
import type { InvoiceLineItem } from '@/lib/validations/invoices'
import { elementId } from '@/lib/utils/element-ids'

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
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(dateStr))
  } catch {
    return dateStr
  }
}

function getServicesLabel(lineItems: InvoiceLineItem[]): string {
  if (lineItems.length === 0) return 'No services listed'
  if (lineItems.length === 1) return lineItems[0].name
  if (lineItems.length === 2) {
    return `${lineItems[0].name}, ${lineItems[1].name}`
  }
  return `${lineItems[0].name} +${lineItems.length - 1} more`
}

// ============================================
// Page
// ============================================

interface InvoicesPageProps {
  searchParams: Promise<{
    status?: string
    date_from?: string
    date_to?: string
  }>
}

export default async function InvoicesPage({ searchParams }: InvoicesPageProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const resolvedParams = await searchParams

  const filters =
    resolvedParams.status || resolvedParams.date_from || resolvedParams.date_to
      ? {
          status: resolvedParams.status ?? '',
          date_from: resolvedParams.date_from ?? '',
          date_to: resolvedParams.date_to ?? '',
        }
      : undefined

  // Fetch invoices and summary in parallel
  const [invoicesResult, summaryResult] = await Promise.all([
    getPatientInvoices(user.id, filters),
    getInvoiceSummary(user.id),
  ])

  if (!invoicesResult.success) {
    return (
      <div id={elementId('invoices', 'error')} className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Unable to load invoices
        </h2>
        <p className="text-gray-500">{invoicesResult.error}</p>
      </div>
    )
  }

  const invoices = invoicesResult.data
  const summary = summaryResult.success
    ? summaryResult.data
    : {
        outstanding_balance: 0,
        total_paid_ytd: 0,
        last_payment_date: null,
        overdue_count: 0,
      }

  return (
    <div id={elementId('invoices', 'page', 'container')}>
      {/* Page Header */}
      <div id={elementId('invoices', 'header')} className="mb-8">
        <h1
          id={elementId('invoices', 'title')}
          className="text-3xl font-bold text-gray-900"
        >
          Invoices
        </h1>
        <p
          id={elementId('invoices', 'subtitle')}
          className="text-gray-600 mt-1"
        >
          View and manage your billing statements
        </p>
      </div>

      {/* Summary Cards */}
      <InvoiceSummary summary={summary} />

      {/* Filter Bar */}
      <div
        id={elementId('invoices', 'toolbar')}
        className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
      >
        <InvoiceFilter />
        <p className="text-sm text-gray-500 whitespace-nowrap">
          {invoices.length} {invoices.length === 1 ? 'invoice' : 'invoices'}{' '}
          found
        </p>
      </div>

      {/* Invoices List */}
      {invoices.length === 0 ? (
        <Card id={elementId('invoices', 'empty')}>
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
                  d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2zM10 8.5a.5.5 0 11-1 0 .5.5 0 011 0zm5 5a.5.5 0 11-1 0 .5.5 0 011 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              No invoices found
            </h3>
            <p className="text-gray-500 text-sm">
              {filters
                ? 'No invoices match the selected filters. Try adjusting your criteria.'
                : 'Your invoices will appear here after your visits.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div id={elementId('invoices', 'list')} className="space-y-3">
          {invoices.map((invoice) => {
            const statusConfig = INVOICE_STATUS_CONFIG[invoice.status] ?? {
              label: invoice.status,
              variant: 'outline' as const,
            }

            return (
              <Link
                key={invoice.id}
                href={`/patient/billing/invoices/${invoice.id}`}
                className="block"
              >
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      {/* Left side */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1.5">
                          <span className="font-semibold text-gray-900">
                            {invoice.invoice_number ?? 'Draft'}
                          </span>
                          <Badge variant={statusConfig.variant}>
                            {statusConfig.label}
                          </Badge>
                          {invoice.membership_tier_applied && (
                            <Badge variant="secondary" className="text-xs">
                              {invoice.membership_tier_applied.charAt(0).toUpperCase() +
                                invoice.membership_tier_applied.slice(1)}{' '}
                              rate
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {getServicesLabel(invoice.line_items_parsed)}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-gray-400">
                            {formatDate(invoice.issued_at ?? invoice.created_at)}
                          </span>
                          {invoice.due_date && (
                            <span
                              className={`text-xs ${
                                invoice.status === 'overdue'
                                  ? 'text-red-500 font-medium'
                                  : 'text-gray-400'
                              }`}
                            >
                              Due {formatDate(invoice.due_date)}
                            </span>
                          )}
                          {invoice.practice_name && (
                            <span className="text-xs text-gray-400">
                              {invoice.practice_name}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right side — amount */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-lg font-bold text-gray-900">
                          {formatCurrency(invoice.total)}
                        </p>
                        {invoice.amount_due > 0 &&
                          invoice.status !== 'paid' && (
                            <p className="text-xs text-amber-600 font-medium">
                              {formatCurrency(invoice.amount_due)} due
                            </p>
                          )}
                        {invoice.status === 'paid' && (
                          <p className="text-xs text-emerald-600 font-medium">
                            Paid in full
                          </p>
                        )}
                      </div>

                      {/* Chevron */}
                      <div className="flex-shrink-0 self-center">
                        <svg
                          className="w-5 h-5 text-gray-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
