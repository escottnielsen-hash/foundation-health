import { z } from 'zod'

// ============================================
// UUID regex
// ============================================

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const dateRegex = /^\d{4}-\d{2}-\d{2}$/

// ============================================
// Scheduling filter schema
// ============================================

export const schedulingFilterSchema = z.object({
  physician_id: z
    .string()
    .regex(uuidRegex, 'Invalid physician ID')
    .optional()
    .nullable(),
  date_from: z
    .string()
    .regex(dateRegex, 'Date must be YYYY-MM-DD')
    .optional()
    .nullable(),
  date_to: z
    .string()
    .regex(dateRegex, 'Date must be YYYY-MM-DD')
    .optional()
    .nullable(),
  status: z
    .string()
    .optional()
    .nullable(),
  location_id: z
    .string()
    .regex(uuidRegex, 'Invalid location ID')
    .optional()
    .nullable(),
})

export type SchedulingFilterData = z.infer<typeof schedulingFilterSchema>

// ============================================
// Check-in schema
// ============================================

export const checkInSchema = z.object({
  appointment_id: z
    .string()
    .regex(uuidRegex, 'Invalid appointment ID'),
  insurance_confirmed: z.boolean(),
  notes: z
    .string()
    .max(1000, 'Notes must be 1000 characters or fewer')
    .optional()
    .nullable()
    .or(z.literal('')),
})

export type CheckInData = z.infer<typeof checkInSchema>

// ============================================
// Task creation schema
// ============================================

export const taskCreateSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or fewer'),
  description: z
    .string()
    .max(2000, 'Description must be 2000 characters or fewer')
    .optional()
    .nullable()
    .or(z.literal('')),
  category: z.enum([
    'insurance_verification',
    'follow_up_scheduling',
    'document_request',
    'general',
  ]),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
  due_date: z
    .string()
    .regex(dateRegex, 'Date must be YYYY-MM-DD')
    .optional()
    .nullable(),
  assigned_to: z
    .string()
    .regex(uuidRegex, 'Invalid assignee ID')
    .optional()
    .nullable(),
  related_patient_id: z
    .string()
    .regex(uuidRegex, 'Invalid patient ID')
    .optional()
    .nullable(),
  related_appointment_id: z
    .string()
    .regex(uuidRegex, 'Invalid appointment ID')
    .optional()
    .nullable(),
})

export type TaskCreateData = z.infer<typeof taskCreateSchema>

// ============================================
// Task filter schema
// ============================================

export const taskFilterSchema = z.object({
  category: z
    .string()
    .optional()
    .nullable(),
  priority: z
    .string()
    .optional()
    .nullable(),
  status: z
    .string()
    .optional()
    .nullable(),
  date_from: z
    .string()
    .regex(dateRegex, 'Date must be YYYY-MM-DD')
    .optional()
    .nullable(),
  date_to: z
    .string()
    .regex(dateRegex, 'Date must be YYYY-MM-DD')
    .optional()
    .nullable(),
})

export type TaskFilterData = z.infer<typeof taskFilterSchema>

// ============================================
// Confirm appointment schema
// ============================================

export const confirmAppointmentSchema = z.object({
  appointment_id: z
    .string()
    .regex(uuidRegex, 'Invalid appointment ID'),
})

// ============================================
// Cancel appointment by staff schema
// ============================================

export const cancelByStaffSchema = z.object({
  appointment_id: z
    .string()
    .regex(uuidRegex, 'Invalid appointment ID'),
  reason: z
    .string()
    .min(1, 'Cancellation reason is required')
    .max(500, 'Reason must be 500 characters or fewer'),
})

export type CancelByStaffData = z.infer<typeof cancelByStaffSchema>

// ============================================
// Complete task schema
// ============================================

export const completeTaskSchema = z.object({
  task_id: z
    .string()
    .regex(uuidRegex, 'Invalid task ID'),
})
