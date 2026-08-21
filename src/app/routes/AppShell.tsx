import React, { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../features/auth/useAuth'
import { LanguageSwitcher } from '../../shared/ui/LanguageSwitcher'
import { IconCalls, IconLogout, IconMoon, IconOverview, IconSun } from '../../shared/ui/Icons'
import { useWorkspace } from '../../features/workspaces/useWorkspace'
import { canManageMembers } from '../../entities/workspace/model'
import { LoadingLine } from '../../shared/ui/LoadingLine'

export function AppShell() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { workspaces, activeWorkspace, loading: workspacesLoading, error: workspacesError, selectWorkspace } = useWorkspace()
  const { t } = useTranslation('common')
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('callwise.theme')
    if (saved === 'light' || saved === 'dark') return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('callwise.theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'))

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="logo">
          <span className="brand-mark small">CW</span>
          <span>{t('branding.appName')}</span>
        </div>

        <div className="sidebar-section">
          <span className="sidebar-label">{t('nav.workspace')}</span>
          <select className="workspace-switcher" aria-label={t('workspace.switcher')} value={activeWorkspace?.id ?? ''} onChange={event => selectWorkspace(event.target.value)}>
            {!activeWorkspace && <option value="">{t('workspace.none')}</option>}
            {workspaces.map(item => <option key={item.id} value={item.id} disabled={item.membershipStatus !== 'active'}>{item.name} · {t(`workspace.type.${item.type}`)}</option>)}
          </select>
          <NavLink to="/dashboard" className={({ isActive }) => `sidebar-nav-item${isActive ? ' active' : ''}`}>
            <IconOverview />
            <span>{t('nav.overview')}</span>
          </NavLink>
          {canManageMembers(activeWorkspace) && <NavLink to="/members" className={({ isActive }) => `sidebar-nav-item${isActive ? ' active' : ''}`}><span>◎</span><span>{t('nav.members')}</span></NavLink>}
          {user?.platformRole === 'super_admin' && <NavLink to="/platform" className={({ isActive }) => `sidebar-nav-item${isActive ? ' active' : ''}`}><span>◆</span><span>{t('nav.platform')}</span></NavLink>}
          <NavLink to="/calls" className={({ isActive }) => `sidebar-nav-item${isActive ? ' active' : ''}`}>
            <IconCalls />
            <span>{t('nav.calls')}</span>
          </NavLink>
        </div>

        <div className="sidebar-spacer" />

        <div className="sidebar-controls-footer">
          <LanguageSwitcher />
          <button
            type="button"
            className="icon-button theme-toggle-icon-btn"
            onClick={toggleTheme}
            title={theme === 'light' ? t('theme.darkTheme') : t('theme.lightTheme')}
            aria-label={theme === 'light' ? t('theme.darkTheme') : t('theme.lightTheme')}
          >
            {theme === 'light' ? <IconMoon /> : <IconSun />}
          </button>
        </div>

        <div className="user-menu">
          <div className="avatar">{user?.email[0]?.toUpperCase()}</div>
          <div className="user-meta">
            <strong>{user?.email}</strong>
            <span>{activeWorkspace ? t(`roles.${activeWorkspace.membershipRole}`) : user?.platformRole}</span>
          </div>
          <button className="icon-button" title={t('actions.signOut')} onClick={() => void signOut().then(() => navigate('/login'))}>
            <IconLogout />
          </button>
        </div>
      </aside>
      <main className="main-content">
        {workspacesLoading ? <LoadingLine /> : workspacesError ? <div className="alert alert-error">{workspacesError.message}</div> : !activeWorkspace && location.pathname !== '/platform' ? <section className="empty-state"><div className="empty-icon">CW</div><h2>{t('workspace.noAvailable')}</h2><p>{t('workspace.noAvailableHint')}</p></section> : <>
          {activeWorkspace?.status === 'suspended' && <div className="alert alert-error workspace-banner">{t('workspace.suspended')}</div>}
          <Outlet />
        </>}
      </main>
    </div>
  )
}
