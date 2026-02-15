'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useNotificationStore } from '@/lib/stores/notification-store'
import type { Notification, NotificationType, NotificationPriority } from '@/types/database'
import type { RealtimeChannel } from '@supabase/supabase-js'

// ============================================
// Payload types for Supabase Realtime
// ============================================

interface RealtimePayloadRecord {
  id: string
  user_id: string
  title: string
  message: string
  type: string
  priority: string
  is_read: boolean
  read_at: string | null
  action_url: string | null
  action_label: string | null
  related_entity_type: string | null
  related_entity_id: string | null
  created_at: string
}

interface RealtimeInsertPayload {
  eventType: 'INSERT'
  new: RealtimePayloadRecord
  old: Record<string, never>
}

interface RealtimeUpdatePayload {
  eventType: 'UPDATE'
  new: RealtimePayloadRecord
  old: RealtimePayloadRecord
}

interface RealtimeDeletePayload {
  eventType: 'DELETE'
  new: Record<string, never>
  old: RealtimePayloadRecord
}

type RealtimePayload = RealtimeInsertPayload | RealtimeUpdatePayload | RealtimeDeletePayload

// ============================================
// Callback type for new notification
// ============================================

export type OnNewNotificationCallback = (notification: Notification) => void

// ============================================
// Hook: useRealtimeNotifications
// ============================================

interface UseRealtimeNotificationsOptions {
  userId: string | null
  onNewNotification?: OnNewNotificationCallback
}

interface UseRealtimeNotificationsReturn {
  isConnected: boolean
}

function mapRecordToNotification(record: RealtimePayloadRecord): Notification {
  return {
    id: record.id,
    user_id: record.user_id,
    title: record.title,
    message: record.message,
    type: record.type as NotificationType,
    priority: record.priority as NotificationPriority,
    is_read: record.is_read,
    read_at: record.read_at ?? null,
    action_url: record.action_url ?? null,
    action_label: record.action_label ?? null,
    related_entity_type: record.related_entity_type ?? null,
    related_entity_id: record.related_entity_id ?? null,
    created_at: record.created_at,
  }
}

export function useRealtimeNotifications({
  userId,
  onNewNotification,
}: UseRealtimeNotificationsOptions): UseRealtimeNotificationsReturn {
  const [isConnected, setIsConnected] = useState(false)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const onNewNotificationRef = useRef(onNewNotification)

  // Keep the callback ref up to date
  useEffect(() => {
    onNewNotificationRef.current = onNewNotification
  }, [onNewNotification])

  const addNotification = useNotificationStore((s) => s.addNotification)
  const updateNotification = useNotificationStore((s) => s.updateNotification)
  const removeNotification = useNotificationStore((s) => s.removeNotification)

  const handlePayload = useCallback(
    (payload: RealtimePayload) => {
      switch (payload.eventType) {
        case 'INSERT': {
          const notification = mapRecordToNotification(payload.new)
          addNotification(notification)
          onNewNotificationRef.current?.(notification)
          break
        }
        case 'UPDATE': {
          const notification = mapRecordToNotification(payload.new)
          updateNotification(notification)
          break
        }
        case 'DELETE': {
          if (payload.old?.id) {
            removeNotification(payload.old.id)
          }
          break
        }
      }
    },
    [addNotification, updateNotification, removeNotification]
  )

  useEffect(() => {
    if (!userId) return

    const supabase = createClient()

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          handlePayload(payload as unknown as RealtimePayload)
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED')
      })

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
        setIsConnected(false)
      }
    }
  }, [userId, handlePayload])

  return { isConnected }
}
