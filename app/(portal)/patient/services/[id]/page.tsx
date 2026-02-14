import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getServiceById } from '@/lib/actions/services'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { elementId } from '@/lib/utils/element-ids'
import { formatCurrency, formatDuration } from '@/lib/utils/format'
import { getCategoryLabel } from '@/lib/validations/services'

// ============================================
// Page props
// ============================================

interface ServiceDetailPageProps {
  params: Promise<{ id: string }>
}

// ============================================
// Static "What's Included" items by category
// ============================================

function getWhatsIncluded(category: string | null): string[] {
  switch (category) {
    case 'surgical':
    case 'procedure':
      return [
        'Pre-operative consultation and assessment',
        'All surgical and facility fees',
        'Anesthesia administration',
        'Post-operative follow-up visits',
        'Dedicated care coordinator',
      ]
    case 'consultation':
    case 'primary_care':
      return [
        'Comprehensive health evaluation',
        'Detailed review of medical history',
        'Personalized treatment plan',
        'Follow-up care recommendations',
        'Direct physician communication',
      ]
    case 'diagnostic':
    case 'imaging':
      return [
        'State-of-the-art diagnostic equipment',
        'Board-certified radiologist interpretation',
        'Detailed results report',
        'Physician review and consultation',
        'Digital copies of all images',
      ]
    case 'lab':
      return [
        'Specimen collection and processing',
        'Certified laboratory analysis',
        'Comprehensive results report',
        'Physician interpretation of results',
        'Follow-up recommendations',
      ]
    case 'telehealth':
      return [
        'Secure HIPAA-compliant video platform',
        'Full physician consultation',
        'Prescriptions as medically appropriate',
        'Follow-up care instructions',
        'Medical record documentation',
      ]
    case 'wellness':
    case 'rehabilitation':
      return [
        'Initial assessment and goal setting',
        'Personalized treatment protocol',
        'Progress monitoring and adjustments',
        'Home exercise program',
        'Care team coordination',
      ]
    default:
      return [
        'Comprehensive service delivery',
        'Board-certified physician oversight',
        'Detailed medical documentation',
        'Follow-up care coordination',
        'Price transparency guarantee',
      ]
  }
}

// ============================================
// FAQ items
// ============================================

interface FAQItem {
  question: string
  answer: string
}

function getServiceFAQs(category: string | null): FAQItem[] {
  const commonFAQs: FAQItem[] = [
    {
      question: 'How does cash-pay pricing work?',
      answer:
        'Our cash-pay prices are all-inclusive with no hidden fees. You pay the listed price directly, which is often lower than insurance-negotiated rates. We provide a detailed receipt you can submit to your insurance for potential reimbursement.',
    },
    {
      question: 'Do you accept insurance?',
      answer:
        'Foundation Health operates as a cash-pay practice. We do not bill insurance directly. However, we provide superbills and detailed receipts that you can submit to your insurance company for potential out-of-network reimbursement.',
    },
    {
      question: 'Are there membership discounts available?',
      answer:
        'Yes. Foundation Health members receive tiered discounts on all services. Platinum members receive the highest discount, followed by Gold and Silver tiers. Visit our Membership page for details.',
    },
    {
      question: 'What payment methods do you accept?',
      answer:
        'We accept all major credit cards, debit cards, HSA/FSA cards, and wire transfers. Payment plans may be available for qualifying procedures.',
    },
  ]

  const categoryFAQs: FAQItem[] = []

  switch (category) {
    case 'surgical':
    case 'procedure':
      categoryFAQs.push({
        question: 'What is included in the surgical fee?',
        answer:
          'Our surgical fees are bundled to include the surgeon fee, facility fee, anesthesia, and standard post-operative follow-up visits. Additional imaging or lab work may be quoted separately.',
      })
      break
    case 'telehealth':
      categoryFAQs.push({
        question: 'What technology do I need for a telehealth visit?',
        answer:
          'You need a device with a camera and microphone (smartphone, tablet, or computer) and a stable internet connection. We use a secure, HIPAA-compliant video platform with no downloads required.',
      })
      break
    case 'diagnostic':
    case 'imaging':
      categoryFAQs.push({
        question: 'How soon will I receive my results?',
        answer:
          'Most diagnostic and imaging results are available within 24-48 hours. Your physician will review the results and discuss findings with you during a follow-up consultation.',
      })
      break
    default:
      break
  }

  return [...categoryFAQs, ...commonFAQs]
}

// ============================================
// Page component
// ============================================

