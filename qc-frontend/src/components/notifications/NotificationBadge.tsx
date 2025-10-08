'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, BellRing } from 'lucide-react'
import { useNotificationBadge, useNotifications } from '@/hooks/useNotifications'
import { NotificationCenter } from './NotificationCenter'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

export interface NotificationBadgeProps {
  showDropdown?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'icon' | 'floating'
  className?: string
  onSettingsClick?: () => void
}

/**
 * NotificationBadge component displays unread count and optional dropdown
 */
export function NotificationBadge({
  showDropdown = true,
  size = 'md',
  variant = 'default',
  className,
  onSettingsClick
}: NotificationBadgeProps) {
  const { unreadCount, hasUnread } = useNotificationBadge()
  const [isOpen, setIsOpen] = useState(false)

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  }

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }

  const badgeSizes = {
    sm: 'h-4 min-w-[16px] text-[10px] px-1',
    md: 'h-5 min-w-[20px] text-xs px-1',
    lg: 'h-6 min-w-[24px] text-sm px-1.5'
  }

  const bellIcon = hasUnread ? BellRing : Bell

  // Icon only button
  if (variant === 'icon') {
    const button = (
      <Button
        variant="ghost"
        size="icon"
        className={cn(sizeClasses[size], 'relative', className)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={hasUnread ? 'active' : 'inactive'}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {React.createElement(bellIcon, { className: iconSizes[size] })}
          </motion.div>
        </AnimatePresence>

        {hasUnread && (
          <AnimatePresence>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className={cn(
                'absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center',
                badgeSizes[size]
              )}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.div>
          </AnimatePresence>
        )}
      </Button>
    )

    if (!showDropdown) return button

    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>{button}</PopoverTrigger>
        <PopoverContent className="p-0 w-auto" align="end">
          <NotificationCenter onSettingsClick={onSettingsClick} />
        </PopoverContent>
      </Popover>
    )
  }

  // Floating action button
  if (variant === 'floating') {
    return (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
        className={cn(
          'fixed bottom-24 right-6 z-50',
          className
        )}
      >
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              size="lg"
              className="h-14 w-14 rounded-full shadow-lg relative"
            >
              {React.createElement(bellIcon, { className: 'h-6 w-6' })}

              {hasUnread && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 h-6 min-w-[24px] px-1.5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs font-bold"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </motion.div>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-auto mr-2" align="end" side="top">
            <NotificationCenter onSettingsClick={onSettingsClick} />
          </PopoverContent>
        </Popover>
      </motion.div>
    )
  }

  // Default badge with text
  const button = (
    <Button
      variant={hasUnread ? 'default' : 'outline'}
      size={size === 'sm' ? 'sm' : 'default'}
      className={cn('relative', className)}
    >
      {React.createElement(bellIcon, {
        className: cn(iconSizes[size], 'mr-2')
      })}
      <span>Notifications</span>
      {hasUnread && (
        <Badge
          variant="secondary"
          className={cn('ml-2', hasUnread && 'bg-background text-foreground')}
        >
          {unreadCount}
        </Badge>
      )}
    </Button>
  )

  if (!showDropdown) return button

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>{button}</PopoverTrigger>
      <PopoverContent className="p-0 w-auto" align="end">
        <NotificationCenter onSettingsClick={onSettingsClick} />
      </PopoverContent>
    </Popover>
  )
}

/**
 * Minimal badge for navigation bars
 */
export function NotificationIndicator({ className }: { className?: string }) {
  const { unreadCount, hasUnread } = useNotificationBadge()

  if (!hasUnread) return null

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      className={cn(
        'h-2 w-2 bg-destructive rounded-full',
        unreadCount > 0 && 'animate-pulse',
        className
      )}
    />
  )
}