'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Save, X, ArrowLeft, FileText, Check, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { TouchButton } from '@/components/ui/TouchButton'
import RichTextEditor from '@/components/checkin/RichTextEditor'
import { PrivacySelector } from './PrivacySelector'
import { PrivacyBadge } from './PrivacyBadge'
import { useNoteEditor } from '@/hooks/useNoteEditor'
import type { Note } from '@/types'

export type NotePrivacy = 'private' | 'shared' | 'draft'

interface NoteEditorProps {
  note?: Note | null
  isOpen: boolean
  onClose: () => void
  onSave: (note: Partial<Note>) => Promise<void>
  categoryId?: string
  checkInId?: string
  authorId: string
  className?: string
}

export default function NoteEditor({
  note,
  isOpen,
  onClose,
  onSave,
  categoryId,
  checkInId,
  authorId,
  className
}: NoteEditorProps) {
  const {
    content,
    privacy,
    isModified,
    isSaving,
    lastSaved,
    error,
    setContent,
    setPrivacy,
    save,
    reset,
    canSave
  } = useNoteEditor({
    initialNote: note,
    onSave,
    autoSave: true,
    autoSaveDelay: 30000 // 30 seconds as per requirements
  })

  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false)

  // Handle close with unsaved changes warning
  const handleClose = () => {
    if (isModified && !isSaving) {
      setShowUnsavedWarning(true)
    } else {
      onClose()
      reset()
    }
  }

  // Confirm close without saving
  const confirmClose = () => {
    setShowUnsavedWarning(false)
    onClose()
    reset()
  }

  // Cancel close and stay in editor
  const cancelClose = () => {
    setShowUnsavedWarning(false)
  }

  // Handle save and close
  const handleSaveAndClose = async () => {
    try {
      await save()
      onClose()
    } catch (err) {
      console.error('Failed to save note:', err)
    }
  }

  // Handle privacy change with draft workflow
  const handlePrivacyChange = (newPrivacy: NotePrivacy) => {
    setPrivacy(newPrivacy)
    
    // If changing from draft to shared, trigger save
    if (privacy === 'draft' && newPrivacy === 'shared') {
      save()
    }
  }

  // Determine if note is new
  const isNewNote = !note?.id

  // Get editor title
  const getTitle = () => {
    if (isNewNote) return 'New Note'
    return privacy === 'draft' ? 'Edit Draft' : 'Edit Note'
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center sm:justify-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleClose()
            }
          }}
        >
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              'w-full max-w-2xl bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl',
              'flex flex-col max-h-[90vh] sm:max-h-[80vh]',
              className
            )}
          >
            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <TouchButton
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="p-2"
                >
                  <ArrowLeft className="h-5 w-5" />
                </TouchButton>
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    {getTitle()}
                  </h2>
                  {isModified && (
                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <PrivacyBadge
                  type={privacy}
                  size="sm"
                  variant="outline"
                  animated={false}
                />
                <TouchButton
                  variant="default"
                  size="sm"
                  onClick={handleSaveAndClose}
                  disabled={!canSave || isSaving}
                >
                  {isSaving ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <Save className="h-4 w-4 mr-1.5" />
                      </motion.div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-1.5" />
                      Done
                    </>
                  )}
                </TouchButton>
              </div>
            </div>

            {/* Privacy Control */}
            <div className="flex-shrink-0 p-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-1">
                    Privacy Level
                  </h3>
                  <p className="text-xs text-gray-600">
                    Control who can see this note
                  </p>
                </div>
                <PrivacySelector
                  value={privacy}
                  onChange={handlePrivacyChange}
                  disabled={isSaving}
                />
              </div>
            </div>

            {/* Editor Content */}
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 p-4 overflow-auto">
                <RichTextEditor
                  value={content}
                  onChange={setContent}
                  onSave={save}
                  placeholder="What's on your mind?"
                  autoSave={true}
                  autoSaveDelay={30000}
                  maxLength={5000}
                  minHeight="300px"
                  maxHeight="600px"
                  showToolbar={true}
                  showStats={true}
                  isDraft={privacy === 'draft'}
                  disabled={isSaving}
                />
              </div>

              {/* Status Bar */}
              {(lastSaved || error || isSaving) && (
                <div className="flex-shrink-0 px-4 py-3 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm">
                      {error && (
                        <span className="flex items-center text-red-600">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {error.message || 'Save failed'}
                        </span>
                      )}
                      {lastSaved && !error && (
                        <span className="text-gray-600">
                          Last saved {lastSaved.toLocaleTimeString()}
                        </span>
                      )}
                      {isSaving && (
                        <span className="flex items-center text-blue-600">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          >
                            <Save className="h-4 w-4 mr-1" />
                          </motion.div>
                          Saving...
                        </span>
                      )}
                    </div>

                    {privacy === 'draft' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handlePrivacyChange('shared')}
                        disabled={!canSave || isSaving}
                      >
                        Share Note
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Unsaved Changes Warning */}
            <AnimatePresence>
              {showUnsavedWarning && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute inset-0 bg-black/75 flex items-center justify-center z-10"
                >
                  <div className="bg-white rounded-2xl p-6 mx-4 max-w-sm w-full">
                    <div className="text-center">
                      <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Unsaved Changes
                      </h3>
                      <p className="text-sm text-gray-600 mb-6">
                        You have unsaved changes. Do you want to save before closing?
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          onClick={confirmClose}
                          className="flex-1"
                        >
                          Discard
                        </Button>
                        <Button
                          variant="outline"
                          onClick={cancelClose}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={async () => {
                            setShowUnsavedWarning(false)
                            await handleSaveAndClose()
                          }}
                          className="flex-1"
                          disabled={isSaving}
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}