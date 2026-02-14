import { Card, CardContent } from '@/components/ui/card'
import { elementId } from '@/lib/utils/element-ids'
import type { ClaimsSummaryStats } from '@/lib/actions/idr'
import {
  FileText,
  Clock,
  XCircle,
  Scale,
  Gavel,
  CheckCircle,
  DollarSign,
  TrendingUp,
} from 'lucide-react'

interface ClaimsSummaryProps {
  stats: ClaimsSummaryStats
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

function formatCurrencyDollars(dollars: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(dollars)
}

export function ClaimsSummary({ stats }: ClaimsSummaryProps) {
  const cards = [
    {
      label: 'Total Claims',
      value: stats.total.toString(),
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      accent: 'from-blue-500 to-blue-600',
    },
    {
      label: 'Pending',
      value: stats.pending.toString(),
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
      accent: 'from-amber-400 to-amber-500',
    },
    {
      label: 'Denied',
      value: stats.denied.toString(),
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      accent: 'from-red-500 to-red-600',
    },
    {
      label: 'In Appeal',
      value: stats.inAppeal.toString(),
      icon: Scale,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      accent: 'from-purple-500 to-purple-600',
    },
    {
      label: 'In IDR',
      value: stats.inIdr.toString(),
      icon: Gavel,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      accent: 'from-indigo-500 to-indigo-600',
    },
    {
      label: 'Paid',
      value: stats.paid.toString(),
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      accent: 'from-emerald-500 to-emerald-600',
    },
    {
      label: 'Total Billed',
      value: formatCurrencyDollars(stats.totalBilled),
      icon: DollarSign,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
      accent: 'from-gray-500 to-gray-600',
    },
    {
      label: 'Total Collected',
      value: formatCurrencyDollars(stats.totalPaid),
      icon: TrendingUp,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      accent: 'from-emerald-500 to-emerald-600',
    },
  ]

  return (
    <div
      id={elementId('admin', 'claims', 'summary')}
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card
            key={card.label}
            id={elementId('admin', 'claims', 'stat', card.label.toLowerCase().replace(/\s+/g, '-'))}
            className="relative overflow-hidden"
          >
            <CardContent className="p-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-500">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.bgColor}`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
                {card.label}
              </div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            </CardContent>
            <div className={`absolute right-0 top-0 h-1 w-full bg-gradient-to-r ${card.accent}`} />
          </Card>
        )
      })}
    </div>
  )
}
