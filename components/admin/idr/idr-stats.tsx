import { Card, CardContent } from '@/components/ui/card'
import { elementId } from '@/lib/utils/element-ids'
import type { IdrDashboardStats } from '@/lib/actions/idr'
import {
  Gavel,
  Trophy,
  TrendingUp,
  DollarSign,
  Clock,
  AlertTriangle,
  BarChart3,
  Target,
} from 'lucide-react'

interface IdrStatsProps {
  stats: IdrDashboardStats
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

export function IdrStats({ stats }: IdrStatsProps) {
  const cards = [
    {
      label: 'Active Cases',
      value: stats.activeCases.toString(),
      subtitle: `${stats.totalCases} total`,
      icon: Gavel,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      accent: 'from-indigo-500 to-indigo-600',
    },
    {
      label: 'Win Rate',
      value: `${stats.winRate}%`,
      subtitle: 'Provider favorable',
      icon: Trophy,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      accent: 'from-emerald-500 to-emerald-600',
    },
    {
      label: 'Avg Decision vs QPA',
      value: `${stats.averageDecisionVsQpa}%`,
      subtitle: 'Of QPA recovered',
      icon: Target,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      accent: 'from-blue-500 to-blue-600',
    },
    {
      label: 'Total Recovered',
      value: formatCurrency(stats.totalRecovered),
      subtitle: 'Via IDR decisions',
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      accent: 'from-emerald-500 to-emerald-600',
    },
    {
      label: 'Pending Decisions',
      value: stats.pendingDecisions.toString(),
      subtitle: 'Under review',
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
      accent: 'from-amber-400 to-amber-500',
    },
    {
      label: 'Deadline Alerts',
      value: stats.casesApproachingDeadline.toString(),
      subtitle: 'Within 7 days',
      icon: AlertTriangle,
      color: stats.casesApproachingDeadline > 0 ? 'text-red-600' : 'text-gray-600',
      bgColor: stats.casesApproachingDeadline > 0 ? 'bg-red-100' : 'bg-gray-100',
      accent: stats.casesApproachingDeadline > 0 ? 'from-red-500 to-red-600' : 'from-gray-400 to-gray-500',
    },
  ]

  return (
    <div
      id={elementId('admin', 'idr', 'stats')}
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card
            key={card.label}
            id={elementId('admin', 'idr', 'stat', card.label.toLowerCase().replace(/\s+/g, '-'))}
            className="relative overflow-hidden"
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">{card.label}</span>
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.bgColor}`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
            </CardContent>
            <div className={`absolute right-0 top-0 h-1 w-full bg-gradient-to-r ${card.accent}`} />
          </Card>
        )
      })}
    </div>
  )
}
