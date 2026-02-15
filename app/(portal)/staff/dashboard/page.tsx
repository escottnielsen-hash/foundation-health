import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getStaffDashboard } from '@/lib/actions/staff'
import { StaffKpiCards } from '@/components/staff/dashboard/staff-kpi-cards'
import { AppointmentQueue } from '@/components/staff/dashboard/appointment-queue'
import { CheckedInPatients } from '@/components/staff/dashboard/checked-in-patients'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import Link from 'next/link'
import {
  Calendar,
  ClipboardCheck,
  ListTodo,
  ArrowRight,
} from 'lucide-react'

// ============================================
// Quick link items
// ============================================

const quickLinks = [
  {
    label: 'Scheduling',
    description: 'View and manage all appointments',
    href: '/staff/scheduling',
    icon: Calendar,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    label: 'Check-In',
    description: 'Check in today\'s patients',
    href: '/staff/check-in',
    icon: ClipboardCheck,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    label: 'Tasks',
    description: 'View pending staff tasks',
    href: '/staff/tasks',
    icon: ListTodo,
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-600',
  },
]

// ============================================
// Staff Dashboard Page (Server)
// ============================================

export default async function StaffDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, role')
    .eq('id', user.id)
    .single()

  const firstName = profile?.first_name || 'Staff'

  const dashboardResult = await getStaffDashboard()

  const metrics = dashboardResult.success
    ? dashboardResult.data.metrics
    : {
        appointmentsToday: 0,
        checkedInCount: 0,
        noShowCount: 0,
        cancelledCount: 0,
        confirmedCount: 0,
        pendingTaskCount: 0,
      }

  const queue = dashboardResult.success ? dashboardResult.data.queue : []
  const checkedIn = dashboardResult.success ? dashboardResult.data.checkedIn : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Staff Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back, {firstName}. Here is today&apos;s overview.
        </p>
      </div>

      {/* KPI Cards */}
      <StaffKpiCards metrics={metrics} />

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick Actions</CardTitle>
          <CardDescription>Navigate to staff workflows</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            {quickLinks.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-start gap-3 rounded-lg border border-gray-100 p-4 transition-all hover:border-gray-200 hover:bg-gray-50"
                >
                  <div
                    className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${link.iconBg}`}
                  >
                    <Icon className={`h-5 w-5 ${link.iconColor}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {link.label}
                      </p>
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {link.description}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Appointment Queue */}
      <AppointmentQueue queue={queue} />

      {/* Checked-In Patients */}
      <CheckedInPatients patients={checkedIn} />
    </div>
  )
}
