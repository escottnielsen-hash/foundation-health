export const MEMBERSHIP_TIERS = {
  platinum: {
    name: 'Platinum',
    description: 'Unlimited access to all Foundation Health services',
    price: {
      monthly: null, // Annual only
      annual: 100000,
    },
    features: [
      'Unlimited consultations and appointments',
      'Priority scheduling - same day availability',
      '24/7 direct physician access',
      'All wellness services included',
      'Complimentary executive health assessment',
      'Dedicated concierge coordinator',
      'Resort recovery suite access',
      'Telemedicine unlimited',
    ],
    highlight: true,
  },
  gold: {
    name: 'Gold',
    description: 'Priority access with comprehensive wellness',
    price: {
      monthly: 4500,
      annual: 50000,
    },
    features: [
      'Priority access - same week appointments',
      'Quarterly executive health assessments',
      'Wellness program included',
      'Telemedicine included',
      '20% discount on regenerative services',
      'Post-surgical recovery coordination',
    ],
    highlight: false,
  },
  silver: {
    name: 'Silver',
    description: 'Enhanced healthcare access',
    price: {
      monthly: 2200,
      annual: 25000,
    },
    features: [
      'Enhanced appointment access',
      'Quarterly wellness assessments',
      'Telemedicine included',
      '10% discount on cash-pay services',
      'Health record management',
    ],
    highlight: false,
  },
} as const

export type MembershipTierKey = keyof typeof MEMBERSHIP_TIERS
