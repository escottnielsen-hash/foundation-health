import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { elementId } from '@/lib/utils/element-ids'
import { BookingFlow } from '@/components/patient/appointments/booking-flow'

export default async function BookAppointmentPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div id={elementId('booking', 'page', 'container')}>
      {/* Back Navigation */}
      <div id={elementId('booking', 'back')} className="mb-6">
        <Link href="/patient/appointments">
          <Button variant="ghost" size="sm" className="gap-2 text-gray-600">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Appointments
          </Button>
        </Link>
      </div>

      {/* Page Header */}
      <div id={elementId('booking', 'header')} className="mb-8">
        <h1
          id={elementId('booking', 'title')}
          className="text-3xl font-bold text-gray-900"
        >
          Book an Appointment
        </h1>
        <p
          id={elementId('booking', 'subtitle')}
          className="text-gray-600 mt-1"
        >
          Follow the steps below to schedule your visit
        </p>
      </div>

      {/* Booking Flow (Client Component) */}
      <BookingFlow userId={user.id} />
    </div>
  )
}
