import React, { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { canManageMembers, type WorkspaceRole } from '../../entities/workspace/model'
import { useWorkspace } from '../../features/workspaces/useWorkspace'
import { addMember, getMembers, removeMember, updateMember } from '../../features/members/api'
import { PageHeader } from '../../shared/ui/PageHeader'
import { ErrorState } from '../../shared/ui/ErrorState'
import { LoadingLine } from '../../shared/ui/LoadingLine'
import { CustomSelect } from '../../shared/ui/CustomSelect'

export function MembersPage() {
  const { t } = useTranslation('common')
  const { activeWorkspace } = useWorkspace()
  const queryClient = useQueryClient()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<WorkspaceRole>('manager')
  const workspaceId = activeWorkspace?.id ?? ''
  const members = useQuery({ queryKey: ['members', workspaceId], queryFn: () => getMembers(workspaceId), enabled: Boolean(workspaceId) })
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['members', workspaceId] })
  const add = useMutation({ mutationFn: () => addMember(workspaceId, email, role), onSuccess: () => { setEmail(''); void refresh() } })
  const update = useMutation({ mutationFn: ({ id, patch }: { id: string; patch: Record<string, unknown> }) => updateMember(workspaceId, id, patch), onSuccess: refresh })
  const remove = useMutation({ mutationFn: (id: string) => removeMember(workspaceId, id), onSuccess: refresh })
  if (!canManageMembers(activeWorkspace)) return <Navigate to="/dashboard" replace />
  return <>
    <PageHeader eyebrow={t('members.eyebrow')} title={t('members.title')} />
    <section className="content-card">
      <form className="member-form" onSubmit={event => { event.preventDefault(); add.mutate() }}>
        <input type="email" required value={email} onChange={event => setEmail(event.target.value)} placeholder={t('members.email')} />
        <CustomSelect
          value={role}
          onChange={val => setRole(val as WorkspaceRole)}
          options={(activeWorkspace?.membershipRole === 'owner' ? ['admin', 'supervisor', 'manager'] : ['supervisor', 'manager']).map(item => ({
            value: item,
            label: t(`roles.${item}`)
          }))}
        />
        <button className="button button-primary" disabled={add.isPending}>{t('members.add')}</button>
      </form>
      {members.isLoading ? <LoadingLine /> : members.isError ? <ErrorState message={members.error.message} /> : <div className="table-wrap"><table><thead><tr><th>{t('members.email')}</th><th>{t('members.role')}</th><th>{t('members.status')}</th><th>{t('members.actions')}</th></tr></thead><tbody>
        {members.data?.map(member => <tr key={member.id}><td>{member.email}</td><td>{t(`roles.${member.role}`)}</td><td>{t(`membershipStatus.${member.status}`)}</td><td>
          {member.role !== 'owner' && <><button onClick={() => update.mutate({ id: member.id, patch: { status: member.status === 'active' ? 'disabled' : 'active' } })}>{member.status === 'active' ? t('members.disable') : t('members.activate')}</button>{' '}<button onClick={() => remove.mutate(member.id)}>{t('members.remove')}</button></>}
        </td></tr>)}
      </tbody></table></div>}
    </section>
  </>
}
