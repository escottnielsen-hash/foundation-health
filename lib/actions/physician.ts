'use server'

import { createClient } from '@/lib/supabase/server'
import type {
  AppointmentStatus,
  EncounterStatus,
  SessionStatus,
  SessionType,
} from '@/types/database'

// ============================================
// Physician Dashboard Types
// ============================================

export interface PhysicianDashboardAppointment {
  id: string
  scheduled_start: string
  scheduled_end: string
  appointment_type: string
  status: AppointmentStatus
  is_telehealth: boolean
  title: string | null
  reason_for_visit: string | null
  location: string | null
  patient_name: string | null
}

export interface PhysicianDashboardEncounter {
  id: string
  status: EncounterStatus
  check_in_time: string | null
  chief_complaint: string | null
  is_telehealth: boolean
  created_at: string
  patient_name: string | null
}

export interface PhysicianDashboardTelemedicine {
  id: string
  session_type: SessionType
  status: SessionStatus
  scheduled_start: string
  scheduled_duration_minutes: number
  chief_complaint: string | null
  patient_name: string | null
}

export interface PhysicianDashboardData {
  profile: {
    first_name: string | null
    last_name: string | null
    specialty: string | null
    credentials: string | null
  }
  todaysAppointmentsCount: number
  upcomingAppointments: PhysicianDashboardAppointment[]
  pendingEncounters: PhysicianDashboardEncounter[]
  upcomingTelemedicine: PhysicianDashboardTelemedicine[]
  recentActivity: PhysicianDashboardAppointment[]
  unreadNotificationsCount: number
}

// ============================================
// Schedule Types
// ============================================

export interface PhysicianScheduleAppointment {
  id: string
  scheduled_start: string
  scheduled_end: string
  appointment_type: string
  status: AppointmentStatus
  is_telehealth: boolean
  title: string | null
  reason_for_visit: string | null
  location: string | null
  room: string | null
  patient_name: string | null
  patient_id: string
}

// ============================================
// Patient Types
// ============================================

export interface PhysicianPatientListItem {
  patient_profile_id: string
  user_id: string
  first_name: string | null
  last_name: string | null
  email: string
  phone: string | null
  avatar_url: string | null
  last_visit: string | null
  next_appointment: string | null
  total_encounters: number
}

export interface PhysicianPatientDetail {
  patient_profile_id: string
  user_id: string
  first_name: string | null
  last_name: string | null
  email: string
  phone: string | null
  avatar_url: string | null
  date_of_birth: string | null
  gender: string | null
  address_line1: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  allergies: string[] | null
  medications: string[] | null
  medical_conditions: string[] | null
  blood_type: string | null
  encounters: PatientEncounterSummary[]
  appointments: PatientAppointmentSummary[]
}

export interface PatientEncounterSummary {
  id: string
  status: EncounterStatus
  check_in_time: string | null
  chief_complaint: string | null
  diagnosis_codes: string[] | null
  is_telehealth: boolean
  created_at: string
}

export interface PatientAppointmentSummary {
  id: string
  scheduled_start: string
  scheduled_end: string
  appointment_type: string
  status: AppointmentStatus
  is_telehealth: boolean
  location: string | null
}

// ============================================
// Stats Types
// ============================================

export interface PhysicianStats {
  patientsSeen: number
  encountersCompleted: number
  encounterCompletionRate: number
  telehealthSessionsCompleted: number
  totalRevenue: number
}

// ============================================
// Helper: Get physician_profile ID from user ID
// ============================================

async function getPhysicianProfileId(userId: string): Promise<string | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('physician_profiles')
    .select('id')
    .eq('user_id', userId)
    .single()

  return data?.id ?? null
}

// ============================================
// Helper: Verify the authenticated user is the physician
// ============================================

async function verifyPhysicianAccess(physicianProfileId: string): Promise<{ userId: string; physicianId: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  // Verify the authenticated user owns this physician profile
  const { data: physicianProfile } = await supabase
    .from('physician_profiles')
    .select('id, user_id')
    .eq('id', physicianProfileId)
    .single()

  if (!physicianProfile || physicianProfile.user_id !== user.id) {
    throw new Error('Unauthorized: You can only access your own physician data')
  }

  return { userId: user.id, physicianId: physicianProfile.id }
}

