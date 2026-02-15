'use server'

import { createClient } from '@/lib/supabase/server'
import {
  sessionRequestSchema,
  sessionStatusUpdateSchema,
  sendMessageSchema,
  sessionFiltersSchema,
  type SessionRequestFormData,
  type SessionFiltersData,
} from '@/lib/validations/telemedicine'
import type {
  TelemedicineSession,
  TelemedicineMessage,
  Profile,
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

export interface SessionWithDetails extends TelemedicineSession {
  patient_first_name: string | null
  patient_last_name: string | null
  patient_avatar_url: string | null
  physician_first_name: string | null
  physician_last_name: string | null
  physician_avatar_url: string | null
}

export interface SessionDetailWithMessages extends SessionWithDetails {
  messages: TelemedicineMessageWithSender[]
}

export interface TelemedicineMessageWithSender extends TelemedicineMessage {
  sender_first_name: string | null
  sender_last_name: string | null
  sender_avatar_url: string | null
}

// ============================================
// Helper: extract field errors from Zod
// ============================================

function extractFieldErrors(error: ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {}
  for (const issue of error.issues) {
    const fieldName = issue.path.join('.')
    if (fieldName && !fieldErrors[fieldName]) {
      fieldErrors[fieldName] = issue.message
    }
  }
  return fieldErrors
}

// ============================================
// Helper: get current user's profile
// ============================================

async function getCurrentUserProfile(): Promise<{ userId: string; role: string } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', user.id)
    .single()

  if (!profile) return null

  return { userId: profile.id, role: profile.role }
}

// ============================================
// Helper: map session rows to SessionWithDetails
// ============================================

function mapSessionRow(row: Record<string, unknown>): SessionWithDetails {
  const patient = row.patient as Pick<Profile, 'first_name' | 'last_name' | 'avatar_url'> | null
  const physician = row.physician as Pick<Profile, 'first_name' | 'last_name' | 'avatar_url'> | null

  const { patient: _p, physician: _ph, ...rest } = row

  return {
    ...rest,
    patient_first_name: patient?.first_name ?? null,
    patient_last_name: patient?.last_name ?? null,
    patient_avatar_url: patient?.avatar_url ?? null,
    physician_first_name: physician?.first_name ?? null,
    physician_last_name: physician?.last_name ?? null,
    physician_avatar_url: physician?.avatar_url ?? null,
  } as SessionWithDetails
}

// ============================================
// getPatientSessions
// ============================================

export async function getPatientSessions(
  filters?: SessionFiltersData
): Promise<ActionResult<SessionWithDetails[]>> {
  try {
    const userProfile = await getCurrentUserProfile()
    if (!userProfile) {
      return { success: false, error: 'Authentication required.' }
    }

    // Validate filters if provided
    if (filters) {
      const parsed = sessionFiltersSchema.safeParse(filters)
      if (!parsed.success) {
        return {
          success: false,
          error: 'Invalid filter parameters.',
          fieldErrors: extractFieldErrors(parsed.error as ZodError),
        }
      }
    }

    const supabase = await createClient()

    let query = supabase
      .from('telemedicine_sessions')
      .select(`
        *,
        patient:profiles!telemedicine_sessions_patient_id_fkey(
          first_name,
          last_name,
          avatar_url
        ),
        physician:profiles!telemedicine_sessions_physician_id_fkey(
          first_name,
          last_name,
          avatar_url
        )
      `)

    // Scope to current user based on role
    if (userProfile.role === 'patient') {
      query = query.eq('patient_id', userProfile.userId)
    } else if (userProfile.role === 'physician') {
      query = query.or(`physician_id.eq.${userProfile.userId},patient_id.eq.${userProfile.userId}`)
    }
    // staff/admin see all (RLS handles this)

    // Apply filters
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.session_type) {
      query = query.eq('session_type', filters.session_type)
    }
    if (filters?.date_from) {
      query = query.gte('scheduled_start', `${filters.date_from}T00:00:00.000Z`)
    }
    if (filters?.date_to) {
      query = query.lte('scheduled_start', `${filters.date_to}T23:59:59.999Z`)
    }

    query = query.order('scheduled_start', { ascending: false })

    const { data: sessions, error } = await query

    if (error) {
      return {
        success: false,
        error: 'Could not load telemedicine sessions. Please try again.',
      }
    }

    const mapped: SessionWithDetails[] = (sessions ?? []).map((row) =>
      mapSessionRow(row as Record<string, unknown>)
    )

    return { success: true, data: mapped }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred while loading sessions.',
    }
  }
}

