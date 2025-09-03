'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MotionBox } from '@/components/ui/motion'
import NoteTabs from './NoteTabs'
import BasicTextInput from './BasicTextInput'
import { useCheckInContext } from '@/contexts/CheckInContext'
import { ArrowRight, Clock, MessageCircle, Save } from 'lucide-react'
import { Note } from '@/types'

interface DiscussionViewProps {
  categoryId: string
  categoryName: string
  categoryDescription?: string
  categoryIcon?: string
  onComplete?: () => void
  prompts?: string[]
}

export default function DiscussionView({
  categoryId,
  categoryName,
  categoryDescription,
  categoryIcon = '💭',
  onComplete,
  prompts = []
}: DiscussionViewProps) {
  const {
    session,
    addDraftNote,
    updateDraftNote,
    removeDraftNote,
    updateCategoryProgress,
    saveSession
  } = useCheckInContext()

  const [activeTab, setActiveTab] = useState<'private' | 'shared'>('private')
  const [privateNote, setPrivateNote] = useState('')
  const [sharedNote, setSharedNote] = useState('')
  const [privateDraftId, setPrivateDraftId] = useState<string | null>(null)
  const [sharedDraftId, setSharedDraftId] = useState<string | null>(null)
  const [startTime] = useState(Date.now())

  // Load existing drafts if available
  useEffect(() => {
    if (!session?.draftNotes) return

    const privateDraft = session.draftNotes.find(
      note => note.categoryId === categoryId && note.privacy === 'private'
    )
    const sharedDraft = session.draftNotes.find(
      note => note.categoryId === categoryId && note.privacy === 'shared'
    )

    if (privateDraft) {
      setPrivateNote(privateDraft.content)
      setPrivateDraftId(privateDraft.id)
    }
    if (sharedDraft) {
      setSharedNote(sharedDraft.content)
      setSharedDraftId(sharedDraft.id)
    }
  }, [session, categoryId])

  const handleSaveNote = useCallback((content: string, privacy: 'private' | 'shared') => {
    if (!content.trim()) return

    const draftId = privacy === 'private' ? privateDraftId : sharedDraftId

    if (draftId) {
      // Update existing draft
      updateDraftNote(draftId, { content, updatedAt: new Date() })
    } else {
      // Create new draft
      const newNote: Omit<Note, 'id' | 'createdAt' | 'updatedAt'> = {
        authorId: 'demo-user-1',
        categoryId,
        checkInId: session?.id,
        content,
        privacy
      }
      addDraftNote(newNote)
      
      // Store the draft ID for future updates
      if (privacy === 'private') {
        setPrivateDraftId(`note_${Date.now()}`)
      } else {
        setSharedDraftId(`note_${Date.now()}`)
      }
    }

    saveSession()
  }, [privateDraftId, sharedDraftId, categoryId, session, addDraftNote, updateDraftNote, saveSession])

  const handleCompleteCategory = useCallback(() => {
    // Save current notes as drafts
    if (privateNote.trim()) {
      handleSaveNote(privateNote, 'private')
    }
    if (sharedNote.trim()) {
      handleSaveNote(sharedNote, 'shared')
    }

    // Calculate time spent on this category
    const timeSpent = Math.round((Date.now() - startTime) / 1000)

    // Update category progress - get the draft notes we created
    const categoryNotes: Note[] = []
    if (session?.draftNotes) {
      const privateDraft = session.draftNotes.find(
        note => note.id === privateDraftId
      )
      const sharedDraft = session.draftNotes.find(
        note => note.id === sharedDraftId
      )
      if (privateDraft) categoryNotes.push(privateDraft)
      if (sharedDraft) categoryNotes.push(sharedDraft)
    }
    
    // Update category progress
    updateCategoryProgress(categoryId, {
      isCompleted: true,
      timeSpent,
      notes: categoryNotes
    })

    saveSession()
    
    if (onComplete) {
      onComplete()
    }
  }, [
    privateNote,
    sharedNote,
    categoryId,
    startTime,
    privateDraftId,
    sharedDraftId,
    handleSaveNote,
    updateCategoryProgress,
    saveSession,
    onComplete,
    session?.draftNotes
  ])

  const handleDeleteDraft = useCallback((privacy: 'private' | 'shared') => {
    const draftId = privacy === 'private' ? privateDraftId : sharedDraftId
    
    if (draftId) {
      removeDraftNote(draftId)
      
      if (privacy === 'private') {
        setPrivateDraftId(null)
        setPrivateNote('')
      } else {
        setSharedDraftId(null)
        setSharedNote('')
      }
    }
  }, [privateDraftId, sharedDraftId, removeDraftNote])

  const currentPrompt = prompts.length > 0 ? prompts[0] : null

  return (
    <MotionBox variant="page" className="space-y-6">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-start space-x-3">
          <div className="text-2xl">{categoryIcon}</div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900">{categoryName}</h2>
            {categoryDescription && (
              <p className="text-gray-600 mt-1">{categoryDescription}</p>
            )}
            {currentPrompt && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start space-x-2">
                  <MessageCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <p className="text-sm text-blue-800">{currentPrompt}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Timer indicator */}
        <div className="mt-4 flex items-center text-sm text-gray-500">
          <Clock className="h-4 w-4 mr-1" />
          <span>Take your time to reflect and discuss</span>
        </div>
      </Card>

      {/* Note Tabs */}
      <NoteTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        hasPrivateContent={privateNote.length > 0}
        hasSharedContent={sharedNote.length > 0}
      />

      {/* Note Input Area */}
      <Card className="p-6">
        {activeTab === 'private' ? (
          <BasicTextInput
            value={privateNote}
            onChange={setPrivateNote}
            placeholder="Write your private thoughts here... Only you will see these notes."
            label="Private Notes"
            helperText="These notes are completely private and won't be shared with your partner."
            onSave={() => handleSaveNote(privateNote, 'private')}
            onDelete={() => handleDeleteDraft('private')}
            isDraft={true}
            autoSave={true}
          />
        ) : (
          <BasicTextInput
            value={sharedNote}
            onChange={setSharedNote}
            placeholder="Write notes to share with your partner..."
            label="Shared Notes"
            helperText="These notes will be visible to both you and your partner."
            onSave={() => handleSaveNote(sharedNote, 'shared')}
            onDelete={() => handleDeleteDraft('shared')}
            isDraft={true}
            autoSave={true}
          />
        )}
      </Card>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <Button
          variant="ghost"
          onClick={() => {
            handleSaveNote(privateNote, 'private')
            handleSaveNote(sharedNote, 'shared')
          }}
        >
          <Save className="h-4 w-4 mr-2" />
          Save Progress
        </Button>

        <Button
          onClick={handleCompleteCategory}
          disabled={!privateNote.trim() && !sharedNote.trim()}
        >
          Complete Discussion
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </MotionBox>
  )
}