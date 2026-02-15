'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Video } from 'lucide-react'
import { SchedulingFilter } from '@/components/staff/scheduling/scheduling-filter'
import { AppointmentActions } from '@/components/staff/scheduling/appointment-actions'
import { getSchedulingView } from '@/lib/actions/staff'
import type { SchedulingEntry, SchedulingFilters } from '@/types/staff'

// ============================================
// Types
// ============================================

interface PhysicianOption {
  id: string
  name: string
}

interface LocationOption {
  id: string
  name: string
}

interface SchedulingTableProps {
  initialData: SchedulingEntry[]
  physicians: PhysicianOption[]
  locations: LocationOption[]
}

// ============================================
// Status badge
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
// Format helpers
// ============================================

function formatDateTime(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

// ============================================
// SchedulingTable
// ============================================

export function SchedulingTable({
  initialData,
  physicians,
  locations,
}: SchedulingTableProps) {
  const [appointments, setAppointments] = useState<SchedulingEntry[]>(initialData)
  const [loading, setLoading] = useState(false)
  const [currentFilters, setCurrentFilters] = useState<SchedulingFilters>({})

  const loadData = useCallback(async (filters: SchedulingFilters) => {
    setLoading(true)
    setCurrentFilters(filters)
    const result = await getSchedulingView(filters)
    if (result.success) {
      setAppointments(result.data)
    }
    setLoading(false)
  }, [])

  const handleFilterChange = useCallback((filters: SchedulingFilters) => {
    loadData(filters)
  }, [loadData])

  const handleActionComplete = useCallback(() => {
    loadData(currentFilters)
  }, [loadData, currentFilters])

  // Initial load on mount to avoid stale data
  useEffect(() => {
    setAppointments(initialData)
  }, [initialData])

  return (
    <div className="space-y-4">
      <SchedulingFilter
        physicians={physicians}
        locations={locations}
        onFilterChange={handleFilterChange}
      />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Appointments ({appointments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-gray-500">Loading appointments...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-gray-500">No appointments match the selected filters.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date &amp; Time</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Physician</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((apt) => (
                  <TableRow key={apt.id}>
                    <TableCell className="whitespace-nowrap text-sm">
                      {formatDateTime(apt.scheduled_start)}
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {apt.patient_name ?? 'Unknown'}
                    </TableCell>
                    <TableCell className="text-sm">
                      Dr. {apt.physician_name ?? 'Unassigned'}
                    </TableCell>
                    <TableCell className="text-sm">
                      <span className="inline-flex items-center gap-1">
                        {apt.appointment_type}
                        {apt.is_telehealth && (
                          <Video className="h-3.5 w-3.5 text-blue-500" />
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">
                      {apt.location_name ?? 'N/A'}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(apt.status)}
                    </TableCell>
                    <TableCell>
                      <AppointmentActions
                        appointmentId={apt.id}
                        status={apt.status}
                        onActionComplete={handleActionComplete}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
