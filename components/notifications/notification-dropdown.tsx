'use client'

import { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Calendar, FileText, Shield, Video, CreditCard, Settings, MessageSquare, Check, Bell } from 'lucide-react'
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { elementId } from '@/lib/utils/element-ids'
import { cn } from '@/lib/utils/cn'
import { getRecentNotifications, markAsRead, markAllAsRead } from '@/lib/actions/notifications'
import { NOTIFICATION_TYPE_CONFIG } from '@/lib/validations/notifications'
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

  if (diffSeconds < 60) {
    return 'Just now'
  }
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`
  }
  if (diffDays < 7) {
    return `${diffDays}d ago`
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// ============================================
// NotificationDropdown component
// ============================================

interface NotificationDropdownProps {
  onCountChange?: (count: number) => void
}

export function NotificationDropdown({ onCountChange }: NotificationDropdownProps) {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    let mounted = true
    async function load() {
      const result = await getRecentNotifications(5)
      if (mounted && result.success) {
        setNotifications(result.data)
      }
      if (mounted) {
        setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  const handleMarkRead = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation()
    e.preventDefault()
    startTransition(async () => {
      const result = await markAsRead(notificationId)
      if (result.success) {
        setNotifications((prev) =>
          prev.filter((n) => n.id !== notificationId)
        )
        onCountChange?.(notifications.length - 1)
      }
    })
  }

  const handleMarkAllRead = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    startTransition(async () => {
      const result = await markAllAsRead()
      if (result.success) {
        setNotifications([])
        onCountChange?.(0)
      }
    })
  }

  const handleNotificationClick = (notification: Notification) => {
    if (notification.action_url) {
      if (!notification.is_read) {
        startTransition(async () => {
          await markAsRead(notification.id)
        })
      }
      router.push(notification.action_url)
    }
  }

  return (
    <DropdownMenuContent
      id={elementId('notifications', 'dropdown')}
      align="end"
      className="w-80 sm:w-96"
    >
      {/* Header */}
      <DropdownMenuLabel className="flex items-center justify-between">
        <span className="text-sm font-semibold">Notifications</span>
        {notifications.length > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={isPending}
            className="text-xs font-medium text-primary-600 hover:text-primary-700 disabled:opacity-50"
          >
            Mark all read
          </button>
        )}
      </DropdownMenuLabel>
      <DropdownMenuSeparator />

      {/* Notification list */}
      {loading ? (
        <div className="px-4 py-8 text-center">
          <p className="text-sm text-gray-400">Loading...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="px-4 py-8 text-center">
          <Bell className="mx-auto h-8 w-8 text-gray-300" />
          <p className="mt-2 text-sm text-gray-500">No new notifications</p>
        </div>
      ) : (
        <div className="max-h-80 overflow-y-auto">
          {notifications.map((notification) => {
            const Icon = notificationIcons[notification.type] ?? Settings
            const typeConfig = NOTIFICATION_TYPE_CONFIG[notification.type]
            return (
              <DropdownMenuItem
                key={notification.id}
                className={cn(
                  'flex items-start gap-3 px-3 py-2.5 cursor-pointer',
                  isPending && 'opacity-60'
                )}
                onClick={() => handleNotificationClick(notification)}
              >
                {/* Icon */}
                <div
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                    typeConfig?.bgColor ?? 'bg-gray-50'
                  )}
                >
                  <Icon className={cn('h-4 w-4', typeConfig?.iconColor ?? 'text-gray-600')} />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">
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
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 text-gray-400 hover:text-blue-600"
                  onClick={(e) => handleMarkRead(e, notification.id)}
                  disabled={isPending}
                  aria-label="Mark as read"
                >
                  <Check className="h-3.5 w-3.5" />
                </Button>
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
  )
}