// ============================================
// Server Action: getPhysicianDashboard
// ============================================

export async function getPhysicianDashboard(physicianId: string): Promise<PhysicianDashboardData> {
  const { userId } = await verifyPhysicianAccess(physicianId)
  const supabase = await createClient()

  // 1. Fetch physician profile details
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name')
    .eq('id', userId)
    .single()

  const { data: physicianData } = await supabase
    .from('physician_profiles')
    .select('specialty, credentials')
    .eq('id', physicianId)
    .single()

  const safeProfile = {
    first_name: profile?.first_name ?? null,
    last_name: profile?.last_name ?? null,
    specialty: physicianData?.specialty ?? null,
    credentials: physicianData?.credentials ?? null,
  }

  // 2. Today's appointments count
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date()
  todayEnd.setHours(23, 59, 59, 999)

  const { data: todaysAppointments } = await supabase
    .from('appointments')
    .select('id')
    .eq('physician_id', physicianId)
    .gte('scheduled_start', todayStart.toISOString())
    .lte('scheduled_start', todayEnd.toISOString())
    .in('status', ['scheduled', 'confirmed', 'in_progress'])

  const todaysAppointmentsCount = todaysAppointments?.length ?? 0

  // 3. Upcoming appointments (next 5 from now)
  const now = new Date().toISOString()

  const { data: upcomingRaw } = await supabase
    .from('appointments')
    .select('id, scheduled_start, scheduled_end, appointment_type, status, is_telehealth, title, reason_for_visit, location')
    .eq('physician_id', physicianId)
    .in('status', ['scheduled', 'confirmed'])
    .gte('scheduled_start', now)
    .order('scheduled_start', { ascending: true })
    .limit(5)

  const upcomingAppointments: PhysicianDashboardAppointment[] = (upcomingRaw ?? []).map((apt) => ({
    id: apt.id,
    scheduled_start: apt.scheduled_start,
    scheduled_end: apt.scheduled_end,
    appointment_type: apt.appointment_type,
    status: apt.status as AppointmentStatus,
    is_telehealth: apt.is_telehealth,
    title: apt.title ?? null,
    reason_for_visit: apt.reason_for_visit ?? null,
    location: apt.location ?? null,
    patient_name: null,
  }))

  // 4. Pending encounters (checked_in or in_progress)
  const { data: pendingRaw } = await supabase
    .from('encounters')
    .select('id, status, check_in_time, chief_complaint, is_telehealth, created_at')
    .eq('physician_id', physicianId)
    .in('status', ['checked_in', 'in_progress'])
    .order('created_at', { ascending: false })
    .limit(5)

  const pendingEncounters: PhysicianDashboardEncounter[] = (pendingRaw ?? []).map((enc) => ({
    id: enc.id,
    status: enc.status as EncounterStatus,
    check_in_time: enc.check_in_time ?? null,
    chief_complaint: enc.chief_complaint ?? null,
    is_telehealth: enc.is_telehealth,
    created_at: enc.created_at,
    patient_name: null,
  }))

  // 5. Upcoming telemedicine sessions
  const { data: teleRaw } = await supabase
    .from('telemedicine_sessions')
    .select('id, session_type, status, scheduled_start, scheduled_duration_minutes, chief_complaint')
    .eq('physician_id', physicianId)
    .in('status', ['scheduled', 'waiting_room'])
    .gte('scheduled_start', now)
    .order('scheduled_start', { ascending: true })
    .limit(3)

  const upcomingTelemedicine: PhysicianDashboardTelemedicine[] = (teleRaw ?? []).map((s) => ({
    id: s.id,
    session_type: s.session_type as SessionType,
    status: s.status as SessionStatus,
    scheduled_start: s.scheduled_start,
    scheduled_duration_minutes: s.scheduled_duration_minutes,
    chief_complaint: s.chief_complaint ?? null,
    patient_name: null,
  }))

  // 6. Recent activity (last 5 completed appointments)
  const { data: recentRaw } = await supabase
    .from('appointments')
    .select('id, scheduled_start, scheduled_end, appointment_type, status, is_telehealth, title, reason_for_visit, location')
    .eq('physician_id', physicianId)
    .in('status', ['completed', 'in_progress'])
    .order('scheduled_start', { ascending: false })
    .limit(5)

  const recentActivity: PhysicianDashboardAppointment[] = (recentRaw ?? []).map((apt) => ({
    id: apt.id,
    scheduled_start: apt.scheduled_start,
    scheduled_end: apt.scheduled_end,
    appointment_type: apt.appointment_type,
    status: apt.status as AppointmentStatus,
    is_telehealth: apt.is_telehealth,
    title: apt.title ?? null,
    reason_for_visit: apt.reason_for_visit ?? null,
    location: apt.location ?? null,
    patient_name: null,
  }))

  // 7. Unread notifications
  const { data: notifications } = await supabase
    .from('notifications')
    .select('id')
    .eq('user_id', userId)
    .eq('is_read', false)

  const unreadNotificationsCount = notifications?.length ?? 0

  return {
    profile: safeProfile,
    todaysAppointmentsCount,
    upcomingAppointments,
    pendingEncounters,
    upcomingTelemedicine,
    recentActivity,
    unreadNotificationsCount,
  }
}

