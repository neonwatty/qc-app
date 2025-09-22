import { useContext } from 'react'
import { AuthContext } from '@/contexts/auth.context'
import type { AuthContextValue } from '@/contexts/auth.context'

// Hook to use auth context
export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider')
  }
  return context
}