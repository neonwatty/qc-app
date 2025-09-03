'use client'

import { useEffect, useState, useCallback } from 'react'
import { Couple } from '@/types'

interface TimeRemaining {
  days: number
  hours: number
  minutes: number
  seconds: number
  totalSeconds: number
}

interface UseCheckInTimerOptions {
  couple?: Couple | null
  onCountdownComplete?: () => void
}

export function useCheckInTimer({ couple, onCountdownComplete }: UseCheckInTimerOptions) {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalSeconds: 0
  })
  const [isOverdue, setIsOverdue] = useState(false)
  const [progress, setProgress] = useState(0)

  const calculateNextCheckIn = useCallback(() => {
    if (!couple?.stats?.lastCheckIn || !couple?.settings?.checkInFrequency) {
      // If no last check-in, suggest checking in now
      return new Date()
    }

    const lastCheckIn = new Date(couple.stats.lastCheckIn)
    const frequency = couple.settings.checkInFrequency
    
    // Calculate days to add based on frequency
    const daysToAdd = {
      'daily': 1,
      'weekly': 7,
      'biweekly': 14,
      'monthly': 30
    }[frequency]

    const nextCheckIn = new Date(lastCheckIn)
    nextCheckIn.setDate(nextCheckIn.getDate() + daysToAdd)

    // If there's a reminder time, set it to that time
    if (couple.settings.reminderTime) {
      const [hours, minutes] = couple.settings.reminderTime.split(':').map(Number)
      nextCheckIn.setHours(hours, minutes, 0, 0)
    } else {
      // Default to evening check-ins (7 PM)
      nextCheckIn.setHours(19, 0, 0, 0)
    }

    return nextCheckIn
  }, [couple])

  const calculateTimeRemaining = useCallback(() => {
    const nextCheckIn = calculateNextCheckIn()
    const now = new Date()
    const diffMs = nextCheckIn.getTime() - now.getTime()

    if (diffMs <= 0) {
      setIsOverdue(true)
      setProgress(100)
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        totalSeconds: 0
      }
    }

    setIsOverdue(false)

    const totalSeconds = Math.floor(diffMs / 1000)
    const days = Math.floor(totalSeconds / (24 * 60 * 60))
    const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60))
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60)
    const seconds = totalSeconds % 60

    // Calculate progress (how much time has passed since last check-in)
    if (couple?.stats?.lastCheckIn) {
      const lastCheckIn = new Date(couple.stats.lastCheckIn)
      const totalDuration = nextCheckIn.getTime() - lastCheckIn.getTime()
      const elapsed = now.getTime() - lastCheckIn.getTime()
      const progressPercent = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100)
      setProgress(progressPercent)
    } else {
      setProgress(100) // Show ready for first check-in
    }

    return {
      days,
      hours,
      minutes,
      seconds,
      totalSeconds
    }
  }, [calculateNextCheckIn, couple])

  useEffect(() => {
    const updateTimer = () => {
      const newTime = calculateTimeRemaining()
      setTimeRemaining(newTime)
      
      if (newTime.totalSeconds === 0 && !isOverdue) {
        onCountdownComplete?.()
      }
    }

    updateTimer() // Initial calculation
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [calculateTimeRemaining, onCountdownComplete, isOverdue])

  const getFrequencyLabel = () => {
    if (!couple?.settings?.checkInFrequency) return 'regular'
    
    const labels = {
      'daily': 'daily',
      'weekly': 'weekly', 
      'biweekly': 'bi-weekly',
      'monthly': 'monthly'
    }
    
    return labels[couple.settings.checkInFrequency]
  }

  const getTimeUntilText = () => {
    if (isOverdue) {
      return 'Check-in overdue'
    }

    if (timeRemaining.totalSeconds === 0) {
      return 'Ready for check-in!'
    }

    if (timeRemaining.days > 0) {
      return `${timeRemaining.days}d ${timeRemaining.hours}h`
    } else if (timeRemaining.hours > 0) {
      return `${timeRemaining.hours}h ${timeRemaining.minutes}m`
    } else if (timeRemaining.minutes > 0) {
      return `${timeRemaining.minutes}m ${timeRemaining.seconds}s`
    } else {
      return `${timeRemaining.seconds}s`
    }
  }

  const getSuggestionText = () => {
    if (!couple?.stats?.lastCheckIn) {
      return 'Start your first check-in together!'
    }

    if (isOverdue) {
      return 'Your next check-in was due. Time to reconnect!'
    }

    if (timeRemaining.totalSeconds === 0) {
      return 'Perfect time for your next check-in!'
    }

    if (timeRemaining.days === 0 && timeRemaining.hours <= 2) {
      return 'Your next check-in is coming up soon!'
    }

    return `Next ${getFrequencyLabel()} check-in scheduled`
  }

  const isReady = isOverdue || timeRemaining.totalSeconds === 0 || !couple?.stats?.lastCheckIn

  return {
    timeRemaining,
    isOverdue,
    isReady,
    progress: Math.round(progress),
    frequencyLabel: getFrequencyLabel(),
    timeUntilText: getTimeUntilText(),
    suggestionText: getSuggestionText(),
    nextCheckInDate: calculateNextCheckIn()
  }
}