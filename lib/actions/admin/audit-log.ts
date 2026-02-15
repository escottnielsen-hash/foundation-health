'use server'

import { createClient } from '@/lib/supabase/server'
import { auditLogFilterSchema } from '@/lib/validations/audit-log'
import type { AuditLogEntry, AuditLogStats } from '@/types/settings'

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
// Helper: verify admin role
// ============================================

async function verifyAdmin(): Promise<{ userId: string } | ActionError> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Not authenticated.' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return { success: false, error: 'Access denied. Admin role required.' }
  }

  return { userId: user.id }
}

// ============================================
// getAuditLogs — paginated audit log with filters
// ============================================

export interface AuditLogsResult {
  logs: AuditLogEntry[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export async function getAuditLogs(
  filters: Record<string, unknown> = {}
): Promise<ActionResult<AuditLogsResult>> {
  try {
    const adminCheck = await verifyAdmin()
    if ('success' in adminCheck) return adminCheck

    const parsed = auditLogFilterSchema.safeParse(filters)
    if (!parsed.success) {
      return { success: false, error: 'Invalid filter parameters.' }
    }

    const { date_from, date_to, user_id, action, table_name, page, per_page } = parsed.data
    const offset = (page - 1) * per_page

    const supabase = await createClient()

    let query = supabase
      .from('audit_logs')
      .select(`
        id,
        user_id,
        action,
        table_name,
        record_id,
        old_values,
        new_values,
        ip_address,
        user_agent,
        session_id,
        metadata,
        created_at,
        profiles!audit_logs_user_id_fkey(email, first_name, last_name)
      `, { count: 'exact' })

    // Apply filters
    if (date_from) {
      query = query.gte('created_at', `${date_from}T00:00:00.000Z`)
    }

    if (date_to) {
      query = query.lte('created_at', `${date_to}T23:59:59.999Z`)
    }

    if (user_id) {
      query = query.eq('user_id', user_id)
    }

    if (action) {
      query = query.eq('action', action)
    }

    if (table_name) {
      query = query.eq('table_name', table_name)
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + per_page - 1)

    const { data: logs, error, count } = await query

    if (error) {
      return { success: false, error: 'Failed to load audit logs.' }
    }

    const total = count ?? 0

    // Flatten the joined profile data
    const entries: AuditLogEntry[] = (logs ?? []).map((log) => {
      const rec = log as Record<string, unknown>
      const profiles = rec.profiles as {
        email: string
        first_name: string | null
        last_name: string | null
      } | null

      const { profiles: _removed, ...rest } = rec

      return {
        ...rest,
        user_email: profiles?.email ?? null,
        user_full_name: profiles
          ? `${profiles.first_name ?? ''} ${profiles.last_name ?? ''}`.trim() || null
          : null,
      } as AuditLogEntry
    })

    return {
      success: true,
      data: {
        logs: entries,
        total,
        page,
        per_page,
        total_pages: Math.ceil(total / per_page),
      },
    }
  } catch {
    return { success: false, error: 'An unexpected error occurred.' }
  }
}

// ============================================
// getAuditLogStats — summary statistics
// ============================================

export async function getAuditLogStats(): Promise<ActionResult<AuditLogStats>> {
  try {
    const adminCheck = await verifyAdmin()
    if ('success' in adminCheck) return adminCheck

    const supabase = await createClient()

    // Get total count
    const { count: totalEntries } = await supabase
      .from('audit_logs')
      .select('id', { count: 'exact', head: true })

    // Get counts by action — fetch all and count client side
    // (Supabase does not support GROUP BY natively via PostgREST)
    const { data: actionData } = await supabase
      .from('audit_logs')
      .select('action')

    const byAction: Record<string, number> = {}
    if (actionData) {
      for (const row of actionData) {
        const a = (row as { action: string }).action
        byAction[a] = (byAction[a] ?? 0) + 1
      }
    }

    return {
      success: true,
      data: {
        total_entries: totalEntries ?? 0,
        by_action: byAction,
      },
    }
  } catch {
    return { success: false, error: 'An unexpected error occurred.' }
  }
}
