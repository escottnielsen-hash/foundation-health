'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { elementId } from '@/lib/utils/element-ids'
import { formatCurrency, formatDuration } from '@/lib/utils/format'
import { getCategoryLabel } from '@/lib/validations/services'

interface ServiceCardProps {
  id: string
  name: string
  description: string | null
  category: string | null
  basePrice: number
  durationMinutes: number | null
  isTelehealthEligible: boolean
}

/** Map service category to a badge variant for visual distinction. */
function getCategoryBadgeVariant(
  category: string
): 'default' | 'secondary' | 'outline' | 'success' | 'warning' {
  switch (category) {
    case 'surgical':
    case 'procedure':
      return 'default'
    case 'consultation':
    case 'primary_care':
      return 'secondary'
    case 'diagnostic':
    case 'imaging':
    case 'lab':
      return 'success'
    case 'wellness':
    case 'rehabilitation':
      return 'warning'
    case 'telehealth':
      return 'outline'
    default:
      return 'outline'
  }
}

export function ServiceCard({
  id,
  name,
  description,
  category,
  basePrice,
  durationMinutes,
  isTelehealthEligible,
}: ServiceCardProps) {
  // base_price from DB is in dollars (DECIMAL 10,2); convert to cents for formatCurrency
  const priceInCents = Math.round(basePrice * 100)

  return (
    <Link href={`/patient/services/${id}`} className="block group">
      <Card
        id={elementId('services', 'card', id)}
        className="hover:border-primary-200 hover:shadow-md transition-all cursor-pointer h-full"
      >
        <CardContent className="p-6">
          {/* Category badge row */}
          <div className="flex items-center gap-2 mb-3">
            {category && (
              <Badge variant={getCategoryBadgeVariant(category)}>
                {getCategoryLabel(category)}
              </Badge>
            )}
            {isTelehealthEligible && (
              <Badge variant="outline" className="text-[10px]">
                Telehealth Available
              </Badge>
            )}
          </div>

          {/* Service name */}
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors mb-1.5 line-clamp-1">
            {name}
          </h3>

          {/* Description */}
          {description && (
            <p className="text-sm text-gray-500 line-clamp-2 mb-4">
              {description}
            </p>
          )}

          {/* Price and duration row */}
          <div className="flex items-end justify-between mt-auto pt-3 border-t border-gray-100">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-0.5">
                Cash Pay Price
              </p>
              <p className="text-xl font-bold text-primary-700">
                {formatCurrency(priceInCents)}
              </p>
            </div>

            {durationMinutes && durationMinutes > 0 && (
              <div className="text-right">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-0.5">
                  Duration
                </p>
                <p className="text-sm font-semibold text-gray-700">
                  {formatDuration(durationMinutes)}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
