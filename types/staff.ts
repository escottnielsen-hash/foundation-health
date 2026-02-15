// ============================================
// Staff Portal Types
// ============================================

export type TaskCategory = 'insurance_verification' | 'follow_up_scheduling' | 'document_request' | 'general'
export type TaskPriority = 'low' | 'normal' | 'high' | 'urgent'
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'

// ============================================
// Staff Task
// ============================================

export interface StaffTask {
  id: string
  assigned_to: string | null
  created_by: string
  title: string
  description: string | null
  category: TaskCategory
  priority: TaskPriority
  status: TaskStatus
  due_date: string | null
  related_patient_id: string | null
  related_appointment_id: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

// ============================================
// Staff Task with joined fields
// ============================================

export interface StaffTaskWithDetails extends StaffTask {
  assigned_to_name: string | null
  created_by_name: string | null
  patient_name: string | null
}

// ============================================
// Staff Dashboard Data
// ============================================

export interface StaffDashboardData {
  appointmentsToday: number
  checkedInCount: number
  noShowCount: number
  cancelledCount: number
  confirmedCount: number
  pendingTaskCount: number
}

// ============================================
// Check-In Form Data
// ============================================

export interface CheckInFormData {
  appointment_id: string
  insurance_confirmed: boolean
  notes: string | null
}

// ============================================
// Appointment queue entry (dashboard)
// ============================================

export interface AppointmentQueueEntry {
  id: string
  patient_name: string | null
  patient_id: string
  physician_name: string | null
  physician_id: string
  scheduled_start: string
  scheduled_end: string
  appointment_type: string
  status: string
  location_name: string | null
  reason_for_visit: string | null
  is_telehealth: boolean
  check_in_time: string | null
}

// ============================================
// Checked-in patient entry
// ============================================

export interface CheckedInPatientEntry {
  appointment_id: string
  patient_name: string | null
  patient_id: string
  physician_name: string | null
  check_in_time: string
  scheduled_start: string
  wait_minutes: number
}

// ============================================
// Scheduling filters
// ============================================

export interface SchedulingFilters {
  physician_id?: string | null
  date_from?: string | null
  date_to?: string | null
  status?: string | null
  location_id?: string | null
}

// ============================================
// Task filters
// ============================================

export interface TaskFilters {
  category?: string | null
  priority?: string | null
  status?: string | null
  date_from?: string | null
  date_to?: string | null
}

// ============================================
// Scheduling view entry
// ============================================

export interface SchedulingEntry {
  id: string
  patient_name: string | null
  patient_id: string
  physician_name: string | null
  physician_id: string
  scheduled_start: string
  scheduled_end: string
  appointment_type: string
  status: string
  location_name: string | null
  location_id: string | null
  reason_for_visit: string | null
  is_telehealth: boolean
  notes: string | null
}
