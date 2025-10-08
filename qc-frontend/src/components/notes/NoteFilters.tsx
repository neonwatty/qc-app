'use client'

import React from 'react'
import { Eye, EyeOff, StickyNote, Calendar, Folder, SortAsc, SortDesc, Filter, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { NoteType, SortOption, FiltersState } from './NotesDashboard'

interface NoteFiltersProps {
  filters: FiltersState
  categories: string[]
  onChange: (filters: Partial<FiltersState>) => void
  noteCount?: number
  className?: string
}

export function NoteFilters({
  filters,
  categories,
  onChange,
  noteCount = 0,
  className
}: NoteFiltersProps) {
  const handlePrivacyChange = (privacyLevel: NoteType | 'all') => {
    onChange({ privacyLevel })
  }

  const handleCategoryChange = (category: string) => {
    onChange({ category })
  }

  const handleSortChange = (sortBy: SortOption) => {
    onChange({ sortBy })
  }

  const handleDateRangeChange = (type: 'from' | 'to', value: string) => {
    const date = value ? new Date(value) : null
    onChange({
      dateRange: {
        ...filters.dateRange,
        [type]: date
      }
    })
  }

  const clearFilters = () => {
    onChange({
      privacyLevel: 'all',
      category: 'all',
      dateRange: { from: null, to: null },
      sortBy: 'date-desc'
    })
  }

  const hasActiveFilters = filters.privacyLevel !== 'all' || 
                          filters.category !== 'all' || 
                          filters.dateRange.from !== null || 
                          filters.dateRange.to !== null

  const formatDateForInput = (date: Date | null) => {
    if (!date) return ''
    return date.toISOString().split('T')[0]
  }

  return (
    <Card className={cn("p-4 space-y-4", className)}>
      {/* Filter Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-600" />
          <span className="font-medium text-gray-900">Filters</span>
          {hasActiveFilters && (
            <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
              Active
            </span>
          )}
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Privacy Level Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Privacy Level</label>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filters.privacyLevel === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handlePrivacyChange('all')}
            className="flex-1 sm:flex-initial"
          >
            All Types
            {filters.privacyLevel === 'all' && noteCount > 0 && (
              <span className="ml-1 text-xs opacity-70">({noteCount})</span>
            )}
          </Button>
          <Button
            variant={filters.privacyLevel === 'shared' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handlePrivacyChange('shared')}
            className="flex items-center gap-1"
          >
            <Eye className="h-3 w-3" />
            Shared
          </Button>
          <Button
            variant={filters.privacyLevel === 'private' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handlePrivacyChange('private')}
            className="flex items-center gap-1"
          >
            <EyeOff className="h-3 w-3" />
            Private
          </Button>
          <Button
            variant={filters.privacyLevel === 'draft' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handlePrivacyChange('draft')}
            className="flex items-center gap-1"
          >
            <StickyNote className="h-3 w-3" />
            Drafts
          </Button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
          <Folder className="h-3 w-3" />
          Category
        </label>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filters.category === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleCategoryChange('all')}
            className="flex-1 sm:flex-initial"
          >
            All Categories
          </Button>
          {categories.map(category => (
            <Button
              key={category}
              variant={filters.category === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCategoryChange(category)}
              className="text-xs"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          Date Range
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-500 block mb-1">From</label>
            <input
              type="date"
              value={formatDateForInput(filters.dateRange.from)}
              onChange={(e) => handleDateRangeChange('from', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">To</label>
            <input
              type="date"
              value={formatDateForInput(filters.dateRange.to)}
              onChange={(e) => handleDateRangeChange('to', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
          </div>
        </div>
        {(filters.dateRange.from || filters.dateRange.to) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange({ dateRange: { from: null, to: null } })}
            className="text-xs w-full"
          >
            Clear Date Range
          </Button>
        )}
      </div>

      {/* Sort Options */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
          <SortDesc className="h-3 w-3" />
          Sort By
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <Button
            variant={filters.sortBy === 'date-desc' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleSortChange('date-desc')}
            className="text-xs"
          >
            <SortDesc className="h-3 w-3 mr-1" />
            Newest
          </Button>
          <Button
            variant={filters.sortBy === 'date-asc' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleSortChange('date-asc')}
            className="text-xs"
          >
            <SortAsc className="h-3 w-3 mr-1" />
            Oldest
          </Button>
          <Button
            variant={filters.sortBy === 'title' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleSortChange('title')}
            className="text-xs"
          >
            A-Z Title
          </Button>
          <Button
            variant={filters.sortBy === 'category' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleSortChange('category')}
            className="text-xs"
          >
            Category
          </Button>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="border-t pt-4">
        <div className="text-xs font-medium text-gray-700 mb-2">Quick Filters</div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const today = new Date()
              today.setHours(0, 0, 0, 0)
              onChange({ dateRange: { from: today, to: new Date() } })
            }}
            className="text-xs"
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const weekAgo = new Date()
              weekAgo.setDate(weekAgo.getDate() - 7)
              onChange({ dateRange: { from: weekAgo, to: new Date() } })
            }}
            className="text-xs"
          >
            Last 7 Days
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const monthAgo = new Date()
              monthAgo.setMonth(monthAgo.getMonth() - 1)
              onChange({ dateRange: { from: monthAgo, to: new Date() } })
            }}
            className="text-xs"
          >
            Last Month
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onChange({ privacyLevel: 'shared', sortBy: 'date-desc' })
            }}
            className="text-xs"
          >
            Recent Shared
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onChange({ privacyLevel: 'draft', sortBy: 'date-asc' })
            }}
            className="text-xs"
          >
            Old Drafts
          </Button>
        </div>
      </div>
    </Card>
  )
}