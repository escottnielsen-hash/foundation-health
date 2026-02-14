import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAdminDashboardStats } from '@/lib/actions/admin/locations'
import { AdminStats } from '@/components/admin/admin-stats'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import Link from 'next/link'
import {
  Building2,
  Users,
  Settings,
  ArrowRight,
  CalendarCheck,
  FileText,
} from 'lucide-react'

// ============================================
// Quick link items
// ============================================

const quickLinks = [
  {
    label: 'Manage Locations',
    description: 'Add, edit, and manage practice locations',
    href: '/admin/locations',
    icon: Building2,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    label: 'View Providers',
    description: 'Review active provider roster',
    href: '/patient/providers',
    icon: Users,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    label: 'Appointments',
    description: 'View today\'s appointment schedule',
    href: '/patient/appointments',
    icon: CalendarCheck,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
  {
    label: 'Billing Overview',
    description: 'Review invoices and payments',
    href: '/patient/billing',
    icon: FileText,
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-600',
  },
]

// ============================================
// Admin Dashboard Page (Server)
// ============================================

export default async function AdminDashboardPage() {
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

  const firstName = profile?.first_name || 'Admin'

  const statsResult = await getAdminDashboardStats()
  const stats = statsResult.success
    ? statsResult.data
    : {
        totalLocations: 0,
        activeLocations: 0,
        activeProviders: 0,
        totalPatients: 0,
        appointmentsToday: 0,
      }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Admin Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back, {firstName}. Here is your practice overview.
        </p>
      </div>

      {/* Stats Cards */}
      <AdminStats
        totalLocations={stats.totalLocations}
        activeProviders={stats.activeProviders}
        totalPatients={stats.totalPatients}
        appointmentsToday={stats.appointmentsToday}
      />

      {/* Quick Links */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick Actions</CardTitle>
          <CardDescription>Navigate to management sections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
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

      {/* Location Summary */}
      {stats.totalLocations > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Locations Summary</CardTitle>
              <Link
                href="/admin/locations"
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="font-semibold text-gray-900">
                  {stats.activeLocations}
                </span>{' '}
                <span className="text-gray-500">active</span>
              </div>
              <div className="h-4 w-px bg-gray-200" />
              <div>
                <span className="font-semibold text-gray-900">
                  {stats.totalLocations - stats.activeLocations}
                </span>{' '}
                <span className="text-gray-500">inactive</span>
              </div>
              <div className="h-4 w-px bg-gray-200" />
              <div>
                <span className="font-semibold text-gray-900">
                  {stats.totalLocations}
                </span>{' '}
                <span className="text-gray-500">total</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