export default async function ServiceDetailPage(props: ServiceDetailPageProps) {
  const params = await props.params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const result = await getServiceById(params.id)

  if (!result.success) {
    notFound()
  }

  const service = result.data

  // Convert DB dollar values to cents for formatCurrency
  const basePriceCents = Math.round(service.base_price * 100)
  const platinumPriceCents = service.platinum_price
    ? Math.round(service.platinum_price * 100)
    : null
  const goldPriceCents = service.gold_price
    ? Math.round(service.gold_price * 100)
    : null
  const silverPriceCents = service.silver_price
    ? Math.round(service.silver_price * 100)
    : null

  const whatsIncluded = getWhatsIncluded(service.category ?? null)
  const faqs = getServiceFAQs(service.category ?? null)

  return (
    <div id={elementId('service-detail', 'page', 'container')}>
      {/* Back Navigation */}
      <div className="mb-6">
        <Link
          href="/patient/services"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-primary-600 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Services
        </Link>
      </div>

      {/* Service Header */}
      <div
        id={elementId('service-detail', 'header')}
        className="mb-8"
      >
        <div className="flex flex-wrap items-center gap-3 mb-3">
          {service.category && (
            <Badge variant="secondary">
              {getCategoryLabel(service.category)}
            </Badge>
          )}
          {service.is_telehealth_eligible && (
            <Badge variant="outline">Telehealth Available</Badge>
          )}
          {service.requires_referral && (
            <Badge variant="warning">Referral Required</Badge>
          )}
          {service.cpt_code && (
            <Badge variant="outline" className="font-mono text-xs">
              CPT: {service.cpt_code}
            </Badge>
          )}
        </div>

        <h1
          id={elementId('service-detail', 'title')}
          className="text-3xl font-bold text-gray-900 mb-2"
        >
          {service.name}
        </h1>

        {service.description && (
          <p className="text-lg text-gray-600 max-w-3xl">
            {service.description}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Service Details */}
          <Card>
            <CardHeader>
              <CardTitle>Service Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                {service.duration_minutes && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Duration
                    </dt>
                    <dd className="mt-1 text-base font-semibold text-gray-900">
                      {formatDuration(service.duration_minutes)}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Category
                  </dt>
                  <dd className="mt-1 text-base font-semibold text-gray-900">
                    {service.category
                      ? getCategoryLabel(service.category)
                      : 'General'}
                  </dd>
                </div>
                {service.cpt_code && (
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      CPT Code
                    </dt>
                    <dd className="mt-1 text-base font-mono text-gray-900">
                      {service.cpt_code}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Telehealth
                  </dt>
                  <dd className="mt-1 text-base font-semibold text-gray-900">
                    {service.is_telehealth_eligible
                      ? 'Available'
                      : 'In-person only'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Referral
                  </dt>
                  <dd className="mt-1 text-base font-semibold text-gray-900">
                    {service.requires_referral
                      ? 'Required'
                      : 'Not required'}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* What's Included */}
          <Card>
            <CardHeader>
              <CardTitle>What&apos;s Included</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {whatsIncluded.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <svg
                        className="h-5 w-5 text-emerald-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Price Transparency Notice */}
          <Card className="border-primary-100 bg-gradient-to-br from-primary-50/50 to-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-primary-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
                Price Transparency Notice
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-600">
              <p>
                In compliance with federal price transparency requirements,
                Foundation Health publishes all service pricing upfront. The
                prices listed are our direct cash-pay rates and represent the
                total cost for the service described.
              </p>
              <p>
                No additional fees will be charged beyond the listed price for
                standard service delivery. If additional services or procedures
                become medically necessary, you will be informed of the cost
                before any additional work is performed.
              </p>
              <p>
                Membership holders receive discounted rates. Please refer to
                your membership tier for applicable discount percentages.
              </p>
            </CardContent>
          </Card>

          {/* FAQ Section */}
          <Card>
            <CardHeader>
              <CardTitle>Frequently Asked Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-0">
                {faqs.map((faq, idx) => (
                  <div key={idx}>
                    {idx > 0 && <Separator className="my-4" />}
                    <div>
                      <h4 className="text-base font-semibold text-gray-900 mb-1.5">
                        {faq.question}
                      </h4>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Pricing & CTA */}
        <div className="space-y-6">
          {/* Pricing Card */}
          <Card className="border-2 border-primary-100 sticky top-6">
            <CardHeader className="bg-gradient-to-br from-primary-50 to-white rounded-t-xl pb-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary-500 mb-1">
                Cash Pay Price
              </p>
              <p className="text-4xl font-bold text-primary-700">
                {formatCurrency(basePriceCents)}
              </p>
              {service.duration_minutes && (
                <p className="text-sm text-gray-500 mt-1">
                  {formatDuration(service.duration_minutes)} session
                </p>
              )}
            </CardHeader>
            <CardContent className="pt-4">
              {/* Membership pricing */}
              {(platinumPriceCents || goldPriceCents || silverPriceCents) && (
                <div className="mb-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                    Member Pricing
                  </p>
                  <div className="space-y-2">
                    {platinumPriceCents && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                          <span className="text-sm font-medium text-gray-700">
                            Platinum
                          </span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">
                          {formatCurrency(platinumPriceCents)}
                        </span>
                      </div>
                    )}
                    {goldPriceCents && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                          <span className="text-sm font-medium text-gray-700">
                            Gold
                          </span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">
                          {formatCurrency(goldPriceCents)}
                        </span>
                      </div>
                    )}
                    {silverPriceCents && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                          <span className="text-sm font-medium text-gray-700">
                            Silver
                          </span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">
                          {formatCurrency(silverPriceCents)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <Separator className="my-4" />

              {/* Book CTA */}
              <Button asChild className="w-full" size="lg">
                <Link
                  href={`/patient/appointments/book?service_id=${service.id}`}
                >
                  Book This Service
                </Link>
              </Button>

              <p className="text-xs text-center text-gray-400 mt-3">
                No obligation. Free cancellation up to 24 hours before.
              </p>
            </CardContent>
          </Card>

          {/* Quick Info Card */}
          <Card>
            <CardContent className="p-5">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">
                Why Foundation Health?
              </h4>
              <ul className="space-y-2.5">
                {[
                  'Transparent, upfront pricing',
                  'No surprise bills or hidden fees',
                  'Board-certified physicians',
                  'Luxury concierge experience',
                  'Same-day scheduling available',
                ].map((item, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-2 text-sm text-gray-600"
                  >
                    <svg
                      className="h-4 w-4 text-amber-500 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
