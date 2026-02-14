import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getPatientAppointments } from '@/lib/actions/appointments'
import { Button } from '@/components/ui/button'
import { elementId } from '@/lib/utils/element-ids'
import { AppointmentsTabs } from '@/components/patient/appointments/appointments-tabs'

export default async function AppointmentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch both upcoming and past appointments in parallel
  const [upcomingResult, pastResult] = await Promise.all([
    getPatientAppointments(user.id, 'upcoming'),
    getPatientAppointments(user.id, 'past'),
  ])

  if (!upcomingResult.success || !pastResult.success) {
    return (
      <div id={elementId('appointments', 'error')} className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Unable to load appointments
        </h2>
        <p className="text-gray-500">
          {(!upcomingResult.success && upcomingResult.error) ||
           (!pastResult.success && pastResult.error) ||
           'An error occurred. Please try again.'}
        </p>
      </div>
    )
  }

  return (
    <div id={elementId('appointments', 'page', 'container')}>
      {/* Page Header */}
      <div id={elementId('appointments', 'header')} className="mb-8 flex items-start justify-between">
        <div>
          <h1
            id={elementId('appointments', 'title')}
            className="text-3xl font-bold text-gray-900"
          >
            Appointments
          </h1>
          <p
            id={elementId('appointments', 'subtitle')}
            className="text-gray-600 mt-1"
          >
            Manage your upcoming and past appointments
          </p>
        </div>
        <Link href="/patient/appointments/book">
          <Button>
            Book Appointment
          </Button>
        </Link>
      </div>

      {/* Tabs with appointment lists */}
      <AppointmentsTabs
        upcoming={upcomingResult.data}
        past={pastResult.data}
      />
    </div>
  )
}