// ============================================
// getSessionDetail
// ============================================

export async function getSessionDetail(
  sessionId: string
): Promise<ActionResult<SessionDetailWithMessages>> {
  try {
    const userProfile = await getCurrentUserProfile()
    if (!userProfile) {
      return { success: false, error: 'Authentication required.' }
    }

    const supabase = await createClient()

    // Fetch the session with participant profiles
    const { data: session, error: sessionError } = await supabase
      .from('telemedicine_sessions')
      .select(`
        *,
        patient:profiles!telemedicine_sessions_patient_id_fkey(
          first_name,
          last_name,
          avatar_url
        ),
        physician:profiles!telemedicine_sessions_physician_id_fkey(
          first_name,
          last_name,
          avatar_url
        )
      `)
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) {
      return {
        success: false,
        error: 'Session not found or you do not have access.',
      }
    }

    // Verify the user has access to this session
    const rec = session as Record<string, unknown>
    const isPatient = rec.patient_id === userProfile.userId
    const isPhysician = rec.physician_id === userProfile.userId
    const isStaff = userProfile.role === 'staff' || userProfile.role === 'admin' || userProfile.role === 'physician'

    if (!isPatient && !isPhysician && !isStaff) {
      return {
        success: false,
        error: 'You do not have access to this session.',
      }
    }

    // Fetch messages for this session
    const { data: messages, error: messagesError } = await supabase
      .from('telemedicine_messages')
      .select(`
        *,
        sender:profiles!telemedicine_messages_sender_id_fkey(
          first_name,
          last_name,
          avatar_url
        )
      `)
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })

    if (messagesError) {
      return {
        success: false,
        error: 'Could not load session messages. Please try again.',
      }
    }

    const sessionData = mapSessionRow(rec)

    const mappedMessages: TelemedicineMessageWithSender[] = (messages ?? []).map((msg) => {
      const msgRec = msg as Record<string, unknown>
      const sender = msgRec.sender as Pick<Profile, 'first_name' | 'last_name' | 'avatar_url'> | null
      const { sender: _s, ...msgRest } = msgRec

      return {
        ...msgRest,
        sender_first_name: sender?.first_name ?? null,
        sender_last_name: sender?.last_name ?? null,
        sender_avatar_url: sender?.avatar_url ?? null,
      } as TelemedicineMessageWithSender
    })

    return {
      success: true,
      data: {
        ...sessionData,
        messages: mappedMessages,
      },
    }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred while loading session details.',
    }
  }
}

// ============================================
// requestSession
// ============================================

