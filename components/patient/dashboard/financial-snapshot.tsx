import Link from 'next/link'
import {
  TrendingUp,
  TrendingDown,
  Clock,
  ArrowRight,
  DollarSign,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { elementId } from '@/lib/utils/element-ids'
import { formatCurrency } from '@/lib/utils/format'
import type { DashboardFinancialSummary } from '@/lib/actions/dashboard'

interface FinancialSnapshotProps {
  summary: DashboardFinancialSummary
}

export function FinancialSnapshot({ summary }: FinancialSnapshotProps) {
  return (
    <Card
      id={elementId('dashboard', 'financial', 'snapshot')}
      className="border-0 shadow-md"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-slate-900">
            Financial Snapshot
          </CardTitle>
          <Link
            href="/patient/billing/payments"
            className="inline-flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-700"
          >
            Details
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <CardDescription>Year-to-date financial overview</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Total Spent */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                <DollarSign className="h-4.5 w-4.5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Total Spent</p>
                <p className="text-xs text-slate-400">All payments this year</p>
              </div>
            </div>
            <span className="text-sm font-bold text-slate-900">
              {formatCurrency(summary.totalSpent)}
            </span>
          </div>

          <Separator className="bg-slate-100" />

          {/* Total Reimbursed */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
                <TrendingUp className="h-4.5 w-4.5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Reimbursed</p>
                <p className="text-xs text-slate-400">Insurance payments received</p>
              </div>
            </div>
            <span className="text-sm font-bold text-emerald-600">
              {formatCurrency(summary.totalReimbursed)}
            </span>
          </div>

          <Separator className="bg-slate-100" />

          {/* Pending Reimbursements */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50">
                <Clock className="h-4.5 w-4.5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Pending</p>
                <p className="text-xs text-slate-400">Awaiting reimbursement</p>
              </div>
            </div>
            <span className="text-sm font-bold text-amber-600">
              {formatCurrency(summary.pendingReimbursements)}
            </span>
          </div>

          <Separator className="bg-slate-100" />

          {/* Net Cost */}
          <div className="rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm">
                  <TrendingDown className="h-4.5 w-4.5 text-slate-700" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Your Net Cost
                  </p>
                  <p className="text-xs text-slate-500">After reimbursements</p>
                </div>
              </div>
              <span className="text-lg font-bold text-slate-900">
                {formatCurrency(summary.netCost)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
