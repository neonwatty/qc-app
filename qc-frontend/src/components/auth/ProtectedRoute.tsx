import type { ReactNode } from 'react'
import { useAuthContext } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: ReactNode
  fallback?: ReactNode
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuthContext()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <>{fallback || null}</>
  }

  return <>{children}</>
}

interface GuestOnlyRouteProps {
  children: ReactNode
  fallback?: ReactNode
}

export function GuestOnlyRoute({ children, fallback }: GuestOnlyRouteProps) {
  const { isAuthenticated, isLoading } = useAuthContext()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (isAuthenticated) {
    return <>{fallback || null}</>
  }

  return <>{children}</>
}