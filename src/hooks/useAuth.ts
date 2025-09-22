import { useContext } from 'react'
import { AuthContext } from '@/contexts/AuthContext'

export { useAuth } from '@/contexts/AuthContext'

// Additional auth-related hooks

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

/**
 * Hook to protect routes that require authentication
 * Redirects to login page if user is not authenticated
 */
export function useRequireAuth(redirectTo = '/login') {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo)
    }
  }, [isAuthenticated, isLoading, redirectTo, router])

  return { isAuthenticated, isLoading }
}

/**
 * Hook to protect routes that should only be accessible to guests
 * Redirects to dashboard if user is already authenticated
 */
export function useRequireGuest(redirectTo = '/dashboard') {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(redirectTo)
    }
  }, [isAuthenticated, isLoading, redirectTo, router])

  return { isAuthenticated, isLoading }
}

/**
 * Hook to check if user has a specific permission
 */
export function usePermission(permission: string): boolean {
  const { user } = useAuth()

  if (!user) return false

  // This is a placeholder implementation
  // In a real app, you would check user.permissions or user.role
  return true
}

/**
 * Hook to check if user has a specific role
 */
export function useRole(role: string): boolean {
  const { user } = useAuth()

  if (!user) return false

  // This is a placeholder implementation
  // In a real app, you would check user.role
  return true
}

/**
 * Hook to get the current user's couple information
 */
export function useCouple() {
  const { user } = useAuth()

  return {
    coupleId: user?.coupleId,
    partnerId: user?.partnerId,
    hasCouple: !!user?.coupleId
  }
}