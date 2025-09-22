import { createContext } from 'react'
import type { User } from '@/types'
import type { LoginRequest, RegisterRequest } from '@/api/auth'

export interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (credentials: LoginRequest) => Promise<User>
  register: (data: RegisterRequest) => Promise<User>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  clearError: () => void
  updateProfile: (data: Partial<User>) => Promise<User>
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)