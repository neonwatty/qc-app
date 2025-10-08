'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, parseISO, isToday, isYesterday } from 'date-fns'
import {
  Award,
  Heart,
  MessageCircle,
  Target,
  Calendar,
  User,
  Users,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Star,
  CheckCircle,
  Clock,
  Eye,
  EyeOff
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface TimelineEntry {
  id: string
  type: 'milestone' | 'checkin' | 'note' | 'goal'
  title: string
  description: string
  date: string | Date
  category?: string
  achieved?: boolean
  data?: any
}

interface TimelineItemProps {
  entry: TimelineEntry
  isLast?: boolean
  showLine?: boolean
  className?: string
  onItemClick?: (entry: TimelineEntry) => void
}

const typeConfig = {
  milestone: {
    icon: Award,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-200',
    dotColor: 'bg-yellow-500',
    label: 'Milestone'
  },
  checkin: {
    icon: Heart,
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
    borderColor: 'border-pink-200',
    dotColor: 'bg-pink-500',
    label: 'Check-in'
  },
  note: {
    icon: MessageCircle,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200',
    dotColor: 'bg-blue-500',
    label: 'Note'
  },
  goal: {
    icon: Target,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-200',
    dotColor: 'bg-green-500',
    label: 'Goal'
  }
}

const categoryColors = {
  communication: 'bg-blue-500',
  trust: 'bg-green-500',
  growth: 'bg-purple-500',
  celebration: 'bg-pink-500',
  consistency: 'bg-orange-500',
  goals: 'bg-indigo-500',
  connection: 'bg-red-500'
}

export const TimelineItem: React.FC<TimelineItemProps> = ({
  entry,
  isLast = false,
  showLine = true,
  className,
  onItemClick
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const config = typeConfig[entry.type]
  const Icon = config.icon
  
  const date = typeof entry.date === 'string' ? parseISO(entry.date) : entry.date
  
  const formatDate = (date: Date) => {
    if (isToday(date)) {
      return 'Today'
    }
    if (isYesterday(date)) {
      return 'Yesterday'
    }
    return format(date, 'MMM d, yyyy')
  }

  const formatTime = (date: Date) => {
    return format(date, 'h:mm a')
  }

  const handleClick = () => {
    if (onItemClick) {
      onItemClick(entry)
    } else {
      setIsExpanded(!isExpanded)
    }
  }

  const hasDetails = entry.data || entry.description.length > 100
  const shouldTruncate = entry.description.length > 100
  const truncatedDescription = shouldTruncate 
    ? entry.description.slice(0, 100) + '...'
    : entry.description

  return (
    <motion.div
      className={cn('relative', className)}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Timeline Line Connection */}
      {showLine && !isLast && (
        <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200"></div>
      )}
      
      {/* Timeline Dot */}
      <div className="relative flex items-start">
        <div className={cn(
          'absolute left-6 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-white shadow-md z-10',
          config.dotColor
        )}></div>
        
        {/* Content */}
        <div className="ml-12 w-full">
          <motion.div
            className={cn(
              'bg-white rounded-lg border shadow-sm p-4 cursor-pointer transition-all duration-200',
              'hover:shadow-md hover:border-gray-300',
              config.borderColor
            )}
            whileHover={{ y: -2 }}
            onClick={handleClick}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-start gap-3 flex-1">
                <div className={cn(
                  'flex-shrink-0 p-2 rounded-lg',
                  config.bgColor
                )}>
                  <Icon className={cn('h-4 w-4', config.color)} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                      {entry.title}
                    </h3>
                    {entry.achieved === true && (
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                    )}
                    {entry.achieved === false && (
                      <Clock className="h-4 w-4 text-orange-600 flex-shrink-0" />
                    )}
                  </div>
                  
                  {/* Category */}
                  {entry.category && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className={cn(
                        'w-2 h-2 rounded-full',
                        categoryColors[entry.category as keyof typeof categoryColors] || 'bg-gray-400'
                      )}></div>
                      <span className="text-xs text-gray-600 capitalize">
                        {entry.category}
                      </span>
                    </div>
                  )}
                  
                  {/* Description */}
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {isExpanded ? entry.description : truncatedDescription}
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-2 ml-2">
                {/* Type Badge */}
                <span className={cn(
                  'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                  config.bgColor,
                  config.color
                )}>
                  {config.label}
                </span>
                
                {/* Expand/Collapse */}
                {(hasDetails || shouldTruncate) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsExpanded(!isExpanded)
                    }}
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronRight className="h-3 w-3" />
                    )}
                  </Button>
                )}
              </div>
            </div>
            
            {/* Date & Time */}
            <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(date)}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatTime(date)}
              </div>
              {entry.data?.participants && (
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {entry.data.participants.length} participant{entry.data.participants.length !== 1 ? 's' : ''}
                </div>
              )}
            </div>
            
            {/* Expanded Details */}
            <AnimatePresence>
              {isExpanded && entry.data && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 pt-4 border-t border-gray-100"
                >
                  {/* Check-in specific details */}
                  {entry.type === 'checkin' && entry.data && (
                    <div className="space-y-3">
                      {entry.data.mood && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600">Mood:</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">Before: {entry.data.mood.before}/10</span>
                            {entry.data.mood.after && (
                              <span className="text-xs text-gray-500">After: {entry.data.mood.after}/10</span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {entry.data.categories && entry.data.categories.length > 0 && (
                        <div>
                          <span className="text-xs text-gray-600 block mb-1">Categories:</span>
                          <div className="flex flex-wrap gap-1">
                            {entry.data.categories.map((cat: string, index: number) => (
                              <span key={index} className="px-2 py-1 bg-gray-100 text-xs rounded-full text-gray-700">
                                {cat}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {entry.data.actionItems && entry.data.actionItems.length > 0 && (
                        <div>
                          <span className="text-xs text-gray-600 block mb-1">Action Items:</span>
                          <ul className="space-y-1">
                            {entry.data.actionItems.slice(0, 3).map((item: any, index: number) => (
                              <li key={index} className="flex items-center gap-2 text-xs text-gray-600">
                                <div className={cn(
                                  'w-1.5 h-1.5 rounded-full',
                                  item.completed ? 'bg-green-500' : 'bg-orange-500'
                                )}></div>
                                {item.title}
                              </li>
                            ))}
                            {entry.data.actionItems.length > 3 && (
                              <li className="text-xs text-gray-500 ml-3">
                                +{entry.data.actionItems.length - 3} more
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Note specific details */}
                  {entry.type === 'note' && entry.data && (
                    <div className="space-y-3">
                      {entry.data.privacy && (
                        <div className="flex items-center gap-2">
                          {entry.data.privacy === 'private' ? (
                            <>
                              <EyeOff className="h-3 w-3 text-gray-500" />
                              <span className="text-xs text-gray-600">Private note</span>
                            </>
                          ) : (
                            <>
                              <Eye className="h-3 w-3 text-gray-500" />
                              <span className="text-xs text-gray-600">Shared note</span>
                            </>
                          )}
                        </div>
                      )}
                      
                      {entry.data.tags && entry.data.tags.length > 0 && (
                        <div>
                          <span className="text-xs text-gray-600 block mb-1">Tags:</span>
                          <div className="flex flex-wrap gap-1">
                            {entry.data.tags.map((tag: string, index: number) => (
                              <span key={index} className="px-2 py-1 bg-blue-50 text-xs rounded-full text-blue-700">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Milestone specific details */}
                  {entry.type === 'milestone' && entry.data && (
                    <div className="space-y-3">
                      {entry.data.icon && (
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{entry.data.icon}</span>
                          <span className="text-xs text-gray-600">Achievement unlocked</span>
                        </div>
                      )}
                      
                      {entry.data.points && (
                        <div className="flex items-center gap-2">
                          <Star className="h-3 w-3 text-yellow-500" />
                          <span className="text-xs text-gray-600">{entry.data.points} points earned</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Action Button */}
                  {entry.data.link && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={(e) => {
                          e.stopPropagation()
                          // Handle link navigation
                        }}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}