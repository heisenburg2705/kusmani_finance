import { useQuery } from '@tanstack/react-query'
import { supabase } from '@lib/supabase'
import { AuditLog } from '@types/index'

interface AuditLogsFilter {
  tableName?: string
  action?: string
  limit?: number
  offset?: number
}

/**
 * Get audit logs with optional filters
 */
export function useAuditLogs(filter?: AuditLogsFilter) {
  return useQuery({
    queryKey: ['audit-logs', filter],
    queryFn: async () => {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })

      if (filter?.tableName) {
        query = query.eq('table_name', filter.tableName)
      }

      if (filter?.action) {
        query = query.eq('action', filter.action)
      }

      const limit = filter?.limit || 50
      const offset = filter?.offset || 0

      query = query.range(offset, offset + limit - 1)

      const { data, error } = await query

      if (error) throw error
      return data as AuditLog[]
    },
  })
}

/**
 * Get audit logs for specific record
 */
export function useRecordAuditLogs(recordId: string | null) {
  return useQuery({
    queryKey: ['audit-logs-record', recordId],
    queryFn: async () => {
      if (!recordId) return []

      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('record_id', recordId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as AuditLog[]
    },
    enabled: !!recordId,
  })
}
