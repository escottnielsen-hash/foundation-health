import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  User,
  Shield,
  SlidersHorizontal,
  ScrollText,
} from 'lucide-react'
import type { UserRole } from '@/types/database'

// ============================================
// Settings navigation items
// ============================================

interface SettingsNavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  adminOnly?: boolean
}

const settingsNavItems: SettingsNavItem[] = [
  { label: 'Profile', href: '/settings/profile', icon: User },
  { label: 'Security', href: '/settings/security', icon: Shield },
  { label: 'Preferences', href: '/settings/preferences', icon: SlidersHorizontal },
  { label: 'Audit Log', href: '/admin/audit-log', icon: ScrollText, adminOnly: true },
]

// ============================================
// Settings Layout (Server Component)
// ============================================

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role: UserRole = (profile?.role as UserRole) ?? 'patient'

  const visibleNavItems = settingsNavItems.filter(
    (item) => !item.adminOnly || role === 'admin'
  )

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Navigation */}
        <nav className="w-full md:w-64 shrink-0">
          <ul className="space-y-1">
            {visibleNavItems.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Page Content */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  )
}
