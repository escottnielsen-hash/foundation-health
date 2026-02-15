'use client'

import { useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils/cn'
import { elementId } from '@/lib/utils/element-ids'
import { Clock } from 'lucide-react'

interface SessionTimerProps {
  startTime: string | null
  isActive: boolean
  className?: string
}

export function SessionTimer({ startTime, isActive, className }: SessionTimerProps) {
  const [elapsed, setElapsed] = useState(0)

  const calculateElapsed = useCallback(() => {
    if (!startTime) return 0
    const start = new Date(startTime).getTime()
    const now = Date.now()
    return Math.max(0, Math.floor((now - start) / 1000))
  }, [startTime])

  useEffect(() => {
    if (!isActive || !startTime) return

    setElapsed(calculateElapsed())

    const interval = setInterval(() => {
      setElapsed(calculateElapsed())
    }, 1000)

    return () => clearInterval(interval)
  }, [isActive, startTime, calculateElapsed])

  const formatTime = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    const pad = (n: number) => n.toString().padStart(2, '0')

    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
    }
    return `${pad(minutes)}:${pad(seconds)}`
  }

  return (
    <div
      id={elementId('telemedicine', 'session', 'timer')}
      className={cn(
        'flex items-center gap-2 rounded-lg px-4 py-2 font-mono text-sm',
        isActive
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          : 'bg-gray-50 text-gray-500 border border-gray-200',
        className
      )}
    >
      <Clock className={cn('h-4 w-4', isActive && 'animate-pulse')} />
      <span className="font-semibold tracking-wider">
        {formatTime(elapsed)}
      </span>
      {isActive && (
        <span className="ml-1 h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
      )}
    </div>
  )
}
