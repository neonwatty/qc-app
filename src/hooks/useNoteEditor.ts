'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useAutoSaveWithFeedback } from './useAutoSave'
import type { Note } from '@/types'

export type NotePrivacy = 'private' | 'shared' | 'draft'

export interface UseNoteEditorOptions {
  initialNote?: Note | null
  onSave: (note: Partial<Note>) => Promise<void>
  autoSave?: boolean
  autoSaveDelay?: number
  minLength?: number
  maxLength?: number
}

export interface UseNoteEditorReturn {
  // Content state
  content: string
  privacy: NotePrivacy
  isModified: boolean
  
  // Auto-save state
  isSaving: boolean
  lastSaved: Date | null
  error: Error | null
  saveCount: number
  showSaved: boolean
  
  // Actions
  setContent: (content: string) => void
  setPrivacy: (privacy: NotePrivacy) => void
  save: () => Promise<void>
  reset: () => void
  
  // Computed properties
  canSave: boolean
  isDraft: boolean
  wordCount: number
  charCount: number
  isValid: boolean
}

/**
 * Hook for managing note editor state with auto-save functionality
 * Handles content editing, privacy levels, draft workflow, and auto-save
 */
export function useNoteEditor({
  initialNote,
  onSave,
  autoSave = true,
  autoSaveDelay = 30000, // 30 seconds
  minLength = 0,
  maxLength = 5000
}: UseNoteEditorOptions): UseNoteEditorReturn {
  // Core state
  const [content, setContent] = useState(initialNote?.content || '')
  const [privacy, setPrivacy] = useState<NotePrivacy>(
    (initialNote?.privacy as NotePrivacy) || 'draft'
  )
  
  // Track initial state for modification detection
  const initialStateRef = useRef({
    content: initialNote?.content || '',
    privacy: (initialNote?.privacy as NotePrivacy) || 'draft'
  })
  
  // Update initial state when initialNote changes
  useEffect(() => {
    if (initialNote) {
      setContent(initialNote.content)
      setPrivacy((initialNote.privacy as NotePrivacy) || 'draft')
      initialStateRef.current = {
        content: initialNote.content,
        privacy: (initialNote.privacy as NotePrivacy) || 'draft'
      }
    }
  }, [initialNote])

  // Calculate modification state
  const isModified = content !== initialStateRef.current.content || 
                    privacy !== initialStateRef.current.privacy

  // Validation
  const charCount = content.length
  const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length
  const isValid = charCount >= minLength && charCount <= maxLength && content.trim().length > 0
  const canSave = isValid && isModified

  // Create note data for saving
  const createNoteData = useCallback((): Partial<Note> => {
    const noteData: Partial<Note> = {
      content: content.trim(),
      privacy,
      updatedAt: new Date()
    }

    // Include id if editing existing note
    if (initialNote?.id) {
      noteData.id = initialNote.id
    }

    // Set other fields if creating new note
    if (!initialNote?.id) {
      noteData.createdAt = new Date()
      // authorId, categoryId, checkInId would be set by the parent component
    }

    return noteData
  }, [content, privacy, initialNote])

  // Auto-save functionality
  const autoSaveState = useAutoSaveWithFeedback(
    { content, privacy },
    {
      enabled: autoSave && canSave,
      delay: autoSaveDelay,
      onSave: async () => {
        const noteData = createNoteData()
        await onSave(noteData)
      },
      onError: (error) => {
        console.error('Note auto-save failed:', error)
      },
      showNotification: true,
      notificationDuration: 2000
    }
  )

  // Manual save function
  const save = useCallback(async () => {
    if (!canSave) return

    try {
      const noteData = createNoteData()
      await onSave(noteData)
      
      // Update initial state after successful save
      initialStateRef.current = {
        content: content,
        privacy: privacy
      }
    } catch (error) {
      console.error('Manual save failed:', error)
      throw error
    }
  }, [canSave, createNoteData, onSave, content, privacy])

  // Reset to initial state
  const reset = useCallback(() => {
    setContent(initialStateRef.current.content)
    setPrivacy(initialStateRef.current.privacy)
    autoSaveState.reset()
  }, [autoSaveState])

  // Enhanced privacy setter with draft workflow logic
  const setPrivacyEnhanced = useCallback((newPrivacy: NotePrivacy) => {
    setPrivacy(newPrivacy)
    
    // Auto-save when changing from draft to shared (publishing)
    if (privacy === 'draft' && newPrivacy === 'shared' && canSave) {
      // Trigger immediate save for draft-to-shared transition
      setTimeout(() => {
        save().catch(console.error)
      }, 100)
    }
  }, [privacy, canSave, save])

  // Content setter with auto-formatting
  const setContentEnhanced = useCallback((newContent: string) => {
    // Basic formatting/sanitization
    let processedContent = newContent
    
    // Remove excessive whitespace
    processedContent = processedContent.replace(/\n{3,}/g, '\n\n')
    
    // Trim if exceeding max length
    if (processedContent.length > maxLength) {
      processedContent = processedContent.slice(0, maxLength)
    }
    
    setContent(processedContent)
  }, [maxLength])

  return {
    // Content state
    content,
    privacy,
    isModified,
    
    // Auto-save state
    isSaving: autoSaveState.isSaving,
    lastSaved: autoSaveState.lastSaved,
    error: autoSaveState.error,
    saveCount: autoSaveState.saveCount,
    showSaved: autoSaveState.showSaved,
    
    // Actions
    setContent: setContentEnhanced,
    setPrivacy: setPrivacyEnhanced,
    save,
    reset,
    
    // Computed properties
    canSave,
    isDraft: privacy === 'draft',
    wordCount,
    charCount,
    isValid
  }
}

