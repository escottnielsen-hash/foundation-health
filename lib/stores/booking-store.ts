import { create } from 'zustand'
import type { ServiceCatalog, PhysicianProfile, Profile } from '@/types/database'

// ============================================
// Types
// ============================================

export interface ProviderWithProfile extends PhysicianProfile {
  profile: Pick<Profile, 'first_name' | 'last_name' | 'avatar_url'>
}

export type BookingStep = 1 | 2 | 3 | 4

interface BookingState {
  // Selections
  selectedService: ServiceCatalog | null
  selectedProvider: ProviderWithProfile | null
  selectedDate: string | null
  selectedTime: string | null
  notes: string

  // Navigation
  currentStep: BookingStep

  // Actions
  setService: (service: ServiceCatalog) => void
  setProvider: (provider: ProviderWithProfile) => void
  setDateTime: (date: string, time: string) => void
  setNotes: (notes: string) => void
  nextStep: () => void
  prevStep: () => void
  reset: () => void
}

// ============================================
// Store
// ============================================

const initialState = {
  selectedService: null,
  selectedProvider: null,
  selectedDate: null,
  selectedTime: null,
  notes: '',
  currentStep: 1 as BookingStep,
}

export const useBookingStore = create<BookingState>((set) => ({
  ...initialState,

  setService: (service) => {
    set({ selectedService: service })
  },

  setProvider: (provider) => {
    set({ selectedProvider: provider })
  },

  setDateTime: (date, time) => {
    set({ selectedDate: date, selectedTime: time })
  },

  setNotes: (notes) => {
    set({ notes })
  },

  nextStep: () => {
    set((state) => {
      const next = (state.currentStep + 1) as BookingStep
      if (next > 4) return state
      return { currentStep: next }
    })
  },

  prevStep: () => {
    set((state) => {
      const prev = (state.currentStep - 1) as BookingStep
      if (prev < 1) return state
      return { currentStep: prev }
    })
  },

  reset: () => {
    set(initialState)
  },
}))
