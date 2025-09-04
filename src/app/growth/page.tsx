'use client'

import React, { useState } from 'react'
import { TrendingUp, Award, Calendar, Star, Target, CheckCircle, BarChart3, Camera } from 'lucide-react'
import { MotionBox, StaggerContainer, StaggerItem } from '@/components/ui/motion'
import { Button } from '@/components/ui/button'
import { 
  LazyBasicChart, 
  LazyPhotoGallery, 
  ViewportLazyComponent 
} from '@/components/ui/LazyComponents'
import { generateMockChartData } from '@/lib/chart-data'

interface Milestone {
  id: string
  title: string
  description: string
  date: string
  category: string
  achieved: boolean
}

const milestones: Milestone[] = [
  {
    id: '1',
    title: 'First Month of Check-ins',
    description: 'Completed your first 4 weekly check-ins together',
    date: 'March 15, 2024',
    category: 'Consistency',
    achieved: true
  },
  {
    id: '2',
    title: 'Communication Breakthrough',
    description: 'Had your first difficult conversation using check-in techniques',
    date: 'April 2, 2024',
    category: 'Communication',
    achieved: true
  },
  {
    id: '3',
    title: '50 Shared Notes',
    description: 'Reached 50 notes shared with each other',
    date: 'May 20, 2024',
    category: 'Connection',
    achieved: true
  },
  {
    id: '4',
    title: 'Half-Year Anniversary',
    description: 'Maintained regular check-ins for 6 months',
    date: 'July 15, 2024',
    category: 'Consistency',
    achieved: true
  },
  {
    id: '5',
    title: 'Growth Goal Achieved',
    description: 'Successfully worked together on your shared relationship goal',
    date: 'August 10, 2024',
    category: 'Goals',
    achieved: true
  },
  {
    id: '6',
    title: 'Perfect Month',
    description: 'Complete all planned check-ins for one full month',
    date: 'Target: September 30, 2024',
    category: 'Consistency',
    achieved: false
  }
]

const growthAreas = [
  { name: 'Communication', progress: 85, color: 'blue' },
  { name: 'Emotional Connection', progress: 78, color: 'pink' },
  { name: 'Conflict Resolution', progress: 72, color: 'purple' },
  { name: 'Future Planning', progress: 90, color: 'green' },
  { name: 'Intimacy', progress: 83, color: 'red' },
]

