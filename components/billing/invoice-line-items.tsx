import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { elementId } from '@/lib/utils/element-ids'
import type { InvoiceLineItem } from '@/lib/validations/invoices'

// ============================================
// Currency formatting
// ============================================

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

// ============================================
// InvoiceLineItems component
// ============================================

interface InvoiceLineItemsProps {
  lineItems: InvoiceLineItem[]
  subtotal: number
  taxAmount: number
  discountAmount: number
  total: number
}

export function InvoiceLineItems({
  lineItems,
  subtotal,
  taxAmount,
  discountAmount,
  total,
}: InvoiceLineItemsProps) {
  if (lineItems.length === 0) {
    return (
      <div
        id={elementId('invoice', 'line-items', 'empty')}
        className="py-8 text-center text-sm text-gray-500"
      >
        No line items on this invoice.
      </div>
    )
  }

  return (
    <div id={elementId('invoice', 'line-items', 'container')}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[30%]">Service</TableHead>
            <TableHead className="w-[30%]">Description</TableHead>
            <TableHead className="text-center w-[10%]">Qty</TableHead>
            <TableHead className="text-right w-[15%]">Unit Price</TableHead>
            <TableHead className="text-right w-[15%]">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lineItems.map((item, index) => (
            <TableRow key={`${item.service_id ?? 'item'}-${index}`}>
              <TableCell className="font-medium text-gray-900">
                <div>
                  {item.name}
                  {item.cpt_code && (
                    <span className="ml-2 text-xs text-gray-400 font-mono">
                      ({item.cpt_code})
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-gray-600 text-sm">
                {item.description ?? '--'}
              </TableCell>
              <TableCell className="text-center text-gray-700">
                {item.qty}
              </TableCell>
              <TableCell className="text-right text-gray-700">
                {formatCurrency(item.unit_price)}
              </TableCell>
              <TableCell className="text-right font-medium text-gray-900">
                {formatCurrency(item.total)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          {/* Subtotal */}
          <TableRow className="bg-transparent border-t-2">
            <TableCell colSpan={4} className="text-right text-sm text-gray-500">
              Subtotal
            </TableCell>
            <TableCell className="text-right text-sm font-medium text-gray-700">
              {formatCurrency(subtotal)}
            </TableCell>
          </TableRow>

          {/* Discount (if applicable) */}
          {discountAmount > 0 && (
            <TableRow className="bg-transparent">
              <TableCell
                colSpan={4}
                className="text-right text-sm text-emerald-600"
              >
                Discount
              </TableCell>
              <TableCell className="text-right text-sm font-medium text-emerald-600">
                -{formatCurrency(discountAmount)}
              </TableCell>
            </TableRow>
          )}

          {/* Tax (if applicable) */}
          {taxAmount > 0 && (
            <TableRow className="bg-transparent">
              <TableCell
                colSpan={4}
                className="text-right text-sm text-gray-500"
              >
                Tax
              </TableCell>
              <TableCell className="text-right text-sm font-medium text-gray-700">
                {formatCurrency(taxAmount)}
              </TableCell>
            </TableRow>
          )}

          {/* Total */}
          <TableRow className="bg-gray-50/80">
            <TableCell colSpan={4}>
              <Separator className="mb-2" />
              <span className="text-right text-base font-semibold text-gray-900 block">
                Total
              </span>
            </TableCell>
            <TableCell>
              <Separator className="mb-2" />
              <span className="text-right text-base font-bold text-gray-900 block">
                {formatCurrency(total)}
              </span>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  )
}
