'use server'

import { createClient } from '@/lib/supabase/server'
import { bookingSchema, cancelSchema } from '@/lib/validations/appointments'
import type { BookingFormData } from '@/lib/validations/appointments'
import type {
  Appointment,
  ServiceCatalog,
  PhysicianProfile,
  Profile,
  Location,
} from '@/types/database'
import { ZodError } from 'zod'

// ============================================
// Result types
// ============================================

interface ActionSuccess<T> {
  success: true
  data: T
}

interface ActionError {
  success: false
  error: string
  fieldErrors?: Record<string, string>
}

type ActionResult<T> = ActionSuccess<T> | ActionError

// ============================================
// Extended types for joined queries
// ============================================

export interface AppointmentWithDetails extends Appointment {
  service_name: string | null
  service_duration: number | null
  provider_first_name: string | null
  provider_last_name: string | null
  provider_specialty: string | null
  provider_avatar_url: string | null
  location_name: string | null
  location_city: string | null
  location_state: string | null
  location_address_line1: string | null
  location_zip_code: string | null
  location_phone: string | null
  location_type: string | null
}

export interface ProviderWithProfile extends PhysicianProfile {
  profile: Pick<Profile, 'first_name' | 'last_name' | 'avatar_url'>
}

export interface TimeSlot {
  time: string
  available: boolean
}

/** Location data returned for the booking flow */
export interface BookingLocationData extends Pick<
  Location,
  'id' | 'name' | 'location_type' | 'city' | 'state' | 'address_line1' | 'address_line2' | 'zip_code' | 'phone' | 'is_active'
> {}

// ============================================
// getPatientAppointments
// ============================================

export async function getPatientAppointments(
  userId: string,
  filter: 'upcoming' | 'past'
): Promise<ActionResult<AppointmentWithDetails[]>> {
  try {
    const supabase = await createClient()

    // Get patient profile id
    const { data: patientProfile } = await supabase
      .from('patient_profiles')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (!patientProfile) {
      return { success: true, data: [] }
    }

    const now = new Date().toISOString()

    let query = supabase
      .from('appointments')
      .select(`
        *,
        provider:physician_profiles!appointments_physician_id_fkey(
          specialty,
          user_id,
          profiles:profiles!physician_profiles_user_id_fkey(
            first_name,
            last_name,
            avatar_url
          )
        ),
        appointment_location:locations(name, city, state, address_line1, zip_code, phone, location_type)
      `)
      .eq('patient_id', patientProfile.id)

    if (filter === 'upcoming') {
      query = query
        .gte('scheduled_start', now)
        .in('status', ['scheduled', 'confirmed'])
        .order('scheduled_start', { ascending: true })
    } else {
      query = query
        .or(`scheduled_start.lt.${now},status.in.(completed,cancelled,no_show)`)
        .order('scheduled_start', { ascending: false })
    }

    const { data: appointments, error } = await query

    if (error) {
      return {
        success: false,
        error: 'Could not load appointments. Please try again.',
      }
    }

    const mapped: AppointmentWithDetails[] = (appointments ?? []).map((apt) => {
      const rec = apt as Record<string, unknown>

      const provider = rec.provider as {
        specialty: string | null
        user_id: string
        profiles: {
          first_name: string | null
          last_name: string | null
          avatar_url: string | null
        }
      } | null

      const appointmentLocation = rec.appointment_location as {
        name: string
        city: string | null
        state: string | null
        address_line1: string | null
        zip_code: string | null
        phone: string | null
        location_type: string | null
      } | null

      const {
        provider: _p,
        appointment_location: _l,
        ...rest
      } = rec

      return {
        ...rest,
        service_name: (rec.title as string) ?? null,
        service_duration: null,
        provider_first_name: provider?.profiles?.first_name ?? null,
        provider_last_name: provider?.profiles?.last_name ?? null,
        provider_specialty: provider?.specialty ?? null,
        provider_avatar_url: provider?.profiles?.avatar_url ?? null,
        location_name: appointmentLocation?.name ?? null,
        location_city: appointmentLocation?.city ?? null,
        location_state: appointmentLocation?.state ?? null,
        location_address_line1: appointmentLocation?.address_line1 ?? null,
        location_zip_code: appointmentLocation?.zip_code ?? null,
        location_phone: appointmentLocation?.phone ?? null,
        location_type: appointmentLocation?.location_type ?? null,
      } as AppointmentWithDetails
    })

    return { success: true, data: mapped }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred while loading appointments.',
    }
  }
}

