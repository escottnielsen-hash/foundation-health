import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock } from 'lucide-react'
import type { CheckedInPatientEntry } from '@/types/staff'

// ============================================
// Wait time badge
// ============================================

function getWaitTimeBadge(minutes: number) {
  if (minutes <= 10) {
    return <Badge variant="success">{minutes} min</Badge>
  }
  if (minutes <= 20) {
    return <Badge variant="warning">{minutes} min</Badge>
  }
  return <Badge variant="destructive">{minutes} min</Badge>
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
// CheckedInPatients
// ============================================

export function CheckedInPatients({ patients }: { patients: CheckedInPatientEntry[] }) {
  if (patients.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Checked-In Patients</CardTitle>
          <CardDescription>No patients currently checked in</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Checked-In Patients</CardTitle>
        <CardDescription>
          {patients.length} patient{patients.length !== 1 ? 's' : ''} waiting
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {patients.map((patient) => (
            <div
              key={patient.appointment_id}
              className="flex items-center justify-between rounded-lg border border-gray-100 p-4"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {patient.patient_name ?? 'Unknown Patient'}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                  <span>Dr. {patient.physician_name ?? 'Unassigned'}</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Appt: {formatTime(patient.scheduled_start)}
                  </span>
                  <span className="text-gray-400">
                    Checked in: {formatTime(patient.check_in_time)}
                  </span>
                </div>
              </div>
              <div className="ml-4 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Wait:</span>
                  {getWaitTimeBadge(patient.wait_minutes)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
