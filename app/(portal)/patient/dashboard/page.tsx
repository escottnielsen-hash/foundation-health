import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getDashboardOverview } from '@/lib/actions/dashboard'
import { WelcomeBanner } from '@/components/patient/dashboard/welcome-banner'
import { DashboardKpiCards } from '@/components/patient/dashboard/dashboard-kpi-cards'
import { UpcomingAppointmentsCard } from '@/components/patient/dashboard/upcoming-appointments-card'
import { UpcomingTelemedicineCard } from '@/components/patient/dashboard/upcoming-telemedicine-card'
import { RecentClaimsCard } from '@/components/patient/dashboard/recent-claims-card'
import { FinancialSnapshot } from '@/components/patient/dashboard/financial-snapshot'
import { QuickActions } from '@/components/patient/dashboard/quick-actions'

export default async function PatientDashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const data = await getDashboardOverview(user.id)

  const nextAppointment =
    data.upcomingAppointments.length > 0
      ? data.upcomingAppointments[0]
      : null

  const pendingClaimsCount = data.recentClaims.filter((c) =>
    ['submitted', 'acknowledged', 'pending', 'in_review', 'appealed', 'idr_initiated'].includes(
      c.status
    )
  ).length

  return (
    <div className="space-y-6">
      {/* Row 1: Welcome Banner */}
      <WelcomeBanner
        firstName={data.profile.first_name}
        tier={data.membership.tier}
        membershipStatus={data.membership.status}
        currentPeriodEnd={data.membership.current_period_end}
      />

      {/* Row 2: 4 KPI Cards */}
      <DashboardKpiCards
        nextAppointment={nextAppointment}
        pendingClaimsCount={pendingClaimsCount}
        unreadMessagesCount={data.unreadNotificationsCount}
        financialSummary={data.financialSummary}
      />

      {/* Row 3: Upcoming Appointments + Telemedicine */}
      <div className="grid gap-6 lg:grid-cols-2">
        <UpcomingAppointmentsCard appointments={data.upcomingAppointments} />
        <UpcomingTelemedicineCard sessions={data.upcomingTelemedicine} />
      </div>

      {/* Row 4: Recent Claims + Financial Snapshot */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentClaimsCard claims={data.recentClaims} />
        <FinancialSnapshot summary={data.financialSummary} />
      </div>

      {/* Row 5: Quick Actions */}
      <QuickActions />
    </div>
  )
}
