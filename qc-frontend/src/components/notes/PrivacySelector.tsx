'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, StickyNote, Users, Lock, FileText, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export type NotePrivacy = 'private' | 'shared' | 'draft'

interface PrivacySelectorProps {
  value: NotePrivacy
  onChange: (privacy: NotePrivacy) => void
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'compact' | 'dropdown'
  showLabels?: boolean
  className?: string
}

interface PrivacyOption {
  value: NotePrivacy
  label: string
  description: string
  icon: React.ElementType
  color: string
  bgColor: string
  hoverColor: string
}

const privacyOptions: PrivacyOption[] = [
  {
    value: 'shared',
    label: 'Shared',
    description: 'Visible to both partners',
    icon: Users,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    hoverColor: 'hover:bg-green-50'
  },
  {
    value: 'private',
    label: 'Private',
    description: 'Only visible to you',
    icon: Lock,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    hoverColor: 'hover:bg-blue-50'
  },
  {
    value: 'draft',
    label: 'Draft',
    description: 'Not yet shared',
    icon: FileText,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    hoverColor: 'hover:bg-orange-50'
  }
]

export function PrivacySelector({
  value,
  onChange,
  disabled = false,
  size = 'md',
  variant = 'default',
  showLabels = true,
  className
}: PrivacySelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const currentOption = privacyOptions.find(option => option.value === value) || privacyOptions[0]

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          button: 'text-xs px-2 py-1 gap-1',
          icon: 'h-3 w-3',
          dropdown: 'text-xs'
        }
      case 'md':
        return {
          button: 'text-sm px-3 py-1.5 gap-1.5',
          icon: 'h-4 w-4',
          dropdown: 'text-sm'
        }
      case 'lg':
        return {
          button: 'text-base px-4 py-2 gap-2',
          icon: 'h-5 w-5',
          dropdown: 'text-base'
        }
    }
  }

  const sizeClasses = getSizeClasses()

  // Compact variant - just icons in a row
  if (variant === 'compact') {
    return (
      <div className={cn('inline-flex rounded-lg bg-gray-100 p-1', className)}>
        {privacyOptions.map(option => {
          const Icon = option.icon
          const isSelected = value === option.value
          return (
            <motion.button
              key={option.value}
              type="button"
              onClick={() => !disabled && onChange(option.value)}
              disabled={disabled}
              whileHover={!disabled ? { scale: 1.05 } : undefined}
              whileTap={!disabled ? { scale: 0.95 } : undefined}
              className={cn(
                'flex items-center justify-center rounded-md transition-all duration-200',
                sizeClasses.button,
                isSelected
                  ? 'bg-white text-gray-900 shadow-sm'
                  : cn('text-gray-600 hover:text-gray-900', option.hoverColor),
                disabled && 'opacity-50 cursor-not-allowed'
              )}
              title={`${option.label} - ${option.description}`}
            >
              <Icon className={sizeClasses.icon} />
              {showLabels && size !== 'sm' && (
                <span className="ml-1">{option.label}</span>
              )}
            </motion.button>
          )
        })}
      </div>
    )
  }

  // Dropdown variant
  if (variant === 'dropdown') {
    return (
      <div className={cn('relative', className)}>
        <motion.button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          whileHover={!disabled ? { scale: 1.02 } : undefined}
          whileTap={!disabled ? { scale: 0.98 } : undefined}
          className={cn(
            'flex items-center justify-between w-full',
            'bg-white border border-gray-300 rounded-lg',
            'transition-all duration-200',
            sizeClasses.button,
            isOpen && 'ring-2 ring-blue-500 ring-offset-1',
            disabled && 'opacity-50 cursor-not-allowed bg-gray-50',
            'hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500'
          )}
        >
          <div className="flex items-center gap-2">
            <currentOption.icon className={cn(sizeClasses.icon, currentOption.color)} />
            {showLabels && <span>{currentOption.label}</span>}
          </div>
          <ChevronDown 
            className={cn(
              'h-4 w-4 text-gray-400 transition-transform duration-200',
              isOpen && 'transform rotate-180'
            )} 
          />
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 overflow-hidden"
            >
              {privacyOptions.map((option, index) => {
                const Icon = option.icon
                const isSelected = value === option.value
                return (
                  <motion.button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value)
                      setIsOpen(false)
                    }}
                    whileHover={{ backgroundColor: 'rgb(249 250 251)' }}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 text-left',
                      'transition-colors duration-150',
                      sizeClasses.dropdown,
                      isSelected && 'bg-blue-50',
                      index > 0 && 'border-t border-gray-100'
                    )}
                  >
                    <Icon className={cn('h-4 w-4', option.color)} />
                    <div className="flex-1 min-w-0">
                      <div className={cn('font-medium', isSelected ? 'text-blue-900' : 'text-gray-900')}>
                        {option.label}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {option.description}
                      </div>
                    </div>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2 h-2 bg-blue-500 rounded-full"
                      />
                    )}
                  </motion.button>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Backdrop to close dropdown */}
        {isOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>
    )
  }

  // Default variant - segmented control
  return (
    <div className={cn('inline-flex rounded-lg bg-gray-100 p-1', className)}>
      {privacyOptions.map(option => {
        const Icon = option.icon
        const isSelected = value === option.value
        return (
          <motion.button
            key={option.value}
            type="button"
            onClick={() => !disabled && onChange(option.value)}
            disabled={disabled}
            whileHover={!disabled ? { scale: 1.02 } : undefined}
            whileTap={!disabled ? { scale: 0.98 } : undefined}
            className={cn(
              'flex items-center font-medium rounded-md transition-all duration-200',
              sizeClasses.button,
              isSelected
                ? 'bg-white text-gray-900 shadow-sm'
                : cn('text-gray-600 hover:text-gray-900', option.hoverColor),
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <Icon className={sizeClasses.icon} />
            {showLabels && <span>{option.label}</span>}
          </motion.button>
        )
      })}
    </div>
  )
}

// Utility component for showing privacy level with description
interface PrivacyDisplayProps {
  privacy: NotePrivacy
  size?: 'sm' | 'md' | 'lg'
  showDescription?: boolean
  className?: string
}

export function PrivacyDisplay({
  privacy,
  size = 'md',
  showDescription = true,
  className
}: PrivacyDisplayProps) {
  const option = privacyOptions.find(opt => opt.value === privacy) || privacyOptions[0]
  const Icon = option.icon

  const sizeClasses = {
    sm: { icon: 'h-3 w-3', text: 'text-xs', gap: 'gap-1' },
    md: { icon: 'h-4 w-4', text: 'text-sm', gap: 'gap-1.5' },
    lg: { icon: 'h-5 w-5', text: 'text-base', gap: 'gap-2' }
  }[size]

  return (
    <div className={cn('flex items-center', sizeClasses.gap, className)}>
      <Icon className={cn(sizeClasses.icon, option.color)} />
      <div className="flex flex-col">
        <span className={cn('font-medium', sizeClasses.text)}>
          {option.label}
        </span>
        {showDescription && (
          <span className="text-xs text-gray-500">
            {option.description}
          </span>
        )}
      </div>
    </div>
  )
}

// Hook for privacy option utilities
export function usePrivacyOptions() {
  const getOption = (privacy: NotePrivacy) => {
    return privacyOptions.find(opt => opt.value === privacy) || privacyOptions[0]
  }

  const getIcon = (privacy: NotePrivacy) => {
    return getOption(privacy).icon
  }

  const getLabel = (privacy: NotePrivacy) => {
    return getOption(privacy).label
  }

  const getDescription = (privacy: NotePrivacy) => {
    return getOption(privacy).description
  }

  const getColor = (privacy: NotePrivacy) => {
    return getOption(privacy).color
  }

  return {
    options: privacyOptions,
    getOption,
    getIcon,
    getLabel,
    getDescription,
    getColor
  }
}