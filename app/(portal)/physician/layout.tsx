import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  LayoutDashboard,
  Calendar,
  Users,
  Stethoscope,
  Video,
  User,
} from 'lucide-react'

// ============================================
// Physician navigation items
// ============================================

const physicianNavItems = [
  { label: 'Dashboard', href: '/physician/dashboard', icon: LayoutDashboard },
  { label: 'Schedule', href: '/physician/schedule', icon: Calendar },
  { label: 'Patients', href: '/physician/patients', icon: Users },
  { label: 'Encounters', href: '/physician/encounters', icon: Stethoscope },
  { label: 'Telemedicine', href: '/physician/telemedicine', icon: Video },
  { label: 'Profile', href: '/physician/profile', icon: User },
]

// ============================================
// Physician Layout (Server Component)
// ============================================

export default async function PhysicianLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Role check -- only physician and admin roles can access
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role
  if (role !== 'physician' && role !== 'admin') {
    redirect('/patient/dashboard')
  }

  return (
    <div className="space-y-6">
      {/* Physician sub-navigation */}
      <div className="border-b border-gray-200 bg-white">
        <nav className="-mb-px flex gap-1 overflow-x-auto px-1">
          {physicianNavItems.map((item) => {
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

      {/* Physician page content */}
      <div>{children}</div>
    </div>
  )
}
