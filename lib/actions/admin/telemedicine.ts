'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import type {
  TelemedicineSession,
  SessionType,
  SessionStatus,
} from '@/types/database'

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
}

type ActionResult<T> = ActionSuccess<T> | ActionError

// ============================================
// Extended types for admin views
// ============================================

export interface TelemedicineSessionWithDetails extends TelemedicineSession {
  patient_name: string | null
  patient_email: string | null
  physician_name: string | null
  physician_email: string | null
  physician_specialty: string | null
}

export interface TelemedicineStats {
  totalSessions: number
  completedSessions: number
  completionRate: number
  averageDurationMinutes: number
  pendingRequests: number
  byType: Record<SessionType, number>
  byPhysician: {
    physician_id: string
    physician_name: string
    session_count: number
  }[]
}

export interface SessionFilters {
  status?: SessionStatus
  session_type?: SessionType
  physician_id?: string
  date_from?: string
  date_to?: string
}

// ============================================
// Re-export types for components
// ============================================

export type { SessionType, SessionStatus }

// ============================================
// Auth helper -- verify admin/staff/physician role
// ============================================

async function requireAdmin(): Promise<{ userId: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role
  if (role !== 'admin' && role !== 'staff' && role !== 'physician') {
    redirect('/patient/dashboard')
  }

  return { userId: user.id }
}

// ============================================
// Helper: map raw row to TelemedicineSessionWithDetails
// ============================================

function mapSessionRow(row: Record<string, unknown>): TelemedicineSessionWithDetails {
  const patient = row.patient as Record<string, unknown> | null
  const physician = row.physician as Record<string, unknown> | null
  const physicianProfile = row.physician_profile as Record<string, unknown> | null

  return {
    id: row.id as string,
    patient_id: row.patient_id as string,
    physician_id: row.physician_id as string,
    appointment_id: (row.appointment_id as string) ?? null,
    session_type: row.session_type as SessionType,
    status: row.status as SessionStatus,
    scheduled_start: row.scheduled_start as string,
    scheduled_duration_minutes: (row.scheduled_duration_minutes as number) ?? 30,
    actual_start: (row.actual_start as string) ?? null,
    actual_end: (row.actual_end as string) ?? null,
    room_id: (row.room_id as string) ?? null,
    room_url: (row.room_url as string) ?? null,
    recording_url: (row.recording_url as string) ?? null,
    chief_complaint: (row.chief_complaint as string) ?? null,
    clinical_notes: (row.clinical_notes as string) ?? null,
    follow_up_instructions: (row.follow_up_instructions as string) ?? null,
    prescriptions_issued: (row.prescriptions_issued as string[]) ?? null,
    patient_consent_given: (row.patient_consent_given as boolean) ?? false,
    consent_timestamp: (row.consent_timestamp as string) ?? null,
    patient_state: (row.patient_state as string) ?? null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    patient_name: (patient?.full_name as string) ?? null,
    patient_email: (patient?.email as string) ?? null,
    physician_name: (physician?.full_name as string) ?? null,
    physician_email: (physician?.email as string) ?? null,
    physician_specialty: (physicianProfile?.specialty as string) ?? null,
  }
}

// ============================================
// Joined select query fragment
// ============================================

const SESSION_SELECT_WITH_DETAILS = `
  *,
  patient:profiles!telemedicine_sessions_patient_id_fkey(
    full_name,
    email
  ),
  physician:profiles!telemedicine_sessions_physician_id_fkey(
    full_name,
    email
  ),
  physician_profile:physician_profiles!telemedicine_sessions_physician_id_fkey(
    specialty
  )
`

// ============================================
// getAllSessions -- list all sessions with patient/physician info
// ============================================

export async function getAllSessions(
  filters?: SessionFilters
): Promise<ActionResult<TelemedicineSessionWithDetails[]>> {
  try {
    await requireAdmin()
    const supabase = await createClient()

    let query = supabase
      .from('telemedicine_sessions')
      .select(SESSION_SELECT_WITH_DETAILS)
      .order('created_at', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.session_type) {
      query = query.eq('session_type', filters.session_type)
    }
    if (filters?.physician_id) {
      query = query.eq('physician_id', filters.physician_id)
    }
    if (filters?.date_from) {
      query = query.gte('scheduled_start', filters.date_from)
    }
    if (filters?.date_to) {
      query = query.lte('scheduled_start', filters.date_to)
    }

    const { data, error } = await query

    if (error) {
      return { success: false, error: 'Could not load telemedicine sessions.' }
    }

    const sessions = (data ?? []).map((row: Record<string, unknown>) =>
      mapSessionRow(row)
    )

    return { success: true, data: sessions }
  } catch {
    return { success: false, error: 'An unexpected error occurred.' }
  }
}

// ============================================
// getSessionById -- get a single session with full details
// ============================================

