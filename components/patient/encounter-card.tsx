'use client'

import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { elementId } from '@/lib/utils/element-ids'
import {
  ENCOUNTER_TYPES,
  ENCOUNTER_STATUS_CONFIG,
} from '@/lib/validations/encounters'
import type { EncounterStatus } from '@/types/database'
import { format } from 'date-fns'

interface EncounterCardProps {
  id: string
  checkInTime: string | null
  providerName: string | null
  encounterType: string | null
  chiefComplaint: string | null
  status: EncounterStatus
  isTelehealth: boolean
}

export function EncounterCard({
  id,
  checkInTime,
  providerName,
  encounterType,
  chiefComplaint,
  status,
  isTelehealth,
}: EncounterCardProps) {
  const router = useRouter()

  const handleClick = () => {
    router.push(`/patient/encounters/${id}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      router.push(`/patient/encounters/${id}`)
    }
  }

  const formatEncounterDate = (dateStr: string | null): string => {
    if (!dateStr) return 'Date not available'
    try {
      return format(new Date(dateStr), 'MMM d, yyyy — h:mm a')
    } catch {
      return dateStr
    }
  }

  const getEncounterTypeLabel = (type: string | null): string => {
    if (!type) return 'Visit'
    const found = ENCOUNTER_TYPES.find((et) => et.value === type)
    return found
      ? found.label
      : type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  }

  const statusConfig = ENCOUNTER_STATUS_CONFIG[status] ?? {
    label: status,
    variant: 'outline' as const,
  }

  return (
    <Card
      id={elementId('encounters', 'item', id)}
      className="hover:border-primary/30 hover:shadow-md transition-all cursor-pointer"
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          {/* Left: Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1.5">
              <h3 className="text-base font-semibold text-gray-900 truncate">
                {getEncounterTypeLabel(encounterType)}
              </h3>
              <Badge variant={statusConfig.variant}>
                {statusConfig.label}
              </Badge>
              {isTelehealth && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  Telehealth
                </Badge>
              )}
            </div>
            {chiefComplaint && (
              <p className="text-sm text-gray-600 line-clamp-1 mb-2">
                {chiefComplaint}
              </p>
            )}
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span>{formatEncounterDate(checkInTime)}</span>
              {providerName && (
                <span className="flex items-center gap-1">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Dr. {providerName}
                </span>
              )}
            </div>
          </div>

          {/* Right: Chevron */}
          <div className="flex-shrink-0 text-gray-300 mt-1">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
