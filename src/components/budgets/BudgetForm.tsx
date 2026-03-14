import { useState } from 'react'
import { useCreateBudget } from '@hooks/useBudgets'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@lib/supabase'
import { BudgetPeriod, Category } from '@types'

interface BudgetFormProps {
  pocketId: string
  onSuccess?: () => void
}

export function BudgetForm({ pocketId, onSuccess }: BudgetFormProps) {
  const [amount, setAmount] = useState('')
  const [period, setPeriod] = useState<BudgetPeriod>('monthly')
  const [categoryId, setCategoryId] = useState<string | null>(null)

  const { data: categories = [] } = useQuery({
    queryKey: ['categories', pocketId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('type', 'expense')
        .or(`pocket_id.is.null,pocket_id.eq.${pocketId}`)

      if (error) throw error
      return data as Category[]
    },
  })

  const { mutate: createBudget, isPending } = useCreateBudget()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!amount) {
      alert('Jumlah budget harus diisi')
      return
    }

    createBudget(
      {
        pocketId,
        categoryId: categoryId || null,
        amount: parseFloat(amount),
        period,
      },
      {
        onSuccess: () => {
          setAmount('')
          setPeriod('monthly')
          setCategoryId(null)
          onSuccess?.()
        },
      }
    )
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Set Budget</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Kategori (Opsional)
          </label>
          <select
            value={categoryId || ''}
            onChange={(e) => setCategoryId(e.target.value || null)}
            className="input-field"
            disabled={isPending}
          >
            <option value="">Overall Budget</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Jumlah Budget (Rp)
          </label>
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

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Periode</label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as BudgetPeriod)}
            className="input-field"
            disabled={isPending}
          >
            <option value="daily">Harian</option>
            <option value="weekly">Mingguan</option>
            <option value="monthly">Bulanan</option>
            <option value="yearly">Tahunan</option>
          </select>
        </div>

        <button
          type="submit"
          className="btn-primary w-full"
          disabled={isPending}
        >
          {isPending ? 'Menyimpan...' : 'Set Budget'}
        </button>
      </form>
    </div>
  )
}
