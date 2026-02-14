import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPaymentHistory } from '@/lib/actions/billing'
import type { PaymentFilters } from '@/lib/actions/billing'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { PaymentCard } from '@/components/billing/payment-card'
import { PaymentFilter } from '@/components/billing/payment-filter'
import {
  DollarSign,
  XCircle,
  CreditCard,
} from 'lucide-react'

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

// ============================================
// Page Component (Server)
// ============================================

interface PaymentHistoryPageProps {
  searchParams: Promise<{
    status?: string
    dateFrom?: string
    dateTo?: string
  }>
}

export default async function PaymentHistoryPage({
  searchParams,
}: PaymentHistoryPageProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const resolvedParams = await searchParams

  const filters: PaymentFilters = {
    status: resolvedParams.status,
    dateFrom: resolvedParams.dateFrom,
    dateTo: resolvedParams.dateTo,
  }

  const { payments, summary } = await getPaymentHistory(user.id, filters)

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="relative overflow-hidden">
          <CardContent className="p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-500">
              <DollarSign className="h-4 w-4 text-emerald-500" />
              Total Paid
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(summary.totalPaid)}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Across all successful payments
            </p>
          </CardContent>
          <div className="absolute right-0 top-0 h-1 w-full bg-gradient-to-r from-emerald-400 to-emerald-500" />
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-500">
              <XCircle className="h-4 w-4 text-red-500" />
              Failed Payments
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {summary.failedCount}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {summary.failedCount === 0
                ? 'No failed payments'
                : `${summary.failedCount} payment${summary.failedCount === 1 ? '' : 's'} failed`}
            </p>
          </CardContent>
          <div className="absolute right-0 top-0 h-1 w-full bg-gradient-to-r from-red-400 to-red-500" />
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <PaymentFilter />
        </CardContent>
      </Card>

      {/* Payment List */}
      <div>
        <h2 className="mb-4 text-base font-semibold text-gray-900">
          Transactions ({payments.length})
        </h2>

        {payments.length > 0 ? (
          <div className="space-y-3">
            {payments.map((payment) => (
              <PaymentCard key={payment.id} payment={payment} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <CreditCard className="mb-3 h-12 w-12 text-gray-300" />
              <p className="text-sm font-medium text-gray-500">
                No payments found
              </p>
              <p className="mt-1 text-xs text-gray-400">
                {filters.status || filters.dateFrom || filters.dateTo
                  ? 'Try adjusting your filters to see more results'
                  : 'Your payment history will appear here once you make a payment'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
