import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@lib/supabase'
import { PocketMember, PocketRole } from '@types'
import toast from 'react-hot-toast'

/**
 * Get members of a pocket
 */
export function usePocketMembers(pocketId: string | null) {
  return useQuery({
    queryKey: ['pocket-members', pocketId],
    queryFn: async () => {
      if (!pocketId) return []

      const { data, error } = await supabase
        .from('pocket_members')
        .select('*')
        .eq('pocket_id', pocketId)

      if (error) throw error
      return data as PocketMember[]
    },
    enabled: !!pocketId,
  })
}

/**
 * Invite user to pocket mutation
 * Currently not directly inviting by email - need Supabase edge function
 * For now, this is a placeholder for the UI
 */
export function useInvitePocketMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      pocketId,
      email,
      role,
    }: {
      pocketId: string
      email: string
      role: PocketRole
    }) => {
      // TODO: Implement via Supabase edge function
      // For now, just show a toast
      console.log('Invite user:', { pocketId, email, role })
      throw new Error('Feature coming soon - invite via Supabase edge function')
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pocket-members', variables.pocketId] })
      toast.success('Member berhasil diundang')
    },
    onError: (error: Error) => {
      toast.error('Error: ' + error.message)
    },
  })
}

/**
 * Update member role mutation
 */
export function useUpdateMemberRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      memberId,
      role,
    }: {
      memberId: string
      pocketId: string
      role: PocketRole
    }) => {
      const { error } = await supabase
        .from('pocket_members')
        .update({ role })
        .eq('id', memberId)

      if (error) throw error
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pocket-members', variables.pocketId] })
      toast.success('Role berhasil diupdate')
    },
    onError: (error: Error) => {
      toast.error('Error: ' + error.message)
    },
  })
}

/**
 * Remove member from pocket mutation
 */
export function useRemovePocketMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      memberId,
    }: {
      memberId: string
      pocketId: string
    }) => {
      const { error } = await supabase
        .from('pocket_members')
        .delete()
        .eq('id', memberId)

      if (error) throw error
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pocket-members', variables.pocketId] })
      toast.success('Member berhasil dihapus')
    },
    onError: (error: Error) => {
      toast.error('Error: ' + error.message)
    },
  })
}
