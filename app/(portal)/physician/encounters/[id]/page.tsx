import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getEncounterForPhysician } from '@/lib/actions/physician-clinical'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SoapNoteEditor } from '@/components/physician/encounters/soap-note-editor'
import { EncounterActions } from '@/components/physician/encounters/encounter-actions'
import { ENCOUNTER_STATUS_CONFIG } from '@/lib/validations/encounters'
import type { VitalSigns } from '@/lib/validations/encounters'
import { elementId } from '@/lib/utils/element-ids'
import { format } from 'date-fns'
import {
  ArrowLeft,
  Calendar,
  User,
  MapPin,
  Phone,
  Mail,
  Stethoscope,
  Video,
} from 'lucide-react'

interface PhysicianEncounterDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function PhysicianEncounterDetailPage({
  params,
}: PhysicianEncounterDetailPageProps) {
  const resolvedParams = await params
  const encounterId = resolvedParams.id

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const result = await getEncounterForPhysician(encounterId)

  if (!result.success) {
    notFound()
  }

  const encounter = result.data

  const formatDateTime = (dateStr: string | null | undefined): string => {
    if (!dateStr) return 'N/A'
    try {
      return format(new Date(dateStr), 'MMMM d, yyyy - h:mm a')
    } catch {
      return dateStr
    }
  }

  const formatDate = (dateStr: string | null | undefined): string => {
    if (!dateStr) return 'N/A'
    try {
      return format(new Date(dateStr), 'MMMM d, yyyy')
    } catch {
      return dateStr
    }
  }

  const statusConfig = ENCOUNTER_STATUS_CONFIG[encounter.status] ?? {
    label: encounter.status,
    variant: 'outline' as const,
  }

  const patientName = [encounter.patient_first_name, encounter.patient_last_name]
    .filter(Boolean)
    .join(' ') || 'Unknown Patient'

  const vitals = encounter.vitals as VitalSigns | null
  const hasVitals =
    vitals &&
    (vitals.blood_pressure_systolic != null ||
      vitals.heart_rate != null ||
      vitals.respiratory_rate != null ||
      vitals.temperature != null ||
      vitals.oxygen_saturation != null)

  const isReadOnly = encounter.status === 'completed' || encounter.status === 'cancelled'

  return (
    <div id={elementId('physician-encounter-detail', 'container')}>
      {/* Back Navigation */}
      <Link href="/physician/encounters">
        <Button variant="ghost" className="gap-2 text-gray-600 mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Encounters
        </Button>
      </Link>

      {/* Encounter Header */}
      <div className="mb-6">
        <div className="flex items-start gap-3 mb-2 flex-wrap">
          <h1 className="text-2xl font-bold text-gray-900">
            Patient Encounter
          </h1>
          <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
          {encounter.is_telehealth && (
            <Badge variant="outline" className="gap-1">
              <Video className="h-3 w-3" />
              Telehealth
            </Badge>
          )}
        </div>
        <p className="text-gray-600">
          {formatDateTime(encounter.check_in_time)}
        </p>
      </div>

      {/* Action Bar */}
      <div className="mb-6">
        <EncounterActions
          encounterId={encounterId}
          status={encounter.status}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chief Complaint */}
          {encounter.chief_complaint && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Chief Complaint</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">{encounter.chief_complaint}</p>
              </CardContent>
            </Card>
          )}

          {/* SOAP Notes Editor */}
          <SoapNoteEditor
            encounterId={encounterId}
            initialSubjective={encounter.subjective ?? null}
            initialObjective={encounter.objective ?? null}
            initialAssessment={encounter.assessment ?? null}
            initialPlan={encounter.plan ?? null}
            readOnly={isReadOnly}
          />

          {/* Vitals Summary */}
          {hasVitals && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Vital Signs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {vitals.blood_pressure_systolic != null &&
                    vitals.blood_pressure_diastolic != null && (
                      <VitalItem
                        label="Blood Pressure"
                        value={`${vitals.blood_pressure_systolic}/${vitals.blood_pressure_diastolic}`}
                        unit="mmHg"
                      />
                    )}
                  {vitals.heart_rate != null && (
                    <VitalItem label="Heart Rate" value={String(vitals.heart_rate)} unit="bpm" />
                  )}
                  {vitals.respiratory_rate != null && (
                    <VitalItem label="Respiratory Rate" value={String(vitals.respiratory_rate)} unit="breaths/min" />
                  )}
                  {vitals.temperature != null && (
                    <VitalItem
                      label="Temperature"
                      value={String(vitals.temperature)}
                      unit={`\u00B0${vitals.temperature_unit ?? 'F'}`}
                    />
                  )}
                  {vitals.oxygen_saturation != null && (
                    <VitalItem label="SpO2" value={String(vitals.oxygen_saturation)} unit="%" />
                  )}
                  {vitals.weight_lbs != null && (
                    <VitalItem label="Weight" value={String(vitals.weight_lbs)} unit="lbs" />
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Follow-up Info */}
          {(encounter.follow_up_date || encounter.follow_up_instructions) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Follow-Up</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {encounter.follow_up_date && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                      Follow-Up Date
                    </p>
                    <p className="text-sm text-gray-900">{formatDate(encounter.follow_up_date)}</p>
                  </div>
                )}
                {encounter.follow_up_instructions && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                      Instructions
                    </p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {encounter.follow_up_instructions}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar (1/3) */}
        <div className="space-y-6">
          {/* Patient Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <User className="h-6 w-6 text-gray-400" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{patientName}</p>
                  {encounter.patient_dob && (
                    <p className="text-xs text-gray-500">
                      DOB: {formatDate(encounter.patient_dob)}
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              {encounter.patient_email && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>{encounter.patient_email}</span>
                </div>
              )}

              {encounter.patient_phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{encounter.patient_phone}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Encounter Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Encounter Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <DetailField
                label="Check-In"
                value={formatDateTime(encounter.check_in_time)}
              />
              {encounter.check_out_time && (
                <DetailField
                  label="Check-Out"
                  value={formatDateTime(encounter.check_out_time)}
                />
              )}
              {encounter.location_detail && (
                <div className="flex items-start gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">{encounter.location_detail.name}</p>
                    {encounter.location_detail.city && (
                      <p className="text-gray-500">
                        {encounter.location_detail.city}
                        {encounter.location_detail.state ? `, ${encounter.location_detail.state}` : ''}
                      </p>
                    )}
                  </div>
                </div>
              )}
              {encounter.appointment && (
                <DetailField
                  label="Appointment"
                  value={encounter.appointment.title ?? encounter.appointment.appointment_type}
                />
              )}
              {encounter.diagnosis_codes && encounter.diagnosis_codes.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                    Diagnosis Codes
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {encounter.diagnosis_codes.map((code) => (
                      <Badge key={code} variant="outline" className="font-mono text-xs">
                        {code}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

// ============================================
// Helper components
// ============================================

function VitalItem({
  label,
  value,
  unit,
}: {
  label: string
  value: string
  unit: string
}) {
  return (
    <div className="p-3 rounded-lg border border-gray-100 bg-gray-50/50">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className="text-xl font-semibold text-gray-900">
        {value}
        <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>
      </p>
    </div>
  )
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-0.5">
        {label}
      </p>
      <p className="text-sm text-gray-900">{value}</p>
    </div>
  )
}
