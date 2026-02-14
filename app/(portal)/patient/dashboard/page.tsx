import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getDashboardData } from '@/lib/actions/dashboard'
import type { DashboardData } from '@/lib/actions/dashboard'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import {
  Calendar,
  Crown,
  Shield,
  Star,
  FileText,
  MessageSquare,
  Clock,
  Stethoscope,
  ArrowRight,
  CalendarPlus,
  FolderOpen,
  Phone,
  CreditCard,
  Video,
  MapPin,
} from 'lucide-react'
import type { MembershipTierName } from '@/types/database'

// ============================================
// Helper Functions
// ============================================

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
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

function formatDateTime(dateString: string): string {
  return `${formatDate(dateString)} at ${formatTime(dateString)}`
}

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`
  return formatDate(dateString)
}

function getTierConfig(tier: MembershipTierName): {
  icon: React.ReactNode
  color: string
  bgColor: string
  borderColor: string
  textColor: string
} {
  switch (tier) {
    case 'platinum':
      return {
        icon: <Crown className="h-4 w-4" />,
        color: 'text-purple-700',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        textColor: 'text-purple-700',
      }
    case 'gold':
      return {
        icon: <Star className="h-4 w-4" />,
        color: 'text-amber-700',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        textColor: 'text-amber-700',
      }
    case 'silver':
      return {
        icon: <Shield className="h-4 w-4" />,
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        textColor: 'text-gray-700',
      }
  }
}

// ============================================
// Page Component (Server)
// ============================================

export default async function PatientDashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const data = await getDashboardData(user.id)

  const firstName = data.profile.first_name || 'there'
  const tierConfig = data.membership.tier
    ? getTierConfig(data.membership.tier)
    : null

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Welcome back, {firstName}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Here is an overview of your health today
          </p>
        </div>
        {data.membership.tier && tierConfig && (
          <div
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold ${tierConfig.bgColor} ${tierConfig.borderColor} ${tierConfig.textColor}`}
          >
            {tierConfig.icon}
            {data.membership.tier.charAt(0).toUpperCase() +
              data.membership.tier.slice(1)}{' '}
            Member
          </div>
        )}
      </div>

      {/* Quick Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Next Appointment Card */}
        <Card className="relative overflow-hidden">
          <CardContent className="p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-500">
              <Calendar className="h-4 w-4 text-blue-500" />
              Next Appointment
            </div>
            {data.nextAppointment ? (
              <div>
                <p className="text-lg font-bold text-gray-900">
                  {formatRelativeDate(data.nextAppointment.scheduled_start)}
                </p>
                <p className="mt-0.5 text-sm text-gray-600">
                  {formatTime(data.nextAppointment.scheduled_start)}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {data.nextAppointment.service_name ||
                    data.nextAppointment.appointment_type}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-500">
                  No upcoming appointments
                </p>
                <Link
                  href="/patient/appointments"
                  className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  <CalendarPlus className="h-3.5 w-3.5" />
                  Book now
                </Link>
              </div>
            )}
          </CardContent>
          <div className="absolute right-0 top-0 h-1 w-full bg-gradient-to-r from-blue-500 to-blue-600" />
        </Card>

        {/* Membership Status Card */}
        <Card className="relative overflow-hidden">
          <CardContent className="p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-500">
              <CreditCard className="h-4 w-4 text-amber-500" />
              Membership
            </div>
            {data.membership.tier ? (
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-bold text-gray-900">
                    {data.membership.tier.charAt(0).toUpperCase() +
                      data.membership.tier.slice(1)}
                  </p>
                  <Badge
                    variant={
                      data.membership.status === 'active'
                        ? 'success'
                        : 'warning'
                    }
                    className="text-[10px]"
                  >
                    {data.membership.status === 'active'
                      ? 'Active'
                      : data.membership.status}
                  </Badge>
                </div>
                {data.membership.current_period_end && (
                  <p className="mt-1 text-xs text-gray-500">
                    Renews{' '}
                    {formatDate(data.membership.current_period_end)}
                  </p>
                )}
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-500">No active membership</p>
                <Link
                  href="/patient/membership"
                  className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-700"
                >
                  View plans
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </CardContent>
          <div className="absolute right-0 top-0 h-1 w-full bg-gradient-to-r from-amber-400 to-amber-500" />
        </Card>

        {/* Recent Records Card */}
        <Card className="relative overflow-hidden">
          <CardContent className="p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-500">
              <FileText className="h-4 w-4 text-emerald-500" />
              Recent Records
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">
                {data.recentRecordsCount}
              </p>
              <p className="mt-0.5 text-xs text-gray-500">In the last 30 days</p>
            </div>
            <Link
              href="/patient/records"
              className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700"
            >
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardContent>
          <div className="absolute right-0 top-0 h-1 w-full bg-gradient-to-r from-emerald-500 to-emerald-600" />
        </Card>

        {/* Messages Card */}
        <Card className="relative overflow-hidden">
          <CardContent className="p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-500">
              <MessageSquare className="h-4 w-4 text-violet-500" />
              Messages
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">
                {data.unreadMessagesCount}
              </p>
              <p className="mt-0.5 text-xs text-gray-500">Unread messages</p>
            </div>
          </CardContent>
          <div className="absolute right-0 top-0 h-1 w-full bg-gradient-to-r from-violet-500 to-violet-600" />
        </Card>
      </div>

      {/* Two Column Layout: Upcoming + Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Appointments */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">
                Upcoming Appointments
              </CardTitle>
              <Link
                href="/patient/appointments"
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                View all
              </Link>
            </div>
            <CardDescription>Your next scheduled visits</CardDescription>
          </CardHeader>
          <CardContent>
            {data.upcomingAppointments.length > 0 ? (
              <div className="space-y-3">
                {data.upcomingAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50/50 p-3 transition-colors hover:bg-gray-50"
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                      {apt.is_telehealth ? (
                        <Video className="h-5 w-5" />
                      ) : (
                        <Calendar className="h-5 w-5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {apt.title ||
                          apt.service_name ||
                          apt.appointment_type}
                      </p>
                      <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {formatDateTime(apt.scheduled_start)}
                      </div>
                      {apt.location && (
                        <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
                          <MapPin className="h-3 w-3" />
                          {apt.location}
                        </div>
                      )}
                      {apt.is_telehealth && (
                        <Badge
                          variant="secondary"
                          className="mt-1.5 text-[10px]"
                        >
                          Telehealth
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Calendar className="mb-3 h-10 w-10 text-gray-300" />
                <p className="text-sm text-gray-500">
                  No upcoming appointments
                </p>
                <Link
                  href="/patient/appointments"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  <CalendarPlus className="h-4 w-4" />
                  Book Appointment
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Recent Activity</CardTitle>
              <Link
                href="/patient/encounters"
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                View all
              </Link>
            </div>
            <CardDescription>
              Your latest encounters and records
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.recentEncounters.length > 0 ? (
              <div className="space-y-3">
                {data.recentEncounters.map((enc) => (
                  <div
                    key={enc.id}
                    className="flex items-start gap-3 rounded-lg border border-gray-100 bg-gray-50/50 p-3"
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                      <Stethoscope className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {enc.chief_complaint || 'Visit'}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {enc.check_in_time
                          ? formatDate(enc.check_in_time)
                          : formatDate(enc.created_at)}
                      </p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <Badge
                          variant={
                            enc.status === 'completed' ? 'success' : 'outline'
                          }
                          className="text-[10px]"
                        >
                          {enc.status.replace('_', ' ')}
                        </Badge>
                        {enc.is_telehealth && (
                          <Badge
                            variant="secondary"
                            className="text-[10px]"
                          >
                            Telehealth
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Stethoscope className="mb-3 h-10 w-10 text-gray-300" />
                <p className="text-sm text-gray-500">No recent activity</p>
                <p className="mt-1 text-xs text-gray-400">
                  Your encounters will appear here
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <QuickAction
              href="/patient/appointments"
              icon={<CalendarPlus className="h-5 w-5" />}
              label="Book Appointment"
              color="bg-blue-100 text-blue-600"
            />
            <QuickAction
              href="/patient/records"
              icon={<FolderOpen className="h-5 w-5" />}
              label="View Records"
              color="bg-emerald-100 text-emerald-600"
            />
            <QuickAction
              href="/patient/membership"
              icon={<CreditCard className="h-5 w-5" />}
              label="Manage Membership"
              color="bg-amber-100 text-amber-600"
            />
            <QuickAction
              href="/patient/profile"
              icon={<Phone className="h-5 w-5" />}
              label="Contact Us"
              color="bg-violet-100 text-violet-600"
            />
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
