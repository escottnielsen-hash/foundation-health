'use client'

import * as React from 'react'
import { cn } from '@/lib/utils/cn'

const AvatarRoot = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
      className
    )}
    {...props}
  />
))
AvatarRoot.displayName = 'AvatarRoot'

export interface AvatarImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  onLoadingStatusChange?: (status: 'loading' | 'loaded' | 'error') => void
}

const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, src, alt, onLoadingStatusChange, ...props }, ref) => {
    const [status, setStatus] = React.useState<'loading' | 'loaded' | 'error'>('loading')

    React.useEffect(() => {
      if (!src) {
        setStatus('error')
        onLoadingStatusChange?.('error')
        return
      }
      setStatus('loading')
      onLoadingStatusChange?.('loading')
    }, [src, onLoadingStatusChange])

    if (status === 'error') {
      return null
    }

    return (
      <img
        ref={ref}
        src={src}
        alt={alt}
        className={cn('aspect-square h-full w-full object-cover', className)}
        onLoad={() => {
          setStatus('loaded')
          onLoadingStatusChange?.('loaded')
        }}
        onError={() => {
          setStatus('error')
          onLoadingStatusChange?.('error')
        }}
        {...props}
      />
    )
  }
)
AvatarImage.displayName = 'AvatarImage'

const AvatarFallback = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex h-full w-full items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground',
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = 'AvatarFallback'

export { AvatarRoot, AvatarImage, AvatarFallback }
