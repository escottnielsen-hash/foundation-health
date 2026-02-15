'use server'

import { createClient } from '@/lib/supabase/server'
import type {
  Profile,
  MembershipTierName,
  MembershipStatus,
  AppointmentStatus,
  EncounterStatus,
  ClaimStatus,
  SessionStatus,
  SessionType,
  VerificationStatus,
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

export interface DashboardClaim {
  id: string
  claim_number: string | null
  status: ClaimStatus
  billed_amount: number
  paid_amount: number | null
  patient_responsibility: number | null
  service_date: string
  payer_name: string | null
  submitted_at: string | null
}

export interface DashboardTelemedicineSession {
  id: string
  session_type: SessionType
  status: SessionStatus
  scheduled_start: string
  scheduled_duration_minutes: number
  chief_complaint: string | null
  provider_name: string | null
}

export interface DashboardFinancialSummary {
  totalSpent: number
  totalReimbursed: number
  pendingReimbursements: number
  netCost: number
}

export interface DashboardInsuranceVerification {
  id: string
  payer_name: string
  member_id: string
  verification_status: VerificationStatus
  verified_at: string | null
}

export interface DashboardOverviewData {
  profile: {
    first_name: string | null
    last_name: string | null
    email: string
    avatar_url: string | null
    role: Profile['role']
  }
  membership: DashboardMembership
  upcomingAppointments: DashboardAppointment[]
  recentClaims: DashboardClaim[]
  financialSummary: DashboardFinancialSummary
  upcomingTelemedicine: DashboardTelemedicineSession[]
  unreadNotificationsCount: number
  activeInsuranceVerifications: DashboardInsuranceVerification[]
  recentEncounters: DashboardEncounter[]
}

// ============================================
// Helper: get patient_profile ID from user ID
// ============================================

async function getPatientProfileId(userId: string): Promise<string | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('patient_profiles')
    .select('id')
    .eq('user_id', userId)
    .single()

  return data?.id ?? null
}

// ============================================
// Server Action: getDashboardOverview
// ============================================