// ============================================
// Server Action: getPhysicianSchedule
// ============================================

export async function getPhysicianSchedule(
  physicianId: string,
  dateFrom: string,
  dateTo: string,
  appointmentType?: string,
  locationId?: string
): Promise<PhysicianScheduleAppointment[]> {
  await verifyPhysicianAccess(physicianId)
  const supabase = await createClient()

  let query = supabase
    .from('appointments')
    .select('id, scheduled_start, scheduled_end, appointment_type, status, is_telehealth, title, reason_for_visit, location, room, patient_id')
    .eq('physician_id', physicianId)
    .gte('scheduled_start', dateFrom)
    .lte('scheduled_start', dateTo)
    .order('scheduled_start', { ascending: true })

  if (appointmentType) {
    query = query.eq('appointment_type', appointmentType)
  }

  if (locationId) {
    query = query.eq('location_id', locationId)
  }

  const { data: appointments } = await query

  return (appointments ?? []).map((apt) => ({
    id: apt.id,
    scheduled_start: apt.scheduled_start,
    scheduled_end: apt.scheduled_end,
    appointment_type: apt.appointment_type,
    status: apt.status as AppointmentStatus,
    is_telehealth: apt.is_telehealth,
    title: apt.title ?? null,
    reason_for_visit: apt.reason_for_visit ?? null,
    location: apt.location ?? null,
    room: apt.room ?? null,
    patient_name: null,
    patient_id: apt.patient_id,
  }))
}

// ============================================
// Server Action: getPhysicianPatients
// ============================================

