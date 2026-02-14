import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getAppointmentById } from '@/lib/actions/appointments'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { elementId } from '@/lib/utils/element-ids'
import { CancelAppointmentDialog } from '@/components/patient/appointments/cancel-appointment-dialog'
import { format } from 'date-fns'
import type { AppointmentStatus } from '@/types/database'

// ============================================
// Props
// ============================================

interface AppointmentDetailPageProps {
  params: Promise<{ id: string }>
}

// ============================================
// Helpers
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

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return 'N/A'
  try {
    return format(new Date(dateStr), 'EEEE, MMMM d, yyyy')
  } catch {
    return dateStr
  }
}

function formatTime(dateStr: string | null | undefined): string {
  if (!dateStr) return 'N/A'
  try {
    return format(new Date(dateStr), 'h:mm a')
  } catch {
    return dateStr
  }
}

// ============================================
// Page Component
// ============================================

export default async function AppointmentDetailPage({
  params,
}: AppointmentDetailPageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const resolvedParams = await params
  const result = await getAppointmentById(resolvedParams.id, user.id)

  if (!result.success) {
    notFound()
  }

  const appointment = result.data

  const providerName =
    appointment.provider_first_name || appointment.provider_last_name
      ? `Dr. ${appointment.provider_first_name ?? ''} ${appointment.provider_last_name ?? ''}`.trim()
      : null

  const locationText = [
    appointment.location_name,
    appointment.location_city,
    appointment.location_state,
  ]
    .filter(Boolean)
    .join(', ')

  const canCancel =
    appointment.status === 'scheduled' || appointment.status === 'confirmed'

  return (
    <div id={elementId('appointment-detail', 'page', 'container')}>
      {/* Back Navigation */}
      <div id={elementId('appointment-detail', 'back')} className="mb-6">
        <Link href="/patient/appointments">
          <Button variant="ghost" size="sm" className="gap-2 text-gray-600">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Appointments
          </Button>
        </Link>
      </div>

      {/* Appointment Header */}
      <div id={elementId('appointment-detail', 'header')} className="mb-8">
        <div className="flex items-start gap-3 mb-2">
          <h1 className="text-3xl font-bold text-gray-900">
            {appointment.service_name ?? appointment.title ?? 'Appointment'}
          </h1>
          <Badge
            variant={getStatusBadgeVariant(appointment.status)}
            className="mt-1.5"
          >
            {getStatusLabel(appointment.status)}
          </Badge>
          {appointment.is_telehealth && (
            <Badge variant="outline" className="mt-1.5">
              Telehealth
            </Badge>
          )}
        </div>
        {appointment.description && (
          <p className="text-gray-600">{appointment.description}</p>
        )}
      </div>

      {/* Appointment Details Card */}
      <Card id={elementId('appointment-detail', 'details', 'card')} className="mb-6">
        <CardHeader>
          <CardTitle>Appointment Details</CardTitle>
          <CardDescription>Date, time, and location information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <MetadataField
              label="Date"
              value={formatDate(appointment.scheduled_start)}
            />
            <MetadataField
              label="Time"
              value={`${formatTime(appointment.scheduled_start)} - ${formatTime(appointment.scheduled_end)}`}
            />
            {appointment.service_duration && (
              <MetadataField
                label="Duration"
                value={`${appointment.service_duration} minutes`}
              />
            )}
            {appointment.service_name && (
              <MetadataField
                label="Service"
                value={appointment.service_name}
              />
            )}
            {appointment.appointment_type && (
              <MetadataField
                label="Type"
                value={appointment.appointment_type
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, (c) => c.toUpperCase())}
              />
            )}
            <MetadataField
              label="Status"
              value={getStatusLabel(appointment.status)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Provider Card */}
      {providerName && (
        <Card id={elementId('appointment-detail', 'provider', 'card')} className="mb-6">
          <CardHeader>
            <CardTitle>Provider</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <MetadataField label="Name" value={providerName} />
              {appointment.provider_specialty && (
                <MetadataField
                  label="Specialty"
                  value={appointment.provider_specialty}
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Location Card */}
      {locationText && (
        <Card id={elementId('appointment-detail', 'location', 'card')} className="mb-6">
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-900">{locationText}</p>
            {appointment.room && (
              <p className="text-sm text-gray-500 mt-1">Room: {appointment.room}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Notes Card */}
      {(appointment.notes || appointment.reason_for_visit) && (
        <Card id={elementId('appointment-detail', 'notes', 'card')} className="mb-6">
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            {appointment.reason_for_visit && (
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-500 mb-1">Reason for Visit</p>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">
                  {appointment.reason_for_visit}
                </p>
              </div>
            )}
            {appointment.notes && appointment.notes !== appointment.reason_for_visit && (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Additional Notes</p>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">
                  {appointment.notes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pre-visit Instructions */}
      {appointment.pre_visit_instructions && (
        <Card id={elementId('appointment-detail', 'instructions', 'card')} className="mb-6">
          <CardHeader>
            <CardTitle>Pre-Visit Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-900 whitespace-pre-wrap">
              {appointment.pre_visit_instructions}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Cancellation Info */}
      {appointment.status === 'cancelled' && appointment.cancelled_at && (
        <Card id={elementId('appointment-detail', 'cancellation', 'card')} className="mb-6 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-700">Cancellation Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <MetadataField
                label="Cancelled On"
                value={formatDate(appointment.cancelled_at)}
              />
              {appointment.cancellation_reason && (
                <MetadataField
                  label="Reason"
                  value={appointment.cancellation_reason}
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {canCancel && (
        <Separator className="my-6" />
      )}
      {canCancel && (
        <div id={elementId('appointment-detail', 'actions')} className="flex justify-end">
          <CancelAppointmentDialog
            appointmentId={appointment.id}
            userId={user.id}
          />
        </div>
      )}
    </div>
  )
}

// ============================================
// Helper component for metadata fields
// ============================================

function MetadataField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">{value}</dd>
    </div>
  )
}
