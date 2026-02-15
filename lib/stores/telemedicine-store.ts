import { create } from 'zustand'
import type { TelemedicineSession, TelemedicineMessage } from '@/types/database'

// ============================================
// Types
// ============================================

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'failed'

export interface TelemedicineMessageWithSender extends TelemedicineMessage {
  sender_first_name: string | null
  sender_last_name: string | null
  sender_avatar_url: string | null
}

interface TelemedicineState {
  // Active session data
  activeSession: TelemedicineSession | null
  messages: TelemedicineMessageWithSender[]

  // Connection state
  connectionStatus: ConnectionStatus
  isMicEnabled: boolean
  isCameraEnabled: boolean
  isScreenSharing: boolean
  isChatOpen: boolean

  // Consent
  hasGivenConsent: boolean

  // Actions — session lifecycle
  setActiveSession: (session: TelemedicineSession | null) => void
  clearActiveSession: () => void

  // Actions — messages
  setMessages: (messages: TelemedicineMessageWithSender[]) => void
  addMessage: (message: TelemedicineMessageWithSender) => void
  markMessageRead: (messageId: string) => void

  // Actions — connection controls
  setConnectionStatus: (status: ConnectionStatus) => void
  toggleMic: () => void
  toggleCamera: () => void
  toggleScreenSharing: () => void
  toggleChat: () => void

  // Actions — consent
  giveConsent: () => void

  // Actions — reset
  reset: () => void
}

// ============================================
// Initial state
// ============================================

const initialState = {
  activeSession: null as TelemedicineSession | null,
  messages: [] as TelemedicineMessageWithSender[],
  connectionStatus: 'disconnected' as ConnectionStatus,
  isMicEnabled: true,
  isCameraEnabled: true,
  isScreenSharing: false,
  isChatOpen: false,
  hasGivenConsent: false,
}

// ============================================
// Store
// ============================================

export const useTelemedicineStore = create<TelemedicineState>((set) => ({
  ...initialState,

  setActiveSession: (session) => {
    set({ activeSession: session })
  },

  clearActiveSession: () => {
    set({
      activeSession: null,
      messages: [],
      connectionStatus: 'disconnected',
      isMicEnabled: true,
      isCameraEnabled: true,
      isScreenSharing: false,
      isChatOpen: false,
      hasGivenConsent: false,
    })
  },

  setMessages: (messages) => {
    set({ messages })
  },

  addMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, message],
    }))
  },

  markMessageRead: (messageId) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === messageId ? { ...msg, is_read: true } : msg
      ),
    }))
  },

  setConnectionStatus: (status) => {
    set({ connectionStatus: status })
  },

  toggleMic: () => {
    set((state) => ({ isMicEnabled: !state.isMicEnabled }))
  },

  toggleCamera: () => {
    set((state) => ({ isCameraEnabled: !state.isCameraEnabled }))
  },

  toggleScreenSharing: () => {
    set((state) => ({ isScreenSharing: !state.isScreenSharing }))
  },

  toggleChat: () => {
    set((state) => ({ isChatOpen: !state.isChatOpen }))
  },

  giveConsent: () => {
    set({ hasGivenConsent: true })
  },

  reset: () => {
    set(initialState)
  },
}))