// ============================================
// getAppointmentById
// ============================================

export async function getAppointmentById(
  appointmentId: string,
  userId: string
): Promise<ActionResult<AppointmentWithDetails>> {
  try {
    const supabase = await createClient()

    // Get patient profile to verify ownership
    const { data: patientProfile } = await supabase
      .from('patient_profiles')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (!patientProfile) {
      return {
        success: false,
        error: 'Patient profile not found.',
      }
    }

    const { data: apt, error } = await supabase
      .from('appointments')
      .select(`
        *,
        provider:physician_profiles!appointments_physician_id_fkey(
          specialty,
          user_id,
          profiles:profiles!physician_profiles_user_id_fkey(
            first_name,
            last_name,
            avatar_url
          )
        ),
        appointment_location:locations(name, city, state, address_line1, zip_code, phone, location_type)
      `)
      .eq('id', appointmentId)
      .eq('patient_id', patientProfile.id)
      .single()

    if (error || !apt) {
      return {
        success: false,
        error: 'Appointment not found or you do not have access.',
      }
    }

    const rec = apt as Record<string, unknown>

    const provider = rec.provider as {
      specialty: string | null
      user_id: string
      profiles: {
        first_name: string | null
        last_name: string | null
        avatar_url: string | null
      }
    } | null

    const appointmentLocation = rec.appointment_location as {
      name: string
      city: string | null
      state: string | null
      address_line1: string | null
      zip_code: string | null
      phone: string | null
      location_type: string | null
    } | null

    const {
      provider: _p,
      appointment_location: _l,
      ...rest
    } = rec

    return {
      success: true,
      data: {
        ...rest,
        service_name: (rec.title as string) ?? null,
        service_duration: null,
        provider_first_name: provider?.profiles?.first_name ?? null,
        provider_last_name: provider?.profiles?.last_name ?? null,
        provider_specialty: provider?.specialty ?? null,
        provider_avatar_url: provider?.profiles?.avatar_url ?? null,
        location_name: appointmentLocation?.name ?? null,
        location_city: appointmentLocation?.city ?? null,
        location_state: appointmentLocation?.state ?? null,
        location_address_line1: appointmentLocation?.address_line1 ?? null,
        location_zip_code: appointmentLocation?.zip_code ?? null,
        location_phone: appointmentLocation?.phone ?? null,
        location_type: appointmentLocation?.location_type ?? null,
      } as AppointmentWithDetails,
    }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred while loading the appointment.',
    }
  }
}

// ============================================
// getBookingLocations
// ============================================

export async function getBookingLocations(): Promise<ActionResult<BookingLocationData[]>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('locations')
      .select('id, name, location_type, city, state, address_line1, address_line2, zip_code, phone, is_active')
      .eq('is_active', true)
      .in('location_type', ['hub', 'spoke'])
      .order('location_type', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      return {
        success: false,
        error: 'Could not load locations. Please try again.',
      }
    }

    return { success: true, data: (data ?? []) as BookingLocationData[] }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred while loading locations.',
    }
  }
}

// ============================================
// getAvailableServices
// ============================================

export async function getAvailableServices(
  locationId?: string
): Promise<ActionResult<ServiceCatalog[]>> {
  try {
    const supabase = await createClient()

    // If a locationId is provided, try to filter services by providers at that location
    // via provider_services + provider_locations junction tables
    if (locationId) {
      // Find service IDs offered by providers at the given location
      const { data: providerLocationData } = await supabase
        .from('provider_locations')
        .select('physician_id')
        .eq('location_id', locationId)

      if (providerLocationData && providerLocationData.length > 0) {
        const physicianIds = providerLocationData.map((pl) => pl.physician_id)

        const { data: providerServiceData } = await supabase
          .from('provider_services')
          .select('service_id')
          .in('physician_id', physicianIds)

        if (providerServiceData && providerServiceData.length > 0) {
          const serviceIds = [...new Set(providerServiceData.map((ps) => ps.service_id))]

          const { data, error } = await supabase
            .from('service_catalog')
            .select('*')
            .eq('is_active', true)
            .in('id', serviceIds)
            .order('sort_order', { ascending: true })
            .order('name', { ascending: true })

          if (error) {
            return {
              success: false,
              error: 'Could not load services. Please try again.',
            }
          }

          return { success: true, data: (data ?? []) as ServiceCatalog[] }
        }
      }

      // If no provider_services / provider_locations data is found,
      // fall through to return all active services as a graceful fallback
    }

    const { data, error } = await supabase
      .from('service_catalog')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      return {
        success: false,
        error: 'Could not load services. Please try again.',
      }
    }

    return { success: true, data: (data ?? []) as ServiceCatalog[] }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred while loading services.',
    }
  }
}

