import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from './redux'
import { authManager, setupAutoRefresh, stopAutoRefresh } from '@/api/auth'
import type { User } from '@/types'
import type { LoginRequest, RegisterRequest } from '@/api/auth'

interface UseAuthReturn {
  // State
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  login: (credentials: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>
  requestPasswordReset: (email: string) => Promise<void>
  resetPassword: (token: string, newPassword: string) => Promise<void>
  refreshUser: () => Promise<void>
  clearError: () => void
}

export function useAuth(): UseAuthReturn {
  const navigate = useNavigate()
  const reduxUser = useAppSelector(state => state.auth.user)

  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize auth from stored tokens
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

    // Setup auto-refresh
    setupAutoRefresh()

    // Register logout callback
    const unsubscribe = authManager.onLogout(() => {
      setUser(null)
      navigate('/login')
    })

    return () => {
      unsubscribe()
      stopAutoRefresh()
    }
  }, [navigate])

  // Sync with Redux state if needed
  useEffect(() => {
    if (reduxUser && !user) {
      setUser(reduxUser)
    }
  }, [reduxUser, user])

  // Login
  const login = useCallback(async (credentials: LoginRequest) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await authManager.login(credentials)
      setUser(response.user)

      // Navigate to dashboard after successful login
      navigate('/dashboard')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [navigate])

  // Register
  const register = useCallback(async (data: RegisterRequest) => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await authManager.register(data)
      setUser(response.user)

      // Navigate to onboarding after successful registration
      navigate('/onboarding')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [navigate])

  // Logout
  const logout = useCallback(async () => {
    try {
      setIsLoading(true)
      await authManager.logout()
      setUser(null)
      navigate('/')
    } catch (err) {
      console.error('Logout error:', err)
      // Even if logout fails, clear local auth
      authManager.clearAuth()
      setUser(null)
      navigate('/')
    } finally {
      setIsLoading(false)
    }
  }, [navigate])

  // Update profile
  const updateProfile = useCallback(async (data: Partial<User>) => {
    if (!user) throw new Error('No user logged in')

    try {
      setIsLoading(true)
      setError(null)

      const updatedUser = await authManager.updateProfile(user.id, data)
      setUser(updatedUser)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Profile update failed'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [user])

  // Change password
  const changePassword = useCallback(async (oldPassword: string, newPassword: string) => {
    try {
      setIsLoading(true)
      setError(null)

      await authManager.changePassword(oldPassword, newPassword)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Password change failed'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Request password reset
  const requestPasswordReset = useCallback(async (email: string) => {
    try {
      setIsLoading(true)
      setError(null)

      await authManager.requestPasswordReset(email)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Password reset request failed'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Reset password
  const resetPassword = useCallback(async (token: string, newPassword: string) => {
    try {
      setIsLoading(true)
      setError(null)

      await authManager.resetPassword(token, newPassword)
      navigate('/login')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Password reset failed'
      setError(errorMessage)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [navigate])

  // Refresh user data
  const refreshUser = useCallback(async () => {
    if (!authManager.isAuthenticated()) return

    try {
      setIsLoading(true)
      const currentUser = await authManager.getCurrentUser(true)
      setUser(currentUser)
    } catch (err) {
      console.error('Failed to refresh user:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Compute isAuthenticated
  const isAuthenticated = useMemo(() => {
    return !!(user && authManager.isAuthenticated())
  }, [user])

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    requestPasswordReset,
    resetPassword,
    refreshUser,
    clearError,
  }
}

// Hook for protected routes
export function useRequireAuth(redirectTo = '/login'): UseAuthReturn & { isReady: boolean } {
  const auth = useAuth()
  const navigate = useNavigate()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (!auth.isLoading) {
      if (!auth.isAuthenticated) {
        navigate(redirectTo)
      } else {
        setIsReady(true)
      }
    }
  }, [auth.isLoading, auth.isAuthenticated, navigate, redirectTo])

  return { ...auth, isReady }
}

// Hook for guest routes (redirect if authenticated)
export function useGuestOnly(redirectTo = '/dashboard'): UseAuthReturn & { isReady: boolean } {
  const auth = useAuth()
  const navigate = useNavigate()
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (!auth.isLoading) {
      if (auth.isAuthenticated) {
        navigate(redirectTo)
      } else {
        setIsReady(true)
      }
    }
  }, [auth.isLoading, auth.isAuthenticated, navigate, redirectTo])

  return { ...auth, isReady }
}

// Hook to check specific permissions
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function usePermission(permission: string): boolean {
  const { user } = useAuth()

  // Implement permission checking logic based on your requirements
  // This is a placeholder implementation
  if (!user) return false

  // Example: Check if user has specific role or permission
  // return user.permissions?.includes(permission) ?? false

  // For now, return true for authenticated users
  return true
}

// Hook for role-based access
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useRole(requiredRole: string): boolean {
  const { user } = useAuth()

  if (!user) return false

  // Example role checking (adjust based on your User type)
  // return user.role === requiredRole

  // Placeholder implementation
  return true
}