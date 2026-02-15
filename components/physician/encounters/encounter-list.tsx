'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { EncounterFilter } from './encounter-filter'
import { ENCOUNTER_STATUS_CONFIG } from '@/lib/validations/encounters'
import type { PhysicianEncounterRow } from '@/lib/actions/physician-clinical'
import { format } from 'date-fns'
import {
  User,
  Calendar,
  Stethoscope,
  Video,
  ClipboardList,
} from 'lucide-react'

interface EncounterListProps {
  encounters: PhysicianEncounterRow[]
  totalCount: number
}

export function EncounterList({ encounters, totalCount }: EncounterListProps) {
  return (
    <div>
      {/* Filter bar */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <EncounterFilter />
        <p className="text-sm text-gray-500 flex-shrink-0">
          {totalCount} {totalCount === 1 ? 'encounter' : 'encounters'} found
        </p>
      </div>

      {/* Encounter cards */}
      {encounters.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <ClipboardList className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No encounters found
            </h3>
            <p className="text-gray-500 text-sm max-w-sm mx-auto">
              No encounters match the current filters. Try adjusting your search criteria.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {encounters.map((encounter) => (
            <EncounterCard key={encounter.id} encounter={encounter} />
          ))}
        </div>
      )}
    </div>
  )
}

function EncounterCard({ encounter }: { encounter: PhysicianEncounterRow }) {
  const statusConfig = ENCOUNTER_STATUS_CONFIG[encounter.status] ?? {
    label: encounter.status,
    variant: 'outline' as const,
  }

  const patientName = [encounter.patient_first_name, encounter.patient_last_name]
    .filter(Boolean)
    .join(' ') || 'Unknown Patient'

  const formatDateTime = (dateStr: string | null | undefined): string => {
    if (!dateStr) return 'No date'
    try {
      return format(new Date(dateStr), 'MMM d, yyyy - h:mm a')
    } catch {
      return dateStr
    }
  }

  const isCompleted = encounter.status === 'completed'
  const hasNotes = encounter.visit_notes || encounter.plan

  return (
    <Link href={`/physician/encounters/${encounter.id}`}>
      <Card className="hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="font-semibold text-gray-900 truncate">
                  {patientName}
                </h3>
                <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                {encounter.is_telehealth && (
                  <Badge variant="outline" className="gap-1">
                    <Video className="h-3 w-3" />
                    Telehealth
                  </Badge>
                )}
                {isCompleted && hasNotes && (
                  <Badge variant="success" className="gap-1">
                    Notes Complete
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mt-2">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDateTime(encounter.check_in_time)}
                </span>
                {encounter.chief_complaint && (
                  <span className="flex items-center gap-1.5">
                    <Stethoscope className="h-3.5 w-3.5" />
                    <span className="truncate max-w-[200px]">{encounter.chief_complaint}</span>
                  </span>
                )}
              </div>
            </div>

            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <User className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
