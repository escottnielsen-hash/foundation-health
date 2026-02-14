'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useBookingStore, type BookingLocation } from '@/lib/stores/booking-store'
import { getBookingLocations } from '@/lib/actions/appointments'
import type { BookingLocationData } from '@/lib/actions/appointments'

// ============================================
// Location type badge helper
// ============================================

function LocationTypeBadge({ type }: { type: string }) {
  const variant = type === 'hub' ? 'default' : 'outline'
  const label = type === 'hub' ? 'Hub' : type === 'spoke' ? 'Spoke' : type.charAt(0).toUpperCase() + type.slice(1)

  return (
    <Badge variant={variant} className="text-[10px]">
      {label}
    </Badge>
  )
}

// ============================================
// Location address formatter
// ============================================

function formatLocationAddress(loc: BookingLocationData): string {
  const parts: string[] = []
  if (loc.address_line1) parts.push(loc.address_line1)
  if (loc.city && loc.state) {
    parts.push(`${loc.city}, ${loc.state}`)
  } else if (loc.city) {
    parts.push(loc.city)
  } else if (loc.state) {
    parts.push(loc.state)
  }
  if (loc.zip_code) parts.push(loc.zip_code)
  return parts.join(' - ')
}

// ============================================
// SelectLocationStep
// ============================================

export function SelectLocationStep() {
  const [locations, setLocations] = useState<BookingLocationData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { selectedLocation, setLocation, nextStep } = useBookingStore()

  useEffect(() => {
    async function load() {
      setLoading(true)
      const result = await getBookingLocations()
      if (result.success) {
        setLocations(result.data)
      } else {
        setError(result.error)
      }
      setLoading(false)
    }
    load()
  }, [])

  function handleSelect(location: BookingLocationData) {
    const bookingLocation: BookingLocation = {
      id: location.id,
      name: location.name,
      location_type: location.location_type,
      city: location.city,
      state: location.state,
      address_line1: location.address_line1,
      address_line2: location.address_line2,
      zip_code: location.zip_code,
      phone: location.phone,
      is_active: location.is_active,
    }
    setLocation(bookingLocation)
    nextStep()
  }

  function handleAnyLocation() {
    setLocation(null)
    nextStep()
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (locations.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            No locations available
          </h3>
          <p className="text-gray-500 text-sm">
            There are currently no locations available for booking. Please check back later.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Select a Location
      </h2>

      {/* "Any Location" option */}
      <Card
        className={`cursor-pointer transition-all hover:border-primary-300 hover:shadow-md ${
          selectedLocation === null
            ? ''
            : ''
        }`}
        onClick={handleAnyLocation}
      >
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-gray-900">
                Any Location
              </h3>
              <p className="text-sm text-gray-500">
                Show all available services and providers across all locations
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location cards */}
      {locations.map((location) => {
        const isSelected = selectedLocation?.id === location.id
        const address = formatLocationAddress(location)

        return (
          <Card
            key={location.id}
            className={`cursor-pointer transition-all hover:border-primary-300 hover:shadow-md ${
              isSelected
                ? 'border-primary-500 ring-2 ring-primary-100'
                : ''
            }`}
            onClick={() => handleSelect(location)}
          >
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-semibold text-gray-900">
                      {location.name}
                    </h3>
                    <LocationTypeBadge type={location.location_type} />
                  </div>
                  {address && (
                    <p className="text-sm text-gray-500">
                      {address}
                    </p>
                  )}
                  {location.phone && (
                    <p className="text-xs text-gray-400 mt-1">
                      {location.phone}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
