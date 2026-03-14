import { Transaction } from '@types/index'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface SpendingChartProps {
  transactions: Transaction[]
}

export function SpendingChart({ transactions }: SpendingChartProps) {
  // Group transactions by type
  const chartData = [
    {
      name: 'Pemasukan',
      amount: transactions
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0),
    },
    {
      name: 'Pengeluaran',
      amount: transactions
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0),
    },
  ]

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Ringkasan Transaksi</h3>

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              formatter={(value) => `Rp ${value.toLocaleString('id-ID')}`}
            />
            <Legend />
            <Bar dataKey="amount" fill="#3B82F6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Stats */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="p-3 bg-green-50 rounded">
          <p className="text-xs text-slate-600">Total Pemasukan</p>
          <p className="text-lg font-bold text-green-600">
            Rp{' '}
            {transactions
              .filter((t) => t.type === 'income')
              .reduce((sum, t) => sum + t.amount, 0)
              .toLocaleString('id-ID')}
          </p>
        </div>
        <div className="p-3 bg-red-50 rounded">
          <p className="text-xs text-slate-600">Total Pengeluaran</p>
          <p className="text-lg font-bold text-red-600">
            Rp{' '}
            {transactions
              .filter((t) => t.type === 'expense')
              .reduce((sum, t) => sum + t.amount, 0)
              .toLocaleString('id-ID')}
          </p>
        </div>
      </div>
    </div>
  )
}
