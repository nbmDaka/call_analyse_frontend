import { createContext, useContext } from 'react'
import type { User } from '../../entities/user/model'

export interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => undefined,
  signUp: async () => undefined,
  signOut: async () => undefined,
})

export function useAuth() {
  return useContext(AuthContext)
}
