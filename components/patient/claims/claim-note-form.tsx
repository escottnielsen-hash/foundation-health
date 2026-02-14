'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { addClaimNote } from '@/lib/actions/claims'
import { elementId } from '@/lib/utils/element-ids'
import { Send, Loader2 } from 'lucide-react'

interface ClaimNoteFormProps {
  claimId: string
}

export function ClaimNoteForm({ claimId }: ClaimNoteFormProps) {
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)

    if (!note.trim()) {
      setError('Please enter a note before submitting.')
      return
    }

    startTransition(async () => {
      const result = await addClaimNote(claimId, note.trim())

      if (!result.success) {
        setError(result.error)
        return
      }

      setNote('')
      setSuccessMessage('Note added successfully.')
      router.refresh()

      // Clear success message after a few seconds
      setTimeout(() => setSuccessMessage(null), 3000)
    })
  }

  return (
    <form
      id={elementId('claims', 'note', 'form')}
      onSubmit={handleSubmit}
      className="space-y-3"
    >
      <Textarea
        id={elementId('claims', 'note', 'input')}
        placeholder="Add a note about this claim (e.g., follow-up actions, additional context)..."
        value={note}
        onChange={(e) => {
          setNote(e.target.value)
          if (error) setError(null)
        }}
        rows={3}
        maxLength={2000}
        disabled={isPending}
        error={error ?? undefined}
      />

      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">
          {note.length}/2000 characters
        </p>

        <div className="flex items-center gap-3">
          {successMessage && (
            <p className="text-sm text-emerald-600">{successMessage}</p>
          )}
          <Button
            type="submit"
            size="sm"
            disabled={isPending || !note.trim()}
          >
            {isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5 mr-1.5" />
                Add Note
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}
