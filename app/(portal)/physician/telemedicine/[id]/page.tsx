import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getTelemedicineSessionForPhysician } from '@/lib/actions/physician-clinical'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SessionNotesEditor } from '@/components/physician/telemedicine/session-notes-editor'
import { SessionActions } from '@/components/physician/telemedicine/session-actions'
import { elementId } from '@/lib/utils/element-ids'
import { format } from 'date-fns'
import type { SessionType, SessionStatus } from '@/types/database'
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  MapPin,
  Pill,
  Stethoscope,
} from 'lucide-react'

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
  waiting_room: { label: 'Waiting Room', variant: 'warning' },
  in_progress: { label: 'In Progress', variant: 'success' },
  completed: { label: 'Completed', variant: 'secondary' },
  cancelled: { label: 'Cancelled', variant: 'destructive' },
  no_show: { label: 'No Show', variant: 'destructive' },
}

// ============================================
// Page
// ============================================

interface PhysicianSessionDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function PhysicianSessionDetailPage({
  params,
}: PhysicianSessionDetailPageProps) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const result = await getTelemedicineSessionForPhysician(id)

  if (!result.success) {
    notFound()
  }

  const session = result.data

  const patientName = [session.patient_first_name, session.patient_last_name]
    .filter(Boolean)
    .join(' ') || 'Unknown Patient'

  const typeLabel = SESSION_TYPE_LABELS[session.session_type as SessionType] ?? session.session_type
  const statusConfig = SESSION_STATUS_CONFIG[session.status as SessionStatus] ?? {
    label: session.status,
    variant: 'outline' as const,
  }

  const isCompleted = session.status === 'completed'
  const isCancelled = session.status === 'cancelled' || session.status === 'no_show'
  const isReadOnly = isCompleted || isCancelled

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

  const formatDateTime = (dateStr: string | null | undefined): string => {
    if (!dateStr) return 'N/A'
    try {
      return format(new Date(dateStr), 'MMM d, yyyy - h:mm a')
    } catch {
      return dateStr
    }
  }

  return (
    <div id={elementId('physician-session-detail', 'container')}>
      {/* Back button */}
      <Link href="/physician/telemedicine">
        <Button variant="ghost" className="gap-2 text-gray-600 mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Sessions
        </Button>
      </Link>

      {/* Session Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">{typeLabel}</h1>
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
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span>{patientName}</span>
                </div>
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
          </div>
        </CardContent>
      </Card>

      {/* Action Bar */}
      <div className="mb-6">
        <SessionActions
          sessionId={id}
          status={session.status as SessionStatus}
          roomUrl={session.room_url ?? null}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content (2/3) */}
        <div className="lg:col-span-2">
          {/* Clinical Notes Editor */}
          <SessionNotesEditor
            sessionId={id}
            initialClinicalNotes={session.clinical_notes ?? null}
            initialFollowUpInstructions={session.follow_up_instructions ?? null}
            readOnly={isReadOnly}
          />

          {/* Prescriptions Issued */}
          {session.prescriptions_issued && session.prescriptions_issued.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Pill className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Prescriptions Issued</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {session.prescriptions_issued.map((rx: string, idx: number) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 rounded-lg bg-gray-50 p-3"
                    >
                      <Pill className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{rx}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar (1/3) */}
        <div className="space-y-6">
          {/* Patient Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <User className="h-6 w-6 text-gray-400" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{patientName}</p>
                </div>
              </div>

              <Separator />

              {session.patient_email && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>{session.patient_email}</span>
                </div>
              )}

              {session.patient_phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{session.patient_phone}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Session Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Session Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <SessionField label="Session Type" value={typeLabel} />
              <SessionField label="Status" value={statusConfig.label} />
              <SessionField label="Duration" value={`${session.scheduled_duration_minutes} minutes`} />
              {session.actual_start && (
                <SessionField label="Started At" value={formatDateTime(session.actual_start)} />
              )}
              {session.actual_end && (
                <SessionField label="Ended At" value={formatDateTime(session.actual_end)} />
              )}
              <SessionField
                label="Consent"
                value={session.patient_consent_given ? 'Given' : 'Pending'}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// ============================================
// Helper components
// ============================================

function SessionField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-0.5">
        {label}
      </p>
      <p className="text-sm text-gray-900">{value}</p>
    </div>
  )
}
