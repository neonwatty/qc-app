'use client'

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react'
import { authService } from '@/services/auth.service'
import type {
  AuthUser,
  LoginCredentials,
  RegisterData,
  AuthError,
  PasswordChangeRequest
} from '@/types/auth'

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: AuthError | null
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (data: Partial<AuthUser>) => Promise<void>
  changePassword: (data: PasswordChangeRequest) => Promise<void>
  clearError: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<AuthError | null>(null)

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        setIsLoading(true)
        const currentUser = await authService.getCurrentUser()
        setUser(currentUser)
      } catch (err) {
        console.error('Failed to initialize auth:', err)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  // Auto-refresh token before expiry
  useEffect(() => {
    if (!user) return

    const checkTokenExpiry = setInterval(async () => {
      try {
        // Check if token needs refresh (5 minutes before expiry)
        const tokenData = localStorage.getItem('auth_tokens')
        if (tokenData) {
          const { expiresAt } = JSON.parse(tokenData)
          const fiveMinutesBeforeExpiry = expiresAt - 5 * 60 * 1000

          if (Date.now() >= fiveMinutesBeforeExpiry) {
            await authService.refreshAccessToken()
          }
        }
      } catch (err) {
        console.error('Token refresh failed:', err)
        // If refresh fails, clear the auth state
        // Don't call logout here to avoid dependency cycle
        authService.logout().catch(console.error)
        setUser(null)
      }
    }, 60000) // Check every minute

    return () => clearInterval(checkTokenExpiry)
  }, [user])

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setError(null)
      setIsLoading(true)
      const response = await authService.login(credentials)
      setUser(response.user)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      setError({ message: errorMessage })
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const register = useCallback(async (data: RegisterData) => {
    try {
      setError(null)
      setIsLoading(true)
      const response = await authService.register(data)
      setUser(response.user)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed'
      setError({ message: errorMessage })
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      setIsLoading(true)
      await authService.logout()
      setUser(null)
      setError(null)
    } catch (err) {
      console.error('Logout error:', err)
      // Even if logout fails, clear local state
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateProfile = useCallback(async (data: Partial<AuthUser>) => {
    if (!user) {
      throw new Error('No user logged in')
    }

    try {
      setError(null)
      const updatedUser = await authService.updateProfile(user.id, data)
      setUser(updatedUser)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Profile update failed'
      setError({ message: errorMessage })
      throw err
    }
  }, [user])

  const changePassword = useCallback(async (data: PasswordChangeRequest) => {
    try {
      setError(null)
      await authService.changePassword(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Password change failed'
      setError({ message: errorMessage })
      throw err
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)
    } catch (err) {
      console.error('Failed to refresh user:', err)
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user && authService.isAuthenticated(),
      isLoading,
      error,
      login,
      register,
      logout,
      updateProfile,
      changePassword,
      clearError,
      refreshUser
    }),
    [user, isLoading, error, login, register, logout, updateProfile, changePassword, clearError, refreshUser]
  )

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}