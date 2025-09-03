'use client'

import React from 'react'
import { Sun, Moon, Monitor, Check } from 'lucide-react'
import { useTheme, ThemeMode } from '@/hooks/useTheme'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ThemeModeOption {
  mode: ThemeMode
  label: string
  description: string
  icon: React.ElementType
}

const themeModes: ThemeModeOption[] = [
  {
    mode: 'light',
    label: 'Light',
    description: 'Always use light theme',
    icon: Sun,
  },
  {
    mode: 'dark',
    label: 'Dark',
    description: 'Always use dark theme',
    icon: Moon,
  },
  {
    mode: 'system',
    label: 'System',
    description: 'Match system preference',
    icon: Monitor,
  },
]

export function ThemeSelector() {
  const { settings, setThemeMode, actualTheme } = useTheme()

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
          Theme Mode
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Choose how the app theme should be displayed
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {themeModes.map((option) => {
          const Icon = option.icon
          const isSelected = settings.mode === option.mode
          
          return (
            <Card
              key={option.mode}
              className={cn(
                'relative cursor-pointer p-4 transition-all hover:shadow-md',
                isSelected && 'ring-2 ring-pink-500 dark:ring-pink-400'
              )}
              onClick={() => setThemeMode(option.mode)}
            >
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <Check className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                </div>
              )}
              
              <div className="flex flex-col items-center text-center space-y-2">
                <Icon className="h-8 w-8 text-gray-700 dark:text-gray-300" />
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {option.label}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {option.description}
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Live Preview */}
      <div className="mt-6 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Current theme: <span className="font-medium">{actualTheme}</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div 
            className="p-3 rounded bg-white text-gray-900 border border-gray-200"
            style={{ 
              backgroundColor: actualTheme === 'light' ? 'white' : '#111827',
              color: actualTheme === 'light' ? '#111827' : '#f9fafb',
              borderColor: actualTheme === 'light' ? '#e5e7eb' : '#374151'
            }}
          >
            <div className="text-xs font-medium mb-1">Preview</div>
            <div className="text-xs opacity-75">
              This is how content will appear
            </div>
          </div>
          <div className="space-y-2">
            <div 
              className="h-3 rounded"
              style={{ 
                backgroundColor: actualTheme === 'light' ? '#ec4899' : '#db2777' 
              }}
            />
            <div 
              className="h-3 rounded"
              style={{ 
                backgroundColor: actualTheme === 'light' ? '#f3f4f6' : '#1f2937' 
              }}
            />
            <div 
              className="h-3 rounded w-2/3"
              style={{ 
                backgroundColor: actualTheme === 'light' ? '#e5e7eb' : '#374151' 
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}