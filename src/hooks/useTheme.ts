'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useLocalStorage } from './use-local-storage'

export type ThemeMode = 'light' | 'dark' | 'system'
export type ActualTheme = 'light' | 'dark'

export interface ThemeColors {
  primary: string
  secondary: string
  accent: string
  background: string
  foreground: string
  muted: string
  border: string
}

export interface ThemeSettings {
  mode: ThemeMode
  customColors: Partial<ThemeColors>
  fontSize: 'small' | 'medium' | 'large'
  contrast: 'normal' | 'high'
  reducedMotion: boolean
}

const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  mode: 'system',
  customColors: {},
  fontSize: 'medium',
  contrast: 'normal',
  reducedMotion: false,
}

const DEFAULT_COLORS: Record<ActualTheme, ThemeColors> = {
  light: {
    primary: '340 75% 55%',
    secondary: '210 40% 96.1%',
    accent: '210 40% 96.1%',
    background: '0 0% 100%',
    foreground: '222.2 84% 4.9%',
    muted: '210 40% 96.1%',
    border: '214.3 31.8% 91.4%',
  },
  dark: {
    primary: '340 75% 55%',
    secondary: '217.2 32.6% 17.5%',
    accent: '217.2 32.6% 17.5%',
    background: '222.2 84% 4.9%',
    foreground: '210 40% 98%',
    muted: '217.2 32.6% 17.5%',
    border: '217.2 32.6% 17.5%',
  },
}

export function useTheme() {
  const [settings, setSettings] = useLocalStorage<ThemeSettings>('theme-settings', DEFAULT_THEME_SETTINGS)
  const [systemTheme, setSystemTheme] = useState<ActualTheme>('light')
  const [isLoading, setIsLoading] = useState(true)

  // Detect system theme preference
  useEffect(() => {
    const detectSystemTheme = () => {
      if (typeof window !== 'undefined') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        setSystemTheme(isDark ? 'dark' : 'light')
        setIsLoading(false)
      }
    }

    detectSystemTheme()

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Determine actual theme to use
  const actualTheme = useMemo<ActualTheme>(() => {
    if (settings.mode === 'system') {
      return systemTheme
    }
    return settings.mode as ActualTheme
  }, [settings.mode, systemTheme])

  // Apply theme to document
  useEffect(() => {
    if (isLoading) return

    const root = document.documentElement
    
    // Apply theme class
    if (actualTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    // Apply custom colors
    const colors = { ...DEFAULT_COLORS[actualTheme], ...settings.customColors }
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value)
    })

    // Apply font size
    const fontSizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px',
    }
    root.style.fontSize = fontSizeMap[settings.fontSize]

    // Apply high contrast
    if (settings.contrast === 'high') {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }

    // Apply reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduce-motion')
    } else {
      root.classList.remove('reduce-motion')
    }
  }, [actualTheme, settings, isLoading])

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setSettings(prev => ({ ...prev, mode }))
  }, [setSettings])

  const setCustomColor = useCallback((colorKey: keyof ThemeColors, value: string) => {
    setSettings(prev => ({
      ...prev,
      customColors: {
        ...prev.customColors,
        [colorKey]: value,
      },
    }))
  }, [setSettings])

  const resetColors = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      customColors: {},
    }))
  }, [setSettings])

  const setFontSize = useCallback((fontSize: ThemeSettings['fontSize']) => {
    setSettings(prev => ({ ...prev, fontSize }))
  }, [setSettings])

  const setContrast = useCallback((contrast: ThemeSettings['contrast']) => {
    setSettings(prev => ({ ...prev, contrast }))
  }, [setSettings])

  const setReducedMotion = useCallback((reducedMotion: boolean) => {
    setSettings(prev => ({ ...prev, reducedMotion }))
  }, [setSettings])

  const resetAllSettings = useCallback(() => {
    setSettings(DEFAULT_THEME_SETTINGS)
  }, [setSettings])

  return {
    settings,
    actualTheme,
    systemTheme,
    isLoading,
    setThemeMode,
    setCustomColor,
    resetColors,
    setFontSize,
    setContrast,
    setReducedMotion,
    resetAllSettings,
    defaultColors: DEFAULT_COLORS[actualTheme],
  }
}