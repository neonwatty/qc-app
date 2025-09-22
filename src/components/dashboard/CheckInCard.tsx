'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MotionBox, StaggerContainer, StaggerItem } from '@/components/ui/motion'
import { useCheckInTimer } from '@/hooks/useCheckInTimer'
import { cn } from '@/lib/utils'
import {
  MessageCircle,
  Clock,
  Users,
  Play,
  ChevronRight,
  Calendar,
  Heart,
  Zap,
  Target
} from 'lucide-react'
import { Couple, CheckIn } from '@/types'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { dashboardService } from '@/services/dashboard.service'

interface CheckInCardProps {
  couple?: Couple | null
  className?: string
  onStartCheckIn?: () => void
}

const ProgressRing: React.FC<{ 
  progress: number
  size?: number
  strokeWidth?: number
  className?: string
}> = ({ progress, size = 60, strokeWidth = 6, className }) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className={cn("relative", className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-gray-200"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="text-pink-500 transition-all duration-300"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-semibold text-gray-700">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  )
}

export const CheckInCard: React.FC<CheckInCardProps> = ({
  couple,
  className,
  onStartCheckIn
}) => {
  const [upcomingCheckIn, setUpcomingCheckIn] = useState<CheckIn | null>(null)
  const [isLoadingCheckIn, setIsLoadingCheckIn] = useState(false)

  const {
    timeRemaining,
    isOverdue,
    isReady,
    progress,
    frequencyLabel,
    timeUntilText,
    suggestionText,
    nextCheckInDate
  } = useCheckInTimer({
    couple,
    onCountdownComplete: () => {
      // Could trigger notification or auto-suggestion
    }
  })

  // Fetch upcoming check-in from API
  useEffect(() => {
    const fetchUpcomingCheckIn = async () => {
      setIsLoadingCheckIn(true)
      try {
        const checkIn = await dashboardService.getUpcomingCheckIn()
        setUpcomingCheckIn(checkIn)
      } catch (error) {
        console.error('Failed to fetch upcoming check-in:', error)
      } finally {
        setIsLoadingCheckIn(false)
      }
    }

    fetchUpcomingCheckIn()
  }, [])

  const getCardGradient = () => {
    if (isReady) {
      return 'from-pink-500 via-rose-500 to-purple-600'
    } else if (isOverdue) {
      return 'from-orange-500 via-red-500 to-pink-600'
    } else {
      return 'from-blue-500 via-purple-500 to-pink-500'
    }
  }

  const getIconColor = () => {
    if (isReady) return 'text-pink-600'
    if (isOverdue) return 'text-orange-600'
    return 'text-blue-600'
  }

  const handleStartCheckIn = () => {
    onStartCheckIn?.()
  }

  return (
    <MotionBox variant="slideUp" className={className}>
      <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
        {/* Animated gradient background */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-10",
          getCardGradient()
        )}>
          <motion.div
            className={cn(
              "absolute inset-0 bg-gradient-to-br opacity-20",
              getCardGradient()
            )}
            animate={{
              scale: [1, 1.05, 1],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        <CardHeader className="relative pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-3 rounded-full bg-gradient-to-br shadow-lg",
                getCardGradient()
              )}>
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Next Check-In
                </h2>
                <p className="text-sm text-gray-600">
                  {suggestionText}
                </p>
              </div>
            </div>
            <ProgressRing 
              progress={progress} 
              className="flex-shrink-0" 
            />
          </div>
        </CardHeader>

        <CardContent className="relative space-y-4">
          {/* Countdown Display */}
          <StaggerContainer className="space-y-3">
            <StaggerItem>
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className={cn(
                    "text-3xl font-bold mb-1",
                    isReady ? "text-pink-600" : 
                    isOverdue ? "text-orange-600" : "text-blue-600"
                  )}>
                    {timeUntilText}
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {isReady ? 'Ready now' : `${frequencyLabel} check-ins`}
                    </span>
                  </div>
                </div>
              </div>
            </StaggerItem>

            {/* Stats Row */}
            <StaggerItem>
              <div className="grid grid-cols-3 gap-4 py-3 border-t border-gray-100">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Heart className="h-4 w-4 text-pink-500" />
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {couple?.stats?.currentStreak || 0}
                  </div>
                  <div className="text-xs text-gray-500">Streak</div>
                </div>
                <div className="text-center border-l border-r border-gray-100">
                  <div className="flex items-center justify-center mb-1">
                    <Target className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {couple?.stats?.totalCheckIns || 0}
                  </div>
                  <div className="text-xs text-gray-500">Total</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Users className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="text-lg font-semibold text-gray-900">
                    {couple?.partners?.length || 2}
                  </div>
                  <div className="text-xs text-gray-500">Partners</div>
                </div>
              </div>
            </StaggerItem>

            {/* Action Button */}
            <StaggerItem>
              <Link href={upcomingCheckIn ? `/checkin/${upcomingCheckIn.id}` : '/checkin'}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full"
                >
                  <Button 
                    className={cn(
                      "w-full py-4 text-lg font-semibold shadow-lg relative overflow-hidden",
                      isReady 
                        ? "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600" 
                        : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    )}
                    onClick={handleStartCheckIn}
                  >
                    {/* Pulse animation background for ready state */}
                    {isReady && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-pink-400 to-rose-400"
                        animate={{
                          opacity: [0, 0.3, 0],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                    )}
                    
                    <div className="flex items-center justify-center gap-2 relative">
                      {isReady ? (
                        <>
                          <Zap className="h-5 w-5" />
                          <span>Start Now</span>
                        </>
                      ) : (
                        <>
                          <Play className="h-5 w-5" />
                          <span>Start Early</span>
                        </>
                      )}
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </Button>
                </motion.div>
              </Link>
            </StaggerItem>
          </StaggerContainer>

          {/* Quick info */}
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500 pt-2">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>5-10 min</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>Best together</span>
            </div>
            {upcomingCheckIn && (
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                <span>Session ready</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </MotionBox>
  )
}