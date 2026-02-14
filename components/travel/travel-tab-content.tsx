import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Plane,
  Car,
  Hotel,
  UtensilsCrossed,
  MapPin,
  Star,
  DollarSign,
  Heart,
  Navigation,
} from 'lucide-react'
import type {
  LocationGuide,
  AirportInfo,
  AccommodationOption,
  TransportOption,
  DiningOption,
  ActivityOption,
} from '@/lib/data/travel-guides'

// ============================================
// Getting There Tab
// ============================================

function AirportCard({ airport }: { airport: AirportInfo }) {
  return (
    <div className="flex items-start gap-4 rounded-lg border border-gray-100 bg-gray-50/50 p-4">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-amber-50">
        <Plane className="h-5 w-5 text-amber-600" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-gray-900">{airport.name}</p>
        <p className="text-sm font-semibold text-amber-700">{airport.code}</p>
        <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
          <span>{airport.distance}</span>
          <span className="text-gray-300">|</span>
          <span>{airport.driveTime} drive</span>
        </div>
      </div>
    </div>
  )
}

export function GettingThereContent({ guide }: { guide: LocationGuide }) {
  return (
    <div className="space-y-6">
      {/* Airports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Plane className="h-5 w-5 text-amber-600" />
            Airports
          </CardTitle>
          <CardDescription>
            Nearest airports and approximate travel times
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {guide.gettingThere.airports.map((airport) => (
            <AirportCard key={airport.code} airport={airport} />
          ))}
        </CardContent>
      </Card>

      {/* Private Aviation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Star className="h-5 w-5 text-amber-600" />
            Private Aviation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="leading-relaxed text-gray-600">
            {guide.gettingThere.privateAviation}
          </p>
        </CardContent>
      </Card>

      {/* Driving */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Navigation className="h-5 w-5 text-amber-600" />
            Driving Directions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="leading-relaxed text-gray-600">
            {guide.gettingThere.drivingNotes}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================
// Accommodations Tab
// ============================================

const accommodationTypeLabels: Record<AccommodationOption['type'], string> = {
  'luxury-resort': 'Luxury Resort',
  'boutique-hotel': 'Boutique Hotel',
  'extended-stay': 'Extended Stay',
  'vacation-rental': 'Vacation Rental',
}

function AccommodationCard({ accommodation }: { accommodation: AccommodationOption }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base">{accommodation.name}</CardTitle>
            <Badge variant="outline" className="mt-1 text-xs font-normal">
              {accommodationTypeLabels[accommodation.type]}
            </Badge>
          </div>
          <span className="flex items-center gap-1 whitespace-nowrap text-sm font-medium text-amber-700">
            <DollarSign className="h-3.5 w-3.5" />
            {accommodation.priceRange}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm leading-relaxed text-gray-600">
          {accommodation.description}
        </p>
        <div className="flex items-center gap-2 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          <Star className="h-4 w-4 flex-shrink-0 text-amber-500" />
          {accommodation.highlight}
        </div>
      </CardContent>
    </Card>
  )
}

export function AccommodationsContent({ guide }: { guide: LocationGuide }) {
  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-amber-100 bg-amber-50/50 p-4">
        <p className="text-sm leading-relaxed text-amber-800">
          Our concierge team has curated partnerships with the finest
          accommodations near {guide.name}. Each property has been selected for
          comfort, accessibility, and proximity to our clinic. Let us arrange
          your stay at any of these preferred properties.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {guide.accommodations.map((accommodation) => (
          <AccommodationCard
            key={accommodation.name}
            accommodation={accommodation}
          />
        ))}
      </div>
    </div>
  )
}

// ============================================
// Transportation Tab
// ============================================

const transportTypeIcons: Record<TransportOption['type'], React.ComponentType<{ className?: string }>> = {
  rental: Car,
  'private-car': Car,
  shuttle: Car,
  rideshare: MapPin,
}

function TransportCard({ transport }: { transport: TransportOption }) {
  const Icon = transportTypeIcons[transport.type]

  return (
    <div className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-amber-50">
        <Icon className="h-5 w-5 text-amber-600" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-gray-900">{transport.name}</p>
        <Badge variant="outline" className="mt-1 text-xs font-normal capitalize">
          {transport.type.replace('-', ' ')}
        </Badge>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          {transport.description}
        </p>
      </div>
    </div>
  )
}

export function TransportationContent({ guide }: { guide: LocationGuide }) {
  return (
    <div className="space-y-5">
      {guide.transportation.map((transport) => (
        <TransportCard key={transport.name} transport={transport} />
      ))}

      <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
        <p className="text-sm text-gray-600">
          <strong className="text-gray-900">Need help arranging transportation?</strong>{' '}
          Our concierge team is happy to coordinate all ground transportation for
          your visit, including airport transfers, daily medical appointments,
          and excursions.
        </p>
      </div>
    </div>
  )
}

// ============================================
// Dining & Activities Tab
// ============================================

function DiningCard({ restaurant }: { restaurant: DiningOption }) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-amber-50">
        <UtensilsCrossed className="h-5 w-5 text-amber-600" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-medium text-gray-900">{restaurant.name}</p>
            <p className="text-xs text-gray-500">{restaurant.cuisine}</p>
          </div>
          <span className="text-sm font-medium text-amber-700">
            {restaurant.priceRange}
          </span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          {restaurant.description}
        </p>
      </div>
    </div>
  )
}

function ActivityCard({ activity }: { activity: ActivityOption }) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-amber-50">
        <Hotel className="h-5 w-5 text-amber-600" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium text-gray-900">{activity.name}</p>
          {activity.recoveryFriendly && (
            <Badge className="flex-shrink-0 bg-green-50 text-green-700 hover:bg-green-50">
              <Heart className="mr-1 h-3 w-3" />
              Recovery-Friendly
            </Badge>
          )}
        </div>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          {activity.description}
        </p>
      </div>
    </div>
  )
}

export function DiningActivitiesContent({ guide }: { guide: LocationGuide }) {
  return (
    <div className="space-y-8">
      {/* Dining */}
      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <UtensilsCrossed className="h-5 w-5 text-amber-600" />
          Recommended Dining
        </h3>
        <div className="space-y-4">
          {guide.dining.map((restaurant) => (
            <DiningCard key={restaurant.name} restaurant={restaurant} />
          ))}
        </div>
      </div>

      {/* Activities */}
      <div className="space-y-4">
        <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <MapPin className="h-5 w-5 text-amber-600" />
          Things to Do
        </h3>
        <p className="text-sm text-gray-500">
          Activities curated for comfort and accessibility during your recovery
        </p>
        <div className="space-y-4">
          {guide.activities.map((activity) => (
            <ActivityCard key={activity.name} activity={activity} />
          ))}
        </div>
      </div>
    </div>
  )
}
