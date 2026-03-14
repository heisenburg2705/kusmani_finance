/**
 * AI Tool Executor
 * Handles execution of all AI agent tools
 * Communicates with Supabase backend
 */

import { supabase } from '../supabase'
import { ToolExecutionRequest, ToolExecutionResult } from './types'

interface Transaction {
  category_id: string | null
  amount: number
  type: string
  [key: string]: unknown
}

/**
 * Execute tool request
 */
export async function executeTool(
  request: ToolExecutionRequest
): Promise<ToolExecutionResult> {
  try {
    switch (request.tool_name) {
      case 'get_transactions':
        return await executeGetTransactions(request)
      case 'create_transaction':
        return await executeCreateTransaction(request)
      case 'get_balance':
        return await executeGetBalance(request)
      case 'get_spending_summary':
        return await executeGetSpendingSummary(request)
      case 'get_categories':
        return await executeGetCategories(request)
      case 'analyze_spending_pattern':
        return await executeAnalyzeSpending(request)
      case 'set_budget':
        return await executeSetBudget(request)
      case 'get_budget_status':
        return await executeGetBudgetStatus(request)
      case 'get_pocket_members':
        return await executeGetPocketMembers(request)
      case 'transfer_between_pockets':
        return await executeTransferBetweenPockets(request)
      default:
        return {
          success: false,
          error: `Tool tidak dikenal: ${request.tool_name}`,
          executed_at: new Date().toISOString(),
        }
    }
  } catch (error) {
    return {
      success: false,
      error: String(error),
      executed_at: new Date().toISOString(),
    }
  }
}

/**
 * Get transactions
 */
async function executeGetTransactions(request: ToolExecutionRequest) {
  const { pocket_id, limit = 20 } = request.arguments

  const query = supabase
    .from('transactions')
    .select('*')
    .eq('pocket_id', pocket_id as string)
    .order('date', { ascending: false })
    .limit(parseInt(String(limit)))

  const { data, error } = await query

  if (error) throw error

  return {
    success: true,
    data,
    executed_at: new Date().toISOString(),
  }
}

/**
 * Create transaction
 */
async function executeCreateTransaction(request: ToolExecutionRequest) {
  const { pocket_id, amount, type, category_id, description, date } = request.arguments

  const { data, error } = await supabase
    .from('transactions')
    .insert({
      pocket_id: pocket_id as string,
      amount: parseFloat(String(amount)),
      type: type as string,
      category_id: category_id as string | null,
      description: description as string,
      date: (date as string) || new Date().toISOString().split('T')[0],
      created_by: request.user_id,
    })
    .select()
    .single()

  if (error) throw error

  return {
    success: true,
    data,
    executed_at: new Date().toISOString(),
  }
}

/**
 * Get balance
 */
async function executeGetBalance(request: ToolExecutionRequest) {
  const { pocket_id } = request.arguments

  const { data, error } = await supabase
    .from('pockets')
    .select('id, name, balance')
    .eq('id', pocket_id as string)
    .single()

  if (error) throw error

  return {
    success: true,
    data,
    executed_at: new Date().toISOString(),
  }
}

/**
 * Get spending summary
 */
async function executeGetSpendingSummary(request: ToolExecutionRequest) {
  const { pocket_id, start_date, end_date, type } = request.arguments

  let query = supabase
    .from('transactions')
    .select('category_id, amount, type')
    .eq('pocket_id', pocket_id as string)
    .gte('date', start_date as string)
    .lte('date', end_date as string)

  if (type) {
    query = query.eq('type', type as string)
  }

  const { data, error } = await query

  if (error) throw error

  // Group by category
  const summary = (data || []).reduce(
    (acc: Record<string, number>, transaction: Transaction) => {
      const categoryId = transaction.category_id || 'uncategorized'
      acc[categoryId] = (acc[categoryId] || 0) + transaction.amount
      return acc
    },
    {}
  )

  return {
    success: true,
    data: summary,
    executed_at: new Date().toISOString(),
  }
}

/**
 * Get categories
 */
