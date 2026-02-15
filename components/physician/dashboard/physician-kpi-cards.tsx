import Link from 'next/link'
import {
  Users,
  FileText,
  Video,
  DollarSign,
  ArrowRight,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils/format'
import type { PhysicianStats } from '@/lib/actions/physician'

// ============================================
// Types
// ============================================

interface PhysicianKpiCardsProps {
  todaysPatients: number
  pendingNotes: number
  upcomingTelehealth: number
  stats: PhysicianStats
}

// ============================================
// Physician KPI Cards
// ============================================

export function PhysicianKpiCards({
  todaysPatients,
  pendingNotes,
  upcomingTelehealth,
  stats,
}: PhysicianKpiCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Today's Patients */}
      <Card className="relative overflow-hidden border-0 shadow-md">
        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-amber-400 to-amber-600" />
        <CardContent className="p-5 pl-4">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <Users className="h-4 w-4 text-amber-500" />
            Today&apos;s Patients
          </div>
          <p className="text-2xl font-bold text-slate-900">{todaysPatients}</p>
          <p className="mt-0.5 text-xs text-slate-500">Scheduled for today</p>
          <Link
            href="/physician/schedule"
            className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-700"
          >
            View schedule
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardContent>
      </Card>

      {/* Pending Notes */}
      <Card className="relative overflow-hidden border-0 shadow-md">
        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-400 to-blue-600" />
        <CardContent className="p-5 pl-4">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <FileText className="h-4 w-4 text-blue-500" />
            Pending Notes
          </div>
          <p className="text-2xl font-bold text-slate-900">{pendingNotes}</p>
          <p className="mt-0.5 text-xs text-slate-500">Encounters in progress</p>
          <Link
            href="/physician/encounters"
            className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Complete notes
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardContent>
      </Card>

      {/* Upcoming Telehealth */}
      <Card className="relative overflow-hidden border-0 shadow-md">
        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-violet-400 to-violet-600" />
        <CardContent className="p-5 pl-4">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <Video className="h-4 w-4 text-violet-500" />
            Telehealth Sessions
          </div>
          <p className="text-2xl font-bold text-slate-900">{upcomingTelehealth}</p>
          <p className="mt-0.5 text-xs text-slate-500">Upcoming sessions</p>
          <Link
            href="/physician/telemedicine"
            className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-violet-600 hover:text-violet-700"
          >
            View sessions
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </CardContent>
      </Card>

      {/* Revenue This Month */}
      <Card className="relative overflow-hidden border-0 shadow-md">
        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-emerald-400 to-emerald-600" />
        <CardContent className="p-5 pl-4">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <DollarSign className="h-4 w-4 text-emerald-500" />
            Revenue This Month
          </div>
          <p className="text-2xl font-bold text-slate-900">
            {formatCurrency(stats.totalRevenue)}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">
            {stats.patientsSeen} patients seen
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {stats.encounterCompletionRate}% completion rate
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
