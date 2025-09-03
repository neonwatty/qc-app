'use client'

import React, { useState } from 'react'
import { MessageCircle, Clock, Users, ArrowRight, Play } from 'lucide-react'
import { MotionBox, StaggerContainer, StaggerItem } from '@/components/ui/motion'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const checkInCategories = [
  {
    id: 'emotional',
    name: 'Emotional Connection',
    description: 'How connected and understood do you feel?',
    color: 'pink',
    icon: '💕'
  },
  {
    id: 'communication',
    name: 'Communication',
    description: 'How well are you communicating with each other?',
    color: 'blue',
    icon: '💬'
  },
  {
    id: 'intimacy',
    name: 'Physical & Emotional Intimacy',
    description: 'How satisfied are you with closeness and intimacy?',
    color: 'purple',
    icon: '🤗'
  },
  {
    id: 'goals',
    name: 'Shared Goals & Future',
    description: 'Are you aligned on your future together?',
    color: 'green',
    icon: '🎯'
  }
]

export default function CheckInPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  return (
    <MotionBox variant="page" className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-pink-100 rounded-full p-3">
            <MessageCircle className="h-8 w-8 text-pink-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          Relationship Check-In
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Take a few minutes to reflect on your relationship and share your thoughts together.
        </p>
      </div>

      {/* Quick Start */}
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Quick Check-In (5 minutes)
            </h2>
            <p className="text-gray-600 mt-1">
              Start with our guided quick check-in
            </p>
          </div>
          <Button className="bg-pink-600 hover:bg-pink-700">
            <Play className="h-4 w-4 mr-2" />
            Start Now
          </Button>
        </div>
        
        <div className="flex items-center mt-4 text-sm text-gray-500">
          <Clock className="h-4 w-4 mr-1" />
          <span>Typically takes 5-10 minutes</span>
          <Users className="h-4 w-4 ml-4 mr-1" />
          <span>Best done together</span>
        </div>
      </div>

      {/* Category Selection */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Or choose a specific topic to explore:
        </h2>
        
        <StaggerContainer className="grid gap-4 sm:grid-cols-2">
          {checkInCategories.map((category, index) => (
            <StaggerItem key={category.id}>
              <div 
                className={`
                  bg-white rounded-lg border-2 p-6 cursor-pointer transition-all
                  ${selectedCategory === category.id 
                    ? `border-${category.color}-500 bg-${category.color}-50` 
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  }
                `}
                onClick={() => setSelectedCategory(
                  selectedCategory === category.id ? null : category.id
                )}
              >
                <div className="flex items-start space-x-3">
                  <div className="text-2xl">{category.icon}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {category.description}
                    </p>
                  </div>
                  <ArrowRight className={`
                    h-5 w-5 transition-colors
                    ${selectedCategory === category.id 
                      ? `text-${category.color}-500` 
                      : 'text-gray-400'
                    }
                  `} />
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {selectedCategory && (
          <MotionBox variant="fade" className="mt-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Ready to explore {checkInCategories.find(c => c.id === selectedCategory)?.name}?
                  </h3>
                  <p className="text-gray-600 mt-1">
                    We&apos;ll guide you through thoughtful questions and provide space for both of you to share.
                  </p>
                </div>
                <Button>
                  Start Discussion
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </MotionBox>
        )}
      </div>

      {/* Previous Check-ins */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Recent Check-ins
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Emotional Connection</div>
              <div className="text-sm text-gray-600">3 days ago • 8 minutes</div>
            </div>
            <Button variant="ghost" size="sm">
              View Summary
            </Button>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Communication</div>
              <div className="text-sm text-gray-600">1 week ago • 12 minutes</div>
            </div>
            <Button variant="ghost" size="sm">
              View Summary
            </Button>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-900">Shared Goals & Future</div>
              <div className="text-sm text-gray-600">2 weeks ago • 15 minutes</div>
            </div>
            <Button variant="ghost" size="sm">
              View Summary
            </Button>
          </div>
        </div>
      </div>
    </MotionBox>
  )
}