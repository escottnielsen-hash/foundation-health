'use client'

import { useState, useEffect, useTransition, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { AvatarRoot, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useBookingStore,
  type ProviderWithProfile,
  type BookingStep,
} from '@/lib/stores/booking-store'
import {
  getAvailableServices,
  getAvailableProviders,
  getAvailableTimeSlots,
  createAppointment,
} from '@/lib/actions/appointments'
import { SelectLocationStep } from '@/components/patient/appointments/select-location-step'
import type { ServiceCatalog } from '@/types/database'
import type { TimeSlot } from '@/lib/actions/appointments'
import { format } from 'date-fns'

// ============================================
// Props
// ============================================

interface BookingFlowProps {
  userId: string
}

// ============================================
// Step indicator
// ============================================

const STEPS: { step: BookingStep; label: string }[] = [
  { step: 1, label: 'Location' },
  { step: 2, label: 'Service' },
  { step: 3, label: 'Provider' },
  { step: 4, label: 'Date & Time' },
  { step: 5, label: 'Confirm' },
]

function StepIndicator({ currentStep }: { currentStep: BookingStep }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map(({ step, label }, index) => (
        <div key={step} className="flex items-center">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step === currentStep
                  ? 'bg-primary-600 text-white'
                  : step < currentStep
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {step < currentStep ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                step
              )}
            </div>
            <span
              className={`text-sm font-medium hidden sm:inline ${
                step === currentStep ? 'text-primary-700' : 'text-gray-400'
              }`}
            >
              {label}
            </span>
          </div>
          {index < STEPS.length - 1 && (
            <div
              className={`w-8 sm:w-12 h-px mx-2 ${
                step < currentStep ? 'bg-primary-300' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}

// ============================================
// Step 2: Select Service (was Step 1)
// ============================================

function SelectServiceStep() {
  const [services, setServices] = useState<ServiceCatalog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { selectedLocation, selectedService, setService, nextStep, prevStep } = useBookingStore()

  useEffect(() => {
    async function load() {
      setLoading(true)
      const locationId = selectedLocation?.id
      const result = await getAvailableServices(locationId)
      if (result.success) {
        setServices(result.data)
      } else {
        setError(result.error)
      }
      setLoading(false)
    }
    load()
  }, [selectedLocation?.id])

  function handleSelect(service: ServiceCatalog) {
    setService(service)
    nextStep()
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (services.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            No services available
          </h3>
          <p className="text-gray-500 text-sm">
            There are currently no services available for booking. Please check back later.
          </p>
          <Button variant="outline" className="mt-4" onClick={prevStep}>
            Go Back
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Select a Service
        </h2>
        <Button variant="ghost" size="sm" onClick={prevStep}>
          Back
        </Button>
      </div>
      <div className="space-y-3">
        {services.map((service) => (
          <Card
            key={service.id}
            className={`cursor-pointer transition-all hover:border-primary-300 hover:shadow-md ${
              selectedService?.id === service.id
                ? 'border-primary-500 ring-2 ring-primary-100'
                : ''
            }`}
            onClick={() => handleSelect(service)}
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-gray-900 mb-1">
                    {service.name}
                  </h3>
                  {service.description && (
                    <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                      {service.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    {service.duration_minutes && (
                      <span>{service.duration_minutes} min</span>
                    )}
                    {service.category && (
                      <Badge variant="outline" className="text-[10px]">
                        {service.category.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                      </Badge>
                    )}
                    {service.is_telehealth_eligible && (
                      <Badge variant="outline" className="text-[10px]">
                        Telehealth Eligible
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-semibold text-gray-900">
                    ${service.base_price.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// ============================================
// Step 3: Select Provider (was Step 2)
// ============================================

function SelectProviderStep() {
  const [providers, setProviders] = useState<ProviderWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { selectedLocation, selectedService, selectedProvider, setProvider, nextStep, prevStep } =
    useBookingStore()

  useEffect(() => {
    async function load() {
      setLoading(true)
      const locationId = selectedLocation?.id
      const result = await getAvailableProviders(selectedService?.id, locationId)
      if (result.success) {
        setProviders(result.data as unknown as ProviderWithProfile[])
      } else {
        setError(result.error)
      }
      setLoading(false)
    }
    load()
  }, [selectedService?.id, selectedLocation?.id])

  function handleSelect(provider: ProviderWithProfile) {
    setProvider(provider)
    nextStep()
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (providers.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            No providers available
          </h3>
          <p className="text-gray-500 text-sm">
            There are currently no providers available for this service.
          </p>
          <Button variant="outline" className="mt-4" onClick={prevStep}>
            Go Back
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Select a Provider
        </h2>
        <Button variant="ghost" size="sm" onClick={prevStep}>
          Back
        </Button>
      </div>
      <div className="space-y-3">
        {providers.map((provider) => {
          const name = `Dr. ${provider.profile.first_name ?? ''} ${provider.profile.last_name ?? ''}`.trim()
          const initials = `${(provider.profile.first_name ?? '')[0] ?? ''}${(provider.profile.last_name ?? '')[0] ?? ''}`.toUpperCase()

          return (
            <Card
              key={provider.id}
              className={`cursor-pointer transition-all hover:border-primary-300 hover:shadow-md ${
                selectedProvider?.id === provider.id
                  ? 'border-primary-500 ring-2 ring-primary-100'
                  : ''
              }`}
              onClick={() => handleSelect(provider)}
            >
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <AvatarRoot className="h-12 w-12">
                    <AvatarImage
                      src={provider.profile.avatar_url ?? undefined}
                      alt={name}
                    />
                    <AvatarFallback className="bg-primary-100 text-primary-700 font-semibold">
                      {initials || 'DR'}
                    </AvatarFallback>
                  </AvatarRoot>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-900">
                      {name}
                    </h3>
                    {provider.specialty && (
                      <p className="text-sm text-gray-500">{provider.specialty}</p>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    {provider.accepting_new_patients && (
                      <Badge variant="success" className="text-xs">
                        Accepting Patients
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

// ============================================
// Step 4: Select Date & Time (was Step 3)
// ============================================

function SelectDateTimeStep() {
  const { selectedLocation, selectedProvider, selectedDate, selectedTime, setDateTime, nextStep, prevStep } =
    useBookingStore()
  const [date, setDate] = useState(selectedDate ?? '')
  const [time, setTime] = useState(selectedTime ?? '')
  const [slots, setSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get the minimum date (today)
  const today = new Date()
  const minDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  // Get max date (3 months from now)
  const maxDateObj = new Date(today)
  maxDateObj.setMonth(maxDateObj.getMonth() + 3)
  const maxDate = `${maxDateObj.getFullYear()}-${String(maxDateObj.getMonth() + 1).padStart(2, '0')}-${String(maxDateObj.getDate()).padStart(2, '0')}`

  const loadSlots = useCallback(async (selectedDateStr: string) => {
    if (!selectedProvider?.id || !selectedDateStr) return
    setLoading(true)
    setError(null)
    setTime('')
    const locationId = selectedLocation?.id
    const result = await getAvailableTimeSlots(selectedProvider.id, selectedDateStr, locationId)
    if (result.success) {
      setSlots(result.data)
    } else {
      setError(result.error)
    }
    setLoading(false)
  }, [selectedProvider?.id, selectedLocation?.id])

  useEffect(() => {
    if (date) {
      loadSlots(date)
    }
  }, [date, loadSlots])

  function handleDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    setDate(e.target.value)
  }

  function handleTimeSelect(slotTime: string) {
    setTime(slotTime)
  }

  function handleNext() {
    if (date && time) {
      setDateTime(date, time)
      nextStep()
    }
  }

  function formatTimeLabel(t: string): string {
    const [hoursStr, minutesStr] = t.split(':')
    const hours = parseInt(hoursStr, 10)
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours
    return `${displayHour}:${minutesStr} ${ampm}`
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Select Date & Time
        </h2>
        <Button variant="ghost" size="sm" onClick={prevStep}>
          Back
        </Button>
      </div>

      {/* Date picker */}
      <Card className="mb-6">
        <CardContent className="p-5">
          <Label htmlFor="appointment-date" className="mb-2 block">
            Choose a Date
          </Label>
          <input
            id="appointment-date"
            type="date"
            value={date}
            min={minDate}
            max={maxDate}
            onChange={handleDateChange}
            className="flex h-11 w-full max-w-xs rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </CardContent>
      </Card>

      {/* Time slots */}
      {date && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Available Times for {format(new Date(date + 'T12:00:00'), 'EEEE, MMMM d, yyyy')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {Array.from({ length: 12 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 rounded-lg" />
                ))}
              </div>
            ) : error ? (
              <p className="text-red-600 text-sm">{error}</p>
            ) : slots.filter((s) => s.available).length === 0 ? (
              <p className="text-gray-500 text-sm">
                No available time slots for this date. Please select another date.
              </p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {slots.map((slot) => (
                  <button
                    key={slot.time}
                    type="button"
                    disabled={!slot.available}
                    onClick={() => handleTimeSelect(slot.time)}
                    className={`h-10 rounded-lg text-sm font-medium transition-all ${
                      time === slot.time
                        ? 'bg-primary-600 text-white ring-2 ring-primary-300'
                        : slot.available
                        ? 'bg-white border border-gray-300 text-gray-700 hover:border-primary-300 hover:bg-primary-50'
                        : 'bg-gray-50 text-gray-300 cursor-not-allowed border border-gray-100'
                    }`}
                  >
                    {formatTimeLabel(slot.time)}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Next button */}
      {date && time && (
        <div className="mt-6 flex justify-end">
          <Button onClick={handleNext}>
            Continue to Review
          </Button>
        </div>
      )}
    </div>
  )
}

// ============================================
// Step 5: Confirm & Book (was Step 4)
// ============================================

function ConfirmBookingStep({ userId }: { userId: string }) {
  const {
    selectedLocation,
    selectedService,
    selectedProvider,
    selectedDate,
    selectedTime,
    notes,
    setNotes,
    prevStep,
    reset,
  } = useBookingStore()
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function formatTimeLabel(t: string): string {
    const [hoursStr, minutesStr] = t.split(':')
    const hours = parseInt(hoursStr, 10)
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours
    return `${displayHour}:${minutesStr} ${ampm}`
  }

  function handleBook() {
    if (!selectedService || !selectedProvider || !selectedDate || !selectedTime) {
      setError('Missing required booking information. Please go back and complete all steps.')
      return
    }

    setError(null)
    startTransition(async () => {
      const result = await createAppointment(userId, {
        service_id: selectedService.id,
        provider_id: selectedProvider.id,
        appointment_date: selectedDate,
        appointment_time: selectedTime,
        location_id: selectedLocation?.id ?? undefined,
        notes: notes || undefined,
      })

      if (result.success) {
        reset()
        router.push(`/patient/appointments/${result.data.appointmentId}`)
      } else {
        setError(result.error)
      }
    })
  }

  const providerName = selectedProvider
    ? `Dr. ${selectedProvider.profile.first_name ?? ''} ${selectedProvider.profile.last_name ?? ''}`.trim()
    : 'Unknown'

  const locationLabel = selectedLocation
    ? [selectedLocation.name, selectedLocation.city, selectedLocation.state].filter(Boolean).join(', ')
    : 'Any Location'

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Review & Confirm
        </h2>
        <Button variant="ghost" size="sm" onClick={prevStep}>
          Back
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Appointment Summary</CardTitle>
          <CardDescription>
            Please review the details below before confirming your booking.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Location */}
          <div>
            <p className="text-sm font-medium text-gray-500">Location</p>
            <p className="text-gray-900 font-semibold">{locationLabel}</p>
          </div>

          <Separator />

          {/* Service */}
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Service</p>
              <p className="text-gray-900 font-semibold">
                {selectedService?.name ?? 'N/A'}
              </p>
              {selectedService?.duration_minutes && (
                <p className="text-xs text-gray-500">
                  {selectedService.duration_minutes} minutes
                </p>
              )}
            </div>
            {selectedService && (
              <p className="text-lg font-semibold text-gray-900">
                ${selectedService.base_price.toFixed(2)}
              </p>
            )}
          </div>

          <Separator />

          {/* Provider */}
          <div>
            <p className="text-sm font-medium text-gray-500">Provider</p>
            <p className="text-gray-900 font-semibold">{providerName}</p>
            {selectedProvider?.specialty && (
              <p className="text-xs text-gray-500">{selectedProvider.specialty}</p>
            )}
          </div>

          <Separator />

          {/* Date & Time */}
          <div>
            <p className="text-sm font-medium text-gray-500">Date & Time</p>
            <p className="text-gray-900 font-semibold">
              {selectedDate
                ? format(new Date(selectedDate + 'T12:00:00'), 'EEEE, MMMM d, yyyy')
                : 'N/A'}
            </p>
            <p className="text-sm text-gray-600">
              {selectedTime ? formatTimeLabel(selectedTime) : 'N/A'}
            </p>
          </div>

          <Separator />

          {/* Notes */}
          <div>
            <Label htmlFor="booking-notes" className="mb-2 block">
              Additional Notes (Optional)
            </Label>
            <Textarea
              id="booking-notes"
              placeholder="Any special requests, symptoms, or information for your provider..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 mb-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={prevStep} disabled={isPending}>
          Go Back
        </Button>
        <Button onClick={handleBook} disabled={isPending}>
          {isPending ? 'Booking...' : 'Confirm Booking'}
        </Button>
      </div>
    </div>
  )
}

// ============================================
// Main Booking Flow Component
// ============================================

export function BookingFlow({ userId }: BookingFlowProps) {
  const { currentStep, reset } = useBookingStore()

  // Reset store on mount so a fresh visit starts clean
  useEffect(() => {
    reset()
  }, [reset])

  return (
    <div>
      <StepIndicator currentStep={currentStep} />

      {currentStep === 1 && <SelectLocationStep />}
      {currentStep === 2 && <SelectServiceStep />}
      {currentStep === 3 && <SelectProviderStep />}
      {currentStep === 4 && <SelectDateTimeStep />}
      {currentStep === 5 && <ConfirmBookingStep userId={userId} />}
    </div>
  )
}
