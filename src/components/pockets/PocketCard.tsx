import { Pocket } from '@types/index'
import { formatRupiah } from '@lib/formatters'

interface PocketCardProps {
  pocket: Pocket
  onClick?: () => void
  isSelected?: boolean
}

export function PocketCard({ pocket, onClick, isSelected }: PocketCardProps) {
  return (
    <div
      onClick={onClick}
      className={`card cursor-pointer transition-all ${
        isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-lg font-semibold text-slate-900">{pocket.name}</h3>
        {pocket.is_shared && (
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">Shared</span>
        )}
      </div>

      {pocket.description && <p className="text-sm text-slate-600 mb-3">{pocket.description}</p>}

      <div className="pt-3 border-t border-slate-200">
        <p className="text-2xl font-bold text-slate-900">{formatRupiah(pocket.balance)}</p>
      </div>
    </div>
  )
}
