import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getTodaysAppointments } from '@/lib/actions/staff'
import { CheckInList } from '@/components/staff/check-in/check-in-list'

// ============================================
// Staff Check-In Page (Server)
// ============================================

export default async function StaffCheckInPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const appointmentsResult = await getTodaysAppointments()
  const appointments = appointmentsResult.success ? appointmentsResult.data : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Patient Check-In
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Verify patient identity, confirm insurance, and check in patients for
          today&apos;s appointments.
        </p>
      </div>

      {/* Check-In List */}
      <CheckInList initialData={appointments} />
    </div>
  )
}
