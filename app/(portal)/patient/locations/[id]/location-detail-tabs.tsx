'use client'

import Link from 'next/link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { elementId } from '@/lib/utils/element-ids'
import type { Location } from '@/types/database'
import type { LocationProvider, LocationServiceItem } from '@/lib/actions/locations'
import {
  MapPin,
  Phone,
  Clock,
  Building2,
  CheckCircle2,
  Plane,
  Hotel,
  ConciergeBell,
  Navigation,
  Mail,
  Globe,
  User,
  Stethoscope,
  Star,
} from 'lucide-react'

// ============================================
// Props
// ============================================

interface LocationDetailTabsProps {
  location: Location
  providers: LocationProvider[]
  services: LocationServiceItem[]
  googleMapsUrl: string
}

// ============================================
// Helper: parse JSONB arrays
// ============================================

function parseStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((v): v is string => typeof v === 'string')
  }
  return []
}

// ============================================
// Helper: get initials
// ============================================

function getInitials(firstName: string | null | undefined, lastName: string | null | undefined): string {
  const first = (firstName ?? '').trim()
  const last = (lastName ?? '').trim()
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || '?'
}

// ============================================
// Component
// ============================================

export function LocationDetailTabs({
  location,
  providers,
  services,
  googleMapsUrl,
}: LocationDetailTabsProps) {
  const amenities = parseStringArray(location.amenities)
  const features = parseStringArray(location.features)

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="w-full justify-start overflow-x-auto bg-gray-100/80">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="providers">
          Providers {providers.length > 0 && `(${providers.length})`}
        </TabsTrigger>
        <TabsTrigger value="services">
          Services {services.length > 0 && `(${services.length})`}
        </TabsTrigger>
        <TabsTrigger value="travel">Travel & Accommodations</TabsTrigger>
      </TabsList>

      {/* ============================== */}
      {/* OVERVIEW TAB */}
      {/* ============================== */}
      <TabsContent value="overview" className="space-y-6">
        {/* Description */}
        {location.description && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">About This Location</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">{location.description}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Contact info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {location.address_line1 && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Address</p>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {location.address_line1}
                      {location.address_line2 && <><br />{location.address_line2}</>}
                      <br />
                      {[location.city, location.state].filter(Boolean).join(', ')} {location.zip_code}
                    </p>
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 mt-1"
                    >
                      <Navigation className="h-3.5 w-3.5" />
                      Get Directions
                    </a>
                  </div>
                </div>
              )}
              {location.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Phone</p>
                    <a
                      href={`tel:${location.phone}`}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      {location.phone}
                    </a>
                  </div>
                </div>
              )}
              {location.fax && (
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Fax</p>
                    <p className="text-sm text-gray-500">{location.fax}</p>
                  </div>
                </div>
              )}
              {location.email && (
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email</p>
                    <a
                      href={`mailto:${location.email}`}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      {location.email}
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Location Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Type</p>
                  <p className="text-sm text-gray-500 capitalize">{location.location_type}</p>
                </div>
              </div>
              {location.is_critical_access && (
                <div className="flex items-start gap-3">
                  <Star className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Critical Access Hospital</p>
                    <p className="text-sm text-gray-500">
                      Federally designated CAH with 101% Medicare cost reimbursement
                    </p>
                  </div>
                </div>
              )}
              {location.timezone && (
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Timezone</p>
                    <p className="text-sm text-gray-500">{location.timezone}</p>
                  </div>
                </div>
              )}
              {location.npi && (
                <div className="flex items-start gap-3">
                  <Globe className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">NPI</p>
                    <p className="text-sm text-gray-500">{location.npi}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Amenities */}
        {amenities.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Amenities & Accessibility</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span className="text-sm text-gray-600">{amenity}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Features */}
        {features.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Key Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {features.map((feature) => (
                  <Badge key={feature} variant="outline" className="text-sm">
                    {feature}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* ============================== */}
      {/* PROVIDERS TAB */}
      {/* ============================== */}
      <TabsContent value="providers" className="space-y-6">
        {providers.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {providers.map((pl) => {
              const provider = pl.physician_profiles
              if (!provider) return null

              const firstName = provider.profiles?.first_name ?? ''
              const lastName = provider.profiles?.last_name ?? ''
              const fullName = `${firstName} ${lastName}`.trim() || 'Unknown Provider'
              const initials = getInitials(firstName, lastName)

              return (
                <Card
                  key={pl.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-amber-100 font-display text-sm font-semibold shrink-0"
                        aria-hidden="true"
                      >
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/patient/providers/${provider.id}`}
                          className="text-base font-semibold text-gray-900 hover:text-primary-600 transition-colors"
                        >
                          {fullName}
                          {provider.credentials && (
                            <span className="text-sm font-normal text-gray-500">
                              , {provider.credentials}
                            </span>
                          )}
                        </Link>
                        {provider.specialty && (
                          <p className="text-sm text-gray-500 mt-0.5">{provider.specialty}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {pl.is_primary && (
                            <Badge variant="success" className="text-xs">Primary</Badge>
                          )}
                          {provider.accepting_new_patients && (
                            <Badge variant="outline" className="text-xs">
                              Accepting Patients
                            </Badge>
                          )}
                        </div>
                        {pl.days_available && pl.days_available.length > 0 && (
                          <p className="text-xs text-gray-400 mt-2">
                            Available: {pl.days_available.join(', ')}
                          </p>
                        )}
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/patient/providers/${provider.id}`}>
                          View
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center py-16">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                <User className="h-7 w-7 text-gray-400" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-gray-900">
                No providers listed
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Provider information for this location will be available soon.
              </p>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* ============================== */}
      {/* SERVICES TAB */}
      {/* ============================== */}
      <TabsContent value="services" className="space-y-6">
        {services.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map((ls) => {
              const service = ls.service_catalog
              if (!service) return null

              return (
                <Card
                  key={ls.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/patient/services/${service.id}`}
                          className="text-base font-semibold text-gray-900 hover:text-primary-600 transition-colors"
                        >
                          {service.name}
                        </Link>
                        {service.category && (
                          <Badge variant="outline" className="text-xs mt-1.5 capitalize">
                            {service.category.replace(/_/g, ' ')}
                          </Badge>
                        )}
                        {service.description && (
                          <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                            {service.description}
                          </p>
                        )}
                      </div>
                      {service.base_price > 0 && (
                        <span className="text-sm font-semibold text-gray-900 shrink-0">
                          ${service.base_price.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {service.is_telehealth_eligible && (
                        <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                          Telehealth Eligible
                        </span>
                      )}
                      {service.duration_minutes && (
                        <span className="text-xs text-gray-400">
                          {service.duration_minutes} min
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center py-16">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                <Stethoscope className="h-7 w-7 text-gray-400" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-gray-900">
                No services listed
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Service information for this location will be available soon.
              </p>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* ============================== */}
      {/* TRAVEL & ACCOMMODATIONS TAB */}
      {/* ============================== */}
      <TabsContent value="travel" className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Travel info */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50">
                  <Plane className="h-5 w-5 text-sky-600" />
                </div>
                <CardTitle className="text-lg">Getting Here</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {location.travel_info ? (
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {location.travel_info}
                </p>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-400">
                    Travel information will be available soon. Contact our concierge
                    team for assistance with travel arrangements.
                  </p>
                </div>
              )}

              {/* Directions link */}
              {location.address_line1 && (
                <>
                  <Separator className="my-4" />
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700"
                  >
                    <Navigation className="h-4 w-4" />
                    Open in Google Maps
                  </a>
                </>
              )}
            </CardContent>
          </Card>

          {/* Accommodations */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                  <Hotel className="h-5 w-5 text-amber-600" />
                </div>
                <CardTitle className="text-lg">Accommodations</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {location.accommodation_info ? (
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {location.accommodation_info}
                </p>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-gray-400">
                    Our team can arrange luxury accommodations near this location.
                    Contact your care coordinator for personalized lodging recommendations.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Concierge services */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
                <Star className="h-5 w-5 text-purple-600" />
              </div>
              <CardTitle className="text-lg">Concierge Services</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {location.concierge_info ? (
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {location.concierge_info}
              </p>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 leading-relaxed">
                  Foundation Health members enjoy comprehensive concierge services at every
                  destination. Our dedicated team handles the details so you can focus on healing.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    'Airport transfers and ground transportation',
                    'Luxury hotel and resort reservations',
                    'Private dining and restaurant recommendations',
                    'Post-surgical recovery suite arrangements',
                    'Companion and family accommodation',
                    'Local experience and recreation planning',
                  ].map((service) => (
                    <div key={service} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-purple-500 shrink-0" />
                      <span className="text-sm text-gray-500">{service}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="rounded-xl bg-gradient-to-r from-slate-800 to-slate-900 p-8 text-center">
          <h3 className="text-lg font-display font-semibold text-white mb-2">
            Need Help Planning Your Visit?
          </h3>
          <p className="text-white/60 text-sm mb-6 max-w-lg mx-auto">
            Our care concierge team is available to assist with every aspect of your
            destination healthcare experience.
          </p>
          {location.phone && (
            <Button variant="secondary" asChild>
              <a href={`tel:${location.phone}`}>
                <Phone className="h-4 w-4 mr-2" />
                Call {location.phone}
              </a>
            </Button>
          )}
        </div>
      </TabsContent>
    </Tabs>
  )
}
