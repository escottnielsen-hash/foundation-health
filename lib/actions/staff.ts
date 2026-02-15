'use server'

import { createClient } from '@/lib/supabase/server'
import {
  schedulingFilterSchema,
  checkInSchema,
  taskCreateSchema,
  taskFilterSchema,
  confirmAppointmentSchema,
  cancelByStaffSchema,
  completeTaskSchema,
} from '@/lib/validations/staff'
import type { CheckInData, TaskCreateData, SchedulingFilterData, TaskFilterData, CancelByStaffData } from '@/lib/validations/staff'
import type {
  StaffDashboardData,
  AppointmentQueueEntry,
  CheckedInPatientEntry,
  SchedulingEntry,
  StaffTaskWithDetails,
} from '@/types/staff'
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
// Staff role verification helper
// ============================================

async function verifyStaffRole(): Promise<{ userId: string } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role
  if (role !== 'staff' && role !== 'admin') return null

  return { userId: user.id }
}

// ============================================
// getStaffDashboard
// ============================================

export async function getStaffDashboard(): Promise<ActionResult<{
  metrics: StaffDashboardData
  queue: AppointmentQueueEntry[]
  checkedIn: CheckedInPatientEntry[]
}>> {
  try {
    const auth = await verifyStaffRole()
    if (!auth) {
      return { success: false, error: 'Unauthorized. Staff or admin access required.' }
    }

    const supabase = await createClient()
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    // Get today's appointments with patient + physician data
    const { data: appointments, error: aptError } = await supabase
      .from('appointments')
      .select(`
        id,
        patient_id,
        physician_id,
        scheduled_start,
        scheduled_end,
        appointment_type,
        status,
        location_id,
        reason_for_visit,
        is_telehealth,
        notes,
        patient_profile:patient_profiles!appointments_patient_id_fkey(
          user_id,
          patient_user:profiles!patient_profiles_user_id_fkey(
            first_name,
            last_name
          )
        ),
        physician_profile:physician_profiles!appointments_physician_id_fkey(
          user_id,
          physician_user:profiles!physician_profiles_user_id_fkey(
            first_name,
            last_name
          )
        ),
        appointment_location:locations(name)
      `)
      .gte('scheduled_start', todayStart.toISOString())
      .lte('scheduled_start', todayEnd.toISOString())
      .order('scheduled_start', { ascending: true })

    if (aptError) {
      return { success: false, error: 'Failed to load dashboard data.' }
    }

    const allApts = appointments ?? []

    // Compute metrics
    let checkedInCount = 0
    let noShowCount = 0
    let cancelledCount = 0
    let confirmedCount = 0

    for (const apt of allApts) {
      const rec = apt as Record<string, unknown>
      const status = rec.status as string
      if (status === 'no_show') noShowCount++
      else if (status === 'cancelled') cancelledCount++
      else if (status === 'confirmed') confirmedCount++
      else if (status === 'in_progress') checkedInCount++
    }

    // Get encounters for today (checked-in patients)
    const { data: encounters } = await supabase
      .from('encounters')
      .select(`
        id,
        appointment_id,
        patient_id,
        physician_id,
        check_in_time,
        status,
        patient_enc:profiles!encounters_patient_id_fkey(
          first_name,
          last_name
        ),
        physician_enc_profile:physician_profiles!encounters_physician_id_fkey(
          user_id,
          physician_enc_user:profiles!physician_profiles_user_id_fkey(
            first_name,
            last_name
          )
        )
      `)
      .in('status', ['checked_in', 'in_progress'])
      .gte('check_in_time', todayStart.toISOString())
      .lte('check_in_time', todayEnd.toISOString())

    // Get pending task count
    const { count: pendingTaskCount } = await supabase
      .from('staff_tasks')
      .select('id', { count: 'exact', head: true })
      .in('status', ['pending', 'in_progress'])

    // Build queue entries
    const queue: AppointmentQueueEntry[] = allApts.map((apt) => {
      const rec = apt as Record<string, unknown>
      const patientProfile = rec.patient_profile as {
        user_id: string
        patient_user: { first_name: string | null; last_name: string | null }
      } | null
      const physicianProfile = rec.physician_profile as {
        user_id: string
        physician_user: { first_name: string | null; last_name: string | null }
      } | null
      const loc = rec.appointment_location as { name: string } | null

      const patientName = patientProfile?.patient_user
        ? [patientProfile.patient_user.first_name, patientProfile.patient_user.last_name].filter(Boolean).join(' ') || null
        : null

      const physicianName = physicianProfile?.physician_user
        ? [physicianProfile.physician_user.first_name, physicianProfile.physician_user.last_name].filter(Boolean).join(' ') || null
        : null

      // Find encounter check-in time if any
      const encounter = (encounters ?? []).find((e) => {
        const eRec = e as Record<string, unknown>
        return eRec.appointment_id === rec.id
      })
      const encounterRec = encounter as Record<string, unknown> | undefined

      return {
        id: rec.id as string,
        patient_name: patientName,
        patient_id: rec.patient_id as string,
        physician_name: physicianName,
        physician_id: rec.physician_id as string,
        scheduled_start: rec.scheduled_start as string,
        scheduled_end: rec.scheduled_end as string,
        appointment_type: rec.appointment_type as string,
        status: rec.status as string,
        location_name: loc?.name ?? null,
        reason_for_visit: (rec.reason_for_visit as string) ?? null,
        is_telehealth: rec.is_telehealth as boolean,
        check_in_time: (encounterRec?.check_in_time as string) ?? null,
      }
    })

    // Build checked-in list
    const checkedIn: CheckedInPatientEntry[] = (encounters ?? [])
      .filter((e) => {
        const eRec = e as Record<string, unknown>
        return eRec.check_in_time
      })
      .map((e) => {
        const eRec = e as Record<string, unknown>
        const patientEnc = eRec.patient_enc as { first_name: string | null; last_name: string | null } | null
        const physicianEncProfile = eRec.physician_enc_profile as {
          user_id: string
          physician_enc_user: { first_name: string | null; last_name: string | null }
        } | null

        const patientName = patientEnc
          ? [patientEnc.first_name, patientEnc.last_name].filter(Boolean).join(' ') || null
          : null

        const physicianName = physicianEncProfile?.physician_enc_user
          ? [physicianEncProfile.physician_enc_user.first_name, physicianEncProfile.physician_enc_user.last_name].filter(Boolean).join(' ') || null
          : null

        const checkInTime = eRec.check_in_time as string
        const waitMinutes = Math.round((Date.now() - new Date(checkInTime).getTime()) / 60000)

        // Find the matching appointment to get scheduled_start
        const matchingApt = allApts.find((a) => {
          const aRec = a as Record<string, unknown>
          return aRec.id === eRec.appointment_id
        })
        const matchingAptRec = matchingApt as Record<string, unknown> | undefined

        return {
          appointment_id: (eRec.appointment_id as string) ?? '',
          patient_name: patientName,
          patient_id: eRec.patient_id as string,
          physician_name: physicianName,
          check_in_time: checkInTime,
          scheduled_start: (matchingAptRec?.scheduled_start as string) ?? checkInTime,
          wait_minutes: waitMinutes > 0 ? waitMinutes : 0,
        }
      })

    const metrics: StaffDashboardData = {
      appointmentsToday: allApts.length,
      checkedInCount: checkedIn.length,
      noShowCount,
      cancelledCount,
      confirmedCount,
      pendingTaskCount: pendingTaskCount ?? 0,
    }

    return { success: true, data: { metrics, queue, checkedIn } }
  } catch {
    return { success: false, error: 'An unexpected error occurred loading the dashboard.' }
  }
}

