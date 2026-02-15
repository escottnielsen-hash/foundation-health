import { z } from 'zod'

// ============================================
// Notification type constants
// ============================================

export const NOTIFICATION_TYPES = [
  { value: 'appointment', label: 'Appointments' },
  { value: 'claim', label: 'Claims' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'telemedicine', label: 'Telemedicine' },
  { value: 'billing', label: 'Billing' },
  { value: 'system', label: 'System' },
  { value: 'message', label: 'Messages' },
] as const

export const NOTIFICATION_TYPE_VALUES = NOTIFICATION_TYPES.map((t) => t.value)

// ============================================
// Notification priority constants
// ============================================

export const NOTIFICATION_PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
] as const

// ============================================
// Notification read status constants
// ============================================

export const NOTIFICATION_READ_STATUSES = [
  { value: 'all', label: 'All' },
  { value: 'unread', label: 'Unread' },
  { value: 'read', label: 'Read' },
] as const

// ============================================
// Notification filter schema (Zod v4)
// ============================================

export const notificationFilterSchema = z.object({
  type: z
    .enum([
      'appointment', 'claim', 'insurance', 'telemedicine',
      'billing', 'system', 'message',
    ])
    .optional()
    .or(z.literal('')),
  read_status: z
    .enum(['all', 'unread', 'read'])
    .optional()
    .or(z.literal('')),
  sort_order: z
    .enum(['asc', 'desc'])
    .optional()
    .or(z.literal('')),
})

export type NotificationFilterData = z.infer<typeof notificationFilterSchema>

// ============================================
// Notification ID schema
// ============================================

export const notificationIdSchema = z.object({
  id: z.string().uuid('Invalid notification ID format'),
})

export type NotificationIdData = z.infer<typeof notificationIdSchema>

// ============================================
// Notification type display configuration
// ============================================

export const NOTIFICATION_TYPE_CONFIG: Record<
  string,
  { label: string; iconColor: string; bgColor: string }
> = {
  appointment: { label: 'Appointment', iconColor: 'text-blue-600', bgColor: 'bg-blue-50' },
  claim: { label: 'Claim', iconColor: 'text-amber-600', bgColor: 'bg-amber-50' },
  insurance: { label: 'Insurance', iconColor: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  telemedicine: { label: 'Telemedicine', iconColor: 'text-purple-600', bgColor: 'bg-purple-50' },
  billing: { label: 'Billing', iconColor: 'text-green-600', bgColor: 'bg-green-50' },
  system: { label: 'System', iconColor: 'text-gray-600', bgColor: 'bg-gray-50' },
  message: { label: 'Message', iconColor: 'text-indigo-600', bgColor: 'bg-indigo-50' },
}

// ============================================
// Notification priority display configuration
// ============================================

export const NOTIFICATION_PRIORITY_CONFIG: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' }
> = {
  low: { label: 'Low', variant: 'outline' },
  normal: { label: 'Normal', variant: 'secondary' },
  high: { label: 'High', variant: 'warning' },
  urgent: { label: 'Urgent', variant: 'destructive' },
}
