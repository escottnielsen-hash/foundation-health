import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  getEncounterById,
  getEncounterDiagnoses,
  getEncounterProcedures,
} from '@/lib/actions/encounters'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SoapNotes } from '@/components/patient/soap-notes'
import { elementId } from '@/lib/utils/element-ids'
import {
  ENCOUNTER_TYPES,
  ENCOUNTER_STATUS_CONFIG,
} from '@/lib/validations/encounters'
import type { VitalSigns } from '@/lib/validations/encounters'
import { format } from 'date-fns'

interface EncounterDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function EncounterDetailPage({
  params,
}: EncounterDetailPageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const resolvedParams = await params
  const encounterId = resolvedParams.id

  // Fetch encounter detail, diagnoses, and procedures in parallel
  const [encounterResult, diagnosesResult, proceduresResult] = await Promise.all([
    getEncounterById(encounterId, user.id),
    getEncounterDiagnoses(encounterId),
    getEncounterProcedures(encounterId),
  ])

  if (!encounterResult.success) {
    notFound()
  }

  const encounter = encounterResult.data
  const diagnoses = diagnosesResult.success ? diagnosesResult.data : []
  const procedures = proceduresResult.success ? proceduresResult.data : []

  // Parse vitals as VitalSigns if present
  const vitals = encounter.vitals as VitalSigns | null

  const formatDateTime = (dateStr: string | null | undefined): string => {
    if (!dateStr) return 'N/A'
    try {
      return format(new Date(dateStr), 'MMMM d, yyyy — h:mm a')
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

  const getEncounterTypeLabel = (type: string | null): string => {
    if (!type) return 'Visit'
    const found = ENCOUNTER_TYPES.find((et) => et.value === type)
    return found
      ? found.label
      : type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  }

  const statusConfig = ENCOUNTER_STATUS_CONFIG[encounter.status] ?? {
    label: encounter.status,
    variant: 'outline' as const,
  }

  const hasVitals =
    vitals &&
    (vitals.blood_pressure_systolic ||
      vitals.heart_rate ||
      vitals.respiratory_rate ||
      vitals.temperature ||
      vitals.oxygen_saturation ||
      vitals.weight_lbs ||
      vitals.height_inches ||
      vitals.pain_level !== undefined)

  return (
    <div id={elementId('encounter-detail', 'page', 'container')}>
      {/* Back Navigation */}
      <div id={elementId('encounter-detail', 'back')} className="mb-6">
        <Link href="/patient/encounters">
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
            Back to Encounters
          </Button>
        </Link>
      </div>

      {/* Encounter Header */}
      <div id={elementId('encounter-detail', 'header')} className="mb-8">
        <div className="flex items-start gap-3 mb-2">
          <h1 className="text-3xl font-bold text-gray-900">
            {getEncounterTypeLabel(encounter.encounter_type)}
          </h1>
          <Badge variant={statusConfig.variant} className="mt-1.5">
            {statusConfig.label}
          </Badge>
          {encounter.is_telehealth && (
            <Badge variant="outline" className="mt-1.5">
              Telehealth
            </Badge>
          )}
        </div>
        <p className="text-gray-600">
          {formatDateTime(encounter.check_in_time)}
          {encounter.provider_name && (
            <span className="ml-2">
              with Dr. {encounter.provider_name}
              {encounter.provider_specialty && (
                <span className="text-gray-400"> ({encounter.provider_specialty})</span>
              )}
            </span>
          )}
        </p>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="clinical-notes">Clinical Notes</TabsTrigger>
          <TabsTrigger value="diagnoses">
            Diagnoses{diagnoses.length > 0 && ` (${diagnoses.length})`}
          </TabsTrigger>
          <TabsTrigger value="procedures">
            Procedures{procedures.length > 0 && ` (${procedures.length})`}
          </TabsTrigger>
          <TabsTrigger value="vitals">Vitals</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <Card id={elementId('encounter-detail', 'overview', 'card')}>
            <CardHeader>
              <CardTitle>Encounter Overview</CardTitle>
              <CardDescription>
                General information about this clinical encounter
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <MetadataField
                  label="Date"
                  value={formatDateTime(encounter.check_in_time)}
                />
                <MetadataField
                  label="Provider"
                  value={
                    encounter.provider_name
                      ? `Dr. ${encounter.provider_name}`
                      : 'N/A'
                  }
                />
                <MetadataField
                  label="Encounter Type"
                  value={getEncounterTypeLabel(encounter.encounter_type)}
                />
                <MetadataField
                  label="Status"
                  value={statusConfig.label}
                />
                {encounter.location_detail && (
                  <MetadataField
                    label="Location"
                    value={`${encounter.location_detail.name}${
                      encounter.location_detail.city
                        ? `, ${encounter.location_detail.city}`
                        : ''
                    }${
                      encounter.location_detail.state
                        ? `, ${encounter.location_detail.state}`
                        : ''
                    }`}
                  />
                )}
                {encounter.appointment && (
                  <MetadataField
                    label="Linked Appointment"
                    value={
                      encounter.appointment.title ??
                      `${encounter.appointment.appointment_type} — ${formatDate(encounter.appointment.scheduled_start)}`
                    }
                  />
                )}
                {encounter.check_out_time && (
                  <MetadataField
                    label="Check-Out Time"
                    value={formatDateTime(encounter.check_out_time)}
                  />
                )}
                {encounter.follow_up_date && (
                  <MetadataField
                    label="Follow-Up Date"
                    value={formatDate(encounter.follow_up_date)}
                  />
                )}
                {encounter.follow_up_instructions && (
                  <div className="md:col-span-2 lg:col-span-3">
                    <MetadataField
                      label="Follow-Up Instructions"
                      value={encounter.follow_up_instructions}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Clinical Notes Tab */}
        <TabsContent value="clinical-notes">
          <SoapNotes
            chiefComplaint={encounter.chief_complaint ?? null}
            subjective={encounter.subjective ?? null}
            objective={encounter.objective ?? null}
            assessment={encounter.assessment ?? null}
            plan={encounter.plan ?? null}
            visitNotes={encounter.visit_notes ?? null}
          />
        </TabsContent>

        {/* Diagnoses Tab */}
        <TabsContent value="diagnoses">
          {diagnoses.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-gray-500 text-sm">
                  No diagnosis codes have been recorded for this encounter.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card id={elementId('encounter-detail', 'diagnoses', 'card')}>
              <CardHeader>
                <CardTitle>Diagnosis Codes (ICD-10)</CardTitle>
                <CardDescription>
                  Diagnoses identified during this encounter
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {diagnoses.map((dx) => (
                    <div
                      key={dx.code}
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50/50"
                    >
                      <Badge variant="outline" className="font-mono text-xs">
                        {dx.code}
                      </Badge>
                      <span className="text-sm text-gray-700">
                        {dx.description ?? 'No description available'}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Procedures Tab */}
        <TabsContent value="procedures">
          {procedures.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-gray-500 text-sm">
                  No procedure codes have been recorded for this encounter.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card id={elementId('encounter-detail', 'procedures', 'card')}>
              <CardHeader>
                <CardTitle>Procedure Codes (CPT)</CardTitle>
                <CardDescription>
                  Procedures performed during this encounter
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {procedures.map((proc) => (
                    <div
                      key={proc.code}
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 bg-gray-50/50"
                    >
                      <Badge variant="outline" className="font-mono text-xs">
                        {proc.code}
                      </Badge>
                      <span className="text-sm text-gray-700">
                        {proc.description ?? 'No description available'}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Vitals Tab */}
        <TabsContent value="vitals">
          {!hasVitals ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-gray-500 text-sm">
                  No vital signs have been recorded for this encounter.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card id={elementId('encounter-detail', 'vitals', 'card')}>
              <CardHeader>
                <CardTitle>Vital Signs</CardTitle>
                <CardDescription>
                  Measurements recorded during this encounter
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {vitals.blood_pressure_systolic != null &&
                    vitals.blood_pressure_diastolic != null && (
                      <VitalCard
                        label="Blood Pressure"
                        value={`${vitals.blood_pressure_systolic}/${vitals.blood_pressure_diastolic}`}
                        unit="mmHg"
                        icon="heart"
                      />
                    )}
                  {vitals.heart_rate != null && (
                    <VitalCard
                      label="Heart Rate"
                      value={String(vitals.heart_rate)}
                      unit="bpm"
                      icon="pulse"
                    />
                  )}
                  {vitals.respiratory_rate != null && (
                    <VitalCard
                      label="Respiratory Rate"
                      value={String(vitals.respiratory_rate)}
                      unit="breaths/min"
                      icon="lungs"
                    />
                  )}
                  {vitals.temperature != null && (
                    <VitalCard
                      label="Temperature"
                      value={String(vitals.temperature)}
                      unit={`\u00B0${vitals.temperature_unit ?? 'F'}`}
                      icon="thermometer"
                    />
                  )}
                  {vitals.oxygen_saturation != null && (
                    <VitalCard
                      label="Oxygen Saturation"
                      value={String(vitals.oxygen_saturation)}
                      unit="%"
                      icon="oxygen"
                    />
                  )}
                  {vitals.weight_lbs != null && (
                    <VitalCard
                      label="Weight"
                      value={String(vitals.weight_lbs)}
                      unit="lbs"
                      icon="scale"
                    />
                  )}
                  {vitals.height_inches != null && (
                    <VitalCard
                      label="Height"
                      value={formatHeight(vitals.height_inches)}
                      unit=""
                      icon="ruler"
                    />
                  )}
                  {vitals.bmi != null && (
                    <VitalCard
                      label="BMI"
                      value={vitals.bmi.toFixed(1)}
                      unit="kg/m\u00B2"
                      icon="calculator"
                    />
                  )}
                  {vitals.pain_level != null && (
                    <VitalCard
                      label="Pain Level"
                      value={String(vitals.pain_level)}
                      unit="/ 10"
                      icon="pain"
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ============================================
// Helper components
// ============================================

function MetadataField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">{value}</dd>
    </div>
  )
}

function VitalCard({
  label,
  value,
  unit,
}: {
  label: string
  value: string
  unit: string
  icon: string
}) {
  return (
    <div className="p-4 rounded-lg border border-gray-100 bg-gray-50/50">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className="text-2xl font-semibold text-gray-900">
        {value}
        {unit && (
          <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>
        )}
      </p>
    </div>
  )
}

function formatHeight(inches: number): string {
  const feet = Math.floor(inches / 12)
  const remainingInches = inches % 12
  return `${feet}'${remainingInches}"`
}
