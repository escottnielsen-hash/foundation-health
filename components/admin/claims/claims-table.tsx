'use client'

import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { elementId } from '@/lib/utils/element-ids'
import { CLAIM_STATUS_CONFIG } from '@/lib/validations/idr'
import type { ClaimSummaryRow } from '@/lib/actions/idr'
import { ArrowUpDown, ExternalLink } from 'lucide-react'
import { useState } from 'react'

interface ClaimsTableProps {
  claims: ClaimSummaryRow[]
}

type SortField = 'service_date' | 'billed_amount' | 'status' | 'created_at'
type SortDir = 'asc' | 'desc'

function formatDate(dateString: string | null): string {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function formatCurrency(dollars: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(dollars)
}

export function ClaimsTable({ claims }: ClaimsTableProps) {
  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  const sortedClaims = [...claims].sort((a, b) => {
    const multiplier = sortDir === 'asc' ? 1 : -1

    switch (sortField) {
      case 'service_date': {
        const dateA = a.service_date ? new Date(a.service_date).getTime() : 0
        const dateB = b.service_date ? new Date(b.service_date).getTime() : 0
        return (dateA - dateB) * multiplier
      }
      case 'billed_amount':
        return (a.billed_amount - b.billed_amount) * multiplier
      case 'status':
        return a.status.localeCompare(b.status) * multiplier
      case 'created_at': {
        const dateA = new Date(a.created_at).getTime()
        const dateB = new Date(b.created_at).getTime()
        return (dateA - dateB) * multiplier
      }
      default:
        return 0
    }
  })

  if (claims.length === 0) {
    return (
      <div
        id={elementId('admin', 'claims', 'table', 'empty')}
        className="py-12 text-center"
      >
        <p className="text-gray-500">No claims found matching the current filters.</p>
      </div>
    )
  }

  return (
    <div id={elementId('admin', 'claims', 'table')}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Claim #</TableHead>
            <TableHead>Payer</TableHead>
            <TableHead>
              <button
                onClick={() => handleSort('service_date')}
                className="inline-flex items-center gap-1 hover:text-gray-900"
              >
                Service Date
                <ArrowUpDown className="h-3 w-3" />
              </button>
            </TableHead>
            <TableHead>
              <button
                onClick={() => handleSort('billed_amount')}
                className="inline-flex items-center gap-1 hover:text-gray-900"
              >
                Billed
                <ArrowUpDown className="h-3 w-3" />
              </button>
            </TableHead>
            <TableHead>Paid</TableHead>
            <TableHead>
              <button
                onClick={() => handleSort('status')}
                className="inline-flex items-center gap-1 hover:text-gray-900"
              >
                Status
                <ArrowUpDown className="h-3 w-3" />
              </button>
            </TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedClaims.map((claim) => {
            const statusConfig = CLAIM_STATUS_CONFIG[claim.status] ?? {
              label: claim.status,
              variant: 'outline' as const,
            }

            return (
              <TableRow
                key={claim.id}
                id={elementId('admin', 'claims', 'row', claim.id)}
              >
                <TableCell className="font-medium">
                  {claim.claim_number ?? '-'}
                </TableCell>
                <TableCell className="text-gray-600">
                  {claim.payer_name ?? '-'}
                </TableCell>
                <TableCell className="text-gray-600">
                  {formatDate(claim.service_date)}
                </TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(claim.billed_amount)}
                </TableCell>
                <TableCell className="text-gray-600">
                  {claim.paid_amount
                    ? formatCurrency(claim.paid_amount)
                    : '-'}
                </TableCell>
                <TableCell>
                  <Badge variant={statusConfig.variant}>
                    {statusConfig.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {claim.status === 'denied' && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/admin/claims/idr?claim=${claim.id}`}>
                          File IDR
                        </Link>
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/claims/${claim.id}`}>
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
