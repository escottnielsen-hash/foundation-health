import Link from 'next/link'
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  CalendarPlus,
  ArrowRight,
} from 'lucide-react'
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
import type { DashboardAppointment } from '@/lib/actions/dashboard'

interface UpcomingAppointmentsCardProps {
  appointments: DashboardAppointment[]
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

export function UpcomingAppointmentsCard({
  appointments,
}: UpcomingAppointmentsCardProps) {
  return (
    <Card
      id={elementId('dashboard', 'upcoming', 'appointments')}
      className="border-0 shadow-md"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-slate-900">
            Upcoming Appointments
          </CardTitle>
          <Link
            href="/patient/appointments"
            className="inline-flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-700"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <CardDescription>Your next scheduled visits</CardDescription>
      </CardHeader>
      <CardContent>
        {appointments.length > 0 ? (
          <div className="space-y-3">
            {appointments.map((apt, index) => (
              <Link
                key={apt.id}
                href={`/patient/appointments/${apt.id}`}
                className="group block"
              >
                <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 transition-all group-hover:border-amber-200 group-hover:bg-amber-50/30 group-hover:shadow-sm">
                  <div
                    className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${
                      apt.is_telehealth
                        ? 'bg-violet-100 text-violet-600'
                        : 'bg-amber-100 text-amber-600'
                    }`}
                  >
                    {apt.is_telehealth ? (
                      <Video className="h-5 w-5" />
                    ) : (
                      <Calendar className="h-5 w-5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-900">
                        {apt.title ||
                          apt.service_name ||
                          apt.appointment_type}
                      </p>
                      <span className="flex-shrink-0 text-xs font-medium text-amber-600">
                        {formatRelativeDate(apt.scheduled_start)}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                      <Clock className="h-3 w-3 flex-shrink-0" />
                      <span>
                        {formatDate(apt.scheduled_start)} at{' '}
                        {formatTime(apt.scheduled_start)}
                      </span>
                    </div>
                    {apt.location && !apt.is_telehealth && (
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{apt.location}</span>
                      </div>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      {apt.is_telehealth && (
                        <Badge variant="secondary" className="text-[10px]">
                          Telehealth
                        </Badge>
                      )}
                      <Badge
                        variant={
                          apt.status === 'confirmed' ? 'success' : 'outline'
                        }
                        className="text-[10px]"
                      >
                        {apt.status.charAt(0).toUpperCase() +
                          apt.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <Calendar className="h-7 w-7 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-600">
              No upcoming appointments
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Schedule your next visit today
            </p>
            <Button asChild size="sm" className="mt-4 bg-amber-500 text-slate-900 hover:bg-amber-400">
              <Link href="/patient/appointments/book">
                <CalendarPlus className="mr-1.5 h-4 w-4" />
                Book Appointment
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
