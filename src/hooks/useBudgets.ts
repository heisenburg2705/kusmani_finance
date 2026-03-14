import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@lib/supabase'
import { Budget, BudgetPeriod } from '@types/index'
import { useAuth } from './useAuth'
import toast from 'react-hot-toast'

/**
 * Get budgets for a pocket
 */
export function useBudgets(pocketId: string | null) {
  return useQuery({
    queryKey: ['budgets', pocketId],
    queryFn: async () => {
      if (!pocketId) return []

      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('pocket_id', pocketId)

      if (error) throw error
      return data as Budget[]
    },
    enabled: !!pocketId,
  })
}

/**
 * Create budget mutation
 */
export function useCreateBudget() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({
      pocketId,
      categoryId,
      amount,
      period,
    }: {
      pocketId: string
      categoryId: string | null
      amount: number
      period: BudgetPeriod
    }) => {
      if (!user) throw new Error('No authenticated user')

      const { data, error } = await supabase
        .from('budgets')
        .insert({
          pocket_id: pocketId,
          category_id: categoryId,
          amount,
          period,
          created_by: user.id,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['budgets', variables.pocketId] })
      toast.success('Budget berhasil dibuat')
    },
    onError: (error: any) => {
      toast.error('Error: ' + error.message)
    },
  })
}

/**
 * Delete budget mutation
 */
export function useDeleteBudget() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      budgetId,
      pocketId,
    }: {
      budgetId: string
      pocketId: string
    }) => {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', budgetId)

      if (error) throw error
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['budgets', variables.pocketId] })
      toast.success('Budget berhasil dihapus')
    },
    onError: (error: any) => {
      toast.error('Error: ' + error.message)
    },
  })
}
