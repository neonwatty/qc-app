'use client'

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { StickyNote, Plus, Eye, EyeOff, Calendar, ChevronDown, Folder } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SearchBar } from './SearchBar'
import { NoteFilters } from './NoteFilters'
import { MotionBox, StaggerContainer, StaggerItem } from '@/components/ui/motion'
import { cn } from '@/lib/utils'

export type NoteType = 'shared' | 'private' | 'draft'
export type SortOption = 'date-desc' | 'date-asc' | 'title' | 'category'

export interface Note {
  id: string
  title: string
  content: string
  type: NoteType
  date: Date
  category: string
  tags?: string[]
}

export interface FiltersState {
  privacyLevel: NoteType | 'all'
  category: string
  dateRange: {
    from: Date | null
    to: Date | null
  }
  sortBy: SortOption
}

interface NotesDashboardProps {
  notes?: Note[]
  onCreateNote?: () => void
  onSelectNote?: (note: Note) => void
  itemsPerPage?: number
}

const mockNotes: Note[] = Array.from({ length: 50 }, (_, i) => ({
  id: `note-${i + 1}`,
  title: `Note ${i + 1}: ${['Communication Insights', 'Personal Reflection', 'Future Goals', 'Gratitude List'][i % 4]}`,
  content: `Content for note ${i + 1}. ${['We discovered important patterns...', 'I need to work on...', 'Our future plans include...', 'Things we appreciate...'][i % 4]}`,
  type: ['shared', 'private', 'draft'][i % 3] as NoteType,
  date: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)),
  category: ['Communication', 'Self-Improvement', 'Goals', 'Appreciation', 'Trust', 'Intimacy'][i % 6],
  tags: i % 2 === 0 ? ['important', 'reflection'] : ['milestone', 'action-item']
}))

