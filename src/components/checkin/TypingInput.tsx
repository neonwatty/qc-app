'use client'

import React, { useCallback, useRef, useEffect } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'

export interface TypingInputProps {
  value: string
  onChange: (value: string) => void
  onTypingStart?: () => void
  onTypingStop?: () => void
  placeholder?: string
  className?: string
  multiline?: boolean
  maxLength?: number
  disabled?: boolean
  autoFocus?: boolean
  typingTimeout?: number
}

/**
 * Input component with typing indicator support
 * Fires typing start/stop events for real-time collaboration
 */
export function TypingInput({
  value,
  onChange,
  onTypingStart,
  onTypingStop,
  placeholder,
  className,
  multiline = false,
  maxLength,
  disabled,
  autoFocus,
  typingTimeout = 1500
}: TypingInputProps) {
  const typingTimerRef = useRef<NodeJS.Timeout | undefined>()
  const isTypingRef = useRef(false)

  // Handle typing events
  const handleTypingStart = useCallback(() => {
    if (!isTypingRef.current) {
      isTypingRef.current = true
      onTypingStart?.()
    }

    // Clear existing timer
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current)
    }

    // Set new timer to stop typing
    typingTimerRef.current = setTimeout(() => {
      if (isTypingRef.current) {
        isTypingRef.current = false
        onTypingStop?.()
      }
    }, typingTimeout)
  }, [onTypingStart, onTypingStop, typingTimeout])

  // Handle input change
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value

    // Respect max length
    if (maxLength && newValue.length > maxLength) {
      return
    }

    onChange(newValue)
    handleTypingStart()
  }, [onChange, handleTypingStart, maxLength])

  // Stop typing on blur
  const handleBlur = useCallback(() => {
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current)
    }
    if (isTypingRef.current) {
      isTypingRef.current = false
      onTypingStop?.()
    }
  }, [onTypingStop])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current)
      }
      if (isTypingRef.current) {
        onTypingStop?.()
      }
    }
  }, [onTypingStop])

  const commonProps = {
    value,
    onChange: handleChange,
    onBlur: handleBlur,
    placeholder,
    className,
    disabled,
    autoFocus
  }

  if (multiline) {
    return (
      <Textarea
        {...commonProps}
        maxLength={maxLength}
      />
    )
  }

  return (
    <Input
      {...commonProps}
      type="text"
      maxLength={maxLength}
    />
  )
}

/**
 * Hook for managing typing state in forms
 */
export function useTypingState(onTypingChange?: (isTyping: boolean) => void) {
  const [isTyping, setIsTyping] = React.useState(false)
  const typingTimerRef = useRef<NodeJS.Timeout | undefined>()

  const startTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true)
      onTypingChange?.(true)
    }

    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current)
    }

    typingTimerRef.current = setTimeout(() => {
      setIsTyping(false)
      onTypingChange?.(false)
    }, 1500)
  }, [isTyping, onTypingChange])

  const stopTyping = useCallback(() => {
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current)
    }
    setIsTyping(false)
    onTypingChange?.(false)
  }, [onTypingChange])

  useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current)
      }
    }
  }, [])

  return {
    isTyping,
    startTyping,
    stopTyping
  }
}