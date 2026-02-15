import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  LayoutDashboard,
  Calendar,
  ClipboardCheck,
  ListTodo,
} from 'lucide-react'

// ============================================
// Staff navigation items
// ============================================

const staffNavItems = [
  { label: 'Dashboard', href: '/staff/dashboard', icon: LayoutDashboard },
  { label: 'Scheduling', href: '/staff/scheduling', icon: Calendar },
  { label: 'Check-In', href: '/staff/check-in', icon: ClipboardCheck },
  { label: 'Tasks', href: '/staff/tasks', icon: ListTodo },
]

// ============================================
// Staff Layout (Server Component)
// ============================================

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Role check — only staff and admin roles can access
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role
  if (role !== 'staff' && role !== 'admin') {
    redirect('/dashboard')
  }

  return (
    <div className="space-y-6">
      {/* Staff sub-navigation */}
      <div className="border-b border-gray-200 bg-white">
        <nav className="-mb-px flex gap-1 overflow-x-auto px-1">
          {staffNavItems.map((item) => {
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

      {/* Staff page content */}
      <div>{children}</div>
    </div>
  )
}
