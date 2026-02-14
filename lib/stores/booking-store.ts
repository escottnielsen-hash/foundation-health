import { create } from 'zustand'
import type { ServiceCatalog, PhysicianProfile, Profile, Location } from '@/types/database'

// ============================================
// Types
// ============================================

export interface ProviderWithProfile extends PhysicianProfile {
  profile: Pick<Profile, 'first_name' | 'last_name' | 'avatar_url'>
}

export type BookingStep = 1 | 2 | 3 | 4 | 5

/** Minimal location data needed during the booking flow */
export interface BookingLocation extends Pick<
  Location,
  'id' | 'name' | 'location_type' | 'city' | 'state' | 'address_line1' | 'address_line2' | 'zip_code' | 'phone' | 'is_active'
> {}

interface BookingState {
  // Selections
  selectedLocation: BookingLocation | null
  selectedService: ServiceCatalog | null
  selectedProvider: ProviderWithProfile | null
  selectedDate: string | null
  selectedTime: string | null
  notes: string

  // Navigation
  currentStep: BookingStep

  // Actions
  setLocation: (location: BookingLocation | null) => void
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
  selectedLocation: null,
  selectedService: null,
  selectedProvider: null,
  selectedDate: null,
  selectedTime: null,
  notes: '',
  currentStep: 1 as BookingStep,
}

export const useBookingStore = create<BookingState>((set) => ({
  ...initialState,

  setLocation: (location) => {
    set({
      selectedLocation: location,
      // When location changes, clear downstream selections
      selectedService: null,
      selectedProvider: null,
      selectedDate: null,
      selectedTime: null,
    })
  },

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
      if (next > 5) return state
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
