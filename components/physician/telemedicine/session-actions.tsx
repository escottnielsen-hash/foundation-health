'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { completeTelemedicineSession } from '@/lib/actions/physician-clinical'
import type { SessionStatus } from '@/types/database'
import {
  Video,
  CheckCircle,
  XCircle,
  Loader2,
  FileText,
} from 'lucide-react'

interface SessionActionsProps {
  sessionId: string
  status: SessionStatus
  roomUrl?: string | null
}

export function SessionActions({ sessionId, status, roomUrl }: SessionActionsProps) {
  const router = useRouter()
  const [completing, setCompleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isScheduled = status === 'scheduled'
  const isWaiting = status === 'waiting_room'
  const isInProgress = status === 'in_progress'
  const isCompleted = status === 'completed'
  const isCancelled = status === 'cancelled' || status === 'no_show'
  const canJoin = isScheduled || isWaiting || isInProgress
  const canComplete = isInProgress || isWaiting || isScheduled

  const handleComplete = async () => {
    if (!canComplete) return
    setCompleting(true)
    setError(null)

    const result = await completeTelemedicineSession(sessionId)

    if (result.success) {
      router.refresh()
    } else {
      setError(result.error)
    }

    setCompleting(false)
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {canJoin && (
          <Button
            className="gap-2"
            onClick={() => {
              if (roomUrl) {
                window.open(roomUrl, '_blank')
              }
            }}
            disabled={!roomUrl}
          >
            <Video className="h-4 w-4" />
            {isInProgress ? 'Rejoin Session' : 'Join Session'}
          </Button>
        )}

        {canComplete && !isCompleted && !isCancelled && (
          <Button
            variant="outline"
            onClick={handleComplete}
            disabled={completing}
            className="gap-2"
          >
            {completing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            Complete Session
          </Button>
        )}

        <Button
          variant="outline"
          className="gap-2"
          onClick={() => {
            // Scroll to notes editor
            const notesSection = document.querySelector('textarea')
            if (notesSection) {
              notesSection.focus()
              notesSection.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
          }}
        >
          <FileText className="h-4 w-4" />
          Add Notes
        </Button>

        {isCompleted && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Session Completed</span>
          </div>
        )}

        {isCancelled && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-700">
            <XCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Session {status === 'no_show' ? 'No Show' : 'Cancelled'}</span>
          </div>
        )}
      </div>
    </div>
  )
}
