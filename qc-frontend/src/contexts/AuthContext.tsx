import React, { useEffect, useState, useCallback, ReactNode } from 'react'
import { authManager } from '@/api/auth'
import type { User } from '@/types'
import type { LoginRequest, RegisterRequest } from '@/api/auth'
import { AuthContext, type AuthContextValue } from './auth.context'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize auth on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        setIsLoading(true)
        const currentUser = await authManager.initialize()
        setUser(currentUser)
      } catch (err) {
        console.error('Failed to initialize auth:', err)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()

    // Register logout callback
    const unsubscribe = authManager.onLogout(() => {
      setUser(null)
    })

    return unsubscribe
  }, [])

  // Login
  const login = useCallback(async (credentials: LoginRequest): Promise<User> => {
    try {
      setError(null)
      const response = await authManager.login(credentials)
      setUser(response.user)
      return response.user
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      setError(errorMessage)
      throw err
    }
  }, [])

  // Register
  const register = useCallback(async (data: RegisterRequest): Promise<User> => {
    try {
      setError(null)
      const response = await authManager.register(data)
      setUser(response.user)
      return response.user
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed'
      setError(errorMessage)
      throw err
    }
  }, [])

  // Logout
  const logout = useCallback(async () => {
    try {
      await authManager.logout()
      setUser(null)
    } catch (err) {
      console.error('Logout error:', err)
      // Even if logout fails, clear local auth
      authManager.clearAuth()
      setUser(null)
    }
  }, [])

  // Refresh user
  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await authManager.getCurrentUser(true)
      setUser(currentUser)
    } catch (err) {
      console.error('Failed to refresh user:', err)
    }
  }, [])

  // Update profile
  const updateProfile = useCallback(async (data: Partial<User>): Promise<User> => {
    if (!user) throw new Error('No user logged in')

    try {
      setError(null)
      const updatedUser = await authManager.updateProfile(user.id, data)
      setUser(updatedUser)
      return updatedUser
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Profile update failed'
      setError(errorMessage)
      throw err
    }
  }, [user])

  // Change password
  const changePassword = useCallback(async (oldPassword: string, newPassword: string) => {
    try {
      setError(null)
      await authManager.changePassword(oldPassword, newPassword)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Password change failed'
      setError(errorMessage)
      throw err
    }
  }, [])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!(user && authManager.isAuthenticated()),
    isLoading,
    error,
    login,
    register,
    logout,
    refreshUser,
    clearError,
    updateProfile,
    changePassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}