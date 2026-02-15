import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getNotifications, markAllAsRead } from '@/lib/actions/notifications'
import { elementId } from '@/lib/utils/element-ids'
import { NotificationsList } from './notifications-list'

// ============================================
// Date grouping helpers
// ============================================

function getDateGroup(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterdayStart = new Date(todayStart)
  yesterdayStart.setDate(yesterdayStart.getDate() - 1)

  const weekStart = new Date(todayStart)
  weekStart.setDate(weekStart.getDate() - todayStart.getDay())

  const lastWeekStart = new Date(weekStart)
  lastWeekStart.setDate(lastWeekStart.getDate() - 7)

  if (date >= todayStart) {
    return 'Today'
  }
  if (date >= yesterdayStart) {
    return 'Yesterday'
  }
  if (date >= weekStart) {
    return 'Earlier This Week'
  }
  if (date >= lastWeekStart) {
    return 'Last Week'
  }
  return 'Earlier'
}

// ============================================
// Page metadata
// ============================================

export const metadata = {
  title: 'Notifications | Foundation Health',
  description: 'View and manage your notifications',
}

// ============================================
// Notifications Page
// ============================================

export default async function NotificationsPage(props: {
  searchParams: Promise<{ type?: string; read_status?: string }>
}) {
  const searchParams = await props.searchParams

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const filters = {
    type: searchParams.type ?? '',
    read_status: searchParams.read_status ?? '',
  }

  const result = await getNotifications(filters)
  const notifications = result.success ? result.data : []

  // Group notifications by date
  const grouped: Record<string, typeof notifications> = {}
  for (const notification of notifications) {
    const group = getDateGroup(notification.created_at)
    if (!grouped[group]) {
      grouped[group] = []
    }
    grouped[group].push(notification)
  }

  // Preserve date group ordering
  const dateGroupOrder = ['Today', 'Yesterday', 'Earlier This Week', 'Last Week', 'Earlier']
  const orderedGroups = dateGroupOrder.filter((g) => grouped[g] && grouped[g].length > 0)

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <div id={elementId('notifications', 'page')} className="space-y-6">
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
      </div>

      {/* Notifications list (client component for interactivity) */}
      <NotificationsList
        initialNotifications={notifications}
        initialGroups={orderedGroups}
        initialGrouped={grouped}
        unreadCount={unreadCount}
        currentFilters={filters}
      />
    </div>
  )
}
