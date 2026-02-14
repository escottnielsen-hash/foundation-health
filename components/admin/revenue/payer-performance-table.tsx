'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency } from '@/lib/utils/format'
import { elementId } from '@/lib/utils/element-ids'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import type { PayerPerformance } from '@/types/revenue'

// ============================================
// Types
// ============================================

interface PayerPerformanceTableProps {
  data: PayerPerformance[]
}

// ============================================
// Helpers
// ============================================

function getCollectionRateBadge(rate: number) {
  if (rate >= 90) {
    return (
      <Badge variant="success" className="gap-0.5">
        <ArrowUpRight className="h-3 w-3" />
        {rate}%
      </Badge>
    )
  }
  if (rate >= 70) {
    return (
      <Badge variant="warning" className="gap-0.5">
        {rate}%
      </Badge>
    )
  }
  return (
    <Badge variant="destructive" className="gap-0.5">
      <ArrowDownRight className="h-3 w-3" />
      {rate}%
    </Badge>
  )
}

function getDenialRateBadge(rate: number) {
  if (rate <= 5) {
    return <Badge variant="success">{rate}%</Badge>
  }
  if (rate <= 15) {
    return <Badge variant="warning">{rate}%</Badge>
  }
  return <Badge variant="destructive">{rate}%</Badge>
}

// ============================================
// PayerPerformanceTable Component
// ============================================

export function PayerPerformanceTable({ data }: PayerPerformanceTableProps) {
  if (data.length === 0) {
    return (
      <Card id={elementId('revenue', 'table', 'payer-performance')}>
        <CardHeader>
          <CardTitle className="text-base">Payer Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-sm text-gray-500">
            No payer data available for this period.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card id={elementId('revenue', 'table', 'payer-performance')}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Payer Performance</CardTitle>
          <span className="text-xs text-gray-500">
            {data.length} payers
          </span>
        </div>
      </CardHeader>
      <CardContent className="px-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-6">Payer</TableHead>
              <TableHead className="text-right">Claims</TableHead>
              <TableHead className="text-right">Total Billed</TableHead>
              <TableHead className="text-right">Total Paid</TableHead>
              <TableHead className="text-right">Collection Rate</TableHead>
              <TableHead className="text-right">Denial Rate</TableHead>
              <TableHead className="pr-6 text-right">Avg. Days</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((payer, index) => (
              <TableRow key={payer.payerName}>
                <TableCell className="pl-6">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-600">
                      {index + 1}
                    </span>
                    <span className="font-medium text-gray-900">
                      {payer.payerName}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {payer.claimCount}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCurrency(payer.totalBilledCents)}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatCurrency(payer.totalPaidCents)}
                </TableCell>
                <TableCell className="text-right">
                  {getCollectionRateBadge(payer.averageCollectionRate)}
                </TableCell>
                <TableCell className="text-right">
                  {getDenialRateBadge(payer.denialRate)}
                </TableCell>
                <TableCell className="pr-6 text-right tabular-nums">
                  {payer.averageDaysToPayment} days
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
