import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  LayoutDashboard,
  Building2,
  Network,
  DollarSign,
  FileCheck,
  Video,
} from 'lucide-react'

// ============================================
// Admin navigation items
// ============================================

const adminNavItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Locations', href: '/admin/locations', icon: Building2 },
  { label: 'Network', href: '/admin/network', icon: Network },
  { label: 'Claims', href: '/admin/claims', icon: FileCheck },
  { label: 'Revenue', href: '/admin/revenue', icon: DollarSign },
  { label: 'Telemedicine', href: '/admin/telemedicine', icon: Video },
]

// ============================================
// Admin Layout (Server Component)
// ============================================

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Role check — only admin and staff roles can access
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role
  if (role !== 'admin' && role !== 'staff') {
    redirect('/patient/dashboard')
  }

  return (
    <div className="space-y-6">
      {/* Admin sub-navigation */}
      <div className="border-b border-gray-200 bg-white">
        <nav className="-mb-px flex gap-1 overflow-x-auto px-1">
          {adminNavItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex items-center gap-2 whitespace-nowrap border-b-2 border-transparent px-4 py-3 text-sm font-medium text-gray-500 transition-colors hover:border-gray-300 hover:text-gray-700"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Admin page content */}
      <div>{children}</div>
    </div>
  )
}
