import React, { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../features/auth/useAuth'
import { LanguageSwitcher } from '../../shared/ui/LanguageSwitcher'
import { IconCalls, IconLogout, IconMoon, IconOverview, IconSun } from '../../shared/ui/Icons'

export function AppShell() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const { t } = useTranslation('common')
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('call-analyse.theme')
    if (saved === 'light' || saved === 'dark') return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('call-analyse.theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'))

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="logo">
          <span className="brand-mark small">CA</span>
          <span>{t('branding.appName')}</span>
        </div>

        <div className="sidebar-section">
          <span className="sidebar-label">{t('nav.workspace')}</span>
          <NavLink to="/dashboard" className={({ isActive }) => `sidebar-nav-item${isActive ? ' active' : ''}`}>
            <IconOverview />
            <span>{t('nav.overview')}</span>
          </NavLink>
          <NavLink to="/calls" className={({ isActive }) => `sidebar-nav-item${isActive ? ' active' : ''}`}>
            <IconCalls />
            <span>{t('nav.calls')}</span>
          </NavLink>
        </div>

        <div className="sidebar-spacer" />

        <div className="sidebar-actions">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
            <LanguageSwitcher />
          </div>
          <button className="theme-toggle-btn" onClick={toggleTheme} title={theme === 'light' ? t('theme.darkTheme') : t('theme.lightTheme')}>
            <span>{theme === 'light' ? t('theme.darkTheme') : t('theme.lightTheme')}</span>
            {theme === 'light' ? <IconMoon /> : <IconSun />}
          </button>
        </div>

        <div className="user-menu">
          <div className="avatar">{user?.email[0]?.toUpperCase()}</div>
          <div className="user-meta">
            <strong>{user?.email}</strong>
            <span>{user?.role}</span>
          </div>
          <button className="icon-button" title={t('actions.signOut')} onClick={() => void signOut().then(() => navigate('/login'))}>
            <IconLogout />
          </button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
