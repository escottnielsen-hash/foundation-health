'use server'

import { createClient } from '@/lib/supabase/server'
import type {
  RevenueOverview,
  LocationRevenue,
  RevenueTimePoint,
  ClaimsAnalytics,
  PayerPerformance,
  ArAgingBucket,
  MembershipRevenueBreakdown,
  CollectionRatePoint,
  RevenueDateRange,
} from '@/types/revenue'

// ============================================
// Helper: default date range (last 12 months)
// ============================================

function getDefaultDateRange(): RevenueDateRange {
  const to = new Date()
  const from = new Date()
  from.setMonth(from.getMonth() - 12)
  return {
    from: from.toISOString().split('T')[0],
    to: to.toISOString().split('T')[0],
  }
}

// ============================================
// Helper: previous period date range
// ============================================

function getPreviousPeriodRange(dateRange: RevenueDateRange): RevenueDateRange {
  const fromDate = new Date(dateRange.from)
  const toDate = new Date(dateRange.to)
  const durationMs = toDate.getTime() - fromDate.getTime()
  const prevTo = new Date(fromDate.getTime() - 1)
  const prevFrom = new Date(prevTo.getTime() - durationMs)
  return {
    from: prevFrom.toISOString().split('T')[0],
    to: prevTo.toISOString().split('T')[0],
  }
}

// ============================================
// Target revenue per location (from biz plan)
// $2.5M-$5M per location annually
// ============================================

const TARGET_REVENUE_CENTS_PER_LOCATION: Record<string, number> = {
  hub: 500_000_00, // $5M
  spoke: 250_000_00, // $2.5M
  mobile: 100_000_00, // $1M
  virtual: 50_000_00, // $500K
}

// ============================================
// getRevenueOverview
// ============================================

export async function getRevenueOverview(
  dateRange?: RevenueDateRange
): Promise<RevenueOverview> {
  const supabase = await createClient()
  const range = dateRange ?? getDefaultDateRange()

  // Fetch invoices in range that are paid or partially paid
  const { data: invoices } = await supabase
    .from('invoices')
    .select('id, total, amount_paid, patient_id, membership_tier_applied')
    .in('status', ['paid', 'partially_paid'])
    .gte('created_at', range.from)
    .lte('created_at', range.to)

  const allInvoices = invoices ?? []

  // Total revenue from invoices
  const totalRevenueCents = allInvoices.reduce(
    (sum, inv) => sum + Math.round(Number(inv.amount_paid ?? 0) * 100),
    0
  )

  // Membership revenue from patient_memberships payments
  const { data: memberships } = await supabase
    .from('patient_memberships')
    .select('id, tier_id, status')
    .eq('status', 'active')

  const { data: membershipTiers } = await supabase
    .from('membership_tiers')
    .select('id, monthly_price, name')

  const tierPriceMap = new Map<string, number>()
  if (membershipTiers) {
    for (const tier of membershipTiers) {
      tierPriceMap.set(tier.id, Math.round(Number(tier.monthly_price ?? 0) * 100))
    }
  }

  // Calculate months in range for membership MRR extrapolation
  const fromDate = new Date(range.from)
  const toDate = new Date(range.to)
  const monthsInRange = Math.max(
    1,
    (toDate.getFullYear() - fromDate.getFullYear()) * 12 +
      (toDate.getMonth() - fromDate.getMonth())
  )

  let membershipRevenueCents = 0
  if (memberships) {
    for (const mem of memberships) {
      const monthlyPrice = tierPriceMap.get(mem.tier_id) ?? 0
      membershipRevenueCents += monthlyPrice * monthsInRange
    }
  }

  // Surgical revenue: invoices with line items containing surgical CPT codes
  // Approximate by looking at invoices with higher totals (> $1000)
  const surgicalRevenueCents = allInvoices
    .filter((inv) => Number(inv.total ?? 0) > 1000)
    .reduce(
      (sum, inv) => sum + Math.round(Number(inv.amount_paid ?? 0) * 100),
      0
    )

  // Diagnostic revenue: remaining non-membership, non-surgical
  const diagnosticRevenueCents = Math.max(
    0,
    totalRevenueCents - membershipRevenueCents - surgicalRevenueCents
  )

  // Unique patients
  const patientIds = new Set(allInvoices.map((inv) => inv.patient_id))
  const patientCount = patientIds.size

  // Average per patient
  const averagePerPatientCents =
    patientCount > 0 ? Math.round(totalRevenueCents / patientCount) : 0

  // Growth vs previous period
  const prevRange = getPreviousPeriodRange(range)
  const { data: prevInvoices } = await supabase
    .from('invoices')
    .select('amount_paid')
    .in('status', ['paid', 'partially_paid'])
    .gte('created_at', prevRange.from)
    .lte('created_at', prevRange.to)

  const prevRevenueCents = (prevInvoices ?? []).reduce(
    (sum, inv) => sum + Math.round(Number(inv.amount_paid ?? 0) * 100),
    0
  )

  const revenueGrowthPct =
    prevRevenueCents > 0
      ? Math.round(
          ((totalRevenueCents - prevRevenueCents) / prevRevenueCents) * 100 * 10
        ) / 10
      : 0

  return {
    totalRevenueCents,
    membershipRevenueCents,
    surgicalRevenueCents,
    diagnosticRevenueCents,
    averagePerPatientCents,
    revenueGrowthPct,
    patientCount,
  }
}

