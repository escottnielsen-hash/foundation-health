import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils/cn'

// ============================================
// Props
// ============================================

interface NetworkSummaryProps {
  totalAppointmentsToday: number
  totalProviders: number
  networkUtilization: number
  locationCount: number
}

// ============================================
// Stat Item
// ============================================

function StatItem({
  label,
  value,
  suffix,
  icon,
  color,
}: {
  label: string
  value: number
  suffix?: string
  icon: React.ReactNode
  color: string
}) {
  return (
    <div className="flex items-center gap-4">
      <div
        className={cn(
          'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
          color
        )}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">
          {value.toLocaleString()}
          {suffix && <span className="ml-0.5 text-base font-medium text-gray-500">{suffix}</span>}
        </p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  )
}

// ============================================
// Network Summary Card
// ============================================

export function NetworkSummary({
  totalAppointmentsToday,
  totalProviders,
  networkUtilization,
  locationCount,
}: NetworkSummaryProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          <StatItem
            label="Appointments Today"
            value={totalAppointmentsToday}
            icon={<CalendarIcon />}
            color="bg-blue-50 text-blue-600"
          />
          <StatItem
            label="Active Providers"
            value={totalProviders}
            icon={<ProvidersIcon />}
            color="bg-teal-50 text-teal-600"
          />
          <StatItem
            label="Network Utilization"
            value={networkUtilization}
            suffix="%"
            icon={<GaugeIcon />}
            color={cn(
              networkUtilization >= 70
                ? 'bg-emerald-50 text-emerald-600'
                : networkUtilization >= 40
                  ? 'bg-amber-50 text-amber-600'
                  : 'bg-red-50 text-red-600'
            )}
          />
          <StatItem
            label="Network Locations"
            value={locationCount}
            icon={<LocationIcon />}
            color="bg-violet-50 text-violet-600"
          />
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// Inline SVG Icons
// ============================================

function CalendarIcon() {
  return (
    <svg
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  )
}

function ProvidersIcon() {
  return (
    <svg
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function GaugeIcon() {
  return (
    <svg
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
      <circle cx="12" cy="12" r="10" />
      <path d="M15 13a3 3 0 1 1-6 0" />
    </svg>
  )
}

function LocationIcon() {
  return (
    <svg
      className="h-6 w-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}
