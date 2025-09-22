'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
  requireCouple?: boolean
}

export function ProtectedRoute({
  children,
  redirectTo = '/login',
  requireCouple = false
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push(redirectTo)
      } else if (requireCouple && !user?.coupleId) {
        router.push('/onboarding/couple')
      }
    }
  }, [isAuthenticated, isLoading, user, requireCouple, redirectTo, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  if (requireCouple && !user?.coupleId) {
    return null
  }

  return <>{children}</>
}

interface GuestRouteProps {
  children: React.ReactNode
  redirectTo?: string
}

export function GuestRoute({
  children,
  redirectTo = '/dashboard'
}: GuestRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(redirectTo)
    }
  }, [isAuthenticated, isLoading, redirectTo, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100" />
      </div>
    )
  }

  if (isAuthenticated) {
    return null
  }

  return <>{children}</>
}