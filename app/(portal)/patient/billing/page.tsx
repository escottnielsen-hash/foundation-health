import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  getBillingSummary,
  getRecentInvoices,
  getRecentSuperbills,
  getRecentPayments,
} from '@/lib/actions/billing'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PaymentCard } from '@/components/billing/payment-card'
import {
  DollarSign,
  CheckCircle2,
  Clock,
  CalendarClock,
  FileText,
  Receipt,
  ArrowRight,
  ExternalLink,
  CreditCard,
  History,
} from 'lucide-react'
import type { InvoiceStatus, ClaimStatus } from '@/types/database'

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

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function getInvoiceStatusConfig(status: InvoiceStatus): {
  label: string
  variant: 'success' | 'destructive' | 'warning' | 'outline' | 'secondary'
} {
  switch (status) {
    case 'paid':
      return { label: 'Paid', variant: 'success' }
    case 'sent':
      return { label: 'Sent', variant: 'outline' }
    case 'overdue':
      return { label: 'Overdue', variant: 'destructive' }
    case 'partially_paid':
      return { label: 'Partial', variant: 'warning' }
    case 'draft':
      return { label: 'Draft', variant: 'secondary' }
    case 'void':
      return { label: 'Void', variant: 'secondary' }
    case 'refunded':
      return { label: 'Refunded', variant: 'warning' }
    default:
      return { label: status, variant: 'outline' }
  }
}

function getClaimStatusConfig(status: ClaimStatus): {
  label: string
  variant: 'success' | 'destructive' | 'warning' | 'outline' | 'secondary'
} {
  switch (status) {
    case 'paid':
      return { label: 'Paid', variant: 'success' }
    case 'partially_paid':
      return { label: 'Partial', variant: 'warning' }
    case 'submitted':
      return { label: 'Submitted', variant: 'outline' }
    case 'acknowledged':
      return { label: 'Acknowledged', variant: 'outline' }
    case 'pending':
      return { label: 'Pending', variant: 'warning' }
    case 'denied':
      return { label: 'Denied', variant: 'destructive' }
    case 'appealed':
      return { label: 'Appealed', variant: 'warning' }
    case 'draft':
      return { label: 'Draft', variant: 'secondary' }
    default:
      return { label: status, variant: 'outline' }
  }
}

// ============================================
// Page Component (Server)
// ============================================

