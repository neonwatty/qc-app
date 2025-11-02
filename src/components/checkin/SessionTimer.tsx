'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, Pause, Play, Plus, AlertTriangle, Volume2, VolumeX } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { SessionSettings } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

interface SessionTimerProps {
  settings: SessionSettings
  onTimeUp?: () => void
  onExtension?: () => void
  onTimeout?: () => void
  className?: string
}

export function SessionTimer({ 
  settings, 
  onTimeUp, 
  onExtension, 
  onTimeout,
  className 
}: SessionTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(settings.sessionDuration * 60)
  const [isRunning, setIsRunning] = useState(true)
  const [isPaused, setIsPaused] = useState(false)
  const [timeoutsUsed, setTimeoutsUsed] = useState({ partner1: 0, partner2: 0 })
  const [showExtensionDialog, setShowExtensionDialog] = useState(false)
  const [extensionsUsed, setExtensionsUsed] = useState(0)
  const [isTimeoutActive, setIsTimeoutActive] = useState(false)
  const [timeoutTimeRemaining, setTimeoutTimeRemaining] = useState(0)
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const timeoutIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Main timer
  useEffect(() => {
    if (isRunning && !isPaused && !isTimeoutActive) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false)
            if (settings.allowExtensions) {
              setShowExtensionDialog(true)
            }
            onTimeUp?.()
            if (!isMuted) {
              playSound('timeUp')
            }
            return 0
          }
          
          // Warning at 80% time
          if (prev === Math.floor(settings.sessionDuration * 60 * 0.2)) {
            if (!isMuted) {
              playSound('warning')
            }
          }
          
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, isPaused, isTimeoutActive, settings, onTimeUp, isMuted])

  // Timeout timer
  useEffect(() => {
    if (isTimeoutActive && timeoutTimeRemaining > 0) {
      timeoutIntervalRef.current = setInterval(() => {
        setTimeoutTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsTimeoutActive(false)
            setIsPaused(false)
            if (!isMuted) {
              playSound('resume')
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (timeoutIntervalRef.current) {
        clearInterval(timeoutIntervalRef.current)
      }
    }

    return () => {
      if (timeoutIntervalRef.current) {
        clearInterval(timeoutIntervalRef.current)
      }
    }
  }, [isTimeoutActive, timeoutTimeRemaining, isMuted])

  const playSound = (type: 'warning' | 'timeUp' | 'timeout' | 'resume') => {
    // In a real app, implement audio playback
    console.log(`Playing ${type} sound`)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleTimeout = (partner: 'partner1' | 'partner2') => {
    const used = timeoutsUsed[partner]
    if (used >= settings.timeoutsPerPartner) return

    setTimeoutsUsed(prev => ({ ...prev, [partner]: used + 1 }))
    setIsTimeoutActive(true)
    setIsPaused(true)
    setTimeoutTimeRemaining(settings.timeoutDuration * 60)
    onTimeout?.()
    
    if (!isMuted) {
      playSound('timeout')
    }
  }

  const handleExtension = () => {
    setTimeRemaining(prev => prev + 300) // Add 5 minutes
    setExtensionsUsed(prev => prev + 1)
    setIsRunning(true)
    setShowExtensionDialog(false)
    onExtension?.()
  }

  const togglePause = () => {
    if (!isTimeoutActive) {
      setIsPaused(!isPaused)
    }
  }

  const progress = ((settings.sessionDuration * 60 - timeRemaining) / (settings.sessionDuration * 60)) * 100
  const isWarning = timeRemaining < settings.sessionDuration * 60 * 0.2
  const isCritical = timeRemaining < 60

  return (
    <>
      <Card className={cn("relative overflow-hidden", className)}>
        <CardContent className="p-3 sm:p-4">
          <div className="space-y-3">
            {/* Timer Display */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Clock className={cn(
                    "w-5 h-5",
                    isCritical ? "text-red-500" : isWarning ? "text-yellow-500" : "text-muted-foreground"
                  )} />
                  {isTimeoutActive && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                  )}
                </div>
                <div>
                  <div className="text-2xl font-mono font-bold">
                    {isTimeoutActive ? (
                      <span className="text-orange-500">
                        {formatTime(timeoutTimeRemaining)}
                      </span>
                    ) : (
                      <span className={cn(
                        isCritical ? "text-red-500" : isWarning ? "text-yellow-500" : ""
                      )}>
                        {formatTime(timeRemaining)}
                      </span>
                    )}
                  </div>
                  {isTimeoutActive && (
                    <p className="text-xs text-orange-500">Timeout Active</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setIsMuted(!isMuted)}
                  className="h-8 w-8"
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </Button>

                {!isTimeoutActive && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={togglePause}
                    className="h-8 w-8"
                    disabled={timeRemaining === 0}
                  >
                    {isPaused ? (
                      <Play className="w-4 h-4" />
                    ) : (
                      <Pause className="w-4 h-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <Progress 
              value={isTimeoutActive ? 
                ((settings.timeoutDuration * 60 - timeoutTimeRemaining) / (settings.timeoutDuration * 60)) * 100 :
                progress
              } 
              className={cn(
                "h-1.5",
                isTimeoutActive ? "bg-orange-100" : isCritical ? "bg-red-100" : isWarning ? "bg-yellow-100" : ""
              )}
            />

            {/* Timeouts */}
            {settings.timeoutsPerPartner > 0 && (
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={timeoutsUsed.partner1 >= settings.timeoutsPerPartner ? "ghost" : "outline"}
                    onClick={() => handleTimeout('partner1')}
                    disabled={
                      isTimeoutActive || 
                      timeoutsUsed.partner1 >= settings.timeoutsPerPartner ||
                      timeRemaining === 0
                    }
                    className="h-7 text-xs"
                  >
                    <Pause className="w-3 h-3 mr-1" />
                    You ({settings.timeoutsPerPartner - timeoutsUsed.partner1})
                  </Button>
                  <Button
                    size="sm"
                    variant={timeoutsUsed.partner2 >= settings.timeoutsPerPartner ? "ghost" : "outline"}
                    onClick={() => handleTimeout('partner2')}
                    disabled={
                      isTimeoutActive || 
                      timeoutsUsed.partner2 >= settings.timeoutsPerPartner ||
                      timeRemaining === 0
                    }
                    className="h-7 text-xs"
                  >
                    <Pause className="w-3 h-3 mr-1" />
                    Partner ({settings.timeoutsPerPartner - timeoutsUsed.partner2})
                  </Button>
                </div>

                {extensionsUsed > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    +{extensionsUsed * 5} min
                  </Badge>
                )}
              </div>
            )}

            {/* Status Messages */}
            <AnimatePresence mode="wait">
              {isPaused && !isTimeoutActive && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2 text-xs text-muted-foreground"
                >
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                  Session paused
                </motion.div>
              )}

              {isWarning && !isCritical && !isPaused && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2 text-xs text-yellow-600"
                >
                  <AlertTriangle className="w-3 h-3" />
                  Less than 20% time remaining
                </motion.div>
              )}

              {isCritical && !isPaused && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2 text-xs text-red-600"
                >
                  <AlertTriangle className="w-3 h-3" />
                  Less than 1 minute remaining!
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Extension Dialog */}
      <Dialog open={showExtensionDialog} onOpenChange={setShowExtensionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Time&apos;s Up!</DialogTitle>
            <DialogDescription>
              Your session time has ended. Would you like to extend for another 5 minutes?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowExtensionDialog(false)}
            >
              End Session
            </Button>
            {settings.allowExtensions && (
              <Button onClick={handleExtension}>
                <Plus className="w-4 h-4 mr-2" />
                Add 5 Minutes
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}