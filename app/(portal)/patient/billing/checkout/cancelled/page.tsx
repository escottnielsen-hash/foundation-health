import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  XCircle,
  ArrowLeft,
  RotateCcw,
} from 'lucide-react'

export default function PaymentCancelledPage() {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <Card className="overflow-hidden">
        {/* Amber/neutral top accent */}
        <div className="h-1.5 bg-gradient-to-r from-gray-300 to-gray-400" />

        <CardHeader className="text-center">
          {/* Cancelled icon */}
          <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <XCircle className="h-9 w-9 text-gray-500" />
          </div>
          <CardTitle className="text-xl">Payment Not Completed</CardTitle>
          <CardDescription>
            Your payment was cancelled and no charges were made
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Reassurance message */}
          <div className="rounded-lg border border-gray-100 bg-gray-50/50 px-4 py-4 text-center">
            <p className="text-sm text-gray-600">
              No worries -- your invoice is still available and you can try again
              at any time. If you experienced an issue during checkout, please
              contact our care team for assistance.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-2">
            <Button
              asChild
              size="lg"
              className="w-full"
            >
              <Link href="/patient/billing">
                <RotateCcw className="mr-2 h-4 w-4" />
                Try Again
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full"
            >
              <Link href="/patient/billing">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Billing
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
