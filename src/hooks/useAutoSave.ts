'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useDebounce } from './use-debounce'

export interface AutoSaveOptions {
  enabled?: boolean
  delay?: number // milliseconds
  onSave: (value: any) => Promise<void> | void
  onError?: (error: Error) => void
  onSuccess?: () => void
  immediate?: boolean // Save immediately on first change
}

export interface AutoSaveState {
  isSaving: boolean
  lastSaved: Date | null
  error: Error | null
  saveCount: number
}

/**
 * Custom hook for auto-saving data with configurable delay
 * Default delay is 30 seconds (30000ms) as per requirements
 */
export function useAutoSave<T>(
  value: T,
  options: AutoSaveOptions
): AutoSaveState & { 
  save: () => Promise<void>
  reset: () => void 
} {
  const {
    enabled = true,
    delay = 30000, // 30 seconds default
    onSave,
    onError,
    onSuccess,
    immediate = false
  } = options

  const [state, setState] = useState<AutoSaveState>({
    isSaving: false,
    lastSaved: null,
    error: null,
    saveCount: 0
  })

  const debouncedValue = useDebounce(value, delay)
  const previousValueRef = useRef<T>(value)
  const isFirstChangeRef = useRef(true)
  const isMountedRef = useRef(true)

  // Track component mount status
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Manual save function
  const save = useCallback(async () => {
    if (!enabled || state.isSaving) return

    setState(prev => ({ ...prev, isSaving: true, error: null }))

    try {
      await onSave(value)
      
      if (isMountedRef.current) {
        setState(prev => ({
          ...prev,
          isSaving: false,
          lastSaved: new Date(),
          saveCount: prev.saveCount + 1
        }))
        onSuccess?.()
      }
    } catch (error) {
      if (isMountedRef.current) {
        const err = error instanceof Error ? error : new Error('Save failed')
        setState(prev => ({ ...prev, isSaving: false, error: err }))
        onError?.(err)
      }
    }
  }, [enabled, state.isSaving, value, onSave, onSuccess, onError])

  // Reset state
  const reset = useCallback(() => {
    setState({
      isSaving: false,
      lastSaved: null,
      error: null,
      saveCount: 0
    })
    previousValueRef.current = value
    isFirstChangeRef.current = true
  }, [value])

  // Auto-save on debounced value change
  useEffect(() => {
    if (!enabled) return

    // Skip if value hasn't changed
    const hasChanged = JSON.stringify(debouncedValue) !== JSON.stringify(previousValueRef.current)
    if (!hasChanged) return

    // Handle immediate save on first change
    if (immediate && isFirstChangeRef.current && hasChanged) {
      isFirstChangeRef.current = false
      save()
      previousValueRef.current = debouncedValue
      return
    }

    // Regular auto-save
    if (hasChanged) {
      save()
      previousValueRef.current = debouncedValue
    }
  }, [debouncedValue, enabled, immediate, save])


  return {
    ...state,
    save,
    reset
  }
}

/**
 * Hook for auto-saving with visual feedback
 */
export function useAutoSaveWithFeedback<T>(
  value: T,
  options: AutoSaveOptions & {
    showNotification?: boolean
    notificationDuration?: number
  }
) {
  const [showSaved, setShowSaved] = useState(false)
  const notificationTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const autoSave = useAutoSave(value, {
    ...options,
    onSuccess: () => {
      options.onSuccess?.()
      
      if (options.showNotification !== false) {
        setShowSaved(true)
        
        if (notificationTimeoutRef.current) {
          clearTimeout(notificationTimeoutRef.current)
        }
        
        notificationTimeoutRef.current = setTimeout(() => {
          setShowSaved(false)
        }, options.notificationDuration || 2000)
      }
    }
  })

  useEffect(() => {
    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current)
      }
    }
  }, [])

  return {
    ...autoSave,
    showSaved
  }
}

/**
 * Format last saved time for display
 */
export function formatLastSaved(lastSaved: Date | null): string {
  if (!lastSaved) return ''

  const now = new Date()
  const diff = now.getTime() - lastSaved.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 10) return 'Saved just now'
  if (seconds < 60) return `Saved ${seconds} seconds ago`
  if (minutes < 60) return `Saved ${minutes} minute${minutes !== 1 ? 's' : ''} ago`
  if (hours < 24) return `Saved ${hours} hour${hours !== 1 ? 's' : ''} ago`
  if (days < 7) return `Saved ${days} day${days !== 1 ? 's' : ''} ago`
  
  return `Saved on ${lastSaved.toLocaleDateString()}`
}

/**
 * Hook for managing multiple auto-save instances
 */
export function useMultiAutoSave<T extends Record<string, any>>(
  values: T,
  options: Omit<AutoSaveOptions, 'onSave'> & {
    onSave: (key: keyof T, value: T[keyof T]) => Promise<void> | void
  }
) {
  const [states, setStates] = useState<Record<keyof T, AutoSaveState>>(() => {
    const initialStates: Record<keyof T, AutoSaveState> = {} as any
    Object.keys(values).forEach(key => {
      initialStates[key as keyof T] = {
        isSaving: false,
        lastSaved: null,
        error: null,
        saveCount: 0
      }
    })
    return initialStates
  })

  const saves: Record<keyof T, () => Promise<void>> = {} as any

  Object.keys(values).forEach(key => {
    const k = key as keyof T
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const autoSave = useAutoSave(values[k], {
      ...options,
      onSave: (value) => options.onSave(k, value),
      onSuccess: () => {
        setStates(prev => ({
          ...prev,
          [k]: {
            ...prev[k],
            lastSaved: new Date(),
            saveCount: prev[k].saveCount + 1
          }
        }))
        options.onSuccess?.()
      }
    })

    saves[k] = autoSave.save
  })

  return {
    states,
    saves,
    saveAll: async () => {
      await Promise.all(Object.values(saves).map(save => (save as () => Promise<void>)()))
    }
  }
}