export default async function BillingDashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const [summary, recentInvoices, recentSuperbills, recentPayments] =
    await Promise.all([
      getBillingSummary(user.id),
      getRecentInvoices(user.id, 5),
      getRecentSuperbills(user.id, 5),
      getRecentPayments(user.id, 5),
    ])

  return (
    <div className="space-y-8">
      {/* Financial Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Outstanding Balance */}
        <Card className="relative overflow-hidden">
          <CardContent className="p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-500">
              <DollarSign className="h-4 w-4 text-red-500" />
              Outstanding Balance
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(summary.outstandingBalance)}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Total unpaid invoices
            </p>
          </CardContent>
          <div className="absolute right-0 top-0 h-1 w-full bg-gradient-to-r from-red-400 to-red-500" />
        </Card>

        {/* Paid This Year */}
        <Card className="relative overflow-hidden">
          <CardContent className="p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-500">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Paid This Year
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(summary.paidThisYear)}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Year-to-date payments
            </p>
          </CardContent>
          <div className="absolute right-0 top-0 h-1 w-full bg-gradient-to-r from-emerald-400 to-emerald-500" />
        </Card>

        {/* Pending Reimbursements */}
        <Card className="relative overflow-hidden">
          <CardContent className="p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-500">
              <Clock className="h-4 w-4 text-amber-500" />
              Pending Reimbursements
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(summary.pendingReimbursements)}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Submitted superbills awaiting payment
            </p>
          </CardContent>
          <div className="absolute right-0 top-0 h-1 w-full bg-gradient-to-r from-amber-400 to-amber-500" />
        </Card>

        {/* Next Payment Due */}
        <Card className="relative overflow-hidden">
          <CardContent className="p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-500">
              <CalendarClock className="h-4 w-4 text-blue-500" />
              Next Payment Due
            </div>
            {summary.nextPaymentDue ? (
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {formatDate(summary.nextPaymentDue)}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Earliest unpaid invoice
                </p>
              </div>
            ) : (
              <div>
                <p className="text-lg font-semibold text-emerald-600">
                  All clear
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  No upcoming payments due
                </p>
              </div>
            )}
          </CardContent>
          <div className="absolute right-0 top-0 h-1 w-full bg-gradient-to-r from-blue-400 to-blue-500" />
        </Card>
      </div>

      {/* Recent Invoices & Superbills */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Invoices */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Invoices</CardTitle>
              <Link
                href="/patient/billing/invoices"
                className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                View all
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <CardDescription>Your latest billing statements</CardDescription>
          </CardHeader>
          <CardContent>
            {recentInvoices.length > 0 ? (
              <div className="space-y-3">
                {recentInvoices.map((invoice) => {
                  const statusConfig = getInvoiceStatusConfig(invoice.status)
                  return (
                    <div
                      key={invoice.id}
                      className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/50 px-4 py-3 transition-colors hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-gray-900">
                            {invoice.invoice_number ?? 'Invoice'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {invoice.due_date
                              ? `Due ${formatDate(invoice.due_date)}`
                              : formatDate(invoice.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={statusConfig.variant}
                          className="text-[10px]"
                        >
                          {statusConfig.label}
                        </Badge>
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(invoice.total)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="mb-3 h-10 w-10 text-gray-300" />
                <p className="text-sm text-gray-500">No invoices yet</p>
                <p className="mt-1 text-xs text-gray-400">
                  Your invoices will appear here
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Superbills */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Superbills</CardTitle>
              <Link
                href="/patient/billing/superbills"
                className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                View all
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <CardDescription>
              Insurance claims submitted for reimbursement
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentSuperbills.length > 0 ? (
              <div className="space-y-3">
                {recentSuperbills.map((superbill) => {
                  const statusConfig = getClaimStatusConfig(superbill.status)
                  return (
                    <div
                      key={superbill.id}
                      className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/50 px-4 py-3 transition-colors hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                          <Receipt className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-gray-900">
                            {superbill.claim_number ?? 'Superbill'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {superbill.payer_name
                              ? `${superbill.payer_name} - ${formatDate(superbill.service_date)}`
                              : formatDate(superbill.service_date)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={statusConfig.variant}
                          className="text-[10px]"
                        >
                          {statusConfig.label}
                        </Badge>
                        <span className="text-sm font-semibold text-gray-900">
                          {formatCurrency(superbill.billed_amount)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Receipt className="mb-3 h-10 w-10 text-gray-300" />
                <p className="text-sm text-gray-500">No superbills yet</p>
                <p className="mt-1 text-xs text-gray-400">
                  Superbills for insurance reimbursement will appear here
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Payments */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Recent Payments</CardTitle>
            <Link
              href="/patient/billing/payments"
              className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <CardDescription>Your latest payment transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {recentPayments.length > 0 ? (
            <div className="space-y-3">
              {recentPayments.map((payment) => (
                <PaymentCard
                  key={payment.id}
                  payment={payment}
                  compact
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CreditCard className="mb-3 h-10 w-10 text-gray-300" />
              <p className="text-sm text-gray-500">No payments yet</p>
              <p className="mt-1 text-xs text-gray-400">
                Your payment history will appear here
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick Actions</CardTitle>
          <CardDescription>Common billing tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <QuickAction
              href="/patient/billing/invoices"
              icon={<FileText className="h-5 w-5" />}
              label="View All Invoices"
              color="bg-blue-100 text-blue-600"
            />
            <QuickAction
              href="/patient/billing/superbills"
              icon={<Receipt className="h-5 w-5" />}
              label="View Superbills"
              color="bg-amber-100 text-amber-600"
            />
            <QuickAction
              href="/patient/billing/payments"
              icon={<History className="h-5 w-5" />}
              label="Payment History"
              color="bg-emerald-100 text-emerald-600"
            />
            <ManageBillingAction />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================
// Quick Action Component
// ============================================

function QuickAction({
  href,
  icon,
  label,
  color,
}: {
  href: string
  icon: React.ReactNode
  label: string
  color: string
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-2 rounded-xl border border-gray-100 bg-white p-4 text-center transition-all hover:border-gray-200 hover:shadow-md"
    >
      <div
        className={`flex h-11 w-11 items-center justify-center rounded-lg ${color}`}
      >
        {icon}
      </div>
      <span className="text-xs font-medium text-gray-700">{label}</span>
    </Link>
  )
}

// ============================================
// Manage Billing Action (Stripe Portal)
// ============================================

function ManageBillingAction() {
  return (
    <a
      href="/api/stripe/portal"
      className="flex flex-col items-center gap-2 rounded-xl border border-gray-100 bg-white p-4 text-center transition-all hover:border-gray-200 hover:shadow-md"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
        <ExternalLink className="h-5 w-5" />
      </div>
      <span className="text-xs font-medium text-gray-700">
        Manage Billing
      </span>
    </a>
  )
}
