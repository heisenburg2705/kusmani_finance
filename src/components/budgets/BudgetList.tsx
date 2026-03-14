import { useBudgets, useDeleteBudget } from '@hooks/useBudgets'
import { formatRupiah } from '@lib/formatters'

interface BudgetListProps {
  pocketId: string
}

export function BudgetList({ pocketId }: BudgetListProps) {
  const { data: budgets = [], isLoading } = useBudgets(pocketId)
  const { mutate: deleteBudget } = useDeleteBudget()

  if (isLoading) {
    return <p className="text-slate-600">Loading budgets...</p>
  }

  if (budgets.length === 0) {
    return (
      <div className="card text-center py-6">
        <p className="text-slate-600">Belum ada budget</p>
      </div>
    )
  }

  const periodLabels: Record<string, string> = {
    daily: 'Harian',
    weekly: 'Mingguan',
    monthly: 'Bulanan',
    yearly: 'Tahunan',
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Budget List</h3>

      <div className="space-y-3 divide-y divide-slate-200">
        {budgets.map((budget) => (
          <div key={budget.id} className="py-3 flex items-center justify-between">
            <div className="flex-1">
              <p className="font-medium text-slate-900">
                {budget.category_id ? `Category Budget` : 'Overall Budget'}
              </p>
              <p className="text-sm text-slate-600">
                {formatRupiah(budget.amount)} / {periodLabels[budget.period]}
              </p>
            </div>

            <button
              onClick={() => {
                if (window.confirm('Hapus budget ini? Tindakan ini tidak bisa dibatalkan.')) {
                  deleteBudget({ budgetId: budget.id, pocketId })
                }
              }}
              className="text-red-600 hover:text-red-700 text-xs px-2 py-1 rounded hover:bg-red-50"
            >
              Hapus
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
