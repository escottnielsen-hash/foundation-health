'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import {
  LayoutDashboard,
  FileText,
  Receipt,
  Clock,
} from 'lucide-react'

// ============================================
// Types
// ============================================

interface BillingNavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

// ============================================
// Navigation Items
// ============================================

const billingNavItems: BillingNavItem[] = [
  { label: 'Overview', href: '/patient/billing', icon: LayoutDashboard },
  { label: 'Invoices', href: '/patient/billing/invoices', icon: FileText },
  { label: 'Superbills', href: '/patient/billing/superbills', icon: Receipt },
  { label: 'Payment History', href: '/patient/billing/payments', icon: Clock },
]

// ============================================
// BillingNav Component
// ============================================

export function BillingNav() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-1 overflow-x-auto rounded-lg border border-gray-200 bg-gray-50/80 p-1">
      {billingNavItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== '/patient/billing' &&
            pathname.startsWith(item.href + '/'))
        const Icon = item.icon

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'inline-flex items-center gap-2 whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-all duration-150',
              isActive
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:bg-white/60 hover:text-gray-700'
            )}
          >
            <Icon
              className={cn(
                'h-4 w-4 flex-shrink-0',
                isActive ? 'text-amber-500' : 'text-gray-400'
              )}
            />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