/**
 * Hook for managing multiple note editors (for batch operations)
 */
export function useMultiNoteEditor(
  notes: (Note | null)[],
  onSave: (index: number, note: Partial<Note>) => Promise<void>
) {
  // Create stable editor configurations
  const editorConfigs = notes.map((note, index) => ({
    initialNote: note,
    onSave: (noteData: Partial<Note>) => onSave(index, noteData),
    autoSave: true
  }))
  
  // Use hooks in a stable way
  const editors = editorConfigs.map(config => 
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useNoteEditor(config)
  )

  const saveAll = useCallback(async () => {
    const savePromises = editors
      .filter(editor => editor.canSave)
      .map(editor => editor.save())
    
    await Promise.all(savePromises)
  }, [editors])

  const resetAll = useCallback(() => {
    editors.forEach(editor => editor.reset())
  }, [editors])

  const hasModifiedNotes = editors.some(editor => editor.isModified)
  const hasValidNotes = editors.some(editor => editor.isValid)
  const isAnySaving = editors.some(editor => editor.isSaving)

  return {
    editors,
    saveAll,
    resetAll,
    hasModifiedNotes,
    hasValidNotes,
    isAnySaving
  }
}

/**
 * Utility hook for note editor keyboard shortcuts
 */
export function useNoteEditorShortcuts(editor: UseNoteEditorReturn) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey
      
      // Save: Cmd/Ctrl + S
      if (isMod && e.key === 's') {
        e.preventDefault()
        if (editor.canSave) {
          editor.save()
        }
      }
      
      // Change privacy: Cmd/Ctrl + Shift + 1/2/3
      if (isMod && e.shiftKey) {
        switch (e.key) {
          case '1':
            e.preventDefault()
            editor.setPrivacy('shared')
            break
          case '2':
            e.preventDefault()
            editor.setPrivacy('private')
            break
          case '3':
            e.preventDefault()
            editor.setPrivacy('draft')
            break
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [editor])
}

/**
 * Hook for note templates and auto-completion
 */
export function useNoteTemplates() {
  const templates = React.useMemo(() => [
    {
      id: 'reflection',
      name: 'Reflection',
      content: 'Today I noticed...\n\nI felt...\n\nI learned...'
    },
    {
      id: 'gratitude',
      name: 'Gratitude',
      content: 'I\'m grateful for...\n\n1. \n2. \n3. '
    },
    {
      id: 'action',
      name: 'Action Plan',
      content: 'Goal: \n\nSteps:\n1. \n2. \n3. \n\nDeadline: '
    },
    {
      id: 'check-in',
      name: 'Check-in',
      content: 'How I\'m feeling: \n\nWhat\'s on my mind: \n\nWhat I need: '
    }
  ], [])

  const applyTemplate = useCallback((templateId: string, setContent: (content: string) => void) => {
    const template = templates.find(t => t.id === templateId)
    if (template) {
      setContent(template.content)
    }
  }, [templates])

  return {
    templates,
    applyTemplate
  }
}