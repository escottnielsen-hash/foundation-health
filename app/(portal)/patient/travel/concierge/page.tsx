import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPatientConciergeRequests } from '@/lib/actions/concierge'
import { ConciergeForm } from '@/components/travel/concierge-form'
import { Button } from '@/components/ui/button'
import { elementId } from '@/lib/utils/element-ids'
import { ArrowLeft, ConciergeBell } from 'lucide-react'

// ============================================
// Metadata
// ============================================

export const metadata = {
  title: 'Concierge Services | Foundation Health',
  description:
    'Request personalized concierge assistance for your Foundation Health visit. Accommodations, transportation, dining, and more.',
}

// ============================================
// Page Component
// ============================================

export default async function ConciergePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const requestsResult = await getPatientConciergeRequests(user.id)
  const existingRequests = requestsResult.success ? requestsResult.data : []

  return (
    <div id={elementId('travel', 'concierge')} className="space-y-8">
      {/* Back navigation */}
      <div>
        <Button asChild variant="ghost" size="sm" className="text-gray-500">
          <Link href="/patient/travel">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to Travel Planning
          </Link>
        </Button>
      </div>

      {/* Page header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50">
            <ConciergeBell className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-gray-900">
              Concierge Services
            </h1>
            <p className="text-sm text-gray-500">
              Your personal travel and experience coordinator
            </p>
          </div>
        </div>
        <p className="mt-4 max-w-2xl leading-relaxed text-gray-600">
          At Foundation Health, we believe that exceptional care extends far
          beyond the clinic. Our dedicated concierge team is here to handle
          every aspect of your visit, so you can focus entirely on your health
          and recovery.
        </p>
      </div>

      {/* Service highlights */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            title: 'Accommodations',
            description: 'Luxury lodging at our partner properties',
          },
          {
            title: 'Transportation',
            description: 'Airport transfers and daily car service',
          },
          {
            title: 'Dining & Activities',
            description: 'Reservations and recovery-friendly experiences',
          },
        ].map((service) => (
          <div
            key={service.title}
            className="rounded-lg border border-amber-100 bg-amber-50/30 p-4"
          >
            <p className="font-medium text-gray-900">{service.title}</p>
            <p className="mt-0.5 text-sm text-gray-500">
              {service.description}
            </p>
          </div>
        ))}
      </div>

      {/* Concierge form */}
      <ConciergeForm userId={user.id} existingRequests={existingRequests} />
    </div>
  )
}
