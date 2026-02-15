'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { completeEncounter } from '@/lib/actions/physician-clinical'
import type { EncounterStatus } from '@/types/database'
import {
  CheckCircle,
  Pill,
  UserPlus,
  CalendarPlus,
  Loader2,
} from 'lucide-react'

interface EncounterActionsProps {
  encounterId: string
  status: EncounterStatus
}

export function EncounterActions({ encounterId, status }: EncounterActionsProps) {
  const router = useRouter()
  const [completing, setCompleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isCompleted = status === 'completed'
  const isCancelled = status === 'cancelled'
  const canComplete = !isCompleted && !isCancelled

  const handleComplete = async () => {
    if (!canComplete) return
    setCompleting(true)
    setError(null)

    const result = await completeEncounter(encounterId)

    if (result.success) {
      router.refresh()
    } else {
      setError(result.error)
    }

    setCompleting(false)
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {canComplete && (
          <Button
            onClick={handleComplete}
            disabled={completing}
            className="gap-2"
          >
            {completing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            Complete Encounter
          </Button>
        )}

        <Button
          variant="outline"
          className="gap-2"
          disabled={isCompleted || isCancelled}
          onClick={() => {
            // Scroll to SOAP notes section
            const soapSection = document.getElementById('soap-subjective')
            if (soapSection) {
              soapSection.focus()
              soapSection.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }
          }}
        >
          <Pill className="h-4 w-4" />
          Add Notes
        </Button>

        <Button
          variant="outline"
          className="gap-2"
          onClick={() => {
            // Placeholder for referral workflow
          }}
        >
          <UserPlus className="h-4 w-4" />
          Refer Patient
        </Button>

        <Button
          variant="outline"
          className="gap-2"
          onClick={() => {
            // Placeholder for follow-up scheduling
          }}
        >
          <CalendarPlus className="h-4 w-4" />
          Order Follow-up
        </Button>
      </div>
    </div>
  )
}
