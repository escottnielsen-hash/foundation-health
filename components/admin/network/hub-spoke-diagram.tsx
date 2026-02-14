'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils/cn'
import { Badge } from '@/components/ui/badge'
import type { NetworkNode, NetworkStatus } from '@/types/network'

// ============================================
// Status color mapping
// ============================================

const STATUS_RING: Record<NetworkStatus, string> = {
  healthy: 'ring-emerald-400',
  warning: 'ring-amber-400',
  critical: 'ring-red-400',
}

const STATUS_DOT: Record<NetworkStatus, string> = {
  healthy: 'bg-emerald-400',
  warning: 'bg-amber-400',
  critical: 'bg-red-400',
}

const STATUS_GLOW: Record<NetworkStatus, string> = {
  healthy: '#34d399',
  warning: '#fbbf24',
  critical: '#f87171',
}

const STATUS_LINE: Record<NetworkStatus, string> = {
  healthy: '#6ee7b7',
  warning: '#fcd34d',
  critical: '#fca5a5',
}

// ============================================
// Props
// ============================================

interface HubSpokeDiagramProps {
  hub: NetworkNode | null
  spokes: NetworkNode[]
}

// ============================================
// Node Component
// ============================================

function NetworkNodeCard({
  node,
  isHub,
}: {
  node: NetworkNode
  isHub: boolean
}) {
  const router = useRouter()

  const handleClick = useCallback(() => {
    router.push(`/admin/network/${node.id}`)
  }, [router, node.id])

  return (
    <button
      onClick={handleClick}
      className={cn(
        'group relative flex flex-col items-center rounded-2xl border bg-white p-4 shadow-md transition-all',
        'hover:shadow-lg hover:scale-105 hover:-translate-y-0.5',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
        'ring-2',
        STATUS_RING[node.status],
        isHub ? 'min-w-[220px] p-5' : 'min-w-[180px]'
      )}
    >
      {/* Status indicator dot */}
      <span
        className={cn(
          'absolute -top-1.5 -right-1.5 h-3.5 w-3.5 rounded-full border-2 border-white',
          STATUS_DOT[node.status]
        )}
      />

      {/* Icon */}
      <div
        className={cn(
          'mb-2 flex items-center justify-center rounded-full',
          isHub
            ? 'h-14 w-14 bg-teal-50 text-teal-700'
            : 'h-11 w-11 bg-blue-50 text-blue-700'
        )}
      >
        {isHub ? (
          <HubIcon className="h-7 w-7" />
        ) : (
          <SpokeIcon className="h-5 w-5" />
        )}
      </div>

      {/* Name */}
      <span
        className={cn(
          'font-semibold text-gray-900 text-center leading-tight',
          isHub ? 'text-base' : 'text-sm'
        )}
      >
        {node.name}
      </span>

      {/* Type badge */}
      <Badge
        variant={isHub ? 'success' : 'secondary'}
        className={cn('mt-1.5', isHub && 'bg-teal-100 text-teal-800')}
      >
        {isHub ? 'Hub' : 'Spoke'}
        {node.isCriticalAccess && ' - CAH'}
      </Badge>

      {/* Location */}
      {node.city && node.state && (
        <span className="mt-1 text-xs text-gray-500">
          {node.city}, {node.state}
        </span>
      )}

      {/* Stats row */}
      <div className="mt-3 flex items-center gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <ProviderIcon className="h-3.5 w-3.5 text-gray-400" />
          <span className="font-medium">{node.activeProviderCount}</span>
          <span className="hidden sm:inline">providers</span>
        </div>
        <div className="flex items-center gap-1">
          <CalendarIcon className="h-3.5 w-3.5 text-gray-400" />
          <span className="font-medium">{node.todayAppointmentCount}</span>
          <span className="hidden sm:inline">today</span>
        </div>
      </div>
    </button>
  )
}

// ============================================
// Main Diagram Component
// ============================================

