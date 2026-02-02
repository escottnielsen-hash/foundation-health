import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { elementId } from '@/lib/utils/element-ids'
import Link from 'next/link'

async function getUserProfile(userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return data
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const profile = await getUserProfile(user.id)
  const role = profile?.role || 'patient'
  const firstName = profile?.first_name || 'there'

  return (
    <div id={elementId('dashboard', 'page', 'container')}>
      {/* Header */}
      <div id={elementId('dashboard', 'header')} className="mb-8">
        <h1 id={elementId('dashboard', 'title')} className="text-3xl font-bold text-gray-900">
          Welcome back, {firstName}
        </h1>
        <p id={elementId('dashboard', 'subtitle')} className="text-gray-600 mt-1">
          Here&apos;s an overview of your {role === 'physician' ? 'practice' : 'health'} today
        </p>
      </div>

      {/* Quick Actions */}
      <div id={elementId('dashboard', 'quick-actions')} className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {role === 'patient' && (
            <>
              <QuickActionCard
                id="action-book-appointment"
                title="Book Appointment"
                href="/patient/appointments"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                }
              />
              <QuickActionCard
                id="action-view-records"
                title="Health Records"
                href="/patient/health/records"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
              />
              <QuickActionCard
                id="action-wellness"
                title="Wellness Plans"
                href="/patient/wellness"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                }
              />
              <QuickActionCard
                id="action-wearables"
                title="Sync Wearables"
                href="/patient/health/wearables"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
            </>
          )}
          {role === 'physician' && (
            <>
              <QuickActionCard
                id="action-patients"
                title="My Patients"
                href="/physician/patients"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                }
              />
              <QuickActionCard
                id="action-schedule"
                title="Today&apos;s Schedule"
                href="/physician/appointments"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                }
              />
              <QuickActionCard
                id="action-cme"
                title="CME Courses"
                href="/physician/cme"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                }
              />
              <QuickActionCard
                id="action-protocols"
                title="Protocols"
                href="/physician/protocols"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                }
              />
            </>
          )}
          {role === 'admin' && (
            <>
              <QuickActionCard
                id="action-users"
                title="Manage Users"
                href="/admin/users"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                }
              />
              <QuickActionCard
                id="action-practices"
                title="Practices"
                href="/admin/practices"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                }
              />
              <QuickActionCard
                id="action-reports"
                title="Reports"
                href="/admin/reports"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                }
              />
              <QuickActionCard
                id="action-settings"
                title="Settings"
                href="/admin/settings"
                icon={
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                }
              />
            </>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div id={elementId('dashboard', 'stats-grid')} className="grid md:grid-cols-4 gap-6 mb-8">
        {role === 'patient' && (
          <>
            <StatCard id="stat-appointments" title="Upcoming Appointments" value="2" change="+1 this week" />
            <StatCard id="stat-records" title="Health Records" value="15" change="+3 this month" />
            <StatCard id="stat-steps" title="Avg. Daily Steps" value="8,432" change="+12%" positive />
            <StatCard id="stat-sleep" title="Avg. Sleep" value="7.2h" change="-0.3h" />
          </>
        )}
        {role === 'physician' && (
          <>
            <StatCard id="stat-patients-today" title="Patients Today" value="12" change="3 remaining" />
            <StatCard id="stat-total-patients" title="Total Patients" value="156" change="+8 this month" positive />
            <StatCard id="stat-cme-credits" title="CME Credits" value="32/50" change="18 remaining" />
            <StatCard id="stat-referrals" title="Referrals" value="24" change="+5 this month" positive />
          </>
        )}
        {role === 'admin' && (
          <>
            <StatCard id="stat-total-users" title="Total Users" value="1,234" change="+56 this month" positive />
            <StatCard id="stat-active-physicians" title="Active Physicians" value="89" change="+3 pending" />
            <StatCard id="stat-practices" title="Practices" value="45" change="+2 this month" positive />
            <StatCard id="stat-revenue" title="Monthly Revenue" value="$45.2K" change="+12%" positive />
          </>
        )}
      </div>

      {/* Recent Activity */}
      <Card id={elementId('dashboard', 'recent-activity', 'card')}>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest updates and notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div id={elementId('dashboard', 'activity-list')} className="space-y-4">
            <ActivityItem
              id="activity-1"
              title="Welcome to Foundation Health!"
              description="Complete your profile to get personalized recommendations."
              time="Just now"
              icon={
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              }
            />
            <ActivityItem
              id="activity-2"
              title="Complete your profile"
              description="Add your health information for a better experience."
              time="Setup required"
              icon={
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              }
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper Components

function QuickActionCard({ id, title, href, icon }: { id: string; title: string; href: string; icon: React.ReactNode }) {
  return (
    <Link href={href}>
      <Card id={id} className="hover:border-primary-200 hover:shadow-md transition-all cursor-pointer">
        <CardContent className="p-4 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mb-3 text-primary-600">
            {icon}
          </div>
          <span className="text-sm font-medium text-gray-700">{title}</span>
        </CardContent>
      </Card>
    </Link>
  )
}

function StatCard({ id, title, value, change, positive }: { id: string; title: string; value: string; change: string; positive?: boolean }) {
  return (
    <Card id={id}>
      <CardContent className="p-6">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        <p className={`text-sm mt-1 ${positive ? 'text-green-600' : 'text-gray-500'}`}>
          {change}
        </p>
      </CardContent>
    </Card>
  )
}

function ActivityItem({ id, title, description, time, icon }: { id: string; title: string; description: string; time: string; icon: React.ReactNode }) {
  return (
    <div id={id} className="flex items-start gap-4">
      {icon}
      <div className="flex-1">
        <p className="font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <span className="text-xs text-gray-400">{time}</span>
    </div>
  )
}
