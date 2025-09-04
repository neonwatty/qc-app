'use client'

import React, { useState } from 'react'
import { MotionBox } from '@/components/ui/motion'
import { TouchButton } from '@/components/ui/TouchButton'
import {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonList,
  SkeletonGrid,
  DashboardSkeleton,
  NotesSkeleton,
  CheckInSkeleton,
  PageSkeleton
} from '@/components/ui/Skeleton'

export default function SkeletonTestPage() {
  const [currentView, setCurrentView] = useState<'basic' | 'dashboard' | 'notes' | 'checkin'>('basic')
  const [animated, setAnimated] = useState(true)

  const renderSkeletonContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardSkeleton animated={animated} />
      case 'notes':
        return <NotesSkeleton animated={animated} />
      case 'checkin':
        return <CheckInSkeleton animated={animated} />
      default:
        return (
          <div className="space-y-8">
            {/* Basic Skeletons */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Basic Skeleton Elements</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Skeleton className="w-12 h-12 rounded-full" animated={animated} />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-3/4 mb-2" animated={animated} />
                    <Skeleton className="h-3 w-1/2" animated={animated} />
                  </div>
                </div>
                
                <Skeleton className="h-32 w-full rounded-lg" animated={animated} />
                
                <SkeletonText lines={4} animated={animated} />
              </div>
            </div>

            {/* Skeleton Cards */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Skeleton Cards</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <SkeletonCard showAvatar animated={animated} />
                <SkeletonCard showImage animated={animated} />
              </div>
            </div>

            {/* Skeleton List */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Skeleton List</h3>
              <SkeletonList items={3} animated={animated} />
            </div>

            {/* Skeleton Grid */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Skeleton Grid</h3>
              <SkeletonGrid columns={3} items={6} animated={animated} />
            </div>
          </div>
        )
    }
  }

  return (
    <MotionBox variant="page" className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Skeleton Loading States</h1>
        <p className="text-gray-600">Mobile-optimized loading indicators</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2 justify-center">
        <TouchButton
          size="sm"
          variant={currentView === 'basic' ? 'default' : 'outline'}
          onClick={() => setCurrentView('basic')}
        >
          Basic
        </TouchButton>
        <TouchButton
          size="sm"
          variant={currentView === 'dashboard' ? 'default' : 'outline'}
          onClick={() => setCurrentView('dashboard')}
        >
          Dashboard
        </TouchButton>
        <TouchButton
          size="sm"
          variant={currentView === 'notes' ? 'default' : 'outline'}
          onClick={() => setCurrentView('notes')}
        >
          Notes
        </TouchButton>
        <TouchButton
          size="sm"
          variant={currentView === 'checkin' ? 'default' : 'outline'}
          onClick={() => setCurrentView('checkin')}
        >
          Check-in
        </TouchButton>
      </div>

      {/* Animation Toggle */}
      <div className="flex justify-center">
        <TouchButton
          size="sm"
          variant={animated ? 'default' : 'outline'}
          onClick={() => setAnimated(!animated)}
        >
          Animation: {animated ? 'On' : 'Off'}
        </TouchButton>
      </div>

      {/* Skeleton Content */}
      <div className="mt-8">
        {renderSkeletonContent()}
      </div>

      {/* Usage Notes */}
      <div className="mt-12 p-6 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-3">Usage Guide</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>• <strong>Basic Skeleton:</strong> Use for simple rectangles and shapes</p>
          <p>• <strong>SkeletonText:</strong> Use for text content with multiple lines</p>
          <p>• <strong>SkeletonCard:</strong> Use for card-based layouts with optional avatars/images</p>
          <p>• <strong>SkeletonList:</strong> Use for list items with avatar, title, and subtitle</p>
          <p>• <strong>SkeletonGrid:</strong> Use for grid layouts with multiple cards</p>
          <p>• <strong>Page Skeletons:</strong> Use for complete page loading states</p>
        </div>
      </div>

      {/* Performance Notes */}
      <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-3">Mobile Performance</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>• Skeleton screens improve perceived performance</p>
          <p>• Shimmer animations use CSS transforms for smooth rendering</p>
          <p>• Reduced layout shift during content loading</p>
          <p>• Touch-optimized sizing matches actual content</p>
        </div>
      </div>
    </MotionBox>
  )
}