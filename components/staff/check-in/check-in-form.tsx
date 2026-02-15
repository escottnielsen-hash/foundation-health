'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CheckCircle } from 'lucide-react'
import { checkInPatient } from '@/lib/actions/staff'

// ============================================
// Types
// ============================================

interface CheckInFormProps {
  appointmentId: string
  patientName: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onCheckInComplete: () => void
}

// ============================================
// CheckInForm
// ============================================

export function CheckInForm({
  appointmentId,
  patientName,
  open,
  onOpenChange,
  onCheckInComplete,
}: CheckInFormProps) {
  const [insuranceConfirmed, setInsuranceConfirmed] = useState(false)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCheckIn = async () => {
    setLoading(true)
    setError(null)

    const result = await checkInPatient({
      appointment_id: appointmentId,
      insurance_confirmed: insuranceConfirmed,
      notes: notes || null,
    })

    setLoading(false)

    if (result.success) {
      setInsuranceConfirmed(false)
      setNotes('')
      onOpenChange(false)
      onCheckInComplete()
    } else {
      setError(result.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Patient Check-In</DialogTitle>
          <DialogDescription>
            Checking in: {patientName ?? 'Unknown Patient'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Identity Verification */}
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="text-sm font-medium text-gray-900">
              Identity Verification
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Verify patient identity using photo ID before proceeding.
            </p>
          </div>

          {/* Insurance Confirmation */}
          <div className="flex items-start gap-3">
            <input
              id="insurance-confirmed"
              type="checkbox"
              checked={insuranceConfirmed}
              onChange={(e) => setInsuranceConfirmed(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <div>
              <Label htmlFor="insurance-confirmed">
                Insurance Information Confirmed
              </Label>
              <p className="text-xs text-gray-500">
                Confirm the patient&apos;s insurance details are current and verified.
              </p>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="check-in-notes">Check-In Notes</Label>
            <Textarea
              id="check-in-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any relevant notes (e.g., copay collected, forms signed)..."
              className="mt-1"
              rows={3}
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCheckIn}
            disabled={loading}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            {loading ? 'Checking in...' : 'Check In Patient'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
