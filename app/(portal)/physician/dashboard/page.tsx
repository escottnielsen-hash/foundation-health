import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getPhysicianDashboard, getPhysicianStats } from '@/lib/actions/physician'
import { PhysicianKpiCards } from '@/components/physician/dashboard/physician-kpi-cards'
import { TodaysSchedule } from '@/components/physician/dashboard/todays-schedule'
import { RecentEncounters } from '@/components/physician/dashboard/recent-encounters'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Stethoscope,
  Calendar,
  Video,
} from 'lucide-react'

// ============================================
// Physician Dashboard Page (Server Component)
// ============================================

export default async function PhysicianDashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get physician_profile ID
  const { data: physicianProfile } = await supabase
    .from('physician_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!physicianProfile) {
    redirect('/dashboard')
  }

  const [dashboardData, stats] = await Promise.all([
    getPhysicianDashboard(physicianProfile.id),
    getPhysicianStats(physicianProfile.id),
  ])

  const greeting = dashboardData.profile.first_name
    ? `Welcome back, Dr. ${dashboardData.profile.last_name ?? dashboardData.profile.first_name}`
    : 'Welcome back'

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{greeting}</h2>
          <p className="mt-1 text-sm text-slate-500">
            {dashboardData.profile.specialty
              ? `${dashboardData.profile.specialty}${dashboardData.profile.credentials ? `, ${dashboardData.profile.credentials}` : ''}`
              : 'Physician Portal'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/physician/schedule" className="gap-2">
              <Calendar className="h-4 w-4" />
              View Schedule
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/physician/telemedicine" className="gap-2">
              <Video className="h-4 w-4" />
              Telemedicine
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <PhysicianKpiCards
        todaysPatients={dashboardData.todaysAppointmentsCount}
        pendingNotes={dashboardData.pendingEncounters.length}
        upcomingTelehealth={dashboardData.upcomingTelemedicine.length}
        stats={stats}
      />

      {/* Today's Schedule + Recent Encounters */}
      <div className="grid gap-6 lg:grid-cols-2">
        <TodaysSchedule appointments={dashboardData.upcomingAppointments} />
        <RecentEncounters encounters={dashboardData.pendingEncounters} />
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-slate-900">
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            <Link
              href="/physician/encounters"
              className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 transition-colors hover:border-amber-300 hover:bg-amber-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
                <Stethoscope className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Start Encounter
                </p>
                <p className="text-xs text-slate-500">
                  Begin a new patient visit
                </p>
              </div>
            </Link>

            <Link
              href="/physician/schedule"
              className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 transition-colors hover:border-blue-300 hover:bg-blue-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  View Schedule
                </p>
                <p className="text-xs text-slate-500">
                  Check upcoming appointments
                </p>
              </div>
            </Link>

            <Link
              href="/physician/telemedicine"
              className="flex items-center gap-3 rounded-lg border border-slate-200 p-4 transition-colors hover:border-violet-300 hover:bg-violet-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100">
                <Video className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Telemedicine Sessions
                </p>
                <p className="text-xs text-slate-500">
                  Manage virtual visits
                </p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
