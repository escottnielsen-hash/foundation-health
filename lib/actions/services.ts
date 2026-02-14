'use server'

import { createClient } from '@/lib/supabase/server'
import { serviceFilterSchema, serviceIdSchema } from '@/lib/validations/services'
import type { ServiceFilterData } from '@/lib/validations/services'
import type { ServiceCatalog } from '@/types/database'
import { ZodError } from 'zod'

// ============================================
// Result types
// ============================================

interface ActionSuccess<T> {
  success: true
  data: T
}

interface ActionError {
  success: false
  error: string
}

type ActionResult<T> = ActionSuccess<T> | ActionError

// ============================================
// getServices — fetch services with optional filters
// ============================================

export async function getServices(
  filters?: ServiceFilterData
): Promise<ActionResult<ServiceCatalog[]>> {
  try {
    // Validate filters if provided
    if (filters) {
      const filterResult = serviceFilterSchema.safeParse(filters)
      if (!filterResult.success) {
        const firstIssue = (filterResult.error as ZodError).issues[0]
        return {
          success: false,
          error: firstIssue?.message ?? 'Invalid filter parameters.',
        }
      }
    }

    const supabase = await createClient()

    let query = supabase
      .from('service_catalog')
      .select('*')
      .eq('is_active', true)

    // Filter by category
    if (filters?.category && filters.category !== '') {
      query = query.eq('category', filters.category)
    }

    // Search by name
    if (filters?.search && filters.search !== '') {
      query = query.ilike('name', `%${filters.search}%`)
    }

    // Sort
    if (filters?.sort_by) {
      switch (filters.sort_by) {
        case 'price_asc':
          query = query.order('base_price', { ascending: true })
          break
        case 'price_desc':
          query = query.order('base_price', { ascending: false })
          break
        case 'name_asc':
          query = query.order('name', { ascending: true })
          break
        case 'name_desc':
          query = query.order('name', { ascending: false })
          break
        default:
          query = query.order('sort_order', { ascending: true }).order('name', { ascending: true })
      }
    } else {
      query = query.order('sort_order', { ascending: true }).order('name', { ascending: true })
    }

    const { data, error } = await query

    if (error) {
      return {
        success: false,
        error: 'Could not load services. Please try again.',
      }
    }

    return { success: true, data: (data ?? []) as ServiceCatalog[] }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred while loading services.',
    }
  }
}

// ============================================
// getServiceById — full service detail
// ============================================

export async function getServiceById(
  serviceId: string
): Promise<ActionResult<ServiceCatalog>> {
  try {
    // Validate the service ID
    const idResult = serviceIdSchema.safeParse({ id: serviceId })
    if (!idResult.success) {
      const firstIssue = (idResult.error as ZodError).issues[0]
      return {
        success: false,
        error: firstIssue?.message ?? 'Invalid service ID.',
      }
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('service_catalog')
      .select('*')
      .eq('id', serviceId)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      return {
        success: false,
        error: 'Service not found or is no longer available.',
      }
    }

    return { success: true, data: data as ServiceCatalog }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred while loading the service.',
    }
  }
}

// ============================================
// getServiceCategories — distinct categories
// ============================================

export async function getServiceCategories(): Promise<ActionResult<string[]>> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('service_catalog')
      .select('category')
      .eq('is_active', true)
      .not('category', 'is', null)

    if (error) {
      return {
        success: false,
        error: 'Could not load service categories.',
      }
    }

    const categories = [
      ...new Set(
        (data ?? [])
          .map((d) => (d as unknown as { category: string | null }).category)
          .filter((c): c is string => c !== null && c !== '')
      ),
    ].sort()

    return { success: true, data: categories }
  } catch {
    return {
      success: false,
      error: 'An unexpected error occurred while loading categories.',
    }
  }
}
