import { Tool } from '../types'

/**
 * AI Agent Tools - Provider-agnostic definitions
 * Dapat digunakan untuk semua AI providers
 * Tools untuk financial app dengan Supabase backend
 */

export const AGENT_TOOLS: Tool[] = [
  {
    name: 'get_transactions',
    description: 'Ambil daftar transaksi dari pocket tertentu dengan optional filters',
    input_schema: {
      type: 'object',
      properties: {
        pocket_id: {
          type: 'string',
          description: 'ID pocket (UUID)',
        },
        limit: {
          type: 'string',
          description: 'Jumlah transaksi yang diambil (default: 20, max: 100)',
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
        type: {
          type: 'string',
          description: 'Filter tipe transaksi: income, expense, transfer (optional)',
          enum: ['income', 'expense', 'transfer'],
        },
      },
      required: ['pocket_id'],
    },
  },

  {
    name: 'create_transaction',
    description: 'Buat transaksi baru di pocket. SELALU MINTA KONFIRMASI USER sebelum execute!',
    input_schema: {
      type: 'object',
      properties: {
        pocket_id: {
          type: 'string',
          description: 'ID pocket (UUID)',
        },
        amount: {
          type: 'string',
          description: 'Jumlah nominal (positif, tanpa Rp)',
        },
        type: {
          type: 'string',
          description: 'Tipe transaksi',
          enum: ['income', 'expense', 'transfer'],
        },
        category_id: {
          type: 'string',
          description: 'ID kategori (optional)',
        },
        description: {
          type: 'string',
          description: 'Deskripsi transaksi (misal: "Makan siang di Mcdonald")',
        },
        date: {
          type: 'string',
          description: 'Tanggal transaksi (YYYY-MM-DD, default: hari ini)',
        },
      },
      required: ['pocket_id', 'amount', 'type', 'description'],
    },
  },

  {
    name: 'update_transaction',
    description: 'Update transaksi yang sudah ada. SELALU MINTA KONFIRMASI USER sebelum execute!',
    input_schema: {
      type: 'object',
      properties: {
        transaction_id: {
          type: 'string',
          description: 'ID transaksi yang akan diupdate (UUID)',
        },
        amount: {
          type: 'string',
          description: 'Jumlah baru (optional)',
        },
        type: {
          type: 'string',
          description: 'Tipe transaksi baru (optional)',
          enum: ['income', 'expense', 'transfer'],
        },
        category_id: {
          type: 'string',
          description: 'ID kategori baru (optional)',
        },
        description: {
          type: 'string',
          description: 'Deskripsi baru (optional)',
        },
        date: {
          type: 'string',
          description: 'Tanggal baru (YYYY-MM-DD) (optional)',
        },
      },
      required: ['transaction_id'],
    },
  },

  {
    name: 'delete_transaction',
    description: 'Delete transaksi. DESTRUCTIVE - SELALU MINTA KONFIRMASI USER sebelum execute!',
    input_schema: {
      type: 'object',
      properties: {
        transaction_id: {
          type: 'string',
          description: 'ID transaksi yang akan didelete (UUID)',
        },
      },
      required: ['transaction_id'],
    },
  },

  {
    name: 'get_balance',
    description: 'Ambil saldo pocket terkini',
    input_schema: {
      type: 'object',
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
      type: 'object',
      properties: {
        pocket_id: {
          type: 'string',
          description: 'ID pocket (UUID)',
        },
        start_date: {
          type: 'string',
          description: 'Dari tanggal (YYYY-MM-DD)',
        },
        end_date: {
          type: 'string',
          description: 'Hingga tanggal (YYYY-MM-DD)',
        },
        type: {
          type: 'string',
          description: 'Filter tipe: income atau expense (optional)',
          enum: ['income', 'expense'],
        },
      },
      required: ['pocket_id', 'start_date', 'end_date'],
    },
  },

  {
    name: 'get_categories',
    description: 'Ambil daftar kategori yang tersedia (default + custom)',
    input_schema: {
      type: 'object',
      properties: {
        pocket_id: {
          type: 'string',
          description: 'ID pocket untuk include custom categories (optional)',
        },
        type: {
          type: 'string',
          description: 'Filter tipe kategori: income atau expense (optional)',
          enum: ['income', 'expense'],
        },
      },
      required: [],
    },
  },

  {
    name: 'analyze_spending_pattern',
    description: 'Analisis pola pengeluaran dan identifikasi insight/anomali',
    input_schema: {
      type: 'object',
      properties: {
        pocket_id: {
          type: 'string',
          description: 'ID pocket (UUID)',
        },
        days: {
          type: 'string',
          description: 'Jumlah hari untuk analisis (default: 30)',
        },
      },
      required: ['pocket_id'],
    },
  },

  {
    name: 'set_budget',
    description: 'Set atau update budget untuk kategori tertentu',
    input_schema: {
      type: 'object',
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
          type: 'string',
          description: 'Jumlah budget (positif, tanpa Rp)',
        },
        period: {
          type: 'string',
          description: 'Periode budget',
          enum: ['daily', 'weekly', 'monthly', 'yearly'],
        },
      },
      required: ['pocket_id', 'amount', 'period'],
    },
  },

  {
    name: 'get_budget_status',
    description: 'Cek status budget saat ini (sudah terpakai berapa persen)',
    input_schema: {
      type: 'object',
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
      type: 'object',
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
    name: 'transfer_between_pockets',
    description:
      'Transfer uang antar pocket. SELALU MINTA KONFIRMASI USER sebelum execute!',
    input_schema: {
      type: 'object',
      properties: {
        from_pocket_id: {
          type: 'string',
          description: 'ID pocket sumber (UUID)',
        },
        to_pocket_id: {
          type: 'string',
          description: 'ID pocket tujuan (UUID)',
        },
        amount: {
          type: 'string',
          description: 'Jumlah transfer (positif, tanpa Rp)',
        },
        description: {
          type: 'string',
          description: 'Deskripsi transfer (optional)',
        },
      },
      required: ['from_pocket_id', 'to_pocket_id', 'amount'],
    },
  },
]

/**
 * Get tools by name
 */
export function getToolByName(name: string): Tool | undefined {
  return AGENT_TOOLS.find((tool) => tool.name === name)
}

/**
 * Get all tool names
 */
export function getAllToolNames(): string[] {
  return AGENT_TOOLS.map((tool) => tool.name)
}

/**
 * Tools yang DESTRUCTIVE (perlu confirmation)
 */
export const DESTRUCTIVE_TOOLS = new Set([
  'delete_transaction',
  'update_transaction',
  'create_transaction',
  'transfer_between_pockets',
  'set_budget',
])

/**
 * Check apakah tool adalah destructive
 */
export function isDestructiveTool(toolName: string): boolean {
  return DESTRUCTIVE_TOOLS.has(toolName)
}