// ============================================
// getTodaysAppointments
// ============================================

export async function getTodaysAppointments(
  locationId?: string
): Promise<ActionResult<AppointmentQueueEntry[]>> {
  try {
    const auth = await verifyStaffRole()
    if (!auth) {
      return { success: false, error: 'Unauthorized. Staff or admin access required.' }
    }

    const supabase = await createClient()
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    const todayEnd = new Date()
    todayEnd.setHours(23, 59, 59, 999)

    let query = supabase
      .from('appointments')
      .select(`
        id,
        patient_id,
        physician_id,
        scheduled_start,
        scheduled_end,
        appointment_type,
        status,
        location_id,
        reason_for_visit,
        is_telehealth,
        patient_profile:patient_profiles!appointments_patient_id_fkey(
          user_id,
          patient_user:profiles!patient_profiles_user_id_fkey(
            first_name,
            last_name
          )
        ),
        physician_profile:physician_profiles!appointments_physician_id_fkey(
          user_id,
          physician_user:profiles!physician_profiles_user_id_fkey(
            first_name,
            last_name
          )
        ),
        appointment_location:locations(name)
      `)
      .gte('scheduled_start', todayStart.toISOString())
      .lte('scheduled_start', todayEnd.toISOString())
      .order('scheduled_start', { ascending: true })

    if (locationId) {
      query = query.eq('location_id', locationId)
    }

    const { data: appointments, error } = await query

    if (error) {
      return { success: false, error: 'Failed to load today\'s appointments.' }
    }

    const result: AppointmentQueueEntry[] = (appointments ?? []).map((apt) => {
      const rec = apt as Record<string, unknown>
      const patientProfile = rec.patient_profile as {
        user_id: string
        patient_user: { first_name: string | null; last_name: string | null }
      } | null
      const physicianProfile = rec.physician_profile as {
        user_id: string
        physician_user: { first_name: string | null; last_name: string | null }
      } | null
      const loc = rec.appointment_location as { name: string } | null

      const patientName = patientProfile?.patient_user
        ? [patientProfile.patient_user.first_name, patientProfile.patient_user.last_name].filter(Boolean).join(' ') || null
        : null

      const physicianName = physicianProfile?.physician_user
        ? [physicianProfile.physician_user.first_name, physicianProfile.physician_user.last_name].filter(Boolean).join(' ') || null
        : null

      return {
        id: rec.id as string,
        patient_name: patientName,
        patient_id: rec.patient_id as string,
        physician_name: physicianName,
        physician_id: rec.physician_id as string,
        scheduled_start: rec.scheduled_start as string,
        scheduled_end: rec.scheduled_end as string,
        appointment_type: rec.appointment_type as string,
        status: rec.status as string,
        location_name: loc?.name ?? null,
        reason_for_visit: (rec.reason_for_visit as string) ?? null,
        is_telehealth: rec.is_telehealth as boolean,
        check_in_time: null,
      }
    })

    return { success: true, data: result }
  } catch {
    return { success: false, error: 'An unexpected error occurred loading appointments.' }
  }
}

