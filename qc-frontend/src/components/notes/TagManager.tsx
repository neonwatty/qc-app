'use client'

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Tag, 
  Plus, 
  X, 
  Edit3, 
  Check, 
  Hash, 
  Palette, 
  Search,
  Filter,
  MoreHorizontal,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Clock,
  TrendingUp
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useNoteTags } from '@/hooks/useNoteTags'

export interface NoteTag {
  id: string
  name: string
  color: string
  description?: string
  createdAt: Date
  updatedAt: Date
  noteCount: number
  isSystem?: boolean
  isFavorite?: boolean
  lastUsed?: Date
}

interface TagManagerProps {
  tags?: NoteTag[]
  selectedTags?: string[]
  onTagSelect?: (tagId: string) => void
  onTagDeselect?: (tagId: string) => void
  onTagCreate?: (tag: Omit<NoteTag, 'id' | 'createdAt' | 'updatedAt' | 'noteCount'>) => void
  onTagUpdate?: (tagId: string, updates: Partial<NoteTag>) => void
  onTagDelete?: (tagId: string) => void
  mode?: 'select' | 'manage' | 'filter'
  maxSelection?: number
  searchable?: boolean
  showStats?: boolean
  showColors?: boolean
  className?: string
}

const TAG_COLORS = [
  { name: 'Red', value: '#ef4444', bg: 'bg-red-500', text: 'text-red-700', light: 'bg-red-100' },
  { name: 'Orange', value: '#f97316', bg: 'bg-orange-500', text: 'text-orange-700', light: 'bg-orange-100' },
  { name: 'Yellow', value: '#eab308', bg: 'bg-yellow-500', text: 'text-yellow-700', light: 'bg-yellow-100' },
  { name: 'Green', value: '#22c55e', bg: 'bg-green-500', text: 'text-green-700', light: 'bg-green-100' },
  { name: 'Blue', value: '#3b82f6', bg: 'bg-blue-500', text: 'text-blue-700', light: 'bg-blue-100' },
  { name: 'Indigo', value: '#6366f1', bg: 'bg-indigo-500', text: 'text-indigo-700', light: 'bg-indigo-100' },
  { name: 'Purple', value: '#a855f7', bg: 'bg-purple-500', text: 'text-purple-700', light: 'bg-purple-100' },
  { name: 'Pink', value: '#ec4899', bg: 'bg-pink-500', text: 'text-pink-700', light: 'bg-pink-100' },
  { name: 'Gray', value: '#6b7280', bg: 'bg-gray-500', text: 'text-gray-700', light: 'bg-gray-100' }
]

