'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Bell,
  Calendar,
  FileText,
  Shield,
  Video,
  CreditCard,
  Settings,
  MessageSquare,
  Check,
  CheckCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils/cn'
import { elementId } from '@/lib/utils/element-ids'
import { useNotificationStore } from '@/lib/stores/notification-store'
import { useRealtimeNotifications } from '@/lib/hooks/use-realtime-notifications'
import { useToast } from '@/components/ui/use-toast'
import { NOTIFICATION_TYPE_CONFIG } from '@/lib/validations/notifications'
import { getNotificationsPaginated } from '@/lib/actions/notifications-enhanced'
import { createClient } from '@/lib/supabase/client'
import type { Notification, NotificationType } from '@/types/database'

// ============================================
// Icon map for notification types
// ============================================

const notificationIcons: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
  appointment: Calendar,
  claim: FileText,
  insurance: Shield,
  telemedicine: Video,
  billing: CreditCard,
  system: Settings,
  message: MessageSquare,
}

// ============================================
// Time ago helper
// ============================================

function timeAgo(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now.getTime() - date.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSeconds < 60) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// ============================================
// NotificationBellRealtime component
// ============================================

export function NotificationBellRealtime() {
  const router = useRouter()
  const { toast } = useToast()
  const [userId, setUserId] = useState<string | null>(null)
  const [recentNotifications, setRecentNotifications] = useState<Notification[]>([])
  const [dropdownLoading, setDropdownLoading] = useState(false)

  const unreadCount = useNotificationStore((s) => s.unreadCount)
  const markAsRead = useNotificationStore((s) => s.markAsRead)
  const markAllAsRead = useNotificationStore((s) => s.markAllAsRead)
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

  // Handle new notifications with toast
  const handleNewNotification = useCallback(
    (notification: Notification) => {
      const priority = notification.priority
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

  // Load recent notifications when dropdown opens
  const handleDropdownOpen = useCallback(async () => {
    setDropdownLoading(true)
    const result = await getNotificationsPaginated(1, 5, {
      sortOrder: 'desc',
    })
    if (result.success) {
      setRecentNotifications(result.data.notifications)
    }
    setDropdownLoading(false)
  }, [])

  const handleNotificationClick = useCallback(
    (notification: Notification) => {
      if (!notification.is_read) {
        markAsRead(notification.id)
        setRecentNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id
              ? { ...n, is_read: true, read_at: new Date().toISOString() }
              : n
          )
        )
      }
      if (notification.action_url) {
        router.push(notification.action_url)
      }
    },
    [markAsRead, router]
  )

  const handleMarkAllRead = useCallback(async () => {
    await markAllAsRead()
    setRecentNotifications((prev) =>
      prev.map((n) => ({
        ...n,
        is_read: true,
        read_at: n.read_at ?? new Date().toISOString(),
      }))
    )
  }, [markAllAsRead])

  const handleMarkSingleRead = useCallback(
    (e: React.MouseEvent, notificationId: string) => {
      e.stopPropagation()
      e.preventDefault()
      markAsRead(notificationId)
      setRecentNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId
            ? { ...n, is_read: true, read_at: new Date().toISOString() }
            : n
        )
      )
    },
    [markAsRead]
  )

  return (
    <DropdownMenu onOpenChange={(open) => { if (open) handleDropdownOpen() }}>
      <DropdownMenuTrigger asChild>
        <Button
          id={elementId('notifications', 'bell-realtime')}
          variant="ghost"
          size="icon"
          className="relative text-gray-500 hover:text-gray-700"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span
              className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white animate-in zoom-in-50 duration-200"
              aria-hidden="true"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        id={elementId('notifications', 'dropdown-realtime')}
        align="end"
        className="w-80 sm:w-96"
      >
        {/* Header */}
        <DropdownMenuLabel className="flex items-center justify-between">
          <span className="text-sm font-semibold">Notifications</span>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Notification list */}
        {dropdownLoading ? (
          <div className="px-4 py-8 text-center">
            <div className="mx-auto h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-primary" />
            <p className="mt-2 text-sm text-gray-400">Loading...</p>
          </div>
        ) : recentNotifications.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <Bell className="mx-auto h-8 w-8 text-gray-300" />
            <p className="mt-2 text-sm text-gray-500">No notifications</p>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {recentNotifications.map((notification) => {
              const Icon = notificationIcons[notification.type] ?? Settings
              const typeConfig = NOTIFICATION_TYPE_CONFIG[notification.type]

              return (
                <DropdownMenuItem
                  key={notification.id}
                  className={cn(
                    'flex items-start gap-3 px-3 py-2.5 cursor-pointer',
                    !notification.is_read && 'bg-blue-50/40'
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  {/* Unread indicator */}
                  <div className="relative flex h-8 w-8 shrink-0 items-center justify-center">
                    {!notification.is_read && (
                      <span className="absolute -left-1 -top-0.5 h-2 w-2 rounded-full bg-blue-500" />
                    )}
                    <div
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-full',
                        typeConfig?.bgColor ?? 'bg-gray-50'
                      )}
                    >
                      <Icon className={cn('h-4 w-4', typeConfig?.iconColor ?? 'text-gray-600')} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <p
                      className={cn(
                        'text-sm truncate',
                        !notification.is_read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'
                      )}
                    >
                      {notification.title}
                    </p>
                    <p className="text-xs text-gray-500 line-clamp-1">
                      {notification.message}
                    </p>
                    <span className="text-[11px] text-gray-400">
                      {timeAgo(notification.created_at)}
                    </span>
                  </div>

                  {/* Quick mark read */}
                  {!notification.is_read && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 text-gray-400 hover:text-blue-600"
                      onClick={(e) => handleMarkSingleRead(e, notification.id)}
                      aria-label="Mark as read"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </DropdownMenuItem>
              )
            })}
          </div>
        )}

        {/* Footer */}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            href="/patient/notifications"
            className="flex items-center justify-center py-2 text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            View All Notifications
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
