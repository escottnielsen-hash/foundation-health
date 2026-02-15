'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { Bell, CheckCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { NotificationCard } from '@/components/notifications/notification-card'
import { NotificationFilter } from '@/components/notifications/notification-filter'
import { markAllAsRead } from '@/lib/actions/notifications'
import { elementId } from '@/lib/utils/element-ids'
import type { Notification } from '@/types/database'

// ============================================
// Types
// ============================================

interface NotificationsListProps {
  initialNotifications: Notification[]
  initialGroups: string[]
  initialGrouped: Record<string, Notification[]>
  unreadCount: number
  currentFilters: { type: string; read_status: string }
}

// ============================================
// NotificationsList component
// ============================================

export function NotificationsList({
  initialNotifications,
  initialGroups,
  initialGrouped,
  unreadCount,
  currentFilters,
}: NotificationsListProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleMarkAllRead = () => {
    startTransition(async () => {
      await markAllAsRead()
      router.refresh()
    })
  }

  const handleUpdate = () => {
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {/* Filters and mark all read */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <NotificationFilter />
        {unreadCount > 0 && (
          <Button
            id={elementId('notifications', 'mark-all-read')}
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={isPending}
            className="shrink-0"
          >
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      <Separator />

      {/* Notifications grouped by date */}
      {initialNotifications.length === 0 ? (
        <div
          id={elementId('notifications', 'empty')}
          className="flex flex-col items-center justify-center py-16"
        >
          <Bell className="h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No notifications
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {currentFilters.type || currentFilters.read_status
              ? 'No notifications match your filters. Try adjusting them.'
              : 'When you receive notifications, they will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {initialGroups.map((group) => (
            <div key={group} id={elementId('notifications', 'group', group.toLowerCase().replace(/\s/g, '-'))}>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-400">
                {group}
              </h2>
              <div className="space-y-2">
                {initialGrouped[group].map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onUpdate={handleUpdate}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
