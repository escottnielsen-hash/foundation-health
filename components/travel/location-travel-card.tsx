import Link from 'next/link'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Mountain, Sun, ArrowRight } from 'lucide-react'
import type { LocationSummary } from '@/lib/data/travel-guides'

// ============================================
// Types
// ============================================

interface LocationTravelCardProps {
  location: LocationSummary
}

// ============================================
// Location icon map
// ============================================

const locationIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  moab: Sun,
  'park-city': Mountain,
  'powder-mountain': Mountain,
  camas: MapPin,
}

// ============================================
// Component
// ============================================

export function LocationTravelCard({ location }: LocationTravelCardProps) {
  const Icon = locationIcons[location.slug] ?? MapPin

  return (
    <Card className="group relative overflow-hidden transition-all duration-200 hover:shadow-md hover:border-amber-200">
      {/* Decorative accent */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 to-amber-600" />

      <CardHeader className="pb-3">
        <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50">
          <Icon className="h-5 w-5 text-amber-600" />
        </div>
        <CardTitle className="text-lg">{location.name}</CardTitle>
        <CardDescription className="text-sm font-medium text-amber-700">
          {location.tagline}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed text-gray-600">
          {location.description.length > 180
            ? location.description.slice(0, 180) + '...'
            : location.description}
        </p>

        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Mountain className="h-3.5 w-3.5" />
            {location.elevation}
          </span>
          <span className="flex items-center gap-1">
            <Sun className="h-3.5 w-3.5" />
            {location.climate}
          </span>
        </div>

        <Button asChild variant="outline" className="w-full group-hover:border-amber-300 group-hover:text-amber-700">
          <Link href={`/patient/travel/${location.slug}`}>
            Explore Travel Guide
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