// ============================================
// getSchedulingView
// ============================================

export async function getSchedulingView(
  filters: SchedulingFilterData
): Promise<ActionResult<SchedulingEntry[]>> {
  try {
    const auth = await verifyStaffRole()
    if (!auth) {
      return { success: false, error: 'Unauthorized. Staff or admin access required.' }
    }

    const parsed = schedulingFilterSchema.safeParse(filters)
    if (!parsed.success) {
      return { success: false, error: 'Invalid filter parameters.' }
    }

    const f = parsed.data
    const supabase = await createClient()

    let query = supabase
      .from('appointments')
      .select(`
        id,
        patient_id,
        physician_id,
        scheduled_start,
        scheduled_end,
        appointment_type,
        status,
        location_id,
        reason_for_visit,
        is_telehealth,
        notes,
        patient_profile:patient_profiles!appointments_patient_id_fkey(
          user_id,
          patient_user:profiles!patient_profiles_user_id_fkey(
            first_name,
            last_name
          )
        ),
        physician_profile:physician_profiles!appointments_physician_id_fkey(
          user_id,
          physician_user:profiles!physician_profiles_user_id_fkey(
            first_name,
            last_name
          )
        ),
        appointment_location:locations(name)
      `)
      .order('scheduled_start', { ascending: true })

    if (f.physician_id) {
      query = query.eq('physician_id', f.physician_id)
    }
    if (f.date_from) {
      query = query.gte('scheduled_start', `${f.date_from}T00:00:00.000Z`)
    }
    if (f.date_to) {
      query = query.lte('scheduled_start', `${f.date_to}T23:59:59.999Z`)
    }
    if (f.status) {
      query = query.eq('status', f.status)
    }
    if (f.location_id) {
      query = query.eq('location_id', f.location_id)
    }

    const { data: appointments, error } = await query.limit(200)

    if (error) {
      return { success: false, error: 'Failed to load scheduling data.' }
    }

    const result: SchedulingEntry[] = (appointments ?? []).map((apt) => {
      const rec = apt as Record<string, unknown>
      const patientProfile = rec.patient_profile as {
        user_id: string
        patient_user: { first_name: string | null; last_name: string | null }
      } | null
      const physicianProfile = rec.physician_profile as {
        user_id: string
        physician_user: { first_name: string | null; last_name: string | null }
      } | null
      const loc = rec.appointment_location as { name: string } | null

      const patientName = patientProfile?.patient_user
        ? [patientProfile.patient_user.first_name, patientProfile.patient_user.last_name].filter(Boolean).join(' ') || null
        : null

      const physicianName = physicianProfile?.physician_user
        ? [physicianProfile.physician_user.first_name, physicianProfile.physician_user.last_name].filter(Boolean).join(' ') || null
        : null

      return {
        id: rec.id as string,
        patient_name: patientName,
        patient_id: rec.patient_id as string,
        physician_name: physicianName,
        physician_id: rec.physician_id as string,
        scheduled_start: rec.scheduled_start as string,
        scheduled_end: rec.scheduled_end as string,
        appointment_type: rec.appointment_type as string,
        status: rec.status as string,
        location_name: loc?.name ?? null,
        location_id: (rec.location_id as string) ?? null,
        reason_for_visit: (rec.reason_for_visit as string) ?? null,
        is_telehealth: rec.is_telehealth as boolean,
        notes: (rec.notes as string) ?? null,
      }
    })

    return { success: true, data: result }
  } catch {
    return { success: false, error: 'An unexpected error occurred loading scheduling data.' }
  }
}

