'use client'

import { elementId } from '@/lib/utils/element-ids'
import { CLAIM_ACTIVITY_CONFIG } from '@/lib/validations/claims'
import type { ClaimActivity } from '@/types/database'
import { format } from 'date-fns'
import {
  Send,
  CheckCircle2,
  HelpCircle,
  XCircle,
  DollarSign,
  FileText,
  Scale,
  MessageSquare,
  Mail,
} from 'lucide-react'

interface ClaimTimelineProps {
  activities: ClaimActivity[]
}

const ACTIVITY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  submitted: Send,
  acknowledged: CheckCircle2,
  info_requested: HelpCircle,
  denied: XCircle,
  partially_paid: DollarSign,
  paid: DollarSign,
  appeal_filed: FileText,
  idr_initiated: Scale,
  idr_resolved: Scale,
  note_added: MessageSquare,
  eob_received: Mail,
}

function formatActivityDate(dateStr: string): string {
  try {
    return format(new Date(dateStr), 'MMM d, yyyy — h:mm a')
  } catch {
    return dateStr
  }
}

export function ClaimTimeline({ activities }: ClaimTimelineProps) {
  if (activities.length === 0) {
    return (
      <div
        id={elementId('claims', 'timeline', 'empty')}
        className="text-center py-8 text-gray-500 text-sm"
      >
        No activity recorded for this claim yet.
      </div>
    )
  }

  return (
    <div
      id={elementId('claims', 'timeline', 'container')}
      className="relative"
    >
      {/* Vertical line */}
      <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-200" />

      <div className="space-y-6">
        {activities.map((activity, index) => {
          const config = CLAIM_ACTIVITY_CONFIG[activity.activity_type] ?? {
            label: activity.activity_type,
            iconColor: 'text-gray-500',
          }
          const IconComponent = ACTIVITY_ICONS[activity.activity_type] ?? MessageSquare

          return (
            <div
              key={activity.id}
              id={elementId('claims', 'timeline', 'item', activity.id)}
              className="relative flex gap-4 pl-0"
            >
              {/* Icon circle */}
              <div
                className={`relative z-10 flex-shrink-0 w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center ${
                  index === 0 ? 'border-primary' : ''
                }`}
              >
                <IconComponent
                  className={`w-3.5 h-3.5 ${config.iconColor}`}
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-medium text-gray-900">
                    {config.label}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  {activity.description}
                </p>
                <span className="text-xs text-gray-400">
                  {formatActivityDate(activity.created_at)}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
