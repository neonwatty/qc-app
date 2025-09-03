'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { 
  MessageCircle, 
  CheckCircle, 
  Trophy, 
  StickyNote, 
  Heart,
  Clock,
  User,
  Users,
  Sparkles
} from 'lucide-react'
import { Note, ActionItem, Milestone } from '@/types'
import { formatDistanceToNow } from 'date-fns'

export type ActivityType = 'note' | 'action' | 'milestone'

export interface ActivityData {
  type: ActivityType
  id: string
  timestamp: Date
  data: Note | ActionItem | Milestone
}

interface ActivityItemProps {
  activity: ActivityData
  className?: string
  delay?: number
}

const getActivityIcon = (type: ActivityType, data: any) => {
  switch (type) {
    case 'note':
      const note = data as Note
      return note.privacy === 'shared' ? (
        <MessageCircle className="h-4 w-4" />
      ) : (
        <StickyNote className="h-4 w-4" />
      )
    case 'action':
      return <CheckCircle className="h-4 w-4" />
    case 'milestone':
      return <Trophy className="h-4 w-4" />
    default:
      return <Heart className="h-4 w-4" />
  }
}

const getActivityColor = (type: ActivityType, data: any) => {
  switch (type) {
    case 'note':
      const note = data as Note
      return note.privacy === 'shared' 
        ? 'bg-blue-500 text-white' 
        : 'bg-purple-500 text-white'
    case 'action':
      return 'bg-green-500 text-white'
    case 'milestone':
      return 'bg-yellow-500 text-white'
    default:
      return 'bg-gray-500 text-white'
  }
}

const getActivityContent = (type: ActivityType, data: any) => {
  switch (type) {
    case 'note':
      const note = data as Note
      return {
        title: note.privacy === 'shared' ? 'Shared Note Added' : 'Private Note Added',
        description: note.content.length > 100 
          ? `${note.content.substring(0, 100)}...` 
          : note.content,
        meta: note.privacy === 'shared' ? 'Shared with partner' : 'Private reflection'
      }
    case 'action':
      const action = data as ActionItem
      return {
        title: action.completed ? 'Action Item Completed' : 'Action Item Created',
        description: action.title,
        meta: action.assignedTo === 'user1' ? 'Assigned to Alex' : 'Assigned to Jordan'
      }
    case 'milestone':
      const milestone = data as Milestone
      return {
        title: 'Milestone Achieved!',
        description: milestone.title,
        meta: milestone.description
      }
    default:
      return {
        title: 'Activity',
        description: 'Unknown activity',
        meta: ''
      }
  }
}

export const ActivityItem: React.FC<ActivityItemProps> = ({ 
  activity, 
  className,
  delay = 0
}) => {
  const { type, timestamp, data } = activity
  const icon = getActivityIcon(type, data)
  const colorClass = getActivityColor(type, data)
  const content = getActivityContent(type, data)
  const timeAgo = formatDistanceToNow(timestamp, { addSuffix: true })

  return (
    <motion.div
      className={cn(
        "flex items-start space-x-3 p-4 rounded-lg border border-gray-200 bg-white hover:shadow-md transition-all duration-200",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay: delay * 0.1,
        ease: 'easeOut' 
      }}
      whileHover={{ 
        y: -2,
        transition: { duration: 0.2 }
      }}
    >
      {/* Icon */}
      <div className={cn(
        "flex-shrink-0 p-2 rounded-full",
        colorClass
      )}>
        {type === 'milestone' ? (
          <div className="relative">
            {icon}
            <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-yellow-300" />
          </div>
        ) : (
          icon
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-gray-900 truncate">
            {content.title}
          </h4>
          <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
            {timeAgo}
          </span>
        </div>
        
        <p className="text-sm text-gray-600 mt-1 leading-relaxed">
          {content.description}
        </p>
        
        {content.meta && (
          <div className="flex items-center mt-2 text-xs text-gray-500">
            {type === 'note' && (
              <>
                {(data as Note).privacy === 'shared' ? (
                  <Users className="h-3 w-3 mr-1" />
                ) : (
                  <User className="h-3 w-3 mr-1" />
                )}
              </>
            )}
            {type === 'action' && (
              <Clock className="h-3 w-3 mr-1" />
            )}
            {type === 'milestone' && (
              <Sparkles className="h-3 w-3 mr-1" />
            )}
            <span>{content.meta}</span>
          </div>
        )}

        {/* Special styling for milestones */}
        {type === 'milestone' && (
          <div className="mt-2 px-3 py-1 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full inline-block">
            <span className="text-xs font-medium text-yellow-800">
              🎉 Milestone Achievement
            </span>
          </div>
        )}

        {/* Special styling for completed actions */}
        {type === 'action' && (data as ActionItem).completed && (
          <div className="mt-2 px-3 py-1 bg-green-100 rounded-full inline-block">
            <span className="text-xs font-medium text-green-800">
              ✅ Completed
            </span>
          </div>
        )}
      </div>
    </motion.div>
  )
}