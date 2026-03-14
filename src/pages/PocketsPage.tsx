import { useState } from 'react'
import { usePockets } from '@hooks/usePockets'
import { useAuth } from '@hooks/useAuth'
import { PocketCard } from '@components/pockets/PocketCard'
import { PocketForm } from '@components/pockets/PocketForm'
import { MemberList } from '@components/pockets/MemberList'

export function PocketsPage() {
  const { user } = useAuth()
  const { data: pockets = [], isLoading } = usePockets()
  const [selectedPocketId, setSelectedPocketId] = useState<string | null>(null)

  const selectedPocket = pockets.find((p) => p.id === selectedPocketId)
  const isOwner = selectedPocket?.owner_id === user?.id

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-slate-900">💰 Pockets</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {isLoading ? (
          <p className="text-center text-slate-600">Loading pockets...</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Section */}
            <div>
              <PocketForm />
            </div>

            {/* List Section */}
            <div className="lg:col-span-2">
              {pockets.length === 0 ? (
                <div className="card text-center py-12">
                  <p className="text-slate-600 mb-4">Belum ada pocket. Buat yang pertama!</p>
                </div>
              ) : (
                <>
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">Pocket Kamu</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {pockets.map((pocket) => (
                      <PocketCard
                        key={pocket.id}
                        pocket={pocket}
                        onClick={() => setSelectedPocketId(pocket.id)}
                        isSelected={selectedPocketId === pocket.id}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Selected Pocket Details */}
        {selectedPocket && (
          <div className="mt-8 pt-8 border-t border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">{selectedPocket.name} - Members</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <MemberList pocketId={selectedPocket.id} isOwner={isOwner} />
              </div>
              <div className="card">
                <h3 className="font-semibold text-slate-900 mb-3">Info Pocket</h3>
                <div className="space-y-2 text-sm text-slate-600">
                  <p>
                    <strong>Nama:</strong> {selectedPocket.name}
                  </p>
                  {selectedPocket.description && (
                    <p>
                      <strong>Deskripsi:</strong> {selectedPocket.description}
                    </p>
                  )}
                  <p>
                    <strong>Status Sharing:</strong> {selectedPocket.is_shared ? 'Aktif' : 'Tidak aktif'}
                  </p>
                  <p>
                    <strong>Peran Kamu:</strong> {isOwner ? 'Owner' : 'Member'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
