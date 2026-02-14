// ============================================
// Foundation Health — Travel Guide Content
// Static data for each destination location
// ============================================

// ============================================
// Types
// ============================================

export interface AirportInfo {
  name: string
  code: string
  distance: string
  driveTime: string
}

export interface AccommodationOption {
  name: string
  type: 'luxury-resort' | 'boutique-hotel' | 'extended-stay' | 'vacation-rental'
  description: string
  priceRange: string
  highlight: string
}

export interface TransportOption {
  name: string
  type: 'rental' | 'private-car' | 'shuttle' | 'rideshare'
  description: string
}

export interface DiningOption {
  name: string
  cuisine: string
  description: string
  priceRange: string
}

export interface ActivityOption {
  name: string
  description: string
  recoveryFriendly: boolean
}

export interface LocationGuide {
  slug: string
  name: string
  tagline: string
  description: string
  heroImage: string
  elevation: string
  climate: string
  bestTimeToVisit: string

  gettingThere: {
    airports: AirportInfo[]
    privateAviation: string
    drivingNotes: string
  }

  accommodations: AccommodationOption[]
  transportation: TransportOption[]

  dining: DiningOption[]
  activities: ActivityOption[]
}

// ============================================
// Location Guides
// ============================================

export const locationGuides: Record<string, LocationGuide> = {
  moab: {
    slug: 'moab',
    name: 'Moab, Utah',
    tagline: 'Where Red Rock Meets Recovery',
    description:
      'Nestled among the towering sandstone formations of southeastern Utah, our Moab location offers a truly extraordinary healing environment. The vast desert landscape, clean mountain air, and world-renowned natural beauty create the perfect backdrop for focused orthopedic care and mindful recovery.',
    heroImage: '/images/locations/moab-hero.jpg',
    elevation: '4,026 ft',
    climate: 'High desert, 300+ days of sunshine',
    bestTimeToVisit: 'March through May and September through November',

    gettingThere: {
      airports: [
        {
          name: 'Canyonlands Field Airport',
          code: 'CNY',
          distance: '16 miles',
          driveTime: '20 minutes',
        },
        {
          name: 'Salt Lake City International Airport',
          code: 'SLC',
          distance: '236 miles',
          driveTime: '3 hours 45 minutes',
        },
        {
          name: 'Grand Junction Regional Airport',
          code: 'GJT',
          distance: '112 miles',
          driveTime: '1 hour 45 minutes',
        },
      ],
      privateAviation:
        'Canyonlands Field Airport (CNY) accommodates private aircraft and offers FBO services. For larger jets, Grand Junction Regional (GJT) provides full-service private aviation facilities with hangar space. Our concierge team can arrange ground transportation from either location.',
      drivingNotes:
        'The drive from Salt Lake City via I-70 and US-191 is one of the most scenic in the American West, passing through dramatic canyon country. Consider making the journey part of your experience with a stop at Green River for a meal. From Grand Junction, the drive along I-70 through the Colorado Plateau offers stunning mesa views.',
    },

    accommodations: [
      {
        name: 'Sorrel River Ranch Resort & Spa',
        type: 'luxury-resort',
        description:
          'A 240-acre luxury ranch resort along the Colorado River offering spa treatments, horseback riding, and fine dining in a breathtaking red rock setting.',
        priceRange: '$400-$900/night',
        highlight: 'Full-service spa with recovery-focused treatments',
      },
      {
        name: 'Red Cliffs Lodge',
        type: 'luxury-resort',
        description:
          'Situated on the banks of the Colorado River with views of towering red cliffs, featuring spacious suites, a winery, and on-site museum.',
        priceRange: '$250-$550/night',
        highlight: 'River-view suites with private patios',
      },
      {
        name: 'Hoodoo Moab',
        type: 'boutique-hotel',
        description:
          'A curated collection of contemporary suites in downtown Moab with rooftop pool, artisan dining, and gallery-quality interiors.',
        priceRange: '$300-$600/night',
        highlight: 'Walking distance to town amenities',
      },
      {
        name: 'Castle Valley Luxury Rentals',
        type: 'vacation-rental',
        description:
          'Private homes and estates in the stunning Castle Valley, offering seclusion, panoramic views, and fully equipped kitchens ideal for extended recovery stays.',
        priceRange: '$350-$1,200/night',
        highlight: 'Complete privacy for focused recovery',
      },
    ],

    transportation: [
      {
        name: 'Enterprise Rent-A-Car Moab',
        type: 'rental',
        description:
          'Full-size SUVs and luxury vehicles available at Canyonlands Field Airport and downtown Moab. 4WD recommended for exploring the region.',
      },
      {
        name: 'Moab Luxury Transport',
        type: 'private-car',
        description:
          'Private sedan and SUV service for airport transfers, medical appointments, and scenic excursions. Drivers familiar with all Foundation Health locations.',
      },
      {
        name: 'Canyonlands Shuttle',
        type: 'shuttle',
        description:
          'Scheduled shuttle service connecting Salt Lake City airport to Moab with comfortable seating and luggage accommodation.',
      },
    ],

    dining: [
      {
        name: 'Desert Bistro',
        cuisine: 'Contemporary American',
        description:
          'An intimate fine-dining experience in a restored home, featuring locally inspired cuisine with seasonal menus and an exceptional wine list.',
        priceRange: '$$$',
      },
      {
        name: 'Arches Thai',
        cuisine: 'Thai',
        description:
          'Fresh, flavorful Thai cuisine with anti-inflammatory options perfect for recovery. Known for their curry dishes and welcoming atmosphere.',
        priceRange: '$$',
      },
      {
        name: 'Quesada',
        cuisine: 'Mexican-Southwest',
        description:
          'Farm-to-table Southwestern fare with house-made salsas and locally sourced ingredients in a relaxed, refined setting.',
        priceRange: '$$',
      },
    ],

    activities: [
      {
        name: 'Colorado River Sunset Float',
        description:
          'A gentle, guided float along the Colorado River at golden hour. Low-impact and deeply relaxing, perfect during recovery.',
        recoveryFriendly: true,
      },
      {
        name: 'Arches National Park Scenic Drive',
        description:
          'Experience the majesty of Delicate Arch and the Windows Section from the comfort of your vehicle with short, accessible viewpoint stops.',
        recoveryFriendly: true,
      },
      {
        name: 'Dead Horse Point State Park',
        description:
          'One of the most photographed vistas in the West. Paved overlooks provide stunning canyon views without strenuous walking.',
        recoveryFriendly: true,
      },
      {
        name: 'Moab Art Galleries',
        description:
          'Explore the vibrant local art scene, featuring galleries showcasing desert-inspired photography, painting, and sculpture.',
        recoveryFriendly: true,
      },
      {
        name: 'Canyonlands Scenic Flight',
        description:
          'A bird\'s-eye view of the Canyonlands, Arches, and the La Sal Mountains from a small aircraft tour.',
        recoveryFriendly: true,
      },
    ],
  },

  'park-city': {
    slug: 'park-city',
    name: 'Park City, Utah',
    tagline: 'Elevated Care in the Mountains',
    description:
      'Our Park City location places world-class orthopedic expertise in one of North America\'s most celebrated mountain towns. Just 35 minutes from Salt Lake City International Airport, Park City offers a seamless blend of convenience and alpine luxury that transforms your healthcare experience into something truly exceptional.',
    heroImage: '/images/locations/park-city-hero.jpg',
    elevation: '6,902 ft',
    climate: 'Mountain, four distinct seasons',
    bestTimeToVisit: 'Year-round destination',

    gettingThere: {
      airports: [
        {
          name: 'Salt Lake City International Airport',
          code: 'SLC',
          distance: '32 miles',
          driveTime: '35 minutes',
        },
        {
          name: 'Heber Valley Airport',
          code: 'HCR',
          distance: '22 miles',
          driveTime: '30 minutes',
        },
      ],
      privateAviation:
        'Heber Valley Airport (HCR) is the preferred facility for private aviation, offering uncongested approaches and convenient proximity to Park City. Salt Lake City also offers excellent private aviation terminals through Atlantic Aviation and TAC Air. Our concierge arranges seamless ground transfers from either facility.',
      drivingNotes:
        'The drive from SLC via I-80 East through Parley\'s Canyon is quick and scenic, climbing into the Wasatch Mountains. In winter, the road is well-maintained but we recommend vehicles with snow capability. Consider a private car service for a stress-free arrival.',
    },

    accommodations: [
      {
        name: 'Montage Deer Valley',
        type: 'luxury-resort',
        description:
          'An iconic five-star resort nestled at the base of Deer Valley, offering spa, fine dining, ski-in/ski-out access, and unparalleled mountain luxury.',
        priceRange: '$600-$2,500/night',
        highlight: 'Spa Montage with recovery and rehabilitation treatments',
      },
      {
        name: 'Waldorf Astoria Park City',
        type: 'luxury-resort',
        description:
          'Refined luxury with ski-in/ski-out access, a full-service spa, and elegant suites with mountain views and fireplace-warmed living areas.',
        priceRange: '$500-$1,800/night',
        highlight: 'Heated outdoor pools and private cabanas',
      },
      {
        name: 'Washington School House Hotel',
        type: 'boutique-hotel',
        description:
          'An intimate 12-room boutique hotel in a beautifully restored 1889 schoolhouse on Historic Main Street, offering personalized service and curated experiences.',
        priceRange: '$400-$1,200/night',
        highlight: 'Walking distance to Main Street galleries and dining',
      },
      {
        name: 'Deer Valley Luxury Residences',
        type: 'extended-stay',
        description:
          'Fully appointed private residences in the Deer Valley area with chef\'s kitchens, mountain views, and concierge services for extended recovery stays.',
        priceRange: '$800-$3,000/night',
        highlight: 'Ideal for multi-week recovery with full amenities',
      },
    ],

    transportation: [
      {
        name: 'Park City Transit',
        type: 'shuttle',
        description:
          'Free citywide bus service connecting all major resort areas, Main Street, and medical facilities. Runs frequently throughout the day.',
      },
      {
        name: 'Alta Private Car Service',
        type: 'private-car',
        description:
          'Premium black car service specializing in SLC airport transfers and Park City transportation. Luxury sedans and SUVs with professional chauffeurs.',
      },
      {
        name: 'Enterprise Park City',
        type: 'rental',
        description:
          'Full fleet of luxury and AWD vehicles available for pickup in Park City or at SLC airport. Winter tire packages available seasonally.',
      },
      {
        name: 'Canyon Transportation',
        type: 'shuttle',
        description:
          'Scheduled shared and private shuttle service between SLC International Airport and Park City resorts.',
      },
    ],

    dining: [
      {
        name: 'Riverhorse on Main',
        cuisine: 'New American',
        description:
          'Park City\'s premier fine dining establishment on Historic Main Street, known for innovative seasonal cuisine and an award-winning wine program.',
        priceRange: '$$$$',
      },
      {
        name: 'Handle',
        cuisine: 'Modern American',
        description:
          'Creative small plates and craft cocktails in a stylish setting. Features clean, nutrient-dense options excellent for recovery nutrition.',
        priceRange: '$$$',
      },
      {
        name: 'Hearth and Hill',
        cuisine: 'American Comfort',
        description:
          'Elevated comfort food with a focus on wholesome, locally sourced ingredients. A warm, inviting atmosphere perfect for relaxed dining.',
        priceRange: '$$',
      },
    ],

    activities: [
      {
        name: 'Historic Main Street',
        description:
          'Browse art galleries, boutiques, and museums along Park City\'s charming Main Street. Fully accessible with gentle slopes and frequent benches.',
        recoveryFriendly: true,
      },
      {
        name: 'Alpine Scenic Gondola Ride',
        description:
          'Take the Town Lift or Deer Valley gondola for effortless access to stunning mountain panoramas without any physical exertion.',
        recoveryFriendly: true,
      },
      {
        name: 'Park City Museum',
        description:
          'Explore the fascinating history of Park City\'s silver mining heritage and Olympic legacy in this well-curated, accessible museum.',
        recoveryFriendly: true,
      },
      {
        name: 'Spa Treatments at Deer Valley',
        description:
          'Indulge in recovery-focused spa treatments including cryotherapy, compression therapy, and gentle massage designed to complement your care plan.',
        recoveryFriendly: true,
      },
      {
        name: 'Sundance Film Festival Venues',
        description:
          'Visit the iconic Egyptian Theatre and other cultural venues that host events year-round beyond the famous January festival.',
        recoveryFriendly: true,
      },
    ],
  },

  'powder-mountain': {
    slug: 'powder-mountain',
    name: 'Powder Mountain, Utah',
    tagline: 'Exclusive Altitude, Extraordinary Care',
    description:
      'Powder Mountain represents the pinnacle of our destination healthcare philosophy. This exclusive mountain community, perched atop 8,900 feet in the northern Wasatch Range, offers an unmatched combination of privacy, natural beauty, and intentional living that creates an ideal environment for healing and renewal.',
    heroImage: '/images/locations/powder-mountain-hero.jpg',
    elevation: '8,900 ft',
    climate: 'Alpine, renowned for light powder snow',
    bestTimeToVisit: 'June through October for recovery stays',

    gettingThere: {
      airports: [
        {
          name: 'Salt Lake City International Airport',
          code: 'SLC',
          distance: '75 miles',
          driveTime: '1 hour 30 minutes',
        },
        {
          name: 'Ogden-Hinckley Airport',
          code: 'OGD',
          distance: '35 miles',
          driveTime: '45 minutes',
        },
      ],
      privateAviation:
        'Ogden-Hinckley Airport (OGD) provides the most convenient access for private aircraft, with a 30-minute drive to Summit Powder Mountain. The airport accommodates a range of aircraft and offers FBO services. For larger aircraft, SLC International offers premium private terminals.',
      drivingNotes:
        'From SLC, travel north on I-15 to Ogden, then head east through scenic Ogden Valley via Highway 158 to Powder Mountain Road. The final ascent is a winding mountain road with spectacular views. During winter months, four-wheel drive is essential and chains may be required. Our concierge team arranges transportation for all guests.',
    },

    accommodations: [
      {
        name: 'Summit Powder Mountain',
        type: 'luxury-resort',
        description:
          'The centerpiece of this intentional mountain community, offering architecturally stunning residences, a world-class lodge, and curated wellness programming.',
        priceRange: '$500-$2,000/night',
        highlight: 'Members-only community with unparalleled privacy',
      },
      {
        name: 'Powder Mountain Lodge',
        type: 'boutique-hotel',
        description:
          'Intimate mountain lodge offering comfortable rooms with sweeping valley views, communal gathering spaces, and farm-to-table dining.',
        priceRange: '$250-$600/night',
        highlight: 'Authentic mountain lodge experience',
      },
      {
        name: 'Eden Valley Retreats',
        type: 'vacation-rental',
        description:
          'Luxury cabins and homes in the surrounding Eden Valley, minutes from Powder Mountain, with hot tubs, mountain views, and full kitchens.',
        priceRange: '$300-$900/night',
        highlight: 'Mountain serenity with easy access to amenities',
      },
    ],

    transportation: [
      {
        name: 'Powder Mountain Shuttle',
        type: 'shuttle',
        description:
          'Complimentary shuttle service for Foundation Health patients between Summit Lodge and the clinic. Seasonal schedules available.',
      },
      {
        name: 'Ogden Valley Private Car',
        type: 'private-car',
        description:
          'Luxury SUV service with experienced mountain drivers providing airport transfers and local transportation throughout the Ogden Valley region.',
      },
      {
        name: 'Avis Ogden',
        type: 'rental',
        description:
          'AWD and 4WD vehicles available at Ogden-Hinckley Airport. Mountain-ready vehicles with snow packages available year-round.',
      },
    ],

    dining: [
      {
        name: 'Summit Lodge Dining Room',
        cuisine: 'Mountain Contemporary',
        description:
          'An elevated dining experience featuring seasonal menus crafted from local ingredients, served in a stunning mountain setting with panoramic views.',
        priceRange: '$$$$',
      },
      {
        name: 'Carlos & Harley\'s',
        cuisine: 'Mexican-American',
        description:
          'A beloved Eden Valley institution serving hearty, comforting fare in a casual mountain atmosphere. A local favorite for over two decades.',
        priceRange: '$$',
      },
      {
        name: 'Eats of Eden',
        cuisine: 'Farm-to-Table',
        description:
          'Fresh, health-conscious cuisine in the heart of Eden Valley with a focus on anti-inflammatory ingredients and recovery-supportive nutrition.',
        priceRange: '$$',
      },
    ],

    activities: [
      {
        name: 'Sunrise Meditation at Summit',
        description:
          'Guided morning meditation sessions above the clouds at the Summit Lodge, designed to support mental clarity and emotional healing.',
        recoveryFriendly: true,
      },
      {
        name: 'Ogden Valley Scenic Drive',
        description:
          'A leisurely drive through the pastoral Ogden Valley, past historic farmsteads and Pineview Reservoir, with stunning mountain backdrops.',
        recoveryFriendly: true,
      },
      {
        name: 'Nordic Valley Golf',
        description:
          'A gentle, scenic nine-hole course in the valley below. Cart-accessible and perfect for light activity during recovery.',
        recoveryFriendly: true,
      },
      {
        name: 'Snowbasin Lodge',
        description:
          'Visit the elegant Snowbasin Resort lodge, a 2002 Winter Olympics venue, for dining and scenic chairlift rides in summer.',
        recoveryFriendly: true,
      },
    ],
  },

  camas: {
    slug: 'camas',
    name: 'Camas, Washington',
    tagline: 'Pacific Northwest Healing',
    description:
      'Our Camas location brings Foundation Health\'s orthopedic excellence to the lush Pacific Northwest. Just 30 minutes from Portland International Airport, this charming town along the Columbia River Gorge offers a temperate climate, stunning natural surroundings, and a vibrant community that makes every healthcare journey feel like a curated retreat.',
    heroImage: '/images/locations/camas-hero.jpg',
    elevation: '60 ft',
    climate: 'Maritime, mild temperatures year-round',
    bestTimeToVisit: 'May through October for the driest weather',

    gettingThere: {
      airports: [
        {
          name: 'Portland International Airport',
          code: 'PDX',
          distance: '23 miles',
          driveTime: '30 minutes',
        },
      ],
      privateAviation:
        'Portland International Airport (PDX) offers full-service private aviation through Atlantic Aviation and Flightcraft. The Grove Field Airport (0S9) in Camas provides a closer option for smaller aircraft. Our concierge team coordinates ground transportation from either facility.',
      drivingNotes:
        'From PDX, take I-205 South to Highway 14 East, following the Columbia River through a corridor of dramatic basalt cliffs and evergreen forests. The drive is short, scenic, and stress-free. From downtown Portland, the drive is approximately 25 minutes via I-84 East.',
    },

    accommodations: [
      {
        name: 'The Camas Hotel',
        type: 'boutique-hotel',
        description:
          'A beautifully restored boutique hotel in the heart of downtown Camas, blending historic charm with modern luxury, steps from galleries, dining, and the Foundation Health clinic.',
        priceRange: '$200-$450/night',
        highlight: 'Walking distance to downtown Camas and the clinic',
      },
      {
        name: 'Skamania Lodge',
        type: 'luxury-resort',
        description:
          'A grand Pacific Northwest lodge set on 175 acres in the Columbia River Gorge, offering a championship golf course, full spa, and forest-view dining.',
        priceRange: '$300-$700/night',
        highlight: 'Full-service spa and Gorge views',
      },
      {
        name: 'Columbia Gorge Luxury Rentals',
        type: 'vacation-rental',
        description:
          'Private homes and riverfront properties along the Columbia Gorge, offering tranquility, chef\'s kitchens, and stunning water views for extended stays.',
        priceRange: '$250-$800/night',
        highlight: 'Privacy and natural beauty for recovery',
      },
      {
        name: 'The Heathman Lodge',
        type: 'boutique-hotel',
        description:
          'Timber-frame lodge inspired by the great national park lodges, featuring Northwest art, stone fireplaces, and a warm, inviting atmosphere.',
        priceRange: '$180-$350/night',
        highlight: 'Authentic Pacific Northwest lodge ambiance',
      },
    ],

    transportation: [
      {
        name: 'PDX Premium Car Service',
        type: 'private-car',
        description:
          'Black car and luxury SUV service providing door-to-door transfers between PDX airport, your accommodations, and the Foundation Health clinic.',
      },
      {
        name: 'Enterprise Portland/Vancouver',
        type: 'rental',
        description:
          'Convenient rental locations at PDX airport and in Vancouver, WA. Full range of vehicles including luxury sedans and comfortable SUVs.',
      },
      {
        name: 'C-TRAN Transit',
        type: 'shuttle',
        description:
          'Local public transit connecting Camas to Vancouver and the broader Portland metro area. The Vine express route offers quick connections.',
      },
      {
        name: 'Lyft & Uber',
        type: 'rideshare',
        description:
          'Readily available throughout the Portland metro area and Camas. A convenient option for on-demand transportation to appointments.',
      },
    ],

    dining: [
      {
        name: 'Birch & Barrel',
        cuisine: 'Pacific Northwest',
        description:
          'Seasonal Pacific Northwest cuisine in an elegant yet approachable setting, featuring local seafood, foraged ingredients, and an exceptional wine and cocktail program.',
        priceRange: '$$$',
      },
      {
        name: 'Nuestra Mesa',
        cuisine: 'Latin American',
        description:
          'Vibrant, fresh Latin American flavors in the heart of downtown Camas, with an emphasis on clean ingredients and bold, healthful preparations.',
        priceRange: '$$',
      },
      {
        name: 'Mill City Brew Werks',
        cuisine: 'American Gastropub',
        description:
          'Craft beverages and elevated pub fare in a beautifully converted mill building. Recovery-friendly options including house-made kombucha and fresh juices.',
        priceRange: '$$',
      },
    ],

    activities: [
      {
        name: 'Lacamas Lake Park',
        description:
          'Gentle, paved walking trails around a serene lake with waterfalls, old-growth forest, and abundant wildlife. Multiple accessible viewpoints.',
        recoveryFriendly: true,
      },
      {
        name: 'Columbia River Gorge Scenic Drive',
        description:
          'The Historic Columbia River Highway offers one of America\'s most spectacular drives, with waterfalls, wildflower viewpoints, and Crown Point Vista House.',
        recoveryFriendly: true,
      },
      {
        name: 'Downtown Camas',
        description:
          'Explore the charming downtown district with its independent bookshops, artisan boutiques, art galleries, and cozy cafes. Fully walkable and accessible.',
        recoveryFriendly: true,
      },
      {
        name: 'Pendleton Woolen Mills',
        description:
          'Tour the historic Pendleton blanket factory in nearby Washougal and browse their retail store for iconic Pacific Northwest textiles.',
        recoveryFriendly: true,
      },
      {
        name: 'Portland Day Trip',
        description:
          'Just 30 minutes away, Portland offers world-class dining, Powell\'s Books, the Japanese Garden, and the vibrant Pearl District.',
        recoveryFriendly: true,
      },
    ],
  },
}

// ============================================
// Helper — get all location slugs
// ============================================

export const locationSlugs = Object.keys(locationGuides)

// ============================================
// Helper — get location summary cards
// ============================================

export interface LocationSummary {
  slug: string
  name: string
  tagline: string
  description: string
  elevation: string
  climate: string
}

export function getLocationSummaries(): LocationSummary[] {
  return Object.values(locationGuides).map((guide) => ({
    slug: guide.slug,
    name: guide.name,
    tagline: guide.tagline,
    description: guide.description,
    elevation: guide.elevation,
    climate: guide.climate,
  }))
}

// ============================================
// Helper — get guide by slug
// ============================================

export function getLocationGuide(slug: string): LocationGuide | null {
  return locationGuides[slug] ?? null
}
