'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useLocalStorage } from './use-local-storage'
import { useDebounce } from './use-debounce'
import type { Note } from '@/types'
import type { NoteTag } from '@/components/notes/TagManager'

export interface UseNoteTagsOptions {
  initialTags?: NoteTag[]
  autoSave?: boolean
  storageKey?: string
}

export interface TagStats {
  totalTags: number
  usedTags: number
  unusedTags: number
  averageTagsPerNote: number
  mostUsedTags: Array<{ tag: NoteTag; count: number }>
  recentlyUsedTags: NoteTag[]
  systemTags: number
  userTags: number
}

export interface BulkTagOperation {
  type: 'add' | 'remove' | 'replace'
  tagIds: string[]
  noteIds: string[]
}

/**
 * Custom hook for managing note tags with comprehensive functionality
 */
export function useNoteTags({
  initialTags = [],
  autoSave = true,
  storageKey = 'qc-note-tags'
}: UseNoteTagsOptions = {}) {
  // Persistent tag storage
  const [storedTags, setStoredTags] = useLocalStorage<NoteTag[]>(storageKey, initialTags)
  const [tags, setTags] = useState<NoteTag[]>(storedTags)

  // Tag suggestions and auto-complete
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  // Auto-save tags to localStorage
  useEffect(() => {
    if (autoSave) {
      setStoredTags(tags)
    }
  }, [tags, autoSave, setStoredTags])

  // Generate tag suggestions based on search term
  useEffect(() => {
    if (debouncedSearchTerm.length < 2) {
      setSuggestions([])
      return
    }

    const term = debouncedSearchTerm.toLowerCase()
    const matchingTags = tags
      .filter(tag => 
        tag.name.toLowerCase().includes(term) ||
        tag.description?.toLowerCase().includes(term)
      )
      .map(tag => tag.name)
      .slice(0, 8)

    setSuggestions(matchingTags)
  }, [debouncedSearchTerm, tags])

  // Create a new tag
  const createTag = useCallback((
    tagData: Omit<NoteTag, 'id' | 'createdAt' | 'updatedAt' | 'noteCount' | 'lastUsed'>
  ): NoteTag => {
    const newTag: NoteTag = {
      id: `tag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...tagData,
      createdAt: new Date(),
      updatedAt: new Date(),
      noteCount: 0,
      lastUsed: undefined
    }

    setTags(prev => [...prev, newTag])
    return newTag
  }, [])

  // Update an existing tag
  const updateTag = useCallback((tagId: string, updates: Partial<NoteTag>) => {
    setTags(prev => prev.map(tag => 
      tag.id === tagId 
        ? { ...tag, ...updates, updatedAt: new Date() }
        : tag
    ))
  }, [])

  // Delete a tag
  const deleteTag = useCallback((tagId: string) => {
    setTags(prev => prev.filter(tag => tag.id !== tagId))
  }, [])

  // Get or create tag by name
  const getOrCreateTag = useCallback((name: string, color?: string): NoteTag => {
    const existingTag = tags.find(tag => 
      tag.name.toLowerCase() === name.toLowerCase()
    )

    if (existingTag) {
      return existingTag
    }

    return createTag({
      name: name.trim(),
      color: color || generateRandomColor(),
      description: undefined
    })
  }, [tags, createTag])

  // Update tag usage statistics
  const updateTagUsage = useCallback((tagIds: string[], noteId: string) => {
    setTags(prev => prev.map(tag => {
      if (tagIds.includes(tag.id)) {
        return {
          ...tag,
          noteCount: tag.noteCount + 1,
          lastUsed: new Date(),
          updatedAt: new Date()
        }
      }
      return tag
    }))
  }, [])

  // Batch tag operations
  const bulkTagOperation = useCallback((operation: BulkTagOperation, notes: Note[]) => {
    const { type, tagIds, noteIds } = operation
    const affectedNotes = notes.filter(note => noteIds.includes(note.id))

    switch (type) {
      case 'add':
        // Add tags to notes and update usage
        affectedNotes.forEach(note => {
          const currentTags = note.tags || []
          const newTags = Array.from(new Set([...currentTags, ...tagIds]))
          // This would typically update the note in the parent component
          // For now, we just update tag usage statistics
        })
        
        setTags(prev => prev.map(tag => {
          if (tagIds.includes(tag.id)) {
            return {
              ...tag,
              noteCount: tag.noteCount + affectedNotes.length,
              lastUsed: new Date(),
              updatedAt: new Date()
            }
          }
          return tag
        }))
        break

      case 'remove':
        // Remove tags from notes and update usage
        setTags(prev => prev.map(tag => {
          if (tagIds.includes(tag.id)) {
            return {
              ...tag,
              noteCount: Math.max(0, tag.noteCount - affectedNotes.length),
              updatedAt: new Date()
            }
          }
          return tag
        }))
        break

      case 'replace':
        // Replace existing tags with new ones
        affectedNotes.forEach(note => {
          const currentTags = note.tags || []
          // Remove old tags, add new ones
          // This would typically be handled in the parent component
        })
        break
    }
  }, [])

  // Get tag statistics
  const getTagStats = useCallback((notes: Note[]): TagStats => {
    const allNoteTags = notes.flatMap(note => note.tags || [])
    const tagUsageCounts = allNoteTags.reduce((acc, tagId) => {
      acc[tagId] = (acc[tagId] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const usedTagIds = Object.keys(tagUsageCounts)
    const mostUsedTags = tags
      .map(tag => ({ 
        tag, 
        count: tagUsageCounts[tag.id] || 0 
      }))
      .filter(item => item.count > 0)
      .sort((a, b) => b.count - a.count)

    const recentlyUsedTags = tags
      .filter(tag => tag.lastUsed)
      .sort((a, b) => (b.lastUsed?.getTime() || 0) - (a.lastUsed?.getTime() || 0))
      .slice(0, 10)

    return {
      totalTags: tags.length,
      usedTags: usedTagIds.length,
      unusedTags: tags.length - usedTagIds.length,
      averageTagsPerNote: notes.length > 0 ? allNoteTags.length / notes.length : 0,
      mostUsedTags: mostUsedTags.slice(0, 10),
      recentlyUsedTags,
      systemTags: tags.filter(tag => tag.isSystem).length,
      userTags: tags.filter(tag => !tag.isSystem).length
    }
  }, [tags])

  // Smart tag suggestions based on note content and existing tags
  const getSmartSuggestions = useCallback((noteContent: string, existingTagIds: string[] = []) => {
    const words = noteContent.toLowerCase().split(/\s+/)
    const relevantTags = tags.filter(tag => {
      if (existingTagIds.includes(tag.id)) return false
      
      const tagWords = tag.name.toLowerCase().split(/\s+/)
      const descWords = (tag.description || '').toLowerCase().split(/\s+/)
      
      // Check if any tag words appear in the content
      return tagWords.some(word => words.includes(word)) ||
             descWords.some(word => words.includes(word))
    })

    return relevantTags
      .sort((a, b) => (b.lastUsed?.getTime() || 0) - (a.lastUsed?.getTime() || 0))
      .slice(0, 5)
  }, [tags])

  // Filter tags by various criteria
  const filterTags = useCallback((filters: {
    search?: string
    color?: string
    isSystem?: boolean
    isFavorite?: boolean
    hasNotes?: boolean
    sortBy?: 'name' | 'usage' | 'created' | 'updated'
  }) => {
    let filtered = [...tags]

    if (filters.search) {
      const term = filters.search.toLowerCase()
      filtered = filtered.filter(tag =>
        tag.name.toLowerCase().includes(term) ||
        tag.description?.toLowerCase().includes(term)
      )
    }

    if (filters.color) {
      filtered = filtered.filter(tag => tag.color === filters.color)
    }

    if (filters.isSystem !== undefined) {
      filtered = filtered.filter(tag => Boolean(tag.isSystem) === filters.isSystem)
    }

    if (filters.isFavorite !== undefined) {
      filtered = filtered.filter(tag => Boolean(tag.isFavorite) === filters.isFavorite)
    }

    if (filters.hasNotes !== undefined) {
      filtered = filtered.filter(tag => (tag.noteCount > 0) === filters.hasNotes)
    }

    // Sort results
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        switch (filters.sortBy) {
          case 'name':
            return a.name.localeCompare(b.name)
          case 'usage':
            return b.noteCount - a.noteCount
          case 'created':
            return b.createdAt.getTime() - a.createdAt.getTime()
          case 'updated':
            return b.updatedAt.getTime() - a.updatedAt.getTime()
          default:
            return 0
        }
      })
    }

    return filtered
  }, [tags])

  // Export tags for backup/sync
  const exportTags = useCallback(() => {
    return {
      tags,
      exportedAt: new Date(),
      version: '1.0'
    }
  }, [tags])

  // Import tags from backup/sync
  const importTags = useCallback((data: { tags: NoteTag[]; version?: string }) => {
    setTags(data.tags)
  }, [])

  // Initialize with system tags if none exist
  useEffect(() => {
    if (tags.length === 0) {
      const systemTags: Omit<NoteTag, 'id' | 'createdAt' | 'updatedAt' | 'noteCount'>[] = [
        {
          name: 'Important',
          color: '#ef4444',
          description: 'High priority items',
          isSystem: true,
          isFavorite: true
        },
        {
          name: 'Personal',
          color: '#3b82f6',
          description: 'Personal reflections and thoughts',
          isSystem: true
        },
        {
          name: 'Relationship',
          color: '#ec4899',
          description: 'Relationship-related notes',
          isSystem: true
        },
        {
          name: 'Goals',
          color: '#22c55e',
          description: 'Future goals and aspirations',
          isSystem: true
        },
        {
          name: 'Action Item',
          color: '#f97316',
          description: 'Tasks and follow-up items',
          isSystem: true
        }
      ]

      systemTags.forEach(tagData => createTag(tagData))
    }
  }, [tags.length, createTag])

  return {
    // Tag data
    tags,
    suggestions,
    searchTerm,
    
    // Tag operations
    createTag,
    updateTag,
    deleteTag,
    getOrCreateTag,
    updateTagUsage,
    bulkTagOperation,
    
    // Search and suggestions
    setSearchTerm,
    getSmartSuggestions,
    filterTags,
    
    // Statistics and analytics
    getTagStats,
    
    // Import/Export
    exportTags,
    importTags,
    
    // Computed values
    totalTags: tags.length,
    systemTags: tags.filter(tag => tag.isSystem),
    userTags: tags.filter(tag => !tag.isSystem),
    favoriteTags: tags.filter(tag => tag.isFavorite)
  }
}

/**
 * Hook for managing tag colors with predefined palette
 */
export function useTagColors() {
  const colors = useMemo(() => [
    { name: 'Red', value: '#ef4444', bg: 'bg-red-500', text: 'text-red-700', light: 'bg-red-100' },
    { name: 'Orange', value: '#f97316', bg: 'bg-orange-500', text: 'text-orange-700', light: 'bg-orange-100' },
    { name: 'Yellow', value: '#eab308', bg: 'bg-yellow-500', text: 'text-yellow-700', light: 'bg-yellow-100' },
    { name: 'Green', value: '#22c55e', bg: 'bg-green-500', text: 'text-green-700', light: 'bg-green-100' },
    { name: 'Blue', value: '#3b82f6', bg: 'bg-blue-500', text: 'text-blue-700', light: 'bg-blue-100' },
    { name: 'Indigo', value: '#6366f1', bg: 'bg-indigo-500', text: 'text-indigo-700', light: 'bg-indigo-100' },
    { name: 'Purple', value: '#a855f7', bg: 'bg-purple-500', text: 'text-purple-700', light: 'bg-purple-100' },
    { name: 'Pink', value: '#ec4899', bg: 'bg-pink-500', text: 'text-pink-700', light: 'bg-pink-100' },
    { name: 'Gray', value: '#6b7280', bg: 'bg-gray-500', text: 'text-gray-700', light: 'bg-gray-100' }
  ], [])

  const getColorInfo = useCallback((colorValue: string) => {
    return colors.find(color => color.value === colorValue) || colors[0]
  }, [colors])

  const getRandomColor = useCallback(() => {
    return colors[Math.floor(Math.random() * colors.length)]
  }, [colors])

  return {
    colors,
    getColorInfo,
    getRandomColor
  }
}

/**
 * Utility function to generate random color
 */
function generateRandomColor(): string {
  const colors = [
    '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6',
    '#6366f1', '#a855f7', '#ec4899', '#6b7280'
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

/**
 * Hook for tag analytics and insights
 */
export function useTagAnalytics(notes: Note[], tags: NoteTag[]) {
  const analytics = useMemo(() => {
    const allTagIds = notes.flatMap(note => note.tags || [])
    const tagUsage = allTagIds.reduce((acc, tagId) => {
      acc[tagId] = (acc[tagId] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const tagsByPopularity = tags
      .map(tag => ({
        ...tag,
        usage: tagUsage[tag.id] || 0
      }))
      .sort((a, b) => b.usage - a.usage)

    const unusedTags = tags.filter(tag => !tagUsage[tag.id])
    
    const tagCooccurrence = new Map<string, Map<string, number>>()
    notes.forEach(note => {
      const noteTags = note.tags || []
      noteTags.forEach(tagA => {
        if (!tagCooccurrence.has(tagA)) {
          tagCooccurrence.set(tagA, new Map())
        }
        noteTags.forEach(tagB => {
          if (tagA !== tagB) {
            const coMap = tagCooccurrence.get(tagA)!
            coMap.set(tagB, (coMap.get(tagB) || 0) + 1)
          }
        })
      })
    })

    return {
      tagsByPopularity,
      unusedTags,
      totalUsage: allTagIds.length,
      uniqueTagsUsed: Object.keys(tagUsage).length,
      averageTagsPerNote: notes.length > 0 ? allTagIds.length / notes.length : 0,
      tagCooccurrence,
      mostFrequentCombinations: Array.from(tagCooccurrence.entries())
        .flatMap(([tagA, coMap]) =>
          Array.from(coMap.entries()).map(([tagB, count]) => ({
            tags: [tagA, tagB],
            count
          }))
        )
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
    }
  }, [notes, tags])

  return analytics
}