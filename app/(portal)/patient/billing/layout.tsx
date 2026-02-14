import { BillingNav } from '@/components/billing/billing-nav'

// ============================================
// Billing Layout
// ============================================

export default function BillingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
          Billing
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your invoices, superbills, and payment history
        </p>
      </div>

      {/* Sub-Navigation */}
      <BillingNav />

      {/* Page Content */}
      <div>{children}</div>
    </div>
  )
}
