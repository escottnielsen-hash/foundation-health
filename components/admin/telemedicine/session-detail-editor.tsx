'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'
import {
  updateSessionNotes,
  updateFollowUpInstructions,
  updateSessionStatus,
  cancelSession,
} from '@/lib/actions/admin/telemedicine'
import type {
  TelemedicineSessionWithDetails,
  SessionStatus as TelemedicineSessionStatus,
} from '@/lib/actions/admin/telemedicine'
import {
  Save,
  Loader2,
  Video,
  Phone,
  MessageSquare,
  User,
  Stethoscope,
  Calendar,
  Clock,
  Link as LinkIcon,
  FileText,
  AlertTriangle,
} from 'lucide-react'
import { elementId, formId, btnId } from '@/lib/utils/element-ids'

// ============================================
// Types
// ============================================

interface SessionDetailEditorProps {
  session: TelemedicineSessionWithDetails
}

// ============================================
// Helpers
// ============================================

function getStatusLabel(status: TelemedicineSessionStatus): string {
  const map: Record<TelemedicineSessionStatus, string> = {
    scheduled: 'Scheduled',
    waiting_room: 'Waiting Room',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
    no_show: 'No Show',
  }
  return map[status] ?? status
}

function getStatusBadgeVariant(
  status: TelemedicineSessionStatus
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
    case 'no_show':
      return 'destructive'
    default:
      return 'outline'
  }
}

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return '--'
  const date = new Date(dateStr)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function SessionTypeDisplay({ type }: { type: string }) {
  switch (type) {
    case 'video':
      return (
        <span className="flex items-center gap-1.5">
          <Video className="h-4 w-4 text-blue-500" /> Video
        </span>
      )
    case 'audio':
      return (
        <span className="flex items-center gap-1.5">
          <Phone className="h-4 w-4 text-emerald-500" /> Audio
        </span>
      )
    case 'chat':
      return (
        <span className="flex items-center gap-1.5">
          <MessageSquare className="h-4 w-4 text-violet-500" /> Chat
        </span>
      )
    default:
      return <span>{type}</span>
  }
}

// ============================================
// Available status transitions
// ============================================

function getAvailableTransitions(
  current: TelemedicineSessionStatus
): TelemedicineSessionStatus[] {
  switch (current) {
    case 'waiting_room':
      return ['scheduled', 'in_progress', 'cancelled']
    case 'scheduled':
      return ['waiting_room', 'in_progress', 'cancelled', 'no_show']
    case 'in_progress':
      return ['completed', 'cancelled']
    default:
      return []
  }
}

// ============================================
// SessionDetailEditor
// ============================================

