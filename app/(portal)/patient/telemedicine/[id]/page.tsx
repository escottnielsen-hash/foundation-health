import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getSessionDetail } from '@/lib/actions/telemedicine'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { PreparationChecklist } from '@/components/patient/telemedicine/preparation-checklist'
import { SessionDetailChat } from './session-detail-chat'
import { elementId, btnId } from '@/lib/utils/element-ids'
import {
  Video,
  ArrowLeft,
  Calendar,
  Clock,
  User,
  MapPin,
  FileText,
  Pill,
  ClipboardList,
  Stethoscope,
} from 'lucide-react'
import { format } from 'date-fns'
import type { SessionType, SessionStatus } from '@/types/database'

// ============================================
// Config
// ============================================

const SESSION_TYPE_LABELS: Record<SessionType, string> = {
  pre_op_consult: 'Pre-Op Consultation',
  post_op_followup: 'Post-Op Follow-Up',
  general_consult: 'General Consultation',
  second_opinion: 'Second Opinion',
  urgent_care: 'Urgent Care',
}

const SESSION_STATUS_CONFIG: Record<
  SessionStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' }
> = {
  scheduled: { label: 'Scheduled', variant: 'outline' },
  waiting_room: { label: 'In Waiting Room', variant: 'warning' },
  in_progress: { label: 'In Progress', variant: 'success' },
  completed: { label: 'Completed', variant: 'secondary' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
  no_show: { label: 'No Show', variant: 'destructive' },
}

// ============================================
// Page
// ============================================

interface SessionDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function SessionDetailPage({ params }: SessionDetailPageProps) {
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

  const statusConfig = SESSION_STATUS_CONFIG[session.status as SessionStatus] ?? {
    label: session.status,
    variant: 'outline' as const,
  }

  const isScheduled = session.status === 'scheduled' || session.status === 'waiting_room'
  const isCompleted = session.status === 'completed'
  const isInProgress = session.status === 'in_progress'

  // Check if session can be joined (within 5 min of start)
  const startTime = new Date(session.scheduled_start).getTime()
  const now = Date.now()
  const minutesUntilStart = (startTime - now) / (1000 * 60)
  const canJoin = isScheduled && minutesUntilStart <= 5 && minutesUntilStart > -session.scheduled_duration_minutes

  const formatDate = (dateStr: string): string => {
    try {
      return format(new Date(dateStr), 'EEEE, MMMM d, yyyy')
    } catch {
      return dateStr
    }
  }

  const formatTime = (dateStr: string): string => {
    try {
      return format(new Date(dateStr), 'h:mm a')
    } catch {
      return dateStr
    }
  }

  return (
    <div id={elementId('telemedicine', 'detail', 'container')}>
      {/* Back button */}
      <Link href="/patient/telemedicine">
        <Button variant="ghost" className="gap-2 text-gray-600 mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Sessions
        </Button>
      </Link>

      {/* Session Info Header */}
      <Card id={elementId('telemedicine', 'detail', 'header')} className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">
                  {SESSION_TYPE_LABELS[session.session_type as SessionType] ?? session.session_type}
                </h1>
                <Badge variant={statusConfig.variant} className="text-sm">
                  {statusConfig.label}
                </Badge>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>{formatDate(session.scheduled_start)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span>
                    {formatTime(session.scheduled_start)} ({session.scheduled_duration_minutes} min)
                  </span>
                </div>
                {physicianName && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span>Dr. {physicianName}</span>
                  </div>
                )}
                {session.patient_state && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{session.patient_state}</span>
                  </div>
                )}
              </div>

              {session.chief_complaint && (
                <div className="mt-4 rounded-lg bg-gray-50 p-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Chief Complaint
                  </p>
                  <p className="text-sm text-gray-700">{session.chief_complaint}</p>
                </div>
              )}
            </div>

            {/* Join button */}
            <div className="flex-shrink-0">
              {(canJoin || isInProgress) && (
                <Link href={`/patient/telemedicine/${id}/session`}>
                  <Button
                    id={btnId('join', 'session')}
                    size="lg"
                    className="gap-2 w-full sm:w-auto"
                  >
                    <Video className="h-5 w-5" />
                    {isInProgress ? 'Rejoin Session' : 'Join Session'}
                  </Button>
                </Link>
              )}
              {isScheduled && !canJoin && (
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-center">
                  <p className="text-xs font-semibold text-amber-700">
                    Join button activates 5 minutes before your session
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Preparation Checklist (for scheduled sessions) */}
          {isScheduled && <PreparationChecklist />}

          {/* Completed session: Clinical Notes */}
          {isCompleted && session.clinical_notes && (
            <Card id={elementId('telemedicine', 'detail', 'notes')}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary-600" />
                  <CardTitle className="text-lg">Clinical Notes</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {session.clinical_notes}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Completed session: Follow-Up Instructions */}
          {isCompleted && session.follow_up_instructions && (
            <Card id={elementId('telemedicine', 'detail', 'followup')}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5 text-primary-600" />
                  <CardTitle className="text-lg">Follow-Up Instructions</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {session.follow_up_instructions}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Completed session: Prescriptions */}
          {isCompleted &&
            session.prescriptions_issued &&
            session.prescriptions_issued.length > 0 && (
              <Card id={elementId('telemedicine', 'detail', 'prescriptions')}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Pill className="h-5 w-5 text-primary-600" />
                    <CardTitle className="text-lg">Prescriptions Issued</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {session.prescriptions_issued.map(
                      (prescription: string, index: number) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 rounded-lg bg-gray-50 p-3"
                        >
                          <Pill className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{prescription}</span>
                        </li>
                      )
                    )}
                  </ul>
                </CardContent>
              </Card>
            )}

          {/* Completed session but no notes */}
          {isCompleted &&
            !session.clinical_notes &&
            !session.follow_up_instructions &&
            (!session.prescriptions_issued ||
              session.prescriptions_issued.length === 0) && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Stethoscope className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-base font-semibold text-gray-900 mb-1">
                    Session Completed
                  </h3>
                  <p className="text-sm text-gray-500">
                    No clinical notes or follow-up instructions have been added yet. Your physician may update these shortly.
                  </p>
                </CardContent>
              </Card>
            )}
        </div>

        {/* Sidebar: Chat */}
        <div className="lg:col-span-1">
          <SessionDetailChat
            sessionId={id}
            messages={chatMessages}
            currentUserId={user.id}
            disabled={session.status === 'cancelled' || session.status === 'no_show'}
          />
        </div>
      </div>
    </div>
  )
}
