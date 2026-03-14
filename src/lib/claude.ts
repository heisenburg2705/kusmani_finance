import type { Tool } from './ai/types'

// Initialize Anthropic client - NOTE: Only use VITE_ prefix for client-side
// For production, move this to backend/edge function
export const createClaudeClient = () => {
  const apiKey = import.meta.env.VITE_CLAUDE_API_KEY
  if (!apiKey) {
    throw new Error('Missing VITE_CLAUDE_API_KEY environment variable')
  }
  const Anthropic = require('@anthropic-ai/sdk').default
  return new Anthropic({ apiKey })
}

/**
 * Define all AI Agent tools
 * These should match the available operations in the app
 */
export const aiTools: Tool[] = [
  {
    name: 'get_transactions',
    description: 'Ambil daftar transaksi dari pocket tertentu',
    input_schema: {
      type: 'object' as const,
      properties: {
        pocket_id: {
          type: 'string',
          description: 'ID pocket (UUID)',
        },
        limit: {
          type: 'number',
          description: 'Jumlah transaksi yang diambil (default 20)',
        },
        category_id: {
          type: 'string',
          description: 'Filter berdasarkan kategori (optional)',
        },
        start_date: {
          type: 'string',
          description: 'Filter dari tanggal (YYYY-MM-DD) (optional)',
        },
        end_date: {
          type: 'string',
          description: 'Filter hingga tanggal (YYYY-MM-DD) (optional)',
        },
      },
      required: ['pocket_id'],
    },
  },
  {
    name: 'create_transaction',
    description: 'Buat transaksi baru di pocket',
    input_schema: {
      type: 'object' as const,
      properties: {
        pocket_id: {
          type: 'string',
          description: 'ID pocket (UUID)',
        },
        amount: {
          type: 'number',
          description: 'Jumlah nominal (positif)',
        },
        type: {
          type: 'string',
          enum: ['income', 'expense', 'transfer'],
          description: 'Tipe transaksi',
        },
        category_id: {
          type: 'string',
          description: 'ID kategori (optional)',
        },
        description: {
          type: 'string',
          description: 'Deskripsi transaksi',
        },
        date: {
          type: 'string',
          description: 'Tanggal transaksi (YYYY-MM-DD, default hari ini)',
        },
      },
      required: ['pocket_id', 'amount', 'type', 'description'],
    },
  },
  {
    name: 'get_balance',
    description: 'Ambil saldo pocket',
    input_schema: {
      type: 'object' as const,
      properties: {
        pocket_id: {
          type: 'string',
          description: 'ID pocket (UUID)',
        },
      },
      required: ['pocket_id'],
    },
  },
  {
    name: 'get_spending_summary',
    description: 'Ambil ringkasan pengeluaran per kategori dalam periode tertentu',
    input_schema: {
      type: 'object' as const,
      properties: {
        pocket_id: {
          type: 'string',
          description: 'ID pocket (UUID)',
        },
        period: {
          type: 'string',
          enum: ['daily', 'weekly', 'monthly', 'yearly'],
          description: 'Periode ringkasan',
        },
        start_date: {
          type: 'string',
          description: 'Dari tanggal (YYYY-MM-DD)',
        },
        end_date: {
          type: 'string',
          description: 'Hingga tanggal (YYYY-MM-DD)',
        },
      },
      required: ['pocket_id', 'period', 'start_date', 'end_date'],
    },
  },
  {
    name: 'get_categories',
    description: 'Ambil daftar kategori yang tersedia',
    input_schema: {
      type: 'object' as const,
      properties: {
        pocket_id: {
          type: 'string',
          description: 'ID pocket untuk kategori custom (optional)',
        },
        type: {
          type: 'string',
          enum: ['income', 'expense'],
          description: 'Filter tipe kategori (optional)',
        },
      },
      required: [],
    },
  },
  {
    name: 'analyze_spending_pattern',
    description: 'Analisis pola pengeluaran dan identifikasi insight',
    input_schema: {
      type: 'object' as const,
      properties: {
        pocket_id: {
          type: 'string',
          description: 'ID pocket (UUID)',
        },
        days: {
          type: 'number',
          description: 'Jumlah hari untuk analisis (default 30)',
        },
      },
      required: ['pocket_id'],
    },
  },
  {
    name: 'set_budget',
    description: 'Set atau update budget untuk kategori tertentu',
    input_schema: {
      type: 'object' as const,
      properties: {
        pocket_id: {
          type: 'string',
          description: 'ID pocket (UUID)',
        },
        category_id: {
          type: 'string',
          description: 'ID kategori (optional, null = overall budget)',
        },
        amount: {
          type: 'number',
          description: 'Jumlah budget',
        },
        period: {
          type: 'string',
          enum: ['daily', 'weekly', 'monthly', 'yearly'],
          description: 'Periode budget',
        },
      },
      required: ['pocket_id', 'amount', 'period'],
    },
  },
  {
    name: 'get_budget_status',
    description: 'Cek status budget (sudah dipakai berapa persen)',
    input_schema: {
      type: 'object' as const,
      properties: {
        pocket_id: {
          type: 'string',
          description: 'ID pocket (UUID)',
        },
      },
      required: ['pocket_id'],
    },
  },
  {
    name: 'get_pocket_members',
    description: 'Ambil daftar anggota pocket yang shared',
    input_schema: {
      type: 'object' as const,
      properties: {
        pocket_id: {
          type: 'string',
          description: 'ID pocket (UUID)',
        },
      },
      required: ['pocket_id'],
    },
  },
]

/**
 * System prompt untuk AI Agent
 * Customize dengan konteks user's pockets dan recent activity
 */
export const createSystemPrompt = (
  userDisplayName: string,
  pockets: Array<{ id: string; name: string; balance: number }>
) => {
  const pocketInfo = pockets
    .map((p) => `- ${p.name}: Rp ${p.balance.toLocaleString('id-ID')}`)
    .join('\n')

  return `Kamu adalah AI Financial Advisor untuk Kusmani Finance.

Nama pengguna: ${userDisplayName}

Pocket yang dimiliki user:
${pocketInfo}

Rules:
1. Semua nilai currency adalah Rp (Rupiah Indonesia)
2. Format currency dengan titik pemisah ribuan: Rp 1.500.000
3. Jika user ingin melakukan action (create transaksi, set budget, dll), gunakan tools yang tersedia
4. Sebelum execute action destructive (delete, update amount), minta konfirmasi user terlebih dahulu
5. Jika ada ambiguitas pocket, tanya user "Pocket mana yang dimaksud?"
6. Berikan insight yang actionable tentang pengeluaran dan pola finansial
7. Gunakan bahasa Indonesia yang natural dan friendly
8. Jangan assume apa yang user inginkan - tanya jika perlu clarification

Tools yang bisa kamu gunakan:
- get_transactions: ambil transaksi
- create_transaction: buat transaksi baru
- get_balance: cek saldo
- get_spending_summary: ringkasan pengeluaran
- get_categories: daftar kategori
- analyze_spending_pattern: analisis pola pengeluaran
- set_budget: set budget
- get_budget_status: cek status budget
- get_pocket_members: daftar member pocket

Mari kita mulai! Apa yang bisa saya bantu hari ini?`
}
