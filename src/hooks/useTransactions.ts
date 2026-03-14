import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@lib/supabase'
import { Transaction, TransactionFormData } from '@types/index'
import toast from 'react-hot-toast'

/**
 * Get transactions for a pocket
 */
export function useTransactions(pocketId: string | null) {
  return useQuery({
    queryKey: ['transactions', pocketId],
    queryFn: async () => {
      if (!pocketId) return []

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('pocket_id', pocketId)
        .order('date', { ascending: false })

      if (error) throw error
      return data as Transaction[]
    },
    enabled: !!pocketId,
  })
}

/**
 * Create transaction mutation
 */
export function useCreateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      pocketId,
      data,
    }: {
      pocketId: string
      data: TransactionFormData
    }) => {
      const { data: result, error } = await supabase
        .from('transactions')
        .insert({
          pocket_id: pocketId,
          amount: data.amount,
          type: data.type,
          category_id: data.category_id,
          description: data.description,
          date: data.date,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single()

      if (error) throw error
      return result
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transactions', variables.pocketId] })
      queryClient.invalidateQueries({ queryKey: ['pockets'] })
      toast.success('Transaksi berhasil ditambahkan')
    },
    onError: (error: Error) => {
      toast.error('Error: ' + error.message)
    },
  })
}

/**
 * Update transaction mutation
 */
export function useUpdateTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      transactionId,
      pocketId,
      data,
    }: {
      transactionId: string
      pocketId: string
      data: Partial<TransactionFormData>
    }) => {
      const { data: result, error } = await supabase
        .from('transactions')
        .update({
          amount: data.amount,
          type: data.type,
          category_id: data.category_id,
          description: data.description,
          date: data.date,
          updated_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .eq('id', transactionId)
        .select()
        .single()

      if (error) throw error
      return result
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transactions', variables.pocketId] })
      queryClient.invalidateQueries({ queryKey: ['pockets'] })
      toast.success('Transaksi berhasil diupdate')
    },
    onError: (error: Error) => {
      toast.error('Error: ' + error.message)
    },
  })
}

/**
 * Delete transaction mutation
 */
export function useDeleteTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      transactionId,
      pocketId,
    }: {
      transactionId: string
      pocketId: string
    }) => {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId)

      if (error) throw error
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transactions', variables.pocketId] })
      queryClient.invalidateQueries({ queryKey: ['pockets'] })
      toast.success('Transaksi berhasil dihapus')
    },
    onError: (error: Error) => {
      toast.error('Error: ' + error.message)
    },
  })
}
