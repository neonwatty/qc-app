'use client'

import React, { useState } from 'react'
import { MoreHorizontal, Edit2, Trash2, Share2, Lock, Archive, Star, Copy, ChevronRight, Clock, Folder } from 'lucide-react'
import { PrivacyBadge } from './PrivacyBadge'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { Note } from './NotesDashboard'

interface NotesListProps {
  notes: Note[]
  onSelect?: (note: Note) => void
  onEdit?: (note: Note) => void
  onDelete?: (note: Note) => void
  onShare?: (note: Note) => void
  onTogglePrivacy?: (note: Note) => void
  onArchive?: (note: Note) => void
  onFavorite?: (note: Note) => void
  onDuplicate?: (note: Note) => void
  onBulkSelect?: (noteIds: string[]) => void
  showActions?: boolean
  highlightTerm?: string
  compact?: boolean
  className?: string
}

interface NoteListItemProps {
  note: Note
  onSelect?: (note: Note) => void
  onEdit?: (note: Note) => void
  onDelete?: (note: Note) => void
  onShare?: (note: Note) => void
  onTogglePrivacy?: (note: Note) => void
  onArchive?: (note: Note) => void
  onFavorite?: (note: Note) => void
  onDuplicate?: (note: Note) => void
  showActions?: boolean
  highlightTerm?: string
  compact?: boolean
  isSelected?: boolean
  onToggleSelect?: (noteId: string) => void
}

