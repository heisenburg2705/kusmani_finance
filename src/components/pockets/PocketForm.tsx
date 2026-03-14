import { useState } from 'react'
import { useCreatePocket } from '@hooks/usePockets'
import { PocketFormData } from '@types'

interface PocketFormProps {
  onSuccess?: () => void
}

export function PocketForm({ onSuccess }: PocketFormProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isShared, setIsShared] = useState(false)
  const { mutate: createPocket, isPending } = useCreatePocket()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name) {
      alert('Nama pocket harus diisi')
      return
    }

    const data: PocketFormData = {
      name,
      description: description || undefined,
      is_shared: isShared,
    }

    createPocket(data, {
      onSuccess: () => {
        setName('')
        setDescription('')
        setIsShared(false)
        onSuccess?.()
      },
    })
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Buat Pocket Baru</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Nama Pocket</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field"
            placeholder="Misal: Dompet Kerja"
            disabled={isPending}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input-field"
            placeholder="Opsional: Deskripsi pocket ini"
            rows={3}
            disabled={isPending}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isShared"
            checked={isShared}
            onChange={(e) => setIsShared(e.target.checked)}
            className="w-4 h-4"
            disabled={isPending}
          />
          <label htmlFor="isShared" className="text-sm text-slate-700">
            Pocket ini bisa dishare dengan user lain
          </label>
        </div>

        <button
          type="submit"
          className="btn-primary w-full"
          disabled={isPending}
        >
          {isPending ? 'Membuat...' : 'Buat Pocket'}
        </button>
      </form>
    </div>
  )
}
