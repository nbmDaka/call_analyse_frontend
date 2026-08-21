import React, { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../features/auth/useAuth'
import { createPlatformCompany, getPlatformData, setPlatformUserStatus, setPlatformWorkspaceStatus } from '../../features/platform/api'
import { PageHeader } from '../../shared/ui/PageHeader'
import { LoadingLine } from '../../shared/ui/LoadingLine'
import { ErrorState } from '../../shared/ui/ErrorState'
import { CustomSelect } from '../../shared/ui/CustomSelect'

export function PlatformPage() {
  const { user } = useAuth(); const { t } = useTranslation('common'); const client = useQueryClient()
  const [companyName, setCompanyName] = useState(''); const [ownerUserId, setOwnerUserId] = useState('')
  const data = useQuery({ queryKey: ['platform'], queryFn: getPlatformData, enabled: user?.platformRole === 'super_admin' })
  const refresh = () => client.invalidateQueries({ queryKey: ['platform'] })
  const workspaceStatus = useMutation({ mutationFn: ({ id, status }: { id: string; status: 'active' | 'suspended' }) => setPlatformWorkspaceStatus(id, status), onSuccess: refresh })
  const userStatus = useMutation({ mutationFn: ({ id, status }: { id: string; status: 'active' | 'suspended' }) => setPlatformUserStatus(id, status), onSuccess: refresh })
  const createCompany = useMutation({ mutationFn: () => createPlatformCompany(companyName, ownerUserId), onSuccess: () => { setCompanyName(''); setOwnerUserId(''); void refresh() } })
  if (user?.platformRole !== 'super_admin') return <Navigate to="/dashboard" replace />
  if (data.isLoading) return <LoadingLine />; if (data.isError || !data.data) return <ErrorState message={data.error?.message} />
  return <><PageHeader eyebrow={t('platform.eyebrow')} title={t('platform.title')} />
    <div className="stats-grid"><div className="content-card"><b>{data.data.metrics.users}</b><span>{t('platform.users')}</span></div><div className="content-card"><b>{data.data.metrics.workspaces}</b><span>{t('platform.workspaces')}</span></div><div className="content-card"><b>{data.data.metrics.calls}</b><span>{t('platform.calls')}</span></div></div>
    <section className="content-card"><h2>{t('platform.workspaces')}</h2><form className="member-form" onSubmit={event => { event.preventDefault(); createCompany.mutate() }}><input required value={companyName} onChange={event => setCompanyName(event.target.value)} placeholder={t('platform.companyName')} /><CustomSelect required value={ownerUserId} placeholder={t('platform.owner')} onChange={setOwnerUserId} options={data.data.users.filter(item => item.status === 'active').map(item => ({ value: item.id, label: item.email }))} /><button className="button button-primary">{t('platform.create')}</button></form><div className="table-wrap"><table><tbody>{data.data.workspaces.map(workspace => <tr key={workspace.id}><td>{workspace.name}</td><td>{workspace.type}</td><td>{workspace.status}</td><td><button onClick={() => workspaceStatus.mutate({ id: workspace.id, status: workspace.status === 'active' ? 'suspended' : 'active' })}>{workspace.status === 'active' ? t('platform.suspend') : t('platform.activate')}</button></td></tr>)}</tbody></table></div></section>
    <section className="content-card"><h2>{t('platform.users')}</h2><div className="table-wrap"><table><tbody>{data.data.users.map(item => <tr key={item.id}><td>{item.email}</td><td>{item.platform_role}</td><td>{item.status}</td><td>{item.id !== user.id && <button onClick={() => userStatus.mutate({ id: item.id, status: item.status === 'active' ? 'suspended' : 'active' })}>{item.status === 'active' ? t('platform.suspend') : t('platform.activate')}</button>}</td></tr>)}</tbody></table></div></section>
  </>
}
