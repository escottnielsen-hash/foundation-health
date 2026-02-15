'use client'

import { useEffect, useCallback, useState } from 'react'
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
  Trash2,
  ExternalLink,
  Filter,
  Loader2,
  Inbox,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectItem } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils/cn'
import { elementId } from '@/lib/utils/element-ids'
import { useNotificationStore } from '@/lib/stores/notification-store'
import { createClient } from '@/lib/supabase/client'
import {
  NOTIFICATION_TYPES,
  NOTIFICATION_READ_STATUSES,
  NOTIFICATION_TYPE_CONFIG,
  NOTIFICATION_PRIORITY_CONFIG,
} from '@/lib/validations/notifications'
import type { Notification, NotificationType } from '@/types/database'

// ============================================
// Icon map
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
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ============================================
// Date group helper
// ============================================

function getDateGroup(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterdayStart = new Date(todayStart)
  yesterdayStart.setDate(yesterdayStart.getDate() - 1)
  const weekStart = new Date(todayStart)
  weekStart.setDate(weekStart.getDate() - todayStart.getDay())

  if (date >= todayStart) return 'Today'
  if (date >= yesterdayStart) return 'Yesterday'
  if (date >= weekStart) return 'This Week'
  return 'Earlier'
}

// ============================================
// Notification Item
// ============================================

interface NotificationItemProps {
  notification: Notification
  isSelected: boolean
  onSelect: (id: string) => void
  onMarkRead: (id: string) => void
  onDelete: (id: string) => void
  onNavigate: (notification: Notification) => void
}

function NotificationItem({
  notification,
  isSelected,
  onSelect,
  onMarkRead,
  onDelete,
  onNavigate,
}: NotificationItemProps) {
  const Icon = notificationIcons[notification.type] ?? Settings
  const typeConfig = NOTIFICATION_TYPE_CONFIG[notification.type]
  const priorityConfig = NOTIFICATION_PRIORITY_CONFIG[notification.priority]
  const showPriority = notification.priority === 'high' || notification.priority === 'urgent'

  return (
    <Card
      className={cn(
        'relative flex items-start gap-4 p-4 transition-colors',
        notification.action_url && 'cursor-pointer hover:bg-gray-50',
        !notification.is_read && 'bg-blue-50/40 border-blue-100',
        isSelected && 'ring-2 ring-primary/30'
      )}
      onClick={() => {
        if (notification.action_url) {
          onNavigate(notification)
        }
      }}
    >
      {/* Selection checkbox */}
      <div className="flex shrink-0 items-center pt-0.5">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(notification.id)}
          onClick={(e) => e.stopPropagation()}
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          aria-label={`Select notification: ${notification.title}`}
        />
      </div>

      {/* Unread indicator */}
      {!notification.is_read && (
        <span
          className="absolute left-1.5 top-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-blue-500"
          aria-label="Unread"
        />
      )}

      {/* Type icon */}
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
          typeConfig?.bgColor ?? 'bg-gray-50'
        )}
      >
        <Icon className={cn('h-5 w-5', typeConfig?.iconColor ?? 'text-gray-600')} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p
                className={cn(
                  'text-sm',
                  !notification.is_read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'
                )}
              >
                {notification.title}
              </p>
              <Badge
                variant="outline"
                className={cn('shrink-0 text-[10px] px-1.5 py-0', typeConfig?.iconColor)}
              >
                {typeConfig?.label ?? notification.type}
              </Badge>
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
                onClick={(e) => {
                  e.stopPropagation()
                  onMarkRead(notification.id)
                }}
                aria-label="Mark as read"
              >
                <Check className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-red-600"
              onClick={(e) => {
                e.stopPropagation()
                onDelete(notification.id)
              }}
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

// ============================================
// Loading skeleton
// ============================================

function NotificationSkeleton() {
  return (
    <Card className="flex items-start gap-4 p-4">
      <Skeleton className="h-4 w-4 rounded" />
      <Skeleton className="h-10 w-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </Card>
  )
}

// ============================================
// NotificationCenter component
// ============================================

