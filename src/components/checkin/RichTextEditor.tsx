'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  List,
  ListOrdered,
  Link,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Save,
  FileText,
  Clock,
  AlertCircle,
  Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { 
  applyFormat, 
  removeFormat, 
  countCharacters, 
  countWords, 
  formatShortcut,
  sanitizeText,
  toHTML,
  toPlainText,
  validateLength
} from '@/lib/text-formatting'
import { useAutoSaveWithFeedback, formatLastSaved } from '@/hooks/useAutoSave'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  onSave?: (value: string) => Promise<void> | void
  placeholder?: string
  label?: string
  helperText?: string
  autoSave?: boolean
  autoSaveDelay?: number
  minLength?: number
  maxLength?: number
  minHeight?: string
  maxHeight?: string
  showToolbar?: boolean
  showStats?: boolean
  className?: string
  disabled?: boolean
  isDraft?: boolean
}

interface FormatButton {
  icon: React.ComponentType<{ className?: string }>
  label: string
  format: any
  shortcut?: string[]
}

export default function RichTextEditor({
  value,
  onChange,
  onSave,
  placeholder = 'Start writing...',
  label,
  helperText,
  autoSave = true,
  autoSaveDelay = 30000, // 30 seconds
  minLength,
  maxLength = 5000,
  minHeight = '200px',
  maxHeight = '500px',
  showToolbar = true,
  showStats = true,
  className,
  disabled = false,
  isDraft = false
}: RichTextEditorProps) {
  const [selection, setSelection] = useState({ start: 0, end: 0 })
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [localValue, setLocalValue] = useState(value)

  // Auto-save functionality
  const {
    isSaving,
    lastSaved,
    error,
    saveCount,
    showSaved,
    save: manualSave
  } = useAutoSaveWithFeedback(localValue, {
    enabled: autoSave && !!onSave,
    delay: autoSaveDelay,
    onSave: async (content) => {
      if (onSave) {
        await onSave(sanitizeText(content))
      }
    },
    onError: (err) => {
      console.error('Auto-save failed:', err)
    },
    showNotification: true
  })

  // Text validation
  const validation = validateLength(localValue, minLength, maxLength)
  const charCount = countCharacters(localValue)
  const wordCount = countWords(localValue)

  // Sync value changes
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  // Format buttons configuration
  const formatButtons: FormatButton[] = [
    { icon: Bold, label: 'Bold', format: { bold: true }, shortcut: ['cmd', 'b'] },
    { icon: Italic, label: 'Italic', format: { italic: true }, shortcut: ['cmd', 'i'] },
    { icon: Underline, label: 'Underline', format: { underline: true }, shortcut: ['cmd', 'u'] },
    { icon: Strikethrough, label: 'Strikethrough', format: { strikethrough: true }, shortcut: ['cmd', 'shift', 's'] },
    { icon: Heading1, label: 'Heading 1', format: { heading: 1 }, shortcut: ['cmd', '1'] },
    { icon: Heading2, label: 'Heading 2', format: { heading: 2 }, shortcut: ['cmd', '2'] },
    { icon: Heading3, label: 'Heading 3', format: { heading: 3 }, shortcut: ['cmd', '3'] },
    { icon: List, label: 'Bullet List', format: { list: 'bullet' }, shortcut: ['cmd', 'shift', '8'] },
    { icon: ListOrdered, label: 'Numbered List', format: { list: 'ordered' }, shortcut: ['cmd', 'shift', '7'] },
    { icon: Quote, label: 'Quote', format: { blockquote: true }, shortcut: ['cmd', 'shift', '9'] }
  ]

  // Track selection
  const updateSelection = useCallback(() => {
    if (textareaRef.current) {
      setSelection({
        start: textareaRef.current.selectionStart,
        end: textareaRef.current.selectionEnd
      })
    }
  }, [])

  // Apply formatting
  const handleFormat = useCallback((format: any) => {
    if (disabled || !textareaRef.current) return

    const { start, end } = selection
    const hasSelection = start !== end

    if (!hasSelection) {
      // If no selection, apply format to word at cursor
      const beforeCursor = localValue.slice(0, start)
      const afterCursor = localValue.slice(start)
      const wordStart = beforeCursor.lastIndexOf(' ') + 1
      const wordEnd = afterCursor.indexOf(' ')
      const actualEnd = wordEnd === -1 ? localValue.length : start + wordEnd

      if (wordStart < actualEnd) {
        const { text } = applyFormat(localValue, wordStart, actualEnd, format)
        setLocalValue(text)
        onChange(text)
      }
    } else {
      const { text } = applyFormat(localValue, start, end, format)
      setLocalValue(text)
      onChange(text)
    }

    // Restore focus
    textareaRef.current.focus()
  }, [selection, localValue, onChange, disabled])

  // Handle link insertion
  const handleLink = useCallback(() => {
    if (disabled) return
    
    const { start, end } = selection
    if (start === end) return // Need selected text for link

    setIsLinkDialogOpen(true)
  }, [selection, disabled])

  const insertLink = useCallback(() => {
    if (!linkUrl) return

    const { start, end } = selection
    const { text } = applyFormat(localValue, start, end, { link: linkUrl })
    setLocalValue(text)
    onChange(text)
    setIsLinkDialogOpen(false)
    setLinkUrl('')
    textareaRef.current?.focus()
  }, [selection, localValue, linkUrl, onChange])

  // Clear formatting
  const handleClearFormat = useCallback(() => {
    if (disabled) return

    const { start, end } = selection
    const text = removeFormat(localValue, start, end)
    setLocalValue(text)
    onChange(text)
    textareaRef.current?.focus()
  }, [selection, localValue, onChange, disabled])

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const isMod = e.metaKey || e.ctrlKey

    if (isMod && e.key === 'b') {
      e.preventDefault()
      handleFormat({ bold: true })
    } else if (isMod && e.key === 'i') {
      e.preventDefault()
      handleFormat({ italic: true })
    } else if (isMod && e.key === 'u') {
      e.preventDefault()
      handleFormat({ underline: true })
    } else if (isMod && e.key === 's') {
      e.preventDefault()
      if (e.shiftKey) {
        handleFormat({ strikethrough: true })
      } else if (onSave) {
        manualSave()
      }
    } else if (isMod && e.key === 'k') {
      e.preventDefault()
      handleLink()
    } else if (isMod && e.key === '\\') {
      e.preventDefault()
      handleClearFormat()
    } else if (isMod && e.shiftKey) {
      if (e.key === '7') {
        e.preventDefault()
        handleFormat({ list: 'ordered' })
      } else if (e.key === '8') {
        e.preventDefault()
        handleFormat({ list: 'bullet' })
      } else if (e.key === '9') {
        e.preventDefault()
        handleFormat({ blockquote: true })
      }
    } else if (isMod && ['1', '2', '3'].includes(e.key)) {
      e.preventDefault()
      handleFormat({ heading: parseInt(e.key) as 1 | 2 | 3 })
    }
  }, [handleFormat, handleLink, handleClearFormat, onSave, manualSave])

  // Handle text change
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value
    setLocalValue(newValue)
    onChange(newValue)
    updateSelection()
  }, [onChange, updateSelection])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [localValue])

  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        {label && (
          <label className="text-sm font-medium text-gray-900">
            {label}
          </label>
        )}
        <div className="flex items-center gap-2">
          {isDraft && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
              <FileText className="h-3 w-3 mr-1" />
              Draft
            </span>
          )}
          {autoSave && lastSaved && (
            <span className="text-xs text-gray-500 flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {formatLastSaved(lastSaved)}
            </span>
          )}
          {showSaved && (
            <span className="text-xs text-green-600 flex items-center animate-pulse">
              <Check className="h-3 w-3 mr-1" />
              Saved
            </span>
          )}
        </div>
      </div>

      {/* Helper text */}
      {helperText && (
        <p className="text-sm text-gray-600">{helperText}</p>
      )}

      {/* Toolbar */}
      {showToolbar && !disabled && (
        <div className="bg-white border border-gray-200 rounded-t-lg p-2">
          <div className="flex flex-wrap items-center gap-1">
            {formatButtons.map((button) => {
              const Icon = button.icon
              return (
                <Button
                  key={button.label}
                  size="sm"
                  variant="ghost"
                  onClick={() => handleFormat(button.format)}
                  title={`${button.label} (${button.shortcut ? formatShortcut(button.shortcut) : ''})`}
                  className="h-8 w-8 p-0"
                >
                  <Icon className="h-4 w-4" />
                </Button>
              )
            })}
            <div className="w-px h-6 bg-gray-300 mx-1" />
            <Button
              size="sm"
              variant="ghost"
              onClick={handleLink}
              title={`Insert Link (${formatShortcut(['cmd', 'k'])})`}
              className="h-8 w-8 p-0"
            >
              <Link className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-gray-300 mx-1" />
            <Button
              size="sm"
              variant="ghost"
              onClick={handleClearFormat}
              title={`Clear Formatting (${formatShortcut(['cmd', '\\'])})`}
              className="h-8 px-2"
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Text area */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={localValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onSelect={updateSelection}
          onFocus={updateSelection}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'w-full px-4 py-3',
            'text-gray-900 placeholder-gray-500',
            'bg-white border border-gray-300',
            showToolbar && !disabled ? 'rounded-b-lg' : 'rounded-lg',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'resize-none overflow-hidden',
            'transition-all duration-200',
            'font-mono text-sm leading-relaxed',
            disabled && 'opacity-50 cursor-not-allowed bg-gray-50',
            isSaving && 'border-blue-300 bg-blue-50/30',
            !validation.valid && 'border-red-300 focus:ring-red-500',
            error && 'border-red-500'
          )}
          style={{
            minHeight,
            maxHeight
          }}
        />

        {/* Character count overlay */}
        {showStats && (
          <div className="absolute bottom-2 right-2 text-xs text-gray-400">
            {charCount}/{maxLength || '∞'}
          </div>
        )}
      </div>

      {/* Stats and validation bar */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4 text-gray-600">
          {showStats && (
            <>
              <span>{wordCount} words</span>
              <span>{charCount} characters</span>
            </>
          )}
          {!validation.valid && (
            <span className="flex items-center text-red-600">
              <AlertCircle className="h-3 w-3 mr-1" />
              {validation.message}
            </span>
          )}
          {error && (
            <span className="flex items-center text-red-600">
              <AlertCircle className="h-3 w-3 mr-1" />
              Save failed
            </span>
          )}
        </div>

        {onSave && (
          <Button
            size="sm"
            variant="ghost"
            onClick={manualSave}
            disabled={disabled || isSaving || !validation.valid}
          >
            <Save className={cn('h-4 w-4 mr-1.5', isSaving && 'animate-pulse')} />
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        )}
      </div>

      {/* Link dialog (simplified inline) */}
      {isLinkDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg p-6 w-96 space-y-4">
            <h3 className="text-lg font-semibold">Add Link</h3>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  insertLink()
                } else if (e.key === 'Escape') {
                  setIsLinkDialogOpen(false)
                  setLinkUrl('')
                }
              }}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsLinkDialogOpen(false)
                  setLinkUrl('')
                }}
              >
                Cancel
              </Button>
              <Button onClick={insertLink}>
                Add Link
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}