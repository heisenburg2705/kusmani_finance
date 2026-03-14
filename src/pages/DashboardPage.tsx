import { useEffect, useState } from 'react'
import { useAuth } from '@hooks/useAuth'
import { usePockets, useCreatePocket } from '@hooks/usePockets'
import { useTransactions } from '@hooks/useTransactions'
import { BalanceCard } from '@components/dashboard/BalanceCard'
import { TransactionForm } from '@components/transactions/TransactionForm'
import { TransactionList } from '@components/transactions/TransactionList'

export function DashboardPage() {
  const { user } = useAuth()
  const { data: pockets = [], isLoading: pocketsLoading } = usePockets()
  const { mutate: createPocket } = useCreatePocket()
  const [selectedPocketId, setSelectedPocketId] = useState<string | null>(null)
  const { data: transactions = [], isLoading: transactionsLoading } = useTransactions(
    selectedPocketId
  )

  // Auto-select first pocket or create default
  useEffect(() => {
    if (!pocketsLoading && pockets.length > 0) {
      setSelectedPocketId(pockets[0].id)
    } else if (!pocketsLoading && pockets.length === 0 && user) {
      // Create default pocket
      createPocket({
        name: 'Dompet Utama',
        description: 'Pocket default kamu',
        is_shared: false,
      })
    }
  }, [pockets, pocketsLoading, user, createPocket])

  const selectedPocket = pockets.find((p) => p.id === selectedPocketId)

  if (pocketsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-slate-600">Loading...</p>
      </div>
    )
  }

  return (
    <div>
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Pocket Selector */}
        {pockets.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Pilih Pocket
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

        {selectedPocket && (
          <>
            {/* Balance Card */}
            <div className="mb-8">
              <BalanceCard
                balance={selectedPocket.balance}
                pocketName={selectedPocket.name}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Section */}
              <div>
                <TransactionForm pocketId={selectedPocket.id} />
              </div>

              {/* List Section */}
              <div className="lg:col-span-2">
                {transactionsLoading ? (
                  <div className="card text-center py-8">
                    <p className="text-slate-600">Loading transaksi...</p>
                  </div>
                ) : (
                  <TransactionList transactions={transactions} pocketId={selectedPocket.id} />
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
