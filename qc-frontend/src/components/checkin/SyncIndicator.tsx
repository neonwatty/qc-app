'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cloud, CloudOff, Wifi, WifiOff, RefreshCw, AlertCircle, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export type SyncStatus = 'connected' | 'syncing' | 'disconnected' | 'error' | 'success'

interface SyncIndicatorProps {
  status: SyncStatus
  lastSyncTime?: Date
  partnerConnected?: boolean
  onReconnect?: () => void
  className?: string
  showLabel?: boolean
}

export function SyncIndicator({
  status,
  lastSyncTime,
  partnerConnected = false,
  onReconnect,
  className,
  showLabel = true
}: SyncIndicatorProps) {
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    if (status === 'success') {
      setShowSuccess(true)
      const timer = setTimeout(() => setShowSuccess(false), 2000)
      return () => clearTimeout(timer)
    }
  }, [status])

  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: partnerConnected ? Wifi : Cloud,
          color: 'text-green-500',
          bgColor: 'bg-green-50 dark:bg-green-950',
          borderColor: 'border-green-200 dark:border-green-800',
          label: partnerConnected ? 'Partner Connected' : 'Connected',
          description: 'Your session is being saved in real-time'
        }
      case 'syncing':
        return {
          icon: RefreshCw,
          color: 'text-blue-500',
          bgColor: 'bg-blue-50 dark:bg-blue-950',
          borderColor: 'border-blue-200 dark:border-blue-800',
          label: 'Syncing',
          description: 'Saving your changes...',
          animate: true
        }
      case 'disconnected':
        return {
          icon: partnerConnected ? WifiOff : CloudOff,
          color: 'text-gray-400',
          bgColor: 'bg-gray-50 dark:bg-gray-950',
          borderColor: 'border-gray-200 dark:border-gray-800',
          label: 'Offline',
          description: 'Changes will sync when connection is restored'
        }
      case 'error':
        return {
          icon: AlertCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-50 dark:bg-red-950',
          borderColor: 'border-red-200 dark:border-red-800',
          label: 'Connection Error',
          description: 'Unable to sync. Click to retry.'
        }
      case 'success':
        return {
          icon: Check,
          color: 'text-green-500',
          bgColor: 'bg-green-50 dark:bg-green-950',
          borderColor: 'border-green-200 dark:border-green-800',
          label: 'Saved',
          description: 'All changes saved'
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diff < 60) return 'Just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return date.toLocaleDateString()
  }

  const content = (
    <motion.div
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors',
        config.bgColor,
        config.borderColor,
        status === 'error' && onReconnect && 'cursor-pointer hover:opacity-80',
        className
      )}
      onClick={status === 'error' && onReconnect ? onReconnect : undefined}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <AnimatePresence mode="wait">
        {showSuccess ? (
          <motion.div
            key="success"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ duration: 0.3 }}
          >
            <Check className={cn('h-4 w-4', config.color)} />
          </motion.div>
        ) : (
          <motion.div
            key="status"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Icon
              className={cn(
                'h-4 w-4',
                config.color,
                config.animate && 'animate-spin'
              )}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {showLabel && (
        <span className={cn('text-xs font-medium', config.color)}>
          {showSuccess ? 'Saved' : config.label}
        </span>
      )}

      {partnerConnected && status === 'connected' && (
        <motion.div
          className="flex items-center gap-1"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-green-600 dark:text-green-400">Live</span>
        </motion.div>
      )}
    </motion.div>
  )

  if (!showLabel) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <div className="space-y-1">
              <p className="font-medium">{config.label}</p>
              <p className="text-xs text-muted-foreground">
                {config.description}
              </p>
              {lastSyncTime && status !== 'syncing' && (
                <p className="text-xs text-muted-foreground">
                  Last synced: {formatTime(lastSyncTime)}
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <div className="space-y-1">
      {content}
      {lastSyncTime && status !== 'syncing' && showLabel && (
        <p className="text-xs text-muted-foreground ml-9">
          Last synced: {formatTime(lastSyncTime)}
        </p>
      )}
    </div>
  )
}