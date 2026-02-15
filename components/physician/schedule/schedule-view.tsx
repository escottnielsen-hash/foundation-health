'use client'

import { useState } from 'react'
import { Clock, Video, MapPin, ChevronLeft, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { PhysicianScheduleAppointment } from '@/lib/actions/physician'
import type { AppointmentStatus } from '@/types/database'

// ============================================
// Types
// ============================================

interface ScheduleViewProps {
  appointments: PhysicianScheduleAppointment[]
  dateFrom: string
  dateTo: string
}

type ViewMode = 'day' | 'week'

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

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function formatFullDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function getStatusColor(status: AppointmentStatus) {
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

function groupByDate(appointments: PhysicianScheduleAppointment[]) {
  const groups: Record<string, PhysicianScheduleAppointment[]> = {}
  for (const apt of appointments) {
    const dateKey = apt.scheduled_start.split('T')[0]
    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(apt)
  }
  return groups
}

// ============================================
// Schedule View Component
// ============================================

export function ScheduleView({ appointments, dateFrom, dateTo }: ScheduleViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('week')

  const groupedAppointments = groupByDate(appointments)
  const sortedDates = Object.keys(groupedAppointments).sort()

  // For day view, pick the first date or today
  const today = new Date().toISOString().split('T')[0]
  const [selectedDate, setSelectedDate] = useState(
    sortedDates.includes(today) ? today : sortedDates[0] ?? today
  )

  const currentDayIndex = sortedDates.indexOf(selectedDate)

  const navigateDay = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && currentDayIndex > 0) {
      setSelectedDate(sortedDates[currentDayIndex - 1])
    }
    if (direction === 'next' && currentDayIndex < sortedDates.length - 1) {
      setSelectedDate(sortedDates[currentDayIndex + 1])
    }
  }

  const displayDates = viewMode === 'day' ? [selectedDate] : sortedDates

  return (
    <div className="space-y-4">
      {/* View Toggle + Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
          <button
            onClick={() => setViewMode('day')}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              viewMode === 'day'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Day
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              viewMode === 'week'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Week
          </button>
        </div>

        {viewMode === 'day' && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateDay('prev')}
              disabled={currentDayIndex <= 0}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium text-slate-700">
              {formatFullDate(selectedDate)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigateDay('next')}
              disabled={currentDayIndex >= sortedDates.length - 1}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        <p className="text-sm text-slate-500">
          {appointments.length} appointment{appointments.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Appointment List */}
      {appointments.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-12 text-center">
            <p className="text-sm text-slate-500">
              No appointments found for the selected period.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {displayDates.map((dateKey) => {
            const dayAppointments = groupedAppointments[dateKey] ?? []
            if (dayAppointments.length === 0) return null

            return (
              <div key={dateKey}>
                {/* Date Header */}
                {viewMode === 'week' && (
                  <h3 className="mb-3 text-sm font-semibold text-slate-700">
                    {formatDate(dateKey)}
                    <span className="ml-2 text-xs font-normal text-slate-400">
                      ({dayAppointments.length} appointment{dayAppointments.length !== 1 ? 's' : ''})
                    </span>
                  </h3>
                )}

                <div className="space-y-2">
                  {dayAppointments.map((apt) => (
                    <Card key={apt.id} className="border shadow-sm transition-shadow hover:shadow-md">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          {/* Time Column */}
                          <div className="flex-shrink-0 text-right" style={{ minWidth: '80px' }}>
                            <div className="flex items-center gap-1 text-sm font-semibold text-slate-700">
                              <Clock className="h-3.5 w-3.5 text-slate-400" />
                              {formatTime(apt.scheduled_start)}
                            </div>
                            <p className="text-xs text-slate-400">
                              to {formatTime(apt.scheduled_end)}
                            </p>
                          </div>

                          {/* Vertical Divider */}
                          <div className="h-12 w-px flex-shrink-0 bg-slate-200" />

                          {/* Details */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-slate-900">
                                {apt.patient_name ?? 'Patient'}
                              </p>
                              <Badge variant={getStatusColor(apt.status)} className="text-xs">
                                {formatStatusLabel(apt.status)}
                              </Badge>
                            </div>
                            <p className="mt-0.5 text-xs text-slate-600">
                              {apt.title || apt.appointment_type}
                            </p>
                            {apt.reason_for_visit && (
                              <p className="mt-0.5 text-xs text-slate-500">
                                Reason: {apt.reason_for_visit}
                              </p>
                            )}
                            <div className="mt-1.5 flex items-center gap-3">
                              {apt.is_telehealth ? (
                                <span className="inline-flex items-center gap-1 text-xs text-violet-600">
                                  <Video className="h-3 w-3" />
                                  Telehealth
                                </span>
                              ) : apt.location ? (
                                <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                                  <MapPin className="h-3 w-3" />
                                  {apt.location}
                                  {apt.room ? ` - ${apt.room}` : ''}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