export async function requestSession(
  formData: SessionRequestFormData
): Promise<ActionResult<{ sessionId: string }>> {
  try {
    const userProfile = await getCurrentUserProfile()
    if (!userProfile) {
      return { success: false, error: 'Authentication required.' }
    }

    // Validate with Zod v4
    const parsed = sessionRequestSchema.safeParse(formData)

    if (!parsed.success) {
      return {
        success: false,
        error: 'Please fix the errors in the form.',
        fieldErrors: extractFieldErrors(parsed.error as ZodError),
      }
    }

    const data = parsed.data
    const supabase = await createClient()

    // Verify the physician exists and is active
    const { data: physicianProfile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', data.physician_id)
      .single()

    if (!physicianProfile || physicianProfile.role !== 'physician') {
      return {
        success: false,
        error: 'Selected physician not found or is not available.',
      }
    }

    // Create the telemedicine session
    const { data: newSession, error: insertError } = await supabase
      .from('telemedicine_sessions')
      .insert({
        patient_id: userProfile.userId,
        physician_id: data.physician_id,
        appointment_id: data.appointment_id || null,
        session_type: data.session_type,
        status: 'scheduled',
        scheduled_start: data.scheduled_start,
        scheduled_duration_minutes: data.scheduled_duration_minutes,
        chief_complaint: data.chief_complaint || null,
        patient_state: data.patient_state || null,
        patient_consent_given: false,
      })
      .select('id')
      .single()

    if (insertError || !newSession) {
      return {
        success: false,
        error: 'Failed to create telemedicine session. Please try again.',
      }
    }

    return {
      success: true,
      data: { sessionId: newSession.id },
    }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred while creating the session.',
    }
  }
}

// ============================================
// updateSessionStatus
// ============================================

export async function updateSessionStatus(
  sessionId: string,
  status: string,
  notes?: { clinical_notes?: string; follow_up_instructions?: string }
): Promise<ActionResult<{ updated: true }>> {
  try {
    const userProfile = await getCurrentUserProfile()
    if (!userProfile) {
      return { success: false, error: 'Authentication required.' }
    }

    // Only staff, admin, or physicians can update status
    if (userProfile.role !== 'physician' && userProfile.role !== 'staff' && userProfile.role !== 'admin') {
      return {
        success: false,
        error: 'You do not have permission to update session status.',
      }
    }

    // Validate
    const parsed = sessionStatusUpdateSchema.safeParse({
      session_id: sessionId,
      status,
      clinical_notes: notes?.clinical_notes ?? '',
      follow_up_instructions: notes?.follow_up_instructions ?? '',
    })

    if (!parsed.success) {
      return {
        success: false,
        error: 'Invalid session status data.',
        fieldErrors: extractFieldErrors(parsed.error as ZodError),
      }
    }

    const validatedData = parsed.data
    const supabase = await createClient()

    // Build the update object
    const updatePayload: Record<string, unknown> = {
      status: validatedData.status,
      updated_at: new Date().toISOString(),
    }

    // Set actual_start when transitioning to in_progress
    if (validatedData.status === 'in_progress') {
      updatePayload.actual_start = new Date().toISOString()
    }

    // Set actual_end when transitioning to completed
    if (validatedData.status === 'completed') {
      updatePayload.actual_end = new Date().toISOString()
    }

    // Include clinical notes if provided
    if (validatedData.clinical_notes) {
      updatePayload.clinical_notes = validatedData.clinical_notes
    }

    // Include follow-up instructions if provided
    if (validatedData.follow_up_instructions) {
      updatePayload.follow_up_instructions = validatedData.follow_up_instructions
    }

    const { error: updateError } = await supabase
      .from('telemedicine_sessions')
      .update(updatePayload)
      .eq('id', sessionId)

    if (updateError) {
      return {
        success: false,
        error: 'Failed to update session status. Please try again.',
      }
    }

    return { success: true, data: { updated: true } }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred while updating the session.',
    }
  }
}

// ============================================
// getUpcomingSessions
// ============================================

