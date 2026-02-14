'use server'

import { createClient } from '@/lib/supabase/server'
import type {
  Profile,
  PatientMembership,
  MembershipTierName,
  MembershipStatus,
  Appointment,
  Encounter,
  EncounterStatus,
  AppointmentStatus,
} from '@/types/database'

// ============================================
// Dashboard Types
// ============================================

export interface DashboardAppointment {
  id: string
  scheduled_start: string
  scheduled_end: string
  appointment_type: string
  status: AppointmentStatus
  is_telehealth: boolean
  title: string | null
  reason_for_visit: string | null
  location: string | null
  provider_name: string | null
  service_name: string | null
}

export interface DashboardEncounter {
  id: string
  status: EncounterStatus
  check_in_time: string | null
  chief_complaint: string | null
  is_telehealth: boolean
  created_at: string
  provider_name: string | null
}

export interface DashboardMembership {
  tier: MembershipTierName | null
  status: MembershipStatus | null
  current_period_end: string | null
  billing_interval: 'monthly' | 'annual' | null
}

export interface DashboardData {
  profile: {
    first_name: string | null
    last_name: string | null
    email: string
    avatar_url: string | null
    role: Profile['role']
  }
  membership: DashboardMembership
  nextAppointment: DashboardAppointment | null
  upcomingAppointments: DashboardAppointment[]
  recentRecordsCount: number
  recentEncounters: DashboardEncounter[]
  unreadMessagesCount: number
}

// ============================================
// Server Action: getDashboardData
// ============================================

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const supabase = await createClient()

  // 1. Fetch patient profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, email, avatar_url, role')
    .eq('id', userId)
    .single()

  const safeProfile = {
    first_name: profile?.first_name ?? null,
    last_name: profile?.last_name ?? null,
    email: profile?.email ?? '',
    avatar_url: profile?.avatar_url ?? null,
    role: (profile?.role ?? 'patient') as Profile['role'],
  }

  // 2. Fetch patient_profile to get the patient_profiles.id for FK joins
  const { data: patientProfile } = await supabase
    .from('patient_profiles')
    .select('id')
    .eq('user_id', userId)
    .single()

  const patientProfileId = patientProfile?.id ?? null

  // 3. Fetch membership info
  let membership: DashboardMembership = {
    tier: null,
    status: null,
    current_period_end: null,
    billing_interval: null,
  }

  if (patientProfileId) {
    const { data: membershipData } = await supabase
      .from('patient_memberships')
      .select(`
        status,
        current_period_end,
        billing_interval,
        membership_tiers ( name )
      `)
      .eq('patient_id', patientProfileId)
      .in('status', ['active', 'past_due', 'paused'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (membershipData) {
      const tierData = membershipData.membership_tiers as unknown as { name: MembershipTierName } | null
      membership = {
        tier: tierData?.name ?? null,
        status: membershipData.status as MembershipStatus,
        current_period_end: membershipData.current_period_end,
        billing_interval: membershipData.billing_interval as 'monthly' | 'annual' | null,
      }
    }
  }

  // 4. Fetch upcoming appointments (next 3, starting from now)
  const now = new Date().toISOString()
  let upcomingAppointments: DashboardAppointment[] = []

  if (patientProfileId) {
    const { data: appointments } = await supabase
      .from('appointments')
      .select(`
        id,
        scheduled_start,
        scheduled_end,
        appointment_type,
        status,
        is_telehealth,
        title,
        reason_for_visit,
        location
      `)
      .eq('patient_id', patientProfileId)
      .in('status', ['scheduled', 'confirmed'])
      .gte('scheduled_start', now)
      .order('scheduled_start', { ascending: true })
      .limit(3)

    upcomingAppointments = (appointments ?? []).map((apt) => ({
      id: apt.id,
      scheduled_start: apt.scheduled_start,
      scheduled_end: apt.scheduled_end,
      appointment_type: apt.appointment_type,
      status: apt.status as AppointmentStatus,
      is_telehealth: apt.is_telehealth,
      title: apt.title,
      reason_for_visit: apt.reason_for_visit,
      location: apt.location,
      provider_name: null, // Provider join would need physician_profiles -> profiles
      service_name: apt.appointment_type,
    }))
  }

  const nextAppointment = upcomingAppointments.length > 0 ? upcomingAppointments[0] : null

  // 5. Fetch recent health records count (last 30 days)
  let recentRecordsCount = 0

  if (patientProfileId) {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { count } = await supabase
      .from('health_records')
      .select('id', { count: 'exact', head: true })
      .eq('patient_id', patientProfileId)
      .gte('created_at', thirtyDaysAgo.toISOString())

    recentRecordsCount = count ?? 0
  }

  // 6. Fetch recent encounters (last 5)
  let recentEncounters: DashboardEncounter[] = []

  if (patientProfileId) {
    const { data: encounters } = await supabase
      .from('encounters')
      .select(`
        id,
        status,
        check_in_time,
        chief_complaint,
        is_telehealth,
        created_at
      `)
      .eq('patient_id', patientProfileId)
      .order('created_at', { ascending: false })
      .limit(5)

    recentEncounters = (encounters ?? []).map((enc) => ({
      id: enc.id,
      status: enc.status as EncounterStatus,
      check_in_time: enc.check_in_time,
      chief_complaint: enc.chief_complaint,
      is_telehealth: enc.is_telehealth,
      created_at: enc.created_at,
      provider_name: null, // Would need physician_profiles join
    }))
  }

  return {
    profile: safeProfile,
    membership,
    nextAppointment,
    upcomingAppointments,
    recentRecordsCount,
    recentEncounters,
    unreadMessagesCount: 0, // Placeholder for now
  }
}
