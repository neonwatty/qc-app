'use client'

import React, { useState } from 'react'
import { StickyNote, Plus, Eye, EyeOff, Filter, Search } from 'lucide-react'
import { MotionBox, StaggerContainer, StaggerItem } from '@/components/ui/motion'
import { Button } from '@/components/ui/button'
import { PullToRefresh } from '@/components/ui/PullToRefresh'
import { LongPressCard } from '@/components/ui/LongPressMenu'
import { MobileActionBar } from '@/components/ui/PrimaryActionFAB'

type NoteType = 'shared' | 'private' | 'draft'

interface Note {
  id: string
  title: string
  content: string
  type: NoteType
  date: string
  category: string
}

const mockNotes: Note[] = [
  {
    id: '1',
    title: 'Communication Insights',
    content: 'We discovered that we both prefer to process emotions differently...',
    type: 'shared',
    date: '2 days ago',
    category: 'Communication'
  },
  {
    id: '2',
    title: 'Personal Reflection',
    content: 'I need to work on being more patient during discussions...',
    type: 'private',
    date: '3 days ago',
    category: 'Self-Improvement'
  },
  {
    id: '3',
    title: 'Future Goals Discussion',
    content: 'Draft notes from our conversation about where we want to live...',
    type: 'draft',
    date: '5 days ago',
    category: 'Goals'
  },
  {
    id: '4',
    title: 'Gratitude List',
    content: 'Things we appreciate about each other this week...',
    type: 'shared',
    date: '1 week ago',
    category: 'Appreciation'
  }
]

export default function NotesPage() {
  const [filter, setFilter] = useState<NoteType | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  const handleRefresh = async () => {
    // Simulate API refresh for notes
    await new Promise(resolve => setTimeout(resolve, 1200))
    setRefreshKey(prev => prev + 1)
  }

  const filteredNotes = mockNotes.filter(note => {
    const matchesFilter = filter === 'all' || note.type === filter
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const getTypeColor = (type: NoteType) => {
    switch (type) {
      case 'shared': return 'bg-green-100 text-green-800 border-green-200'
      case 'private': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'draft': return 'bg-orange-100 text-orange-800 border-orange-200'
    }
  }

  const getTypeIcon = (type: NoteType) => {
    switch (type) {
      case 'shared': return <Eye className="h-3 w-3" />
      case 'private': return <EyeOff className="h-3 w-3" />
      case 'draft': return <StickyNote className="h-3 w-3" />
    }
  }

  return (
    <PullToRefresh onRefresh={handleRefresh} className="h-full">
      <MotionBox variant="page" className="space-y-6" key={refreshKey}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notes</h1>
            <p className="mt-2 text-gray-600">
              Keep track of your thoughts, insights, and reflections
            </p>
          </div>
          <Button className="mt-4 sm:mt-0">
            <Plus className="h-4 w-4 mr-2" />
            New Note
          </Button>
        </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="search"
            inputMode="search"
            autoCapitalize="none"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent mobile-input touch-manipulation"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'shared' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('shared')}
            className="flex items-center gap-1"
          >
            <Eye className="h-3 w-3" />
            Shared
          </Button>
          <Button
            variant={filter === 'private' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('private')}
            className="flex items-center gap-1"
          >
            <EyeOff className="h-3 w-3" />
            Private
          </Button>
          <Button
            variant={filter === 'draft' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('draft')}
            className="flex items-center gap-1"
          >
            <StickyNote className="h-3 w-3" />
            Drafts
          </Button>
        </div>
      </div>

      {/* Notes Grid */}
      <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredNotes.map((note, index) => (
          <StaggerItem key={note.id}>
            <LongPressCard
              onEdit={() => console.log('Edit note:', note.id)}
              onShare={() => console.log('Share note:', note.id)}
              onDuplicate={() => console.log('Duplicate note:', note.id)}
              onDelete={() => console.log('Delete note:', note.id)}
              title="Note Actions"
              description={`Actions for "${note.title}"`}
            >
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
                {/* Note Header */}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {note.title}
                  </h3>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(note.type)}`}>
                    {getTypeIcon(note.type)}
                    {note.type}
                  </span>
                </div>

                {/* Note Content */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {note.content}
                </p>

                {/* Note Meta */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="bg-gray-100 px-2 py-1 rounded-full">
                    {note.category}
                  </span>
                  <span>{note.date}</span>
                </div>
              </div>
            </LongPressCard>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {filteredNotes.length === 0 && (
        <div className="text-center py-12">
          <StickyNote className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No notes found
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'Try adjusting your search terms' : 'Start by creating your first note'}
          </p>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Note
          </Button>
        </div>
      )}

      {/* Note Types Info */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-3">Note Types</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-green-600" />
            <div>
              <div className="font-medium text-sm">Shared</div>
              <div className="text-xs text-gray-600">Visible to both partners</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <EyeOff className="h-4 w-4 text-blue-600" />
            <div>
              <div className="font-medium text-sm">Private</div>
              <div className="text-xs text-gray-600">Only visible to you</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StickyNote className="h-4 w-4 text-orange-600" />
            <div>
              <div className="font-medium text-sm">Draft</div>
              <div className="text-xs text-gray-600">Work in progress</div>
            </div>
          </div>
          </div>
        </div>

        {/* Mobile Action Bar */}
        <MobileActionBar />
      </MotionBox>
    </PullToRefresh>
  )
}