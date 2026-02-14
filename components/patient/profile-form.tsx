'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectItem } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { updatePatientProfile } from '@/lib/actions/patient'
import { US_STATES } from '@/lib/validations/patient'
import type { ProfileFormData } from '@/lib/validations/patient'
import type { Profile, PatientProfile } from '@/types/database'
import { elementId, formId, inputId, btnId } from '@/lib/utils/element-ids'

// ============================================
// Props
// ============================================

interface ProfileFormWrapperProps {
  userId: string
  profile: Profile
  patientProfile: PatientProfile | null
}

// ============================================
// Wrapper that manages open/close state
// ============================================

export function ProfileFormWrapper({
  userId,
  profile,
  patientProfile,
}: ProfileFormWrapperProps) {
  const [isEditing, setIsEditing] = useState(false)

  if (!isEditing) {
    return (
      <div id={elementId('profile', 'edit-trigger')} className="flex justify-end">
        <Button
          id={btnId('edit', 'profile')}
          onClick={() => setIsEditing(true)}
        >
          Edit Profile
        </Button>
      </div>
    )
  }

  return (
    <ProfileForm
      userId={userId}
      profile={profile}
      patientProfile={patientProfile}
      onCancel={() => setIsEditing(false)}
      onSuccess={() => setIsEditing(false)}
    />
  )
}

// ============================================
// The actual edit form
// ============================================

interface ProfileFormProps {
  userId: string
  profile: Profile
  patientProfile: PatientProfile | null
  onCancel: () => void
  onSuccess: () => void
}

function ProfileForm({
  userId,
  profile,
  patientProfile,
  onCancel,
  onSuccess,
}: ProfileFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Initialize form values from current profile data
  const [formValues, setFormValues] = useState<ProfileFormData>({
    first_name: profile.first_name ?? '',
    last_name: profile.last_name ?? '',
    date_of_birth: profile.date_of_birth ?? '',
    phone: profile.phone ?? '',
    address_line1: profile.address_line1 ?? '',
    address_line2: profile.address_line2 ?? '',
    city: profile.city ?? '',
    state: profile.state ?? '',
    zip_code: profile.zip_code ?? '',
    emergency_contact_name: patientProfile?.emergency_contact_name ?? '',
    emergency_contact_phone: patientProfile?.emergency_contact_phone ?? '',
  })

  const handleChange = (
    field: keyof ProfileFormData,
    value: string
  ) => {
    setFormValues((prev) => ({ ...prev, [field]: value }))
    // Clear field error when user types
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFieldErrors({})

    startTransition(async () => {
      const result = await updatePatientProfile(userId, formValues)

      if (result.success) {
        toast({
          title: 'Profile updated',
          description: 'Your profile has been saved successfully.',
          variant: 'success',
        })
        router.refresh()
        onSuccess()
      } else {
        if (result.fieldErrors) {
          setFieldErrors(result.fieldErrors)
        }
        toast({
          title: 'Update failed',
          description: result.error,
          variant: 'destructive',
        })
      }
    })
  }

  return (
    <Card id={elementId('profile', 'edit', 'card')}>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
        <CardDescription>
          Update your personal information below
        </CardDescription>
      </CardHeader>
      <form id={formId('profile-edit')} onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {/* Name Fields */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={inputId('first-name')} required>
                First Name
              </Label>
              <Input
                id={inputId('first-name')}
                value={formValues.first_name}
                onChange={(e) => handleChange('first_name', e.target.value)}
                placeholder="First name"
                error={fieldErrors.first_name}
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={inputId('last-name')} required>
                Last Name
              </Label>
              <Input
                id={inputId('last-name')}
                value={formValues.last_name}
                onChange={(e) => handleChange('last_name', e.target.value)}
                placeholder="Last name"
                error={fieldErrors.last_name}
                disabled={isPending}
              />
            </div>
          </div>

          {/* DOB and Phone */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={inputId('dob')}>Date of Birth</Label>
              <Input
                id={inputId('dob')}
                type="date"
                value={formValues.date_of_birth}
                onChange={(e) => handleChange('date_of_birth', e.target.value)}
                error={fieldErrors.date_of_birth}
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={inputId('phone')}>Phone Number</Label>
              <Input
                id={inputId('phone')}
                type="tel"
                value={formValues.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="(555) 123-4567"
                error={fieldErrors.phone}
                disabled={isPending}
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">Address</h3>
            <div className="space-y-2">
              <Label htmlFor={inputId('address1')}>Address Line 1</Label>
              <Input
                id={inputId('address1')}
                value={formValues.address_line1}
                onChange={(e) => handleChange('address_line1', e.target.value)}
                placeholder="123 Main Street"
                error={fieldErrors.address_line1}
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={inputId('address2')}>Address Line 2</Label>
              <Input
                id={inputId('address2')}
                value={formValues.address_line2}
                onChange={(e) => handleChange('address_line2', e.target.value)}
                placeholder="Apt, Suite, Unit"
                error={fieldErrors.address_line2}
                disabled={isPending}
              />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor={inputId('city')}>City</Label>
                <Input
                  id={inputId('city')}
                  value={formValues.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="City"
                  error={fieldErrors.city}
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={inputId('state')}>State</Label>
                <Select
                  id={inputId('state')}
                  value={formValues.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  error={fieldErrors.state}
                  disabled={isPending}
                >
                  <option value="">Select state</option>
                  {US_STATES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor={inputId('zip')}>ZIP Code</Label>
                <Input
                  id={inputId('zip')}
                  value={formValues.zip_code}
                  onChange={(e) => handleChange('zip_code', e.target.value)}
                  placeholder="12345"
                  error={fieldErrors.zip_code}
                  disabled={isPending}
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-700">
              Emergency Contact
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={inputId('emergency-name')}>
                  Contact Name
                </Label>
                <Input
                  id={inputId('emergency-name')}
                  value={formValues.emergency_contact_name}
                  onChange={(e) =>
                    handleChange('emergency_contact_name', e.target.value)
                  }
                  placeholder="Full name"
                  error={fieldErrors.emergency_contact_name}
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={inputId('emergency-phone')}>
                  Contact Phone
                </Label>
                <Input
                  id={inputId('emergency-phone')}
                  type="tel"
                  value={formValues.emergency_contact_phone}
                  onChange={(e) =>
                    handleChange('emergency_contact_phone', e.target.value)
                  }
                  placeholder="(555) 123-4567"
                  error={fieldErrors.emergency_contact_phone}
                  disabled={isPending}
                />
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-3">
          <Button
            id={btnId('cancel', 'profile-edit')}
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            id={btnId('save', 'profile-edit')}
            type="submit"
            disabled={isPending}
          >
            {isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
