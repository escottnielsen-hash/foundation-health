import Link from 'next/link'
import { Video, Clock, ArrowRight, MonitorSmartphone } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { elementId } from '@/lib/utils/element-ids'
import type { DashboardTelemedicineSession } from '@/lib/actions/dashboard'

interface UpcomingTelemedicineCardProps {
  sessions: DashboardTelemedicineSession[]
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function formatSessionType(sessionType: string): string {
  const labels: Record<string, string> = {
    pre_op_consult: 'Pre-Op Consult',
    post_op_followup: 'Post-Op Follow Up',
    general_consult: 'General Consult',
    second_opinion: 'Second Opinion',
    urgent_care: 'Urgent Care',
  }
  return labels[sessionType] ?? sessionType.replace(/_/g, ' ')
}

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`
  return formatDate(dateString)
}

export function UpcomingTelemedicineCard({
  sessions,
}: UpcomingTelemedicineCardProps) {
  return (
    <Card
      id={elementId('dashboard', 'upcoming', 'telemedicine')}
      className="border-0 shadow-md"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-slate-900">
            Telemedicine Sessions
          </CardTitle>
          <Link
            href="/patient/appointments"
            className="inline-flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-700"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <CardDescription>Your upcoming virtual visits</CardDescription>
      </CardHeader>
      <CardContent>
        {sessions.length > 0 ? (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 transition-all hover:border-violet-200 hover:bg-violet-50/30 hover:shadow-sm"
              >
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
                  <Video className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900">
                      {formatSessionType(session.session_type)}
                    </p>
                    <span className="flex-shrink-0 text-xs font-medium text-violet-600">
                      {formatRelativeDate(session.scheduled_start)}
                    </span>
                  </div>
                  {session.chief_complaint && (
                    <p className="mt-0.5 text-xs text-slate-500 line-clamp-1">
                      {session.chief_complaint}
                    </p>
                  )}
                  <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="h-3 w-3 flex-shrink-0" />
                    <span>
                      {formatDate(session.scheduled_start)} at{' '}
                      {formatTime(session.scheduled_start)}
                    </span>
                    <span className="text-slate-300">&middot;</span>
                    <span>{session.scheduled_duration_minutes} min</span>
                  </div>
                  <div className="mt-2">
                    <Badge
                      variant={
                        session.status === 'waiting_room'
                          ? 'warning'
                          : 'secondary'
                      }
                      className="text-[10px]"
                    >
                      {session.status === 'waiting_room'
                        ? 'Waiting Room'
                        : 'Scheduled'}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <MonitorSmartphone className="h-7 w-7 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-600">
              No virtual visits scheduled
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Connect with your doctor from anywhere
            </p>
            <Button
              asChild
              size="sm"
              className="mt-4 bg-violet-600 text-white hover:bg-violet-700"
            >
              <Link href="/patient/appointments/book">
                <Video className="mr-1.5 h-4 w-4" />
                Request Session
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
