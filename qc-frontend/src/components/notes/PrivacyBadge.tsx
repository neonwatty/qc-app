'use client'

import React from 'react'
import { Eye, EyeOff, StickyNote, Users, Lock, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { NoteType } from './NotesDashboard'
import { motion } from 'framer-motion'

interface PrivacyBadgeProps {
  type: NoteType
  size?: 'xs' | 'sm' | 'md' | 'lg'
  variant?: 'default' | 'solid' | 'outline' | 'ghost'
  showLabel?: boolean
  animated?: boolean
  compact?: boolean
  interactive?: boolean
  onClick?: () => void
  className?: string
}

export function PrivacyBadge({
  type,
  size = 'md',
  variant = 'default',
  showLabel = true,
  animated = true,
  compact = false,
  interactive = false,
  onClick,
  className
}: PrivacyBadgeProps) {
  const getIcon = () => {
    switch (type) {
      case 'shared':
        return compact ? Eye : Users
      case 'private':
        return compact ? EyeOff : Lock
      case 'draft':
        return compact ? StickyNote : FileText
      default:
        return Eye
    }
  }

  const getLabel = () => {
    switch (type) {
      case 'shared':
        return 'Shared'
      case 'private':
        return 'Private'
      case 'draft':
        return 'Draft'
      default:
        return type
    }
  }

  const getColors = () => {
    switch (variant) {
      case 'solid':
        switch (type) {
          case 'shared':
            return 'bg-green-500 text-white border-green-500'
          case 'private':
            return 'bg-blue-500 text-white border-blue-500'
          case 'draft':
            return 'bg-orange-500 text-white border-orange-500'
        }
      case 'outline':
        switch (type) {
          case 'shared':
            return 'bg-transparent text-green-600 border-green-500'
          case 'private':
            return 'bg-transparent text-blue-600 border-blue-500'
          case 'draft':
            return 'bg-transparent text-orange-600 border-orange-500'
        }
      case 'ghost':
        switch (type) {
          case 'shared':
            return 'bg-transparent text-green-600 border-transparent hover:bg-green-50'
          case 'private':
            return 'bg-transparent text-blue-600 border-transparent hover:bg-blue-50'
          case 'draft':
            return 'bg-transparent text-orange-600 border-transparent hover:bg-orange-50'
        }
      default: // 'default'
        switch (type) {
          case 'shared':
            return 'bg-green-100 text-green-800 border-green-200'
          case 'private':
            return 'bg-blue-100 text-blue-800 border-blue-200'
          case 'draft':
            return 'bg-orange-100 text-orange-800 border-orange-200'
        }
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'xs':
        return 'text-xs px-1.5 py-0.5 gap-0.5'
      case 'sm':
        return 'text-xs px-2 py-0.5 gap-1'
      case 'md':
        return 'text-sm px-2.5 py-1 gap-1'
      case 'lg':
        return 'text-base px-3 py-1.5 gap-1.5'
    }
  }

  const getIconSize = () => {
    switch (size) {
      case 'xs':
        return 'h-3 w-3'
      case 'sm':
        return 'h-3 w-3'
      case 'md':
        return 'h-4 w-4'
      case 'lg':
        return 'h-5 w-5'
    }
  }

  const Icon = getIcon()
  const label = getLabel()
  const colors = getColors()
  const sizeClasses = getSizeClasses()
  const iconSize = getIconSize()

  const badge = (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border transition-all duration-200',
        colors,
        sizeClasses,
        interactive && 'cursor-pointer hover:shadow-md active:scale-95',
        className
      )}
      onClick={interactive ? onClick : undefined}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={interactive ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.()
        }
      } : undefined}
    >
      <Icon className={cn(iconSize, 'shrink-0')} />
      {showLabel && !compact && (
        <span className="truncate">{label}</span>
      )}
    </span>
  )

  if (animated) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={interactive ? { scale: 1.05 } : undefined}
        whileTap={interactive ? { scale: 0.95 } : undefined}
        transition={{ duration: 0.2 }}
      >
        {badge}
      </motion.div>
    )
  }

  return badge
}

// Additional utility component for showing privacy status with tooltips
interface PrivacyIndicatorProps {
  type: NoteType
  size?: 'sm' | 'md' | 'lg'
  showTooltip?: boolean
  className?: string
}

export function PrivacyIndicator({
  type,
  size = 'md',
  showTooltip = true,
  className
}: PrivacyIndicatorProps) {
  const getDescription = () => {
    switch (type) {
      case 'shared':
        return 'Visible to both partners'
      case 'private':
        return 'Only visible to you'
      case 'draft':
        return 'Not yet shared'
      default:
        return ''
    }
  }

  const Icon = type === 'shared' ? Eye : type === 'private' ? EyeOff : StickyNote
  const color = type === 'shared' ? 'text-green-600' : type === 'private' ? 'text-blue-600' : 'text-orange-600'
  const sizeClass = size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-5 w-5' : 'h-6 w-6'

  return (
    <div className={cn('relative group', className)}>
      <Icon className={cn(sizeClass, color, 'transition-colors')} />
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
          {getDescription()}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-0 h-0 border-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  )
}

// Privacy selector component for changing privacy levels
interface PrivacySelectorProps {
  value: NoteType
  onChange: (type: NoteType) => void
  disabled?: boolean
  className?: string
}

export function PrivacySelector({
  value,
  onChange,
  disabled = false,
  className
}: PrivacySelectorProps) {
  const options: { value: NoteType; label: string; icon: React.ElementType; color: string }[] = [
    { value: 'shared', label: 'Shared', icon: Users, color: 'text-green-600 hover:bg-green-50' },
    { value: 'private', label: 'Private', icon: Lock, color: 'text-blue-600 hover:bg-blue-50' },
    { value: 'draft', label: 'Draft', icon: FileText, color: 'text-orange-600 hover:bg-orange-50' }
  ]

  return (
    <div className={cn('inline-flex rounded-lg bg-gray-100 p-1', className)}>
      {options.map(option => {
        const Icon = option.icon
        const isSelected = value === option.value
        return (
          <button
            key={option.value}
            onClick={() => !disabled && onChange(option.value)}
            disabled={disabled}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200',
              isSelected
                ? 'bg-white text-gray-900 shadow-sm'
                : cn('text-gray-600 hover:text-gray-900', option.color),
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <Icon className="h-4 w-4" />
            {option.label}
          </button>
        )
      })}
    </div>
  )
}