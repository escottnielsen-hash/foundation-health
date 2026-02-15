import { Card, CardContent } from '@/components/ui/card'
import {
  CalendarCheck,
  UserCheck,
  UserX,
  XCircle,
  CheckCircle,
  ListTodo,
  type LucideIcon,
} from 'lucide-react'
import type { StaffDashboardData } from '@/types/staff'

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
// StaffKpiCards
// ============================================

export function StaffKpiCards({ metrics }: { metrics: StaffDashboardData }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <StatCard
        label="Today's Appointments"
        value={metrics.appointmentsToday}
        icon={CalendarCheck}
        description="Total scheduled"
        iconBgClass="bg-blue-50"
        iconTextClass="text-blue-600"
      />
      <StatCard
        label="Checked In"
        value={metrics.checkedInCount}
        icon={UserCheck}
        description="Currently waiting"
        iconBgClass="bg-emerald-50"
        iconTextClass="text-emerald-600"
      />
      <StatCard
        label="Confirmed"
        value={metrics.confirmedCount}
        icon={CheckCircle}
        description="Ready for today"
        iconBgClass="bg-teal-50"
        iconTextClass="text-teal-600"
      />
      <StatCard
        label="No Shows"
        value={metrics.noShowCount}
        icon={UserX}
        description="Missed today"
        iconBgClass="bg-red-50"
        iconTextClass="text-red-600"
      />
      <StatCard
        label="Cancelled"
        value={metrics.cancelledCount}
        icon={XCircle}
        description="Cancelled today"
        iconBgClass="bg-amber-50"
        iconTextClass="text-amber-600"
      />
      <StatCard
        label="Pending Tasks"
        value={metrics.pendingTaskCount}
        icon={ListTodo}
        description="To complete"
        iconBgClass="bg-violet-50"
        iconTextClass="text-violet-600"
      />
    </div>
  )
}
