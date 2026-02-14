'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Stethoscope,
  Users,
  Plane,
  CreditCard,
  Receipt,
  User,
  LogOut,
  ChevronLeft,
  X,
  Shield,
  FileCheck,
  MapPin,
} from 'lucide-react'

// ============================================
// Types
// ============================================

interface SidebarProps {
  userName: string
  userEmail: string
  userAvatarUrl: string | null
  isOpen: boolean
  onClose: () => void
}

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

// ============================================
// Navigation Items
// ============================================

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/patient/dashboard', icon: LayoutDashboard },
  { label: 'Appointments', href: '/patient/appointments', icon: Calendar },
  { label: 'Health Records', href: '/patient/records', icon: FileText },
  { label: 'Encounters', href: '/patient/encounters', icon: Stethoscope },
  { label: 'Providers', href: '/patient/providers', icon: Users },
  { label: 'Travel & Concierge', href: '/patient/travel', icon: Plane },
  { label: 'Membership', href: '/patient/membership', icon: CreditCard },
  { label: 'Locations', href: '/patient/locations', icon: MapPin },
  { label: 'Insurance', href: '/patient/insurance', icon: Shield },
  { label: 'Claims', href: '/patient/claims', icon: FileCheck },
  { label: 'Billing', href: '/patient/billing', icon: Receipt },
  { label: 'Profile', href: '/patient/profile', icon: User },
]

// ============================================
// Sidebar Component
// ============================================

export function PortalSidebar({
  userName,
  userEmail,
  userAvatarUrl,
  isOpen,
  onClose,
}: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/login')
      router.refresh()
    } catch {
      setIsSigningOut(false)
    }
  }

  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[hsl(222,47%,11%)] text-white transition-transform duration-300 ease-in-out lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo Section */}
        <div className="flex h-16 items-center justify-between px-6">
          <Link
            href="/patient/dashboard"
            className="flex items-center gap-2"
            onClick={onClose}
          >
            <span className="text-xl font-bold tracking-tight text-white">
              Foundation
            </span>
            <span className="text-xl font-light tracking-tight text-amber-400">
              Health
            </span>
          </Link>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-white/60 hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <Separator className="bg-white/10" />

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/patient/dashboard' &&
                pathname.startsWith(item.href + '/'))
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-white/15 text-white shadow-sm'
                    : 'text-white/60 hover:bg-white/8 hover:text-white'
                )}
              >
                <Icon
                  className={cn(
                    'h-5 w-5 flex-shrink-0',
                    isActive ? 'text-amber-400' : 'text-white/40'
                  )}
                />
                {item.label}
                {isActive && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-amber-400" />
                )}
              </Link>
            )
          })}
        </nav>

        <Separator className="bg-white/10" />

        {/* User Info & Sign Out */}
        <div className="p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-400/20 text-sm font-semibold text-amber-400">
              {initials || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {userName || 'User'}
              </p>
              <p className="truncate text-xs text-white/50">{userEmail}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-white/60 hover:bg-white/10 hover:text-white"
            onClick={handleSignOut}
            disabled={isSigningOut}
          >
            <LogOut className="h-4 w-4" />
            {isSigningOut ? 'Signing out...' : 'Sign out'}
          </Button>
        </div>
      </aside>
    </>
  )
}
