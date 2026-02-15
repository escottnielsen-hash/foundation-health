import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getPatientSessions } from '@/lib/actions/telemedicine'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SessionCard } from '@/components/patient/telemedicine/session-card'
import { SessionFilter } from '@/components/patient/telemedicine/session-filter'
import { elementId, btnId } from '@/lib/utils/element-ids'
import { Video, Plus } from 'lucide-react'
import type { SessionType, SessionStatus } from '@/types/database'

interface TelemedicinePageProps {
  searchParams: Promise<{ type?: string; status?: string }>
}

export default async function TelemedicinePage({ searchParams }: TelemedicinePageProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const resolvedParams = await searchParams

  const validStatuses = ['scheduled', 'waiting_room', 'in_progress', 'completed', 'cancelled', 'no_show'] as const
  const validTypes = ['pre_op_consult', 'post_op_followup', 'general_consult', 'second_opinion', 'urgent_care'] as const

  type ValidStatus = (typeof validStatuses)[number]
  type ValidType = (typeof validTypes)[number]

  const filters: { session_type?: ValidType; status?: ValidStatus; date_from?: string; date_to?: string } = {}
  if (resolvedParams.type && (validTypes as readonly string[]).includes(resolvedParams.type)) {
    filters.session_type = resolvedParams.type as ValidType
  }
  if (resolvedParams.status && (validStatuses as readonly string[]).includes(resolvedParams.status)) {
    filters.status = resolvedParams.status as ValidStatus
  }

  const result = await getPatientSessions(filters)

  if (!result.success) {
    return (
      <div id={elementId('telemedicine', 'error')} className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Unable to load telemedicine sessions
        </h2>
        <p className="text-gray-500">{result.error}</p>
      </div>
    )
  }

  const sessions = result.data

  // Separate upcoming and past sessions
  const now = new Date()
  const upcomingSessions = sessions.filter((s) => {
    const start = new Date(s.scheduled_start)
    return (
      start >= now &&
      (s.status === 'scheduled' || s.status === 'waiting_room')
    )
  })
  const activeSessions = sessions.filter(
    (s) => s.status === 'in_progress'
  )
  const pastSessions = sessions.filter((s) => {
    const start = new Date(s.scheduled_start)
    return (
      start < now ||
      s.status === 'completed' ||
      s.status === 'cancelled' ||
      s.status === 'no_show'
    )
  })

  return (
    <div id={elementId('telemedicine', 'page', 'container')}>
      {/* Page Header */}
      <div
        id={elementId('telemedicine', 'header')}
        className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1
            id={elementId('telemedicine', 'title')}
            className="text-3xl font-bold text-gray-900"
          >
            Telemedicine
          </h1>
          <p
            id={elementId('telemedicine', 'subtitle')}
            className="text-gray-600 mt-1"
          >
            Virtual visits with your care team, from anywhere
          </p>
        </div>
        <Link href="/patient/telemedicine/request">
          <Button id={btnId('request', 'session')} className="gap-2">
            <Plus className="h-4 w-4" />
            Request Session
          </Button>
        </Link>
      </div>

      {/* Filter Bar */}
      <div
        id={elementId('telemedicine', 'toolbar')}
        className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <SessionFilter />
        <p className="text-sm text-gray-500">
          {sessions.length} {sessions.length === 1 ? 'session' : 'sessions'} found
        </p>
      </div>

      {/* Active Sessions */}
      {activeSessions.length > 0 && (
        <div id={elementId('telemedicine', 'active')} className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Active Sessions
          </h2>
          <div className="space-y-3">
            {activeSessions.map((session) => (
              <SessionCard
                key={session.id}
                id={session.id}
                sessionType={session.session_type as SessionType}
                status={session.status as SessionStatus}
                scheduledStart={session.scheduled_start}
                scheduledDurationMinutes={session.scheduled_duration_minutes}
                physicianName={[session.physician_first_name, session.physician_last_name].filter(Boolean).join(' ') || null}
                chiefComplaint={session.chief_complaint ?? null}
              />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Sessions */}
      {upcomingSessions.length > 0 && (
        <div id={elementId('telemedicine', 'upcoming')} className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Upcoming Sessions
          </h2>
          <div className="space-y-3">
            {upcomingSessions.map((session) => (
              <SessionCard
                key={session.id}
                id={session.id}
                sessionType={session.session_type as SessionType}
                status={session.status as SessionStatus}
                scheduledStart={session.scheduled_start}
                scheduledDurationMinutes={session.scheduled_duration_minutes}
                physicianName={[session.physician_first_name, session.physician_last_name].filter(Boolean).join(' ') || null}
                chiefComplaint={session.chief_complaint ?? null}
              />
            ))}
          </div>
        </div>
      )}

      {/* Past Sessions */}
      {pastSessions.length > 0 && (
        <div id={elementId('telemedicine', 'past')} className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Past Sessions
          </h2>
          <div className="space-y-3">
            {pastSessions.map((session) => (
              <SessionCard
                key={session.id}
                id={session.id}
                sessionType={session.session_type as SessionType}
                status={session.status as SessionStatus}
                scheduledStart={session.scheduled_start}
                scheduledDurationMinutes={session.scheduled_duration_minutes}
                physicianName={[session.physician_first_name, session.physician_last_name].filter(Boolean).join(' ') || null}
                chiefComplaint={session.chief_complaint ?? null}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {sessions.length === 0 && (
        <Card id={elementId('telemedicine', 'empty')}>
          <CardContent className="py-16 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center mb-4">
              <Video className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No telemedicine sessions
            </h3>
            <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
              {resolvedParams.type || resolvedParams.status
                ? 'No sessions match the selected filters. Try adjusting your search.'
                : 'Schedule a virtual visit with your care team. Pre-op consultations, post-op follow-ups, and more are available from anywhere.'}
            </p>
            {!resolvedParams.type && !resolvedParams.status && (
              <Link href="/patient/telemedicine/request">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Request Your First Session
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
