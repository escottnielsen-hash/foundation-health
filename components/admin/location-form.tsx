'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ZodError } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'
import { updateLocation, createLocation } from '@/lib/actions/admin/locations'
import {
  locationFormSchema,
  generateSlug,
  getDefaultOperatingHours,
  LOCATION_TYPES,
  COMMON_AMENITIES,
  type LocationFormData,
  type OperatingHoursEntry,
} from '@/lib/validations/admin/locations'
import type { Location, Json } from '@/types/database'
import { Loader2, X } from 'lucide-react'

// ============================================
// Types
// ============================================

interface LocationFormProps {
  location?: Location | null
  mode: 'create' | 'edit'
}

type FieldErrors = Partial<Record<keyof LocationFormData, string>>

// ============================================
// Helper to extract operating hours from Json
// ============================================

function parseOperatingHours(raw: Json | undefined | null): OperatingHoursEntry[] {
  if (!raw || !Array.isArray(raw)) {
    return getDefaultOperatingHours()
  }
  return (raw as OperatingHoursEntry[]).map((entry) => ({
    day: String(entry.day ?? ''),
    open: String(entry.open ?? ''),
    close: String(entry.close ?? ''),
    closed: Boolean(entry.closed),
  }))
}

function parseAmenities(raw: Json | undefined | null): string[] {
  if (!raw || !Array.isArray(raw)) return []
  return raw.filter((item): item is string => typeof item === 'string')
}

// ============================================
// LocationForm Component
// ============================================

