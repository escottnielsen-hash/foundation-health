'use client'

import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { elementId } from '@/lib/utils/element-ids'
import type { ClaimLineItem } from '@/types/database'

interface ClaimLineItemsProps {
  lineItems: ClaimLineItem[]
}

function formatCurrency(cents: number | null): string {
  if (cents == null) return '--'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}

function calculateMultiplier(charge: number, qpa: number | null): string {
  if (!qpa || qpa === 0) return '--'
  const multiplier = charge / qpa
  return `${multiplier.toFixed(1)}x`
}

export function ClaimLineItems({ lineItems }: ClaimLineItemsProps) {
  if (lineItems.length === 0) {
    return (
      <div
        id={elementId('claims', 'line-items', 'empty')}
        className="text-center py-8 text-gray-500 text-sm"
      >
        No line items have been added to this claim yet.
      </div>
    )
  }

  const totalCharged = lineItems.reduce((sum, item) => sum + item.charge_amount, 0)
  const totalQpa = lineItems.reduce((sum, item) => sum + (item.qpa_amount ?? 0), 0)
  const totalAllowed = lineItems.reduce((sum, item) => sum + (item.allowed_amount ?? 0), 0)
  const totalPaid = lineItems.reduce((sum, item) => sum + (item.paid_amount ?? 0), 0)

  return (
    <div id={elementId('claims', 'line-items', 'table')}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>CPT Code</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="hidden md:table-cell">Modifier</TableHead>
            <TableHead className="text-center">Units</TableHead>
            <TableHead className="text-right">Charged</TableHead>
            <TableHead className="text-right hidden lg:table-cell">QPA</TableHead>
            <TableHead className="text-right hidden lg:table-cell">Multiplier</TableHead>
            <TableHead className="text-right">Allowed</TableHead>
            <TableHead className="text-right">Paid</TableHead>
            <TableHead className="hidden xl:table-cell">Denial Code</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lineItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-mono text-gray-400 text-xs">
                {item.line_number}
              </TableCell>
              <TableCell>
                <span className="font-mono font-medium text-sm">
                  {item.cpt_code}
                </span>
              </TableCell>
              <TableCell className="max-w-[200px]">
                <span className="text-sm text-gray-700 truncate block">
                  {item.cpt_description ?? '--'}
                </span>
                {item.icd10_codes && item.icd10_codes.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {item.icd10_codes.map((code) => (
                      <Badge
                        key={code}
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 font-mono"
                      >
                        {code}
                      </Badge>
                    ))}
                  </div>
                )}
              </TableCell>
              <TableCell className="hidden md:table-cell text-sm text-gray-600">
                {item.modifier ?? '--'}
              </TableCell>
              <TableCell className="text-center text-sm">
                {item.units}
              </TableCell>
              <TableCell className="text-right font-medium text-sm">
                {formatCurrency(item.charge_amount)}
              </TableCell>
              <TableCell className="text-right text-sm text-gray-500 hidden lg:table-cell">
                {formatCurrency(item.qpa_amount)}
              </TableCell>
              <TableCell className="text-right text-sm hidden lg:table-cell">
                <span className="font-medium text-blue-600">
                  {calculateMultiplier(item.charge_amount, item.qpa_amount)}
                </span>
              </TableCell>
              <TableCell className="text-right text-sm text-gray-600">
                {formatCurrency(item.allowed_amount)}
              </TableCell>
              <TableCell className="text-right text-sm">
                <span
                  className={
                    item.paid_amount != null && item.paid_amount > 0
                      ? 'text-emerald-600 font-medium'
                      : 'text-gray-400'
                  }
                >
                  {formatCurrency(item.paid_amount)}
                </span>
              </TableCell>
              <TableCell className="hidden xl:table-cell">
                {item.denial_reason_code ? (
                  <Badge variant="destructive" className="text-[10px] font-mono">
                    {item.denial_reason_code}
                  </Badge>
                ) : (
                  <span className="text-gray-400 text-sm">--</span>
                )}
              </TableCell>
            </TableRow>
          ))}

          {/* Totals row */}
          <TableRow className="bg-gray-50 font-semibold">
            <TableCell colSpan={5} className="text-right text-sm">
              Totals
            </TableCell>
            <TableCell className="text-right text-sm">
              {formatCurrency(totalCharged)}
            </TableCell>
            <TableCell className="text-right text-sm text-gray-500 hidden lg:table-cell">
              {formatCurrency(totalQpa > 0 ? totalQpa : null)}
            </TableCell>
            <TableCell className="text-right text-sm hidden lg:table-cell">
              {totalQpa > 0 ? (
                <span className="text-blue-600">
                  {calculateMultiplier(totalCharged, totalQpa)}
                </span>
              ) : (
                '--'
              )}
            </TableCell>
            <TableCell className="text-right text-sm">
              {formatCurrency(totalAllowed > 0 ? totalAllowed : null)}
            </TableCell>
            <TableCell className="text-right text-sm text-emerald-600">
              {formatCurrency(totalPaid > 0 ? totalPaid : null)}
            </TableCell>
            <TableCell className="hidden xl:table-cell" />
          </TableRow>
        </TableBody>
      </Table>
    </div>
  )
}
