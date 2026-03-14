import { formatRupiah } from '@lib/formatters'

interface BalanceCardProps {
  balance: number
  pocketName: string
}

export function BalanceCard({ balance, pocketName }: BalanceCardProps) {
  return (
    <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-lg shadow-lg p-6">
      <p className="text-blue-100 text-sm mb-2">{pocketName}</p>
      <h2 className="text-3xl font-bold">{formatRupiah(balance)}</h2>
      <p className="text-blue-100 text-sm mt-2">Saldo saat ini</p>
    </div>
  )
}
