import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { elementId } from '@/lib/utils/element-ids'
import type { AppealPipelineItem } from '@/lib/actions/idr'
import Link from 'next/link'
import {
  XCircle,
  Scale,
  FileSearch,
  Gavel,
  CheckCircle,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react'

interface IdrPipelineProps {
  items: AppealPipelineItem[]
}

interface StageConfig {
  label: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgColor: string
  borderColor: string
}

const STAGE_CONFIGS: Record<string, StageConfig> = {
  denied: {
    label: 'Denied',
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
  },
  appeal_1: {
    label: '1st Appeal',
    icon: Scale,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
  },
  appeal_2: {
    label: '2nd Appeal',
    icon: Scale,
    color: 'text-violet-600',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
  },
  external_review: {
    label: 'External Review',
    icon: FileSearch,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
  },
  idr: {
    label: 'IDR',
    icon: Gavel,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
  },
  resolved: {
    label: 'Resolved',
    icon: CheckCircle,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
}

function formatCurrency(dollars: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(dollars)
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

function isDeadlineSoon(dateString: string | null): boolean {
  if (!dateString) return false
  const deadline = new Date(dateString)
  const now = new Date()
  const daysUntil = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  return daysUntil >= 0 && daysUntil <= 7
}

export function IdrPipeline({ items }: IdrPipelineProps) {
  const stageOrder: AppealPipelineItem['stage'][] = [
    'denied',
    'appeal_1',
    'appeal_2',
    'external_review',
    'idr',
    'resolved',
  ]

  const groupedItems = stageOrder.reduce(
    (acc, stage) => {
      acc[stage] = items.filter((item) => item.stage === stage)
      return acc
    },
    {} as Record<string, AppealPipelineItem[]>
  )

  const totalAtStake = items.reduce((sum, item) => sum + item.amount_at_stake, 0)

  return (
    <Card id={elementId('admin', 'idr', 'pipeline')}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Appeal & IDR Pipeline</CardTitle>
          <span className="text-sm text-gray-500">
            {items.length} active items | {formatCurrency(totalAtStake)} at stake
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="py-8 text-center">
            <CheckCircle className="mx-auto mb-3 h-10 w-10 text-gray-300" />
            <p className="text-sm text-gray-500">No active appeals or IDR cases</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Pipeline stages overview bar */}
            <div className="flex items-center gap-1">
              {stageOrder.map((stage, index) => {
                const config = STAGE_CONFIGS[stage]
                const count = groupedItems[stage]?.length ?? 0

                return (
                  <div key={stage} className="flex items-center">
                    <div
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${config.bgColor} ${config.borderColor} border`}
                    >
                      <config.icon className={`h-3.5 w-3.5 ${config.color}`} />
                      <span className={config.color}>{config.label}</span>
                      <span className={`ml-1 font-bold ${config.color}`}>{count}</span>
                    </div>
                    {index < stageOrder.length - 1 && (
                      <ArrowRight className="mx-1 h-3.5 w-3.5 text-gray-300" />
                    )}
                  </div>
                )
              })}
            </div>

            {/* Detailed items per stage */}
            {stageOrder.map((stage) => {
              const stageItems = groupedItems[stage]
              if (!stageItems || stageItems.length === 0) return null

              const config = STAGE_CONFIGS[stage]

              return (
                <div key={stage}>
                  <div className="flex items-center gap-2 mb-2">
                    <config.icon className={`h-4 w-4 ${config.color}`} />
                    <h4 className={`text-sm font-semibold ${config.color}`}>
                      {config.label} ({stageItems.length})
                    </h4>
                  </div>
                  <div className="space-y-2 ml-6">
                    {stageItems.map((item) => {
                      const deadlineSoon = isDeadlineSoon(item.deadline)
                      return (
                        <div
                          key={item.id}
                          className={`flex items-center justify-between rounded-lg border p-3 text-sm ${
                            deadlineSoon ? 'border-amber-300 bg-amber-50/50' : 'border-gray-100 bg-gray-50/50'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="font-medium text-gray-900 truncate">
                              {item.claim_number ?? '-'}
                            </span>
                            <span className="text-gray-500 truncate">
                              {item.payer_name ?? 'Unknown'}
                            </span>
                            {deadlineSoon && (
                              <Badge variant="warning" className="gap-1 text-xs">
                                <AlertTriangle className="h-3 w-3" />
                                Due {formatDate(item.deadline)}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-gray-900">
                              {formatCurrency(item.amount_at_stake)}
                            </span>
                            {stage === 'idr' && (
                              <Link
                                href={`/admin/claims/idr/${item.id}`}
                                className="text-indigo-600 hover:text-indigo-700"
                              >
                                <ArrowRight className="h-4 w-4" />
                              </Link>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
