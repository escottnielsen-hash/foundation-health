import Link from 'next/link'
import {
  Calendar,
  FileText,
  MessageSquare,
  DollarSign,
  CalendarPlus,
  ArrowRight,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { elementId } from '@/lib/utils/element-ids'
import { formatCurrency } from '@/lib/utils/format'
import type { DashboardAppointment, DashboardFinancialSummary } from '@/lib/actions/dashboard'

interface DashboardKpiCardsProps {
  nextAppointment: DashboardAppointment | null
  pendingClaimsCount: number
  unreadMessagesCount: number
  financialSummary: DashboardFinancialSummary
}

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export function DashboardKpiCards({
  nextAppointment,
  pendingClaimsCount,
  unreadMessagesCount,
  financialSummary,
}: DashboardKpiCardsProps) {
  return (
    <div
      id={elementId('dashboard', 'kpi', 'grid')}
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {/* Next Appointment */}
      <Card className="relative overflow-hidden border-0 shadow-md">
        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-amber-400 to-amber-600" />
        <CardContent className="p-5 pl-4">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <Calendar className="h-4 w-4 text-amber-500" />
            Next Appointment
          </div>
          {nextAppointment ? (
            <div>
              <p className="text-lg font-bold text-slate-900">
                {formatRelativeDate(nextAppointment.scheduled_start)}
              </p>
              <p className="mt-0.5 text-sm text-slate-600">
                {formatTime(nextAppointment.scheduled_start)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {nextAppointment.title ||
                  nextAppointment.service_name ||
                  nextAppointment.appointment_type}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-sm text-slate-500">No upcoming visits</p>
              <Link
                href="/patient/appointments/book"
                className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-700"
              >
                <CalendarPlus className="h-3.5 w-3.5" />
                Book now
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Claims Pending */}
      <Card className="relative overflow-hidden border-0 shadow-md">
        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-400 to-blue-600" />
        <CardContent className="p-5 pl-4">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <FileText className="h-4 w-4 text-blue-500" />
            Claims Pending
          </div>
          <p className="text-lg font-bold text-slate-900">{pendingClaimsCount}</p>
          <p className="mt-0.5 text-xs text-slate-500">Awaiting resolution</p>
          <Link
            href="/patient/billing/payments"
            className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View claims
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardContent>
      </Card>

      {/* Unread Messages */}
      <Card className="relative overflow-hidden border-0 shadow-md">
        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-violet-400 to-violet-600" />
        <CardContent className="p-5 pl-4">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <MessageSquare className="h-4 w-4 text-violet-500" />
            Messages
          </div>
          <p className="text-lg font-bold text-slate-900">{unreadMessagesCount}</p>
          <p className="mt-0.5 text-xs text-slate-500">Unread notifications</p>
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <Card className="relative overflow-hidden border-0 shadow-md">
        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-emerald-400 to-emerald-600" />
        <CardContent className="p-5 pl-4">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <DollarSign className="h-4 w-4 text-emerald-500" />
            Net Cost YTD
          </div>
          <p className="text-lg font-bold text-slate-900">
            {formatCurrency(financialSummary.netCost)}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            {formatCurrency(financialSummary.pendingReimbursements)} pending
          </p>
          <Link
            href="/patient/billing/payments"
            className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            Financial details
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