export function HubSpokeDiagram({ hub, spokes }: HubSpokeDiagramProps) {
  if (!hub) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 p-12">
        <p className="text-sm text-gray-500">
          No hub location configured. Add a hub location to see the network diagram.
        </p>
      </div>
    )
  }

  const spokeCount = spokes.length

  // Angle distribution for spokes around the hub
  const getAngle = (index: number): number => {
    if (spokeCount === 0) return 0
    if (spokeCount === 1) return -90 // top
    if (spokeCount === 2) return index === 0 ? -60 : 60
    if (spokeCount === 3) return -90 + index * 120
    return -90 + index * (360 / spokeCount)
  }

  // Radius from center for spoke placement (in percentage of container)
  const RADIUS = 38

  return (
    <div className="w-full">
      {/* Desktop / Tablet: SVG-based radial layout */}
      <div className="hidden md:block">
        <div className="relative mx-auto" style={{ maxWidth: 700, aspectRatio: '1 / 0.85' }}>
          {/* SVG Connection Lines */}
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 700 595"
            fill="none"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              {/* Glow filters per status */}
              {spokes.map((spoke, i) => (
                <filter key={spoke.id} id={`glow-${i}`} x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feFlood floodColor={STATUS_GLOW[spoke.status]} floodOpacity="0.4" />
                  <feComposite in2="blur" operator="in" />
                  <feMerge>
                    <feMergeNode />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              ))}
              <filter id="glow-hub" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feFlood floodColor={STATUS_GLOW[hub.status]} floodOpacity="0.3" />
                <feComposite in2="blur" operator="in" />
                <feMerge>
                  <feMergeNode />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Hub pulse ring */}
            <circle
              cx={350}
              cy={297}
              r={45}
              fill="none"
              stroke={STATUS_GLOW[hub.status]}
              strokeWidth={2}
              opacity={0.3}
            >
              <animate
                attributeName="r"
                values="45;65;45"
                dur="3s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.3;0.08;0.3"
                dur="3s"
                repeatCount="indefinite"
              />
            </circle>

            {/* Connection lines from hub to each spoke */}
            {spokes.map((spoke, i) => {
              const angle = (getAngle(i) * Math.PI) / 180
              const spokeX = 350 + RADIUS * 7 * Math.cos(angle)
              const spokeY = 297 + RADIUS * 7 * Math.sin(angle)
              return (
                <g key={spoke.id}>
                  {/* Shadow line */}
                  <line
                    x1={350}
                    y1={297}
                    x2={spokeX}
                    y2={spokeY}
                    stroke={STATUS_LINE[spoke.status]}
                    strokeWidth={3}
                    strokeDasharray="8 4"
                    opacity={0.6}
                    filter={`url(#glow-${i})`}
                  />
                  {/* Data flow animation dots */}
                  <circle r={3} fill={STATUS_GLOW[spoke.status]}>
                    <animateMotion
                      dur={`${2 + i * 0.5}s`}
                      repeatCount="indefinite"
                      path={`M350,297 L${spokeX},${spokeY}`}
                    />
                    <animate
                      attributeName="opacity"
                      values="1;0.3;1"
                      dur={`${2 + i * 0.5}s`}
                      repeatCount="indefinite"
                    />
                  </circle>
                </g>
              )
            })}
          </svg>

          {/* Hub node — centered */}
          <div
            className="absolute z-10"
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <NetworkNodeCard node={hub} isHub />
          </div>

          {/* Spoke nodes — positioned radially */}
          {spokes.map((spoke, i) => {
            const angle = (getAngle(i) * Math.PI) / 180
            const left = 50 + RADIUS * Math.cos(angle)
            const top = 50 + RADIUS * Math.sin(angle)
            return (
              <div
                key={spoke.id}
                className="absolute z-10"
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <NetworkNodeCard node={spoke} isHub={false} />
              </div>
            )
          })}
        </div>
      </div>

      {/* Mobile: stacked layout */}
      <div className="block md:hidden space-y-4">
        {/* Hub */}
        <div className="flex flex-col items-center">
          <NetworkNodeCard node={hub} isHub />
        </div>

        {/* Visual connector */}
        <div className="flex justify-center">
          <div className="h-8 w-px bg-gradient-to-b from-teal-400 to-gray-200" />
        </div>

        {/* Spokes */}
        <div className="space-y-3">
          {spokes.map((spoke, i) => (
            <div key={spoke.id}>
              {i > 0 && (
                <div className="flex justify-center py-1">
                  <div className="h-4 w-px bg-gray-200" />
                </div>
              )}
              <div className="flex justify-center">
                <NetworkNodeCard node={spoke} isHub={false} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ============================================
// Inline SVG Icons
// ============================================

function HubIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 21h18" />
      <path d="M5 21V7l7-4 7 4v14" />
      <path d="M9 21v-4h6v4" />
      <path d="M10 9h4" />
      <path d="M10 13h4" />
    </svg>
  )
}

function SpokeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16" />
      <path d="M3 21h18" />
      <path d="M9 7h1" />
      <path d="M14 7h1" />
      <path d="M9 11h1" />
      <path d="M14 11h1" />
      <path d="M9 15h1" />
      <path d="M14 15h1" />
    </svg>
  )
}

function ProviderIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  )
}
