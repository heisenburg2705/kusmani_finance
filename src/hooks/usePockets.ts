import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@lib/supabase'
import { Pocket, PocketFormData } from '@types/index'
import { useAuth } from './useAuth'
import toast from 'react-hot-toast'

/**
 * Get all pockets for current user (owned + shared)
 */
export function usePockets() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['pockets', user?.id],
    queryFn: async () => {
      if (!user) return []

      // Get owned pockets
      const { data: ownedPockets, error: ownedError } = await supabase
        .from('pockets')
        .select('*')
        .eq('owner_id', user.id)

      if (ownedError) throw ownedError

      // Get shared pockets (member of)
      const { data: memberData, error: memberError } = await supabase
        .from('pocket_members')
        .select('pocket_id')
        .eq('user_id', user.id)

      if (memberError) throw memberError

      if (memberData && memberData.length > 0) {
        const pocketIds = memberData.map((m) => m.pocket_id)
        const { data: sharedPockets, error: sharedError } = await supabase
          .from('pockets')
          .select('*')
          .in('id', pocketIds)

        if (sharedError) throw sharedError
        return [...(ownedPockets || []), ...(sharedPockets || [])]
      }

      return ownedPockets || []
    },
    enabled: !!user,
  })
}

/**
 * Get single pocket by ID
 */
export function usePocket(pocketId: string | null) {
  return useQuery({
    queryKey: ['pocket', pocketId],
    queryFn: async () => {
      if (!pocketId) return null

      const { data, error } = await supabase
        .from('pockets')
        .select('*')
        .eq('id', pocketId)
        .single()

      if (error) throw error
      return data as Pocket
    },
    enabled: !!pocketId,
  })
}

/**
 * Create pocket mutation
 */
export function useCreatePocket() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (data: PocketFormData) => {
      if (!user) throw new Error('No authenticated user')

      const { data: pocket, error } = await supabase
        .from('pockets')
        .insert({
          name: data.name,
          description: data.description,
          owner_id: user.id,
          is_shared: data.is_shared,
        })
        .select()
        .single()

      if (error) throw error
      return pocket
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pockets'] })
      toast.success('Pocket berhasil dibuat')
    },
    onError: (error: any) => {
      toast.error('Error: ' + error.message)
    },
  })
}

/**
 * Update pocket mutation
 */
export function useUpdatePocket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      pocketId,
      data,
    }: {
      pocketId: string
      data: Partial<PocketFormData>
    }) => {
      const { data: result, error } = await supabase
        .from('pockets')
        .update({
          name: data.name,
          description: data.description,
          is_shared: data.is_shared,
        })
        .eq('id', pocketId)
        .select()
        .single()

      if (error) throw error
      return result
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pockets'] })
      queryClient.invalidateQueries({ queryKey: ['pocket', variables.pocketId] })
      toast.success('Pocket berhasil diupdate')
    },
    onError: (error: any) => {
      toast.error('Error: ' + error.message)
    },
  })
}

/**
 * Delete pocket mutation
 */
export function useDeletePocket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (pocketId: string) => {
      const { error } = await supabase
        .from('pockets')
        .delete()
        .eq('id', pocketId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pockets'] })
      toast.success('Pocket berhasil dihapus')
    },
    onError: (error: any) => {
      toast.error('Error: ' + error.message)
    },
  })
}
