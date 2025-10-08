'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react'
import { cn } from '@/lib/utils'
import { Save, Trash2, FileText, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface BasicTextInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  helperText?: string
  onSave?: () => void
  onDelete?: () => void
  isDraft?: boolean
  autoSave?: boolean
  autoSaveDelay?: number
  minHeight?: string
  maxHeight?: string
  className?: string
  disabled?: boolean
}

export default function BasicTextInput({
  value,
  onChange,
  placeholder = 'Start typing...',
  label,
  helperText,
  onSave,
  onDelete,
  isDraft = false,
  autoSave = false,
  autoSaveDelay = 1000,
  minHeight = '120px',
  maxHeight = '400px',
  className,
  disabled = false
}: BasicTextInputProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [charCount, setCharCount] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Define handleSave first
  const handleSave = useCallback(async () => {
    if (!onSave || !value.trim()) return

    setIsSaving(true)
    try {
      await onSave()
      setLastSaved(new Date())
    } catch (error) {
      console.error('Failed to save:', error)
    } finally {
      setIsSaving(false)
    }
  }, [onSave, value])

  // Update character count
  useEffect(() => {
    setCharCount(value.length)
  }, [value])

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || !onSave || !value.trim()) return

    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    // Set new timeout for auto-save
    autoSaveTimeoutRef.current = setTimeout(() => {
      handleSave()
    }, autoSaveDelay)

    // Cleanup on unmount
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [value, autoSave, autoSaveDelay, handleSave, onSave])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [value])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }, [onChange])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Cmd/Ctrl + S to save
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault()
      handleSave()
    }
  }, [handleSave])

  const formatLastSaved = useCallback((date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const seconds = Math.floor(diff / 1000)

    if (seconds < 60) return 'Saved just now'
    if (seconds < 3600) return `Saved ${Math.floor(seconds / 60)} min ago`
    if (seconds < 86400) return `Saved ${Math.floor(seconds / 3600)} hours ago`
    return `Saved ${date.toLocaleDateString()}`
  }, [])

  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      {(label || isDraft) && (
        <div className="flex items-center justify-between">
          {label && (
            <label className="text-sm font-medium text-gray-900">
              {label}
            </label>
          )}
          {isDraft && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
              <FileText className="h-3 w-3 mr-1" />
              Draft
            </span>
          )}
        </div>
      )}

      {/* Helper text */}
      {helperText && (
        <p className="text-sm text-gray-600">{helperText}</p>
      )}

      {/* Text input area */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'w-full px-4 py-3',
            'text-gray-900 placeholder-gray-500',
            'bg-white border border-gray-300 rounded-lg',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'resize-none overflow-hidden',
            'transition-all duration-200',
            disabled && 'opacity-50 cursor-not-allowed bg-gray-50',
            isSaving && 'border-blue-300 bg-blue-50/30'
          )}
          style={{
            minHeight,
            maxHeight
          }}
        />

        {/* Character count */}
        <div className="absolute bottom-2 right-2 text-xs text-gray-400">
          {charCount} characters
        </div>
      </div>

      {/* Actions bar */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center space-x-2">
          {/* Save button */}
          {onSave && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleSave}
              disabled={!value.trim() || isSaving || disabled}
              className={cn(
                'transition-all duration-200',
                isSaving && 'bg-blue-50'
              )}
            >
              <Save className={cn(
                'h-4 w-4 mr-1.5',
                isSaving && 'animate-pulse'
              )} />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          )}

          {/* Delete button */}
          {onDelete && value.trim() && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onDelete}
              disabled={disabled}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              Delete
            </Button>
          )}
        </div>

        {/* Save status */}
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          {autoSave && (
            <span className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              Auto-save enabled
            </span>
          )}
          {lastSaved && (
            <span className="flex items-center">
              <svg className="h-3 w-3 mr-1 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {formatLastSaved(lastSaved)}
            </span>
          )}
        </div>
      </div>

      {/* Keyboard shortcuts hint */}
      {onSave && (
        <div className="text-xs text-gray-400">
          Tip: Press <kbd className="px-1 py-0.5 bg-gray-100 rounded">⌘</kbd> + <kbd className="px-1 py-0.5 bg-gray-100 rounded">S</kbd> to save
        </div>
      )}
    </div>
  )
}

