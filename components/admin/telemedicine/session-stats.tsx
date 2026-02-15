import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Video,
  CheckCircle,
  Clock,
  AlertCircle,
  Stethoscope,
  HeartPulse,
  ClipboardList,
  MessageCircle,
  Siren,
  type LucideIcon,
} from 'lucide-react'
import type { TelemedicineStats } from '@/lib/actions/admin/telemedicine'
import type { SessionType } from '@/lib/actions/admin/telemedicine'

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

interface SessionStatsProps {
  stats: TelemedicineStats
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
// Session type display config
// ============================================

const sessionTypeConfig: Record<
  SessionType,
  { label: string; icon: LucideIcon; color: string }
> = {
  pre_op_consult: {
    label: 'Pre-Op Consult',
    icon: Stethoscope,
    color: 'bg-blue-500',
  },
  post_op_followup: {
    label: 'Post-Op Follow-up',
    icon: HeartPulse,
    color: 'bg-emerald-500',
  },
  general_consult: {
    label: 'General Consult',
    icon: ClipboardList,
    color: 'bg-violet-500',
  },
  second_opinion: {
    label: 'Second Opinion',
    icon: MessageCircle,
    color: 'bg-amber-500',
  },
  urgent_care: {
    label: 'Urgent Care',
    icon: Siren,
    color: 'bg-red-500',
  },
}

// ============================================
// SessionTypeBreakdown
// ============================================

function SessionTypeBreakdown({
  byType,
}: {
  byType: TelemedicineStats['byType']
}) {
  const total = Object.values(byType).reduce((sum, count) => sum + count, 0)
  const sessionTypes = Object.keys(sessionTypeConfig) as SessionType[]

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Sessions by Type</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sessionTypes.map((typeKey) => {
            const config = sessionTypeConfig[typeKey]
            const count = byType[typeKey] ?? 0
            const percentage = total > 0 ? Math.round((count / total) * 100) : 0
            const Icon = config.icon
            return (
              <div key={typeKey} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">{config.label}</span>
                  </div>
                  <span className="font-medium text-gray-900">
                    {count} ({percentage}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100">
                  <div
                    className={`h-2 rounded-full ${config.color}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// PhysicianBreakdown
// ============================================

function PhysicianBreakdown({
  byPhysician,
}: {
  byPhysician: TelemedicineStats['byPhysician']
}) {
  const topPhysicians = byPhysician.slice(0, 5)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Top Physicians</CardTitle>
      </CardHeader>
      <CardContent>
        {topPhysicians.length === 0 ? (
          <p className="text-sm text-gray-500">No session data available.</p>
        ) : (
          <div className="space-y-3">
            {topPhysicians.map((physician, index) => (
              <div
                key={physician.physician_id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                    {index + 1}
                  </span>
                  <span className="text-sm text-gray-700">
                    {physician.physician_name}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-900">
                  {physician.session_count} sessions
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================
// SessionStats -- main export
// ============================================

export function SessionStats({ stats }: SessionStatsProps) {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Sessions"
          value={stats.totalSessions}
          icon={Video}
          description="All telemedicine sessions"
          iconBgClass="bg-blue-50"
          iconTextClass="text-blue-600"
        />
        <StatCard
          label="Completion Rate"
          value={`${stats.completionRate}%`}
          icon={CheckCircle}
          description={`${stats.completedSessions} completed`}
          iconBgClass="bg-emerald-50"
          iconTextClass="text-emerald-600"
        />
        <StatCard
          label="Avg Duration"
          value={`${stats.averageDurationMinutes} min`}
          icon={Clock}
          description="Average session length"
          iconBgClass="bg-violet-50"
          iconTextClass="text-violet-600"
        />
        <StatCard
          label="Pending Requests"
          value={stats.pendingRequests}
          icon={AlertCircle}
          description="Awaiting approval"
          iconBgClass="bg-amber-50"
          iconTextClass="text-amber-600"
        />
      </div>

      {/* Breakdown Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <SessionTypeBreakdown byType={stats.byType} />
        <PhysicianBreakdown byPhysician={stats.byPhysician} />
      </div>
    </div>
  )
}