function NoteListItem({
  note,
  onSelect,
  onEdit,
  onDelete,
  onShare,
  onTogglePrivacy,
  onArchive,
  onFavorite,
  onDuplicate,
  showActions = true,
  highlightTerm,
  compact = false,
  isSelected = false,
  onToggleSelect
}: NoteListItemProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const highlightText = (text: string, term?: string) => {
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
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const handleQuickAction = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation()
    action()
  }

  const menuActions = [
    { icon: Edit2, label: 'Edit', action: onEdit, show: !!onEdit },
    { icon: Share2, label: 'Share', action: onShare, show: !!onShare && note.type !== 'shared' },
    { icon: Lock, label: 'Private', action: onTogglePrivacy, show: !!onTogglePrivacy && note.type === 'shared' },
    { icon: Copy, label: 'Duplicate', action: onDuplicate, show: !!onDuplicate },
    { icon: Archive, label: 'Archive', action: onArchive, show: !!onArchive },
    { icon: Trash2, label: 'Delete', action: onDelete, show: !!onDelete, danger: true }
  ].filter(item => item.show)

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      whileHover={{ x: 4 }}
      transition={{ duration: 0.2 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false)
        setShowMenu(false)
      }}
      className={cn(
        "group relative bg-white rounded-lg border transition-all duration-200",
        "hover:shadow-md hover:border-pink-200",
        isSelected ? "border-pink-300 bg-pink-50" : "border-gray-200",
        compact ? "p-3" : "p-4"
      )}
      onClick={() => onSelect?.(note)}
    >
      <div className="flex items-start gap-3">
        {/* Selection Checkbox (for bulk operations) */}
        {onToggleSelect && (
          <div className="pt-0.5">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation()
                onToggleSelect(note.id)
              }}
              className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
            />
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Title and Privacy Badge */}
          <div className="flex items-start gap-2 mb-1">
            <h3 className={cn(
              "font-semibold text-gray-900 line-clamp-1 flex-1",
              compact ? "text-sm" : "text-base"
            )}>
              {highlightText(note.title, highlightTerm)}
            </h3>
            <PrivacyBadge type={note.type} compact size="sm" />
          </div>

          {/* Content Preview */}
          <p className={cn(
            "text-gray-600 line-clamp-2 mb-2",
            compact ? "text-xs line-clamp-1" : "text-sm"
          )}>
            {highlightText(note.content, highlightTerm)}
          </p>

          {/* Metadata Row */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Folder className="h-3 w-3" />
              {highlightText(note.category, highlightTerm)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDate(note.date)}
            </span>
            {note.tags && note.tags.length > 0 && (
              <span className="flex items-center gap-1">
                {note.tags.slice(0, 2).map(tag => (
                  <span key={tag} className="text-pink-600">
                    #{highlightText(tag, highlightTerm)}
                  </span>
                ))}
                {note.tags.length > 2 && (
                  <span className="text-gray-400">+{note.tags.length - 2}</span>
                )}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 ml-auto">
          {/* Favorite Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsFavorited(!isFavorited)
              onFavorite?.(note)
            }}
            className={cn(
              "p-1.5 rounded-md transition-all",
              "hover:bg-gray-100 active:scale-90",
              (!isHovered && !isFavorited) && "opacity-0",
              "group-hover:opacity-100"
            )}
          >
            <Star className={cn(
              "h-4 w-4 transition-colors",
              isFavorited ? "fill-yellow-400 text-yellow-400" : "text-gray-400"
            )} />
          </button>

          {/* Quick Actions Menu */}
          {showActions && menuActions.length > 0 && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowMenu(!showMenu)
                }}
                className={cn(
                  "p-1.5 rounded-md transition-all",
                  "hover:bg-gray-100 active:scale-90",
                  showMenu && "bg-gray-100",
                  !isHovered && "opacity-0 group-hover:opacity-100"
                )}
              >
                <MoreHorizontal className="h-4 w-4 text-gray-500" />
              </button>

              <AnimatePresence>
                {showMenu && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    transition={{ duration: 0.1 }}
                    className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                  >
                    {menuActions.map((item, index) => (
                      <button
                        key={index}
                        onClick={(e) => handleQuickAction(e, () => item.action?.(note))}
                        className={cn(
                          "w-full px-3 py-2 text-sm text-left flex items-center gap-2",
                          "hover:bg-gray-50 transition-colors",
                          item.danger && "text-red-600 hover:bg-red-50"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Chevron Indicator */}
          <ChevronRight className={cn(
            "h-4 w-4 text-gray-400 transition-all",
            isHovered && "text-pink-500 translate-x-1"
          )} />
        </div>
      </div>

      {/* Mobile Swipe Actions Hint */}
      <div className="sm:hidden absolute right-2 top-1/2 -translate-y-1/2 opacity-30">
        <ChevronRight className="h-5 w-5 text-gray-400" />
      </div>
    </motion.div>
  )
}

export function NotesList({
  notes,
  onSelect,
  onEdit,
  onDelete,
  onShare,
  onTogglePrivacy,
  onArchive,
  onFavorite,
  onDuplicate,
  onBulkSelect,
  showActions = true,
  highlightTerm,
  compact = false,
  className
}: NotesListProps) {
  const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set())
  const [selectMode, setSelectMode] = useState(false)

  const handleToggleSelect = (noteId: string) => {
    const newSelected = new Set(selectedNotes)
    if (newSelected.has(noteId)) {
      newSelected.delete(noteId)
    } else {
      newSelected.add(noteId)
    }
    setSelectedNotes(newSelected)
    onBulkSelect?.(Array.from(newSelected))
  }

  const handleSelectAll = () => {
    if (selectedNotes.size === notes.length) {
      setSelectedNotes(new Set())
      onBulkSelect?.([])
    } else {
      const allIds = new Set(notes.map(n => n.id))
      setSelectedNotes(allIds)
      onBulkSelect?.(Array.from(allIds))
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* Bulk Selection Controls */}
      {onBulkSelect && (
        <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <input
              ref={(el) => {
                if (el) {
                  el.indeterminate = selectedNotes.size > 0 && selectedNotes.size < notes.length
                }
              }}
              type="checkbox"
              checked={selectedNotes.size === notes.length && notes.length > 0}
              onChange={handleSelectAll}
              className="h-4 w-4 rounded border-gray-300 text-pink-600 focus:ring-pink-500"
            />
            <span className="text-sm text-gray-600">
              {selectedNotes.size > 0
                ? `${selectedNotes.size} selected`
                : 'Select all'}
            </span>
          </div>
          {selectedNotes.size > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectMode(!selectMode)}
                className="text-xs text-pink-600 hover:text-pink-700"
              >
                {selectMode ? 'Done' : 'Edit'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Notes List */}
      <AnimatePresence mode="popLayout">
        {notes.map((note) => (
          <NoteListItem
            key={note.id}
            note={note}
            onSelect={onSelect}
            onEdit={onEdit}
            onDelete={onDelete}
            onShare={onShare}
            onTogglePrivacy={onTogglePrivacy}
            onArchive={onArchive}
            onFavorite={onFavorite}
            onDuplicate={onDuplicate}
            showActions={showActions}
            highlightTerm={highlightTerm}
            compact={compact}
            isSelected={selectedNotes.has(note.id)}
            onToggleSelect={onBulkSelect ? handleToggleSelect : undefined}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}