export function NotesDashboard({
  notes = mockNotes,
  onCreateNote,
  onSelectNote,
  itemsPerPage = 12
}: NotesDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<FiltersState>({
    privacyLevel: 'all',
    category: 'all',
    dateRange: { from: null, to: null },
    sortBy: 'date-desc'
  })
  const [displayCount, setDisplayCount] = useState(itemsPerPage)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)

  // Filter and sort notes
  const processedNotes = useMemo(() => {
    let filtered = [...notes]

    // Apply privacy filter
    if (filters.privacyLevel !== 'all') {
      filtered = filtered.filter(note => note.type === filters.privacyLevel)
    }

    // Apply category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(note => note.category === filters.category)
    }

    // Apply date range filter
    if (filters.dateRange.from || filters.dateRange.to) {
      filtered = filtered.filter(note => {
        const noteDate = note.date
        if (filters.dateRange.from && noteDate < filters.dateRange.from) return false
        if (filters.dateRange.to && noteDate > filters.dateRange.to) return false
        return true
      })
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(term) ||
        note.content.toLowerCase().includes(term) ||
        note.category.toLowerCase().includes(term) ||
        note.tags?.some(tag => tag.toLowerCase().includes(term))
      )
    }

    // Sort notes
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'date-desc':
          return b.date.getTime() - a.date.getTime()
        case 'date-asc':
          return a.date.getTime() - b.date.getTime()
        case 'title':
          return a.title.localeCompare(b.title)
        case 'category':
          return a.category.localeCompare(b.category)
        default:
          return 0
      }
    })

    return filtered
  }, [notes, filters, searchTerm])

  // Notes to display (with infinite scroll)
  const displayedNotes = useMemo(() => {
    return processedNotes.slice(0, displayCount)
  }, [processedNotes, displayCount])

  // Infinite scroll implementation
  useEffect(() => {
    const handleObserver = (entries: IntersectionObserverEntry[]) => {
      const target = entries[0]
      if (target.isIntersecting && displayCount < processedNotes.length) {
        setDisplayCount(prev => Math.min(prev + itemsPerPage, processedNotes.length))
      }
    }

    observerRef.current = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '100px',
      threshold: 0
    })

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [displayCount, processedNotes.length, itemsPerPage])

  const handleFilterChange = useCallback((newFilters: Partial<FiltersState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
    setDisplayCount(itemsPerPage) // Reset pagination on filter change
  }, [itemsPerPage])

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

  const highlightText = (text: string, term: string) => {
    if (!term) return text
    const regex = new RegExp(`(${term})`, 'gi')
    return text.split(regex).map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 text-gray-900 px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    )
  }

  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`
    if (days < 365) return `${Math.floor(days / 30)} months ago`
    return `${Math.floor(days / 365)} years ago`
  }

  const categories = useMemo(() => {
    const cats = new Set(notes.map(n => n.category))
    return Array.from(cats).sort()
  }, [notes])

  return (
    <MotionBox variant="page" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notes</h1>
          <p className="mt-2 text-gray-600">
            {processedNotes.length} {processedNotes.length === 1 ? 'note' : 'notes'} found
          </p>
        </div>
        <Button onClick={onCreateNote} className="mt-4 sm:mt-0">
          <Plus className="h-4 w-4 mr-2" />
          New Note
        </Button>
      </div>

      {/* Search Bar */}
      <SearchBar
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search notes, categories, or tags..."
        resultCount={processedNotes.length}
      />

      {/* Filters Toggle (Mobile) */}
      <Button
        variant="outline"
        onClick={() => setIsFiltersOpen(!isFiltersOpen)}
        className="w-full sm:hidden flex items-center justify-between"
      >
        <span className="flex items-center gap-2">
          <ChevronDown className={cn(
            "h-4 w-4 transition-transform",
            isFiltersOpen && "rotate-180"
          )} />
          Filters
        </span>
        {(filters.privacyLevel !== 'all' || filters.category !== 'all' || filters.dateRange.from || filters.dateRange.to) && (
          <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">
            Active
          </span>
        )}
      </Button>

      {/* Filters */}
      <div className={cn(
        "transition-all duration-300",
        !isFiltersOpen && "hidden sm:block"
      )}>
        <NoteFilters
          filters={filters}
          categories={categories}
          onChange={handleFilterChange}
          noteCount={processedNotes.length}
        />
      </div>

      {/* Notes Grid */}
      {displayedNotes.length > 0 ? (
        <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {displayedNotes.map((note) => (
            <StaggerItem key={note.id}>
              <Card
                variant="interactive"
                onClick={() => onSelectNote?.(note)}
                className="h-full hover:shadow-lg transition-all duration-200"
              >
                <CardContent className="p-4 space-y-3">
                  {/* Note Header */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1">
                      {highlightText(note.title, searchTerm)}
                    </h3>
                    <span className={cn(
                      "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border shrink-0",
                      getTypeColor(note.type)
                    )}>
                      {getTypeIcon(note.type)}
                      {note.type}
                    </span>
                  </div>

                  {/* Note Content */}
                  <p className="text-gray-600 text-sm line-clamp-3">
                    {highlightText(note.content, searchTerm)}
                  </p>

                  {/* Note Meta */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-gray-500">
                      <Folder className="h-3 w-3" />
                      {highlightText(note.category, searchTerm)}
                    </span>
                    <span className="flex items-center gap-1 text-gray-500">
                      <Calendar className="h-3 w-3" />
                      {formatDate(note.date)}
                    </span>
                  </div>

                  {/* Tags */}
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {note.tags.map(tag => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600"
                        >
                          {highlightText(tag, searchTerm)}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>
      ) : (
        <div className="text-center py-12">
          <StickyNote className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No notes found
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'Try adjusting your search terms or filters' : 'Start by creating your first note'}
          </p>
          <Button onClick={onCreateNote}>
            <Plus className="h-4 w-4 mr-2" />
            Create Note
          </Button>
        </div>
      )}

      {/* Infinite Scroll Trigger */}
      {displayedNotes.length < processedNotes.length && (
        <div ref={loadMoreRef} className="py-4 text-center">
          <p className="text-sm text-gray-500">
            Loading more notes...
          </p>
        </div>
      )}

      {/* Stats Bar */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">{notes.length}</div>
            <div className="text-xs text-gray-600">Total Notes</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {notes.filter(n => n.type === 'shared').length}
            </div>
            <div className="text-xs text-gray-600">Shared</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {notes.filter(n => n.type === 'private').length}
            </div>
            <div className="text-xs text-gray-600">Private</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">
              {notes.filter(n => n.type === 'draft').length}
            </div>
            <div className="text-xs text-gray-600">Drafts</div>
          </div>
        </div>
      </div>
    </MotionBox>
  )
}