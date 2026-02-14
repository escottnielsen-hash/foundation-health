// ============================================
// Revenue Analytics Types
// ============================================

export interface RevenueOverview {
  totalRevenueCents: number
  membershipRevenueCents: number
  surgicalRevenueCents: number
  diagnosticRevenueCents: number
  averagePerPatientCents: number
  revenueGrowthPct: number // vs previous period
  patientCount: number
}

export interface LocationRevenue {
  locationId: string
  locationName: string
  locationType: string
  totalRevenueCents: number
  claimCount: number
  averageCollectionRate: number // percentage
  targetRevenueCents: number // from business plan
  percentOfTarget: number
}

export interface RevenueTimePoint {
  period: string // "2025-01" or "2025-W05"
  totalRevenueCents: number
  membershipRevenueCents: number
  surgicalRevenueCents: number
  claimsPaidCents: number
}

export interface ClaimsAnalytics {
  totalSubmitted: number
  totalPaid: number
  totalDenied: number
  totalInAppeal: number
  totalInIdr: number
  averageCollectionRate: number
  averageDaysToPayment: number
  denialRate: number
  appealSuccessRate: number
  idrWinRate: number
  totalBilledCents: number
  totalCollectedCents: number
  totalPendingCents: number
}

export interface PayerPerformance {
  payerName: string
  claimCount: number
  averageCollectionRate: number
  averageDaysToPayment: number
  denialRate: number
  totalBilledCents: number
  totalPaidCents: number
}

export interface ArAgingBucket {
  bucket: string // "0-30", "31-60", "61-90", "90+"
  claimCount: number
  totalAmountCents: number
}

export interface MembershipRevenueBreakdown {
  tierName: string
  displayName: string
  activeMembers: number
  monthlyRevenueCents: number
  totalRevenueCents: number
  percentOfTotal: number
}

export interface CollectionRatePoint {
  period: string
  collectionRate: number
  claimCount: number
}

// ============================================
// Date range helper for revenue queries
// ============================================

export interface RevenueDateRange {
  from: string // ISO date string
  to: string   // ISO date string
}
