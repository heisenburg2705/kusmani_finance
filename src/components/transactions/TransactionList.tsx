import { Transaction } from '@types'
import { useDeleteTransaction } from '@hooks/useTransactions'
import {
  formatRupiah,
  formatDateShort,
  getTransactionTypeColor,
  getTransactionTypeSign,
  formatTransactionType,
} from '@lib/formatters'

interface TransactionListProps {
  transactions: Transaction[]
  pocketId: string
}

export function TransactionList({ transactions, pocketId }: TransactionListProps) {
  const { mutate: deleteTransaction } = useDeleteTransaction()

  if (transactions.length === 0) {
    return (
      <div className="card text-center py-8">
        <p className="text-slate-600">Belum ada transaksi</p>
      </div>
    )
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Riwayat Transaksi</h3>

      <div className="space-y-2 divide-y divide-slate-200">
        {transactions.map((transaction) => (
          <div
            key={transaction.id}
            className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div>
                  <p className="font-medium text-slate-900">{transaction.description}</p>
                  <p className="text-xs text-slate-500">{formatDateShort(transaction.date)}</p>
                </div>
              </div>
            </div>

            <div className="text-right">
              <p className={`font-semibold ${getTransactionTypeColor(transaction.type)}`}>
                {getTransactionTypeSign(transaction.type)} {formatRupiah(transaction.amount)}
              </p>
              <p className="text-xs text-slate-500">{formatTransactionType(transaction.type)}</p>
            </div>

            <button
              onClick={() => {
                if (
                  window.confirm(
                    `Hapus transaksi "${transaction.description}"? Tindakan ini tidak bisa dibatalkan.`
                  )
                ) {
                  deleteTransaction({
                    transactionId: transaction.id,
                    pocketId,
                  })
                }
              }}
              className="ml-4 text-red-600 hover:text-red-700 text-xs px-2 py-1 rounded hover:bg-red-50"
            >
              Hapus
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