// ============================================
// getAvailableProviders
// ============================================

export async function getAvailableProviders(
  _serviceId?: string,
  locationId?: string
): Promise<ActionResult<ProviderWithProfile[]>> {
  try {
    const supabase = await createClient()

    // If a locationId is provided, filter providers using provider_locations junction
    if (locationId) {
      const { data: providerLocationData } = await supabase
        .from('provider_locations')
        .select('physician_id')
        .eq('location_id', locationId)

      if (providerLocationData && providerLocationData.length > 0) {
        const physicianIds = providerLocationData.map((pl) => pl.physician_id)

        const { data, error } = await supabase
          .from('physician_profiles')
          .select(`
            *,
            profile:profiles!physician_profiles_user_id_fkey(
              first_name,
              last_name,
              avatar_url
            )
          `)
          .eq('accepting_new_patients', true)
          .eq('is_verified', true)
          .in('id', physicianIds)

        if (error) {
          return {
            success: false,
            error: 'Could not load providers. Please try again.',
          }
        }

        const providers: ProviderWithProfile[] = (data ?? []).map((item) => {
          const rec = item as Record<string, unknown>
          const profileData = rec.profile as Pick<Profile, 'first_name' | 'last_name' | 'avatar_url'>
          const { profile: _removed, ...rest } = rec
          return {
            ...rest,
            profile: profileData,
          } as ProviderWithProfile
        })

        return { success: true, data: providers }
      }

      // No provider_locations data — fall through to return all providers
    }

    const { data, error } = await supabase
      .from('physician_profiles')
      .select(`
        *,
        profile:profiles!physician_profiles_user_id_fkey(
          first_name,
          last_name,
          avatar_url
        )
      `)
      .eq('accepting_new_patients', true)
      .eq('is_verified', true)

    if (error) {
      return {
        success: false,
        error: 'Could not load providers. Please try again.',
      }
    }

    const providers: ProviderWithProfile[] = (data ?? []).map((item) => {
      const rec = item as Record<string, unknown>
      const profileData = rec.profile as Pick<Profile, 'first_name' | 'last_name' | 'avatar_url'>
      const { profile: _removed, ...rest } = rec
      return {
        ...rest,
        profile: profileData,
      } as ProviderWithProfile
    })

    return { success: true, data: providers }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred while loading providers.',
    }
  }
}

// ============================================
// getAvailableTimeSlots
// ============================================

export async function getAvailableTimeSlots(
  providerId: string,
  date: string,
  _locationId?: string
): Promise<ActionResult<TimeSlot[]>> {
  try {
    const supabase = await createClient()

    // Get the physician_profile id from the physician_profiles table
    // providerId here is the physician_profiles.id
    const startOfDay = `${date}T00:00:00.000Z`
    const endOfDay = `${date}T23:59:59.999Z`

    // Build the existing appointments query — optionally filter by location
    let query = supabase
      .from('appointments')
      .select('scheduled_start, scheduled_end')
      .eq('physician_id', providerId)
      .gte('scheduled_start', startOfDay)
      .lte('scheduled_start', endOfDay)
      .in('status', ['scheduled', 'confirmed', 'in_progress'])

    if (_locationId) {
      query = query.eq('location_id', _locationId)
    }

    const { data: existingAppointments, error } = await query

    if (error) {
      return {
        success: false,
        error: 'Could not check availability. Please try again.',
      }
    }

    // Generate time slots from 9am to 5pm in 30-minute intervals
    const slots: TimeSlot[] = []
    const bookedTimes = new Set<string>()

    // Mark booked times
    for (const apt of existingAppointments ?? []) {
      const aptStart = new Date(apt.scheduled_start)
      const hours = aptStart.getUTCHours().toString().padStart(2, '0')
      const minutes = aptStart.getUTCMinutes().toString().padStart(2, '0')
      bookedTimes.add(`${hours}:${minutes}`)
    }

    // Generate slots: 9:00 to 16:30 (last slot at 4:30 PM, appointment ends at 5:00 PM)
    for (let hour = 9; hour < 17; hour++) {
      for (const minute of [0, 30]) {
        // Skip 5:00 PM slot (hour=17 is excluded by loop)
        // But include up to 4:30 PM
        if (hour === 16 && minute === 30) {
          // 4:30 PM - last slot
        }
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        const isBooked = bookedTimes.has(timeStr)

        // Also check if the date is in the past
        const now = new Date()
        const slotDate = new Date(`${date}T${timeStr}:00.000Z`)
        const isPast = slotDate <= now

        slots.push({
          time: timeStr,
          available: !isBooked && !isPast,
        })
      }
    }

    return { success: true, data: slots }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred while checking availability.',
    }
  }
}

