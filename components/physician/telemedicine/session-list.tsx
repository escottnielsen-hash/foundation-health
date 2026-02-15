'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import {
  PHYSICIAN_SESSION_STATUS_OPTIONS,
  PHYSICIAN_SESSION_TYPE_OPTIONS,
} from '@/lib/validations/physician-clinical'
import type { PhysicianSessionRow } from '@/lib/actions/physician-clinical'
import type { SessionType, SessionStatus } from '@/types/database'
import { format } from 'date-fns'
import {
  Video,
  Calendar,
  Clock,
  User,
  Stethoscope,
} from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

// ============================================
// Status config
// ============================================

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

const SESSION_TYPE_LABELS: Record<SessionType, string> = {
  pre_op_consult: 'Pre-Op Consultation',
  post_op_followup: 'Post-Op Follow-Up',
  general_consult: 'General Consultation',
  second_opinion: 'Second Opinion',
  urgent_care: 'Urgent Care',
}

// ============================================
// Session list
// ============================================

interface SessionListProps {
  sessions: PhysicianSessionRow[]
  totalCount: number
}

export function SessionList({ sessions, totalCount }: SessionListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentStatus = searchParams.get('status') ?? ''
  const currentType = searchParams.get('session_type') ?? ''
  const currentDateFrom = searchParams.get('date_from') ?? ''
  const currentDateTo = searchParams.get('date_to') ?? ''

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`?${params.toString()}`)
    },
    [router, searchParams]
  )

  const clearFilters = useCallback(() => {
    router.push('?')
  }, [router])

  const hasFilters = currentStatus || currentType || currentDateFrom || currentDateTo

  // Categorize sessions
  const now = new Date()
  const activeSessions = sessions.filter((s) => s.status === 'in_progress')
  const waitingSessions = sessions.filter((s) => s.status === 'waiting_room')
  const upcomingSessions = sessions.filter(
    (s) => s.status === 'scheduled' && new Date(s.scheduled_start) >= now
  )
  const pastSessions = sessions.filter(
    (s) =>
      s.status === 'completed' ||
      s.status === 'cancelled' ||
      s.status === 'no_show' ||
      (s.status === 'scheduled' && new Date(s.scheduled_start) < now)
  )

  return (
    <div>
      {/* Filter bar */}
      <div className="mb-6 flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500">Status</label>
          <Select
            value={currentStatus}
            onChange={(e) => updateFilter('status', e.target.value)}
            className="w-[160px]"
          >
            <option value="">All Statuses</option>
            {PHYSICIAN_SESSION_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500">Type</label>
          <Select
            value={currentType}
            onChange={(e) => updateFilter('session_type', e.target.value)}
            className="w-[200px]"
          >
            <option value="">All Types</option>
            {PHYSICIAN_SESSION_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500">From</label>
          <Input
            type="date"
            value={currentDateFrom}
            onChange={(e) => updateFilter('date_from', e.target.value)}
            className="w-[150px]"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500">To</label>
          <Input
            type="date"
            value={currentDateTo}
            onChange={(e) => updateFilter('date_to', e.target.value)}
            className="w-[150px]"
          />
        </div>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear
          </Button>
        )}

        <p className="text-sm text-gray-500 ml-auto flex-shrink-0">
          {totalCount} {totalCount === 1 ? 'session' : 'sessions'}
        </p>
      </div>

      {/* Session groups */}
      {sessions.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <Video className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No telemedicine sessions
            </h3>
            <p className="text-gray-500 text-sm max-w-sm mx-auto">
              No sessions match the current filters. Adjust your search criteria or check back later.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {activeSessions.length > 0 && (
            <SessionGroup title="Active Sessions" sessions={activeSessions} showPulse />
          )}
          {waitingSessions.length > 0 && (
            <SessionGroup title="Waiting Room" sessions={waitingSessions} />
          )}
          {upcomingSessions.length > 0 && (
            <SessionGroup title="Upcoming Sessions" sessions={upcomingSessions} />
          )}
          {pastSessions.length > 0 && (
            <SessionGroup title="Past Sessions" sessions={pastSessions} />
          )}
        </div>
      )}
    </div>
  )
}

// ============================================
// Session group
// ============================================

function SessionGroup({
  title,
  sessions,
  showPulse,
}: {
  title: string
  sessions: PhysicianSessionRow[]
  showPulse?: boolean
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
        {showPulse && (
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        )}
        {title}
      </h2>
      <div className="space-y-3">
        {sessions.map((session) => (
          <SessionCard key={session.id} session={session} />
        ))}
      </div>
    </div>
  )
}

// ============================================
// Session card
// ============================================

function SessionCard({ session }: { session: PhysicianSessionRow }) {
  const statusConfig = SESSION_STATUS_CONFIG[session.status as SessionStatus] ?? {
    label: session.status,
    variant: 'outline' as const,
  }
  const typeLabel = SESSION_TYPE_LABELS[session.session_type as SessionType] ?? session.session_type

  const patientName = [session.patient_first_name, session.patient_last_name]
    .filter(Boolean)
    .join(' ') || 'Unknown Patient'

  const formatDateTime = (dateStr: string): string => {
    try {
      return format(new Date(dateStr), 'MMM d, yyyy - h:mm a')
    } catch {
      return dateStr
    }
  }

  const isActive = session.status === 'in_progress' || session.status === 'waiting_room'

  return (
    <Link href={`/physician/telemedicine/${session.id}`}>
      <Card className="hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="font-semibold text-gray-900">{patientName}</h3>
                <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
              </div>

              <p className="text-sm text-gray-600 mb-2">{typeLabel}</p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDateTime(session.scheduled_start)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {session.scheduled_duration_minutes} min
                </span>
                {session.chief_complaint && (
                  <span className="flex items-center gap-1.5">
                    <Stethoscope className="h-3.5 w-3.5" />
                    <span className="truncate max-w-[200px]">{session.chief_complaint}</span>
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {isActive && (
                <Button size="sm" className="gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <Video className="h-3.5 w-3.5" />
                  Join
                </Button>
              )}
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <User className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
