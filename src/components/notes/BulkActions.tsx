'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckSquare, 
  Square, 
  Trash2, 
  Tag, 
  Archive, 
  Share2, 
  Eye, 
  EyeOff, 
  FileText,
  Folder,
  Copy,
  Download,
  MoreHorizontal,
  X,
  AlertCircle,
  Check,
  ArrowRight,
  Star,
  Clock
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import TagManager, { NoteTag } from './TagManager'
import { PrivacySelector, NotePrivacy } from './PrivacySelector'
import type { Note } from '@/types'

export interface BulkOperation {
  id: string
  type: 'tag' | 'untag' | 'privacy' | 'category' | 'delete' | 'archive' | 'duplicate' | 'export'
  label: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  requiresConfirmation?: boolean
  requiresInput?: boolean
  destructive?: boolean
}

const BULK_OPERATIONS: BulkOperation[] = [
  {
    id: 'add-tags',
    type: 'tag',
    label: 'Add Tags',
    icon: Tag,
    description: 'Add tags to selected notes',
    requiresInput: true
  },
  {
    id: 'remove-tags',
    type: 'untag',
    label: 'Remove Tags',
    icon: Tag,
    description: 'Remove tags from selected notes',
    requiresInput: true
  },
  {
    id: 'change-privacy',
    type: 'privacy',
    label: 'Change Privacy',
    icon: Eye,
    description: 'Update privacy level of selected notes',
    requiresInput: true
  },
  {
    id: 'change-category',
    type: 'category',
    label: 'Change Category',
    icon: Folder,
    description: 'Move selected notes to a different category',
    requiresInput: true
  },
  {
    id: 'duplicate',
    type: 'duplicate',
    label: 'Duplicate',
    icon: Copy,
    description: 'Create copies of selected notes'
  },
  {
    id: 'export',
    type: 'export',
    label: 'Export',
    icon: Download,
    description: 'Export selected notes to file'
  },
  {
    id: 'archive',
    type: 'archive',
    label: 'Archive',
    icon: Archive,
    description: 'Archive selected notes',
    requiresConfirmation: true
  },
  {
    id: 'delete',
    type: 'delete',
    label: 'Delete',
    icon: Trash2,
    description: 'Permanently delete selected notes',
    requiresConfirmation: true,
    destructive: true
  }
]

interface BulkActionsProps {
  notes: Note[]
  selectedNotes: string[]
  availableTags: NoteTag[]
  availableCategories: string[]
  onSelectionChange: (noteIds: string[]) => void
  onBulkOperation: (operation: string, noteIds: string[], params?: any) => Promise<void>
  isVisible?: boolean
  maxVisible?: number
  className?: string
}

