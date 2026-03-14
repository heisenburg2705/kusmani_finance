import { AuditLog } from '@types/index'
import { formatDateShort } from '@lib/formatters'

interface AuditLogsTableProps {
  logs: AuditLog[]
  isLoading: boolean
}

export function AuditLogsTable({ logs, isLoading }: AuditLogsTableProps) {
  if (isLoading) {
    return <p className="text-slate-600">Loading audit logs...</p>
  }

  if (logs.length === 0) {
    return (
      <div className="card text-center py-8">
        <p className="text-slate-600">Belum ada audit logs</p>
      </div>
    )
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'INSERT':
        return 'text-green-600 bg-green-50'
      case 'UPDATE':
        return 'text-blue-600 bg-blue-50'
      case 'DELETE':
        return 'text-red-600 bg-red-50'
      case 'AI_AGENT':
        return 'text-purple-600 bg-purple-50'
      default:
        return 'text-slate-600 bg-slate-50'
    }
  }

  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-slate-200">
          <tr className="bg-slate-50">
            <th className="px-4 py-2 text-left font-semibold text-slate-900">Time</th>
            <th className="px-4 py-2 text-left font-semibold text-slate-900">Table</th>
            <th className="px-4 py-2 text-left font-semibold text-slate-900">Action</th>
            <th className="px-4 py-2 text-left font-semibold text-slate-900">User</th>
            <th className="px-4 py-2 text-left font-semibold text-slate-900">Record ID</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {logs.map((log) => (
            <tr key={log.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 text-slate-600">{formatDateShort(log.created_at)}</td>
              <td className="px-4 py-3 font-mono text-xs text-slate-600">{log.table_name}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${getActionColor(log.action)}`}>
                  {log.action}
                </span>
              </td>
              <td className="px-4 py-3 font-mono text-xs text-slate-600">
                {log.user_id ? log.user_id.slice(0, 8) : 'System'}
              </td>
              <td className="px-4 py-3 font-mono text-xs text-slate-600">
                {log.record_id ? log.record_id.slice(0, 8) : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
