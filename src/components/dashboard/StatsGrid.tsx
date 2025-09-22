'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StaggerContainer, StaggerItem } from '@/components/ui/motion'
import { useCountUp } from '@/hooks/useCountUp'
import { cn } from '@/lib/utils'
import {
  Calendar,
  TrendingUp,
  Trophy,
  Target,
  Flame,
  BarChart3,
  Gift,
  ArrowUp
} from 'lucide-react'
import { Milestone, Couple } from '@/types'
import { dashboardService, type DashboardStats } from '@/services/dashboard.service'

interface StatsGridProps {
  couple?: Couple | null
  milestones?: Milestone[]
  className?: string
}

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: number
  suffix?: string
  delay?: number
  gradient?: string
  change?: number
  changeLabel?: string
}

const StatCard: React.FC<StatCardProps> = ({ 
  icon, 
  label, 
  value, 
  suffix = '', 
  delay = 0,
  gradient = 'from-blue-500 to-purple-600',
  change,
  changeLabel
}) => {
  const { count } = useCountUp({
    end: value,
    duration: 1500,
    delay: delay * 100
  })

  return (
    <StaggerItem>
      <Card className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-5",
          gradient
        )} />
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className={cn(
              "p-2 rounded-lg bg-gradient-to-br text-white shadow-sm",
              gradient
            )}>
              {icon}
            </div>
            {change !== undefined && (
              <div className="flex items-center gap-1 text-xs text-emerald-600">
                <ArrowUp className="h-3 w-3" />
                +{change}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-1">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-gray-900">
                {Math.round(count)}
              </span>
              {suffix && (
                <span className="text-sm text-gray-700 font-medium">
                  {suffix}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-800 font-semibold">
              {label}
            </p>
            {changeLabel && (
              <p className="text-xs text-gray-700 font-medium">
                {changeLabel}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </StaggerItem>
  )
}

export const StatsGrid: React.FC<StatsGridProps> = ({
  couple,
  milestones = [],
  className
}) => {
  const [mounted, setMounted] = useState(false)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true)
      try {
        const data = await dashboardService.getStats()
        setStats(data)
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error)
        // Fall back to couple stats if API fails
      } finally {
        setIsLoading(false)
      }
    }

    if (mounted) {
      fetchStats()
    }
  }, [mounted])

  if (!mounted || isLoading) {
    return (
      <div className={cn("grid grid-cols-2 gap-3 sm:gap-4", className)}>
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="h-8 w-8 bg-muted rounded-lg" />
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="h-6 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Use API stats if available, otherwise fall back to couple stats
  const currentStreak = stats?.currentStreak ?? couple?.stats?.currentStreak ?? 0
  const totalCheckIns = stats?.totalCheckIns ?? couple?.stats?.totalCheckIns ?? 0
  const completedActionItems = stats?.completedActionItems ?? 0
  const totalActionItems = stats?.totalActionItems ?? 0
  const growthPoints = milestones.length
  const completionRate = totalActionItems > 0
    ? Math.round((completedActionItems / totalActionItems) * 100)
    : 0

  const upcomingMilestones = milestones
    .filter(m => new Date(m.achievedAt) > new Date())
    .length

  const nextMilestoneCount = Math.max(upcomingMilestones, 1)

  return (
    <StaggerContainer 
      staggerDelay={0.1} 
      className={cn("grid grid-cols-2 gap-3 sm:gap-4", className)}
    >
      <StatCard
        icon={<Flame className="h-4 w-4" />}
        label="Current Streak"
        value={currentStreak}
        suffix="days"
        delay={0}
        gradient="from-orange-500 to-red-500"
        change={currentStreak > 0 ? 1 : 0}
        changeLabel="this week"
      />

      <StatCard
        icon={<BarChart3 className="h-4 w-4" />}
        label="Completion Rate"
        value={completionRate}
        suffix="%"
        delay={1}
        gradient="from-green-500 to-emerald-600"
        change={completionRate > 80 ? 5 : 0}
        changeLabel="vs last month"
      />

      <StatCard
        icon={<Trophy className="h-4 w-4" />}
        label="Growth Points"
        value={growthPoints}
        delay={2}
        gradient="from-purple-500 to-pink-600"
        change={growthPoints > 0 ? 2 : 0}
        changeLabel="new milestones"
      />

      <StatCard
        icon={<Target className="h-4 w-4" />}
        label="Next Milestone"
        value={nextMilestoneCount}
        suffix={nextMilestoneCount === 1 ? "goal" : "goals"}
        delay={3}
        gradient="from-blue-500 to-cyan-600"
        changeLabel="coming up"
      />
    </StaggerContainer>
  )
}