// ============================================
// createAppointment
// ============================================

export async function createAppointment(
  userId: string,
  formData: BookingFormData
): Promise<ActionResult<{ appointmentId: string }>> {
  try {
    // Validate with Zod v4
    const parsed = bookingSchema.safeParse(formData)

    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of (parsed.error as ZodError).issues) {
        const fieldName = issue.path.join('.')
        if (fieldName && !fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message
        }
      }
      return {
        success: false,
        error: 'Please fix the errors in the form.',
        fieldErrors,
      }
    }

    const data = parsed.data
    const supabase = await createClient()

    // Get patient profile
    const { data: patientProfile } = await supabase
      .from('patient_profiles')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (!patientProfile) {
      return {
        success: false,
        error: 'Patient profile not found. Please complete your profile first.',
      }
    }

    // Get the service to know the duration
    const { data: service } = await supabase
      .from('service_catalog')
      .select('name, duration_minutes, category')
      .eq('id', data.service_id)
      .single()

    const durationMinutes = service?.duration_minutes ?? 30

    // Build scheduled start and end times
    const scheduledStart = new Date(`${data.appointment_date}T${data.appointment_time}:00.000Z`)
    const scheduledEnd = new Date(scheduledStart.getTime() + durationMinutes * 60 * 1000)

    // Get the provider's practice_id for the appointment
    const { data: provider } = await supabase
      .from('physician_profiles')
      .select('practice_id')
      .eq('id', data.provider_id)
      .single()

    // Create the appointment
    const { data: newAppointment, error: insertError } = await supabase
      .from('appointments')
      .insert({
        patient_id: patientProfile.id,
        physician_id: data.provider_id,
        practice_id: provider?.practice_id ?? null,
        location_id: data.location_id ?? null,
        appointment_type: service?.category ?? 'consultation',
        title: service?.name ?? 'Appointment',
        scheduled_start: scheduledStart.toISOString(),
        scheduled_end: scheduledEnd.toISOString(),
        status: 'scheduled',
        reason_for_visit: data.notes || null,
        notes: data.notes || null,
        created_by: userId,
      })
      .select('id')
      .single()

    if (insertError || !newAppointment) {
      return {
        success: false,
        error: 'Failed to book appointment. Please try again.',
      }
    }

    return {
      success: true,
      data: { appointmentId: newAppointment.id },
    }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred while booking your appointment.',
    }
  }
}

// ============================================
// cancelAppointment
// ============================================

export async function cancelAppointment(
  appointmentId: string,
  userId: string
): Promise<ActionResult<{ cancelled: true }>> {
  try {
    // Validate
    const parsed = cancelSchema.safeParse({ appointment_id: appointmentId })

    if (!parsed.success) {
      return {
        success: false,
        error: 'Invalid appointment ID.',
      }
    }

    const supabase = await createClient()

    // Verify ownership
    const { data: patientProfile } = await supabase
      .from('patient_profiles')
      .select('id')
      .eq('user_id', userId)
      .single()

    if (!patientProfile) {
      return {
        success: false,
        error: 'Patient profile not found.',
      }
    }

    // Get the appointment and check status
    const { data: appointment, error: fetchError } = await supabase
      .from('appointments')
      .select('id, status')
      .eq('id', appointmentId)
      .eq('patient_id', patientProfile.id)
      .single()

    if (fetchError || !appointment) {
      return {
        success: false,
        error: 'Appointment not found or you do not have access.',
      }
    }

    if (appointment.status !== 'scheduled' && appointment.status !== 'confirmed') {
      return {
        success: false,
        error: 'Only scheduled or confirmed appointments can be cancelled.',
      }
    }

    // Cancel the appointment
    const { error: updateError } = await supabase
      .from('appointments')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancelled_by: userId,
        cancellation_reason: 'Cancelled by patient',
      })
      .eq('id', appointmentId)

    if (updateError) {
      return {
        success: false,
        error: 'Failed to cancel appointment. Please try again.',
      }
    }

    return { success: true, data: { cancelled: true } }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred while cancelling the appointment.',
    }
  }
}
