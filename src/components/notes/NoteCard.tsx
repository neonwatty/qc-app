'use client'

import React, { useState } from 'react'
import { MoreVertical, Edit2, Trash2, Share2, Lock, Archive, Star, Copy, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PrivacyBadge } from './PrivacyBadge'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { Note } from './NotesDashboard'

interface NoteCardProps {
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
  className?: string
}

export function NoteCard({
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
  className
}: NoteCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [isPressed, setIsPressed] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)

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
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
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
    { icon: Lock, label: 'Make Private', action: onTogglePrivacy, show: !!onTogglePrivacy && note.type === 'shared' },
    { icon: Copy, label: 'Duplicate', action: onDuplicate, show: !!onDuplicate },
    { icon: Archive, label: 'Archive', action: onArchive, show: !!onArchive },
    { icon: Trash2, label: 'Delete', action: onDelete, show: !!onDelete, danger: true }
  ].filter(item => item.show)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={() => {
        setIsPressed(false)
        setShowMenu(false)
      }}
      className={cn("relative", className)}
    >
      <Card
        variant="interactive"
        className={cn(
          "group h-full transition-all duration-200",
          "hover:shadow-lg hover:border-pink-200",
          isPressed && "scale-[0.98]",
          compact && "p-3",
          "cursor-pointer"
        )}
        onClick={() => onSelect?.(note)}
      >
        <CardContent className={cn("space-y-3", compact ? "p-0" : "p-4")}>
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className={cn(
                "font-semibold text-gray-900 line-clamp-2",
                compact ? "text-sm" : "text-base"
              )}>
                {highlightText(note.title, highlightTerm)}
              </h3>
            </div>
            
            {/* Quick Actions */}
            <div className="flex items-center gap-1">
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
                  "opacity-0 group-hover:opacity-100",
                  isFavorited && "opacity-100"
                )}
              >
                <Star className={cn(
                  "h-4 w-4 transition-colors",
                  isFavorited ? "fill-yellow-400 text-yellow-400" : "text-gray-400"
                )} />
              </button>

              {/* Privacy Badge */}
              <PrivacyBadge type={note.type} compact={compact} />

              {/* More Actions Menu */}
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
                      showMenu && "bg-gray-100"
                    )}
                  >
                    <MoreVertical className="h-4 w-4 text-gray-500" />
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
            </div>
          </div>

          {/* Content */}
          <p className={cn(
            "text-gray-600 line-clamp-3",
            compact ? "text-xs line-clamp-2" : "text-sm"
          )}>
            {highlightText(note.content, highlightTerm)}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs">
            {/* Category */}
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
              {highlightText(note.category, highlightTerm)}
            </span>

            {/* Date */}
            <span className="flex items-center gap-1 text-gray-500">
              <Clock className="h-3 w-3" />
              {formatDate(note.date)}
            </span>
          </div>

          {/* Tags */}
          {note.tags && note.tags.length > 0 && !compact && (
            <div className="flex flex-wrap gap-1">
              {note.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-pink-50 text-pink-600"
                >
                  #{highlightText(tag, highlightTerm)}
                </span>
              ))}
            </div>
          )}

          {/* Mobile Swipe Indicator */}
          <div className="sm:hidden absolute inset-x-0 bottom-1 flex justify-center opacity-30">
            <div className="w-12 h-1 bg-gray-400 rounded-full" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}