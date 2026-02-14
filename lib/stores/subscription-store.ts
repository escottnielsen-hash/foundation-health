import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'
import type { MembershipTierKey } from '@/lib/constants/membership'

interface SubscriptionState {
  currentTier: MembershipTierKey | null
  status: 'active' | 'past_due' | 'cancelled' | 'trialing' | null
  currentPeriodEnd: string | null
  loading: boolean
  fetchSubscription: () => Promise<void>
  setSubscription: (data: {
    currentTier: MembershipTierKey | null
    status: 'active' | 'past_due' | 'cancelled' | 'trialing' | null
    currentPeriodEnd: string | null
  }) => void
}

export const useSubscriptionStore = create<SubscriptionState>((set) => ({
  currentTier: null,
  status: null,
  currentPeriodEnd: null,
  loading: false,

  fetchSubscription: async () => {
    set({ loading: true })

    try {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        set({
          currentTier: null,
          status: null,
          currentPeriodEnd: null,
          loading: false,
        })
        return
      }

      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .select('tier, status, current_period_end')
        .eq('user_id', user.id)
        .single()

      if (error || !subscription) {
        set({
          currentTier: null,
          status: null,
          currentPeriodEnd: null,
          loading: false,
        })
        return
      }

      set({
        currentTier: (subscription.tier as MembershipTierKey) ?? null,
        status: subscription.status as SubscriptionState['status'],
        currentPeriodEnd: subscription.current_period_end ?? null,
        loading: false,
      })
    } catch (err) {
      console.error('Error fetching subscription:', err)
      set({
        currentTier: null,
        status: null,
        currentPeriodEnd: null,
        loading: false,
      })
    }
  },

  setSubscription: (data) => {
    set({
      currentTier: data.currentTier,
      status: data.status,
      currentPeriodEnd: data.currentPeriodEnd,
    })
  },
}))
