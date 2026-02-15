'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectItem } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { elementId, formId, inputId, btnId } from '@/lib/utils/element-ids'
import { cn } from '@/lib/utils/cn'
import {
  Video,
  Calendar,
  Stethoscope,
  MapPin,
  FileText,
  Shield,
  Loader2,
  ArrowLeft,
} from 'lucide-react'
import { requestTelemedicineSession } from '@/lib/actions/telemedicine'
import type { SessionType } from '@/types/database'

// ============================================
// Constants
// ============================================

const SESSION_TYPES: { value: SessionType; label: string; description: string }[] = [
  {
    value: 'pre_op_consult',
    label: 'Pre-Op Consultation',
    description: 'Discuss your upcoming procedure before traveling to our facility.',
  },
  {
    value: 'post_op_followup',
    label: 'Post-Op Follow-Up',
    description: 'Follow-up appointment after your procedure, from the comfort of home.',
  },
  {
    value: 'general_consult',
    label: 'General Consultation',
    description: 'General discussion with your physician about your health concerns.',
  },
  {
    value: 'second_opinion',
    label: 'Second Opinion',
    description: 'Get an expert second opinion on a diagnosis or treatment plan.',
  },
  {
    value: 'urgent_care',
    label: 'Urgent Care',
    description: 'For time-sensitive concerns that require prompt medical attention.',
  },
]

const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
  { value: 'DC', label: 'District of Columbia' },
]

interface Provider {
  id: string
  full_name: string
  specialty: string | null
}

interface SessionRequestFormProps {
  providers: Provider[]
  patientId: string
}

// ============================================
// Component
// ============================================

