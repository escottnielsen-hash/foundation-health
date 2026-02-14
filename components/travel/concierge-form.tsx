'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  conciergeRequestSchema,
  conciergeRequestTypes,
  conciergeRequestTypeLabels,
  conciergeLocations,
  conciergeLocationLabels,
  type ConciergeRequestFormData,
} from '@/lib/validations/concierge'
import { submitConciergeRequest } from '@/lib/actions/concierge'
import type { ConciergeRequest } from '@/lib/actions/concierge'
import { formId, inputId } from '@/lib/utils/element-ids'
import {
  Hotel,
  Car,
  UtensilsCrossed,
  MapPin,
  FileText,
  Salad,
  Accessibility,
  Send,
  Loader2,
  CheckCircle2,
  Clock,
} from 'lucide-react'
import { ZodError } from 'zod'

// ============================================
// Types
// ============================================

interface ConciergeFormProps {
  userId: string
  existingRequests: ConciergeRequest[]
}

// ============================================
// Request type icons
// ============================================

const requestTypeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  accommodation_booking: Hotel,
  transportation_arrangement: Car,
  restaurant_reservation: UtensilsCrossed,
  activity_planning: MapPin,
  medical_records_transfer: FileText,
  special_dietary_needs: Salad,
  accessibility_requirements: Accessibility,
}

// ============================================
// Status badge colors
// ============================================

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700',
  confirmed: 'bg-blue-50 text-blue-700',
  completed: 'bg-green-50 text-green-700',
  cancelled: 'bg-gray-100 text-gray-500',
}

// ============================================
// Component
// ============================================

export function ConciergeForm({ userId, existingRequests }: ConciergeFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})
    setSuccess(false)

    const form = e.currentTarget
    const formDataObj = new FormData(form)

    const rawData: ConciergeRequestFormData = {
      request_type: formDataObj.get('request_type') as ConciergeRequestFormData['request_type'],
      location: formDataObj.get('location') as ConciergeRequestFormData['location'],
      details: (formDataObj.get('details') as string) ?? '',
      preferred_date: (formDataObj.get('preferred_date') as string) ?? '',
      special_requirements: (formDataObj.get('special_requirements') as string) ?? '',
    }

    // Client-side validation
    const parsed = conciergeRequestSchema.safeParse(rawData)
    if (!parsed.success) {
      const errors: Record<string, string> = {}
      for (const issue of (parsed.error as ZodError).issues) {
        const fieldName = issue.path.join('.')
        if (fieldName && !errors[fieldName]) {
          errors[fieldName] = issue.message
        }
      }
      setFieldErrors(errors)
      return
    }

    startTransition(async () => {
      const result = await submitConciergeRequest(userId, parsed.data)

      if (!result.success) {
        setError(result.error)
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors)
        }
        return
      }

      setSuccess(true)
      form.reset()
      router.refresh()
    })
  }

  return (
    <div className="space-y-8">
      {/* Request form */}
      <Card>
        <CardHeader>
          <CardTitle>New Concierge Request</CardTitle>
          <CardDescription>
            Tell us how we can enhance your visit. Our concierge team typically
            responds within 24 hours.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            id={formId('concierge-request')}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* Request type */}
            <div className="space-y-2">
              <Label htmlFor={inputId('request-type')} required>
                Type of Assistance
              </Label>
              <Select
                id={inputId('request-type')}
                name="request_type"
                error={fieldErrors.request_type}
                defaultValue=""
              >
                <option value="" disabled>
                  Select the type of help you need
                </option>
                {conciergeRequestTypes.map((type) => {
                  const Icon = requestTypeIcons[type]
                  return (
                    <option key={type} value={type}>
                      {Icon ? '' : ''}{conciergeRequestTypeLabels[type]}
                    </option>
                  )
                })}
              </Select>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor={inputId('location')} required>
                Foundation Health Location
              </Label>
              <Select
                id={inputId('location')}
                name="location"
                error={fieldErrors.location}
                defaultValue=""
              >
                <option value="" disabled>
                  Select the location you are visiting
                </option>
                {conciergeLocations.map((loc) => (
                  <option key={loc} value={loc}>
                    {conciergeLocationLabels[loc]}
                  </option>
                ))}
              </Select>
            </div>

            {/* Details */}
            <div className="space-y-2">
              <Label htmlFor={inputId('details')} required>
                Request Details
              </Label>
              <Textarea
                id={inputId('details')}
                name="details"
                placeholder="Please describe what you need. Include any preferences, dates, number of guests, or specific requirements..."
                rows={5}
                error={fieldErrors.details}
              />
            </div>

            {/* Preferred date */}
            <div className="space-y-2">
              <Label htmlFor={inputId('preferred-date')}>
                Preferred Date
              </Label>
              <Input
                id={inputId('preferred-date')}
                name="preferred_date"
                type="date"
                error={fieldErrors.preferred_date}
              />
              <p className="text-xs text-gray-400">
                Optional. When would you like this arranged for?
              </p>
            </div>

            {/* Special requirements */}
            <div className="space-y-2">
              <Label htmlFor={inputId('special-requirements')}>
                Special Requirements
              </Label>
              <Textarea
                id={inputId('special-requirements')}
                name="special_requirements"
                placeholder="Dietary restrictions, mobility needs, accessibility requirements, allergies..."
                rows={3}
                error={fieldErrors.special_requirements}
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Success message */}
            {success && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <p className="text-sm font-medium text-green-800">
                    Your concierge request has been submitted successfully. Our
                    team will be in touch within 24 hours.
                  </p>
                </div>
              </div>
            )}

            {/* Submit */}
            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting Request...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Concierge Request
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Existing requests */}
      {existingRequests.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Your Recent Requests
          </h3>
          <div className="space-y-3">
            {existingRequests.map((request) => {
              const Icon = requestTypeIcons[request.request_type] ?? FileText
              return (
                <Card key={request.id}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-amber-50">
                          <Icon className="h-4 w-4 text-amber-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-900">
                            {conciergeRequestTypeLabels[request.request_type as keyof typeof conciergeRequestTypeLabels] ?? request.request_type}
                          </p>
                          <p className="text-xs text-gray-500">
                            {conciergeLocationLabels[request.location as keyof typeof conciergeLocationLabels] ?? request.location}
                          </p>
                          <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                            {request.details}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge
                          className={
                            statusColors[request.status] ?? statusColors.pending
                          }
                        >
                          {request.status}
                        </Badge>
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="h-3 w-3" />
                          {new Date(request.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {request.notes && (
                      <div className="mt-3 rounded-md bg-blue-50 p-3">
                        <p className="text-xs font-medium text-blue-700">
                          Concierge Note:
                        </p>
                        <p className="text-sm text-blue-600">
                          {request.notes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
