'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Mic, MicOff, SkipForward, AlertTriangle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { SessionSettings, User } from '@/types'
import { cn } from '@/lib/utils'

interface TurnIndicatorProps {
  settings: SessionSettings
  currentUser: User
  partner: User
  onTurnEnd?: () => void
  className?: string
}

export function TurnIndicator({
  settings,
  currentUser,
  partner,
  onTurnEnd,
  className
}: TurnIndicatorProps) {
  const [currentSpeaker, setCurrentSpeaker] = useState<'user' | 'partner'>('user')
  const [turnTimeRemaining, setTurnTimeRemaining] = useState(settings.turnDuration || 90)
  const [isActive, setIsActive] = useState(true)
  const [turnsCompleted, setTurnsCompleted] = useState({ user: 0, partner: 0 })
  const [showWarning, setShowWarning] = useState(false)

  useEffect(() => {
    if (!settings.turnBasedMode || !isActive) return

    const interval = setInterval(() => {
      setTurnTimeRemaining((prev) => {
        if (prev <= 1) {
          handleTurnSwitch()
          return settings.turnDuration || 90
        }
        
        // Show warning at 10 seconds
        if (prev === 10) {
          setShowWarning(true)
          setTimeout(() => setShowWarning(false), 3000)
        }
        
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [currentSpeaker, isActive, settings])

  const handleTurnSwitch = useCallback(() => {
    const nextSpeaker = currentSpeaker === 'user' ? 'partner' : 'user'
    setCurrentSpeaker(nextSpeaker)
    setTurnsCompleted(prev => ({
      ...prev,
      [currentSpeaker]: prev[currentSpeaker === 'user' ? 'user' : 'partner'] + 1
    }))
    onTurnEnd?.()
  }, [currentSpeaker, onTurnEnd])

  const handleSkipTurn = () => {
    setTurnTimeRemaining(settings.turnDuration || 90)
    handleTurnSwitch()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`
  }

  const progress = ((settings.turnDuration || 90) - turnTimeRemaining) / (settings.turnDuration || 90) * 100
  const isWarningTime = turnTimeRemaining <= 10
  const isCriticalTime = turnTimeRemaining <= 5

  const activeSpeaker = currentSpeaker === 'user' ? currentUser : partner
  const waitingSpeaker = currentSpeaker === 'user' ? partner : currentUser

  if (!settings.turnBasedMode) return null

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Turn-based Discussion</span>
            </div>
            <Badge variant="outline" className="text-xs">
              Round {Math.max(turnsCompleted.user, turnsCompleted.partner) + 1}
            </Badge>
          </div>

          {/* Current Speaker */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={activeSpeaker.avatar} />
                  <AvatarFallback>
                    {activeSpeaker.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute -bottom-1 -right-1"
                >
                  <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <Mic className="w-2.5 h-2.5 text-white" />
                  </div>
                </motion.div>
              </div>
              
              <div>
                <p className="text-sm font-medium">
                  {currentSpeaker === 'user' ? 'Your Turn' : `${activeSpeaker.name}'s Turn`}
                </p>
                <p className={cn(
                  "text-xl font-mono font-bold",
                  isCriticalTime ? "text-red-500" : isWarningTime ? "text-yellow-500" : ""
                )}>
                  {formatTime(turnTimeRemaining)}
                </p>
              </div>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={handleSkipTurn}
              className="h-8"
            >
              <SkipForward className="w-3 h-3 mr-1" />
              Pass
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <Progress 
              value={progress} 
              className={cn(
                "h-2",
                isCriticalTime ? "bg-red-100" : isWarningTime ? "bg-yellow-100" : ""
              )}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Speaking time</span>
              <span>{formatTime(settings.turnDuration || 90)} total</span>
            </div>
          </div>

          {/* Next Speaker */}
          <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={waitingSpeaker.avatar} />
                <AvatarFallback className="text-xs">
                  {waitingSpeaker.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">
                {currentSpeaker === 'user' ? partner.name : 'You'} (next)
              </span>
            </div>
            <MicOff className="w-3 h-3 text-muted-foreground" />
          </div>

          {/* Warnings */}
          <AnimatePresence>
            {showWarning && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 p-2 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg"
              >
                <AlertTriangle className="w-3 h-3 text-yellow-600" />
                <span className="text-xs text-yellow-600">
                  10 seconds remaining in turn
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Turn Stats */}
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Your turns: {turnsCompleted.user}</span>
            <span>Partner turns: {turnsCompleted.partner}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}