export async function getSessionById(
  sessionId: string
): Promise<ActionResult<TelemedicineSessionWithDetails>> {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('telemedicine_sessions')
      .select(`
        *,
        patient:profiles!telemedicine_sessions_patient_id_fkey(
          full_name,
          email,
          phone
        ),
        physician:profiles!telemedicine_sessions_physician_id_fkey(
          full_name,
          email,
          phone
        ),
        physician_profile:physician_profiles!telemedicine_sessions_physician_id_fkey(
          specialty,
          credentials
        )
      `)
      .eq('id', sessionId)
      .single()

    if (error || !data) {
      return { success: false, error: 'Session not found.' }
    }

    const session = mapSessionRow(data as Record<string, unknown>)
    return { success: true, data: session }
  } catch {
    return { success: false, error: 'An unexpected error occurred.' }
  }
}

// ============================================
// updateSessionNotes -- update clinical notes
// ============================================

export async function updateSessionNotes(
  sessionId: string,
  notes: string
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const { error } = await supabase
      .from('telemedicine_sessions')
      .update({
        clinical_notes: notes,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId)

    if (error) {
      return { success: false, error: 'Failed to update clinical notes.' }
    }

    revalidatePath(`/admin/telemedicine/sessions/${sessionId}`)
    revalidatePath('/admin/telemedicine')

    return { success: true, data: { id: sessionId } }
  } catch {
    return { success: false, error: 'An unexpected error occurred.' }
  }
}

// ============================================
// updateFollowUpInstructions -- update follow-up
// ============================================

export async function updateFollowUpInstructions(
  sessionId: string,
  instructions: string
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const { error } = await supabase
      .from('telemedicine_sessions')
      .update({
        follow_up_instructions: instructions,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId)

    if (error) {
      return { success: false, error: 'Failed to update follow-up instructions.' }
    }

    revalidatePath(`/admin/telemedicine/sessions/${sessionId}`)
    revalidatePath('/admin/telemedicine')

    return { success: true, data: { id: sessionId } }
  } catch {
    return { success: false, error: 'An unexpected error occurred.' }
  }
}

// ============================================
// getTelemedicineStats -- analytics overview
// ============================================

export async function getTelemedicineStats(
  dateRange?: { from?: string; to?: string }
): Promise<ActionResult<TelemedicineStats>> {
  try {
    await requireAdmin()
    const supabase = await createClient()

    let baseQuery = supabase.from('telemedicine_sessions').select('*')

    if (dateRange?.from) {
      baseQuery = baseQuery.gte('created_at', dateRange.from)
    }
    if (dateRange?.to) {
      baseQuery = baseQuery.lte('created_at', dateRange.to)
    }

    const { data: allSessions, error } = await baseQuery

    if (error) {
      return { success: false, error: 'Could not load telemedicine stats.' }
    }

    const sessions = allSessions ?? []
    const totalSessions = sessions.length
    const completedSessions = sessions.filter(
      (s: Record<string, unknown>) => s.status === 'completed'
    ).length
    const completionRate = totalSessions > 0
      ? Math.round((completedSessions / totalSessions) * 100)
      : 0

    // Calculate average duration from scheduled_duration_minutes
    const durationsWithValues = sessions
      .filter((s: Record<string, unknown>) =>
        s.scheduled_duration_minutes != null && (s.scheduled_duration_minutes as number) > 0
      )
      .map((s: Record<string, unknown>) => s.scheduled_duration_minutes as number)
    const averageDurationMinutes = durationsWithValues.length > 0
      ? Math.round(
          durationsWithValues.reduce((a: number, b: number) => a + b, 0) /
            durationsWithValues.length
        )
      : 0

    // Sessions in waiting_room or scheduled are considered "pending"
    const pendingRequests = sessions.filter(
      (s: Record<string, unknown>) =>
        s.status === 'waiting_room' || s.status === 'scheduled'
    ).length

    const byType: Record<SessionType, number> = {
      pre_op_consult: sessions.filter(
        (s: Record<string, unknown>) => s.session_type === 'pre_op_consult'
      ).length,
      post_op_followup: sessions.filter(
        (s: Record<string, unknown>) => s.session_type === 'post_op_followup'
      ).length,
      general_consult: sessions.filter(
        (s: Record<string, unknown>) => s.session_type === 'general_consult'
      ).length,
      second_opinion: sessions.filter(
        (s: Record<string, unknown>) => s.session_type === 'second_opinion'
      ).length,
      urgent_care: sessions.filter(
        (s: Record<string, unknown>) => s.session_type === 'urgent_care'
      ).length,
    }

    // Aggregate by physician
    const physicianMap = new Map<string, { count: number }>()
    for (const s of sessions) {
      const row = s as Record<string, unknown>
      const pid = row.physician_id as string
      const existing = physicianMap.get(pid)
      if (existing) {
        existing.count += 1
      } else {
        physicianMap.set(pid, { count: 1 })
      }
    }

    // Fetch physician names
    const physicianIds = Array.from(physicianMap.keys())
    let byPhysician: TelemedicineStats['byPhysician'] = []

    if (physicianIds.length > 0) {
      const { data: physicians } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', physicianIds)

      byPhysician = physicianIds
        .map((pid) => {
          const profile = (physicians ?? []).find(
            (p: Record<string, unknown>) => p.id === pid
          )
          return {
            physician_id: pid,
            physician_name: (profile?.full_name as string) ?? 'Unknown',
            session_count: physicianMap.get(pid)?.count ?? 0,
          }
        })
        .sort((a, b) => b.session_count - a.session_count)
    }

    return {
      success: true,
      data: {
        totalSessions,
        completedSessions,
        completionRate,
        averageDurationMinutes,
        pendingRequests,
        byType,
        byPhysician,
      },
    }
  } catch {
    return { success: false, error: 'An unexpected error occurred.' }
  }
}