export function LocationForm({ location, mode }: LocationFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  // Form state
  const [name, setName] = useState(location?.name ?? '')
  const [slug, setSlug] = useState(location?.slug ?? '')
  const [locationType, setLocationType] = useState(location?.location_type ?? 'hub')
  const [description, setDescription] = useState(location?.description ?? '')
  const [tagline, setTagline] = useState(location?.tagline ?? '')
  const [addressLine1, setAddressLine1] = useState(location?.address_line1 ?? '')
  const [addressLine2, setAddressLine2] = useState(location?.address_line2 ?? '')
  const [city, setCity] = useState(location?.city ?? '')
  const [state, setState] = useState(location?.state ?? '')
  const [zipCode, setZipCode] = useState(location?.zip_code ?? '')
  const [county, setCounty] = useState(location?.county ?? '')
  const [country, setCountry] = useState(location?.country ?? 'US')
  const [phone, setPhone] = useState(location?.phone ?? '')
  const [fax, setFax] = useState(location?.fax ?? '')
  const [email, setEmail] = useState(location?.email ?? '')
  const [latitude, setLatitude] = useState(location?.latitude?.toString() ?? '')
  const [longitude, setLongitude] = useState(location?.longitude?.toString() ?? '')
  const [travelInfo, setTravelInfo] = useState(location?.travel_info ?? '')
  const [accommodationInfo, setAccommodationInfo] = useState(location?.accommodation_info ?? '')
  const [conciergeInfo, setConciergeInfo] = useState(location?.concierge_info ?? '')
  const [isActive, setIsActive] = useState(location?.is_active ?? true)
  const [isCriticalAccess, setIsCriticalAccess] = useState(location?.is_critical_access ?? false)
  const [npi, setNpi] = useState(location?.npi ?? '')
  const [timezone, setTimezone] = useState(location?.timezone ?? 'America/New_York')

  // Amenities
  const [amenities, setAmenities] = useState<string[]>(
    parseAmenities(location?.amenities)
  )

  // Operating hours
  const [operatingHours, setOperatingHours] = useState<OperatingHoursEntry[]>(
    parseOperatingHours(location?.operating_hours)
  )

  // Validation errors
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  // Auto-generate slug from name
  const handleNameChange = (newName: string) => {
    setName(newName)
    if (mode === 'create' || !location?.slug) {
      setSlug(generateSlug(newName))
    }
  }

  // Amenity toggle
  const toggleAmenity = (amenity: string) => {
    setAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    )
  }

  // Update operating hours entry
  const updateHoursEntry = (
    index: number,
    field: keyof OperatingHoursEntry,
    value: string | boolean
  ) => {
    setOperatingHours((prev) =>
      prev.map((entry, i) =>
        i === index ? { ...entry, [field]: value } : entry
      )
    )
  }

  // Build form data
  const buildFormData = (): LocationFormData => ({
    name,
    slug,
    location_type: locationType,
    description,
    tagline,
    address_line1: addressLine1,
    address_line2: addressLine2,
    city,
    state,
    zip_code: zipCode,
    county,
    country,
    phone,
    fax,
    email,
    latitude: latitude ? parseFloat(latitude) : null,
    longitude: longitude ? parseFloat(longitude) : null,
    travel_info: travelInfo,
    accommodation_info: accommodationInfo,
    concierge_info: conciergeInfo,
    amenities,
    operating_hours: operatingHours,
    is_active: isActive,
    is_critical_access: isCriticalAccess,
    npi,
    timezone,
  })

  // Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFieldErrors({})

    const formData = buildFormData()

    // Client-side validation
    const parseResult = locationFormSchema.safeParse(formData)
    if (!parseResult.success) {
      const errors: FieldErrors = {}
      for (const issue of (parseResult.error as ZodError).issues) {
        const field = issue.path[0] as keyof LocationFormData | undefined
        if (field && !errors[field]) {
          errors[field] = issue.message
        }
      }
      setFieldErrors(errors)
      toast({
        title: 'Validation Error',
        description: 'Please fix the highlighted fields.',
        variant: 'destructive',
      })
      return
    }

    startTransition(async () => {
      const result =
        mode === 'edit' && location
          ? await updateLocation(location.id, formData)
          : await createLocation(formData)

      if (result.success) {
        toast({
          title: mode === 'edit' ? 'Location Updated' : 'Location Created',
          description: `"${name}" has been ${mode === 'edit' ? 'updated' : 'created'} successfully.`,
          variant: 'success',
        })
        router.push('/admin/locations')
        router.refresh()
      } else {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        })
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name" required>
                Location Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Main Campus"
                error={fieldErrors.name}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">URL Slug</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="main-campus"
                error={fieldErrors.slug}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="location_type" required>
                Location Type
              </Label>
              <Select
                id="location_type"
                value={locationType}
                onChange={(e) =>
                  setLocationType(
                    e.target.value as LocationFormData['location_type']
                  )
                }
                error={fieldErrors.location_type}
              >
                {LOCATION_TYPES.map((lt) => (
                  <option key={lt.value} value={lt.value}>
                    {lt.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="npi">NPI</Label>
              <Input
                id="npi"
                value={npi}
                onChange={(e) => setNpi(e.target.value)}
                placeholder="1234567890"
                error={fieldErrors.npi}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Input
              id="tagline"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Your go-to orthopedic care center"
              error={fieldErrors.tagline}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detailed description of the location..."
              rows={3}
              error={fieldErrors.description}
            />
          </div>

          <Separator />

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <Switch
                checked={isActive}
                onCheckedChange={setIsActive}
                id="is_active"
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={isCriticalAccess}
                onCheckedChange={setIsCriticalAccess}
                id="is_critical_access"
              />
              <Label htmlFor="is_critical_access">Critical Access</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Address</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address_line1">Address Line 1</Label>
            <Input
              id="address_line1"
              value={addressLine1}
              onChange={(e) => setAddressLine1(e.target.value)}
              placeholder="123 Medical Center Dr"
              error={fieldErrors.address_line1}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address_line2">Address Line 2</Label>
            <Input
              id="address_line2"
              value={addressLine2}
              onChange={(e) => setAddressLine2(e.target.value)}
              placeholder="Suite 100"
              error={fieldErrors.address_line2}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Dallas"
                error={fieldErrors.city}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="TX"
                error={fieldErrors.state}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip_code">Zip Code</Label>
              <Input
                id="zip_code"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder="75201"
                error={fieldErrors.zip_code}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="county">County</Label>
              <Input
                id="county"
                value={county}
                onChange={(e) => setCounty(e.target.value)}
                placeholder="Dallas County"
                error={fieldErrors.county}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="US"
                error={fieldErrors.country}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="32.7767"
                error={fieldErrors.latitude}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="-96.7970"
                error={fieldErrors.longitude}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(214) 555-0100"
                error={fieldErrors.phone}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fax">Fax</Label>
              <Input
                id="fax"
                value={fax}
                onChange={(e) => setFax(e.target.value)}
                placeholder="(214) 555-0101"
                error={fieldErrors.fax}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="info@foundation.health"
                error={fieldErrors.email}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select
              id="timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
            >
              <option value="America/New_York">Eastern (ET)</option>
              <option value="America/Chicago">Central (CT)</option>
              <option value="America/Denver">Mountain (MT)</option>
              <option value="America/Los_Angeles">Pacific (PT)</option>
              <option value="America/Anchorage">Alaska (AKT)</option>
              <option value="Pacific/Honolulu">Hawaii (HT)</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Operating Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Operating Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {operatingHours.map((entry, index) => (
              <div
                key={entry.day}
                className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50/50 p-3"
              >
                <div className="w-24 text-sm font-medium text-gray-700">
                  {entry.day}
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={!entry.closed}
                    onCheckedChange={(open) =>
                      updateHoursEntry(index, 'closed', !open)
                    }
                  />
                  <span className="text-xs text-gray-500">
                    {entry.closed ? 'Closed' : 'Open'}
                  </span>
                </div>
                {!entry.closed && (
                  <>
                    <Input
                      type="time"
                      value={entry.open}
                      onChange={(e) =>
                        updateHoursEntry(index, 'open', e.target.value)
                      }
                      className="h-9 w-32 text-sm"
                    />
                    <span className="text-sm text-gray-400">to</span>
                    <Input
                      type="time"
                      value={entry.close}
                      onChange={(e) =>
                        updateHoursEntry(index, 'close', e.target.value)
                      }
                      className="h-9 w-32 text-sm"
                    />
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Amenities */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Amenities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {COMMON_AMENITIES.map((amenity) => {
              const isSelected = amenities.includes(amenity)
              return (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => toggleAmenity(amenity)}
                  className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    isSelected
                      ? 'border-blue-200 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {amenity}
                  {isSelected && <X className="h-3 w-3" />}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Additional Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="travel_info">Travel Information</Label>
            <Textarea
              id="travel_info"
              value={travelInfo}
              onChange={(e) => setTravelInfo(e.target.value)}
              placeholder="Directions, parking instructions, transit info..."
              rows={3}
              error={fieldErrors.travel_info}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="accommodation_info">Accommodation Information</Label>
            <Textarea
              id="accommodation_info"
              value={accommodationInfo}
              onChange={(e) => setAccommodationInfo(e.target.value)}
              placeholder="Nearby hotels, lodging partnerships..."
              rows={3}
              error={fieldErrors.accommodation_info}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="concierge_info">Concierge Information</Label>
            <Textarea
              id="concierge_info"
              value={conciergeInfo}
              onChange={(e) => setConciergeInfo(e.target.value)}
              placeholder="Concierge services available..."
              rows={3}
              error={fieldErrors.concierge_info}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/locations')}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === 'edit' ? 'Save Changes' : 'Create Location'}
        </Button>
      </div>
    </form>
  )
}
