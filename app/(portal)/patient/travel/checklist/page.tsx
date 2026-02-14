import Link from 'next/link'
import { ChecklistSection } from '@/components/travel/checklist-section'
import { Button } from '@/components/ui/button'
import { elementId } from '@/lib/utils/element-ids'
import { ArrowLeft, ClipboardCheck, Phone } from 'lucide-react'

// ============================================
// Metadata
// ============================================

export const metadata = {
  title: 'Pre-Visit Checklist | Foundation Health',
  description:
    'Prepare for your Foundation Health visit with our comprehensive pre-visit checklist. Documents, medical preparation, travel logistics, and post-op planning.',
}

// ============================================
// Page Component
// ============================================

export default function ChecklistPage() {
  return (
    <div id={elementId('travel', 'checklist')} className="space-y-8">
      {/* Back navigation */}
      <div>
        <Button asChild variant="ghost" size="sm" className="text-gray-500">
          <Link href="/patient/travel">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to Travel Planning
          </Link>
        </Button>
      </div>

      {/* Page header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50">
            <ClipboardCheck className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-gray-900">
              Pre-Visit Checklist
            </h1>
            <p className="text-sm text-gray-500">
              Everything you need to prepare for a seamless visit
            </p>
          </div>
        </div>
        <p className="mt-4 max-w-2xl leading-relaxed text-gray-600">
          A thoughtfully prepared visit leads to the best possible experience.
          Use this checklist to ensure you have everything in order before
          traveling to Foundation Health. Your progress is saved automatically.
        </p>
      </div>

      {/* Checklist */}
      <ChecklistSection />

      {/* Help callout */}
      <div className="rounded-xl border border-gray-100 bg-gray-50 p-6">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">
              Have Questions About Your Visit?
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              Our patient coordination team is available to help you prepare.
              Do not hesitate to reach out if you need assistance with any
              checklist item.
            </p>
          </div>
          <Button asChild variant="outline" className="flex-shrink-0">
            <Link href="/patient/travel/concierge">
              <Phone className="mr-2 h-4 w-4" />
              Contact Us
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
