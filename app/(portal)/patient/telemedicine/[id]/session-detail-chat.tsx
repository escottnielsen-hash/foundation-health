'use client'

import { useTransition } from 'react'
import { SessionChat, type ChatMessage } from '@/components/patient/telemedicine/session-chat'
import { sendSessionMessage } from '@/lib/actions/telemedicine'
import { useRouter } from 'next/navigation'

interface SessionDetailChatProps {
  sessionId: string
  messages: ChatMessage[]
  currentUserId: string
  disabled: boolean
}

export function SessionDetailChat({
  sessionId,
  messages,
  currentUserId,
  disabled,
}: SessionDetailChatProps) {
  const router = useRouter()
  const [, startTransition] = useTransition()

  const handleSendMessage = (content: string) => {
    startTransition(async () => {
      await sendSessionMessage(sessionId, content, 'text')
      router.refresh()
    })
  }

  return (
    <SessionChat
      messages={messages}
      currentUserId={currentUserId}
      onSendMessage={handleSendMessage}
      disabled={disabled}
    />
  )
}
