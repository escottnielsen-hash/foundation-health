import Link from 'next/link'
import { Bell, User, Shield, Settings } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { elementId } from '@/lib/utils/element-ids'

// ============================================
// Settings navigation items
// ============================================

const settingsNavItems = [
  {
    label: 'Profile',
    href: '/patient/profile',
    icon: User,
    description: 'Manage your personal information',
  },
  {
    label: 'Notifications',
    href: '/patient/settings/notifications',
    icon: Bell,
    description: 'Notification preferences',
  },
  {
    label: 'Security',
    href: '/patient/settings',
    icon: Shield,
    description: 'Security settings (coming soon)',
    disabled: true,
  },
  {
    label: 'Preferences',
    href: '/patient/settings',
    icon: Settings,
    description: 'General preferences (coming soon)',
    disabled: true,
  },
]

// ============================================
// Settings Layout
// ============================================

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div id={elementId('settings', 'layout')} className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Two-column layout */}
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar navigation */}
        <nav className="w-full shrink-0 lg:w-64">
          <Card className="p-2">
            <ul className="space-y-1">
              {settingsNavItems.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.label}>
                    {item.disabled ? (
                      <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-gray-400 cursor-not-allowed">
                        <Icon className="h-4 w-4" />
                        <div>
                          <span className="text-sm font-medium">{item.label}</span>
                          <p className="text-xs text-gray-400">{item.description}</p>
                        </div>
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
                      >
                        <Icon className="h-4 w-4" />
                        <div>
                          <span className="text-sm font-medium">{item.label}</span>
                          <p className="text-xs text-gray-500">{item.description}</p>
                        </div>
                      </Link>
                    )}
                  </li>
                )
              })}
            </ul>
          </Card>
        </nav>

        {/* Main content */}
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  )
}
