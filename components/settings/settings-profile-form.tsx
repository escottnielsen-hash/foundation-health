'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectItem } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { updateProfile } from '@/lib/actions/settings'
import { US_STATES } from '@/lib/validations/patient'
import type { SettingsProfileFormData } from '@/lib/validations/settings'
import type { Profile, PhysicianProfile, PatientProfile } from '@/types/database'
import { elementId, formId, inputId, btnId } from '@/lib/utils/element-ids'

// ============================================
// Props
// ============================================

interface SettingsProfileFormWrapperProps {
  profile: Profile
  physicianProfile: PhysicianProfile | null
  patientProfile: PatientProfile | null
}

// ============================================
// Wrapper — manages open/close state
// ============================================

export function SettingsProfileFormWrapper({
  profile,
  physicianProfile,
  patientProfile,
}: SettingsProfileFormWrapperProps) {
  const [isEditing, setIsEditing] = useState(false)

  if (!isEditing) {
    return (
      <div id={elementId('settings', 'profile', 'edit-trigger')} className="flex justify-end">
        <Button
          id={btnId('edit', 'settings-profile')}
          onClick={() => setIsEditing(true)}
        >
          Edit Profile
        </Button>
      </div>
    )
  }

  return (
    <SettingsProfileForm
      profile={profile}
      physicianProfile={physicianProfile}
      patientProfile={patientProfile}
      onCancel={() => setIsEditing(false)}
      onSuccess={() => setIsEditing(false)}
    />
  )
}

// ============================================
// Profile Edit Form
// ============================================

interface SettingsProfileFormProps {
  profile: Profile
  physicianProfile: PhysicianProfile | null
  patientProfile: PatientProfile | null
  onCancel: () => void
  onSuccess: () => void
}

