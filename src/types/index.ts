// User & Auth
export interface Profile {
  id: string
  username: string | null
  display_name: string | null
  avatar_url: string | null
  created_at: string
}

// Pockets
export interface Pocket {
  id: string
  name: string
  description: string | null
  owner_id: string
  balance: number
  is_shared: boolean
  created_at: string
  updated_at: string
}

export type PocketRole = 'viewer' | 'contributor' | 'admin'

export interface PocketMember {
  id: string
  pocket_id: string
  user_id: string
  role: PocketRole
  invited_by: string | null
  joined_at: string
}

// Transactions
export type TransactionType = 'income' | 'expense' | 'transfer'

export interface Transaction {
  id: string
  pocket_id: string
  category_id: string | null
  amount: number
  type: TransactionType
  description: string | null
  date: string
  created_by: string
  updated_by: string | null
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

// Categories
export interface Category {
  id: string
  pocket_id: string | null
  name: string
  icon: string | null
  color: string | null
  type: 'income' | 'expense'
  created_by: string | null
  created_at: string
}

// Budgets
export type BudgetPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface Budget {
  id: string
  pocket_id: string
  category_id: string | null
  amount: number
  period: BudgetPeriod
  created_by: string
  created_at: string
}

// Audit Logs
export type AuditAction = 'INSERT' | 'UPDATE' | 'DELETE' | 'AI_AGENT'

export interface AuditLog {
  id: string
  table_name: string
  record_id: string | null
  action: AuditAction
  old_data: Record<string, unknown> | null
  new_data: Record<string, unknown> | null
  user_id: string | null
  created_at: string
}

// AI Conversations
export interface AIMessage {
  role: 'user' | 'assistant'
  content: string
  tool_calls?: Array<{
    id: string
    type: string
    function: {
      name: string
      arguments: string
    }
  }>
  tool_results?: Array<{
    tool_use_id: string
    content: string
  }>
}

export interface AIConversation {
  id: string
  user_id: string
  pocket_id: string | null
  title: string | null
  messages: AIMessage[]
  created_at: string
  updated_at: string
}

// API Response Types
export interface ApiResponse<T> {
  data?: T
  error?: string
  status: number
}

// Form States
export interface TransactionFormData {
  amount: number
  type: TransactionType
  category_id?: string
  description?: string
  date: string
}

export interface PocketFormData {
  name: string
  description?: string
  is_shared: boolean
}

export interface InviteFormData {
  email: string
  role: PocketRole
}