async function executeGetCategories(request: ToolExecutionRequest) {
  const { pocket_id, type } = request.arguments

  let query = supabase
    .from('categories')
    .select('*')
    .or(`pocket_id.is.null,pocket_id.eq.${pocket_id || ''}`)

  if (type) {
    query = query.eq('type', type as string)
  }

  const { data, error } = await query

  if (error) throw error

  return {
    success: true,
    data,
    executed_at: new Date().toISOString(),
  }
}

/**
 * Analyze spending pattern
 */
async function executeAnalyzeSpending(request: ToolExecutionRequest) {
  const { pocket_id, days = 30 } = request.arguments

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - parseInt(String(days)))

  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('amount, type, category_id, date')
    .eq('pocket_id', pocket_id as string)
    .gte('date', startDate.toISOString().split('T')[0])

  if (error) throw error

  // Simple analysis
  const expenses = (transactions || [])
    .filter((t: Transaction) => t.type === 'expense')
    .reduce((sum: number, t: Transaction) => sum + t.amount, 0)

  const income = (transactions || [])
    .filter((t: Transaction) => t.type === 'income')
    .reduce((sum: number, t: Transaction) => sum + t.amount, 0)

  const analysis = {
    period_days: days,
    total_income: income,
    total_expenses: expenses,
    net: income - expenses,
    transaction_count: (transactions || []).length,
    average_daily_spending: (transactions || []).length > 0 ? expenses / parseInt(String(days)) : 0,
  }

  return {
    success: true,
    data: analysis,
    executed_at: new Date().toISOString(),
  }
}

/**
 * Set budget
 */
async function executeSetBudget(request: ToolExecutionRequest) {
  const { pocket_id, category_id, amount, period } = request.arguments

  const { data, error } = await supabase
    .from('budgets')
    .insert({
      pocket_id: pocket_id as string,
      category_id: category_id as string | null,
      amount: parseFloat(String(amount)),
      period: period as string,
      created_by: request.user_id,
    })
    .select()
    .single()

  if (error) throw error

  return {
    success: true,
    data,
    executed_at: new Date().toISOString(),
  }
}

/**
 * Get budget status
 */
async function executeGetBudgetStatus(request: ToolExecutionRequest) {
  const { pocket_id } = request.arguments

  const { data: budgets, error: budgetError } = await supabase
    .from('budgets')
    .select('*')
    .eq('pocket_id', pocket_id as string)

  if (budgetError) throw budgetError

  // For now, just return budgets. Full calculation would require date logic
  return {
    success: true,
    data: budgets,
    executed_at: new Date().toISOString(),
  }
}

/**
 * Get pocket members
 */
async function executeGetPocketMembers(request: ToolExecutionRequest) {
  const { pocket_id } = request.arguments

  const { data, error } = await supabase
    .from('pocket_members')
    .select('*')
    .eq('pocket_id', pocket_id as string)

  if (error) throw error

  return {
    success: true,
    data,
    executed_at: new Date().toISOString(),
  }
}

/**
 * Transfer between pockets
 */
async function executeTransferBetweenPockets(request: ToolExecutionRequest) {
  const { from_pocket_id, to_pocket_id, amount, description } = request.arguments

  // Create two transactions: expense from source, income to destination
  const transactionData = {
    amount: parseFloat(String(amount)),
    type: 'transfer' as const,
    description: (description as string) || 'Transfer between pockets',
    date: new Date().toISOString().split('T')[0],
    created_by: request.user_id,
  }

  const { error: fromError } = await supabase
    .from('transactions')
    .insert({
      ...transactionData,
      pocket_id: from_pocket_id as string,
      type: 'expense' as const,
    })

  if (fromError) throw fromError

  const { error: toError } = await supabase
    .from('transactions')
    .insert({
      ...transactionData,
      pocket_id: to_pocket_id as string,
      type: 'income' as const,
    })

  if (toError) throw toError

  return {
    success: true,
    data: {
      from_pocket_id,
      to_pocket_id,
      amount: transactionData.amount,
    },
    executed_at: new Date().toISOString(),
  }
}