export async function getUpcomingSessions(): Promise<ActionResult<SessionWithDetails[]>> {
  try {
    const userProfile = await getCurrentUserProfile()
    if (!userProfile) {
      return { success: false, error: 'Authentication required.' }
    }

    const supabase = await createClient()
    const now = new Date().toISOString()

    let query = supabase
      .from('telemedicine_sessions')
      .select(`
        *,
        patient:profiles!telemedicine_sessions_patient_id_fkey(
          first_name,
          last_name,
          avatar_url
        ),
        physician:profiles!telemedicine_sessions_physician_id_fkey(
          first_name,
          last_name,
          avatar_url
        )
      `)
      .gte('scheduled_start', now)
      .in('status', ['scheduled', 'waiting_room'])
      .order('scheduled_start', { ascending: true })
      .limit(10)

    // Scope based on role
    if (userProfile.role === 'patient') {
      query = query.eq('patient_id', userProfile.userId)
    } else if (userProfile.role === 'physician') {
      query = query.eq('physician_id', userProfile.userId)
    }
    // staff/admin see all upcoming (RLS handles this)

    const { data: sessions, error } = await query

    if (error) {
      return {
        success: false,
        error: 'Could not load upcoming sessions. Please try again.',
      }
    }

    const mapped: SessionWithDetails[] = (sessions ?? []).map((row) =>
      mapSessionRow(row as Record<string, unknown>)
    )

    return { success: true, data: mapped }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred while loading upcoming sessions.',
    }
  }
}

// ============================================
// getSessionMessages
// ============================================

export async function getSessionMessages(
  sessionId: string
): Promise<ActionResult<TelemedicineMessageWithSender[]>> {
  try {
    const userProfile = await getCurrentUserProfile()
    if (!userProfile) {
      return { success: false, error: 'Authentication required.' }
    }

    const supabase = await createClient()

    // Verify user has access to this session
    const { data: session } = await supabase
      .from('telemedicine_sessions')
      .select('id, patient_id, physician_id')
      .eq('id', sessionId)
      .single()

    if (!session) {
      return {
        success: false,
        error: 'Session not found or you do not have access.',
      }
    }

    const isParticipant =
      session.patient_id === userProfile.userId ||
      session.physician_id === userProfile.userId
    const isStaff =
      userProfile.role === 'staff' ||
      userProfile.role === 'admin' ||
      userProfile.role === 'physician'

    if (!isParticipant && !isStaff) {
      return {
        success: false,
        error: 'You do not have access to this session.',
      }
    }

    const { data: messages, error } = await supabase
      .from('telemedicine_messages')
      .select(`
        *,
        sender:profiles!telemedicine_messages_sender_id_fkey(
          first_name,
          last_name,
          avatar_url
        )
      `)
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true })

    if (error) {
      return {
        success: false,
        error: 'Could not load messages. Please try again.',
      }
    }

    const mapped: TelemedicineMessageWithSender[] = (messages ?? []).map((msg) => {
      const msgRec = msg as Record<string, unknown>
      const sender = msgRec.sender as Pick<Profile, 'first_name' | 'last_name' | 'avatar_url'> | null
      const { sender: _s, ...rest } = msgRec

      return {
        ...rest,
        sender_first_name: sender?.first_name ?? null,
        sender_last_name: sender?.last_name ?? null,
        sender_avatar_url: sender?.avatar_url ?? null,
      } as TelemedicineMessageWithSender
    })

    return { success: true, data: mapped }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred while loading messages.',
    }
  }
}

// ============================================
// sendSessionMessage
// ============================================

export async function sendSessionMessage(
  sessionId: string,
  content: string,
  messageType: 'text' | 'image' | 'file' | 'system' = 'text'
): Promise<ActionResult<{ messageId: string }>> {
  try {
    const userProfile = await getCurrentUserProfile()
    if (!userProfile) {
      return { success: false, error: 'Authentication required.' }
    }

    // Validate with Zod v4
    const parsed = sendMessageSchema.safeParse({
      session_id: sessionId,
      content,
      message_type: messageType,
    })

    if (!parsed.success) {
      return {
        success: false,
        error: 'Invalid message data.',
        fieldErrors: extractFieldErrors(parsed.error as ZodError),
      }
    }

    const data = parsed.data
    const supabase = await createClient()

    // Verify the user is a participant or staff
    const { data: session } = await supabase
      .from('telemedicine_sessions')
      .select('id, patient_id, physician_id, status')
      .eq('id', data.session_id)
      .single()

    if (!session) {
      return {
        success: false,
        error: 'Session not found or you do not have access.',
      }
    }

    const isParticipant =
      session.patient_id === userProfile.userId ||
      session.physician_id === userProfile.userId
    const isStaff =
      userProfile.role === 'staff' ||
      userProfile.role === 'admin'

    if (!isParticipant && !isStaff) {
      return {
        success: false,
        error: 'You do not have permission to send messages in this session.',
      }
    }

    // Only allow messages in active sessions
    const activeStatuses = ['waiting_room', 'in_progress']
    if (!activeStatuses.includes(session.status)) {
      return {
        success: false,
        error: 'Messages can only be sent during active sessions.',
      }
    }

    // Insert the message
    const { data: newMessage, error: insertError } = await supabase
      .from('telemedicine_messages')
      .insert({
        session_id: data.session_id,
        sender_id: userProfile.userId,
        message_type: data.message_type,
        content: data.content,
        is_read: false,
      })
      .select('id')
      .single()

    if (insertError || !newMessage) {
      return {
        success: false,
        error: 'Failed to send message. Please try again.',
      }
    }

    return {
      success: true,
      data: { messageId: newMessage.id },
    }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred while sending the message.',
    }
  }
}

