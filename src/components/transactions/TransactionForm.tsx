import { useState } from 'react'
import { TransactionFormData, TransactionType } from '@types/index'
import { useCreateTransaction } from '@hooks/useTransactions'
import { formatDateISO } from '@lib/formatters'

interface TransactionFormProps {
  pocketId: string
  onSuccess?: () => void
}

export function TransactionForm({ pocketId, onSuccess }: TransactionFormProps) {
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<TransactionType>('expense')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(formatDateISO(new Date()))

  const { mutate: createTransaction, isPending } = useCreateTransaction()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!amount || !description) {
      alert('Harap isi semua field')
      return
    }

    const data: TransactionFormData = {
      amount: parseFloat(amount),
      type,
      description,
      date,
    }

    createTransaction(
      { pocketId, data },
      {
        onSuccess: () => {
          setAmount('')
          setDescription('')
          setType('expense')
          setDate(formatDateISO(new Date()))
          onSuccess?.()
        },
      }
    )
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Tambah Transaksi</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tipe</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as TransactionType)}
              className="input-field"
              disabled={isPending}
            >
              <option value="expense">Pengeluaran</option>
              <option value="income">Pemasukan</option>
              <option value="transfer">Transfer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Jumlah (Rp)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input-field"
              placeholder="0"
              disabled={isPending}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input-field"
            placeholder="Misal: Makan siang"
            disabled={isPending}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input-field"
            disabled={isPending}
            required
          />
        </div>

        <button
          type="submit"
          className="btn-primary w-full"
          disabled={isPending}
        >
          {isPending ? 'Menyimpan...' : 'Simpan Transaksi'}
        </button>
      </form>
    </div>
  )
}
