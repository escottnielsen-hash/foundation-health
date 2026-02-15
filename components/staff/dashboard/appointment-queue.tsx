import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, MapPin, Video } from 'lucide-react'
import type { AppointmentQueueEntry } from '@/types/staff'

// ============================================
// Status badge mapping
// ============================================

function getStatusBadge(status: string) {
  switch (status) {
    case 'scheduled':
      return <Badge variant="outline">Scheduled</Badge>
    case 'confirmed':
      return <Badge variant="success">Confirmed</Badge>
    case 'in_progress':
      return <Badge className="border-transparent bg-blue-100 text-blue-800">In Progress</Badge>
    case 'completed':
      return <Badge variant="secondary">Completed</Badge>
    case 'cancelled':
      return <Badge variant="destructive">Cancelled</Badge>
    case 'no_show':
      return <Badge variant="warning">No Show</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

// ============================================
// Format time helper
// ============================================

function formatTime(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

// ============================================
// AppointmentQueue
// ============================================

export function AppointmentQueue({ queue }: { queue: AppointmentQueueEntry[] }) {
  if (queue.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Today&apos;s Appointment Queue</CardTitle>
          <CardDescription>No appointments scheduled for today</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Today&apos;s Appointment Queue</CardTitle>
        <CardDescription>
          {queue.length} appointment{queue.length !== 1 ? 's' : ''} scheduled
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {queue.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between rounded-lg border border-gray-100 p-4 transition-colors hover:bg-gray-50"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900">
                    {entry.patient_name ?? 'Unknown Patient'}
                  </p>
                  {getStatusBadge(entry.status)}
                  {entry.is_telehealth && (
                    <Video className="h-3.5 w-3.5 text-blue-500" />
                  )}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTime(entry.scheduled_start)}
                  </span>
                  <span>Dr. {entry.physician_name ?? 'Unassigned'}</span>
                  {entry.location_name && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {entry.location_name}
                    </span>
                  )}
                  {entry.reason_for_visit && (
                    <span className="text-gray-400">
                      {entry.reason_for_visit}
                    </span>
                  )}
                </div>
              </div>
              <div className="ml-4 flex-shrink-0">
                {entry.check_in_time && (
                  <span className="text-xs text-emerald-600">
                    Checked in at {formatTime(entry.check_in_time)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
