'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { elementId } from '@/lib/utils/element-ids'
import { cn } from '@/lib/utils/cn'
import {
  Video,
  Clock,
  User,
  ChevronRight,
  CalendarCheck,
} from 'lucide-react'
import { format } from 'date-fns'
import type { SessionType, SessionStatus } from '@/types/database'

// ============================================
// Type & status display configs
// ============================================

const SESSION_TYPE_LABELS: Record<SessionType, string> = {
  pre_op_consult: 'Pre-Op Consult',
  post_op_followup: 'Post-Op Follow-Up',
  general_consult: 'General Consultation',
  second_opinion: 'Second Opinion',
  urgent_care: 'Urgent Care',
}

const SESSION_TYPE_COLORS: Record<SessionType, string> = {
  pre_op_consult: 'bg-blue-100 text-blue-800',
  post_op_followup: 'bg-violet-100 text-violet-800',
  general_consult: 'bg-gray-100 text-gray-800',
  second_opinion: 'bg-amber-100 text-amber-800',
  urgent_care: 'bg-red-100 text-red-800',
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
// Props
// ============================================

interface SessionCardProps {
  id: string
  sessionType: SessionType
  status: SessionStatus
  scheduledStart: string
  scheduledDurationMinutes: number
  physicianName: string | null
  chiefComplaint: string | null
}

// ============================================
// Component
// ============================================

export function SessionCard({
  id,
  sessionType,
  status,
  scheduledStart,
  scheduledDurationMinutes,
  physicianName,
  chiefComplaint,
}: SessionCardProps) {
  const router = useRouter()
  const [countdown, setCountdown] = useState('')
  const [canJoin, setCanJoin] = useState(false)

  const calculateTimeLeft = useCallback(() => {
    const startTime = new Date(scheduledStart).getTime()
    const now = Date.now()
    const diffMs = startTime - now
    const diffMinutes = diffMs / (1000 * 60)

    // Can join if within 5 minutes before session start
    if (
      (status === 'scheduled' || status === 'waiting_room') &&
      diffMinutes <= 5 &&
      diffMinutes > -scheduledDurationMinutes
    ) {
      setCanJoin(true)
    } else {
      setCanJoin(false)
    }

    // Show countdown if within 24 hours
    if (diffMs > 0 && diffMs <= 24 * 60 * 60 * 1000) {
      const hours = Math.floor(diffMs / (1000 * 60 * 60))
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000)

      if (hours > 0) {
        setCountdown(`${hours}h ${minutes}m`)
      } else if (minutes > 0) {
        setCountdown(`${minutes}m ${seconds}s`)
      } else {
        setCountdown(`${seconds}s`)
      }
    } else {
      setCountdown('')
    }
  }, [scheduledStart, status, scheduledDurationMinutes])

  useEffect(() => {
    calculateTimeLeft()
    const interval = setInterval(calculateTimeLeft, 1000)
    return () => clearInterval(interval)
  }, [calculateTimeLeft])

  const handleClick = () => {
    router.push(`/patient/telemedicine/${id}`)
  }

  const handleJoin = (e: React.MouseEvent) => {
    e.stopPropagation()
    router.push(`/patient/telemedicine/${id}/session`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  const formatScheduledDate = (dateStr: string): string => {
    try {
      return format(new Date(dateStr), 'EEE, MMM d, yyyy')
    } catch {
      return dateStr
    }
  }

  const formatScheduledTime = (dateStr: string): string => {
    try {
      return format(new Date(dateStr), 'h:mm a')
    } catch {
      return dateStr
    }
  }

  const statusConfig = SESSION_STATUS_CONFIG[status] ?? {
    label: status,
    variant: 'outline' as const,
  }

  return (
    <Card
      id={elementId('telemedicine', 'session-card', id)}
      className="hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group"
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          {/* Left content */}
          <div className="flex-1 min-w-0">
            {/* Top row: type badge + status badge */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold',
                  SESSION_TYPE_COLORS[sessionType]
                )}
              >
                <Video className="h-3 w-3" />
                {SESSION_TYPE_LABELS[sessionType]}
              </span>
              <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
            </div>

            {/* Chief complaint */}
            {chiefComplaint && (
              <p className="text-sm text-gray-700 line-clamp-1 mb-2">
                {chiefComplaint}
              </p>
            )}

            {/* Date, time, physician */}
            <div className="flex items-center gap-4 text-xs text-gray-400 flex-wrap">
              <span className="flex items-center gap-1">
                <CalendarCheck className="h-3 w-3" />
                {formatScheduledDate(scheduledStart)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatScheduledTime(scheduledStart)} ({scheduledDurationMinutes} min)
              </span>
              {physicianName && (
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  Dr. {physicianName}
                </span>
              )}
            </div>

            {/* Countdown timer */}
            {countdown && status === 'scheduled' && (
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 border border-amber-200">
                <Clock className="h-3 w-3 text-amber-600 animate-pulse" />
                <span className="text-xs font-semibold text-amber-700">
                  Starts in {countdown}
                </span>
              </div>
            )}
          </div>

          {/* Right: Join button or chevron */}
          <div className="flex-shrink-0 flex items-center gap-2">
            {canJoin && (
              <Button
                size="sm"
                onClick={handleJoin}
                className="gap-1.5"
              >
                <Video className="h-3.5 w-3.5" />
                Join
              </Button>
            )}
            {status === 'in_progress' && (
              <Button
                size="sm"
                onClick={handleJoin}
                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
              >
                <Video className="h-3.5 w-3.5" />
                Rejoin
              </Button>
            )}
            <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-gray-400 transition-colors" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