// ============================================
// getRevenueByLocation
// ============================================

export async function getRevenueByLocation(
  dateRange?: RevenueDateRange
): Promise<LocationRevenue[]> {
  const supabase = await createClient()
  const range = dateRange ?? getDefaultDateRange()

  // All active locations
  const { data: locations } = await supabase
    .from('locations')
    .select('id, name, location_type')
    .eq('is_active', true)

  if (!locations || locations.length === 0) return []

  // Encounters in range with location_id
  const { data: encounters } = await supabase
    .from('encounters')
    .select('id, location_id')
    .gte('created_at', range.from)
    .lte('created_at', range.to)

  const encounterLocationMap = new Map<string, string>()
  if (encounters) {
    for (const enc of encounters) {
      if (enc.location_id) {
        encounterLocationMap.set(enc.id, enc.location_id)
      }
    }
  }

  const encounterIds = encounters?.map((e) => e.id) ?? []

  // Invoices for those encounters
  let invoices: Array<{
    encounter_id: string | null
    total: number
    amount_paid: number
  }> = []

  if (encounterIds.length > 0) {
    const { data } = await supabase
      .from('invoices')
      .select('encounter_id, total, amount_paid')
      .in('encounter_id', encounterIds)
      .in('status', ['paid', 'partially_paid'])

    invoices = data ?? []
  }

  // Claims for those encounters
  let claims: Array<{
    encounter_id: string | null
    billed_amount: number
    paid_amount: number | null
    status: string
  }> = []

  if (encounterIds.length > 0) {
    const { data } = await supabase
      .from('insurance_claims')
      .select('encounter_id, billed_amount, paid_amount, status')
      .in('encounter_id', encounterIds)

    claims = data ?? []
  }

  // Aggregate per location
  const locationRevenueMap = new Map<
    string,
    { revenue: number; claimCount: number; billed: number; collected: number }
  >()

  for (const loc of locations) {
    locationRevenueMap.set(loc.id, {
      revenue: 0,
      claimCount: 0,
      billed: 0,
      collected: 0,
    })
  }

  for (const inv of invoices) {
    if (inv.encounter_id) {
      const locId = encounterLocationMap.get(inv.encounter_id)
      if (locId && locationRevenueMap.has(locId)) {
        const entry = locationRevenueMap.get(locId)!
        entry.revenue += Math.round(Number(inv.amount_paid ?? 0) * 100)
      }
    }
  }

  for (const claim of claims) {
    if (claim.encounter_id) {
      const locId = encounterLocationMap.get(claim.encounter_id)
      if (locId && locationRevenueMap.has(locId)) {
        const entry = locationRevenueMap.get(locId)!
        entry.claimCount += 1
        entry.billed += Math.round(Number(claim.billed_amount ?? 0) * 100)
        entry.collected += Math.round(Number(claim.paid_amount ?? 0) * 100)
      }
    }
  }

  return locations.map((loc) => {
    const entry = locationRevenueMap.get(loc.id)!
    const locType = (loc.location_type ?? 'spoke') as string
    const targetRevenueCents =
      TARGET_REVENUE_CENTS_PER_LOCATION[locType] ??
      TARGET_REVENUE_CENTS_PER_LOCATION['spoke']

    const averageCollectionRate =
      entry.billed > 0
        ? Math.round((entry.collected / entry.billed) * 100 * 10) / 10
        : 0

    const percentOfTarget =
      targetRevenueCents > 0
        ? Math.round((entry.revenue / targetRevenueCents) * 100 * 10) / 10
        : 0

    return {
      locationId: loc.id,
      locationName: loc.name,
      locationType: locType,
      totalRevenueCents: entry.revenue,
      claimCount: entry.claimCount,
      averageCollectionRate,
      targetRevenueCents,
      percentOfTarget,
    }
  })
}

