'use client'

import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils/cn'
import { elementId } from '@/lib/utils/element-ids'
import { Send, Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { format } from 'date-fns'
import type { MessageType } from '@/types/database'

export interface ChatMessage {
  id: string
  sender_id: string
  sender_name: string
  message_type: MessageType
  content: string
  is_read: boolean
  created_at: string
}

interface SessionChatProps {
  messages: ChatMessage[]
  currentUserId: string
  onSendMessage: (content: string) => void
  disabled?: boolean
  className?: string
}

export function SessionChat({
  messages,
  currentUserId,
  onSendMessage,
  disabled = false,
  className,
}: SessionChatProps) {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = () => {
    const trimmed = input.trim()
    if (!trimmed || disabled) return
    onSendMessage(trimmed)
    setInput('')
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const formatMessageTime = (dateStr: string): string => {
    try {
      return format(new Date(dateStr), 'h:mm a')
    } catch {
      return ''
    }
  }

  return (
    <div
      id={elementId('telemedicine', 'chat', 'container')}
      className={cn(
        'flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm',
        className
      )}
    >
      {/* Chat header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-900">Session Chat</h3>
        <span className="text-xs text-gray-400">
          {messages.length} {messages.length === 1 ? 'message' : 'messages'}
        </span>
      </div>

      {/* Messages area */}
      <div
        id={elementId('telemedicine', 'chat', 'messages')}
        className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[400px]"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-gray-400">
            <Bot className="h-8 w-8 mb-2" />
            <p className="text-sm">No messages yet</p>
            <p className="text-xs mt-1">Send a message to start the conversation</p>
          </div>
        )}

        {messages.map((message) => {
          const isOwn = message.sender_id === currentUserId
          const isSystem = message.message_type === 'system'

          if (isSystem) {
            return (
              <div
                key={message.id}
                className="flex justify-center"
              >
                <div className="rounded-full bg-gray-100 px-4 py-1.5">
                  <p className="text-xs text-gray-500 italic">{message.content}</p>
                </div>
              </div>
            )
          }

          return (
            <div
              key={message.id}
              className={cn(
                'flex flex-col',
                isOwn ? 'items-end' : 'items-start'
              )}
            >
              <div className="flex items-end gap-2 max-w-[80%]">
                <div
                  className={cn(
                    'rounded-2xl px-4 py-2.5',
                    isOwn
                      ? 'bg-primary-600 text-white rounded-br-md'
                      : 'bg-gray-100 text-gray-900 rounded-bl-md'
                  )}
                >
                  {!isOwn && (
                    <p className="text-xs font-semibold text-primary-600 mb-0.5">
                      {message.sender_name}
                    </p>
                  )}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>
              </div>
              <span
                className={cn(
                  'text-[10px] text-gray-400 mt-1 px-1',
                  isOwn ? 'text-right' : 'text-left'
                )}
              >
                {formatMessageTime(message.created_at)}
              </span>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-gray-100 p-3">
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            id={elementId('telemedicine', 'chat', 'input')}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? 'Chat is disabled' : 'Type a message...'}
            disabled={disabled}
            className="flex-1 h-10 rounded-full px-4 text-sm"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={disabled || !input.trim()}
            className="h-10 w-10 rounded-full flex-shrink-0"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
