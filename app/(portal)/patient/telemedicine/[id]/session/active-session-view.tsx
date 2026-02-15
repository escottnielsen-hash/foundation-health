'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { VideoPlaceholder } from '@/components/patient/telemedicine/video-placeholder'
import { SessionChat, type ChatMessage } from '@/components/patient/telemedicine/session-chat'
import { SessionTimer } from '@/components/patient/telemedicine/session-timer'
import { elementId, btnId } from '@/lib/utils/element-ids'
import { cn } from '@/lib/utils/cn'
import {
  PhoneOff,
  User,
  Stethoscope,
  MapPin,
  Clock,
  AlertTriangle,
} from 'lucide-react'
import { sendSessionMessage, endTelemedicineSession } from '@/lib/actions/telemedicine'
import type { SessionStatus } from '@/types/database'

interface SessionData {
  id: string
  session_type: string
  status: string
  scheduled_start: string
  scheduled_duration_minutes: number
  actual_start: string | null
  physician_name: string | null
  physician_specialty: string | null
  chief_complaint: string | null
  patient_state: string | null
  clinical_notes: string | null
  follow_up_instructions: string | null
  prescriptions_issued: string[] | null
}

interface ActiveSessionViewProps {
  sessionId: string
  session: SessionData
  messages: ChatMessage[]
  currentUserId: string
}

const SESSION_TYPE_LABELS: Record<string, string> = {
  pre_op_consult: 'Pre-Op Consultation',
  post_op_followup: 'Post-Op Follow-Up',
  general_consult: 'General Consultation',
  second_opinion: 'Second Opinion',
  urgent_care: 'Urgent Care',
}

export function ActiveSessionView({
  sessionId,
  session,
  messages: initialMessages,
  currentUserId,
}: ActiveSessionViewProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showEndConfirm, setShowEndConfirm] = useState(false)
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>(initialMessages)

  const connectionState =
    session.status === 'in_progress'
      ? 'connected'
      : session.status === 'waiting_room'
        ? 'waiting'
        : 'connecting'

  const isActive = session.status === 'in_progress' || session.status === 'waiting_room'

  const handleSendMessage = (content: string) => {
    // Optimistic update
    const optimisticMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      sender_id: currentUserId,
      sender_name: 'You',
      message_type: 'text',
      content,
      is_read: false,
      created_at: new Date().toISOString(),
    }
    setLocalMessages((prev) => [...prev, optimisticMessage])

    startTransition(async () => {
      await sendSessionMessage(sessionId, content, 'text')
      router.refresh()
    })
  }

  const handleEndSession = () => {
    startTransition(async () => {
      await endTelemedicineSession(sessionId, currentUserId)
      router.push(`/patient/telemedicine/${sessionId}`)
      router.refresh()
    })
  }

  return (
    <div
      id={elementId('telemedicine', 'session-room', 'view')}
      className="flex flex-col lg:flex-row h-full min-h-[calc(100vh-4rem)]"
    >
      {/* Main video area */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-gray-900 text-white">
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className="border-white/30 text-white text-xs"
            >
              {SESSION_TYPE_LABELS[session.session_type] ?? session.session_type}
            </Badge>
            <SessionTimer
              startTime={session.actual_start ?? session.scheduled_start}
              isActive={isActive}
              className="bg-gray-800 border-gray-700 text-gray-200"
            />
          </div>

          <div className="flex items-center gap-2">
            {!showEndConfirm ? (
              <Button
                id={btnId('end', 'session')}
                variant="destructive"
                size="sm"
                onClick={() => setShowEndConfirm(true)}
                disabled={isPending}
                className="gap-2"
              >
                <PhoneOff className="h-4 w-4" />
                End Session
              </Button>
            ) : (
              <div className="flex items-center gap-2 bg-red-950/50 rounded-lg px-3 py-1.5">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <span className="text-xs text-red-300">End session?</span>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleEndSession}
                  disabled={isPending}
                  className="h-7 px-3 text-xs"
                >
                  {isPending ? 'Ending...' : 'Yes, End'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowEndConfirm(false)}
                  disabled={isPending}
                  className="h-7 px-3 text-xs text-gray-300 hover:text-white hover:bg-gray-700"
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Video placeholder */}
        <VideoPlaceholder
          connectionState={connectionState}
          physicianName={session.physician_name ?? undefined}
          className="flex-1"
        />
      </div>

      {/* Right sidebar */}
      <div className="w-full lg:w-96 flex flex-col bg-white border-l border-gray-200">
        {/* Physician info */}
        <div
          id={elementId('telemedicine', 'session-room', 'physician-info')}
          className="p-4 border-b border-gray-100"
        >
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Your Physician
          </h2>
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
              <User className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {session.physician_name
                  ? `Dr. ${session.physician_name}`
                  : 'Physician'}
              </p>
              {session.physician_specialty && (
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Stethoscope className="h-3 w-3" />
                  {session.physician_specialty}
                </p>
              )}
            </div>
          </div>

          {/* Session details summary */}
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <span>{session.scheduled_duration_minutes} minute session</span>
            </div>
            {session.patient_state && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <MapPin className="h-3 w-3" />
                <span>Patient state: {session.patient_state}</span>
              </div>
            )}
          </div>

          {session.chief_complaint && (
            <>
              <Separator className="my-3" />
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Chief Complaint
                </p>
                <p className="text-sm text-gray-700 line-clamp-3">
                  {session.chief_complaint}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Chat panel */}
        <div className="flex-1 flex flex-col min-h-0">
          <SessionChat
            messages={localMessages}
            currentUserId={currentUserId}
            onSendMessage={handleSendMessage}
            disabled={!isActive}
            className="border-0 shadow-none rounded-none flex-1"
          />
        </div>
      </div>
    </div>
  )
}
