import { useState } from 'react'
import { useAuditLogs } from '@hooks/useAuditLogs'
import { AuditLogsTable } from '@components/audit/AuditLogsTable'

const TABLE_NAMES = [
  'pockets',
  'pocket_members',
  'transactions',
  'categories',
  'budgets',
  'ai_conversations',
]

const ACTIONS = ['INSERT', 'UPDATE', 'DELETE', 'AI_AGENT']

export function AuditLogsPage() {
  const [selectedTable, setSelectedTable] = useState<string | undefined>()
  const [selectedAction, setSelectedAction] = useState<string | undefined>()

  const { data: logs = [], isLoading } = useAuditLogs({
    tableName: selectedTable,
    action: selectedAction,
    limit: 100,
  })

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-slate-900">📋 Audit Logs</h1>
          <p className="text-sm text-slate-600 mt-1">
            Complete activity history for security and compliance
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Filters */}
        <div className="card mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Filters</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Table</label>
              <select
                value={selectedTable || ''}
                onChange={(e) => setSelectedTable(e.target.value || undefined)}
                className="input-field"
              >
                <option value="">All Tables</option>
                {TABLE_NAMES.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Action</label>
              <select
                value={selectedAction || ''}
                onChange={(e) => setSelectedAction(e.target.value || undefined)}
                className="input-field"
              >
                <option value="">All Actions</option>
                {ACTIONS.map((action) => (
                  <option key={action} value={action}>
                    {action}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <AuditLogsTable logs={logs} isLoading={isLoading} />

        {/* Info */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card">
            <h3 className="font-semibold text-slate-900 mb-2">🔒 Security</h3>
            <p className="text-sm text-slate-600">
              Semua akses dan modifikasi dicatat immutably untuk compliance dan security.
            </p>
          </div>

          <div className="card">
            <h3 className="font-semibold text-slate-900 mb-2">🛡️ Immutable</h3>
            <p className="text-sm text-slate-600">
              Audit logs tidak dapat didelete atau diupdate oleh siapapun, termasuk admin.
            </p>
          </div>

          <div className="card">
            <h3 className="font-semibold text-slate-900 mb-2">🤖 AI Tracked</h3>
            <p className="text-sm text-slate-600">
              Semua tool execution dari AI Agent juga dicatat dengan detail lengkap.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
