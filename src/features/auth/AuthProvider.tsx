import React, { useEffect, useState } from 'react'
import { QueryClient } from '@tanstack/react-query'
import type { User } from '../../entities/user/model'
import { session } from '../../shared/api/session'
import { getMe, login, logout, register } from './api'
import { AuthContext } from './AuthContext'

export function AuthProvider({ children, queryClient }: { children: React.ReactNode; queryClient: QueryClient }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(Boolean(session.accessToken))

  useEffect(() => {
    if (!session.accessToken) {
      setLoading(false)
      return
    }
    getMe()
      .then(setUser)
      .catch(() => {
        session.clear()
        setUser(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const value = {
    user,
    loading,
    async signIn(email: string, password: string) {
      setUser(await login(email, password))
    },
    async signUp(email: string, password: string) {
      await register(email, password)
    },
    async signOut() {
      await logout()
      setUser(null)
      queryClient.clear()
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