// ============================================
// confirmAppointment
// ============================================

export async function confirmAppointment(
  appointmentId: string
): Promise<ActionResult<{ confirmed: true }>> {
  try {
    const auth = await verifyStaffRole()
    if (!auth) {
      return { success: false, error: 'Unauthorized. Staff or admin access required.' }
    }

    const parsed = confirmAppointmentSchema.safeParse({ appointment_id: appointmentId })
    if (!parsed.success) {
      return { success: false, error: 'Invalid appointment ID.' }
    }

    const supabase = await createClient()

    const { data: apt, error: fetchError } = await supabase
      .from('appointments')
      .select('id, status')
      .eq('id', appointmentId)
      .single()

    if (fetchError || !apt) {
      return { success: false, error: 'Appointment not found.' }
    }

    if (apt.status !== 'scheduled') {
      return { success: false, error: 'Only scheduled appointments can be confirmed.' }
    }

    const { error: updateError } = await supabase
      .from('appointments')
      .update({ status: 'confirmed', updated_at: new Date().toISOString() })
      .eq('id', appointmentId)

    if (updateError) {
      return { success: false, error: 'Failed to confirm appointment.' }
    }

    return { success: true, data: { confirmed: true } }
  } catch {
    return { success: false, error: 'An unexpected error occurred confirming the appointment.' }
  }
}

// ============================================
// cancelAppointmentByStaff
// ============================================

export async function cancelAppointmentByStaff(
  appointmentId: string,
  reason: string
): Promise<ActionResult<{ cancelled: true }>> {
  try {
    const auth = await verifyStaffRole()
    if (!auth) {
      return { success: false, error: 'Unauthorized. Staff or admin access required.' }
    }

    const parsed = cancelByStaffSchema.safeParse({ appointment_id: appointmentId, reason })
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of (parsed.error as ZodError).issues) {
        const fieldName = issue.path.join('.')
        if (fieldName && !fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message
        }
      }
      return { success: false, error: 'Validation error.', fieldErrors }
    }

    const supabase = await createClient()

    const { data: apt, error: fetchError } = await supabase
      .from('appointments')
      .select('id, status')
      .eq('id', appointmentId)
      .single()

    if (fetchError || !apt) {
      return { success: false, error: 'Appointment not found.' }
    }

    if (apt.status === 'completed' || apt.status === 'cancelled') {
      return { success: false, error: 'This appointment cannot be cancelled.' }
    }

    const { error: updateError } = await supabase
      .from('appointments')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancelled_by: auth.userId,
        cancellation_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', appointmentId)

    if (updateError) {
      return { success: false, error: 'Failed to cancel appointment.' }
    }

    return { success: true, data: { cancelled: true } }
  } catch {
    return { success: false, error: 'An unexpected error occurred cancelling the appointment.' }
  }
}

