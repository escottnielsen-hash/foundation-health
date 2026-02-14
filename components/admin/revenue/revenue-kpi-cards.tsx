'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DollarSign,
  TrendingUp,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils/format'
import { elementId } from '@/lib/utils/element-ids'
import type { RevenueOverview } from '@/types/revenue'

// ============================================
// Types
// ============================================

interface RevenueKpiCardsProps {
  overview: RevenueOverview
}

interface KpiCardProps {
  label: string
  value: string
  change?: number
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
  iconBgClass: string
  iconTextClass: string
  testId: string
}

// ============================================
// KpiCard
// ============================================

function KpiCard({
  label,
  value,
  change,
  subtitle,
  icon: Icon,
  iconBgClass,
  iconTextClass,
  testId,
}: KpiCardProps) {
  const isPositive = change !== undefined && change >= 0
  const changeAbs = change !== undefined ? Math.abs(change) : null

  return (
    <Card id={testId}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className="mt-1 truncate text-2xl font-bold text-gray-900">
              {value}
            </p>
            <div className="mt-1 flex items-center gap-2">
              {changeAbs !== null && (
                <Badge
                  variant={isPositive ? 'success' : 'destructive'}
                  className="gap-0.5 px-1.5 py-0.5 text-xs"
                >
                  {isPositive ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {changeAbs}%
                </Badge>
              )}
              {subtitle && (
                <span className="text-xs text-gray-400">{subtitle}</span>
              )}
            </div>
          </div>
          <div
            className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${iconBgClass}`}
          >
            <Icon className={`h-5 w-5 ${iconTextClass}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================
// RevenueKpiCards
// ============================================

export function RevenueKpiCards({ overview }: RevenueKpiCardsProps) {
  // Calculate MRR from membership revenue / 12
  const mrrCents = Math.round(overview.membershipRevenueCents / 12)

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        label="Total Revenue"
        value={formatCurrency(overview.totalRevenueCents)}
        change={overview.revenueGrowthPct}
        subtitle="vs previous period"
        icon={DollarSign}
        iconBgClass="bg-emerald-50"
        iconTextClass="text-emerald-600"
        testId={elementId('revenue', 'kpi', 'total-revenue')}
      />
      <KpiCard
        label="Monthly Recurring Revenue"
        value={formatCurrency(mrrCents)}
        subtitle={`${overview.membershipRevenueCents > 0 ? Math.round((overview.membershipRevenueCents / Math.max(1, overview.totalRevenueCents)) * 100) : 0}% of total`}
        icon={CreditCard}
        iconBgClass="bg-blue-50"
        iconTextClass="text-blue-600"
        testId={elementId('revenue', 'kpi', 'mrr')}
      />
      <KpiCard
        label="Avg. Per Patient"
        value={formatCurrency(overview.averagePerPatientCents)}
        subtitle={`${overview.patientCount} patients`}
        icon={Users}
        iconBgClass="bg-violet-50"
        iconTextClass="text-violet-600"
        testId={elementId('revenue', 'kpi', 'avg-per-patient')}
      />
      <KpiCard
        label="Revenue Growth"
        value={`${overview.revenueGrowthPct >= 0 ? '+' : ''}${overview.revenueGrowthPct}%`}
        subtitle="vs previous period"
        icon={TrendingUp}
        iconBgClass="bg-amber-50"
        iconTextClass="text-amber-600"
        testId={elementId('revenue', 'kpi', 'growth')}
      />
    </div>
  )
}
