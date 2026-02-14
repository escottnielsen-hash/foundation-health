import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ============================================
// Types
// ============================================

export interface ChecklistItem {
  id: string
  label: string
  checked: boolean
}

export interface ChecklistCategory {
  id: string
  title: string
  description: string
  items: ChecklistItem[]
}

interface ChecklistState {
  categories: ChecklistCategory[]
  toggleItem: (categoryId: string, itemId: string) => void
  resetChecklist: () => void
  getProgress: () => { completed: number; total: number; percentage: number }
}

// ============================================
// Default checklist data
// ============================================

const defaultCategories: ChecklistCategory[] = [
  {
    id: 'documents',
    title: 'Documents & Identification',
    description: 'Essential paperwork to bring with you',
    items: [
      { id: 'doc-insurance-card', label: 'Insurance card (front and back copies)', checked: false },
      { id: 'doc-photo-id', label: 'Government-issued photo ID', checked: false },
      { id: 'doc-referral', label: 'Referral letter from primary care physician', checked: false },
      { id: 'doc-medical-records', label: 'Relevant medical records and history', checked: false },
      { id: 'doc-advance-directive', label: 'Advance directive or healthcare proxy (if applicable)', checked: false },
      { id: 'doc-insurance-preauth', label: 'Insurance pre-authorization documentation', checked: false },
    ],
  },
  {
    id: 'medical',
    title: 'Medical Preparation',
    description: 'Medical information and items for your care team',
    items: [
      { id: 'med-medications-list', label: 'Complete list of current medications and dosages', checked: false },
      { id: 'med-allergy-info', label: 'Allergy information (medications, latex, anesthesia)', checked: false },
      { id: 'med-imaging', label: 'Recent imaging (X-rays, MRIs, CT scans) on disc or digital', checked: false },
      { id: 'med-surgical-history', label: 'Previous surgical history documentation', checked: false },
      { id: 'med-current-meds', label: 'Current medications packed in original containers', checked: false },
      { id: 'med-physician-notes', label: 'Notes or questions for your physician', checked: false },
      { id: 'med-fasting', label: 'Confirm pre-procedure fasting instructions (if surgical)', checked: false },
    ],
  },
  {
    id: 'travel',
    title: 'Travel & Accommodations',
    description: 'Logistics for your healthcare journey',
    items: [
      { id: 'travel-flight', label: 'Flight or travel arrangements confirmed', checked: false },
      { id: 'travel-hotel', label: 'Hotel or accommodation reservation confirmed', checked: false },
      { id: 'travel-ground', label: 'Ground transportation arranged (rental car, shuttle, or private car)', checked: false },
      { id: 'travel-companion', label: 'Travel companion arrangements finalized (if needed for post-op)', checked: false },
      { id: 'travel-clinic-address', label: 'Foundation Health clinic address and directions saved', checked: false },
      { id: 'travel-emergency-contacts', label: 'Emergency contact information shared with travel companion', checked: false },
    ],
  },
  {
    id: 'post-op',
    title: 'Post-Operative & Recovery',
    description: 'Preparing for a comfortable recovery',
    items: [
      { id: 'post-ice-packs', label: 'Ice packs or cold therapy device', checked: false },
      { id: 'post-comfortable-clothing', label: 'Loose, comfortable clothing for post-procedure days', checked: false },
      { id: 'post-mobility-aids', label: 'Mobility aids arranged (crutches, walker, or wheelchair if needed)', checked: false },
      { id: 'post-helper', label: 'Recovery helper or caregiver identified for first 48-72 hours', checked: false },
      { id: 'post-prescriptions', label: 'Plan for filling post-procedure prescriptions', checked: false },
      { id: 'post-entertainment', label: 'Books, devices, or entertainment for rest days', checked: false },
      { id: 'post-follow-up', label: 'Follow-up appointment scheduled or plan confirmed', checked: false },
      { id: 'post-home-prep', label: 'Home prepared for return (grab bars, shower seat if needed)', checked: false },
    ],
  },
]

// ============================================
// Store
// ============================================

export const useChecklistStore = create<ChecklistState>()(
  persist(
    (set, get) => ({
      categories: defaultCategories,

      toggleItem: (categoryId: string, itemId: string) => {
        set((state) => ({
          categories: state.categories.map((category) => {
            if (category.id !== categoryId) return category
            return {
              ...category,
              items: category.items.map((item) => {
                if (item.id !== itemId) return item
                return { ...item, checked: !item.checked }
              }),
            }
          }),
        }))
      },

      resetChecklist: () => {
        set({
          categories: defaultCategories.map((category) => ({
            ...category,
            items: category.items.map((item) => ({ ...item, checked: false })),
          })),
        })
      },

      getProgress: () => {
        const state = get()
        const allItems = state.categories.flatMap((c) => c.items)
        const total = allItems.length
        const completed = allItems.filter((item) => item.checked).length
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
        return { completed, total, percentage }
      },
    }),
    {
      name: 'foundation-health-checklist',
    }
  )
)
