'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Bell, Calendar, Users, Trophy, Heart, Info, ChevronRight } from 'lucide-react'
import { useNotifications, type Notification, type NotificationType } from '@/hooks/useNotifications'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface NotificationToastProps {
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
  maxToasts?: number
  autoHideDuration?: number
  className?: string
}

/**
 * NotificationToast component displays temporary notification popups
 */
export function NotificationToast({
  position = 'top-right',
  maxToasts = 3,
  autoHideDuration = 5000,
  className
}: NotificationToastProps) {
  const [toasts, setToasts] = useState<Notification[]>([])
  const { notifications } = useNotifications({
    onNotification: (notification) => {
      // Add new notification to toast stack
      setToasts(prev => [notification, ...prev].slice(0, maxToasts))
    }
  })

  // Remove toast
  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }

  // Position classes
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4'
  }

  const isTop = position.startsWith('top')

  return (
    <div
      className={cn(
        'fixed z-50 pointer-events-none',
        positionClasses[position],
        className
      )}
    >
      <AnimatePresence>
        {toasts.map((toast, index) => (
          <Toast
            key={toast.id}
            notification={toast}
            index={index}
            onClose={() => removeToast(toast.id)}
            autoHideDuration={autoHideDuration}
            fromTop={isTop}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

/**
 * Individual toast notification
 */
function Toast({
  notification,
  index,
  onClose,
  autoHideDuration,
  fromTop
}: {
  notification: Notification
  index: number
  onClose: () => void
  autoHideDuration: number
  fromTop: boolean
}) {
  const icon = getNotificationIcon(notification.type)
  const bgColor = getToastBgColor(notification.priority)

  // Auto-hide timer
  useEffect(() => {
    if (notification.priority !== 'high' && autoHideDuration > 0) {
      const timer = setTimeout(onClose, autoHideDuration)
      return () => clearTimeout(timer)
    }
  }, [notification.priority, autoHideDuration, onClose])

  return (
    <motion.div
      initial={{ opacity: 0, y: fromTop ? -20 : 20, scale: 0.95 }}
      animate={{
        opacity: 1,
        y: index * (fromTop ? 70 : -70),
        scale: 1
      }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 25
      }}
      className={cn(
        'pointer-events-auto min-w-[320px] max-w-md rounded-lg shadow-lg overflow-hidden mb-2',
        bgColor
      )}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="flex-shrink-0">
            {React.createElement(icon, {
              className: cn(
                'h-5 w-5',
                notification.priority === 'high' ? 'text-white' : 'text-foreground'
              )
            })}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className={cn(
              'text-sm font-semibold',
              notification.priority === 'high' ? 'text-white' : 'text-foreground'
            )}>
              {notification.title}
            </p>
            <p className={cn(
              'text-sm mt-0.5',
              notification.priority === 'high' ? 'text-white/90' : 'text-muted-foreground'
            )}>
              {notification.message}
            </p>

            {/* Action button */}
            {notification.actionUrl && (
              <Button
                variant={notification.priority === 'high' ? 'secondary' : 'link'}
                size="sm"
                className="h-auto p-0 mt-2 text-xs"
                onClick={() => window.open(notification.actionUrl, '_blank')}
              >
                {notification.actionLabel || 'View'}
                <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            )}
          </div>

          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-6 w-6 rounded-full flex-shrink-0',
              notification.priority === 'high'
                ? 'hover:bg-white/20 text-white'
                : 'hover:bg-muted'
            )}
            onClick={onClose}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Progress bar for auto-hide */}
      {notification.priority !== 'high' && autoHideDuration > 0 && (
        <motion.div
          className="h-1 bg-primary/20"
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: autoHideDuration / 1000, ease: 'linear' }}
          style={{ transformOrigin: 'left' }}
        />
      )}
    </motion.div>
  )
}

/**
 * Get icon for notification type
 */
function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case 'reminder':
      return Calendar
    case 'request':
      return Users
    case 'milestone':
      return Trophy
    case 'checkin':
      return Heart
    default:
      return Info
  }
}

/**
 * Get background color based on priority
 */
function getToastBgColor(priority: 'high' | 'medium' | 'low') {
  switch (priority) {
    case 'high':
      return 'bg-destructive text-destructive-foreground'
    case 'medium':
      return 'bg-card border'
    case 'low':
      return 'bg-muted'
  }
}