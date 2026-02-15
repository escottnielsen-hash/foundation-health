import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPhysicianSchedule } from '@/lib/actions/physician'
import { ScheduleView } from '@/components/physician/schedule/schedule-view'
import { ScheduleFilter } from '@/components/physician/schedule/schedule-filter'

// ============================================
// Physician Schedule Page (Server Component)
// ============================================

export default async function PhysicianSchedulePage(props: {
  searchParams: Promise<{
    date_from?: string
    date_to?: string
    type?: string
    location_id?: string
  }>
}) {
  const searchParams = await props.searchParams

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

  // Default: show current week (Monday to Sunday)
  const now = new Date()
  const dayOfWeek = now.getDay()
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek

  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() + diffToMonday)
  weekStart.setHours(0, 0, 0, 0)

  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)
  weekEnd.setHours(23, 59, 59, 999)

  const dateFrom = searchParams.date_from || weekStart.toISOString().split('T')[0]
  const dateTo = searchParams.date_to || weekEnd.toISOString().split('T')[0]
  const appointmentType = searchParams.type || undefined
  const locationId = searchParams.location_id || undefined

  // Convert date strings to ISO for Supabase query
  const dateFromIso = new Date(`${dateFrom}T00:00:00`).toISOString()
  const dateToIso = new Date(`${dateTo}T23:59:59`).toISOString()

  const appointments = await getPhysicianSchedule(
    physicianProfile.id,
    dateFromIso,
    dateToIso,
    appointmentType,
    locationId
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Schedule</h2>
        <p className="mt-1 text-sm text-slate-500">
          Manage your appointments and availability
        </p>
      </div>

      {/* Filters */}
      <ScheduleFilter />

      {/* Schedule View */}
      <ScheduleView
        appointments={appointments}
        dateFrom={dateFrom}
        dateTo={dateTo}
      />
    </div>
  )
}
