'use client'

import { Badge } from '@/components/ui/badge'
import { CLAIM_STATUS_CONFIG } from '@/lib/validations/claims'
import type { ClaimStatus } from '@/types/database'

interface ClaimStatusBadgeProps {
  status: ClaimStatus
  className?: string
}

export function ClaimStatusBadge({ status, className }: ClaimStatusBadgeProps) {
  const config = CLAIM_STATUS_CONFIG[status] ?? {
    label: status,
    variant: 'outline' as const,
  }

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  )
}
