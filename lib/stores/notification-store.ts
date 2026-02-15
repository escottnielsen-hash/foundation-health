import { create } from 'zustand'
import type { Notification } from '@/types/database'
import {
  getNotificationsPaginated,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotificationEnhanced,
  getUnreadNotificationCount,
} from '@/lib/actions/notifications-enhanced'

// ============================================
// Store types
// ============================================

interface NotificationFilter {
  type?: string
  readStatus?: string
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  filter: NotificationFilter
  hasMore: boolean
  currentPage: number

  // Actions
  fetchNotifications: (userId: string, page?: number) => Promise<void>
  loadMore: (userId: string) => Promise<void>
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  deleteNotification: (notificationId: string) => Promise<void>
  addNotification: (notification: Notification) => void
  updateNotification: (notification: Notification) => void
  removeNotification: (notificationId: string) => void
  setFilter: (filter: NotificationFilter) => void
  refreshUnreadCount: () => Promise<void>
  reset: () => void
}

// ============================================
// Initial state
// ============================================

const initialState = {
  notifications: [] as Notification[],
  unreadCount: 0,
  isLoading: false,
  filter: {} as NotificationFilter,
  hasMore: false,
  currentPage: 1,
}

// ============================================
// Notification store
// ============================================

export const useNotificationStore = create<NotificationState>((set, get) => ({
  ...initialState,

  fetchNotifications: async (_userId: string, page: number = 1) => {
    set({ isLoading: true })

    try {
      const { filter } = get()
      const result = await getNotificationsPaginated(page, 20, {
        type: filter.type,
        readStatus: filter.readStatus,
        sortOrder: 'desc',
      })

      if (result.success) {
        set({
          notifications: result.data.notifications,
          hasMore: result.data.hasMore,
          currentPage: page,
          isLoading: false,
        })
      } else {
        set({ isLoading: false })
      }

      // Also refresh unread count
      const countResult = await getUnreadNotificationCount()
      if (countResult.success) {
        set({ unreadCount: countResult.data })
      }
    } catch {
      set({ isLoading: false })
    }
  },

  loadMore: async (_userId: string) => {
    const { currentPage, notifications, filter, hasMore } = get()
    if (!hasMore) return

    set({ isLoading: true })

    try {
      const nextPage = currentPage + 1
      const result = await getNotificationsPaginated(nextPage, 20, {
        type: filter.type,
        readStatus: filter.readStatus,
        sortOrder: 'desc',
      })

      if (result.success) {
        set({
          notifications: [...notifications, ...result.data.notifications],
          hasMore: result.data.hasMore,
          currentPage: nextPage,
          isLoading: false,
        })
      } else {
        set({ isLoading: false })
      }
    } catch {
      set({ isLoading: false })
    }
  },

  markAsRead: async (notificationId: string) => {
    // Optimistic update
    const { notifications, unreadCount } = get()
    const notification = notifications.find((n) => n.id === notificationId)
    const wasUnread = notification && !notification.is_read

    set({
      notifications: notifications.map((n) =>
        n.id === notificationId
          ? { ...n, is_read: true, read_at: new Date().toISOString() }
          : n
      ),
      unreadCount: wasUnread ? Math.max(0, unreadCount - 1) : unreadCount,
    })

    // Server call
    const result = await markNotificationRead(notificationId)
    if (!result.success) {
      // Revert on failure
      set({
        notifications: notifications,
        unreadCount: unreadCount,
      })
    }
  },

  markAllAsRead: async () => {
    // Optimistic update
    const { notifications } = get()
    set({
      notifications: notifications.map((n) => ({
        ...n,
        is_read: true,
        read_at: n.read_at ?? new Date().toISOString(),
      })),
      unreadCount: 0,
    })

    // Server call
    const result = await markAllNotificationsRead()
    if (!result.success) {
      // Revert on failure
      set({ notifications })
      // Refresh unread count from server
      const countResult = await getUnreadNotificationCount()
      if (countResult.success) {
        set({ unreadCount: countResult.data })
      }
    }
  },

  deleteNotification: async (notificationId: string) => {
    // Optimistic update
    const { notifications, unreadCount } = get()
    const notification = notifications.find((n) => n.id === notificationId)
    const wasUnread = notification && !notification.is_read

    set({
      notifications: notifications.filter((n) => n.id !== notificationId),
      unreadCount: wasUnread ? Math.max(0, unreadCount - 1) : unreadCount,
    })

    // Server call
    const result = await deleteNotificationEnhanced(notificationId)
    if (!result.success) {
      // Revert on failure
      set({ notifications, unreadCount })
    }
  },

  addNotification: (notification: Notification) => {
    const { notifications, unreadCount } = get()

    // Avoid duplicates
    const exists = notifications.some((n) => n.id === notification.id)
    if (exists) return

    set({
      notifications: [notification, ...notifications],
      unreadCount: notification.is_read ? unreadCount : unreadCount + 1,
    })
  },

  updateNotification: (notification: Notification) => {
    const { notifications } = get()
    const existing = notifications.find((n) => n.id === notification.id)

    if (!existing) return

    const wasUnread = !existing.is_read
    const isNowRead = notification.is_read

    set({
      notifications: notifications.map((n) =>
        n.id === notification.id ? notification : n
      ),
      unreadCount:
        wasUnread && isNowRead
          ? Math.max(0, get().unreadCount - 1)
          : get().unreadCount,
    })
  },

  removeNotification: (notificationId: string) => {
    const { notifications, unreadCount } = get()
    const notification = notifications.find((n) => n.id === notificationId)
    const wasUnread = notification && !notification.is_read

    set({
      notifications: notifications.filter((n) => n.id !== notificationId),
      unreadCount: wasUnread ? Math.max(0, unreadCount - 1) : unreadCount,
    })
  },

  setFilter: (filter: NotificationFilter) => {
    set({ filter, notifications: [], currentPage: 1, hasMore: false })
  },

  refreshUnreadCount: async () => {
    const result = await getUnreadNotificationCount()
    if (result.success) {
      set({ unreadCount: result.data })
    }
  },

  reset: () => {
    set(initialState)
  },
}))
