'use client'

import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { AppointmentWithDetails } from '@/lib/actions/appointments'
import type { AppointmentStatus } from '@/types/database'
import { format } from 'date-fns'

// ============================================
// Props
// ============================================

interface AppointmentsTabsProps {
  upcoming: AppointmentWithDetails[]
  past: AppointmentWithDetails[]
}

// ============================================
// Status badge helpers
// ============================================

function getStatusBadgeVariant(
  status: AppointmentStatus
): 'default' | 'success' | 'secondary' | 'destructive' | 'warning' | 'outline' {
  switch (status) {
    case 'scheduled':
      return 'default'
    case 'confirmed':
      return 'success'
    case 'completed':
      return 'secondary'
    case 'cancelled':
      return 'destructive'
    case 'no_show':
      return 'warning'
    case 'in_progress':
      return 'default'
    default:
      return 'outline'
  }
}

function getStatusLabel(status: AppointmentStatus): string {
  switch (status) {
    case 'scheduled':
      return 'Scheduled'
    case 'confirmed':
      return 'Confirmed'
    case 'completed':
      return 'Completed'
    case 'cancelled':
      return 'Cancelled'
    case 'no_show':
      return 'No Show'
    case 'in_progress':
      return 'In Progress'
    default:
      return status
  }
}

function formatDateTime(dateStr: string): { date: string; time: string } {
  try {
    const d = new Date(dateStr)
    return {
      date: format(d, 'EEE, MMM d, yyyy'),
      time: format(d, 'h:mm a'),
    }
  } catch {
    return { date: dateStr, time: '' }
  }
}

// ============================================
// Appointment Card
// ============================================

function AppointmentCard({ appointment }: { appointment: AppointmentWithDetails }) {
  const { date, time } = formatDateTime(appointment.scheduled_start)

  const providerName =
    appointment.provider_first_name || appointment.provider_last_name
      ? `Dr. ${appointment.provider_first_name ?? ''} ${appointment.provider_last_name ?? ''}`.trim()
      : null

  const locationText = [appointment.location_name, appointment.location_city, appointment.location_state]
    .filter(Boolean)
    .join(', ')

  return (
    <Link href={`/patient/appointments/${appointment.id}`} className="block">
      <Card className="hover:border-primary-200 hover:shadow-md transition-all cursor-pointer">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* Service and status */}
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-base font-semibold text-gray-900 truncate">
                  {appointment.service_name ?? appointment.title ?? 'Appointment'}
                </h3>
                <Badge variant={getStatusBadgeVariant(appointment.status)}>
                  {getStatusLabel(appointment.status)}
                </Badge>
              </div>

              {/* Date and time */}
              <p className="text-sm text-gray-700 mb-1">
                {date} at {time}
                {appointment.service_duration && (
                  <span className="text-gray-400 ml-2">
                    ({appointment.service_duration} min)
                  </span>
                )}
              </p>

              {/* Provider and location */}
              <div className="flex items-center gap-4 text-xs text-gray-500">
                {providerName && <span>{providerName}</span>}
                {locationText && (
                  <>
                    <span aria-hidden="true" className="text-gray-300">|</span>
                    <span>{locationText}</span>
                  </>
                )}
                {appointment.is_telehealth && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                    Telehealth
                  </Badge>
                )}
              </div>
            </div>

            {/* Chevron */}
            <div className="flex-shrink-0 text-gray-300 mt-1">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

// ============================================
// Empty state
// ============================================

function EmptyState({ type }: { type: 'upcoming' | 'past' }) {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <svg
            className="w-6 h-6 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {type === 'upcoming' ? 'No upcoming appointments' : 'No past appointments'}
        </h3>
        <p className="text-gray-500 text-sm">
          {type === 'upcoming'
            ? 'You have no scheduled appointments. Book one to get started.'
            : 'Your completed appointments will appear here.'}
        </p>
      </CardContent>
    </Card>
  )
}

// ============================================
// Main Component
// ============================================

export function AppointmentsTabs({ upcoming, past }: AppointmentsTabsProps) {
  return (
    <Tabs defaultValue="upcoming" className="w-full">
      <TabsList className="mb-6">
        <TabsTrigger value="upcoming">
          Upcoming
          {upcoming.length > 0 && (
            <span className="ml-2 inline-flex items-center justify-center rounded-full bg-primary-100 text-primary-700 px-2 py-0.5 text-xs font-medium">
              {upcoming.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="past">
          Past
          {past.length > 0 && (
            <span className="ml-2 inline-flex items-center justify-center rounded-full bg-gray-100 text-gray-600 px-2 py-0.5 text-xs font-medium">
              {past.length}
            </span>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="upcoming">
        {upcoming.length === 0 ? (
          <EmptyState type="upcoming" />
        ) : (
          <div className="space-y-3">
            {upcoming.map((apt) => (
              <AppointmentCard key={apt.id} appointment={apt} />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="past">
        {past.length === 0 ? (
          <EmptyState type="past" />
        ) : (
          <div className="space-y-3">
            {past.map((apt) => (
              <AppointmentCard key={apt.id} appointment={apt} />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}
