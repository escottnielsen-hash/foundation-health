'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { updateEncounterNotes } from '@/lib/actions/physician-clinical'
import type { SoapNotesFormData } from '@/lib/validations/physician-clinical'
import { Save, Check, Loader2 } from 'lucide-react'

interface SoapNoteEditorProps {
  encounterId: string
  initialSubjective: string | null
  initialObjective: string | null
  initialAssessment: string | null
  initialPlan: string | null
  readOnly?: boolean
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function SoapNoteEditor({
  encounterId,
  initialSubjective,
  initialObjective,
  initialAssessment,
  initialPlan,
  readOnly = false,
}: SoapNoteEditorProps) {
  const [subjective, setSubjective] = useState(initialSubjective ?? '')
  const [objective, setObjective] = useState(initialObjective ?? '')
  const [assessment, setAssessment] = useState(initialAssessment ?? '')
  const [plan, setPlan] = useState(initialPlan ?? '')
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Track whether values have changed from initial
  const hasChanges =
    subjective !== (initialSubjective ?? '') ||
    objective !== (initialObjective ?? '') ||
    assessment !== (initialAssessment ?? '') ||
    plan !== (initialPlan ?? '')

  const doSave = useCallback(async () => {
    setSaveStatus('saving')
    setError(null)

    const soapNotes: SoapNotesFormData = {
      subjective: subjective || '',
      objective: objective || '',
      assessment: assessment || '',
      plan: plan || '',
    }

    const result = await updateEncounterNotes(encounterId, soapNotes)

    if (result.success) {
      setSaveStatus('saved')
      // Reset saved indicator after 3 seconds
      savedTimeoutRef.current = setTimeout(() => {
        setSaveStatus('idle')
      }, 3000)
    } else {
      setSaveStatus('error')
      setError(result.error)
    }
  }, [encounterId, subjective, objective, assessment, plan])

  // Auto-save debounce
  const scheduleAutoSave = useCallback(() => {
    if (readOnly) return
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }
    autoSaveTimerRef.current = setTimeout(() => {
      doSave()
    }, 2000)
  }, [doSave, readOnly])

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current)
    }
  }, [])

  const handleFieldChange = (
    setter: (v: string) => void,
    value: string
  ) => {
    setter(value)
    scheduleAutoSave()
  }

  const handleManualSave = () => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }
    doSave()
  }

  const sections: {
    key: string
    label: string
    description: string
    value: string
    setter: (v: string) => void
  }[] = [
    {
      key: 'subjective',
      label: 'Subjective',
      description: 'Patient history, reported symptoms, concerns',
      value: subjective,
      setter: setSubjective,
    },
    {
      key: 'objective',
      label: 'Objective',
      description: 'Physical exam findings, vital signs, lab results',
      value: objective,
      setter: setObjective,
    },
    {
      key: 'assessment',
      label: 'Assessment',
      description: 'Clinical assessment, diagnosis, differential',
      value: assessment,
      setter: setAssessment,
    },
    {
      key: 'plan',
      label: 'Plan',
      description: 'Treatment plan, medications, follow-up',
      value: plan,
      setter: setPlan,
    },
  ]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg">SOAP Notes</CardTitle>
        <div className="flex items-center gap-3">
          {/* Auto-save indicator */}
          {saveStatus === 'saving' && (
            <Badge variant="outline" className="gap-1.5">
              <Loader2 className="h-3 w-3 animate-spin" />
              Saving...
            </Badge>
          )}
          {saveStatus === 'saved' && (
            <Badge variant="success" className="gap-1.5">
              <Check className="h-3 w-3" />
              Saved
            </Badge>
          )}
          {saveStatus === 'error' && (
            <Badge variant="destructive" className="gap-1.5">
              Error saving
            </Badge>
          )}

          {!readOnly && (
            <Button
              size="sm"
              onClick={handleManualSave}
              disabled={saveStatus === 'saving' || !hasChanges}
              className="gap-1.5"
            >
              <Save className="h-3.5 w-3.5" />
              Save Notes
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {sections.map((section) => (
          <div key={section.key}>
            <label
              htmlFor={`soap-${section.key}`}
              className="block text-sm font-semibold text-gray-900 mb-1"
            >
              {section.label}
            </label>
            <p className="text-xs text-gray-500 mb-2">{section.description}</p>
            <textarea
              id={`soap-${section.key}`}
              value={section.value}
              onChange={(e) => handleFieldChange(section.setter, e.target.value)}
              readOnly={readOnly}
              rows={4}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 resize-y"
              placeholder={readOnly ? 'No notes recorded' : `Enter ${section.label.toLowerCase()} notes...`}
              maxLength={5000}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
