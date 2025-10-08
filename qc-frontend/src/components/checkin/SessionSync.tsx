'use client'

import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wifi, WifiOff, Users, User, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { useSessionSync, useNetworkReconnection } from '@/hooks/useSessionSync'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import { fadeIn } from '@/lib/animations'

export interface SessionSyncProps {
  sessionId: string
  userId: string
  partnerName?: string
  showStatus?: boolean
  showPresence?: boolean
  showTyping?: boolean
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  className?: string
  onSyncConflict?: (local: any, remote: any) => any
  children?: React.ReactNode
}

/**
 * SessionSync component provides real-time synchronization UI for check-in sessions
 * Shows connection status, partner presence, and typing indicators
 */
export function SessionSync({
  sessionId,
  userId,
  partnerName = 'Partner',
  showStatus = true,
  showPresence = true,
  showTyping = true,
  position = 'top-right',
  className,
  onSyncConflict,
  children
}: SessionSyncProps) {
  const {
    isConnected,
    partnerJoined,
    partnerTyping,
    syncStatus,
    lastSyncTime,
    joinSession,
    syncLocalChanges
  } = useSessionSync({
    sessionId,
    userId,
    autoJoin: true,
    conflictResolution: 'merge',
    onSyncConflict
  })

  // Handle network reconnection
  useNetworkReconnection(() => {
    joinSession()
  })

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  }

  return (
    <>
      {/* Status Indicators */}
      {(showStatus || showPresence || showTyping) && (
        <div
          className={cn(
            'fixed z-50 flex flex-col gap-2',
            positionClasses[position],
            className
          )}
        >
          {/* Connection Status */}
          {showStatus && (
            <AnimatePresence mode="wait">
              <motion.div
                key={isConnected ? 'connected' : 'disconnected'}
                {...fadeIn}
                className="flex items-center gap-2"
              >
                <Badge
                  variant={isConnected ? 'default' : 'secondary'}
                  className="flex items-center gap-1.5"
                >
                  {isConnected ? (
                    <>
                      <Wifi className="w-3 h-3" />
                      <span>Connected</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="w-3 h-3" />
                      <span>Offline</span>
                    </>
                  )}
                </Badge>

                {/* Sync Status */}
                {isConnected && syncStatus !== 'idle' && (
                  <Badge
                    variant={syncStatus === 'synced' ? 'outline' : 'secondary'}
                    className="flex items-center gap-1"
                  >
                    {syncStatus === 'syncing' && (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    )}
                    {syncStatus === 'synced' && (
                      <CheckCircle2 className="w-3 h-3 text-green-500" />
                    )}
                    {syncStatus === 'error' && (
                      <AlertCircle className="w-3 h-3 text-red-500" />
                    )}
                  </Badge>
                )}
              </motion.div>
            </AnimatePresence>
          )}

          {/* Partner Presence */}
          {showPresence && isConnected && (
            <AnimatePresence mode="wait">
              <motion.div
                key={partnerJoined ? 'joined' : 'waiting'}
                {...fadeIn}
              >
                <Badge
                  variant={partnerJoined ? 'default' : 'outline'}
                  className="flex items-center gap-1.5"
                >
                  {partnerJoined ? (
                    <>
                      <Users className="w-3 h-3" />
                      <span>{partnerName} is here</span>
                    </>
                  ) : (
                    <>
                      <User className="w-3 h-3" />
                      <span>Waiting for {partnerName}</span>
                    </>
                  )}
                </Badge>
              </motion.div>
            </AnimatePresence>
          )}

          {/* Typing Indicator */}
          {showTyping && partnerTyping && (
            <AnimatePresence>
              <motion.div
                key="typing"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Badge variant="secondary" className="flex items-center gap-1.5">
                  <TypingDots />
                  <span>{partnerName} is typing</span>
                </Badge>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      )}

      {/* Connection Alert */}
      {!isConnected && showStatus && (
        <Alert className="mb-4 border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            You&apos;re currently offline. Your changes will sync when you reconnect.
          </AlertDescription>
        </Alert>
      )}

      {/* Render children */}
      {children}
    </>
  )
}

/**
 * Animated typing dots indicator
 */
function TypingDots() {
  return (
    <div className="flex gap-0.5">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 bg-current rounded-full"
          animate={{
            opacity: [0.3, 1, 0.3],
          }}
          transition={{
            duration: 1.4,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  )
}

/**
 * Partner presence avatar component
 */
export function PartnerPresence({
  isOnline,
  partnerName,
  avatarUrl,
  size = 'md',
  showStatus = true,
  className
}: {
  isOnline: boolean
  partnerName: string
  avatarUrl?: string
  size?: 'sm' | 'md' | 'lg'
  showStatus?: boolean
  className?: string
}) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  }

  const statusSizeClasses = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-3.5 h-3.5'
  }

  return (
    <div className={cn('relative inline-block', className)}>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={partnerName}
          className={cn(
            'rounded-full object-cover',
            sizeClasses[size],
            !isOnline && 'opacity-50'
          )}
        />
      ) : (
        <div
          className={cn(
            'rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-semibold',
            sizeClasses[size],
            !isOnline && 'opacity-50'
          )}
        >
          {partnerName.charAt(0).toUpperCase()}
        </div>
      )}

      {/* Online status indicator */}
      {showStatus && (
        <div
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-2 border-white',
            statusSizeClasses[size],
            isOnline ? 'bg-green-500' : 'bg-gray-300'
          )}
        />
      )}
    </div>
  )
}

/**
 * Sync conflict resolution dialog
 */
export function SyncConflictDialog({
  isOpen,
  onResolve,
  localData,
  remoteData
}: {
  isOpen: boolean
  onResolve: (resolution: 'local' | 'remote' | 'merge') => void
  localData: any
  remoteData: any
}) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-lg p-6 max-w-md w-full"
        >
          <h3 className="text-lg font-semibold mb-2">Sync Conflict Detected</h3>
          <p className="text-gray-600 mb-4">
            Your partner made changes at the same time. How would you like to resolve this?
          </p>

          <div className="space-y-2">
            <button
              onClick={() => onResolve('local')}
              className="w-full p-3 text-left rounded-lg border hover:bg-gray-50 transition-colors"
            >
              <div className="font-medium">Keep My Changes</div>
              <div className="text-sm text-gray-600">Discard partner&apos;s changes</div>
            </button>

            <button
              onClick={() => onResolve('remote')}
              className="w-full p-3 text-left rounded-lg border hover:bg-gray-50 transition-colors"
            >
              <div className="font-medium">Keep Partner&apos;s Changes</div>
              <div className="text-sm text-gray-600">Discard my changes</div>
            </button>

            <button
              onClick={() => onResolve('merge')}
              className="w-full p-3 text-left rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 transition-colors"
            >
              <div className="font-medium text-purple-700">Merge Both</div>
              <div className="text-sm text-purple-600">Combine changes from both</div>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}