export function NotificationCenter() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const notifications = useNotificationStore((s) => s.notifications)
  const unreadCount = useNotificationStore((s) => s.unreadCount)
  const isLoading = useNotificationStore((s) => s.isLoading)
  const hasMore = useNotificationStore((s) => s.hasMore)
  const filter = useNotificationStore((s) => s.filter)
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications)
  const loadMore = useNotificationStore((s) => s.loadMore)
  const markAsReadAction = useNotificationStore((s) => s.markAsRead)
  const markAllAsReadAction = useNotificationStore((s) => s.markAllAsRead)
  const deleteNotificationAction = useNotificationStore((s) => s.deleteNotification)
  const setFilter = useNotificationStore((s) => s.setFilter)

  // Get user ID on mount
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id)
      }
    })
  }, [])

  // Load notifications when userId or filter changes
  useEffect(() => {
    if (userId) {
      fetchNotifications(userId)
    }
  }, [userId, filter, fetchNotifications])

  // Filter handlers
  const handleTypeFilter = useCallback(
    (value: string) => {
      setFilter({ ...filter, type: value || undefined })
      setSelectedIds(new Set())
    },
    [filter, setFilter]
  )

  const handleReadStatusFilter = useCallback(
    (value: string) => {
      setFilter({ ...filter, readStatus: value === 'all' ? undefined : value })
      setSelectedIds(new Set())
    },
    [filter, setFilter]
  )

  // Selection handlers
  const handleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const handleSelectAll = useCallback(() => {
    if (selectedIds.size === notifications.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(notifications.map((n) => n.id)))
    }
  }, [notifications, selectedIds.size])

  // Bulk actions
  const handleMarkSelectedRead = useCallback(async () => {
    const ids = Array.from(selectedIds)
    for (const id of ids) {
      await markAsReadAction(id)
    }
    setSelectedIds(new Set())
  }, [selectedIds, markAsReadAction])

  const handleMarkAllRead = useCallback(async () => {
    await markAllAsReadAction()
    setSelectedIds(new Set())
  }, [markAllAsReadAction])

  // Individual actions
  const handleMarkRead = useCallback(
    (id: string) => {
      markAsReadAction(id)
    },
    [markAsReadAction]
  )

  const handleDelete = useCallback(
    (id: string) => {
      deleteNotificationAction(id)
      setSelectedIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    },
    [deleteNotificationAction]
  )

  const handleNavigate = useCallback(
    (notification: Notification) => {
      if (!notification.is_read) {
        markAsReadAction(notification.id)
      }
      if (notification.action_url) {
        router.push(notification.action_url)
      }
    },
    [markAsReadAction, router]
  )

  const handleLoadMore = useCallback(() => {
    if (userId) {
      loadMore(userId)
    }
  }, [userId, loadMore])

  // Group notifications by date
  const groupedNotifications = notifications.reduce<Record<string, Notification[]>>(
    (groups, notification) => {
      const group = getDateGroup(notification.created_at)
      if (!groups[group]) {
        groups[group] = []
      }
      groups[group].push(notification)
      return groups
    },
    {}
  )

  const dateGroupOrder = ['Today', 'Yesterday', 'This Week', 'Earlier']
  const orderedGroups = dateGroupOrder.filter(
    (g) => groupedNotifications[g] && groupedNotifications[g].length > 0
  )

  const hasSelectedUnread = Array.from(selectedIds).some((id) => {
    const n = notifications.find((n) => n.id === id)
    return n && !n.is_read
  })

  return (
    <div id={elementId('notification-center')} className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="mt-1 text-sm text-gray-500">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
              : 'You are all caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            className="gap-2"
          >
            <CheckCheck className="h-4 w-4" />
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Filter className="hidden h-4 w-4 text-gray-400 sm:block" />
          <div className="flex items-center gap-2">
            <Label
              htmlFor={elementId('notification-center', 'filter-type')}
              className="text-sm font-medium text-gray-700 whitespace-nowrap"
            >
              Type:
            </Label>
            <div className="w-44">
              <Select
                id={elementId('notification-center', 'filter-type')}
                value={filter.type ?? ''}
                onChange={(e) => handleTypeFilter(e.target.value)}
              >
                <option value="">All Types</option>
                {NOTIFICATION_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Label
              htmlFor={elementId('notification-center', 'filter-status')}
              className="text-sm font-medium text-gray-700 whitespace-nowrap"
            >
              Status:
            </Label>
            <div className="w-36">
              <Select
                id={elementId('notification-center', 'filter-status')}
                value={filter.readStatus ?? 'all'}
                onChange={(e) => handleReadStatusFilter(e.target.value)}
              >
                {NOTIFICATION_READ_STATUSES.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </Select>
            </div>
          </div>
        </div>
      </Card>

      {/* Bulk actions bar */}
      {selectedIds.size > 0 && (
        <Card className="flex items-center justify-between gap-3 p-3 bg-blue-50/60 border-blue-100">
          <span className="text-sm text-gray-700">
            {selectedIds.size} selected
          </span>
          <div className="flex items-center gap-2">
            {hasSelectedUnread && (
              <Button variant="outline" size="sm" onClick={handleMarkSelectedRead} className="gap-1.5">
                <Check className="h-3.5 w-3.5" />
                Mark Selected as Read
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
              Clear Selection
            </Button>
          </div>
        </Card>
      )}

      {/* Select all toggle */}
      {notifications.length > 0 && (
        <div className="flex items-center gap-2 pl-1">
          <input
            type="checkbox"
            checked={notifications.length > 0 && selectedIds.size === notifications.length}
            onChange={handleSelectAll}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            aria-label="Select all notifications"
          />
          <span className="text-xs text-gray-500">Select all</span>
        </div>
      )}

      {/* Notification list */}
      {isLoading && notifications.length === 0 ? (
        <div className="space-y-3">
          <NotificationSkeleton />
          <NotificationSkeleton />
          <NotificationSkeleton />
          <NotificationSkeleton />
        </div>
      ) : notifications.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16">
          <Inbox className="h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-700">No notifications</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter.type || filter.readStatus
              ? 'No notifications match your current filters.'
              : 'You don\'t have any notifications yet.'}
          </p>
          {(filter.type || filter.readStatus) && (
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setFilter({})}
            >
              Clear Filters
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-6">
          {orderedGroups.map((group) => (
            <div key={group}>
              <div className="mb-3 flex items-center gap-3">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                  {group}
                </h2>
                <Separator className="flex-1" />
              </div>
              <div className="space-y-2">
                {groupedNotifications[group].map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    isSelected={selectedIds.has(notification.id)}
                    onSelect={handleSelect}
                    onMarkRead={handleMarkRead}
                    onDelete={handleDelete}
                    onNavigate={handleNavigate}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Load more */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={isLoading}
                className="gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More'
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