// ============================================
// requestTelemedicineSession -- alias for requestSession
// ============================================

export const requestTelemedicineSession = requestSession

// ============================================
// endTelemedicineSession -- end an active session
// ============================================

export async function endTelemedicineSession(
  sessionId: string,
  _userId: string
): Promise<ActionResult<{ ended: true }>> {
  try {
    const userProfile = await getCurrentUserProfile()
    if (!userProfile) {
      return { success: false, error: 'Authentication required.' }
    }

    const supabase = await createClient()

    // Verify user has access
    const { data: session } = await supabase
      .from('telemedicine_sessions')
      .select('id, patient_id, physician_id, status')
      .eq('id', sessionId)
      .single()

    if (!session) {
      return { success: false, error: 'Session not found.' }
    }

    const isParticipant =
      session.patient_id === userProfile.userId ||
      session.physician_id === userProfile.userId
    const isStaff =
      userProfile.role === 'staff' || userProfile.role === 'admin'

    if (!isParticipant && !isStaff) {
      return { success: false, error: 'You do not have permission to end this session.' }
    }

    const { error: updateError } = await supabase
      .from('telemedicine_sessions')
      .update({
        status: 'completed',
        actual_end: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', sessionId)

    if (updateError) {
      return { success: false, error: 'Failed to end session.' }
    }

    return { success: true, data: { ended: true } }
  } catch {
    return { success: false, error: 'An unexpected error occurred.' }
  }
}

// ============================================
// getTelemedicineProviders -- list physicians for session request
// ============================================

export async function getTelemedicineProviders(): Promise<
  ActionResult<{ id: string; full_name: string; specialty: string | null }[]>
> {
  try {
    const supabase = await createClient()

    const { data: physicians, error } = await supabase
      .from('profiles')
      .select('id, full_name')
      .eq('role', 'physician')
      .order('full_name', { ascending: true })

    if (error) {
      return { success: false, error: 'Could not load physicians.' }
    }

    // Get specialties from physician_profiles
    const physicianIds = (physicians ?? []).map((p: Record<string, unknown>) => p.id as string)

    let specialtyMap = new Map<string, string>()
    if (physicianIds.length > 0) {
      const { data: profiles } = await supabase
        .from('physician_profiles')
        .select('user_id, specialty')
        .in('user_id', physicianIds)

      if (profiles) {
        specialtyMap = new Map(
          profiles.map((p: Record<string, unknown>) => [
            p.user_id as string,
            (p.specialty as string) ?? '',
          ])
        )
      }
    }

    const providers = (physicians ?? []).map((p: Record<string, unknown>) => ({
      id: p.id as string,
      full_name: (p.full_name as string) ?? 'Unknown',
      specialty: specialtyMap.get(p.id as string) ?? null,
    }))

    return { success: true, data: providers }
  } catch {
    return { success: false, error: 'An unexpected error occurred.' }
  }
}
