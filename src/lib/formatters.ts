/**
 * Format number as Indonesian Rupiah
 * Example: 1500000 → "Rp 1.500.000"
 */
export const formatRupiah = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined) {
    return 'Rp 0'
  }

  const formatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })

  return formatter.format(amount)
}

/**
 * Format date to Indonesian locale
 * Example: 2024-01-15 → "15 Januari 2024"
 */
export const formatDateIndonesian = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  const formatter = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  return formatter.format(d)
}

/**
 * Format date to short format
 * Example: 2024-01-15 → "15 Jan 2024"
 */
export const formatDateShort = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  const formatter = new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
  return formatter.format(d)
}

/**
 * Format date to ISO format (YYYY-MM-DD)
 */
export const formatDateISO = (date: Date): string => {
  return date.toISOString().split('T')[0]
}

/**
 * Parse date string to Date object
 */
export const parseDate = (dateString: string): Date => {
  return new Date(dateString)
}

/**
 * Get relative time string
 * Example: "2 hours ago", "3 days ago"
 */
export const getRelativeTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSeconds < 60) return 'baru saja'
  if (diffMinutes < 60) return `${diffMinutes} menit yang lalu`
  if (diffHours < 24) return `${diffHours} jam yang lalu`
  if (diffDays < 30) return `${diffDays} hari yang lalu`

  return formatDateShort(d)
}

/**
 * Format transaction type to Indonesian
 */
export const formatTransactionType = (type: 'income' | 'expense' | 'transfer'): string => {
  const types: Record<string, string> = {
    income: 'Pemasukan',
    expense: 'Pengeluaran',
    transfer: 'Transfer',
  }
  return types[type] || type
}

/**
 * Get transaction type color
 */
export const getTransactionTypeColor = (type: 'income' | 'expense' | 'transfer'): string => {
  const colors: Record<string, string> = {
    income: 'text-green-600',
    expense: 'text-red-600',
    transfer: 'text-blue-600',
  }
  return colors[type] || 'text-gray-600'
}

/**
 * Get transaction type sign (+/-)
 */
export const getTransactionTypeSign = (type: 'income' | 'expense' | 'transfer'): string => {
  const signs: Record<string, string> = {
    income: '+',
    expense: '-',
    transfer: '→',
  }
  return signs[type] || ''
}

/**
 * Format percentage
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`
}
