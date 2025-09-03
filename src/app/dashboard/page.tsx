'use client'

import React from 'react'
import { Heart, MessageCircle, StickyNote, TrendingUp } from 'lucide-react'
import { MotionBox, StaggerContainer, StaggerItem } from '@/components/ui/motion'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { 
  LazyStatsGrid, 
  ViewportLazyComponent 
} from '@/components/ui/LazyComponents'
import { QuickActions } from '@/components/dashboard/QuickActions'

export default function DashboardPage() {
  return (
    <MotionBox variant="page" className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          Welcome to Your Dashboard
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Your relationship wellness hub
        </p>
      </div>

      {/* Quick Actions */}
      <StaggerContainer className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StaggerItem>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <MessageCircle className="h-8 w-8 text-pink-600" />
              <h3 className="ml-3 text-lg font-semibold text-gray-900">
                Start Check-in
              </h3>
            </div>
            <p className="mt-2 text-sm text-gray-600">
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
            <p className="mt-2 text-sm text-gray-600">
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
            <p className="mt-2 text-sm text-gray-600">
              Track your relationship progress
            </p>
            <Link href="/growth" className="mt-4 inline-block">
              <Button variant="outline" className="w-full">
                View Growth
              </Button>
            </Link>
          </div>
        </StaggerItem>
      </StaggerContainer>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Recent Activity
        </h2>
        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <Heart className="h-4 w-4 text-pink-500 mr-2" />
            <span>Last check-in completed 3 days ago</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <StickyNote className="h-4 w-4 text-blue-500 mr-2" />
            <span>2 new shared notes added this week</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <TrendingUp className="h-4 w-4 text-green-500 mr-2" />
            <span>Milestone: 6 months of regular check-ins!</span>
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

      {/* Quick Actions Floating Bottom Bar - Mobile Only */}
      <QuickActions variant="floating" />
    </MotionBox>
  )
}