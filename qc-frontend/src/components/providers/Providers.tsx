'use client'

import React from 'react'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { CheckInProvider } from '@/contexts/CheckInContext'
import { SessionSettingsProvider } from '@/contexts/SessionSettingsContext'
import { BookendsProvider } from '@/contexts/BookendsContext'
import { LoveLanguagesProvider } from '@/contexts/LoveLanguagesContext'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <CheckInProvider>
        <SessionSettingsProvider>
          <BookendsProvider>
            <LoveLanguagesProvider>
              {children}
            </LoveLanguagesProvider>
          </BookendsProvider>
        </SessionSettingsProvider>
      </CheckInProvider>
    </ThemeProvider>
  )
}