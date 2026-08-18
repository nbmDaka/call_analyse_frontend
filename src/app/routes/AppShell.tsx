import React, { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/useAuth'
import { IconCalls, IconLogout, IconMoon, IconOverview, IconSun } from '../../shared/ui/Icons'

export function AppShell() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
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
          <span>Call Analyse</span>
        </div>

        <div className="sidebar-section">
          <span className="sidebar-label">Workspace</span>
          <NavLink to="/dashboard" className={({ isActive }) => `sidebar-nav-item${isActive ? ' active' : ''}`}>
            <IconOverview />
            <span>Overview</span>
          </NavLink>
          <NavLink to="/calls" className={({ isActive }) => `sidebar-nav-item${isActive ? ' active' : ''}`}>
            <IconCalls />
            <span>Calls</span>
          </NavLink>
        </div>

        <div className="sidebar-spacer" />

        <div className="sidebar-actions">
          <button className="theme-toggle-btn" onClick={toggleTheme} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
            <span>{theme === 'light' ? 'Dark theme' : 'Light theme'}</span>
            {theme === 'light' ? <IconMoon /> : <IconSun />}
          </button>
        </div>

        <div className="user-menu">
          <div className="avatar">{user?.email[0]?.toUpperCase()}</div>
          <div className="user-meta">
            <strong>{user?.email}</strong>
            <span>{user?.role}</span>
          </div>
          <button className="icon-button" title="Sign out" onClick={() => void signOut().then(() => navigate('/login'))}>
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
