'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, parseISO, isThisYear, formatDistanceToNow } from 'date-fns'
import {
  Award,
  Star,
  Calendar,
  CheckCircle,
  Clock,
  Trophy,
  Target,
  Heart,
  Users,
  TrendingUp,
  ChevronRight,
  ChevronDown,
  Share2,
  Bookmark,
  BookmarkCheck
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface Milestone {
  id: string
  title: string
  description: string
  achievedAt: Date | string
  icon: string
  category: 'communication' | 'trust' | 'growth' | 'celebration' | 'consistency' | 'goals' | 'connection'
  coupleId: string
  achieved?: boolean
  points?: number
  rarity?: 'common' | 'rare' | 'epic' | 'legendary'
  progress?: number
  targetDate?: Date | string
  data?: any
}

interface MilestoneCardProps {
  milestone: Milestone
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'compact' | 'featured'
  showProgress?: boolean
  showActions?: boolean
  className?: string
  onShare?: (milestone: Milestone) => void
  onBookmark?: (milestone: Milestone) => void
  onClick?: (milestone: Milestone) => void
}

const categoryConfig = {
  communication: {
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200',
    gradientFrom: 'from-blue-500',
    gradientTo: 'to-blue-600',
    icon: Users
  },
  trust: {
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-200',
    gradientFrom: 'from-green-500',
    gradientTo: 'to-green-600',
    icon: Heart
  },
  growth: {
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-200',
    gradientFrom: 'from-purple-500',
    gradientTo: 'to-purple-600',
    icon: TrendingUp
  },
  celebration: {
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
    borderColor: 'border-pink-200',
    gradientFrom: 'from-pink-500',
    gradientTo: 'to-pink-600',
    icon: Trophy
  },
  consistency: {
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-200',
    gradientFrom: 'from-orange-500',
    gradientTo: 'to-orange-600',
    icon: CheckCircle
  },
  goals: {
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    borderColor: 'border-indigo-200',
    gradientFrom: 'from-indigo-500',
    gradientTo: 'to-indigo-600',
    icon: Target
  },
  connection: {
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-200',
    gradientFrom: 'from-red-500',
    gradientTo: 'to-red-600',
    icon: Heart
  }
}

const rarityConfig = {
  common: {
    borderColor: 'border-gray-300',
    glowColor: 'shadow-gray-200',
    badgeColor: 'bg-gray-100 text-gray-700'
  },
  rare: {
    borderColor: 'border-blue-300',
    glowColor: 'shadow-blue-200',
    badgeColor: 'bg-blue-100 text-blue-700'
  },
  epic: {
    borderColor: 'border-purple-300',
    glowColor: 'shadow-purple-200',
    badgeColor: 'bg-purple-100 text-purple-700'
  },
  legendary: {
    borderColor: 'border-yellow-300',
    glowColor: 'shadow-yellow-200',
    badgeColor: 'bg-yellow-100 text-yellow-700'
  }
}

const sizeConfig = {
  sm: {
    padding: 'p-4',
    iconSize: 'h-6 w-6',
    titleSize: 'text-sm',
    descSize: 'text-xs'
  },
  md: {
    padding: 'p-5',
    iconSize: 'h-8 w-8',
    titleSize: 'text-base',
    descSize: 'text-sm'
  },
  lg: {
    padding: 'p-6',
    iconSize: 'h-10 w-10',
    titleSize: 'text-lg',
    descSize: 'text-base'
  }
}

export const MilestoneCard: React.FC<MilestoneCardProps> = ({
  milestone,
  size = 'md',
  variant = 'default',
  showProgress = false,
  showActions = true,
  className,
  onShare,
  onBookmark,
  onClick
}) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  
  const config = categoryConfig[milestone.category]
  const rarityConf = rarityConfig[milestone.rarity || 'common']
  const sizeConf = sizeConfig[size]
  const CategoryIcon = config.icon
  
  const achievedDate = typeof milestone.achievedAt === 'string' 
    ? parseISO(milestone.achievedAt) 
    : milestone.achievedAt
  
  const targetDate = milestone.targetDate 
    ? typeof milestone.targetDate === 'string' 
      ? parseISO(milestone.targetDate) 
      : milestone.targetDate
    : null

  const formatDate = (date: Date) => {
    if (isThisYear(date)) {
      return format(date, 'MMM d')
    }
    return format(date, 'MMM d, yyyy')
  }

  const handleClick = () => {
    if (onClick) {
      onClick(milestone)
    } else {
      setIsExpanded(!isExpanded)
    }
  }

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation()
    onShare?.(milestone)
  }

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsBookmarked(!isBookmarked)
    onBookmark?.(milestone)
  }

  if (variant === 'compact') {
    return (
      <motion.div
        className={cn(
          'flex items-center gap-3 p-3 bg-white border rounded-lg cursor-pointer transition-all duration-200',
          'hover:shadow-md hover:border-gray-300',
          config.borderColor,
          className
        )}
        whileHover={{ y: -1 }}
        onClick={handleClick}
      >
        <div className={cn(
          'flex-shrink-0 p-2 rounded-lg',
          config.bgColor
        )}>
          <CategoryIcon className={cn('h-5 w-5', config.color)} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-900 text-sm truncate">
            {milestone.title}
          </h3>
          <p className="text-xs text-gray-600 truncate">
            {milestone.description}
          </p>
        </div>
        
        <div className="flex-shrink-0 text-right">
          {milestone.achieved ? (
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-xs">{formatDate(achievedDate)}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-orange-600">
              <Clock className="h-4 w-4" />
              {showProgress && milestone.progress && (
                <span className="text-xs">{milestone.progress}%</span>
              )}
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  if (variant === 'featured') {
    return (
      <motion.div
        className={cn(
          'relative overflow-hidden rounded-xl cursor-pointer group',
          rarityConf.glowColor,
          className
        )}
        whileHover={{ scale: 1.02, y: -2 }}
        onClick={handleClick}
      >
        {/* Background Gradient */}
        <div className={cn(
          'absolute inset-0 bg-gradient-to-br opacity-10',
          config.gradientFrom,
          config.gradientTo
        )}></div>
        
        {/* Rarity Glow Effect */}
        {milestone.rarity && milestone.rarity !== 'common' && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -skew-x-12 translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000"></div>
        )}
        
        <Card className={cn(
          'border-2 bg-white/95 backdrop-blur-sm',
          rarityConf.borderColor
        )}>
          <CardContent className={sizeConf.padding}>
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'p-3 rounded-xl',
                  config.bgColor
                )}>
                  <span className="text-2xl">{milestone.icon}</span>
                </div>
                
                <div>
                  <h3 className={cn(
                    'font-bold text-gray-900',
                    sizeConf.titleSize
                  )}>
                    {milestone.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <CategoryIcon className={cn('h-4 w-4', config.color)} />
                    <span className={cn('capitalize', config.color, 'text-sm font-medium')}>
                      {milestone.category}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Rarity Badge */}
              {milestone.rarity && milestone.rarity !== 'common' && (
                <span className={cn(
                  'px-2 py-1 rounded-full text-xs font-medium capitalize',
                  rarityConf.badgeColor
                )}>
                  {milestone.rarity}
                </span>
              )}
            </div>
            
            {/* Description */}
            <p className={cn(
              'text-gray-600 mb-4',
              sizeConf.descSize
            )}>
              {milestone.description}
            </p>
            
            {/* Achievement Status */}
            {milestone.achieved ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-green-600">
                  <Trophy className="h-5 w-5" />
                  <span className="text-sm font-medium">Achieved</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Calendar className="h-4 w-4" />
                  {formatDate(achievedDate)}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {showProgress && milestone.progress !== undefined && (
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Progress</span>
                      <span className={config.color}>{milestone.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div 
                        className={cn(
                          'h-2 rounded-full',
                          `bg-gradient-to-r ${config.gradientFrom} ${config.gradientTo}`
                        )}
                        initial={{ width: 0 }}
                        animate={{ width: `${milestone.progress}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                      ></motion.div>
                    </div>
                  </div>
                )}
                
                {targetDate && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-orange-600">
                      <Target className="h-5 w-5" />
                      <span className="text-sm font-medium">In Progress</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      Target: {formatDate(targetDate)}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Points */}
            {milestone.points && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-gray-600">
                  {milestone.points} points {milestone.achieved ? 'earned' : 'available'}
                </span>
              </div>
            )}
            
            {/* Actions */}
            {showActions && (
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsExpanded(!isExpanded)
                  }}
                  className="text-gray-600 hover:text-gray-900"
                >
                  {isExpanded ? (
                    <>
                      <ChevronDown className="h-4 w-4 mr-1" />
                      Less
                    </>
                  ) : (
                    <>
                      <ChevronRight className="h-4 w-4 mr-1" />
                      More
                    </>
                  )}
                </Button>
                
                <div className="flex items-center gap-2">
                  {onBookmark && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleBookmark}
                      className={cn(
                        'text-gray-600 hover:text-gray-900',
                        isBookmarked && 'text-blue-600'
                      )}
                    >
                      {isBookmarked ? (
                        <BookmarkCheck className="h-4 w-4" />
                      ) : (
                        <Bookmark className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                  
                  {onShare && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleShare}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            )}
            
            {/* Expanded Content */}
            <AnimatePresence>
              {isExpanded && milestone.data && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 pt-4 border-t border-gray-100"
                >
                  {milestone.data.details && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-900">Details</h4>
                      <p className="text-sm text-gray-600">{milestone.data.details}</p>
                    </div>
                  )}
                  
                  {milestone.data.steps && milestone.data.steps.length > 0 && (
                    <div className="space-y-2 mt-3">
                      <h4 className="text-sm font-medium text-gray-900">Steps to achieve</h4>
                      <ul className="space-y-1">
                        {milestone.data.steps.map((step: string, index: number) => (
                          <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  // Default variant
  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
    >
      <Card className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-md',
        config.borderColor,
        'border'
      )}>
        <CardContent 
          className={sizeConf.padding}
          onClick={handleClick}
        >
          {/* Header */}
          <div className="flex items-start gap-3 mb-3">
            <div className={cn(
              'flex-shrink-0 p-2 rounded-lg',
              config.bgColor
            )}>
              <span className="text-xl">{milestone.icon}</span>
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className={cn(
                'font-semibold text-gray-900 mb-1',
                sizeConf.titleSize
              )}>
                {milestone.title}
              </h3>
              <p className={cn(
                'text-gray-600',
                sizeConf.descSize
              )}>
                {milestone.description}
              </p>
            </div>
            
            <div className="flex-shrink-0">
              {milestone.achieved ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <Clock className="h-5 w-5 text-orange-600" />
              )}
            </div>
          </div>
          
          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <CategoryIcon className={cn('h-4 w-4', config.color)} />
              <span className={cn(
                'text-sm capitalize font-medium',
                config.color
              )}>
                {milestone.category}
              </span>
            </div>
            
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              {milestone.achieved ? formatDate(achievedDate) : (
                targetDate ? `Target: ${formatDate(targetDate)}` : 'In progress'
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}