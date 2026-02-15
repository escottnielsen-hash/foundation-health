'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { Calendar, FileText, Shield, Video, CreditCard, Settings, MessageSquare, ExternalLink, Check, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { elementId } from '@/lib/utils/element-ids'
import { cn } from '@/lib/utils/cn'
import { markAsRead, deleteNotification } from '@/lib/actions/notifications'
import { NOTIFICATION_TYPE_CONFIG, NOTIFICATION_PRIORITY_CONFIG } from '@/lib/validations/notifications'
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
// NotificationCard component
// ============================================

interface NotificationCardProps {
  notification: Notification
  onUpdate?: () => void
}

export function NotificationCard({ notification, onUpdate }: NotificationCardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const Icon = notificationIcons[notification.type] ?? Settings
  const typeConfig = NOTIFICATION_TYPE_CONFIG[notification.type]
  const priorityConfig = NOTIFICATION_PRIORITY_CONFIG[notification.priority]
  const showPriority = notification.priority === 'high' || notification.priority === 'urgent'

  const handleClick = () => {
    if (notification.action_url) {
      if (!notification.is_read) {
        startTransition(async () => {
          await markAsRead(notification.id)
          onUpdate?.()
        })
      }
      router.push(notification.action_url)
    }
  }

  const handleMarkRead = (e: React.MouseEvent) => {
    e.stopPropagation()
    startTransition(async () => {
      await markAsRead(notification.id)
      onUpdate?.()
    })
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    startTransition(async () => {
      await deleteNotification(notification.id)
      onUpdate?.()
    })
  }

  return (
    <Card
      id={elementId('notifications', 'card', notification.id)}
      className={cn(
        'relative flex items-start gap-4 p-4 transition-colors',
        notification.action_url && 'cursor-pointer hover:bg-gray-50',
        !notification.is_read && 'bg-blue-50/40 border-blue-100',
        isPending && 'opacity-60'
      )}
      onClick={notification.action_url ? handleClick : undefined}
    >
      {/* Unread indicator dot */}
      {!notification.is_read && (
        <span
          className="absolute left-2 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-blue-500"
          aria-label="Unread notification"
        />
      )}

      {/* Type icon */}
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
          typeConfig?.bgColor ?? 'bg-gray-50',
          !notification.is_read ? '' : ''
        )}
      >
        <Icon className={cn('h-5 w-5', typeConfig?.iconColor ?? 'text-gray-600')} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p
                className={cn(
                  'text-sm truncate',
                  !notification.is_read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'
                )}
              >
                {notification.title}
              </p>
              {showPriority && priorityConfig && (
                <Badge variant={priorityConfig.variant} className="shrink-0 text-[10px] px-1.5 py-0">
                  {priorityConfig.label}
                </Badge>
              )}
            </div>
            <p className="mt-0.5 text-sm text-gray-500 line-clamp-2">
              {notification.message}
            </p>
            <div className="mt-1.5 flex items-center gap-3">
              <span className="text-xs text-gray-400">
                {timeAgo(notification.created_at)}
              </span>
              {notification.action_url && notification.action_label && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-primary-600">
                  {notification.action_label}
                  <ExternalLink className="h-3 w-3" />
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex shrink-0 items-center gap-1">
            {!notification.is_read && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-400 hover:text-blue-600"
                onClick={handleMarkRead}
                disabled={isPending}
                aria-label="Mark as read"
              >
                <Check className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-red-600"
              onClick={handleDelete}
              disabled={isPending}
              aria-label="Delete notification"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