// ============================================
// checkInPatient
// ============================================

export async function checkInPatient(
  data: CheckInData
): Promise<ActionResult<{ encounter_id: string }>> {
  try {
    const auth = await verifyStaffRole()
    if (!auth) {
      return { success: false, error: 'Unauthorized. Staff or admin access required.' }
    }

    const parsed = checkInSchema.safeParse(data)
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of (parsed.error as ZodError).issues) {
        const fieldName = issue.path.join('.')
        if (fieldName && !fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message
        }
      }
      return { success: false, error: 'Validation error.', fieldErrors }
    }

    const validData = parsed.data
    const supabase = await createClient()

    // Verify appointment exists and is scheduled or confirmed
    const { data: apt, error: aptError } = await supabase
      .from('appointments')
      .select('id, patient_id, physician_id, location_id, status, reason_for_visit, is_telehealth')
      .eq('id', validData.appointment_id)
      .single()

    if (aptError || !apt) {
      return { success: false, error: 'Appointment not found.' }
    }

    if (apt.status !== 'scheduled' && apt.status !== 'confirmed') {
      return { success: false, error: 'Only scheduled or confirmed appointments can be checked in.' }
    }

    const now = new Date().toISOString()

    // Update appointment to in_progress
    const { error: updateError } = await supabase
      .from('appointments')
      .update({
        status: 'in_progress',
        actual_start: now,
        updated_at: now,
      })
      .eq('id', validData.appointment_id)

    if (updateError) {
      return { success: false, error: 'Failed to update appointment status.' }
    }

    // Create encounter stub
    const { data: encounter, error: encounterError } = await supabase
      .from('encounters')
      .insert({
        appointment_id: validData.appointment_id,
        patient_id: apt.patient_id,
        physician_id: apt.physician_id,
        location_id: apt.location_id ?? null,
        status: 'checked_in',
        check_in_time: now,
        chief_complaint: apt.reason_for_visit ?? null,
        visit_notes: validData.notes || null,
        is_telehealth: apt.is_telehealth,
      })
      .select('id')
      .single()

    if (encounterError || !encounter) {
      return { success: false, error: 'Failed to create encounter record.' }
    }

    return { success: true, data: { encounter_id: encounter.id } }
  } catch {
    return { success: false, error: 'An unexpected error occurred during check-in.' }
  }
}

// ============================================
// getStaffTasks
// ============================================

