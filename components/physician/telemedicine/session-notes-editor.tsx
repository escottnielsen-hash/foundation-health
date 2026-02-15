'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { updateSessionClinicalNotes } from '@/lib/actions/physician-clinical'
import type { SessionClinicalNotesFormData } from '@/lib/validations/physician-clinical'
import { Save, Check, Loader2, FileText, ClipboardList } from 'lucide-react'

interface SessionNotesEditorProps {
  sessionId: string
  initialClinicalNotes: string | null
  initialFollowUpInstructions: string | null
  readOnly?: boolean
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export function SessionNotesEditor({
  sessionId,
  initialClinicalNotes,
  initialFollowUpInstructions,
  readOnly = false,
}: SessionNotesEditorProps) {
  const [clinicalNotes, setClinicalNotes] = useState(initialClinicalNotes ?? '')
  const [followUpInstructions, setFollowUpInstructions] = useState(initialFollowUpInstructions ?? '')
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const hasChanges =
    clinicalNotes !== (initialClinicalNotes ?? '') ||
    followUpInstructions !== (initialFollowUpInstructions ?? '')

  const doSave = useCallback(async () => {
    setSaveStatus('saving')
    setError(null)

    const notes: SessionClinicalNotesFormData = {
      clinical_notes: clinicalNotes || '',
      follow_up_instructions: followUpInstructions || '',
    }

    const result = await updateSessionClinicalNotes(sessionId, notes)

    if (result.success) {
      setSaveStatus('saved')
      savedTimeoutRef.current = setTimeout(() => {
        setSaveStatus('idle')
      }, 3000)
    } else {
      setSaveStatus('error')
      setError(result.error)
    }
  }, [sessionId, clinicalNotes, followUpInstructions])

  const scheduleAutoSave = useCallback(() => {
    if (readOnly) return
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current)
    }
    autoSaveTimerRef.current = setTimeout(() => {
      doSave()
    }, 2000)
  }, [doSave, readOnly])

  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current)
    }
  }, [])

  const handleChange = (
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

  return (
    <div className="space-y-6">
      {/* Clinical Notes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Clinical Notes</CardTitle>
          </div>
          <div className="flex items-center gap-3">
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
                Error
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
                Save
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 mb-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          <textarea
            value={clinicalNotes}
            onChange={(e) => handleChange(setClinicalNotes, e.target.value)}
            readOnly={readOnly}
            rows={6}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 resize-y"
            placeholder={readOnly ? 'No clinical notes recorded' : 'Document clinical findings, observations, and recommendations...'}
            maxLength={5000}
          />
        </CardContent>
      </Card>

      {/* Follow-up Instructions */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Follow-Up Instructions</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <textarea
            value={followUpInstructions}
            onChange={(e) => handleChange(setFollowUpInstructions, e.target.value)}
            readOnly={readOnly}
            rows={4}
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 resize-y"
            placeholder={readOnly ? 'No follow-up instructions' : 'Provide patient follow-up instructions, medication guidance, appointment reminders...'}
            maxLength={5000}
          />
        </CardContent>
      </Card>
    </div>
  )
}
