import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSessionDetail } from '@/lib/actions/telemedicine'
import { elementId } from '@/lib/utils/element-ids'
import { ActiveSessionView } from './active-session-view'
import type { SessionStatus } from '@/types/database'

interface SessionRoomPageProps {
  params: Promise<{ id: string }>
}

export default async function SessionRoomPage({ params }: SessionRoomPageProps) {
  const { id } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const result = await getSessionDetail(id)

  if (!result.success) {
    notFound()
  }

  const session = result.data

  // Only allow access to scheduled/waiting_room/in_progress sessions
  const allowedStatuses: SessionStatus[] = ['scheduled', 'waiting_room', 'in_progress']
  if (!allowedStatuses.includes(session.status as SessionStatus)) {
    redirect(`/patient/telemedicine/${id}`)
  }

  // Construct physician name from first/last
  const physicianName = [session.physician_first_name, session.physician_last_name]
    .filter(Boolean)
    .join(' ') || null

  // Map messages from the detail response to the chat format
  const chatMessages = session.messages.map((msg) => ({
    id: msg.id,
    sender_id: msg.sender_id,
    sender_name: [msg.sender_first_name, msg.sender_last_name].filter(Boolean).join(' ') || 'Unknown',
    message_type: msg.message_type,
    content: msg.content,
    is_read: msg.is_read,
    created_at: msg.created_at,
  }))

  return (
    <div
      id={elementId('telemedicine', 'session-room', 'container')}
      className="-m-6 lg:-m-8"
    >
      <ActiveSessionView
        sessionId={id}
        session={{
          id: session.id,
          session_type: session.session_type,
          status: session.status,
          scheduled_start: session.scheduled_start,
          scheduled_duration_minutes: session.scheduled_duration_minutes,
          actual_start: session.actual_start ?? null,
          physician_name: physicianName,
          physician_specialty: null,
          chief_complaint: session.chief_complaint ?? null,
          patient_state: session.patient_state ?? null,
          clinical_notes: session.clinical_notes ?? null,
          follow_up_instructions: session.follow_up_instructions ?? null,
          prescriptions_issued: (session as unknown as Record<string, unknown>).prescriptions_issued as string[] | null ?? null,
        }}
        messages={chatMessages}
        currentUserId={user.id}
      />
    </div>
  )
}
