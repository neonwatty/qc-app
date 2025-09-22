'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Heart, Plus, Calendar, Activity } from 'lucide-react'
import { MotionBox, StaggerContainer, StaggerItem } from '@/components/ui/motion'
import { TouchButton, FAB } from '@/components/ui/TouchButton'
import { cn } from '@/lib/utils'
import { dashboardService, type DashboardData } from '@/services/dashboard.service'

interface QuickActionProps {
  href: string
  icon: React.ElementType
  label: string
  description?: string
  hapticFeedback?: 'light' | 'medium' | 'heavy'
  className?: string
}

const QuickAction: React.FC<QuickActionProps> = ({
  href,
  icon: Icon,
  label,
  description,
  hapticFeedback = 'light',
  className
}) => (
  <StaggerItem>
    <Link href={href}>
      <TouchButton
        variant="floating"
        size="lg"
        hapticFeedback={hapticFeedback}
        className={cn(
          "w-full h-16 flex flex-col items-center justify-center gap-1 bg-white/90 hover:bg-white shadow-md hover:shadow-lg border border-gray-100",
          className
        )}
      >
        <Icon className="h-5 w-5 text-pink-600" />
        <span className="text-xs font-medium text-gray-900">{label}</span>
        {description && (
          <span className="text-xs text-gray-500 hidden sm:block">{description}</span>
        )}
      </TouchButton>
    </Link>
  </StaggerItem>
)

interface QuickActionsProps {
  className?: string
  variant?: 'floating' | 'embedded'
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  className,
  variant = 'floating'
}) => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true)
      try {
        const data = await dashboardService.getDashboardData()
        setDashboardData(data)
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // Dynamic quick actions based on API data
  const getQuickActions = () => {
    const actions = [
      {
        href: dashboardData?.upcomingCheckIn ? `/checkin/${dashboardData.upcomingCheckIn.id}` : '/checkin',
        icon: Heart,
        label: dashboardData?.upcomingCheckIn ? 'Continue' : 'Check-In',
        description: dashboardData?.upcomingCheckIn ? 'Resume session' : 'Start new session',
        hapticFeedback: 'medium' as const
      },
      {
        href: '/notes',
        icon: Plus,
        label: 'Add Note',
        description: 'Quick note entry',
        hapticFeedback: 'light' as const
      }
    ]

    // Add dynamic action based on dashboard state
    if (dashboardData?.upcomingReminders && dashboardData.upcomingReminders.length > 0) {
      actions.push({
        href: '/reminders',
        icon: Calendar,
        label: 'Reminders',
        description: `${dashboardData.upcomingReminders.length} pending`,
        hapticFeedback: 'light' as const
      })
    } else if (dashboardData?.activeActionItems && dashboardData.activeActionItems.length > 0) {
      actions.push({
        href: '/action-items',
        icon: Activity,
        label: 'Actions',
        description: `${dashboardData.activeActionItems.length} active`,
        hapticFeedback: 'light' as const
      })
    } else {
      actions.push({
        href: '/growth',
        icon: Calendar,
        label: 'Calendar',
        description: 'Schedule check-in',
        hapticFeedback: 'light' as const
      })
    }

    return actions
  }

  const quickActions = getQuickActions()

  if (variant === 'floating') {
    return (
      <MotionBox
        variant="slideUp"
        className={cn(
          "fixed bottom-20 left-4 right-4 lg:bottom-6 lg:right-6 lg:left-auto lg:w-auto z-40",
          "lg:hidden", // Only show on mobile
          className
        )}
      >
        <StaggerContainer className="flex gap-2 justify-center lg:flex-col lg:gap-2">
          {quickActions.map((action, index) => (
            <QuickAction
              key={action.label}
              href={action.href}
              icon={action.icon}
              label={action.label}
              description={action.description}
              hapticFeedback={action.hapticFeedback}
              className={cn(
                "flex-1 lg:w-16 h-14 rounded-xl shadow-lg hover:shadow-xl transition-shadow",
                index === 0 && "bg-gradient-to-r from-pink-500 to-rose-500 text-white border-0 hover:from-pink-600 hover:to-rose-600"
              )}
            />
          ))}
        </StaggerContainer>
      </MotionBox>
    )
  }

  return (
    <MotionBox
      variant="fade"
      className={cn("bg-white rounded-lg shadow-sm border border-gray-200 p-4", className)}
    >
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
      <StaggerContainer className="grid grid-cols-3 gap-3">
        {quickActions.map((action) => (
          <QuickAction
            key={action.label}
            href={action.href}
            icon={action.icon}
            label={action.label}
            hapticFeedback={action.hapticFeedback}
            className="aspect-square"
          />
        ))}
      </StaggerContainer>
    </MotionBox>
  )
}

export default QuickActions