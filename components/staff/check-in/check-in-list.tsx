'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, MapPin, UserCheck, Video } from 'lucide-react'
import { CheckInStatusBadge } from '@/components/staff/check-in/check-in-status-badge'
import { CheckInForm } from '@/components/staff/check-in/check-in-form'
import { getTodaysAppointments } from '@/lib/actions/staff'
import type { AppointmentQueueEntry } from '@/types/staff'

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
// Types
// ============================================

interface CheckInListProps {
  initialData: AppointmentQueueEntry[]
}

// ============================================
// CheckInList
// ============================================

export function CheckInList({ initialData }: CheckInListProps) {
  const [appointments, setAppointments] = useState<AppointmentQueueEntry[]>(initialData)
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentQueueEntry | null>(null)
  const [formOpen, setFormOpen] = useState(false)

  const refreshData = useCallback(async () => {
    const result = await getTodaysAppointments()
    if (result.success) {
      setAppointments(result.data)
    }
  }, [])

  const handleCheckInClick = useCallback((apt: AppointmentQueueEntry) => {
    setSelectedAppointment(apt)
    setFormOpen(true)
  }, [])

  const handleCheckInComplete = useCallback(() => {
    refreshData()
  }, [refreshData])

  // Separate into awaiting check-in and already checked in
  const awaitingCheckIn = appointments.filter(
    (a) => a.status === 'scheduled' || a.status === 'confirmed'
  )
  const alreadyCheckedIn = appointments.filter(
    (a) => a.status === 'in_progress'
  )

  return (
    <div className="space-y-6">
      {/* Awaiting Check-In */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Awaiting Check-In</CardTitle>
          <CardDescription>
            {awaitingCheckIn.length} patient{awaitingCheckIn.length !== 1 ? 's' : ''} to check in
          </CardDescription>
        </CardHeader>
        <CardContent>
          {awaitingCheckIn.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">
              No patients awaiting check-in.
            </p>
          ) : (
            <div className="space-y-3">
              {awaitingCheckIn.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between rounded-lg border border-gray-100 p-4 transition-colors hover:bg-gray-50"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900">
                        {apt.patient_name ?? 'Unknown Patient'}
                      </p>
                      <CheckInStatusBadge status={apt.status} />
                      {apt.is_telehealth && (
                        <Video className="h-3.5 w-3.5 text-blue-500" />
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(apt.scheduled_start)}
                      </span>
                      <span>Dr. {apt.physician_name ?? 'Unassigned'}</span>
                      {apt.location_name && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {apt.location_name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <Button
                      size="sm"
                      onClick={() => handleCheckInClick(apt)}
                    >
                      <UserCheck className="mr-2 h-4 w-4" />
                      Check In
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Already Checked In */}
      {alreadyCheckedIn.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Already Checked In</CardTitle>
            <CardDescription>
              {alreadyCheckedIn.length} patient{alreadyCheckedIn.length !== 1 ? 's' : ''} checked in
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alreadyCheckedIn.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center justify-between rounded-lg border border-emerald-100 bg-emerald-50/50 p-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-gray-900">
                        {apt.patient_name ?? 'Unknown Patient'}
                      </p>
                      <CheckInStatusBadge status={apt.status} />
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(apt.scheduled_start)}
                      </span>
                      <span>Dr. {apt.physician_name ?? 'Unassigned'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Check-In Form Dialog */}
      {selectedAppointment && (
        <CheckInForm
          appointmentId={selectedAppointment.id}
          patientName={selectedAppointment.patient_name}
          open={formOpen}
          onOpenChange={setFormOpen}
          onCheckInComplete={handleCheckInComplete}
        />
      )}
    </div>
  )
}
