import { Badge } from '@/components/ui/badge'
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  Clock,
  CreditCard,
  ExternalLink,
} from 'lucide-react'
import type { RecentPayment } from '@/lib/actions/billing'

// ============================================
// Helpers
// ============================================

function formatCurrency(amount: number, currency: string = 'usd'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(amount)
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function getStatusConfig(status: string): {
  label: string
  variant: 'success' | 'destructive' | 'warning' | 'outline'
  icon: React.ReactNode
} {
  switch (status) {
    case 'succeeded':
      return {
        label: 'Succeeded',
        variant: 'success',
        icon: <CheckCircle2 className="h-3.5 w-3.5" />,
      }
    case 'failed':
      return {
        label: 'Failed',
        variant: 'destructive',
        icon: <XCircle className="h-3.5 w-3.5" />,
      }
    case 'refunded':
      return {
        label: 'Refunded',
        variant: 'warning',
        icon: <RefreshCw className="h-3.5 w-3.5" />,
      }
    case 'pending':
      return {
        label: 'Pending',
        variant: 'outline',
        icon: <Clock className="h-3.5 w-3.5" />,
      }
    default:
      return {
        label: status.charAt(0).toUpperCase() + status.slice(1),
        variant: 'outline',
        icon: <Clock className="h-3.5 w-3.5" />,
      }
  }
}

// ============================================
// PaymentCard Component
// ============================================

interface PaymentCardProps {
  payment: RecentPayment
  compact?: boolean
}

export function PaymentCard({ payment, compact = false }: PaymentCardProps) {
  const statusConfig = getStatusConfig(payment.status)

  if (compact) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/50 px-4 py-3 transition-colors hover:bg-gray-50">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
            <CreditCard className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-gray-900">
              {payment.description || 'Payment'}
            </p>
            <p className="text-xs text-gray-500">
              {formatDate(payment.paid_at || payment.created_at)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={statusConfig.variant} className="text-[10px]">
            {statusConfig.label}
          </Badge>
          <span className="text-sm font-semibold text-gray-900">
            {formatCurrency(payment.amount, payment.currency)}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
            <CreditCard className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900">
              {payment.description || 'Payment'}
            </p>
            <p className="mt-0.5 text-xs text-gray-500">
              {formatDate(payment.paid_at || payment.created_at)}
            </p>
            {payment.payment_method_last4 && (
              <p className="mt-1 text-xs text-gray-400">
                {payment.payment_method_type === 'card'
                  ? `Card ending in ${payment.payment_method_last4}`
                  : `${payment.payment_method_type ?? 'Payment'} ****${payment.payment_method_last4}`}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="text-base font-bold text-gray-900">
            {formatCurrency(payment.amount, payment.currency)}
          </span>
          <Badge variant={statusConfig.variant} className="gap-1 text-[10px]">
            {statusConfig.icon}
            {statusConfig.label}
          </Badge>
        </div>
      </div>

      {/* Action Links */}
      {(payment.receipt_url || payment.invoice_url) && (
        <div className="mt-4 flex items-center gap-4 border-t border-gray-100 pt-3">
          {payment.receipt_url && (
            <a
              href={payment.receipt_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              <ExternalLink className="h-3 w-3" />
              View Receipt
            </a>
          )}
          {payment.invoice_url && (
            <a
              href={payment.invoice_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              <ExternalLink className="h-3 w-3" />
              View Invoice
            </a>
          )}
        </div>
      )}
    </div>
  )
}
