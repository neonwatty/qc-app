'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ActivityItem, ActivityData } from './ActivityItem'
import { StaggerContainer, StaggerItem } from '@/components/ui/motion'
import { cn } from '@/lib/utils'
import { 
  RefreshCw, 
  Filter, 
  ChevronDown,
  Activity as ActivityIcon,
  Eye,
  EyeOff
} from 'lucide-react'
import { Note, ActionItem, Milestone, Couple, CheckIn } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'

interface ActivityFeedProps {
  couple?: Couple | null
  notes?: Note[]
  actionItems?: ActionItem[]
  milestones?: Milestone[]
  checkIns?: CheckIn[]
  className?: string
  maxItems?: number
  showFilters?: boolean
}

type FilterType = 'all' | 'notes' | 'actions' | 'milestones'

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  couple,
  notes = [],
  actionItems = [],
  milestones = [],
  checkIns = [],
  className,
  maxItems = 10,
  showFilters = true
}) => {
  const [filter, setFilter] = useState<FilterType>('all')
  const [visibleItems, setVisibleItems] = useState(6)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showPrivate, setShowPrivate] = useState(true)

  // Generate activity data from all sources
  const activities = useMemo(() => {
    const activityList: ActivityData[] = []

    // Add notes
    notes.forEach(note => {
      if (!showPrivate && note.privacy === 'private') return
      activityList.push({
        type: 'note',
        id: note.id,
        timestamp: note.createdAt,
        data: note
      })
    })

    // Add completed action items
    actionItems
      .filter(item => item.completed && item.completedAt)
      .forEach(item => {
        activityList.push({
          type: 'action',
          id: item.id,
          timestamp: item.completedAt!,
          data: item
        })
      })

    // Add milestones
    milestones.forEach(milestone => {
      activityList.push({
        type: 'milestone',
        id: milestone.id,
        timestamp: milestone.achievedAt,
        data: milestone
      })
    })

    // Sort by timestamp (newest first)
    return activityList.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  }, [notes, actionItems, milestones, showPrivate])

  // Filter activities
  const filteredActivities = useMemo(() => {
    if (filter === 'all') return activities
    return activities.filter(activity => {
      switch (filter) {
        case 'notes':
          return activity.type === 'note'
        case 'actions':
          return activity.type === 'action'
        case 'milestones':
          return activity.type === 'milestone'
        default:
          return true
      }
    })
  }, [activities, filter])

  const displayedActivities = filteredActivities.slice(0, visibleItems)
  const hasMore = filteredActivities.length > visibleItems

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate refresh delay
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1000)
  }

  const loadMore = () => {
    setVisibleItems(prev => Math.min(prev + 6, filteredActivities.length))
  }

  const getFilterCount = (filterType: FilterType) => {
    if (filterType === 'all') return activities.length
    return activities.filter(activity => {
      switch (filterType) {
        case 'notes':
          return activity.type === 'note'
        case 'actions':
          return activity.type === 'action'
        case 'milestones':
          return activity.type === 'milestone'
        default:
          return false
      }
    }).length
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ActivityIcon className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Activity Feed</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPrivate(!showPrivate)}
              className="text-gray-600 hover:text-gray-900"
            >
              {showPrivate ? (
                <>
                  <Eye className="h-4 w-4 mr-1" />
                  Show Private
                </>
              ) : (
                <>
                  <EyeOff className="h-4 w-4 mr-1" />
                  Hide Private
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="text-gray-600 hover:text-gray-900"
            >
              <RefreshCw className={cn(
                "h-4 w-4",
                isRefreshing && "animate-spin"
              )} />
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="flex flex-wrap gap-2 mt-3">
            {(['all', 'notes', 'actions', 'milestones'] as FilterType[]).map((filterType) => (
              <Button
                key={filterType}
                variant={filter === filterType ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(filterType)}
                className={cn(
                  "text-xs font-medium transition-all",
                  filter === filterType 
                    ? "bg-blue-600 text-white hover:bg-blue-700" 
                    : "text-gray-600 hover:text-gray-900 hover:border-gray-400"
                )}
              >
                <Filter className="h-3 w-3 mr-1" />
                {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
                  {getFilterCount(filterType)}
                </span>
              </Button>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        {displayedActivities.length === 0 ? (
          <motion.div 
            className="text-center py-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <ActivityIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No activities yet
            </h3>
            <p className="text-gray-600 max-w-sm mx-auto">
              {filter === 'all' 
                ? "Start your relationship journey by completing your first check-in or adding notes."
                : `No ${filter} activities found. Try changing the filter or add some ${filter}.`
              }
            </p>
          </motion.div>
        ) : (
          <>
            {/* Activity List */}
            <StaggerContainer 
              staggerDelay={0.1} 
              className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
            >
              <AnimatePresence mode="popLayout">
                {displayedActivities.map((activity, index) => (
                  <StaggerItem key={activity.id}>
                    <ActivityItem
                      activity={activity}
                      delay={index}
                      className="hover:border-blue-300 transition-colors"
                    />
                  </StaggerItem>
                ))}
              </AnimatePresence>
            </StaggerContainer>

            {/* Load More Button */}
            {hasMore && (
              <motion.div 
                className="mt-6 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  variant="outline"
                  onClick={loadMore}
                  className="text-gray-600 hover:text-gray-900 hover:border-gray-400"
                >
                  <ChevronDown className="h-4 w-4 mr-2" />
                  Load More ({filteredActivities.length - visibleItems} remaining)
                </Button>
              </motion.div>
            )}

            {/* Activity Summary */}
            {filteredActivities.length > 0 && (
              <motion.div 
                className="mt-6 pt-4 border-t border-gray-200"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>
                    Showing {displayedActivities.length} of {filteredActivities.length} activities
                  </span>
                  <span className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      {getFilterCount('notes')} Notes
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      {getFilterCount('actions')} Actions
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      {getFilterCount('milestones')} Milestones
                    </span>
                  </span>
                </div>
              </motion.div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}