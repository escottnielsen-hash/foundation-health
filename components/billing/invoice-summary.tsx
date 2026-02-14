import { Card, CardContent } from '@/components/ui/card'
import { elementId } from '@/lib/utils/element-ids'
import type { InvoiceSummaryData } from '@/lib/actions/invoices'

// ============================================
// Currency formatting helper
// ============================================

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'N/A'
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

// ============================================
// InvoiceSummary component
// ============================================

interface InvoiceSummaryProps {
  summary: InvoiceSummaryData
}

export function InvoiceSummary({ summary }: InvoiceSummaryProps) {
  return (
    <div
      id={elementId('invoices', 'summary', 'container')}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
    >
      {/* Outstanding Balance */}
      <Card
        id={elementId('invoices', 'summary', 'outstanding')}
        className={
          summary.outstanding_balance > 0
            ? 'border-amber-200 bg-amber-50/50'
            : 'border-emerald-200 bg-emerald-50/50'
        }
      >
        <CardContent className="p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">
            Outstanding Balance
          </p>
          <p
            className={`text-2xl font-bold ${
              summary.outstanding_balance > 0
                ? 'text-amber-700'
                : 'text-emerald-700'
            }`}
          >
            {formatCurrency(summary.outstanding_balance)}
          </p>
          {summary.overdue_count > 0 && (
            <p className="text-xs text-red-600 mt-1 font-medium">
              {summary.overdue_count} overdue{' '}
              {summary.overdue_count === 1 ? 'invoice' : 'invoices'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Paid This Year */}
      <Card id={elementId('invoices', 'summary', 'paid-ytd')}>
        <CardContent className="p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">
            Paid This Year
          </p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(summary.total_paid_ytd)}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {new Date().getFullYear()} year to date
          </p>
        </CardContent>
      </Card>

      {/* Last Payment */}
      <Card id={elementId('invoices', 'summary', 'last-payment')}>
        <CardContent className="p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">
            Last Payment
          </p>
          <p className="text-2xl font-bold text-gray-900">
            {summary.last_payment_date
              ? formatDate(summary.last_payment_date)
              : '--'}
          </p>
          {!summary.last_payment_date && (
            <p className="text-xs text-gray-400 mt-1">No payments on record</p>
          )}
        </CardContent>
      </Card>

      {/* Overdue Count */}
      <Card
        id={elementId('invoices', 'summary', 'overdue')}
        className={
          summary.overdue_count > 0
            ? 'border-red-200 bg-red-50/50'
            : undefined
        }
      >
        <CardContent className="p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">
            Overdue
          </p>
          <p
            className={`text-2xl font-bold ${
              summary.overdue_count > 0 ? 'text-red-700' : 'text-gray-900'
            }`}
          >
            {summary.overdue_count}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {summary.overdue_count === 0
              ? 'All caught up'
              : 'Requires attention'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
