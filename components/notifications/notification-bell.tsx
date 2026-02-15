'use client'

import { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { NotificationDropdown } from '@/components/notifications/notification-dropdown'
import { getUnreadCount } from '@/lib/actions/notifications'
import { elementId } from '@/lib/utils/element-ids'

// ============================================
// NotificationBell component
// ============================================

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    let mounted = true
    async function loadCount() {
      const result = await getUnreadCount()
      if (mounted && result.success) {
        setUnreadCount(result.data)
      }
    }
    loadCount()

    // Poll for unread count every 30 seconds
    const interval = setInterval(loadCount, 30000)
    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  const handleCountChange = (count: number) => {
    setUnreadCount(count)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          id={elementId('notifications', 'bell')}
          variant="ghost"
          size="icon"
          className="relative text-gray-500 hover:text-gray-700"
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span
              className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white"
              aria-hidden="true"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <NotificationDropdown onCountChange={handleCountChange} />
    </DropdownMenu>
  )
}
