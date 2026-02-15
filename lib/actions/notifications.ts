'use server'

import { createClient } from '@/lib/supabase/server'
import { notificationFilterSchema, notificationIdSchema } from '@/lib/validations/notifications'
import type { Notification, NotificationType, NotificationPriority } from '@/types/database'
import { ZodError } from 'zod'

// ============================================
// Result types for server actions
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
// Notification filter types
// ============================================

interface NotificationFilters {
  type?: string
  read_status?: string
  sort_order?: string
}

// ============================================
// getNotifications
// ============================================

export async function getNotifications(
  filters?: NotificationFilters
): Promise<ActionResult<Notification[]>> {
  try {
    // Validate filters if provided
    if (filters) {
      const filterResult = notificationFilterSchema.safeParse(filters)
      if (!filterResult.success) {
        const fieldErrors: Record<string, string> = {}
        for (const issue of (filterResult.error as ZodError).issues) {
          const fieldName = issue.path.join('.')
          if (fieldName && !fieldErrors[fieldName]) {
            fieldErrors[fieldName] = issue.message
          }
        }
        return {
          success: false,
          error: 'Invalid filter parameters.',
          fieldErrors,
        }
      }
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'You must be logged in to view notifications.' }
    }

    // Build query
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)

    // Apply type filter
    if (filters?.type && filters.type !== '') {
      query = query.eq('type', filters.type)
    }

    // Apply read status filter
    if (filters?.read_status === 'unread') {
      query = query.eq('is_read', false)
    } else if (filters?.read_status === 'read') {
      query = query.eq('is_read', true)
    }

    // Apply sort order
    const ascending = filters?.sort_order === 'asc'
    query = query.order('created_at', { ascending, nullsFirst: false })

    const { data: notifications, error } = await query

    if (error) {
      return {
        success: false,
        error: 'Could not load notifications. Please try again.',
      }
    }

    const result: Notification[] = (notifications ?? []).map((n) => ({
      id: n.id,
      user_id: n.user_id,
      title: n.title,
      message: n.message,
      type: n.type as NotificationType,
      priority: n.priority as NotificationPriority,
      is_read: n.is_read,
      read_at: n.read_at ?? null,
      action_url: n.action_url ?? null,
      action_label: n.action_label ?? null,
      related_entity_type: n.related_entity_type ?? null,
      related_entity_id: n.related_entity_id ?? null,
      created_at: n.created_at,
    }))

    return { success: true, data: result }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred while loading notifications.',
    }
  }
}

// ============================================
// getUnreadCount
// ============================================

export async function getUnreadCount(): Promise<ActionResult<number>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'You must be logged in.' }
    }

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false)

    if (error) {
      return {
        success: false,
        error: 'Could not load unread count.',
      }
    }

    return { success: true, data: count ?? 0 }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred while loading unread count.',
    }
  }
}

// ============================================
// getRecentNotifications
// ============================================

export async function getRecentNotifications(
  limit: number = 5
): Promise<ActionResult<Notification[]>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'You must be logged in.' }
    }

    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_read', false)
      .order('created_at', { ascending: false, nullsFirst: false })
      .limit(limit)

    if (error) {
      return {
        success: false,
        error: 'Could not load recent notifications.',
      }
    }

    const result: Notification[] = (notifications ?? []).map((n) => ({
      id: n.id,
      user_id: n.user_id,
      title: n.title,
      message: n.message,
      type: n.type as NotificationType,
      priority: n.priority as NotificationPriority,
      is_read: n.is_read,
      read_at: n.read_at ?? null,
      action_url: n.action_url ?? null,
      action_label: n.action_label ?? null,
      related_entity_type: n.related_entity_type ?? null,
      related_entity_id: n.related_entity_id ?? null,
      created_at: n.created_at,
    }))

    return { success: true, data: result }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred while loading recent notifications.',
    }
  }
}

// ============================================
// markAsRead
// ============================================

export async function markAsRead(
  notificationId: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const idResult = notificationIdSchema.safeParse({ id: notificationId })
    if (!idResult.success) {
      return { success: false, error: 'Invalid notification ID.' }
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'You must be logged in.' }
    }

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', notificationId)
      .eq('user_id', user.id)

    if (error) {
      return {
        success: false,
        error: 'Could not mark notification as read.',
      }
    }

    return { success: true, data: { id: notificationId } }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred.',
    }
  }
}

// ============================================
// markAllAsRead
// ============================================

export async function markAllAsRead(): Promise<ActionResult<{ count: number }>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'You must be logged in.' }
    }

    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('is_read', false)
      .select('id')

    if (error) {
      return {
        success: false,
        error: 'Could not mark all notifications as read.',
      }
    }

    return { success: true, data: { count: data?.length ?? 0 } }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred.',
    }
  }
}

// ============================================
// deleteNotification
// ============================================

export async function deleteNotification(
  notificationId: string
): Promise<ActionResult<{ id: string }>> {
  try {
    const idResult = notificationIdSchema.safeParse({ id: notificationId })
    if (!idResult.success) {
      return { success: false, error: 'Invalid notification ID.' }
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'You must be logged in.' }
    }

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId)
      .eq('user_id', user.id)

    if (error) {
      return {
        success: false,
        error: 'Could not delete notification.',
      }
    }

    return { success: true, data: { id: notificationId } }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred.',
    }
  }
}
