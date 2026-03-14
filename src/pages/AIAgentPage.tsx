import { useState } from 'react'
import { usePockets } from '@hooks/usePockets'
import { AgentChat } from '@components/ai-agent/AgentChat'

export function AIAgentPage() {
  const { data: pockets = [] } = usePockets()
  const [selectedPocketId, setSelectedPocketId] = useState<string | null>(
    pockets.length > 0 ? pockets[0].id : null
  )

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-slate-900">🤖 AI Financial Agent</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Pocket Selector */}
        {pockets.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Active Pocket (untuk tool execution)
            </label>
            <select
              value={selectedPocketId || ''}
              onChange={(e) => setSelectedPocketId(e.target.value)}
              className="input-field max-w-xs"
            >
              {pockets.map((pocket) => (
                <option key={pocket.id} value={pocket.id}>
                  {pocket.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Chat Agent */}
        <div className="h-[600px]">
          <AgentChat selectedPocketId={selectedPocketId || undefined} />
        </div>

        {/* Info Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card">
            <h3 className="font-semibold text-slate-900 mb-3">📋 Available Commands</h3>
            <ul className="text-sm text-slate-600 space-y-2">
              <li>• "Catat [type] [amount] [description]" → Create transaction</li>
              <li>• "Berapa saldo saya?" → Check balance</li>
              <li>• "Analisis pengeluaran [days] hari" → Analyze spending</li>
              <li>• "Kategori apa saja?" → List categories</li>
            </ul>
          </div>

          <div className="card">
            <h3 className="font-semibold text-slate-900 mb-3">⚙️ How It Works</h3>
            <p className="text-sm text-slate-600 space-y-2">
              <div>AI agent menggunakan Groq (development) atau Claude (production) untuk processing natural language dan execute tools.</div>
              <div>Setiap tool execution membutuhkan konfirmasi untuk destructive operations.</div>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
