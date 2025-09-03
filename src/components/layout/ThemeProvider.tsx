'use client'

import React, { useEffect } from 'react'
import { useTheme } from '@/hooks/useTheme'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { isLoading } = useTheme()
  
  // Initialize theme on mount
  useEffect(() => {
    // The useTheme hook handles all the theme application logic
  }, [])
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }
  
  return <>{children}</>
}