// ============================================
// getRevenueTimeSeries
// ============================================

export async function getRevenueTimeSeries(
  interval: 'monthly' | 'weekly',
  dateRange?: RevenueDateRange
): Promise<RevenueTimePoint[]> {
  const supabase = await createClient()
  const range = dateRange ?? getDefaultDateRange()

  // Fetch paid invoices in range
  const { data: invoices } = await supabase
    .from('invoices')
    .select(
      'id, total, amount_paid, membership_tier_applied, created_at'
    )
    .in('status', ['paid', 'partially_paid'])
    .gte('created_at', range.from)
    .lte('created_at', range.to)
    .order('created_at', { ascending: true })

  // Fetch paid claims in range
  const { data: claimsPaid } = await supabase
    .from('insurance_claims')
    .select('paid_amount, response_received_at, created_at')
    .eq('status', 'paid')
    .gte('created_at', range.from)
    .lte('created_at', range.to)

  // Build period buckets
  const periodMap = new Map<
    string,
    {
      total: number
      membership: number
      surgical: number
      claims: number
    }
  >()

  function getPeriodKey(dateStr: string): string {
    const d = new Date(dateStr)
    if (interval === 'monthly') {
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      return `${year}-${month}`
    }
    // Weekly — ISO week
    const yearStart = new Date(d.getFullYear(), 0, 1)
    const dayOfYear = Math.floor(
      (d.getTime() - yearStart.getTime()) / 86_400_000
    )
    const weekNum = Math.ceil((dayOfYear + yearStart.getDay() + 1) / 7)
    return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`
  }

  // Generate all period keys in range
  const current = new Date(range.from)
  const end = new Date(range.to)
  while (current <= end) {
    const key = getPeriodKey(current.toISOString())
    if (!periodMap.has(key)) {
      periodMap.set(key, { total: 0, membership: 0, surgical: 0, claims: 0 })
    }
    if (interval === 'monthly') {
      current.setMonth(current.getMonth() + 1)
    } else {
      current.setDate(current.getDate() + 7)
    }
  }

  // Populate from invoices
  if (invoices) {
    for (const inv of invoices) {
      const key = getPeriodKey(inv.created_at)
      if (!periodMap.has(key)) {
        periodMap.set(key, {
          total: 0,
          membership: 0,
          surgical: 0,
          claims: 0,
        })
      }
      const entry = periodMap.get(key)!
      const amountCents = Math.round(Number(inv.amount_paid ?? 0) * 100)
      entry.total += amountCents

      if (inv.membership_tier_applied) {
        entry.membership += amountCents
      } else if (Number(inv.total ?? 0) > 1000) {
        entry.surgical += amountCents
      }
    }
  }

  // Populate claims paid
  if (claimsPaid) {
    for (const claim of claimsPaid) {
      const dateForKey = claim.response_received_at ?? claim.created_at
      const key = getPeriodKey(dateForKey)
      if (periodMap.has(key)) {
        const entry = periodMap.get(key)!
        entry.claims += Math.round(Number(claim.paid_amount ?? 0) * 100)
      }
    }
  }

  // Convert to sorted array
  const sortedKeys = Array.from(periodMap.keys()).sort()
  return sortedKeys.map((period) => {
    const entry = periodMap.get(period)!
    return {
      period,
      totalRevenueCents: entry.total,
      membershipRevenueCents: entry.membership,
      surgicalRevenueCents: entry.surgical,
      claimsPaidCents: entry.claims,
    }
  })
}

// ============================================
// getClaimsAnalytics
// ============================================

export async function getClaimsAnalytics(
  dateRange?: RevenueDateRange
): Promise<ClaimsAnalytics> {
  const supabase = await createClient()
  const range = dateRange ?? getDefaultDateRange()

  const { data: claims } = await supabase
    .from('insurance_claims')
    .select(
      'id, status, billed_amount, paid_amount, submitted_at, response_received_at, created_at'
    )
    .gte('created_at', range.from)
    .lte('created_at', range.to)

  const allClaims = claims ?? []

  const totalSubmitted = allClaims.length

  const totalPaid = allClaims.filter((c) =>
    ['paid', 'partially_paid'].includes(c.status)
  ).length

  const totalDenied = allClaims.filter((c) => c.status === 'denied').length

  const totalInAppeal = allClaims.filter((c) => c.status === 'appealed').length

  const totalInIdr = allClaims.filter((c) =>
    ['idr_initiated', 'idr_resolved'].includes(c.status)
  ).length

  const totalBilledCents = allClaims.reduce(
    (sum, c) => sum + Math.round(Number(c.billed_amount ?? 0) * 100),
    0
  )

  const totalCollectedCents = allClaims.reduce(
    (sum, c) => sum + Math.round(Number(c.paid_amount ?? 0) * 100),
    0
  )

  const pendingStatuses = [
    'submitted',
    'acknowledged',
    'pending',
    'in_review',
  ]
  const totalPendingCents = allClaims
    .filter((c) => pendingStatuses.includes(c.status))
    .reduce(
      (sum, c) => sum + Math.round(Number(c.billed_amount ?? 0) * 100),
      0
    )

  const averageCollectionRate =
    totalBilledCents > 0
      ? Math.round((totalCollectedCents / totalBilledCents) * 100 * 10) / 10
      : 0

  // Average days to payment
  let totalDays = 0
  let paidWithDatesCount = 0
  for (const c of allClaims) {
    if (
      ['paid', 'partially_paid'].includes(c.status) &&
      c.submitted_at &&
      c.response_received_at
    ) {
      const submittedDate = new Date(c.submitted_at)
      const paidDate = new Date(c.response_received_at)
      const days = Math.round(
        (paidDate.getTime() - submittedDate.getTime()) / 86_400_000
      )
      if (days >= 0) {
        totalDays += days
        paidWithDatesCount += 1
      }
    }
  }
  const averageDaysToPayment =
    paidWithDatesCount > 0 ? Math.round(totalDays / paidWithDatesCount) : 0

  const denialRate =
    totalSubmitted > 0
      ? Math.round((totalDenied / totalSubmitted) * 100 * 10) / 10
      : 0

  // Appeal success rate: claims that were appealed and then became paid
  // Using IDR resolved with prevailing_party or claims that moved from appealed to paid
  const appealedClaims = allClaims.filter((c) =>
    ['appealed', 'paid', 'partially_paid', 'idr_initiated', 'idr_resolved'].includes(
      c.status
    )
  )
  const appealTotal = totalInAppeal + totalDenied
  const appealSuccessRate =
    appealTotal > 0
      ? Math.round(
          (appealedClaims.filter((c) =>
            ['paid', 'partially_paid'].includes(c.status)
          ).length /
            Math.max(1, appealTotal)) *
            100 *
            10
        ) / 10
      : 0

  // IDR win rate
  const { data: idrCases } = await supabase
    .from('idr_cases')
    .select('id, status, prevailing_party')
    .gte('created_at', range.from)
    .lte('created_at', range.to)

  const allIdr = idrCases ?? []
  const decidedIdr = allIdr.filter((c) =>
    ['decided', 'closed'].includes(c.status)
  )
  const idrWins = decidedIdr.filter(
    (c) => c.prevailing_party === 'provider'
  ).length
  const idrWinRate =
    decidedIdr.length > 0
      ? Math.round((idrWins / decidedIdr.length) * 100 * 10) / 10
      : 0

  return {
    totalSubmitted,
    totalPaid,
    totalDenied,
    totalInAppeal,
    totalInIdr,
    averageCollectionRate,
    averageDaysToPayment,
    denialRate,
    appealSuccessRate,
    idrWinRate,
    totalBilledCents,
    totalCollectedCents,
    totalPendingCents,
  }
}

// ============================================
// getCollectionRateByPayer
// ============================================

export async function getCollectionRateByPayer(
  dateRange?: RevenueDateRange
): Promise<PayerPerformance[]> {
  const supabase = await createClient()
  const range = dateRange ?? getDefaultDateRange()

  // Fetch payers
  const { data: payers } = await supabase
    .from('insurance_payers')
    .select('id, name')
    .eq('is_active', true)

  if (!payers || payers.length === 0) return []

  // Fetch claims in range
  const { data: claims } = await supabase
    .from('insurance_claims')
    .select(
      'payer_id, status, billed_amount, paid_amount, submitted_at, response_received_at'
    )
    .gte('created_at', range.from)
    .lte('created_at', range.to)

  const allClaims = claims ?? []

  // Build payer name map
  const payerNameMap = new Map<string, string>()
  for (const p of payers) {
    payerNameMap.set(p.id, p.name)
  }

  // Aggregate per payer
  const payerMap = new Map<
    string,
    {
      claimCount: number
      billed: number
      paid: number
      denied: number
      totalDays: number
      paidWithDates: number
    }
  >()

  for (const claim of allClaims) {
    if (!claim.payer_id) continue
    if (!payerMap.has(claim.payer_id)) {
      payerMap.set(claim.payer_id, {
        claimCount: 0,
        billed: 0,
        paid: 0,
        denied: 0,
        totalDays: 0,
        paidWithDates: 0,
      })
    }
    const entry = payerMap.get(claim.payer_id)!
    entry.claimCount += 1
    entry.billed += Math.round(Number(claim.billed_amount ?? 0) * 100)
    entry.paid += Math.round(Number(claim.paid_amount ?? 0) * 100)

    if (claim.status === 'denied') {
      entry.denied += 1
    }

    if (
      ['paid', 'partially_paid'].includes(claim.status) &&
      claim.submitted_at &&
      claim.response_received_at
    ) {
      const days = Math.round(
        (new Date(claim.response_received_at).getTime() -
          new Date(claim.submitted_at).getTime()) /
          86_400_000
      )
      if (days >= 0) {
        entry.totalDays += days
        entry.paidWithDates += 1
      }
    }
  }

  const results: PayerPerformance[] = []
  for (const [payerId, entry] of payerMap) {
    const payerName = payerNameMap.get(payerId) ?? 'Unknown Payer'
    results.push({
      payerName,
      claimCount: entry.claimCount,
      averageCollectionRate:
        entry.billed > 0
          ? Math.round((entry.paid / entry.billed) * 100 * 10) / 10
          : 0,
      averageDaysToPayment:
        entry.paidWithDates > 0
          ? Math.round(entry.totalDays / entry.paidWithDates)
          : 0,
      denialRate:
        entry.claimCount > 0
          ? Math.round((entry.denied / entry.claimCount) * 100 * 10) / 10
          : 0,
      totalBilledCents: entry.billed,
      totalPaidCents: entry.paid,
    })
  }

  // Sort by collection rate descending
  results.sort((a, b) => b.averageCollectionRate - a.averageCollectionRate)
  return results
}

// ============================================
// getMembershipRevenue
// ============================================

export async function getMembershipRevenue(
  dateRange?: RevenueDateRange
): Promise<MembershipRevenueBreakdown[]> {
  const supabase = await createClient()
  const range = dateRange ?? getDefaultDateRange()

  // Get membership tiers
  const { data: tiers } = await supabase
    .from('membership_tiers')
    .select('id, name, display_name, monthly_price')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (!tiers || tiers.length === 0) return []

  // Get active memberships
  const { data: memberships } = await supabase
    .from('patient_memberships')
    .select('id, tier_id, status, billing_interval, created_at')
    .eq('status', 'active')

  const activeMemberships = memberships ?? []

  // Calculate months in range
  const fromDate = new Date(range.from)
  const toDate = new Date(range.to)
  const monthsInRange = Math.max(
    1,
    (toDate.getFullYear() - fromDate.getFullYear()) * 12 +
      (toDate.getMonth() - fromDate.getMonth())
  )

  // Build tier data
  const tierCountMap = new Map<string, number>()
  for (const mem of activeMemberships) {
    tierCountMap.set(mem.tier_id, (tierCountMap.get(mem.tier_id) ?? 0) + 1)
  }

  let totalMembershipRevenue = 0
  const breakdowns: MembershipRevenueBreakdown[] = tiers.map((tier) => {
    const activeMembers = tierCountMap.get(tier.id) ?? 0
    const monthlyPriceCents = Math.round(Number(tier.monthly_price ?? 0) * 100)
    const monthlyRevenueCents = activeMembers * monthlyPriceCents
    const totalRevenueCents = monthlyRevenueCents * monthsInRange
    totalMembershipRevenue += totalRevenueCents

    return {
      tierName: tier.name,
      displayName: tier.display_name,
      activeMembers,
      monthlyRevenueCents,
      totalRevenueCents,
      percentOfTotal: 0, // calculated after totals
    }
  })

  // Calculate percentages
  for (const b of breakdowns) {
    b.percentOfTotal =
      totalMembershipRevenue > 0
        ? Math.round((b.totalRevenueCents / totalMembershipRevenue) * 100 * 10) /
          10
        : 0
  }

  return breakdowns
}

// ============================================
// getArAgingReport
// ============================================

export async function getArAgingReport(): Promise<ArAgingBucket[]> {
  const supabase = await createClient()

  // Fetch all unpaid/pending claims
  const { data: claims } = await supabase
    .from('insurance_claims')
    .select('id, billed_amount, paid_amount, submitted_at, created_at, status')
    .in('status', [
      'submitted',
      'acknowledged',
      'pending',
      'in_review',
      'appealed',
      'idr_initiated',
    ])

  const allClaims = claims ?? []
  const now = new Date()

  const buckets: Record<string, { count: number; amount: number }> = {
    '0-30': { count: 0, amount: 0 },
    '31-60': { count: 0, amount: 0 },
    '61-90': { count: 0, amount: 0 },
    '90+': { count: 0, amount: 0 },
  }

  for (const claim of allClaims) {
    const referenceDate = claim.submitted_at ?? claim.created_at
    const daysOld = Math.round(
      (now.getTime() - new Date(referenceDate).getTime()) / 86_400_000
    )
    const outstandingCents = Math.round(
      (Number(claim.billed_amount ?? 0) - Number(claim.paid_amount ?? 0)) * 100
    )

    let bucket: string
    if (daysOld <= 30) {
      bucket = '0-30'
    } else if (daysOld <= 60) {
      bucket = '31-60'
    } else if (daysOld <= 90) {
      bucket = '61-90'
    } else {
      bucket = '90+'
    }

    buckets[bucket].count += 1
    buckets[bucket].amount += Math.max(0, outstandingCents)
  }

  return Object.entries(buckets).map(([bucket, data]) => ({
    bucket,
    claimCount: data.count,
    totalAmountCents: data.amount,
  }))
}

// ============================================
// getCollectionRateTrend
// ============================================

export async function getCollectionRateTrend(
  dateRange?: RevenueDateRange
): Promise<CollectionRatePoint[]> {
  const supabase = await createClient()
  const range = dateRange ?? getDefaultDateRange()

  const { data: claims } = await supabase
    .from('insurance_claims')
    .select('billed_amount, paid_amount, created_at, status')
    .gte('created_at', range.from)
    .lte('created_at', range.to)
    .order('created_at', { ascending: true })

  const allClaims = claims ?? []

  // Group by month
  const monthMap = new Map<
    string,
    { billed: number; collected: number; count: number }
  >()

  // Generate all months in range
  const current = new Date(range.from)
  const end = new Date(range.to)
  while (current <= end) {
    const key = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`
    if (!monthMap.has(key)) {
      monthMap.set(key, { billed: 0, collected: 0, count: 0 })
    }
    current.setMonth(current.getMonth() + 1)
  }

  for (const claim of allClaims) {
    const d = new Date(claim.created_at)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (!monthMap.has(key)) {
      monthMap.set(key, { billed: 0, collected: 0, count: 0 })
    }
    const entry = monthMap.get(key)!
    entry.billed += Math.round(Number(claim.billed_amount ?? 0) * 100)
    entry.collected += Math.round(Number(claim.paid_amount ?? 0) * 100)
    entry.count += 1
  }

  const sortedKeys = Array.from(monthMap.keys()).sort()
  return sortedKeys.map((period) => {
    const entry = monthMap.get(period)!
    return {
      period,
      collectionRate:
        entry.billed > 0
          ? Math.round((entry.collected / entry.billed) * 100 * 10) / 10
          : 0,
      claimCount: entry.count,
    }
  })
}
