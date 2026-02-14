import { Card, CardContent } from '@/components/ui/card'
import {
  Building2,
  Users,
  UserCheck,
  CalendarCheck,
  type LucideIcon,
} from 'lucide-react'

// ============================================
// Types
// ============================================

interface StatCardProps {
  label: string
  value: number | string
  icon: LucideIcon
  description?: string
  iconBgClass?: string
  iconTextClass?: string
}

interface AdminStatsProps {
  totalLocations: number
  activeProviders: number
  totalPatients: number
  appointmentsToday: number
}

// ============================================
// StatCard
// ============================================

function StatCard({
  label,
  value,
  icon: Icon,
  description,
  iconBgClass = 'bg-gray-100',
  iconTextClass = 'text-gray-600',
}: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
            {description && (
              <p className="mt-0.5 text-xs text-gray-400">{description}</p>
            )}
          </div>
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBgClass}`}
          >
            <Icon className={`h-5 w-5 ${iconTextClass}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// AdminStats Grid
// ============================================

export function AdminStats({
  totalLocations,
  activeProviders,
  totalPatients,
  appointmentsToday,
}: AdminStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Total Locations"
        value={totalLocations}
        icon={Building2}
        description="All practice locations"
        iconBgClass="bg-blue-50"
        iconTextClass="text-blue-600"
      />
      <StatCard
        label="Active Providers"
        value={activeProviders}
        icon={UserCheck}
        description="Currently active"
        iconBgClass="bg-emerald-50"
        iconTextClass="text-emerald-600"
      />
      <StatCard
        label="Total Patients"
        value={totalPatients}
        icon={Users}
        description="Registered patients"
        iconBgClass="bg-violet-50"
        iconTextClass="text-violet-600"
      />
      <StatCard
        label="Appointments Today"
        value={appointmentsToday}
        icon={CalendarCheck}
        description="Scheduled for today"
        iconBgClass="bg-amber-50"
        iconTextClass="text-amber-600"
      />
    </div>
  )
}
