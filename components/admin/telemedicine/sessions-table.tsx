'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import {
  approveSession,
  cancelSession,
} from '@/lib/actions/admin/telemedicine'
import type {
  TelemedicineSessionWithDetails,
  SessionStatus,
  SessionType,
} from '@/lib/actions/admin/telemedicine'
import {
  Eye,
  CheckCircle,
  XCircle,
  Loader2,
  Video,
  Stethoscope,
  HeartPulse,
  ClipboardList,
  MessageCircle,
  Siren,
} from 'lucide-react'
import { elementId } from '@/lib/utils/element-ids'

// ============================================
// Types
// ============================================

interface SessionsTableProps {
  sessions: TelemedicineSessionWithDetails[]
  showActions?: boolean
}

// ============================================
// Status badge helpers
// ============================================

function getStatusBadgeVariant(
  status: SessionStatus
): 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive' {
  switch (status) {
    case 'completed':
      return 'success'
    case 'in_progress':
      return 'default'
    case 'scheduled':
      return 'secondary'
    case 'waiting_room':
      return 'warning'
    case 'cancelled':
      return 'destructive'
    case 'no_show':
      return 'destructive'
    default:
      return 'outline'
  }
}

function getStatusLabel(status: SessionStatus): string {
  const map: Record<SessionStatus, string> = {
    scheduled: 'Scheduled',
    waiting_room: 'Waiting Room',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
    no_show: 'No Show',
  }
  return map[status] ?? status
}

// ============================================
// Session type icon
// ============================================

function SessionTypeIcon({ type }: { type: SessionType }) {
  switch (type) {
    case 'pre_op_consult':
      return <Stethoscope className="h-4 w-4 text-blue-500" />
    case 'post_op_followup':
      return <HeartPulse className="h-4 w-4 text-emerald-500" />
    case 'general_consult':
      return <ClipboardList className="h-4 w-4 text-violet-500" />
    case 'second_opinion':
      return <MessageCircle className="h-4 w-4 text-amber-500" />
    case 'urgent_care':
      return <Siren className="h-4 w-4 text-red-500" />
    default:
      return <Video className="h-4 w-4 text-gray-400" />
  }
}

function getSessionTypeLabel(type: SessionType): string {
  const map: Record<SessionType, string> = {
    pre_op_consult: 'Pre-Op Consult',
    post_op_followup: 'Post-Op Follow-up',
    general_consult: 'General Consult',
    second_opinion: 'Second Opinion',
    urgent_care: 'Urgent Care',
  }
  return map[type] ?? type
}

// ============================================
// Date formatting
// ============================================

function formatSessionDate(dateStr: string | null): string {
  if (!dateStr) return '--'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatSessionTime(dateStr: string | null): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

// ============================================
// SessionsTable Component
// ============================================

export function SessionsTable({
  sessions,
  showActions = true,
}: SessionsTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  const handleApprove = (sessionId: string) => {
    startTransition(async () => {
      const result = await approveSession(sessionId)
      if (result.success) {
        toast({
          title: 'Session Approved',
          description: 'The session has been approved and started.',
          variant: 'success',
        })
        router.refresh()
      } else {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
      }
    })
  }

  const handleCancel = (sessionId: string) => {
    startTransition(async () => {
      const result = await cancelSession(sessionId, 'Cancelled by admin')
      if (result.success) {
        toast({
          title: 'Session Cancelled',
          description: 'The session has been cancelled.',
          variant: 'success',
        })
        router.refresh()
      } else {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
      }
    })
  }

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 py-12 text-center">
        <Video className="mx-auto h-8 w-8 text-gray-400" />
        <p className="mt-2 text-sm text-gray-500">No sessions found.</p>
        <p className="mt-1 text-xs text-gray-400">
          Telemedicine sessions will appear here once created.
        </p>
      </div>
    )
  }

  return (
    <div
      className="rounded-lg border border-gray-200 bg-white"
      id={elementId('admin', 'telemedicine', 'sessions-table')}
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Patient</TableHead>
            <TableHead>Physician</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Date / Time</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Status</TableHead>
            {showActions && (
              <TableHead className="text-right">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((session) => (
            <TableRow key={session.id}>
              <TableCell>
                <div>
                  <p className="font-medium text-gray-900">
                    {session.patient_name ?? 'Unknown Patient'}
                  </p>
                  {session.patient_email && (
                    <p className="text-xs text-gray-400">
                      {session.patient_email}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium text-gray-900">
                    {session.physician_name ?? 'Unknown Physician'}
                  </p>
                  {session.physician_specialty && (
                    <p className="text-xs text-gray-400">
                      {session.physician_specialty}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5">
                  <SessionTypeIcon type={session.session_type} />
                  <span className="text-sm text-gray-600">
                    {getSessionTypeLabel(session.session_type)}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div>
                  <p className="text-sm text-gray-900">
                    {formatSessionDate(session.scheduled_start)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatSessionTime(session.scheduled_start)}
                  </p>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm text-gray-600">
                  {session.scheduled_duration_minutes != null
                    ? `${session.scheduled_duration_minutes} min`
                    : '--'}
                </span>
              </TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(session.status)}>
                  {getStatusLabel(session.status)}
                </Badge>
              </TableCell>
              {showActions && (
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/admin/telemedicine/sessions/${session.id}`}>
                      <Button variant="ghost" size="icon" title="View details">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    {session.status === 'waiting_room' && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Approve session"
                          onClick={() => handleApprove(session.id)}
                          disabled={isPending}
                        >
                          {isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-emerald-600" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Cancel session"
                          onClick={() => handleCancel(session.id)}
                          disabled={isPending}
                        >
                          {isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
