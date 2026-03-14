import { usePocketMembers, useUpdateMemberRole, useRemovePocketMember } from '@hooks/usePocketMembers'
import { PocketRole } from '@types'

interface MemberListProps {
  pocketId: string
  isOwner: boolean
}

export function MemberList({ pocketId, isOwner }: MemberListProps) {
  const { data: members = [], isLoading } = usePocketMembers(pocketId)
  const { mutate: updateRole } = useUpdateMemberRole()
  const { mutate: removeMember } = useRemovePocketMember()

  if (isLoading) {
    return <p className="text-slate-600">Loading members...</p>
  }

  if (members.length === 0) {
    return (
      <div className="card text-center py-6">
        <p className="text-slate-600">Belum ada members</p>
      </div>
    )
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Members</h3>

      <div className="space-y-2 divide-y divide-slate-200">
        {members.map((member) => (
          <div key={member.id} className="py-3 flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">User {member.user_id.slice(0, 8)}</p>
              <p className="text-xs text-slate-500">Joined {new Date(member.joined_at).toLocaleDateString('id-ID')}</p>
            </div>

            {isOwner && (
              <div className="flex items-center gap-2">
                <select
                  value={member.role}
                  onChange={(e) =>
                    updateRole({
                      memberId: member.id,
                      pocketId,
                      role: e.target.value as PocketRole,
                    })
                  }
                  className="text-sm px-2 py-1 border border-slate-300 rounded"
                >
                  <option value="viewer">Viewer</option>
                  <option value="contributor">Contributor</option>
                  <option value="admin">Admin</option>
                </select>

                <button
                  onClick={() => {
                    if (
                      window.confirm('Hapus member ini dari pocket? Tindakan ini tidak bisa dibatalkan.')
                    ) {
                      removeMember({ memberId: member.id, pocketId })
                    }
                  }}
                  className="text-red-600 hover:text-red-700 text-xs px-2 py-1 rounded hover:bg-red-50"
                >
                  Hapus
                </button>
              </div>
            )}

            {!isOwner && <span className="text-xs text-slate-500">{member.role}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