export async function getStaffTasks(
  filters: TaskFilterData
): Promise<ActionResult<StaffTaskWithDetails[]>> {
  try {
    const auth = await verifyStaffRole()
    if (!auth) {
      return { success: false, error: 'Unauthorized. Staff or admin access required.' }
    }

    const parsed = taskFilterSchema.safeParse(filters)
    if (!parsed.success) {
      return { success: false, error: 'Invalid filter parameters.' }
    }

    const f = parsed.data
    const supabase = await createClient()

    let query = supabase
      .from('staff_tasks')
      .select(`
        *,
        assigned_profile:profiles!staff_tasks_assigned_to_fkey(
          first_name,
          last_name
        ),
        creator_profile:profiles!staff_tasks_created_by_fkey(
          first_name,
          last_name
        ),
        patient_profile:profiles!staff_tasks_related_patient_id_fkey(
          first_name,
          last_name
        )
      `)
      .order('created_at', { ascending: false })

    if (f.category) {
      query = query.eq('category', f.category)
    }
    if (f.priority) {
      query = query.eq('priority', f.priority)
    }
    if (f.status) {
      query = query.eq('status', f.status)
    }
    if (f.date_from) {
      query = query.gte('due_date', f.date_from)
    }
    if (f.date_to) {
      query = query.lte('due_date', f.date_to)
    }

    const { data: tasks, error } = await query.limit(200)

    if (error) {
      return { success: false, error: 'Failed to load tasks.' }
    }

    const result: StaffTaskWithDetails[] = (tasks ?? []).map((task) => {
      const rec = task as Record<string, unknown>
      const assigned = rec.assigned_profile as { first_name: string | null; last_name: string | null } | null
      const creator = rec.creator_profile as { first_name: string | null; last_name: string | null } | null
      const patient = rec.patient_profile as { first_name: string | null; last_name: string | null } | null

      return {
        id: rec.id as string,
        assigned_to: (rec.assigned_to as string) ?? null,
        created_by: rec.created_by as string,
        title: rec.title as string,
        description: (rec.description as string) ?? null,
        category: rec.category as StaffTaskWithDetails['category'],
        priority: rec.priority as StaffTaskWithDetails['priority'],
        status: rec.status as StaffTaskWithDetails['status'],
        due_date: (rec.due_date as string) ?? null,
        related_patient_id: (rec.related_patient_id as string) ?? null,
        related_appointment_id: (rec.related_appointment_id as string) ?? null,
        completed_at: (rec.completed_at as string) ?? null,
        created_at: rec.created_at as string,
        updated_at: rec.updated_at as string,
        assigned_to_name: assigned
          ? [assigned.first_name, assigned.last_name].filter(Boolean).join(' ') || null
          : null,
        created_by_name: creator
          ? [creator.first_name, creator.last_name].filter(Boolean).join(' ') || null
          : null,
        patient_name: patient
          ? [patient.first_name, patient.last_name].filter(Boolean).join(' ') || null
          : null,
      }
    })

    return { success: true, data: result }
  } catch {
    return { success: false, error: 'An unexpected error occurred loading tasks.' }
  }
}

// ============================================
// completeTask
// ============================================

export async function completeTask(
  taskId: string
): Promise<ActionResult<{ completed: true }>> {
  try {
    const auth = await verifyStaffRole()
    if (!auth) {
      return { success: false, error: 'Unauthorized. Staff or admin access required.' }
    }

    const parsed = completeTaskSchema.safeParse({ task_id: taskId })
    if (!parsed.success) {
      return { success: false, error: 'Invalid task ID.' }
    }

    const supabase = await createClient()

    const { data: task, error: fetchError } = await supabase
      .from('staff_tasks')
      .select('id, status')
      .eq('id', taskId)
      .single()

    if (fetchError || !task) {
      return { success: false, error: 'Task not found.' }
    }

    if (task.status === 'completed') {
      return { success: false, error: 'Task is already completed.' }
    }

    const { error: updateError } = await supabase
      .from('staff_tasks')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', taskId)

    if (updateError) {
      return { success: false, error: 'Failed to complete task.' }
    }

    return { success: true, data: { completed: true } }
  } catch {
    return { success: false, error: 'An unexpected error occurred completing the task.' }
  }
}

// ============================================
// createTask
// ============================================

export async function createTask(
  data: TaskCreateData
): Promise<ActionResult<{ task_id: string }>> {
  try {
    const auth = await verifyStaffRole()
    if (!auth) {
      return { success: false, error: 'Unauthorized. Staff or admin access required.' }
    }

    const parsed = taskCreateSchema.safeParse(data)
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of (parsed.error as ZodError).issues) {
        const fieldName = issue.path.join('.')
        if (fieldName && !fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message
        }
      }
      return { success: false, error: 'Validation error.', fieldErrors }
    }

    const validData = parsed.data
    const supabase = await createClient()

    const { data: newTask, error: insertError } = await supabase
      .from('staff_tasks')
      .insert({
        title: validData.title,
        description: validData.description || null,
        category: validData.category,
        priority: validData.priority,
        due_date: validData.due_date || null,
        assigned_to: validData.assigned_to || null,
        related_patient_id: validData.related_patient_id || null,
        related_appointment_id: validData.related_appointment_id || null,
        created_by: auth.userId,
        status: 'pending',
      })
      .select('id')
      .single()

    if (insertError || !newTask) {
      return { success: false, error: 'Failed to create task.' }
    }

    return { success: true, data: { task_id: newTask.id } }
  } catch {
    return { success: false, error: 'An unexpected error occurred creating the task.' }
  }
}