export function SessionDetailEditor({ session }: SessionDetailEditorProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [clinicalNotes, setClinicalNotes] = useState(
    session.clinical_notes ?? ''
  )
  const [followUpInstructions, setFollowUpInstructions] = useState(
    session.follow_up_instructions ?? ''
  )
  const [cancelReason, setCancelReason] = useState('')
  const [showCancelForm, setShowCancelForm] = useState(false)

  const handleSaveNotes = () => {
    startTransition(async () => {
      const result = await updateSessionNotes(session.id, clinicalNotes)
      if (result.success) {
        toast({
          title: 'Notes Saved',
          description: 'Clinical notes have been updated.',
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

  const handleSaveFollowUp = () => {
    startTransition(async () => {
      const result = await updateFollowUpInstructions(
        session.id,
        followUpInstructions
      )
      if (result.success) {
        toast({
          title: 'Instructions Saved',
          description: 'Follow-up instructions have been updated.',
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

  const handleStatusChange = (newStatus: TelemedicineSessionStatus) => {
    if (newStatus === 'cancelled') {
      setShowCancelForm(true)
      return
    }

    startTransition(async () => {
      const result = await updateSessionStatus(session.id, newStatus)
      if (result.success) {
        toast({
          title: 'Status Updated',
          description: `Session status changed to ${getStatusLabel(newStatus)}.`,
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

  const handleConfirmCancel = () => {
    if (!cancelReason.trim()) {
      toast({
        title: 'Reason Required',
        description: 'Please provide a cancellation reason.',
        variant: 'destructive',
      })
      return
    }

    startTransition(async () => {
      const result = await cancelSession(session.id, cancelReason.trim())
      if (result.success) {
        toast({
          title: 'Session Cancelled',
          description: 'The session has been cancelled.',
          variant: 'success',
        })
        setShowCancelForm(false)
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

  const transitions = getAvailableTransitions(session.status)

  return (
    <div
      className="space-y-6"
      id={elementId('admin', 'telemedicine', 'session-editor')}
    >
      {/* Session Overview */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Session Overview</CardTitle>
            <Badge variant={getStatusBadgeVariant(session.status)}>
              {getStatusLabel(session.status)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-gray-500">Patient:</span>
                <span className="font-medium text-gray-900">
                  {session.patient_name ?? 'Unknown'}
                </span>
              </div>
              {session.patient_email && (
                <div className="pl-6 text-xs text-gray-400">
                  {session.patient_email}
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Stethoscope className="h-4 w-4 text-gray-400" />
                <span className="text-gray-500">Physician:</span>
                <span className="font-medium text-gray-900">
                  {session.physician_name ?? 'Unknown'}
                </span>
              </div>
              {session.physician_specialty && (
                <div className="pl-6 text-xs text-gray-400">
                  {session.physician_specialty}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-gray-400" />
                <span className="text-gray-500">Type:</span>
                <SessionTypeDisplay type={session.session_type} />
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-500">Scheduled:</span>
                <span className="text-gray-900">
                  {formatDateTime(session.scheduled_start)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-gray-500">Duration:</span>
                <span className="text-gray-900">
                  {session.scheduled_duration_minutes != null
                    ? `${session.scheduled_duration_minutes} min`
                    : '--'}
                </span>
              </div>
            </div>
          </div>

          {session.room_url && (
            <>
              <Separator className="my-4" />
              <div className="flex items-center gap-2 text-sm">
                <LinkIcon className="h-4 w-4 text-gray-400" />
                <span className="text-gray-500">Meeting URL:</span>
                <a
                  href={session.room_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-blue-600 hover:text-blue-700"
                >
                  Join Session
                </a>
              </div>
            </>
          )}

          {session.recording_url && (
            <div className="mt-2 flex items-center gap-2 text-sm">
              <Video className="h-4 w-4 text-gray-400" />
              <span className="text-gray-500">Recording:</span>
              <a
                href={session.recording_url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 hover:text-blue-700"
              >
                View Recording
              </a>
            </div>
          )}

          {session.actual_start && (
            <>
              <Separator className="my-4" />
              <div className="grid gap-2 sm:grid-cols-2 text-sm">
                <div>
                  <span className="text-gray-500">Actual Start: </span>
                  <span className="text-gray-900">
                    {formatDateTime(session.actual_start)}
                  </span>
                </div>
                {session.actual_end && (
                  <div>
                    <span className="text-gray-500">Actual End: </span>
                    <span className="text-gray-900">
                      {formatDateTime(session.actual_end)}
                    </span>
                  </div>
                )}
              </div>
            </>
          )}

          {session.status === 'cancelled' && session.clinical_notes && (
            <>
              <Separator className="my-4" />
              <div className="rounded-lg bg-red-50 p-3">
                <div className="flex items-center gap-2 text-sm font-medium text-red-800">
                  <AlertTriangle className="h-4 w-4" />
                  Cancellation Notes
                </div>
                <p className="mt-1 text-sm text-red-700">
                  {session.clinical_notes}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Status Controls */}
      {transitions.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Update Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {transitions.map((status) => (
                <Button
                  key={status}
                  variant={status === 'cancelled' ? 'destructive' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusChange(status)}
                  disabled={isPending}
                  id={btnId('status', status)}
                >
                  {isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {getStatusLabel(status)}
                </Button>
              ))}
            </div>

            {showCancelForm && (
              <div className="mt-4 space-y-3 rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-medium text-red-800">
                  Provide a reason for cancellation:
                </p>
                <Textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Enter cancellation reason..."
                  className="bg-white"
                />
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleConfirmCancel}
                    disabled={isPending}
                    id={btnId('confirm', 'cancel-session')}
                  >
                    {isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Confirm Cancel
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowCancelForm(false)
                      setCancelReason('')
                    }}
                    disabled={isPending}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Clinical Notes Editor */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Clinical Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            id={formId('clinical-notes')}
            onSubmit={(e) => {
              e.preventDefault()
              handleSaveNotes()
            }}
          >
            <Textarea
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              placeholder="Enter clinical notes for this session..."
              rows={6}
            />
            <div className="mt-3 flex justify-end">
              <Button
                type="submit"
                size="sm"
                disabled={isPending}
                id={btnId('save', 'clinical-notes')}
              >
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Notes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Follow-Up Instructions Editor */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Follow-Up Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            id={formId('follow-up-instructions')}
            onSubmit={(e) => {
              e.preventDefault()
              handleSaveFollowUp()
            }}
          >
            <Textarea
              value={followUpInstructions}
              onChange={(e) => setFollowUpInstructions(e.target.value)}
              placeholder="Enter follow-up instructions for the patient..."
              rows={4}
            />
            <div className="mt-3 flex justify-end">
              <Button
                type="submit"
                size="sm"
                disabled={isPending}
                id={btnId('save', 'follow-up')}
              >
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Instructions
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
