'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  BellRing,
  Check,
  CheckCheck,
  X,
  Trash2,
  Settings,
  Calendar,
  Heart,
  Users,
  Trophy,
  Info,
  ChevronRight,
  Filter
} from 'lucide-react'
import { useNotifications, type Notification, type NotificationType } from '@/hooks/useNotifications'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'

export interface NotificationCenterProps {
  className?: string
  onSettingsClick?: () => void
}

/**
 * NotificationCenter component displays all notifications with filtering and actions
 */
export function NotificationCenter({ className, onSettingsClick }: NotificationCenterProps) {
  const {
    notifications,
    unreadCount,
    hasUnread,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll
  } = useNotifications()

  const [selectedType, setSelectedType] = useState<NotificationType | 'all'>('all')
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)

  // Filter notifications
  const filteredNotifications = notifications.filter(n => {
    if (selectedType !== 'all' && n.type !== selectedType) return false
    if (showUnreadOnly && n.read) return false
    return true
  })

  // Group notifications by date
  const groupedNotifications = groupNotificationsByDate(filteredNotifications)

  return (
    <div className={cn('w-full max-w-md', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <BellRing className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Notifications</h2>
          {hasUnread && (
            <Badge variant="destructive" className="ml-1">
              {unreadCount}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-1">
          {hasUnread && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              title="Mark all as read"
            >
              <CheckCheck className="h-4 w-4" />
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" aria-label="Filter notifications">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setShowUnreadOnly(!showUnreadOnly)}>
                {showUnreadOnly ? 'Show All' : 'Show Unread Only'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={clearAll} className="text-destructive">
                Clear All
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {onSettingsClick && (
            <Button variant="ghost" size="sm" onClick={onSettingsClick} aria-label="Settings">
              <Settings className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Type Filter Tabs */}
      <Tabs value={selectedType} onValueChange={(v) => setSelectedType(v as NotificationType | 'all')}>
        <TabsList className="w-full justify-start px-4 h-auto flex-wrap">
          <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
          <TabsTrigger value="reminder" className="text-xs">Reminders</TabsTrigger>
          <TabsTrigger value="request" className="text-xs">Requests</TabsTrigger>
          <TabsTrigger value="milestone" className="text-xs">Milestones</TabsTrigger>
          <TabsTrigger value="checkin" className="text-xs">Check-ins</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          <NotificationList
            notifications={filteredNotifications}
            groupedNotifications={groupedNotifications}
            selectedType={selectedType}
            showUnreadOnly={showUnreadOnly}
            markAsRead={markAsRead}
            deleteNotification={deleteNotification}
          />
        </TabsContent>
        <TabsContent value="reminder" className="mt-0">
          <NotificationList
            notifications={filteredNotifications}
            groupedNotifications={groupedNotifications}
            selectedType={selectedType}
            showUnreadOnly={showUnreadOnly}
            markAsRead={markAsRead}
            deleteNotification={deleteNotification}
          />
        </TabsContent>
        <TabsContent value="request" className="mt-0">
          <NotificationList
            notifications={filteredNotifications}
            groupedNotifications={groupedNotifications}
            selectedType={selectedType}
            showUnreadOnly={showUnreadOnly}
            markAsRead={markAsRead}
            deleteNotification={deleteNotification}
          />
        </TabsContent>
        <TabsContent value="milestone" className="mt-0">
          <NotificationList
            notifications={filteredNotifications}
            groupedNotifications={groupedNotifications}
            selectedType={selectedType}
            showUnreadOnly={showUnreadOnly}
            markAsRead={markAsRead}
            deleteNotification={deleteNotification}
          />
        </TabsContent>
        <TabsContent value="checkin" className="mt-0">
          <NotificationList
            notifications={filteredNotifications}
            groupedNotifications={groupedNotifications}
            selectedType={selectedType}
            showUnreadOnly={showUnreadOnly}
            markAsRead={markAsRead}
            deleteNotification={deleteNotification}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

/**
 * Notification list component
 */
function NotificationList({
  notifications,
  groupedNotifications,
  selectedType,
  showUnreadOnly,
  markAsRead,
  deleteNotification
}: {
  notifications: Notification[]
  groupedNotifications: Record<string, Notification[]>
  selectedType: string
  showUnreadOnly: boolean
  markAsRead: (id: string) => void
  deleteNotification: (id: string) => void
}) {
  return (
    <ScrollArea className="h-[400px]">
      {notifications.length === 0 ? (
        <EmptyState type={selectedType} showUnreadOnly={showUnreadOnly} />
      ) : (
        <div className="divide-y">
          {Object.entries(groupedNotifications).map(([date, items]) => (
            <div key={date}>
              <div className="px-4 py-2 bg-muted/50 text-xs font-medium text-muted-foreground sticky top-0">
                {date}
              </div>
              {items.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={() => markAsRead(notification.id)}
                  onDelete={() => deleteNotification(notification.id)}
                />
              ))}
            </div>
          ))}
        </div>
      )}
    </ScrollArea>
  )
}

/**
 * Individual notification item
 */
function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete
}: {
  notification: Notification
  onMarkAsRead: () => void
  onDelete: () => void
}) {
  const icon = getNotificationIcon(notification.type)
  const iconColor = getNotificationColor(notification.type)

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={cn(
        'group flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors cursor-pointer',
        !notification.read && 'bg-accent/10'
      )}
      onClick={onMarkAsRead}
    >
      {/* Icon */}
      <div className={cn('mt-0.5 p-2 rounded-full', iconColor)}>
        {React.createElement(icon, { className: 'h-4 w-4' })}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className={cn(
              'text-sm font-medium',
              !notification.read && 'font-semibold'
            )}>
              {notification.title}
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">
              {notification.message}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
            </p>
          </div>

          {/* Actions */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            {!notification.read && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation()
                  onMarkAsRead()
                }}
              >
                <Check className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Action button */}
        {notification.actionUrl && (
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 mt-2 text-xs"
            onClick={(e) => {
              e.stopPropagation()
              window.open(notification.actionUrl, '_blank')
            }}
          >
            {notification.actionLabel || 'View'}
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        )}
      </div>
    </motion.div>
  )
}

/**
 * Empty state component
 */
function EmptyState({ type, showUnreadOnly }: { type: string; showUnreadOnly: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <Bell className="h-12 w-12 text-muted-foreground/50 mb-3" />
      <p className="text-sm font-medium text-muted-foreground">
        {showUnreadOnly
          ? 'No unread notifications'
          : type === 'all'
          ? 'No notifications yet'
          : `No ${type} notifications`}
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        {showUnreadOnly
          ? 'All caught up!'
          : 'New notifications will appear here'}
      </p>
    </div>
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
 * Get color class for notification type
 */
function getNotificationColor(type: NotificationType) {
  switch (type) {
    case 'reminder':
      return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
    case 'request':
      return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
    case 'milestone':
      return 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
    case 'checkin':
      return 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400'
    default:
      return 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400'
  }
}

/**
 * Group notifications by date
 */
function groupNotificationsByDate(notifications: Notification[]) {
  const groups: { [key: string]: Notification[] } = {}
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  notifications.forEach(notification => {
    const date = notification.timestamp
    let key: string

    if (isSameDay(date, today)) {
      key = 'Today'
    } else if (isSameDay(date, yesterday)) {
      key = 'Yesterday'
    } else {
      key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }

    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(notification)
  })

  return groups
}

/**
 * Check if two dates are the same day
 */
function isSameDay(date1: Date, date2: Date) {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  )
}