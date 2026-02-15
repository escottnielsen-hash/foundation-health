'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils/cn'
import { elementId } from '@/lib/utils/element-ids'
import {
  Wifi,
  Camera,
  Volume2,
  ShieldCheck,
  FileText,
  Check,
  Circle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ChecklistItem {
  id: string
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: 'internet',
    label: 'Check internet connection',
    description: 'Ensure you have a stable, high-speed internet connection for uninterrupted video.',
    icon: Wifi,
  },
  {
    id: 'camera',
    label: 'Test camera and microphone',
    description: 'Verify your camera and microphone are working. Use browser settings to allow access.',
    icon: Camera,
  },
  {
    id: 'location',
    label: 'Find quiet, private location',
    description: 'Choose a private, well-lit space free from distractions and background noise.',
    icon: Volume2,
  },
  {
    id: 'insurance',
    label: 'Have insurance card ready',
    description: 'Keep your insurance card and photo ID nearby in case they are needed.',
    icon: ShieldCheck,
  },
  {
    id: 'questions',
    label: 'Prepare questions for physician',
    description: 'Write down any symptoms, concerns, or questions you want to discuss during the visit.',
    icon: FileText,
  },
]

interface PreparationChecklistProps {
  className?: string
}

export function PreparationChecklist({ className }: PreparationChecklistProps) {
  const [checked, setChecked] = useState<Set<string>>(new Set())

  const toggleItem = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const completedCount = checked.size
  const totalCount = CHECKLIST_ITEMS.length
  const allDone = completedCount === totalCount
  const progressPercent = Math.round((completedCount / totalCount) * 100)

  return (
    <Card
      id={elementId('telemedicine', 'preparation', 'checklist')}
      className={cn('overflow-hidden', className)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Pre-Session Checklist</CardTitle>
          <span
            className={cn(
              'text-xs font-semibold rounded-full px-2.5 py-0.5',
              allDone
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-gray-100 text-gray-600'
            )}
          >
            {completedCount}/{totalCount}
          </span>
        </div>
        {/* Progress bar */}
        <div className="mt-2 h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              allDone ? 'bg-emerald-500' : 'bg-amber-400'
            )}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <ul className="space-y-2">
          {CHECKLIST_ITEMS.map((item) => {
            const isChecked = checked.has(item.id)
            const Icon = item.icon

            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => toggleItem(item.id)}
                  className={cn(
                    'w-full flex items-start gap-3 rounded-lg p-3 text-left transition-all duration-150',
                    isChecked
                      ? 'bg-emerald-50 border border-emerald-100'
                      : 'bg-gray-50 border border-gray-100 hover:bg-gray-100'
                  )}
                  aria-label={`${isChecked ? 'Uncheck' : 'Check'}: ${item.label}`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {isChecked ? (
                      <div className="h-5 w-5 rounded-full bg-emerald-500 flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    ) : (
                      <Circle className="h-5 w-5 text-gray-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Icon
                        className={cn(
                          'h-4 w-4 flex-shrink-0',
                          isChecked ? 'text-emerald-600' : 'text-gray-400'
                        )}
                      />
                      <span
                        className={cn(
                          'text-sm font-medium',
                          isChecked
                            ? 'text-emerald-700 line-through'
                            : 'text-gray-900'
                        )}
                      >
                        {item.label}
                      </span>
                    </div>
                    <p
                      className={cn(
                        'text-xs mt-0.5 ml-6',
                        isChecked ? 'text-emerald-600/70' : 'text-gray-500'
                      )}
                    >
                      {item.description}
                    </p>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>

        {allDone && (
          <div className="mt-4 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-center">
            <p className="text-sm font-semibold text-emerald-700">
              All set! You are ready for your session.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
