'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils/format'
import { elementId } from '@/lib/utils/element-ids'
import {
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Scale,
  FileText,
} from 'lucide-react'
import type { ClaimsAnalytics } from '@/types/revenue'

// ============================================
// Types
// ============================================

interface ClaimsFunnelProps {
  data: ClaimsAnalytics
}

interface FunnelStageProps {
  label: string
  count: number
  percentage: number
  color: string
  bgColor: string
  icon: React.ComponentType<{ className?: string }>
  isLast?: boolean
}

// ============================================
// FunnelStage
// ============================================

function FunnelStage({
  label,
  count,
  percentage,
  color,
  bgColor,
  icon: Icon,
  isLast,
}: FunnelStageProps) {
  return (
    <div className="flex items-center gap-2">
      <div className={`rounded-lg p-3 ${bgColor}`}>
        <div className="flex items-center gap-3">
          <Icon className={`h-5 w-5 ${color}`} />
          <div>
            <p className="text-xs font-medium text-gray-500">{label}</p>
            <p className="text-lg font-bold text-gray-900">{count}</p>
            <p className="text-xs text-gray-400">{percentage}%</p>
          </div>
        </div>
      </div>
      {!isLast && (
        <ArrowRight className="h-4 w-4 flex-shrink-0 text-gray-300" />
      )}
    </div>
  )
}

// ============================================
// ClaimsFunnel Component
// ============================================

export function ClaimsFunnel({ data }: ClaimsFunnelProps) {
  const stages = [
    {
      label: 'Submitted',
      count: data.totalSubmitted,
      percentage: 100,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      icon: FileText,
    },
    {
      label: 'Paid',
      count: data.totalPaid,
      percentage:
        data.totalSubmitted > 0
          ? Math.round((data.totalPaid / data.totalSubmitted) * 100)
          : 0,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      icon: CheckCircle2,
    },
    {
      label: 'Denied',
      count: data.totalDenied,
      percentage:
        data.totalSubmitted > 0
          ? Math.round((data.totalDenied / data.totalSubmitted) * 100)
          : 0,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      icon: XCircle,
    },
    {
      label: 'In Appeal',
      count: data.totalInAppeal,
      percentage:
        data.totalSubmitted > 0
          ? Math.round((data.totalInAppeal / data.totalSubmitted) * 100)
          : 0,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      icon: AlertTriangle,
    },
    {
      label: 'In IDR',
      count: data.totalInIdr,
      percentage:
        data.totalSubmitted > 0
          ? Math.round((data.totalInIdr / data.totalSubmitted) * 100)
          : 0,
      color: 'text-violet-600',
      bgColor: 'bg-violet-50',
      icon: Scale,
    },
  ]

  return (
    <Card id={elementId('revenue', 'chart', 'claims-funnel')}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Claims Funnel</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Funnel visual */}
        <div className="flex flex-wrap items-center gap-2">
          {stages.map((stage, i) => (
            <FunnelStage
              key={stage.label}
              {...stage}
              isLast={i === stages.length - 1}
            />
          ))}
        </div>

        {/* Summary stats */}
        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 sm:grid-cols-4">
          <div>
            <p className="text-xs font-medium text-gray-500">Total Billed</p>
            <p className="mt-0.5 text-sm font-bold text-gray-900">
              {formatCurrency(data.totalBilledCents)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Total Collected
            </p>
            <p className="mt-0.5 text-sm font-bold text-emerald-700">
              {formatCurrency(data.totalCollectedCents)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Collection Rate
            </p>
            <div className="mt-0.5 flex items-center gap-1.5">
              <p className="text-sm font-bold text-gray-900">
                {data.averageCollectionRate}%
              </p>
              <Badge
                variant={
                  data.averageCollectionRate >= 80 ? 'success' : 'warning'
                }
                className="text-xs"
              >
                {data.averageCollectionRate >= 80 ? 'Good' : 'Below Target'}
              </Badge>
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500">
              Avg. Days to Payment
            </p>
            <p className="mt-0.5 text-sm font-bold text-gray-900">
              {data.averageDaysToPayment} days
            </p>
          </div>
        </div>

        {/* Key rates row */}
        <div className="mt-4 grid grid-cols-3 gap-4 rounded-lg bg-gray-50 p-3">
          <div className="text-center">
            <p className="text-xs text-gray-500">Denial Rate</p>
            <p className="mt-0.5 text-lg font-bold text-red-600">
              {data.denialRate}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Appeal Success</p>
            <p className="mt-0.5 text-lg font-bold text-amber-600">
              {data.appealSuccessRate}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">IDR Win Rate</p>
            <p className="mt-0.5 text-lg font-bold text-violet-600">
              {data.idrWinRate}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