export function SessionRequestForm({ providers, patientId }: SessionRequestFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [sessionType, setSessionType] = useState<SessionType | ''>('')
  const [physicianId, setPhysicianId] = useState('')
  const [preferredDate, setPreferredDate] = useState('')
  const [preferredTime, setPreferredTime] = useState('')
  const [chiefComplaint, setChiefComplaint] = useState('')
  const [patientState, setPatientState] = useState('')
  const [consentGiven, setConsentGiven] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    if (!sessionType) {
      setFieldErrors({ session_type: 'Please select a session type' })
      return
    }
    if (!physicianId) {
      setFieldErrors({ physician_id: 'Please select a physician' })
      return
    }
    if (!preferredDate) {
      setFieldErrors({ preferred_date: 'Please select a date' })
      return
    }
    if (!preferredTime) {
      setFieldErrors({ preferred_time: 'Please select a time' })
      return
    }
    if (!chiefComplaint.trim()) {
      setFieldErrors({ chief_complaint: 'Please describe your reason for the visit' })
      return
    }
    if (!patientState) {
      setFieldErrors({ patient_state: 'Please select your current state' })
      return
    }
    if (!consentGiven) {
      setFieldErrors({ consent: 'You must consent to telemedicine services' })
      return
    }

    const scheduledStart = `${preferredDate}T${preferredTime}:00`

    startTransition(async () => {
      const result = await requestTelemedicineSession({
        physician_id: physicianId,
        session_type: sessionType as 'pre_op_consult' | 'post_op_followup' | 'general_consult' | 'second_opinion' | 'urgent_care',
        scheduled_start: scheduledStart,
        scheduled_duration_minutes: 30,
        chief_complaint: chiefComplaint.trim(),
        patient_state: patientState,
      })

      if (!result.success) {
        setError(result.error)
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors)
        }
        return
      }

      router.push('/patient/telemedicine')
      router.refresh()
    })
  }

  // Generate minimum date (today)
  const today = new Date().toISOString().split('T')[0]

  return (
    <form
      id={formId('telemedicine-request')}
      onSubmit={handleSubmit}
      className="space-y-8"
    >
      {/* Back button */}
      <Button
        type="button"
        variant="ghost"
        onClick={() => router.push('/patient/telemedicine')}
        className="gap-2 text-gray-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Sessions
      </Button>

      {/* Error banner */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Session Type Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Video className="h-5 w-5 text-primary-600" />
            <CardTitle className="text-lg">Session Type</CardTitle>
          </div>
          <CardDescription>Select the type of telemedicine visit you need.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SESSION_TYPES.map((st) => (
              <button
                key={st.value}
                type="button"
                onClick={() => setSessionType(st.value)}
                className={cn(
                  'flex flex-col items-start rounded-xl border-2 p-4 text-left transition-all',
                  sessionType === st.value
                    ? 'border-primary-600 bg-primary-50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                )}
              >
                <span
                  className={cn(
                    'text-sm font-semibold',
                    sessionType === st.value
                      ? 'text-primary-700'
                      : 'text-gray-900'
                  )}
                >
                  {st.label}
                </span>
                <span className="text-xs text-gray-500 mt-1">{st.description}</span>
              </button>
            ))}
          </div>
          {fieldErrors.session_type && (
            <p className="mt-2 text-sm text-red-500">{fieldErrors.session_type}</p>
          )}
        </CardContent>
      </Card>

      {/* Physician Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-primary-600" />
            <CardTitle className="text-lg">Preferred Physician</CardTitle>
          </div>
          <CardDescription>Choose the physician you would like to meet with.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-md">
            <Select
              id={inputId('physician')}
              value={physicianId}
              onChange={(e) => setPhysicianId(e.target.value)}
              error={fieldErrors.physician_id}
            >
              <option value="">Select a physician</option>
              {providers.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  Dr. {p.full_name}
                  {p.specialty ? ` - ${p.specialty}` : ''}
                </SelectItem>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Date & Time */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary-600" />
            <CardTitle className="text-lg">Preferred Date & Time</CardTitle>
          </div>
          <CardDescription>Select your preferred date and time slot. We will confirm availability.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 max-w-md">
            <div>
              <Label htmlFor={inputId('preferred-date')} required>
                Date
              </Label>
              <Input
                id={inputId('preferred-date')}
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                min={today}
                error={fieldErrors.preferred_date}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor={inputId('preferred-time')} required>
                Time
              </Label>
              <Input
                id={inputId('preferred-time')}
                type="time"
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                error={fieldErrors.preferred_time}
                className="mt-1.5"
              />
            </div>
          </div>
          <p className="mt-2 text-xs text-gray-400">
            All times are in your local timezone. Available hours: 8:00 AM - 6:00 PM EST.
          </p>
        </CardContent>
      </Card>

      {/* Chief Complaint */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary-600" />
            <CardTitle className="text-lg">Reason for Visit</CardTitle>
          </div>
          <CardDescription>Describe your primary concern or reason for this telemedicine session.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-lg">
            <Textarea
              id={inputId('chief-complaint')}
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              placeholder="Describe your symptoms, concerns, or the reason you are requesting this session..."
              rows={4}
              error={fieldErrors.chief_complaint}
            />
          </div>
        </CardContent>
      </Card>

      {/* State Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary-600" />
            <CardTitle className="text-lg">Your Current State</CardTitle>
          </div>
          <CardDescription>
            For licensing compliance, we need to know the state where you will be located during the session.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-md">
            <Select
              id={inputId('patient-state')}
              value={patientState}
              onChange={(e) => setPatientState(e.target.value)}
              error={fieldErrors.patient_state}
            >
              <option value="">Select your state</option>
              {US_STATES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Consent */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary-600" />
            <CardTitle className="text-lg">Telemedicine Consent</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 mb-4">
            <p className="text-sm text-gray-700 leading-relaxed">
              By proceeding, I acknowledge and consent to receiving healthcare services via
              telemedicine technology. I understand that telemedicine involves the use of electronic
              communications to enable healthcare providers at different locations to share
              individual patient medical information for the purpose of improving patient care.
              I understand that I have the right to withhold or withdraw consent at any time without
              affecting my right to future care or treatment.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id={inputId('consent')}
              checked={consentGiven}
              onCheckedChange={setConsentGiven}
            />
            <Label htmlFor={inputId('consent')} className="cursor-pointer">
              I consent to telemedicine services
            </Label>
          </div>
          {fieldErrors.consent && (
            <p className="mt-2 text-sm text-red-500">{fieldErrors.consent}</p>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Submit */}
      <div className="flex items-center justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/patient/telemedicine')}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button
          id={btnId('submit', 'telemedicine-request')}
          type="submit"
          disabled={isPending || !consentGiven}
          className="gap-2"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isPending ? 'Submitting...' : 'Submit Request'}
        </Button>
      </div>
    </form>
  )
}
