'use client'

import React, { useState, useEffect } from 'react'
import { Heart, MessageCircle, StickyNote, TrendingUp, Bell, Inbox } from 'lucide-react'
import { MotionBox, StaggerContainer, StaggerItem } from '@/components/ui/motion'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { 
  LazyStatsGrid, 
  ViewportLazyComponent 
} from '@/components/ui/LazyComponents'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { PullToRefresh } from '@/components/ui/PullToRefresh'
import { MobileActionBar } from '@/components/ui/PrimaryActionFAB'
import { simplifiedMockReminders } from '@/lib/mock-reminders'
import { mockRelationshipRequests } from '@/lib/mock-requests'
import { isToday } from 'date-fns'
import { BookendsProvider } from '@/contexts/BookendsContext'
import { PrepBanner } from '@/components/bookends/PrepBanner'
import { PreparationModal } from '@/components/bookends/PreparationModal'
import { LoveLanguagesWidget } from '@/components/dashboard/LoveLanguagesWidget'

function DashboardContent() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [todayRemindersCount, setTodayRemindersCount] = useState(0)
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0)

  useEffect(() => {
    // Count today's active reminders
    const count = simplifiedMockReminders.filter(r => 
      isToday(new Date(r.scheduledFor)) && !r.completedAt
    ).length
    setTodayRemindersCount(count)

    // Count pending requests for current user (Deb)
    const currentUserId = 'user-1' // Deb's ID
    const pendingCount = mockRelationshipRequests.filter(r => 
      r.requestedFor === currentUserId && r.status === 'pending'
    ).length
    setPendingRequestsCount(pendingCount)
  }, [refreshKey])

  const handleRefresh = async () => {
    // Simulate API refresh
    await new Promise(resolve => setTimeout(resolve, 1000))
    setRefreshKey(prev => prev + 1)
  }

  return (
    <PullToRefresh onRefresh={handleRefresh} className="h-full">
      <MotionBox variant="page" className="space-y-8" key={refreshKey}>
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Welcome to Your Dashboard
          </h1>
          <p className="mt-4 text-lg text-gray-800 font-medium">
            Your relationship command center
          </p>
        </div>

      {/* Session Preparation Banner */}
      <PrepBanner />
      
      {/* Preparation Modal */}
      <PreparationModal />

      {/* Quick Actions */}
      <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StaggerItem>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <MessageCircle className="h-8 w-8 text-pink-600" />
              <h3 className="ml-3 text-lg font-semibold text-gray-900">
                Start Check-in
              </h3>
            </div>
            <p className="mt-2 text-sm text-gray-700 font-medium">
              Begin a new relationship check-in session
            </p>
            <Link href="/checkin" className="mt-4 inline-block">
              <Button className="w-full">
                Start Check-in
              </Button>
            </Link>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <StickyNote className="h-8 w-8 text-blue-600" />
              <h3 className="ml-3 text-lg font-semibold text-gray-900">
                View Notes
              </h3>
            </div>
            <p className="mt-2 text-sm text-gray-700 font-medium">
              Review your shared and private notes
            </p>
            <Link href="/notes" className="mt-4 inline-block">
              <Button variant="outline" className="w-full">
                View Notes
              </Button>
            </Link>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <h3 className="ml-3 text-lg font-semibold text-gray-900">
                Growth Gallery
              </h3>
            </div>
            <p className="mt-2 text-sm text-gray-700 font-medium">
              Track your relationship progress
            </p>
            <Link href="/growth" className="mt-4 inline-block">
              <Button variant="outline" className="w-full">
                View Growth
              </Button>
            </Link>
          </div>
        </StaggerItem>

        <StaggerItem>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <Bell className="h-8 w-8 text-indigo-600" />
              <h3 className="ml-3 text-lg font-semibold text-gray-900">
                Reminders
              </h3>
            </div>
            <p className="mt-2 text-sm text-gray-700 font-medium">
              Manage your personal reminders
            </p>
            <Link href="/reminders" className="mt-4 inline-block">
              <Button variant="outline" className="w-full">
                View Reminders
              </Button>
            </Link>
          </div>
        </StaggerItem>
        <StaggerItem>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <Inbox className="h-8 w-8 text-purple-600" />
              <h3 className="ml-3 text-lg font-semibold text-gray-900">
                Requests
                {pendingRequestsCount > 0 && (
                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {pendingRequestsCount} pending
                  </span>
                )}
              </h3>
            </div>
            <p className="mt-2 text-sm text-gray-700 font-medium">
              Partner requests and suggestions
            </p>
            <Link href="/requests" className="mt-4 inline-block">
              <Button variant="outline" className="w-full">
                View Requests
              </Button>
            </Link>
          </div>
        </StaggerItem>

      </StaggerContainer>

      {/* Love Languages Widget */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <LoveLanguagesWidget />
        </div>
        
        {/* Recent Activity */}
        <div className="sm:col-span-2">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Recent Activity
        </h2>
        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-800 font-medium">
            <Bell className="h-4 w-4 text-indigo-500 mr-2" />
            <span>{todayRemindersCount} reminders scheduled for today</span>
          </div>
          <div className="flex items-center text-sm text-gray-800 font-medium">
            <Inbox className="h-4 w-4 text-purple-500 mr-2" />
            <span>{pendingRequestsCount} pending partner requests</span>
          </div>
          <div className="flex items-center text-sm text-gray-800 font-medium">
            <Heart className="h-4 w-4 text-pink-500 mr-2" />
            <span>Last check-in completed 3 days ago</span>
          </div>
          <div className="flex items-center text-sm text-gray-800 font-medium">
            <StickyNote className="h-4 w-4 text-blue-500 mr-2" />
            <span>2 new shared notes added this week</span>
          </div>
          <div className="flex items-center text-sm text-gray-800 font-medium">
            <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
            <span>Milestone: 6 months of regular check-ins!</span>
          </div>
        </div>
      </div>
        </div>
      </div>

      {/* Stats Overview - Lazy Loaded */}
      <ViewportLazyComponent 
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
        threshold={0.2}
        rootMargin="100px"
      >
        <LazyStatsGrid />
      </ViewportLazyComponent>

        {/* Mobile Action Bar - Context-aware actions */}
        <MobileActionBar />
      </MotionBox>
    </PullToRefresh>
  )
}

export default function DashboardPage() {
  return (
    <BookendsProvider>
      <DashboardContent />
    </BookendsProvider>
  )
}