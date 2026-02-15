import Link from 'next/link'
import { FileText, ArrowRight, Receipt } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { elementId } from '@/lib/utils/element-ids'
import { formatCurrency } from '@/lib/utils/format'
import type { DashboardClaim } from '@/lib/actions/dashboard'
import type { ClaimStatus } from '@/types/database'

interface RecentClaimsCardProps {
  claims: DashboardClaim[]
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function getClaimStatusBadge(status: ClaimStatus): {
  variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'
  label: string
} {
  switch (status) {
    case 'paid':
      return { variant: 'success', label: 'Paid' }
    case 'partially_paid':
      return { variant: 'success', label: 'Partial' }
    case 'denied':
      return { variant: 'destructive', label: 'Denied' }
    case 'submitted':
      return { variant: 'outline', label: 'Submitted' }
    case 'acknowledged':
      return { variant: 'outline', label: 'Acknowledged' }
    case 'pending':
      return { variant: 'warning', label: 'Pending' }
    case 'in_review':
      return { variant: 'warning', label: 'In Review' }
    case 'appealed':
      return { variant: 'warning', label: 'Appealed' }
    case 'idr_initiated':
      return { variant: 'warning', label: 'IDR' }
    case 'idr_resolved':
      return { variant: 'success', label: 'IDR Resolved' }
    case 'closed':
      return { variant: 'secondary', label: 'Closed' }
    case 'draft':
      return { variant: 'secondary', label: 'Draft' }
    default:
      return { variant: 'outline', label: status }
  }
}

export function RecentClaimsCard({ claims }: RecentClaimsCardProps) {
  return (
    <Card
      id={elementId('dashboard', 'recent', 'claims')}
      className="border-0 shadow-md"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold text-slate-900">
            Recent Claims
          </CardTitle>
          <Link
            href="/patient/billing/payments"
            className="inline-flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-700"
          >
            All claims
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <CardDescription>Your latest insurance claims</CardDescription>
      </CardHeader>
      <CardContent>
        {claims.length > 0 ? (
          <div className="space-y-3">
            {claims.map((claim) => {
              const statusBadge = getClaimStatusBadge(claim.status)
              return (
                <div
                  key={claim.id}
                  className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3.5 transition-all hover:border-blue-200 hover:bg-blue-50/20 hover:shadow-sm"
                >
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {claim.payer_name || 'Insurance Claim'}
                        </p>
                        {claim.claim_number && (
                          <p className="text-xs text-slate-400">
                            #{claim.claim_number}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant={statusBadge.variant}
                        className="flex-shrink-0 text-[10px]"
                      >
                        {statusBadge.label}
                      </Badge>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-slate-500">
                        {formatDate(claim.service_date)}
                      </span>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-slate-900">
                          {formatCurrency(claim.billed_amount)}
                        </span>
                        {claim.paid_amount != null && claim.paid_amount > 0 && (
                          <span className="ml-1 text-xs text-emerald-600">
                            ({formatCurrency(claim.paid_amount)} paid)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <Receipt className="h-7 w-7 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-600">No claims yet</p>
            <p className="mt-1 text-xs text-slate-400">
              Your insurance claims will appear here
            </p>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="mt-4"
            >
              <Link href="/patient/insurance">
                View Insurance
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
