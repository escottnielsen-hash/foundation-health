'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils/cn'
import { elementId } from '@/lib/utils/element-ids'
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

type ConnectionState = 'connecting' | 'waiting' | 'connected' | 'disconnected'

interface VideoPlaceholderProps {
  connectionState: ConnectionState
  physicianName?: string
  className?: string
}

const CONNECTION_LABELS: Record<ConnectionState, string> = {
  connecting: 'Connecting to session...',
  waiting: 'Waiting for physician to join...',
  connected: 'Session in progress',
  disconnected: 'Session ended',
}

export function VideoPlaceholder({
  connectionState,
  physicianName,
  className,
}: VideoPlaceholderProps) {
  const [cameraOn, setCameraOn] = useState(true)
  const [micOn, setMicOn] = useState(true)

  return (
    <div
      id={elementId('telemedicine', 'video', 'placeholder')}
      className={cn(
        'relative flex flex-col items-center justify-center rounded-2xl bg-gray-900 overflow-hidden',
        className
      )}
    >
      {/* Main video area */}
      <div className="flex flex-1 w-full items-center justify-center min-h-[300px] lg:min-h-[480px]">
        {connectionState === 'connecting' && (
          <div className="flex flex-col items-center gap-4 text-white">
            <Loader2 className="h-12 w-12 animate-spin text-amber-400" />
            <p className="text-lg font-medium">{CONNECTION_LABELS.connecting}</p>
            <p className="text-sm text-gray-400">
              Please ensure your camera and microphone are enabled
            </p>
          </div>
        )}

        {connectionState === 'waiting' && (
          <div className="flex flex-col items-center gap-4 text-white">
            <div className="relative">
              <div className="h-20 w-20 rounded-full bg-gray-700 flex items-center justify-center">
                <Video className="h-10 w-10 text-gray-400" />
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-5 w-5 bg-amber-400" />
              </span>
            </div>
            <p className="text-lg font-medium">{CONNECTION_LABELS.waiting}</p>
            {physicianName && (
              <p className="text-sm text-gray-400">
                Dr. {physicianName} will join shortly
              </p>
            )}
          </div>
        )}

        {connectionState === 'connected' && (
          <div className="flex flex-col items-center gap-4 text-white">
            <div className="h-20 w-20 rounded-full bg-emerald-600/20 flex items-center justify-center border-2 border-emerald-500">
              <Video className="h-10 w-10 text-emerald-400" />
            </div>
            <p className="text-lg font-medium">{CONNECTION_LABELS.connected}</p>
            <p className="text-sm text-emerald-400">Video will connect here</p>
          </div>
        )}

        {connectionState === 'disconnected' && (
          <div className="flex flex-col items-center gap-4 text-white">
            <div className="h-20 w-20 rounded-full bg-gray-700 flex items-center justify-center">
              <VideoOff className="h-10 w-10 text-gray-500" />
            </div>
            <p className="text-lg font-medium">{CONNECTION_LABELS.disconnected}</p>
          </div>
        )}
      </div>

      {/* Self-view preview (bottom right) */}
      {(connectionState === 'waiting' || connectionState === 'connected') && (
        <div className="absolute bottom-20 right-4 w-40 h-28 rounded-lg bg-gray-800 border border-gray-600 flex items-center justify-center overflow-hidden shadow-lg">
          {cameraOn ? (
            <div className="flex flex-col items-center gap-1 text-gray-400">
              <Video className="h-6 w-6" />
              <span className="text-[10px]">Your camera</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1 text-gray-500">
              <VideoOff className="h-6 w-6" />
              <span className="text-[10px]">Camera off</span>
            </div>
          )}
        </div>
      )}

      {/* Controls bar */}
      <div
        id={elementId('telemedicine', 'video', 'controls')}
        className="w-full flex items-center justify-center gap-3 p-4 bg-gray-800/80 backdrop-blur-sm"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMicOn(!micOn)}
          className={cn(
            'h-12 w-12 rounded-full',
            micOn
              ? 'bg-gray-700 text-white hover:bg-gray-600'
              : 'bg-red-600 text-white hover:bg-red-700'
          )}
          aria-label={micOn ? 'Mute microphone' : 'Unmute microphone'}
        >
          {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCameraOn(!cameraOn)}
          className={cn(
            'h-12 w-12 rounded-full',
            cameraOn
              ? 'bg-gray-700 text-white hover:bg-gray-600'
              : 'bg-red-600 text-white hover:bg-red-700'
          )}
          aria-label={cameraOn ? 'Turn off camera' : 'Turn on camera'}
        >
          {cameraOn ? (
            <Video className="h-5 w-5" />
          ) : (
            <VideoOff className="h-5 w-5" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 rounded-full bg-gray-700 text-white hover:bg-gray-600"
          aria-label="Share screen"
        >
          <Monitor className="h-5 w-5" />
        </Button>
      </div>

      {/* Connection status indicator */}
      <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full bg-black/50 px-3 py-1.5 backdrop-blur-sm">
        <span
          className={cn(
            'h-2 w-2 rounded-full',
            connectionState === 'connected' && 'bg-emerald-500',
            connectionState === 'connecting' && 'bg-amber-500 animate-pulse',
            connectionState === 'waiting' && 'bg-amber-500 animate-pulse',
            connectionState === 'disconnected' && 'bg-red-500'
          )}
        />
        <span className="text-xs text-white font-medium">
          {connectionState === 'connected' && 'Connected'}
          {connectionState === 'connecting' && 'Connecting...'}
          {connectionState === 'waiting' && 'Waiting...'}
          {connectionState === 'disconnected' && 'Disconnected'}
        </span>
      </div>
    </div>
  )
}
