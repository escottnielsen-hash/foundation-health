'use client'

import Link from 'next/link'
import {
  ArrowLeft,
  Calendar,
  Stethoscope,
  Video,
  MapPin,
  AlertTriangle,
  Pill,
  Activity,
  Heart,
  User,
  Mail,
  Phone,
} from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { PhysicianPatientDetail } from '@/lib/actions/physician'
import type { AppointmentStatus, EncounterStatus } from '@/types/database'

// ============================================
// Types
// ============================================

interface PatientDetailProps {
  patient: PhysicianPatientDetail
}

// ============================================
// Helpers
// ============================================

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function getAppointmentStatusVariant(status: AppointmentStatus) {
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

function getEncounterStatusVariant(status: EncounterStatus) {
  switch (status) {
    case 'checked_in':
      return 'warning' as const
    case 'in_progress':
      return 'default' as const
    case 'completed':
      return 'success' as const
    case 'cancelled':
      return 'destructive' as const
    default:
      return 'outline' as const
  }
}

function formatStatus(status: string): string {
  return status
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function calculateAge(dob: string | null): string {
  if (!dob) return 'Unknown'
  const birth = new Date(dob)
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const monthDiff = now.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
    age--
  }
  return `${age} years old`
}

// ============================================
// Patient Detail Component
// ============================================

export function PatientDetail({ patient }: PatientDetailProps) {
  const patientName =
    [patient.first_name, patient.last_name].filter(Boolean).join(' ') || 'Unknown Patient'
  const initials =
    [patient.first_name, patient.last_name]
      .filter(Boolean)
      .map((n) => n?.charAt(0) ?? '')
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'P'

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button asChild variant="ghost" size="sm" className="gap-2">
        <Link href="/physician/patients">
          <ArrowLeft className="h-4 w-4" />
          Back to Patients
        </Link>
      </Button>

      {/* Patient Header */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-xl font-bold text-amber-700">
              {initials}
            </div>

            {/* Patient Info */}
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold text-slate-900">{patientName}</h2>
              <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1">
                <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
                  <Mail className="h-3.5 w-3.5" />
                  {patient.email}
                </span>
                {patient.phone && (
                  <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
                    <Phone className="h-3.5 w-3.5" />
                    {patient.phone}
                  </span>
                )}
                {patient.date_of_birth && (
                  <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
                    <User className="h-3.5 w-3.5" />
                    {calculateAge(patient.date_of_birth)}
                    {patient.gender ? ` - ${patient.gender}` : ''}
                  </span>
                )}
              </div>
              {(patient.city || patient.state) && (
                <p className="mt-1 text-sm text-slate-400">
                  {[patient.address_line1, patient.city, patient.state, patient.zip_code]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed Content */}
      <Tabs defaultValue="overview">
        <TabsList className="bg-slate-100">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="encounters">
            Encounters ({patient.encounters.length})
          </TabsTrigger>
          <TabsTrigger value="appointments">
            Appointments ({patient.appointments.length})
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Allergies */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  Allergies
                </CardTitle>
              </CardHeader>
              <CardContent>
                {patient.allergies && patient.allergies.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {patient.allergies.map((allergy, i) => (
                      <Badge key={i} variant="destructive" className="text-xs">
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">No known allergies</p>
                )}
              </CardContent>
            </Card>

            {/* Medications */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Pill className="h-4 w-4 text-blue-500" />
                  Current Medications
                </CardTitle>
              </CardHeader>
              <CardContent>
                {patient.medications && patient.medications.length > 0 ? (
                  <ul className="space-y-1">
                    {patient.medications.map((med, i) => (
                      <li key={i} className="text-sm text-slate-600">
                        {med}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-400">No medications listed</p>
                )}
              </CardContent>
            </Card>

            {/* Medical Conditions */}
            <Card className="border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Activity className="h-4 w-4 text-amber-500" />
                  Medical Conditions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {patient.medical_conditions && patient.medical_conditions.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {patient.medical_conditions.map((condition, i) => (
                      <Badge key={i} variant="warning" className="text-xs">
                        {condition}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">No conditions listed</p>
                )}
              </CardContent>
            </Card>

            {/* Blood Type */}
            {patient.blood_type && (
              <Card className="border shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Heart className="h-4 w-4 text-red-500" />
                    Blood Type
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-bold text-slate-900">{patient.blood_type}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Encounters Tab */}
        <TabsContent value="encounters">
          {patient.encounters.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="py-12 text-center">
                <Stethoscope className="mx-auto h-10 w-10 text-slate-300" />
                <p className="mt-3 text-sm text-slate-500">
                  No encounters recorded with this patient.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {patient.encounters.map((enc) => (
                <Card key={enc.id} className="border shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-100">
                          {enc.is_telehealth ? (
                            <Video className="h-4 w-4 text-violet-500" />
                          ) : (
                            <Stethoscope className="h-4 w-4 text-slate-500" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {enc.chief_complaint || 'Encounter'}
                          </p>
                          <p className="text-xs text-slate-500">
                            {enc.check_in_time
                              ? formatDateTime(enc.check_in_time)
                              : formatDateTime(enc.created_at)}
                          </p>
                          {enc.diagnosis_codes && enc.diagnosis_codes.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {enc.diagnosis_codes.map((code, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {code}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <Badge variant={getEncounterStatusVariant(enc.status)}>
                        {formatStatus(enc.status)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Appointments Tab */}
        <TabsContent value="appointments">
          {patient.appointments.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="py-12 text-center">
                <Calendar className="mx-auto h-10 w-10 text-slate-300" />
                <p className="mt-3 text-sm text-slate-500">
                  No appointments recorded with this patient.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {patient.appointments.map((apt) => (
                <Card key={apt.id} className="border shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-slate-100">
                          {apt.is_telehealth ? (
                            <Video className="h-4 w-4 text-violet-500" />
                          ) : (
                            <Calendar className="h-4 w-4 text-amber-500" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {apt.appointment_type}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatDate(apt.scheduled_start)}
                          </p>
                          {apt.location && (
                            <span className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500">
                              <MapPin className="h-3 w-3" />
                              {apt.location}
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge variant={getAppointmentStatusVariant(apt.status)}>
                        {formatStatus(apt.status)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
