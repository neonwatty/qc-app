'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StaggerContainer, StaggerItem } from '@/components/ui/motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Calendar,
  Filter,
  ChevronUp,
  ChevronDown,
  Clock,
  Award,
  Star,
  Target,
  Heart,
  MessageCircle,
  Users,
  TrendingUp
} from 'lucide-react'
import { TimelineItem } from './TimelineItem'
import { format, isThisYear, isSameMonth, parseISO, compareDesc } from 'date-fns'

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

interface TimelineProps {
  entries: TimelineEntry[]
  className?: string
  showFilters?: boolean
  maxVisible?: number
  groupByMonth?: boolean
}

type FilterType = 'all' | 'milestone' | 'checkin' | 'note' | 'goal'
type SortType = 'newest' | 'oldest' | 'category'

const filterIcons = {
  all: TrendingUp,
  milestone: Award,
  checkin: Heart,
  note: MessageCircle,
  goal: Target
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

export const Timeline: React.FC<TimelineProps> = ({
  entries = [],
  className,
  showFilters = true,
  maxVisible = 20,
  groupByMonth = true
}) => {
  const [filter, setFilter] = useState<FilterType>('all')
  const [sort, setSort] = useState<SortType>('newest')
  const [visibleCount, setVisibleCount] = useState(maxVisible)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  // Process and sort entries
  const processedEntries = useMemo(() => {
    let filtered = entries

    // Apply filter
    if (filter !== 'all') {
      filtered = filtered.filter(entry => entry.type === filter)
    }

    // Sort entries
    const sorted = [...filtered].sort((a, b) => {
      const dateA = typeof a.date === 'string' ? parseISO(a.date) : a.date
      const dateB = typeof b.date === 'string' ? parseISO(b.date) : b.date

      switch (sort) {
        case 'newest':
          return compareDesc(dateA, dateB)
        case 'oldest':
          return compareDesc(dateB, dateA)
        case 'category':
          const categoryA = a.category || 'uncategorized'
          const categoryB = b.category || 'uncategorized'
          if (categoryA !== categoryB) {
            return categoryA.localeCompare(categoryB)
          }
          return compareDesc(dateA, dateB)
        default:
          return compareDesc(dateA, dateB)
      }
    })

    return sorted
  }, [entries, filter, sort])

  // Group entries by month if enabled
  const groupedEntries = useMemo(() => {
    if (!groupByMonth) {
      return [{ key: 'all', displayKey: 'All Entries', entries: processedEntries }]
    }

    const groups = new Map<string, TimelineEntry[]>()

    processedEntries.forEach(entry => {
      const date = typeof entry.date === 'string' ? parseISO(entry.date) : entry.date
      const monthKey = format(date, 'yyyy-MM')
      
      if (!groups.has(monthKey)) {
        groups.set(monthKey, [])
      }
      groups.get(monthKey)!.push(entry)
    })

    return Array.from(groups.entries()).map(([key, entries]) => ({
      key,
      displayKey: format(parseISO(key + '-01'), 'MMMM yyyy'),
      entries
    }))
  }, [processedEntries, groupByMonth])

  const visibleEntries = groupedEntries.flatMap(group => group.entries).slice(0, visibleCount)
  const hasMore = processedEntries.length > visibleCount

  const getFilterCount = (filterType: FilterType) => {
    if (filterType === 'all') return entries.length
    return entries.filter(entry => entry.type === filterType).length
  }

  const toggleGroup = (groupKey: string) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey)
    } else {
      newExpanded.add(groupKey)
    }
    setExpandedGroups(newExpanded)
  }

  const loadMore = () => {
    setVisibleCount(prev => Math.min(prev + maxVisible, processedEntries.length))
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Filters */}
      {showFilters && (
        <motion.div 
          className="mb-8 space-y-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            {(['all', 'milestone', 'checkin', 'note', 'goal'] as FilterType[]).map((filterType) => {
              const Icon = filterIcons[filterType]
              const count = getFilterCount(filterType)
              
              return (
                <Button
                  key={filterType}
                  variant={filter === filterType ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(filterType)}
                  className={cn(
                    'text-xs font-medium transition-all',
                    filter === filterType 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'text-gray-600 hover:text-gray-900 hover:border-gray-400'
                  )}
                >
                  <Icon className="h-3 w-3 mr-1" />
                  {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                  <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
                    {count}
                  </span>
                </Button>
              )
            })}
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <div className="flex gap-1">
              {(['newest', 'oldest', 'category'] as SortType[]).map((sortType) => (
                <Button
                  key={sortType}
                  variant={sort === sortType ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSort(sortType)}
                  className="text-xs"
                >
                  {sortType === 'newest' && <ChevronDown className="h-3 w-3 mr-1" />}
                  {sortType === 'oldest' && <ChevronUp className="h-3 w-3 mr-1" />}
                  {sortType === 'category' && <Filter className="h-3 w-3 mr-1" />}
                  {sortType.charAt(0).toUpperCase() + sortType.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Timeline */}
      {processedEntries.length === 0 ? (
        <motion.div 
          className="text-center py-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <TrendingUp className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No timeline entries yet
          </h3>
          <p className="text-gray-600 max-w-sm mx-auto">
            {filter === 'all' 
              ? "Your relationship journey will appear here as you complete check-ins and achieve milestones."
              : `No ${filter} entries found. Try changing the filter or add some ${filter} content.`
            }
          </p>
        </motion.div>
      ) : (
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-purple-200 to-pink-200"></div>

          {/* Timeline Content */}
          <div className="space-y-6">
            {groupByMonth ? (
              // Grouped by month
              groupedEntries.map((group, groupIndex) => {
                const isExpanded = expandedGroups.has(group.key)
                const groupEntries = group.entries.slice(0, visibleCount)
                const hasGroupMore = group.entries.length > visibleCount

                return (
                  <motion.div
                    key={group.key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: groupIndex * 0.1 }}
                  >
                    {/* Month Header */}
                    <div className="relative flex items-center mb-4">
                      <div className="absolute left-6 -translate-x-1/2 w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-md"></div>
                      <div className="ml-12">
                        <button
                          onClick={() => toggleGroup(group.key)}
                          className="flex items-center gap-2 text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                        >
                          <Calendar className="h-5 w-5" />
                          {group.displayKey}
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                          <span className="text-sm text-gray-500 font-normal">
                            ({group.entries.length} {group.entries.length === 1 ? 'entry' : 'entries'})
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Month Entries */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <StaggerContainer className="space-y-6 ml-12">
                            {groupEntries.map((entry, index) => (
                              <StaggerItem key={entry.id}>
                                <TimelineItem
                                  entry={entry}
                                  isLast={index === groupEntries.length - 1}
                                  showLine={false}
                                />
                              </StaggerItem>
                            ))}
                          </StaggerContainer>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })
            ) : (
              // Flat timeline
              <StaggerContainer className="space-y-6">
                {visibleEntries.map((entry, index) => (
                  <StaggerItem key={entry.id}>
                    <TimelineItem
                      entry={entry}
                      isLast={index === visibleEntries.length - 1}
                      showLine={true}
                    />
                  </StaggerItem>
                ))}
              </StaggerContainer>
            )}
          </div>

          {/* Load More */}
          {hasMore && (
            <motion.div 
              className="mt-8 text-center"
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
                Load More ({processedEntries.length - visibleCount} remaining)
              </Button>
            </motion.div>
          )}

          {/* Timeline Summary */}
          {processedEntries.length > 0 && (
            <motion.div 
              className="mt-8 pt-6 border-t border-gray-200"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>
                  Showing {Math.min(visibleCount, processedEntries.length)} of {processedEntries.length} entries
                </span>
                <div className="flex items-center gap-4">
                  {Object.entries(filterIcons).map(([type, Icon]) => {
                    if (type === 'all') return null
                    const count = getFilterCount(type as FilterType)
                    if (count === 0) return null
                    
                    return (
                      <span key={type} className="flex items-center gap-1">
                        <Icon className="h-3 w-3" />
                        {count}
                      </span>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
}