export default function BulkActions({
  notes,
  selectedNotes,
  availableTags,
  availableCategories,
  onSelectionChange,
  onBulkOperation,
  isVisible = true,
  maxVisible = 8,
  className
}: BulkActionsProps) {
  const [activeOperation, setActiveOperation] = useState<string | null>(null)
  const [isConfirming, setIsConfirming] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [operationParams, setOperationParams] = useState<any>({})

  // Calculate selection stats
  const selectionStats = useMemo(() => {
    const selectedNotesData = notes.filter(note => selectedNotes.includes(note.id))
    
    const privacy = {
      private: selectedNotesData.filter(n => n.privacy === 'private').length,
      shared: selectedNotesData.filter(n => n.privacy === 'shared').length,
      draft: selectedNotesData.filter(n => n.privacy === 'draft').length
    }

    const categories = selectedNotesData.reduce((acc, note) => {
      if (note.categoryId) {
        acc[note.categoryId] = (acc[note.categoryId] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    const allTags = selectedNotesData.flatMap(note => note.tags || [])
    const tagCounts = allTags.reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      total: selectedNotes.length,
      privacy,
      categories: Object.entries(categories),
      tags: Object.entries(tagCounts).sort((a, b) => b[1] - a[1]),
      averageTagsPerNote: allTags.length / selectedNotesData.length || 0
    }
  }, [notes, selectedNotes])

  // Handle select all / deselect all
  const handleSelectAll = useCallback(() => {
    const visibleNoteIds = notes.slice(0, maxVisible).map(note => note.id)
    const allSelected = visibleNoteIds.every(id => selectedNotes.includes(id))
    
    if (allSelected) {
      // Deselect all visible notes
      const newSelection = selectedNotes.filter((id: string) => !visibleNoteIds.includes(id))
      onSelectionChange(newSelection)
    } else {
      // Select all visible notes
      const newSelection = Array.from(new Set([...selectedNotes, ...visibleNoteIds]))
      onSelectionChange(newSelection)
    }
  }, [notes, maxVisible, selectedNotes, onSelectionChange])

  // Handle individual note selection
  const handleNoteToggle = useCallback((noteId: string) => {
    const isSelected = selectedNotes.includes(noteId)
    const newSelection = isSelected
      ? selectedNotes.filter(id => id !== noteId)
      : [...selectedNotes, noteId]
    
    onSelectionChange(newSelection)
  }, [selectedNotes, onSelectionChange])

  // Execute bulk operation
  const executeBulkOperation = useCallback(async (operationId: string, params?: any) => {
    if (selectedNotes.length === 0) return

    setIsProcessing(true)
    try {
      await onBulkOperation(operationId, selectedNotes, params)
      setActiveOperation(null)
      setOperationParams({})
      setIsConfirming(false)
    } catch (error) {
      console.error('Bulk operation failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }, [selectedNotes, onBulkOperation])

  // Render operation input interface
  const renderOperationInput = useCallback(() => {
    const operation = BULK_OPERATIONS.find(op => op.id === activeOperation)
    if (!operation) return null

    switch (operation.type) {
      case 'tag':
      case 'untag':
        return (
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-900">
              {operation.type === 'tag' ? 'Select tags to add:' : 'Select tags to remove:'}
            </div>
            <TagManager
              tags={availableTags}
              selectedTags={operationParams.tagIds || []}
              onTagSelect={(tagId) => {
                const currentTags = operationParams.tagIds || []
                setOperationParams({
                  ...operationParams,
                  tagIds: [...currentTags, tagId]
                })
              }}
              onTagDeselect={(tagId) => {
                const currentTags = operationParams.tagIds || []
                setOperationParams({
                  ...operationParams,
                  tagIds: currentTags.filter((id: string) => id !== tagId)
                })
              }}
              mode="select"
              searchable={true}
              showStats={false}
              className="border-0 shadow-none"
            />
          </div>
        )

      case 'privacy':
        return (
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-900">
              Select new privacy level:
            </div>
            <PrivacySelector
              value={operationParams.privacy || 'private'}
              onChange={(privacy) => setOperationParams({ ...operationParams, privacy })}
              variant="default"
              size="md"
            />
            <div className="text-xs text-gray-600">
              Current selection: {selectionStats.privacy.private} private, {selectionStats.privacy.shared} shared, {selectionStats.privacy.draft} drafts
            </div>
          </div>
        )

      case 'category':
        return (
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-900">
              Select target category:
            </div>
            <select
              value={operationParams.categoryId || ''}
              onChange={(e) => setOperationParams({ ...operationParams, categoryId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Select category...</option>
              {availableCategories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        )

      default:
        return null
    }
  }, [activeOperation, operationParams, availableTags, availableCategories, selectionStats])

  // Get visible notes for selection interface
  const visibleNotes = useMemo(() => 
    notes.slice(0, maxVisible), 
    [notes, maxVisible]
  )

  const visibleSelectedCount = visibleNotes.filter(note => 
    selectedNotes.includes(note.id)
  ).length

  if (!isVisible || selectedNotes.length === 0) {
    return null
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className={cn(
          'fixed bottom-4 left-4 right-4 z-50',
          'md:left-1/2 md:transform md:-translate-x-1/2 md:max-w-4xl',
          className
        )}
      >
        <Card className="shadow-2xl border-2 bg-white">
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <CheckSquare className="h-5 w-5 text-primary" />
                <div>
                  <div className="font-semibold text-gray-900">
                    {selectionStats.total} note{selectionStats.total === 1 ? '' : 's'} selected
                  </div>
                  <div className="text-xs text-gray-600">
                    {selectionStats.privacy.private > 0 && `${selectionStats.privacy.private} private `}
                    {selectionStats.privacy.shared > 0 && `${selectionStats.privacy.shared} shared `}
                    {selectionStats.privacy.draft > 0 && `${selectionStats.privacy.draft} drafts`}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSelectAll}
                >
                  {visibleSelectedCount === visibleNotes.length ? 'Deselect All' : 'Select All'}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onSelectionChange([])}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Operation Interface */}
            <AnimatePresence mode="wait">
              {activeOperation ? (
                <motion.div
                  key="operation-interface"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <ArrowRight className="h-4 w-4 text-primary" />
                    <span className="font-medium">
                      {BULK_OPERATIONS.find(op => op.id === activeOperation)?.label}
                    </span>
                  </div>

                  {renderOperationInput()}

                  {/* Confirmation */}
                  {BULK_OPERATIONS.find(op => op.id === activeOperation)?.requiresConfirmation && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-800">
                          This action cannot be undone
                        </span>
                      </div>
                      <p className="text-xs text-yellow-700 mt-1">
                        {BULK_OPERATIONS.find(op => op.id === activeOperation)?.description}
                      </p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setActiveOperation(null)
                        setOperationParams({})
                        setIsConfirming(false)
                      }}
                      disabled={isProcessing}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => executeBulkOperation(activeOperation, operationParams)}
                      disabled={isProcessing}
                      className={cn(
                        BULK_OPERATIONS.find(op => op.id === activeOperation)?.destructive &&
                        'bg-red-600 hover:bg-red-700'
                      )}
                    >
                      {isProcessing ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="h-4 w-4 mr-1.5"
                          >
                            <Clock className="h-4 w-4" />
                          </motion.div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-1.5" />
                          Execute
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="operations-grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Quick Stats */}
                  {selectionStats.tags.length > 0 && (
                    <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                      <div className="text-xs font-medium text-gray-700 mb-1">Common tags:</div>
                      <div className="flex flex-wrap gap-1">
                        {selectionStats.tags.slice(0, 5).map(([tag, count]) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag} ({count})
                          </Badge>
                        ))}
                        {selectionStats.tags.length > 5 && (
                          <Badge variant="secondary" className="text-xs">
                            +{selectionStats.tags.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Operations Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {BULK_OPERATIONS.map(operation => {
                      const Icon = operation.icon
                      return (
                        <Button
                          key={operation.id}
                          size="sm"
                          variant="outline"
                          onClick={() => setActiveOperation(operation.id)}
                          className={cn(
                            'flex flex-col items-center gap-1 h-auto py-3',
                            'hover:bg-gray-50 transition-colors',
                            operation.destructive && 'hover:bg-red-50 hover:border-red-200'
                          )}
                          disabled={isProcessing}
                        >
                          <Icon className={cn(
                            'h-4 w-4',
                            operation.destructive ? 'text-red-600' : 'text-gray-600'
                          )} />
                          <span className="text-xs font-medium">
                            {operation.label}
                          </span>
                        </Button>
                      )
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}