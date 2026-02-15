'use client'

import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Menu, User, CreditCard, LogOut } from 'lucide-react'
import Link from 'next/link'
import { NotificationBell } from '@/components/notifications/notification-bell'

// ============================================
// Types
// ============================================

interface PortalHeaderProps {
  userName: string
  userEmail: string
  onMenuToggle: () => void
}

// ============================================
// Route Title Map
// ============================================

const routeTitles: Record<string, string> = {
  '/patient/dashboard': 'Dashboard',
  '/patient/appointments': 'Appointments',
  '/patient/records': 'Health Records',
  '/patient/encounters': 'Encounters',
  '/patient/providers': 'Providers',
  '/patient/membership': 'Membership',
  '/patient/profile': 'Profile',
  '/patient/notifications': 'Notifications',
}

function getPageTitle(pathname: string): string {
  // Check exact match first
  if (routeTitles[pathname]) {
    return routeTitles[pathname]
  }
  // Check prefix match for nested routes
  const match = Object.entries(routeTitles).find(([route]) =>
    pathname.startsWith(route + '/')
  )
  return match ? match[1] : 'Dashboard'
}

// ============================================
// Header Component
// ============================================

export function PortalHeader({
  userName,
  userEmail,
  onMenuToggle,
}: PortalHeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const pageTitle = getPageTitle(pathname)

  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white/80 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      {/* Left: Mobile menu + Page title */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuToggle}
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold text-gray-900 sm:text-xl">
          {pageTitle}
        </h1>
      </div>

      {/* Right: Notifications + User dropdown */}
      <div className="flex items-center gap-2">
        {/* Notification Bell with unread count */}
        <NotificationBell />

        {/* User Avatar Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex h-9 w-9 items-center justify-center rounded-full bg-[hsl(222,47%,11%)] text-sm font-semibold text-amber-400 ring-2 ring-transparent transition-all hover:ring-amber-400/30 focus:outline-none focus:ring-amber-400/30">
              {initials || 'U'}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{userName || 'User'}</p>
                <p className="text-xs text-muted-foreground">{userEmail}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/patient/profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href="/patient/membership"
                className="flex items-center gap-2"
              >
                <CreditCard className="h-4 w-4" />
                Membership
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="flex items-center gap-2 text-red-600 focus:text-red-600"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