function SettingsProfileForm({
  profile,
  physicianProfile,
  patientProfile,
  onCancel,
  onSuccess,
}: SettingsProfileFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const isPatient = profile.role === 'patient'
  const isPhysician = profile.role === 'physician'

  const [formValues, setFormValues] = useState<SettingsProfileFormData>({
    first_name: profile.first_name ?? '',
    last_name: profile.last_name ?? '',
    phone: profile.phone ?? '',
    date_of_birth: isPatient ? (profile.date_of_birth ?? '') : undefined,
    address_line1: isPatient ? (profile.address_line1 ?? '') : undefined,
    address_line2: isPatient ? (profile.address_line2 ?? '') : undefined,
    city: isPatient ? (profile.city ?? '') : undefined,
    state: isPatient ? (profile.state ?? '') : undefined,
    zip_code: isPatient ? (profile.zip_code ?? '') : undefined,
    emergency_contact_name: isPatient ? (patientProfile?.emergency_contact_name ?? '') : undefined,
    emergency_contact_phone: isPatient ? (patientProfile?.emergency_contact_phone ?? '') : undefined,
    emergency_contact_relationship: isPatient ? (patientProfile?.emergency_contact_relationship ?? '') : undefined,
    bio: isPhysician ? (physicianProfile?.bio ?? '') : undefined,
  })

  const handleChange = (
    field: keyof SettingsProfileFormData,
    value: string
  ) => {
    setFormValues((prev) => ({ ...prev, [field]: value }))
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
      const result = await updateProfile(formValues)

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
    <Card id={elementId('settings', 'profile', 'edit', 'card')}>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
        <CardDescription>
          Update your personal information below
        </CardDescription>
      </CardHeader>
      <form id={formId('settings-profile-edit')} onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {/* Name Fields */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={inputId('settings-first-name')} required>
                First Name
              </Label>
              <Input
                id={inputId('settings-first-name')}
                value={formValues.first_name}
                onChange={(e) => handleChange('first_name', e.target.value)}
                placeholder="First name"
                error={fieldErrors.first_name}
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={inputId('settings-last-name')} required>
                Last Name
              </Label>
              <Input
                id={inputId('settings-last-name')}
                value={formValues.last_name}
                onChange={(e) => handleChange('last_name', e.target.value)}
                placeholder="Last name"
                error={fieldErrors.last_name}
                disabled={isPending}
              />
            </div>
          </div>

          {/* Phone */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={inputId('settings-phone')}>Phone Number</Label>
              <Input
                id={inputId('settings-phone')}
                type="tel"
                value={formValues.phone ?? ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="(555) 123-4567"
                error={fieldErrors.phone}
                disabled={isPending}
              />
            </div>

            {/* Date of Birth — patients only */}
            {isPatient && (
              <div className="space-y-2">
                <Label htmlFor={inputId('settings-dob')}>Date of Birth</Label>
                <Input
                  id={inputId('settings-dob')}
                  type="date"
                  value={formValues.date_of_birth ?? ''}
                  onChange={(e) => handleChange('date_of_birth', e.target.value)}
                  error={fieldErrors.date_of_birth}
                  disabled={isPending}
                />
              </div>
            )}
          </div>

          {/* Address — patients only */}
          {isPatient && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700">Address</h3>
              <div className="space-y-2">
                <Label htmlFor={inputId('settings-address1')}>Address Line 1</Label>
                <Input
                  id={inputId('settings-address1')}
                  value={formValues.address_line1 ?? ''}
                  onChange={(e) => handleChange('address_line1', e.target.value)}
                  placeholder="123 Main Street"
                  error={fieldErrors.address_line1}
                  disabled={isPending}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={inputId('settings-address2')}>Address Line 2</Label>
                <Input
                  id={inputId('settings-address2')}
                  value={formValues.address_line2 ?? ''}
                  onChange={(e) => handleChange('address_line2', e.target.value)}
                  placeholder="Apt, Suite, Unit"
                  error={fieldErrors.address_line2}
                  disabled={isPending}
                />
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={inputId('settings-city')}>City</Label>
                  <Input
                    id={inputId('settings-city')}
                    value={formValues.city ?? ''}
                    onChange={(e) => handleChange('city', e.target.value)}
                    placeholder="City"
                    error={fieldErrors.city}
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={inputId('settings-state')}>State</Label>
                  <Select
                    id={inputId('settings-state')}
                    value={formValues.state ?? ''}
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
                  <Label htmlFor={inputId('settings-zip')}>ZIP Code</Label>
                  <Input
                    id={inputId('settings-zip')}
                    value={formValues.zip_code ?? ''}
                    onChange={(e) => handleChange('zip_code', e.target.value)}
                    placeholder="12345"
                    error={fieldErrors.zip_code}
                    disabled={isPending}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Emergency Contact — patients only */}
          {isPatient && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700">
                Emergency Contact
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={inputId('settings-emergency-name')}>
                    Contact Name
                  </Label>
                  <Input
                    id={inputId('settings-emergency-name')}
                    value={formValues.emergency_contact_name ?? ''}
                    onChange={(e) => handleChange('emergency_contact_name', e.target.value)}
                    placeholder="Full name"
                    error={fieldErrors.emergency_contact_name}
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={inputId('settings-emergency-phone')}>
                    Contact Phone
                  </Label>
                  <Input
                    id={inputId('settings-emergency-phone')}
                    type="tel"
                    value={formValues.emergency_contact_phone ?? ''}
                    onChange={(e) => handleChange('emergency_contact_phone', e.target.value)}
                    placeholder="(555) 123-4567"
                    error={fieldErrors.emergency_contact_phone}
                    disabled={isPending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={inputId('settings-emergency-relationship')}>
                    Relationship
                  </Label>
                  <Input
                    id={inputId('settings-emergency-relationship')}
                    value={formValues.emergency_contact_relationship ?? ''}
                    onChange={(e) => handleChange('emergency_contact_relationship', e.target.value)}
                    placeholder="e.g. Spouse, Parent"
                    error={fieldErrors.emergency_contact_relationship}
                    disabled={isPending}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Bio — physicians only */}
          {isPhysician && (
            <div className="space-y-2">
              <Label htmlFor={inputId('settings-bio')}>Bio</Label>
              <Textarea
                id={inputId('settings-bio')}
                value={formValues.bio ?? ''}
                onChange={(e) => handleChange('bio', e.target.value)}
                placeholder="Tell patients about yourself, your background, and your approach to care..."
                error={fieldErrors.bio}
                disabled={isPending}
                rows={4}
              />
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-end gap-3">
          <Button
            id={btnId('cancel', 'settings-profile-edit')}
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            id={btnId('save', 'settings-profile-edit')}
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
