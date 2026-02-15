import Link from 'next/link'
import { Clock, Video, MapPin, ArrowRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { PhysicianDashboardAppointment } from '@/lib/actions/physician'
import type { AppointmentStatus } from '@/types/database'

// ============================================
// Types
// ============================================

interface TodaysScheduleProps {
  appointments: PhysicianDashboardAppointment[]
}

// ============================================
// Helpers
// ============================================

function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function getStatusBadgeVariant(status: AppointmentStatus) {
  switch (status) {
    case 'confirmed':
      return 'success' as const
    case 'scheduled':
      return 'warning' as const
    case 'in_progress':
      return 'default' as const
    case 'completed':
      return 'secondary' as const
    case 'cancelled':
    case 'no_show':
      return 'destructive' as const
    default:
      return 'outline' as const
  }
}

function formatStatusLabel(status: AppointmentStatus): string {
  return status
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

// ============================================
// Today's Schedule Component
// ============================================

export function TodaysSchedule({ appointments }: TodaysScheduleProps) {
  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-slate-900">
            Today&apos;s Schedule
          </CardTitle>
          <Link
            href="/physician/schedule"
            className="inline-flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-700"
          >
            Full schedule
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">
            No appointments scheduled for today.
          </p>
        ) : (
          <div className="space-y-3">
            {appointments.map((apt) => (
              <div
                key={apt.id}
                className="flex items-center gap-4 rounded-lg border border-slate-100 bg-slate-50/50 p-3"
              >
                {/* Time */}
                <div className="flex-shrink-0 text-center">
                  <div className="flex items-center gap-1 text-sm font-semibold text-slate-700">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    {formatTime(apt.scheduled_start)}
                  </div>
                  <p className="text-xs text-slate-400">
                    {formatTime(apt.scheduled_end)}
                  </p>
                </div>

                {/* Divider */}
                <div className="h-10 w-px bg-slate-200" />

                {/* Patient & Details */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {apt.patient_name ?? 'Patient'}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {apt.title || apt.appointment_type}
                    {apt.reason_for_visit ? ` - ${apt.reason_for_visit}` : ''}
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    {apt.is_telehealth ? (
                      <span className="inline-flex items-center gap-1 text-xs text-violet-600">
                        <Video className="h-3 w-3" />
                        Telehealth
                      </span>
                    ) : apt.location ? (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                        <MapPin className="h-3 w-3" />
                        {apt.location}
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Status Badge */}
                <Badge variant={getStatusBadgeVariant(apt.status)} className="flex-shrink-0">
                  {formatStatusLabel(apt.status)}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
