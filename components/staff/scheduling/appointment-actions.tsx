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
  DialogTrigger,
} from '@/components/ui/dialog'
import { CheckCircle, XCircle } from 'lucide-react'
import { confirmAppointment, cancelAppointmentByStaff } from '@/lib/actions/staff'

// ============================================
// Types
// ============================================

interface AppointmentActionsProps {
  appointmentId: string
  status: string
  onActionComplete: () => void
}

// ============================================
// AppointmentActions
// ============================================

export function AppointmentActions({
  appointmentId,
  status,
  onActionComplete,
}: AppointmentActionsProps) {
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelLoading, setCancelLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canConfirm = status === 'scheduled'
  const canCancel = status === 'scheduled' || status === 'confirmed'

  const handleConfirm = async () => {
    setConfirmLoading(true)
    setError(null)
    const result = await confirmAppointment(appointmentId)
    setConfirmLoading(false)

    if (result.success) {
      onActionComplete()
    } else {
      setError(result.error)
    }
  }

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      setError('Please provide a cancellation reason.')
      return
    }

    setCancelLoading(true)
    setError(null)
    const result = await cancelAppointmentByStaff(appointmentId, cancelReason)
    setCancelLoading(false)

    if (result.success) {
      setCancelOpen(false)
      setCancelReason('')
      onActionComplete()
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {canConfirm && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleConfirm}
          disabled={confirmLoading}
          className="h-8 text-xs"
        >
          <CheckCircle className="mr-1 h-3.5 w-3.5 text-emerald-600" />
          {confirmLoading ? 'Confirming...' : 'Confirm'}
        </Button>
      )}

      {canCancel && (
        <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs text-red-600 hover:text-red-700"
            >
              <XCircle className="mr-1 h-3.5 w-3.5" />
              Cancel
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cancel Appointment</DialogTitle>
              <DialogDescription>
                Please provide a reason for cancelling this appointment.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label htmlFor="cancel-reason" required>
                  Cancellation Reason
                </Label>
                <Textarea
                  id="cancel-reason"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Enter reason for cancellation..."
                  className="mt-1"
                />
              </div>
              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCancelOpen(false)}
              >
                Keep Appointment
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancel}
                disabled={cancelLoading}
              >
                {cancelLoading ? 'Cancelling...' : 'Cancel Appointment'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {error && !cancelOpen && (
        <span className="text-xs text-red-500">{error}</span>
      )}
    </div>
  )
}