export async function getDashboardOverview(userId: string): Promise<DashboardOverviewData> {
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
  const patientProfileId = await getPatientProfileId(userId)

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
      title: apt.title ?? null,
      reason_for_visit: apt.reason_for_visit ?? null,
      location: apt.location ?? null,
      provider_name: null,
      service_name: apt.appointment_type,
    }))
  }

  // 5. Fetch recent claims (last 3 with status)
  let recentClaims: DashboardClaim[] = []

  if (patientProfileId) {
    const { data: claims } = await supabase
      .from('insurance_claims')
      .select(`
        id,
        claim_number,
        status,
        billed_amount,
        paid_amount,
        patient_responsibility,
        service_date,
        submitted_at,
        insurance_payers ( name )
      `)
      .eq('patient_id', patientProfileId)
      .order('created_at', { ascending: false })
      .limit(3)

    recentClaims = (claims ?? []).map((claim) => {
      const payer = claim.insurance_payers as unknown as { name: string } | null
      return {
        id: claim.id,
        claim_number: claim.claim_number ?? null,
        status: claim.status as ClaimStatus,
        billed_amount: Number(claim.billed_amount),
        paid_amount: claim.paid_amount != null ? Number(claim.paid_amount) : null,
        patient_responsibility: claim.patient_responsibility != null ? Number(claim.patient_responsibility) : null,
        service_date: claim.service_date,
        payer_name: payer?.name ?? null,
        submitted_at: claim.submitted_at ?? null,
      }
    })
  }

  // 6. Compute financial summary
  let financialSummary: DashboardFinancialSummary = {
    totalSpent: 0,
    totalReimbursed: 0,
    pendingReimbursements: 0,
    netCost: 0,
  }

  if (patientProfileId) {
    // Total spent: sum of paid invoices
    const yearStart = new Date(new Date().getFullYear(), 0, 1).toISOString()

    const { data: paidInvoices } = await supabase
      .from('invoices')
      .select('amount_paid')
      .eq('patient_id', patientProfileId)
      .in('status', ['paid', 'partially_paid'])
      .gte('paid_at', yearStart)

    const totalSpent = (paidInvoices ?? []).reduce(
      (sum, inv) => sum + Number(inv.amount_paid),
      0
    )

    // Total reimbursed: paid claims
    const { data: paidClaims } = await supabase
      .from('insurance_claims')
      .select('paid_amount')
      .eq('patient_id', patientProfileId)
      .in('status', ['paid', 'partially_paid'])

    const totalReimbursed = (paidClaims ?? []).reduce(
      (sum, claim) => sum + (claim.paid_amount != null ? Number(claim.paid_amount) : 0),
      0
    )

    // Pending reimbursements: submitted/pending claims
    const pendingStatuses = ['submitted', 'acknowledged', 'pending', 'in_review', 'appealed']
    const { data: pendingClaims } = await supabase
      .from('insurance_claims')
      .select('billed_amount')
      .eq('patient_id', patientProfileId)
      .in('status', pendingStatuses)

    const pendingReimbursements = (pendingClaims ?? []).reduce(
      (sum, claim) => sum + Number(claim.billed_amount),
      0
    )

    financialSummary = {
      totalSpent,
      totalReimbursed,
      pendingReimbursements,
      netCost: totalSpent - totalReimbursed,
    }
  }

  // 7. Fetch upcoming telemedicine sessions (next 2)
  let upcomingTelemedicine: DashboardTelemedicineSession[] = []

  if (patientProfileId) {
    const { data: sessions } = await supabase
      .from('telemedicine_sessions')
      .select(`
        id,
        session_type,
        status,
        scheduled_start,
        scheduled_duration_minutes,
        chief_complaint
      `)
      .eq('patient_id', patientProfileId)
      .in('status', ['scheduled', 'waiting_room'])
      .gte('scheduled_start', now)
      .order('scheduled_start', { ascending: true })
      .limit(2)

    upcomingTelemedicine = (sessions ?? []).map((session) => ({
      id: session.id,
      session_type: session.session_type as SessionType,
      status: session.status as SessionStatus,
      scheduled_start: session.scheduled_start,
      scheduled_duration_minutes: session.scheduled_duration_minutes,
      chief_complaint: session.chief_complaint ?? null,
      provider_name: null,
    }))
  }

  // 8. Unread notifications count (placeholder -- no notifications table yet)
  const unreadNotificationsCount = 0

  // 9. Active insurance verifications
  let activeInsuranceVerifications: DashboardInsuranceVerification[] = []

  if (patientProfileId) {
    const { data: verifications } = await supabase
      .from('insurance_verifications')
      .select(`
        id,
        payer_name,
        member_id,
        verification_status,
        verified_at
      `)
      .eq('patient_id', patientProfileId)
      .in('verification_status', ['verified', 'pending'])
      .order('created_at', { ascending: false })
      .limit(3)

    activeInsuranceVerifications = (verifications ?? []).map((v) => ({
      id: v.id,
      payer_name: v.payer_name,
      member_id: v.member_id,
      verification_status: v.verification_status as VerificationStatus,
      verified_at: v.verified_at ?? null,
    }))
  }

  // 10. Recent encounters (last 3)
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
      .limit(3)

    recentEncounters = (encounters ?? []).map((enc) => ({
      id: enc.id,
      status: enc.status as EncounterStatus,
      check_in_time: enc.check_in_time ?? null,
      chief_complaint: enc.chief_complaint ?? null,
      is_telehealth: enc.is_telehealth,
      created_at: enc.created_at,
      provider_name: null,
    }))
  }

  return {
    profile: safeProfile,
    membership,
    upcomingAppointments,
    recentClaims,
    financialSummary,
    upcomingTelemedicine,
    unreadNotificationsCount,
    activeInsuranceVerifications,
    recentEncounters,
  }
}
