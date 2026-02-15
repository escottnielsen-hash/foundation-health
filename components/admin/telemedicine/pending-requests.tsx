'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import {
  approveSession,
  cancelSession,
} from '@/lib/actions/admin/telemedicine'
import type { TelemedicineSessionWithDetails } from '@/lib/actions/admin/telemedicine'
import {
  CheckCircle,
  XCircle,
  Loader2,
  Video,
  Phone,
  MessageSquare,
  Clock,
  User,
  Stethoscope,
} from 'lucide-react'
import { elementId, btnId } from '@/lib/utils/element-ids'

// ============================================
// Types
// ============================================

interface PendingRequestsProps {
  sessions: TelemedicineSessionWithDetails[]
}

// ============================================
// Helpers
// ============================================

function SessionTypeIcon({ type }: { type: string }) {
  switch (type) {
    case 'video':
      return <Video className="h-4 w-4 text-blue-500" />
    case 'audio':
      return <Phone className="h-4 w-4 text-emerald-500" />
    case 'chat':
      return <MessageSquare className="h-4 w-4 text-violet-500" />
    default:
      return <Video className="h-4 w-4 text-gray-400" />
  }
}

function formatRelativeTime(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

function formatScheduledDate(dateStr: string | null): string {
  if (!dateStr) return 'Not scheduled'
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

// ============================================
// PendingRequests Component
// ============================================

export function PendingRequests({ sessions }: PendingRequestsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  const handleApprove = (sessionId: string, patientName: string | null) => {
    startTransition(async () => {
      const result = await approveSession(sessionId)
      if (result.success) {
        toast({
          title: 'Session Approved',
          description: `Session for ${patientName ?? 'patient'} has been approved.`,
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

  const handleDeny = (sessionId: string, patientName: string | null) => {
    startTransition(async () => {
      const result = await cancelSession(
        sessionId,
        'Request denied by admin'
      )
      if (result.success) {
        toast({
          title: 'Request Denied',
          description: `Session request from ${patientName ?? 'patient'} has been denied.`,
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

  return (
    <Card id={elementId('admin', 'telemedicine', 'pending-requests')}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Pending Requests</CardTitle>
          {sessions.length > 0 && (
            <Badge variant="warning">{sessions.length}</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle className="mx-auto h-8 w-8 text-emerald-400" />
            <p className="mt-2 text-sm text-gray-500">
              No pending requests at this time.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="rounded-lg border border-gray-100 p-4 transition-all hover:border-gray-200 hover:bg-gray-50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <SessionTypeIcon type={session.session_type} />
                      <span className="text-sm font-medium capitalize text-gray-700">
                        {session.session_type}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatRelativeTime(session.created_at)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-gray-600">
                        {session.patient_name ?? 'Unknown Patient'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Stethoscope className="h-3.5 w-3.5 text-gray-400" />
                      <span className="text-gray-600">
                        {session.physician_name ?? 'Unassigned'}
                      </span>
                    </div>

                    {session.scheduled_start && (
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Clock className="h-3.5 w-3.5" />
                        {formatScheduledDate(session.scheduled_start)}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-shrink-0 flex-col gap-1.5">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() =>
                        handleApprove(session.id, session.patient_name)
                      }
                      disabled={isPending}
                      id={btnId('approve', session.id)}
                    >
                      {isPending ? (
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                      )}
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleDeny(session.id, session.patient_name)
                      }
                      disabled={isPending}
                      id={btnId('deny', session.id)}
                    >
                      {isPending ? (
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <XCircle className="mr-1.5 h-3.5 w-3.5" />
                      )}
                      Deny
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
