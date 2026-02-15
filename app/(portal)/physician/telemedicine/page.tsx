import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPhysicianTelemedicineSessions } from '@/lib/actions/physician-clinical'
import { SessionList } from '@/components/physician/telemedicine/session-list'
import { elementId } from '@/lib/utils/element-ids'
import type { SessionStatus, SessionType } from '@/types/database'

interface PhysicianTelemedicinePageProps {
  searchParams: Promise<{
    status?: string
    session_type?: string
    date_from?: string
    date_to?: string
  }>
}

export default async function PhysicianTelemedicinePage({
  searchParams,
}: PhysicianTelemedicinePageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const resolvedParams = await searchParams

  const validStatuses: SessionStatus[] = [
    'scheduled', 'waiting_room', 'in_progress', 'completed', 'cancelled', 'no_show',
  ]
  const validTypes: SessionType[] = [
    'pre_op_consult', 'post_op_followup', 'general_consult', 'second_opinion', 'urgent_care',
  ]

  const filters: {
    status?: SessionStatus
    session_type?: SessionType
    date_from?: string
    date_to?: string
  } = {}

  if (
    resolvedParams.status &&
    validStatuses.includes(resolvedParams.status as SessionStatus)
  ) {
    filters.status = resolvedParams.status as SessionStatus
  }
  if (
    resolvedParams.session_type &&
    validTypes.includes(resolvedParams.session_type as SessionType)
  ) {
    filters.session_type = resolvedParams.session_type as SessionType
  }
  if (resolvedParams.date_from) {
    filters.date_from = resolvedParams.date_from
  }
  if (resolvedParams.date_to) {
    filters.date_to = resolvedParams.date_to
  }

  const hasFilters = Object.keys(filters).length > 0
  const result = await getPhysicianTelemedicineSessions(hasFilters ? filters : undefined)

  if (!result.success) {
    return (
      <div id={elementId('physician-telemedicine', 'error')} className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Unable to load telemedicine sessions
        </h2>
        <p className="text-gray-500">{result.error}</p>
      </div>
    )
  }

  const sessions = result.data

  return (
    <div id={elementId('physician-telemedicine', 'page', 'container')}>
      {/* Page Header */}
      <div id={elementId('physician-telemedicine', 'header')} className="mb-8">
        <h1
          id={elementId('physician-telemedicine', 'title')}
          className="text-3xl font-bold text-gray-900"
        >
          Telemedicine Sessions
        </h1>
        <p
          id={elementId('physician-telemedicine', 'subtitle')}
          className="text-gray-600 mt-1"
        >
          Manage virtual consultations with your patients
        </p>
      </div>

      {/* Session List with Filters */}
      <SessionList
        sessions={sessions}
        totalCount={sessions.length}
      />
    </div>
  )
}