export default function GrowthPage() {
  const [activeView, setActiveView] = useState<'timeline' | 'progress' | 'analytics' | 'memories'>('timeline')
  const chartData = generateMockChartData()
  
  const achievedMilestones = milestones.filter(m => m.achieved)
  const upcomingMilestones = milestones.filter(m => !m.achieved)

  return (
    <MotionBox variant="page" className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-green-100 rounded-full p-3">
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          Growth Gallery
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Track your relationship journey and celebrate your achievements together.
        </p>
      </div>

      {/* Stats Overview */}
      <StaggerContainer className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StaggerItem>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{achievedMilestones.length}</div>
            <div className="text-sm text-gray-600">Milestones Reached</div>
          </div>
        </StaggerItem>
        <StaggerItem>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">24</div>
            <div className="text-sm text-gray-600">Check-ins Completed</div>
          </div>
        </StaggerItem>
        <StaggerItem>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">6</div>
            <div className="text-sm text-gray-600">Months Active</div>
          </div>
        </StaggerItem>
        <StaggerItem>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-pink-600 mb-2">92%</div>
            <div className="text-sm text-gray-600">Consistency Rate</div>
          </div>
        </StaggerItem>
      </StaggerContainer>

      {/* View Toggle */}
      <div className="flex justify-center overflow-x-auto px-4">
        <div className="bg-gray-100 p-1 rounded-lg flex-shrink-0 min-w-max">
          <Button
            variant={activeView === 'timeline' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveView('timeline')}
            className="rounded-md text-xs sm:text-sm px-2 sm:px-3"
          >
            <Award className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            <span className="hidden xs:inline text-xs sm:text-sm">Miles</span>
            <span className="xs:hidden text-xs">M</span>
          </Button>
          <Button
            variant={activeView === 'progress' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveView('progress')}
            className="rounded-md text-xs sm:text-sm px-2 sm:px-3"
          >
            <Target className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            <span className="hidden xs:inline text-xs sm:text-sm">Prog</span>
            <span className="xs:hidden text-xs">P</span>
          </Button>
          <Button
            variant={activeView === 'analytics' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveView('analytics')}
            className="rounded-md text-xs sm:text-sm px-2 sm:px-3"
          >
            <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            <span className="hidden xs:inline text-xs sm:text-sm">Data</span>
            <span className="xs:hidden text-xs">D</span>
          </Button>
          <Button
            variant={activeView === 'memories' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveView('memories')}
            className="rounded-md text-xs sm:text-sm px-2 sm:px-3"
          >
            <Camera className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            <span className="hidden xs:inline text-xs sm:text-sm">Pics</span>
            <span className="xs:hidden text-xs">📷</span>
          </Button>
        </div>
      </div>

      {/* Timeline View */}
      {activeView === 'timeline' && (
        <div className="space-y-8">
          {/* Achieved Milestones */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              Achieved Milestones
            </h2>
            <div className="space-y-6">
              {achievedMilestones.map((milestone, index) => (
                <StaggerItem key={milestone.id}>
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                    <div className="ml-4 flex-1 min-w-0">
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 leading-tight">
                              {milestone.title}
                            </h3>
                            <p className="text-gray-600 mt-1 text-sm sm:text-base">
                              {milestone.description}
                            </p>
                            <div className="flex items-center mt-3 text-xs sm:text-sm text-gray-500">
                              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                              {milestone.date}
                            </div>
                          </div>
                          <span className="bg-green-100 text-green-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex-shrink-0 self-start">
                            {milestone.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </div>
          </div>

          {/* Upcoming Milestones */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Target className="h-5 w-5 text-blue-600 mr-2" />
              Upcoming Goals
            </h2>
            <div className="space-y-6">
              {upcomingMilestones.map((milestone, index) => (
                <StaggerItem key={milestone.id}>
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                        <Target className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="ml-4 flex-1 min-w-0">
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 leading-tight">
                              {milestone.title}
                            </h3>
                            <p className="text-gray-600 mt-1 text-sm sm:text-base">
                              {milestone.description}
                            </p>
                            <div className="flex items-center mt-3 text-xs sm:text-sm text-gray-500">
                              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
                              {milestone.date}
                            </div>
                          </div>
                          <span className="bg-blue-100 text-blue-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium flex-shrink-0 self-start">
                            {milestone.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Progress View */}
      {activeView === 'progress' && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Growth Areas Progress
          </h2>
          <div className="space-y-6">
            {growthAreas.map((area, index) => (
              <StaggerItem key={area.name}>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 leading-tight">
                      {area.name}
                    </h3>
                    <span className="text-xl sm:text-2xl font-bold text-gray-900">
                      {area.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`bg-${area.color}-600 h-3 rounded-full transition-all duration-500`}
                      style={{ width: `${area.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>Needs Work</span>
                    <span>Excellent</span>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </div>
        </div>
      )}

      {/* Analytics View */}
      {activeView === 'analytics' && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Relationship Analytics
          </h2>
          <ViewportLazyComponent threshold={0.1} rootMargin="50px">
            <LazyBasicChart data={chartData} />
          </ViewportLazyComponent>
        </div>
      )}

      {/* Memories View */}
      {activeView === 'memories' && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Camera className="h-5 w-5 mr-2" />
            Photo Memories
          </h2>
          <ViewportLazyComponent threshold={0.1} rootMargin="50px">
            <LazyPhotoGallery 
              onAddMemory={() => {
                // In a real app, this would open a modal or navigate to an upload page
                console.log('Add new memory')
              }}
            />
          </ViewportLazyComponent>
        </div>
      )}
    </MotionBox>
  )
}