// ============================================
// getPendingSessionRequests -- sessions in waiting_room
// ============================================

export async function getPendingSessionRequests(): Promise<
  ActionResult<TelemedicineSessionWithDetails[]>
> {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('telemedicine_sessions')
      .select(SESSION_SELECT_WITH_DETAILS)
      .eq('status', 'waiting_room')
      .order('created_at', { ascending: true })

    if (error) {
      return { success: false, error: 'Could not load pending requests.' }
    }

    const sessions = (data ?? []).map((row: Record<string, unknown>) =>
      mapSessionRow(row)
    )

    return { success: true, data: sessions }
  } catch {
    return { success: false, error: 'An unexpected error occurred.' }
  }
}

// ============================================
// approveSession -- move from waiting_room to in_progress
// ============================================

export async function approveSession(
  sessionId: string
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const { data: current, error: fetchError } = await supabase
      .from('telemedicine_sessions')
      .select('status')
      .eq('id', sessionId)
      .single()

    if (fetchError || !current) {
      return { success: false, error: 'Session not found.' }
    }

    if ((current as Record<string, unknown>).status !== 'waiting_room') {
      return { success: false, error: 'Only waiting room sessions can be approved.' }
    }

    const { error } = await supabase
      .from('telemedicine_sessions')
      .update({
        status: 'in_progress',
        actual_start: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId)

    if (error) {
      return { success: false, error: 'Failed to approve session.' }
    }

    revalidatePath('/admin/telemedicine')
    revalidatePath('/admin/telemedicine/sessions')

    return { success: true, data: { id: sessionId } }
  } catch {
    return { success: false, error: 'An unexpected error occurred.' }
  }
}

// ============================================
// cancelSession -- cancel a session with reason
// ============================================

export async function cancelSession(
  sessionId: string,
  _reason: string
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const { data: current, error: fetchError } = await supabase
      .from('telemedicine_sessions')
      .select('status')
      .eq('id', sessionId)
      .single()

    if (fetchError || !current) {
      return { success: false, error: 'Session not found.' }
    }

    const currentStatus = (current as Record<string, unknown>).status as string
    if (currentStatus === 'completed' || currentStatus === 'cancelled') {
      return {
        success: false,
        error: 'Cannot cancel a completed or already cancelled session.',
      }
    }

    const { error } = await supabase
      .from('telemedicine_sessions')
      .update({
        status: 'cancelled',
        clinical_notes: _reason ? `Cancelled: ${_reason}` : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId)

    if (error) {
      return { success: false, error: 'Failed to cancel session.' }
    }

    revalidatePath('/admin/telemedicine')
    revalidatePath('/admin/telemedicine/sessions')
    revalidatePath(`/admin/telemedicine/sessions/${sessionId}`)

    return { success: true, data: { id: sessionId } }
  } catch {
    return { success: false, error: 'An unexpected error occurred.' }
  }
}

// ============================================
// updateSessionStatus -- generic status update
// ============================================

export async function updateSessionStatus(
  sessionId: string,
  status: SessionStatus
): Promise<ActionResult<{ id: string }>> {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const updatePayload: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    }

    if (status === 'in_progress') {
      updatePayload.actual_start = new Date().toISOString()
    }

    if (status === 'completed') {
      updatePayload.actual_end = new Date().toISOString()
    }

    const { error } = await supabase
      .from('telemedicine_sessions')
      .update(updatePayload)
      .eq('id', sessionId)

    if (error) {
      return { success: false, error: 'Failed to update session status.' }
    }

    revalidatePath('/admin/telemedicine')
    revalidatePath('/admin/telemedicine/sessions')
    revalidatePath(`/admin/telemedicine/sessions/${sessionId}`)

    return { success: true, data: { id: sessionId } }
  } catch {
    return { success: false, error: 'An unexpected error occurred.' }
  }
}

// ============================================
// getPhysicianList -- for filter dropdowns
// ============================================

export async function getPhysicianList(): Promise<
  ActionResult<{ id: string; full_name: string }[]>
> {
  try {
    await requireAdmin()
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('role', 'physician')
      .order('full_name', { ascending: true })

    if (error) {
      return { success: false, error: 'Could not load physicians.' }
    }

    const physicians = (data ?? []).map((p: Record<string, unknown>) => ({
      id: p.id as string,
      full_name: (p.full_name as string) ?? 'Unknown',
    }))

    return { success: true, data: physicians }
  } catch {
    return { success: false, error: 'An unexpected error occurred.' }
  }
}