export async function getPhysicianPatients(
  physicianId: string,
  filters?: { search_query?: string; sort_by?: string; date_from?: string }
): Promise<PhysicianPatientListItem[]> {
  await verifyPhysicianAccess(physicianId)
  const supabase = await createClient()

  // Get distinct patient IDs from encounters and appointments
  const { data: encounterPatients } = await supabase
    .from('encounters')
    .select('patient_id')
    .eq('physician_id', physicianId)

  const { data: appointmentPatients } = await supabase
    .from('appointments')
    .select('patient_id')
    .eq('physician_id', physicianId)

  // Combine unique patient IDs
  const patientIdSet = new Set<string>()
  ;(encounterPatients ?? []).forEach((e) => patientIdSet.add(e.patient_id))
  ;(appointmentPatients ?? []).forEach((a) => patientIdSet.add(a.patient_id))
  const allPatientIds = Array.from(patientIdSet)

  if (allPatientIds.length === 0) {
    return []
  }

  // Fetch patient profiles
  const { data: patientProfiles } = await supabase
    .from('patient_profiles')
    .select('id, user_id')
    .in('id', allPatientIds)

  if (!patientProfiles || patientProfiles.length === 0) {
    return []
  }

  const userIds = patientProfiles.map((p) => p.user_id)

  // Fetch profiles for these users
  let profileQuery = supabase
    .from('profiles')
    .select('id, first_name, last_name, email, phone, avatar_url')
    .in('id', userIds)

  if (filters?.search_query) {
    profileQuery = profileQuery.or(
      `first_name.ilike.%${filters.search_query}%,last_name.ilike.%${filters.search_query}%,email.ilike.%${filters.search_query}%`
    )
  }

  const { data: profiles } = await profileQuery

  if (!profiles || profiles.length === 0) {
    return []
  }

  // Build patient list with last visit info
  const results: PhysicianPatientListItem[] = []

  for (const prof of profiles) {
    const patientProfile = patientProfiles.find((pp) => pp.user_id === prof.id)
    if (!patientProfile) continue

    // Get most recent encounter date
    const { data: lastEncounter } = await supabase
      .from('encounters')
      .select('created_at')
      .eq('physician_id', physicianId)
      .eq('patient_id', patientProfile.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // Get next upcoming appointment
    const nowIso = new Date().toISOString()
    const { data: nextApt } = await supabase
      .from('appointments')
      .select('scheduled_start')
      .eq('physician_id', physicianId)
      .eq('patient_id', patientProfile.id)
      .in('status', ['scheduled', 'confirmed'])
      .gte('scheduled_start', nowIso)
      .order('scheduled_start', { ascending: true })
      .limit(1)
      .single()

    // Get total encounters count
    const { data: encounterCount } = await supabase
      .from('encounters')
      .select('id')
      .eq('physician_id', physicianId)
      .eq('patient_id', patientProfile.id)

    const lastVisit = lastEncounter?.created_at ?? null

    // Apply date_from filter
    if (filters?.date_from && lastVisit) {
      if (lastVisit < filters.date_from) continue
    }

    results.push({
      patient_profile_id: patientProfile.id,
      user_id: prof.id,
      first_name: prof.first_name ?? null,
      last_name: prof.last_name ?? null,
      email: prof.email,
      phone: prof.phone ?? null,
      avatar_url: prof.avatar_url ?? null,
      last_visit: lastVisit,
      next_appointment: nextApt?.scheduled_start ?? null,
      total_encounters: encounterCount?.length ?? 0,
    })
  }

  // Sort results
  const sortBy = filters?.sort_by ?? 'last_visit_desc'
  results.sort((a, b) => {
    switch (sortBy) {
      case 'last_visit_asc':
        return (a.last_visit ?? '').localeCompare(b.last_visit ?? '')
      case 'name_asc':
        return `${a.last_name ?? ''} ${a.first_name ?? ''}`.localeCompare(
          `${b.last_name ?? ''} ${b.first_name ?? ''}`
        )
      case 'name_desc':
        return `${b.last_name ?? ''} ${b.first_name ?? ''}`.localeCompare(
          `${a.last_name ?? ''} ${a.first_name ?? ''}`
        )
      case 'last_visit_desc':
      default:
        return (b.last_visit ?? '').localeCompare(a.last_visit ?? '')
    }
  })

  return results
}

// ============================================
// Server Action: getPatientDetailForPhysician
// ============================================

export async function getPatientDetailForPhysician(
  physicianId: string,
  patientId: string
): Promise<PhysicianPatientDetail | null> {
  await verifyPhysicianAccess(physicianId)
  const supabase = await createClient()

  // Verify this physician has seen this patient
  const { data: encounterCheck } = await supabase
    .from('encounters')
    .select('id')
    .eq('physician_id', physicianId)
    .eq('patient_id', patientId)
    .limit(1)

  const { data: appointmentCheck } = await supabase
    .from('appointments')
    .select('id')
    .eq('physician_id', physicianId)
    .eq('patient_id', patientId)
    .limit(1)

  const hasRelationship =
    (encounterCheck && encounterCheck.length > 0) ||
    (appointmentCheck && appointmentCheck.length > 0)

  if (!hasRelationship) {
    return null
  }

  // Get patient_profile
  const { data: patientProfile } = await supabase
    .from('patient_profiles')
    .select('id, user_id, allergies, medications, medical_conditions, blood_type')
    .eq('id', patientId)
    .single()

  if (!patientProfile) return null

  // Get profile info
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, email, phone, avatar_url, date_of_birth, gender, address_line1, city, state, zip_code')
    .eq('id', patientProfile.user_id)
    .single()

  if (!profile) return null

  // Fetch encounters for this patient by this physician
  const { data: encounters } = await supabase
    .from('encounters')
    .select('id, status, check_in_time, chief_complaint, diagnosis_codes, is_telehealth, created_at')
    .eq('physician_id', physicianId)
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })
    .limit(20)

  const encountersList: PatientEncounterSummary[] = (encounters ?? []).map((enc) => ({
    id: enc.id,
    status: enc.status as EncounterStatus,
    check_in_time: enc.check_in_time ?? null,
    chief_complaint: enc.chief_complaint ?? null,
    diagnosis_codes: enc.diagnosis_codes ?? null,
    is_telehealth: enc.is_telehealth,
    created_at: enc.created_at,
  }))

  // Fetch appointments for this patient with this physician
  const { data: appointments } = await supabase
    .from('appointments')
    .select('id, scheduled_start, scheduled_end, appointment_type, status, is_telehealth, location')
    .eq('physician_id', physicianId)
    .eq('patient_id', patientId)
    .order('scheduled_start', { ascending: false })
    .limit(20)

  const appointmentsList: PatientAppointmentSummary[] = (appointments ?? []).map((apt) => ({
    id: apt.id,
    scheduled_start: apt.scheduled_start,
    scheduled_end: apt.scheduled_end,
    appointment_type: apt.appointment_type,
    status: apt.status as AppointmentStatus,
    is_telehealth: apt.is_telehealth,
    location: apt.location ?? null,
  }))

  return {
    patient_profile_id: patientProfile.id,
    user_id: patientProfile.user_id,
    first_name: profile.first_name ?? null,
    last_name: profile.last_name ?? null,
    email: profile.email,
    phone: profile.phone ?? null,
    avatar_url: profile.avatar_url ?? null,
    date_of_birth: profile.date_of_birth ?? null,
    gender: profile.gender ?? null,
    address_line1: profile.address_line1 ?? null,
    city: profile.city ?? null,
    state: profile.state ?? null,
    zip_code: profile.zip_code ?? null,
    allergies: patientProfile.allergies ?? null,
    medications: patientProfile.medications ?? null,
    medical_conditions: patientProfile.medical_conditions ?? null,
    blood_type: patientProfile.blood_type ?? null,
    encounters: encountersList,
    appointments: appointmentsList,
  }
}

