import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getLocationGuide, locationSlugs } from '@/lib/data/travel-guides'
import {
  GettingThereContent,
  AccommodationsContent,
  TransportationContent,
  DiningActivitiesContent,
} from '@/components/travel/travel-tab-content'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { elementId } from '@/lib/utils/element-ids'
import {
  ArrowLeft,
  Plane,
  Hotel,
  Car,
  UtensilsCrossed,
  Mountain,
  Sun,
  MapPin,
  ConciergeBell,
} from 'lucide-react'

// ============================================
// Static params for all location slugs
// ============================================

export function generateStaticParams() {
  return locationSlugs.map((slug) => ({ locationSlug: slug }))
}

// ============================================
// Dynamic metadata
// ============================================

interface LocationGuidePageProps {
  params: Promise<{ locationSlug: string }>
}

export async function generateMetadata({ params }: LocationGuidePageProps) {
  const { locationSlug } = await params
  const guide = getLocationGuide(locationSlug)

  if (!guide) {
    return { title: 'Location Not Found | Foundation Health' }
  }

  return {
    title: `${guide.name} Travel Guide | Foundation Health`,
    description: guide.description,
  }
}

// ============================================
// Page Component
// ============================================

export default async function LocationGuidePage({ params }: LocationGuidePageProps) {
  const { locationSlug } = await params
  const guide = getLocationGuide(locationSlug)

  if (!guide) {
    notFound()
  }

  return (
    <div id={elementId('travel', 'guide', guide.slug)} className="space-y-8">
      {/* Back navigation */}
      <div>
        <Button asChild variant="ghost" size="sm" className="text-gray-500">
          <Link href="/patient/travel">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to Travel Planning
          </Link>
        </Button>
      </div>

      {/* Hero section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[hsl(222,47%,11%)] to-[hsl(222,47%,20%)] p-8 text-white md:p-10">
        <div className="relative z-10 max-w-2xl">
          <div className="mb-3 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-medium uppercase tracking-wider text-amber-400">
              Destination Guide
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            {guide.name}
          </h1>
          <p className="mt-1 text-lg font-light text-amber-300">
            {guide.tagline}
          </p>
          <p className="mt-4 leading-relaxed text-white/70">
            {guide.description}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <Badge className="bg-white/10 text-white hover:bg-white/20">
              <Mountain className="mr-1.5 h-3 w-3" />
              {guide.elevation}
            </Badge>
            <Badge className="bg-white/10 text-white hover:bg-white/20">
              <Sun className="mr-1.5 h-3 w-3" />
              {guide.climate}
            </Badge>
            <Badge className="bg-amber-400/20 text-amber-300 hover:bg-amber-400/30">
              Best: {guide.bestTimeToVisit}
            </Badge>
          </div>
        </div>

        {/* Decorative */}
        <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-amber-400/5" />
        <div className="absolute -bottom-20 -right-20 h-80 w-80 rounded-full bg-amber-400/5" />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="getting-there" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
          <TabsTrigger value="getting-there" className="gap-1.5 text-xs sm:text-sm">
            <Plane className="hidden h-4 w-4 sm:block" />
            Getting There
          </TabsTrigger>
          <TabsTrigger value="accommodations" className="gap-1.5 text-xs sm:text-sm">
            <Hotel className="hidden h-4 w-4 sm:block" />
            Accommodations
          </TabsTrigger>
          <TabsTrigger value="transportation" className="gap-1.5 text-xs sm:text-sm">
            <Car className="hidden h-4 w-4 sm:block" />
            Transportation
          </TabsTrigger>
          <TabsTrigger value="dining-activities" className="gap-1.5 text-xs sm:text-sm">
            <UtensilsCrossed className="hidden h-4 w-4 sm:block" />
            Dining & Activities
          </TabsTrigger>
        </TabsList>

        <TabsContent value="getting-there">
          <GettingThereContent guide={guide} />
        </TabsContent>

        <TabsContent value="accommodations">
          <AccommodationsContent guide={guide} />
        </TabsContent>

        <TabsContent value="transportation">
          <TransportationContent guide={guide} />
        </TabsContent>

        <TabsContent value="dining-activities">
          <DiningActivitiesContent guide={guide} />
        </TabsContent>
      </Tabs>

      {/* Concierge CTA */}
      <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-6">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">
              Need Help Planning Your Visit to {guide.name.split(',')[0]}?
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Our concierge team specializes in creating seamless travel
              experiences for Foundation Health patients.
            </p>
          </div>
          <Button asChild className="flex-shrink-0">
            <Link href="/patient/travel/concierge">
              <ConciergeBell className="mr-2 h-4 w-4" />
              Request Concierge
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
