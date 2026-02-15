'use server'

import { createClient } from '@/lib/supabase/server'
import type { Notification, NotificationType, NotificationPriority } from '@/types/database'

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
// Filter types
// ============================================

interface PaginatedFilters {
  type?: string
  readStatus?: string
  sortOrder?: 'asc' | 'desc'
}

interface PaginatedResult {
  notifications: Notification[]
  totalCount: number
  hasMore: boolean
}

// ============================================
// getNotificationsPaginated
// ============================================

export async function getNotificationsPaginated(
  page: number = 1,
  pageSize: number = 20,
  filters?: PaginatedFilters
): Promise<ActionResult<PaginatedResult>> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'You must be logged in.' }
    }

    const offset = (page - 1) * pageSize

    // Build count query
    let countQuery = supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    // Build data query
    let dataQuery = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)

    // Apply type filter
    if (filters?.type) {
      countQuery = countQuery.eq('type', filters.type)
      dataQuery = dataQuery.eq('type', filters.type)
    }

    // Apply read status filter
    if (filters?.readStatus === 'unread') {
      countQuery = countQuery.eq('is_read', false)
      dataQuery = dataQuery.eq('is_read', false)
    } else if (filters?.readStatus === 'read') {
      countQuery = countQuery.eq('is_read', true)
      dataQuery = dataQuery.eq('is_read', true)
    }

    // Apply sort order
    const ascending = filters?.sortOrder === 'asc'
    dataQuery = dataQuery
      .order('created_at', { ascending, nullsFirst: false })
      .range(offset, offset + pageSize - 1)

    // Execute both queries
    const [countResult, dataResult] = await Promise.all([countQuery, dataQuery])

    if (countResult.error) {
      return { success: false, error: 'Could not count notifications.' }
    }

    if (dataResult.error) {
      return { success: false, error: 'Could not load notifications.' }
    }

    const totalCount = countResult.count ?? 0
    const notifications: Notification[] = (dataResult.data ?? []).map((n) => ({
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

    return {
      success: true,
      data: {
        notifications,
        totalCount,
        hasMore: offset + pageSize < totalCount,
      },
    }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred while loading notifications.',
    }
  }
}

// ============================================
// markNotificationRead
// ============================================

export async function markNotificationRead(
  notificationId: string
): Promise<ActionResult<{ id: string }>> {
  try {
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
      return { success: false, error: 'Could not mark notification as read.' }
    }

    return { success: true, data: { id: notificationId } }
  } catch {
    return { success: false, error: 'An unexpected error occurred.' }
  }
}

// ============================================
// markAllNotificationsRead
// ============================================

export async function markAllNotificationsRead(): Promise<ActionResult<{ count: number }>> {
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
      return { success: false, error: 'Could not mark all notifications as read.' }
    }

    return { success: true, data: { count: data?.length ?? 0 } }
  } catch {
    return { success: false, error: 'An unexpected error occurred.' }
  }
}

// ============================================
// deleteNotification
// ============================================

export async function deleteNotificationEnhanced(
  notificationId: string
): Promise<ActionResult<{ id: string }>> {
  try {
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
      return { success: false, error: 'Could not delete notification.' }
    }

    return { success: true, data: { id: notificationId } }
  } catch {
    return { success: false, error: 'An unexpected error occurred.' }
  }
}

// ============================================
// getUnreadCount
// ============================================

export async function getUnreadNotificationCount(): Promise<ActionResult<number>> {
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
      return { success: false, error: 'Could not load unread count.' }
    }

    return { success: true, data: count ?? 0 }
  } catch {
    return { success: false, error: 'An unexpected error occurred.' }
  }
}

// ============================================
// createNotificationForUser
// ============================================

interface CreateNotificationInput {
  title: string
  message: string
  type: NotificationType
  priority?: NotificationPriority
  action_url?: string
  action_label?: string
  related_entity_type?: string
  related_entity_id?: string
}

export async function createNotificationForUser(
  userId: string,
  data: CreateNotificationInput
): Promise<ActionResult<Notification>> {
  try {
    const supabase = await createClient()

    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: data.title,
        message: data.message,
        type: data.type,
        priority: data.priority ?? 'normal',
        is_read: false,
        action_url: data.action_url ?? null,
        action_label: data.action_label ?? null,
        related_entity_type: data.related_entity_type ?? null,
        related_entity_id: data.related_entity_id ?? null,
      })
      .select()
      .single()

    if (error || !notification) {
      return { success: false, error: 'Could not create notification.' }
    }

    const result: Notification = {
      id: notification.id,
      user_id: notification.user_id,
      title: notification.title,
      message: notification.message,
      type: notification.type as NotificationType,
      priority: notification.priority as NotificationPriority,
      is_read: notification.is_read,
      read_at: notification.read_at ?? null,
      action_url: notification.action_url ?? null,
      action_label: notification.action_label ?? null,
      related_entity_type: notification.related_entity_type ?? null,
      related_entity_id: notification.related_entity_id ?? null,
      created_at: notification.created_at,
    }

    return { success: true, data: result }
  } catch {
    return { success: false, error: 'An unexpected error occurred.' }
  }
}
