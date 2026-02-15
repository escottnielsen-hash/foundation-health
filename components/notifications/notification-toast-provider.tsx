'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRealtimeNotifications } from '@/lib/hooks/use-realtime-notifications'
import { useNotificationStore } from '@/lib/stores/notification-store'
import { useToast } from '@/components/ui/use-toast'
import type { Notification } from '@/types/database'

// ============================================
// NotificationToastProvider
// ============================================

export function NotificationToastProvider() {
  const [userId, setUserId] = useState<string | null>(null)
  const { toast } = useToast()
  const refreshUnreadCount = useNotificationStore((s) => s.refreshUnreadCount)

  // Get user ID on mount
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id)
      }
    })
  }, [])

  // Initialize unread count
  useEffect(() => {
    if (userId) {
      refreshUnreadCount()
    }
  }, [userId, refreshUnreadCount])

  // Handle incoming notifications
  const handleNewNotification = useCallback(
    (notification: Notification) => {
      const priority = notification.priority

      // Show toast for high and urgent priority notifications
      if (priority === 'high' || priority === 'urgent') {
        toast({
          title: notification.title,
          description: notification.message,
          variant: priority === 'urgent' ? 'destructive' : 'default',
        })
      }
    },
    [toast]
  )

  // Subscribe to realtime notifications
  useRealtimeNotifications({
    userId,
    onNewNotification: handleNewNotification,
  })

  // This component renders nothing visible
  return null
}
