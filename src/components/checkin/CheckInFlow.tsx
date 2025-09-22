'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCheckInContext } from '@/contexts/CheckInContext'
import { useAuth } from '@/contexts/AuthContext'
import { SyncIndicator, SyncStatus } from './SyncIndicator'
import { PartnerPresence, PartnerStatus } from './PartnerPresence'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  MessageCircle,
  Clock,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CheckInFlowProps {
  sessionId?: string
  onComplete?: () => void
}

export function CheckInFlow({ sessionId, onComplete }: CheckInFlowProps) {
  const {
    session,
    isLoading,
    error,
    partnerConnected,
    startCheckIn,
    completeCheckIn,
    saveSession
  } = useCheckInContext()

  const { user } = useAuth()

  const [syncStatus, setSyncStatus] = useState<SyncStatus>('connected')
  const [partnerStatus, setPartnerStatus] = useState<PartnerStatus>('offline')
  const [partnerInfo, setPartnerInfo] = useState({
    id: 'partner-1',
    name: 'Partner',
    initials: 'P'
  })
  const [lastSyncTime, setLastSyncTime] = useState<Date | undefined>(undefined)

  // Monitor connection and sync status
  useEffect(() => {
    if (error) {
      setSyncStatus('error')
    } else if (isLoading) {
      setSyncStatus('syncing')
    } else if (partnerConnected) {
      setSyncStatus('connected')
    } else {
      setSyncStatus('disconnected')
    }
  }, [error, isLoading, partnerConnected])

  // Update partner status based on connection
  useEffect(() => {
    if (partnerConnected) {
      setPartnerStatus('online')
    } else {
      setPartnerStatus('offline')
    }
  }, [partnerConnected])

  // Handle reconnection
  const handleReconnect = useCallback(() => {
    setSyncStatus('syncing')
    try {
      saveSession()
      setSyncStatus('connected')
      setLastSyncTime(new Date())
    } catch (error) {
      console.error('Failed to reconnect:', error)
      setSyncStatus('error')
    }
  }, [saveSession])

  // Auto-save indicator
  useEffect(() => {
    if (session && !error) {
      const timer = setTimeout(() => {
        setSyncStatus('success')
        setLastSyncTime(new Date())
        setTimeout(() => setSyncStatus('connected'), 2000)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [session, error])

  if (!session) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">No Active Session</h2>
          <p className="text-muted-foreground mb-6">
            Start a new check-in session to connect with your partner
          </p>
          <Button
            onClick={() => startCheckIn(['communication', 'emotional'])}
            size="lg"
          >
            Start Check-In
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header with sync and presence indicators */}
      <div className="flex items-center justify-between p-4 bg-card rounded-lg border">
        <div className="flex items-center gap-4">
          <PartnerPresence
            partner={partnerInfo}
            status={partnerStatus}
            lastSeen={new Date()}
            compact={false}
            showDetails={true}
          />
        </div>

        <SyncIndicator
          status={syncStatus}
          lastSyncTime={lastSyncTime}
          partnerConnected={partnerConnected}
          onReconnect={handleReconnect}
          showLabel={true}
        />
      </div>

      {/* Session Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Session Progress</h3>
              <p className="text-sm text-muted-foreground">
                Step {session.progress.completedSteps.length + 1} of {session.progress.totalSteps}
              </p>
            </div>
            <Badge variant="secondary">
              <Clock className="h-3 w-3 mr-1" />
              {Math.round((Date.now() - new Date(session.startedAt).getTime()) / 60000)} min
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={session.progress.percentage} className="mb-4" />

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Categories: {session.categoryProgress.filter(c => c.isCompleted).length}/{session.selectedCategories.length}</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-blue-500" />
              <span>Notes: {session.draftNotes.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Activity Feed */}
      {partnerConnected && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-5 w-5" />
              Live Activity
            </h3>
          </CardHeader>
          <CardContent>
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-2"
              >
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span>Your partner is currently in the session</span>
                </div>

                {partnerStatus === 'typing' && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                    <span>Partner is typing...</span>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  Connection Issue
                </p>
                <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                  {error}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleReconnect}
                className="border-red-300 hover:bg-red-100"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Complete Session Button */}
      {session.progress.percentage === 100 && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto" />
              <h3 className="text-lg font-semibold">Session Complete!</h3>
              <p className="text-sm text-muted-foreground">
                Great job! You&apos;ve completed all categories and activities.
              </p>
              <Button
                onClick={() => {
                  completeCheckIn()
                  onComplete?.()
                }}
                size="lg"
                className="w-full sm:w-auto"
              >
                Finish Session
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}