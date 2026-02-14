'use client'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { elementId } from '@/lib/utils/element-ids'
import type { PhysicianProfile, Location, ServiceCatalog, Json } from '@/types/database'

interface EducationEntry {
  degree?: string
  institution?: string
  year?: number
}

interface ProviderLocationItem {
  id: string
  is_primary: boolean
  days_available: string[] | null
  location: Location
}

interface ProviderServiceItem {
  id: string
  is_primary: boolean
  custom_price: number | null
  service: ServiceCatalog
}

interface ProviderDetailTabsProps {
  provider: PhysicianProfile
  fullName: string
  educationEntries: EducationEntry[]
  locations: ProviderLocationItem[]
  services: ProviderServiceItem[]
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

export function ProviderDetailTabs({
  provider,
  fullName,
  educationEntries,
  locations,
  services,
}: ProviderDetailTabsProps) {
  return (
    <Tabs
      defaultValue="about"
      id={elementId('provider', 'detail', 'tabs')}
      className="w-full"
    >
      <TabsList className="w-full sm:w-auto">
        <TabsTrigger value="about">About</TabsTrigger>
        <TabsTrigger value="locations">
          Locations{locations.length > 0 ? ` (${locations.length})` : ''}
        </TabsTrigger>
        <TabsTrigger value="services">
          Services{services.length > 0 ? ` (${services.length})` : ''}
        </TabsTrigger>
      </TabsList>

      {/* ABOUT TAB */}
      <TabsContent value="about" className="mt-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Bio */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">About {fullName}</CardTitle>
            </CardHeader>
            <CardContent>
              {provider.bio ? (
                <p className="text-sm leading-relaxed text-gray-600 whitespace-pre-line">
                  {provider.bio}
                </p>
              ) : (
                <p className="text-sm text-gray-400 italic">
                  No biography available.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick facts sidebar */}
          <div className="space-y-6">
            {/* Education */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Education</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {provider.medical_school && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Medical School
                    </p>
                    <p className="mt-0.5 text-sm text-gray-700">
                      {provider.medical_school}
                      {provider.graduation_year
                        ? ` (${provider.graduation_year})`
                        : ''}
                    </p>
                  </div>
                )}

                {provider.residency && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Residency
                    </p>
                    <p className="mt-0.5 text-sm text-gray-700">
                      {provider.residency}
                    </p>
                  </div>
                )}

                {provider.fellowship && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                      Fellowship
                    </p>
                    <p className="mt-0.5 text-sm text-gray-700">
                      {provider.fellowship}
                    </p>
                  </div>
                )}

                {educationEntries.length > 0 && (
                  <>
                    <Separator />
                    {educationEntries.map((entry, idx) => (
                      <div key={idx}>
                        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                          {entry.degree ?? 'Degree'}
                        </p>
                        <p className="mt-0.5 text-sm text-gray-700">
                          {entry.institution ?? 'Unknown institution'}
                          {entry.year ? ` (${entry.year})` : ''}
                        </p>
                      </div>
                    ))}
                  </>
                )}

                {!provider.medical_school &&
                  !provider.residency &&
                  !provider.fellowship &&
                  educationEntries.length === 0 && (
                    <p className="text-sm text-gray-400 italic">
                      No education details available.
                    </p>
                  )}
              </CardContent>
            </Card>

            {/* Certifications */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Certifications</CardTitle>
              </CardHeader>
              <CardContent>
                {provider.board_certifications &&
                provider.board_certifications.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {provider.board_certifications.map((cert) => (
                      <Badge
                        key={cert}
                        variant="outline"
                        className="text-xs"
                      >
                        {cert}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">
                    No certifications listed.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Subspecialties */}
            {provider.subspecialties && provider.subspecialties.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Subspecialties</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {provider.subspecialties.map((sub) => (
                      <Badge
                        key={sub}
                        variant="secondary"
                        className="text-xs"
                      >
                        {sub}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Languages */}
            {provider.languages && provider.languages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Languages</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    {provider.languages.join(', ')}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </TabsContent>

      {/* LOCATIONS TAB */}
      <TabsContent value="locations" className="mt-6">
        {locations.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {locations.map((pl) => (
              <Card key={pl.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900">
                        {pl.location.name}
                      </h3>
                      {pl.is_primary && (
                        <Badge variant="success" className="mt-1 text-xs">
                          Primary Location
                        </Badge>
                      )}
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                      <svg
                        className="h-5 w-5 text-slate-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="space-y-2 text-sm text-gray-600">
                    {pl.location.address_line1 && (
                      <p>{pl.location.address_line1}</p>
                    )}
                    {pl.location.address_line2 && (
                      <p>{pl.location.address_line2}</p>
                    )}
                    <p>
                      {[pl.location.city, pl.location.state]
                        .filter(Boolean)
                        .join(', ')}{' '}
                      {pl.location.zip_code}
                    </p>
                    {pl.location.phone && (
                      <p className="mt-2">
                        <span className="font-medium text-gray-700">Phone:</span>{' '}
                        {pl.location.phone}
                      </p>
                    )}
                  </div>

                  {pl.days_available && pl.days_available.length > 0 && (
                    <div className="mt-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                        Available Days
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {pl.days_available.map((day) => (
                          <Badge
                            key={day}
                            variant="outline"
                            className="text-xs font-normal"
                          >
                            {day}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-sm text-gray-400">
                No location information available for this provider.
              </p>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* SERVICES TAB */}
      <TabsContent value="services" className="mt-6">
        {services.length > 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {services.map((ps) => {
                    const price =
                      ps.custom_price ?? ps.service.base_price
                    return (
                      <tr
                        key={ps.id}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">
                              {ps.service.name}
                            </p>
                            {ps.service.description && (
                              <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">
                                {ps.service.description}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {ps.service.category ? (
                            <Badge
                              variant="outline"
                              className="text-xs capitalize"
                            >
                              {ps.service.category.replace(/_/g, ' ')}
                            </Badge>
                          ) : (
                            <span className="text-gray-400">--</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {ps.service.duration_minutes
                            ? `${ps.service.duration_minutes} min`
                            : '--'}
                        </td>
                        <td className="px-6 py-4 text-right font-medium text-gray-900">
                          {formatPrice(price)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-sm text-gray-400">
                No services listed for this provider.
              </p>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  )
}
