'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { createPaymentSession } from '@/lib/actions/invoices'
import { elementId } from '@/lib/utils/element-ids'

// ============================================
// InvoiceDetailActions (client component)
// ============================================

interface InvoiceDetailActionsProps {
  invoiceId: string
  userId: string
  showPayButton: boolean
}

export function InvoiceDetailActions({
  invoiceId,
  userId,
  showPayButton,
}: InvoiceDetailActionsProps) {
  const { toast } = useToast()
  const [isPayLoading, setIsPayLoading] = useState(false)

  const handlePayNow = async () => {
    setIsPayLoading(true)
    try {
      const result = await createPaymentSession(invoiceId, userId)
      if (result.success) {
        window.location.href = result.data.checkout_url
      } else {
        toast({
          title: 'Payment Error',
          description: result.error,
          variant: 'destructive',
        })
      }
    } catch {
      toast({
        title: 'Payment Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsPayLoading(false)
    }
  }

  const handleDownloadPdf = () => {
    toast({
      title: 'Coming Soon',
      description:
        'PDF invoice download is coming soon. Please contact our office for a printed copy.',
    })
  }

  return (
    <div
      id={elementId('invoice-detail', 'actions', 'container')}
      className="flex items-center gap-3"
    >
      {showPayButton && (
        <Button
          id={elementId('invoice-detail', 'actions', 'pay')}
          onClick={handlePayNow}
          disabled={isPayLoading}
          size="lg"
        >
          {isPayLoading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Processing...
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
              Pay Now
            </>
          )}
        </Button>
      )}

      <Button
        id={elementId('invoice-detail', 'actions', 'download')}
        variant="outline"
        onClick={handleDownloadPdf}
      >
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        Download PDF
      </Button>
    </div>
  )
}