// ============================================
// Server Action: getPhysicianStats
// ============================================

export async function getPhysicianStats(physicianId: string): Promise<PhysicianStats> {
  await verifyPhysicianAccess(physicianId)
  const supabase = await createClient()

  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)
  const monthStartIso = monthStart.toISOString()

  // Patients seen this month (completed encounters)
  const { data: completedEncounters } = await supabase
    .from('encounters')
    .select('id, patient_id')
    .eq('physician_id', physicianId)
    .eq('status', 'completed')
    .gte('created_at', monthStartIso)

  const uniquePatients = new Set((completedEncounters ?? []).map((e) => e.patient_id))
  const patientsSeen = uniquePatients.size
  const encountersCompleted = completedEncounters?.length ?? 0

  // Total encounters this month (all statuses)
  const { data: allEncounters } = await supabase
    .from('encounters')
    .select('id')
    .eq('physician_id', physicianId)
    .gte('created_at', monthStartIso)

  const totalEncounters = allEncounters?.length ?? 0
  const encounterCompletionRate = totalEncounters > 0
    ? Math.round((encountersCompleted / totalEncounters) * 100)
    : 0

  // Telehealth sessions completed this month
  const { data: teleCompleted } = await supabase
    .from('telemedicine_sessions')
    .select('id')
    .eq('physician_id', physicianId)
    .eq('status', 'completed')
    .gte('created_at', monthStartIso)

  const telehealthSessionsCompleted = teleCompleted?.length ?? 0

  // Revenue this month from invoices linked to encounters by this physician
  const encounterIds = (completedEncounters ?? []).map((e) => e.id)
  let totalRevenue = 0

  if (encounterIds.length > 0) {
    const { data: invoices } = await supabase
      .from('invoices')
      .select('total')
      .in('encounter_id', encounterIds)
      .in('status', ['paid', 'partially_paid'])

    totalRevenue = (invoices ?? []).reduce((sum, inv) => sum + Number(inv.total), 0)
  }

  return {
    patientsSeen,
    encountersCompleted,
    encounterCompletionRate,
    telehealthSessionsCompleted,
    totalRevenue,
  }
}
