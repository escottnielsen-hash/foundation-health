import Link from 'next/link'
import { Stethoscope, Video, ArrowRight, AlertCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { PhysicianDashboardEncounter } from '@/lib/actions/physician'
import type { EncounterStatus } from '@/types/database'

// ============================================
// Types
// ============================================

interface RecentEncountersProps {
  encounters: PhysicianDashboardEncounter[]
}

// ============================================
// Helpers
// ============================================

function getEncounterStatusVariant(status: EncounterStatus) {
  switch (status) {
    case 'checked_in':
      return 'warning' as const
    case 'in_progress':
      return 'default' as const
    case 'completed':
      return 'success' as const
    case 'cancelled':
      return 'destructive' as const
    default:
      return 'outline' as const
  }
}

function formatEncounterStatus(status: EncounterStatus): string {
  return status
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

// ============================================
// Recent Encounters Component
// ============================================

export function RecentEncounters({ encounters }: RecentEncountersProps) {
  const needsAction = encounters.filter(
    (e) => e.status === 'checked_in' || e.status === 'in_progress'
  )

  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base font-semibold text-slate-900">
              Recent Encounters
            </CardTitle>
            {needsAction.length > 0 && (
              <Badge variant="warning" className="gap-1">
                <AlertCircle className="h-3 w-3" />
                {needsAction.length} need attention
              </Badge>
            )}
          </div>
          <Link
            href="/physician/encounters"
            className="inline-flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-700"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {encounters.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">
            No recent encounters.
          </p>
        ) : (
          <div className="space-y-3">
            {encounters.map((enc) => (
              <div
                key={enc.id}
                className="flex items-center gap-4 rounded-lg border border-slate-100 bg-slate-50/50 p-3"
              >
                {/* Icon */}
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-slate-100">
                  {enc.is_telehealth ? (
                    <Video className="h-4 w-4 text-violet-500" />
                  ) : (
                    <Stethoscope className="h-4 w-4 text-slate-500" />
                  )}
                </div>

                {/* Details */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {enc.patient_name ?? 'Patient'}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {enc.chief_complaint || 'No chief complaint recorded'}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {enc.check_in_time
                      ? formatDateTime(enc.check_in_time)
                      : formatDateTime(enc.created_at)}
                  </p>
                </div>

                {/* Status */}
                <Badge
                  variant={getEncounterStatusVariant(enc.status)}
                  className="flex-shrink-0"
                >
                  {formatEncounterStatus(enc.status)}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