export default function TagManager({
  tags = [],
  selectedTags = [],
  onTagSelect,
  onTagDeselect,
  onTagCreate,
  onTagUpdate,
  onTagDelete,
  mode = 'manage',
  maxSelection = Infinity,
  searchable = true,
  showStats = true,
  showColors = true,
  className
}: TagManagerProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [editingTag, setEditingTag] = useState<string | null>(null)
  const [newTag, setNewTag] = useState({
    name: '',
    color: TAG_COLORS[0].value,
    description: ''
  })
  const [sortBy, setSortBy] = useState<'name' | 'usage' | 'recent' | 'created'>('name')
  const [showSystemTags, setShowSystemTags] = useState(true)
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)

  // Format relative time
  const formatRelativeTime = useCallback((date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return 'today'
    if (days === 1) return 'yesterday'
    if (days < 7) return `${days} days ago`
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`
    return `${Math.floor(days / 30)} months ago`
  }, [])

  // Focus input when creating
  useEffect(() => {
    if (isCreating && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isCreating])

  // Filtered and sorted tags
  const processedTags = useMemo(() => {
    let filtered = [...tags]

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(tag =>
        tag.name.toLowerCase().includes(term) ||
        tag.description?.toLowerCase().includes(term)
      )
    }

    // Apply system tags filter
    if (!showSystemTags) {
      filtered = filtered.filter(tag => !tag.isSystem)
    }

    // Apply favorites filter
    if (showFavoritesOnly) {
      filtered = filtered.filter(tag => tag.isFavorite)
    }

    // Sort tags
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'usage':
          return b.noteCount - a.noteCount
        case 'recent':
          const aLastUsed = a.lastUsed?.getTime() || 0
          const bLastUsed = b.lastUsed?.getTime() || 0
          return bLastUsed - aLastUsed
        case 'created':
          return b.createdAt.getTime() - a.createdAt.getTime()
        default:
          return 0
      }
    })

    return filtered
  }, [tags, searchTerm, showSystemTags, showFavoritesOnly, sortBy])

  // Get color info for a tag
  const getTagColorInfo = useCallback((color: string) => {
    return TAG_COLORS.find(c => c.value === color) || TAG_COLORS[0]
  }, [])

  // Handle tag selection/deselection
  const handleTagToggle = useCallback((tag: NoteTag) => {
    const isSelected = selectedTags.includes(tag.id)
    
    if (isSelected) {
      onTagDeselect?.(tag.id)
    } else {
      if (selectedTags.length < maxSelection) {
        onTagSelect?.(tag.id)
      }
    }
  }, [selectedTags, maxSelection, onTagSelect, onTagDeselect])

  // Handle tag creation
  const handleCreateTag = useCallback(() => {
    if (!newTag.name.trim()) return

    onTagCreate?.({
      name: newTag.name.trim(),
      color: newTag.color,
      description: newTag.description.trim() || undefined
    })

    // Reset form
    setNewTag({
      name: '',
      color: TAG_COLORS[0].value,
      description: ''
    })
    setIsCreating(false)
  }, [newTag, onTagCreate])

  // Handle tag editing
  const handleEditTag = useCallback((tagId: string, updates: Partial<NoteTag>) => {
    onTagUpdate?.(tagId, updates)
    setEditingTag(null)
  }, [onTagUpdate])

  // Handle tag favoriting
  const handleToggleFavorite = useCallback((tag: NoteTag) => {
    onTagUpdate?.(tag.id, { isFavorite: !tag.isFavorite })
  }, [onTagUpdate])

  // Render individual tag
  const renderTag = useCallback((tag: NoteTag) => {
    const colorInfo = getTagColorInfo(tag.color)
    const isSelected = selectedTags.includes(tag.id)
    const isEditing = editingTag === tag.id

    if (isEditing) {
      return (
        <motion.div
          key={`editing-${tag.id}`}
          layout
          className="flex items-center gap-2 p-2 border rounded-lg bg-white"
        >
          <div className="flex items-center gap-2 flex-1">
            <input
              type="text"
              defaultValue={tag.name}
              className="flex-1 px-2 py-1 text-sm border rounded"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleEditTag(tag.id, { name: e.currentTarget.value })
                } else if (e.key === 'Escape') {
                  setEditingTag(null)
                }
              }}
              autoFocus
            />
            <div className="flex gap-1">
              {TAG_COLORS.slice(0, 6).map(color => (
                <button
                  key={color.value}
                  className={cn(
                    'w-4 h-4 rounded-full border border-gray-300',
                    color.bg
                  )}
                  onClick={() => handleEditTag(tag.id, { color: color.value })}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={() => setEditingTag(null)}>
              <Check className="h-3 w-3" />
            </Button>
          </div>
        </motion.div>
      )
    }

    return (
      <motion.div
        key={tag.id}
        layout
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'group relative flex items-center gap-2 p-2 rounded-lg border transition-all duration-200 cursor-pointer',
          isSelected
            ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm',
          mode === 'select' && 'hover:bg-gray-50'
        )}
        onClick={() => mode === 'select' && handleTagToggle(tag)}
      >
        {/* Tag Color Indicator */}
        <div 
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: tag.color }}
        />

        {/* Tag Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <span className="text-sm font-medium text-gray-900 truncate">
              {tag.name}
            </span>
            {tag.isFavorite && (
              <Star className="h-3 w-3 text-yellow-500 fill-current" />
            )}
            {tag.isSystem && (
              <Badge variant="secondary" className="text-xs">System</Badge>
            )}
          </div>
          {showStats && (
            <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
              <span>{tag.noteCount} notes</span>
              {tag.lastUsed && (
                <span>Last used {formatRelativeTime(tag.lastUsed)}</span>
              )}
            </div>
          )}
        </div>

        {/* Tag Actions (Management Mode) */}
        {mode === 'manage' && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                handleToggleFavorite(tag)
              }}
              className="h-6 w-6 p-0"
            >
              <Star className={cn(
                'h-3 w-3',
                tag.isFavorite ? 'text-yellow-500 fill-current' : 'text-gray-400'
              )} />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                setEditingTag(tag.id)
              }}
              className="h-6 w-6 p-0"
            >
              <Edit3 className="h-3 w-3" />
            </Button>
            {!tag.isSystem && (
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation()
                  onTagDelete?.(tag.id)
                }}
                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}

        {/* Selection Indicator */}
        {mode === 'select' && isSelected && (
          <div className="flex-shrink-0">
            <Check className="h-4 w-4 text-primary" />
          </div>
        )}
      </motion.div>
    )
  }, [
    getTagColorInfo,
    selectedTags,
    editingTag,
    mode,
    showStats,
    handleTagToggle,
    handleEditTag,
    handleToggleFavorite,
    onTagDelete,
    formatRelativeTime
  ])

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Tag className="h-5 w-5" />
            Tag Manager
            {tags.length > 0 && (
              <Badge variant="secondary">{tags.length} tags</Badge>
            )}
          </CardTitle>
          
          {mode === 'manage' && (
            <Button
              size="sm"
              onClick={() => setIsCreating(true)}
              disabled={isCreating}
            >
              <Plus className="h-4 w-4 mr-1.5" />
              New Tag
            </Button>
          )}
        </div>

        {/* Search and Filters */}
        {(searchable || showStats) && (
          <div className="space-y-2">
            {searchable && (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search tags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                  className={cn(
                    'text-xs',
                    showFavoritesOnly && 'bg-yellow-100 text-yellow-800'
                  )}
                >
                  <Star className="h-3 w-3 mr-1" />
                  Favorites
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSystemTags(!showSystemTags)}
                  className={cn(
                    'text-xs',
                    !showSystemTags && 'opacity-50'
                  )}
                >
                  {showSystemTags ? <Eye className="h-3 w-3 mr-1" /> : <EyeOff className="h-3 w-3 mr-1" />}
                  System
                </Button>
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs border border-gray-200 rounded px-2 py-1"
              >
                <option value="name">Sort by Name</option>
                <option value="usage">Sort by Usage</option>
                <option value="recent">Sort by Recent</option>
                <option value="created">Sort by Created</option>
              </select>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Create New Tag */}
        <AnimatePresence>
          {isCreating && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 p-3 border border-dashed border-gray-300 rounded-lg bg-gray-50"
            >
              <div className="flex items-center gap-2">
                <Hash className="h-4 w-4 text-gray-500" />
                <Input
                  ref={inputRef}
                  placeholder="Tag name..."
                  value={newTag.name}
                  onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newTag.name.trim()) {
                      handleCreateTag()
                    } else if (e.key === 'Escape') {
                      setIsCreating(false)
                      setNewTag({ name: '', color: TAG_COLORS[0].value, description: '' })
                    }
                  }}
                  className="flex-1"
                />
              </div>

              <Input
                placeholder="Description (optional)..."
                value={newTag.description}
                onChange={(e) => setNewTag({ ...newTag, description: e.target.value })}
                className="text-sm"
              />

              {showColors && (
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-gray-500" />
                  <div className="flex gap-1">
                    {TAG_COLORS.map(color => (
                      <button
                        key={color.value}
                        className={cn(
                          'w-6 h-6 rounded-full border-2 transition-all',
                          newTag.color === color.value
                            ? 'border-gray-900 scale-110'
                            : 'border-gray-300'
                        )}
                        style={{ backgroundColor: color.value }}
                        onClick={() => setNewTag({ ...newTag, color: color.value })}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleCreateTag}
                  disabled={!newTag.name.trim()}
                >
                  <Check className="h-4 w-4 mr-1.5" />
                  Create
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setIsCreating(false)
                    setNewTag({ name: '', color: TAG_COLORS[0].value, description: '' })
                  }}
                >
                  <X className="h-4 w-4 mr-1.5" />
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tags List */}
        <div className="space-y-2">
          <AnimatePresence>
            {processedTags.map(renderTag)}
          </AnimatePresence>

          {processedTags.length === 0 && (
            <div className="text-center py-8">
              <Tag className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'No tags found' : 'No tags yet'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm 
                  ? 'Try adjusting your search terms or filters'
                  : 'Create your first tag to organize your notes'
                }
              </p>
              {mode === 'manage' && !searchTerm && (
                <Button onClick={() => setIsCreating(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Tag
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Selection Summary */}
        {mode === 'select' && selectedTags.length > 0 && (
          <div className="border-t pt-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {selectedTags.length} tag{selectedTags.length === 1 ? '' : 's'} selected
                {maxSelection < Infinity && ` (max ${maxSelection})`}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => selectedTags.forEach(tagId => onTagDeselect?.(tagId))}
              >
                Clear All
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}