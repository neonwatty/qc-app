'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useNotificationChannel } from './useActionCable'

export type NotificationType = 'reminder' | 'request' | 'milestone' | 'checkin' | 'system'
export type NotificationPriority = 'high' | 'medium' | 'low'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  priority: NotificationPriority
  timestamp: Date
  read: boolean
  actionUrl?: string
  actionLabel?: string
  icon?: string
  data?: Record<string, any>
  expiresAt?: Date
}

export interface NotificationPreferences {
  enabled: boolean
  soundEnabled: boolean
  vibrationEnabled: boolean
  desktopEnabled: boolean
  types: {
    [key in NotificationType]: boolean
  }
}

export interface UseNotificationsOptions {
  autoConnect?: boolean
  playSound?: boolean
  showDesktop?: boolean
  onNotification?: (notification: Notification) => void
  maxNotifications?: number
}

export interface UseNotificationsReturn {
  notifications: Notification[]
  unreadCount: number
  hasUnread: boolean
  preferences: NotificationPreferences
  isConnected: boolean
  markAsRead: (notificationId: string) => void
  markAllAsRead: () => void
  deleteNotification: (notificationId: string) => void
  clearAll: () => void
  updatePreferences: (preferences: Partial<NotificationPreferences>) => void
  sendTestNotification: () => void
}

// Default preferences
const DEFAULT_PREFERENCES: NotificationPreferences = {
  enabled: true,
  soundEnabled: true,
  vibrationEnabled: true,
  desktopEnabled: false,
  types: {
    reminder: true,
    request: true,
    milestone: true,
    checkin: true,
    system: true
  }
}

/**
 * Custom hook for managing notifications with real-time updates
 */
export function useNotifications(options: UseNotificationsOptions = {}): UseNotificationsReturn {
  const {
    autoConnect = true,
    playSound = true,
    showDesktop = false,
    onNotification,
    maxNotifications = 50
  } = options

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Use WebSocket channel for real-time notifications
  const {
    isSubscribed,
    notifications: wsNotifications,
    unreadCount: wsUnreadCount,
    markAsRead: wsMarkAsRead,
    clearAll: wsClearAll
  } = useNotificationChannel()

  // Initialize audio for notification sounds
  useEffect(() => {
    if (playSound && preferences.soundEnabled) {
      audioRef.current = new Audio('/sounds/notification.mp3')
      audioRef.current.volume = 0.5
    }
  }, [playSound, preferences.soundEnabled])

  // Handle incoming WebSocket notifications
  useEffect(() => {
    if (wsNotifications && wsNotifications.length > 0) {
      const newNotifications = wsNotifications.map((n: any) => ({
        id: n.id || `notification-${Date.now()}`,
        type: n.type as NotificationType,
        title: n.title,
        message: n.message,
        priority: n.priority || 'medium',
        timestamp: new Date(n.timestamp || Date.now()),
        read: n.read || false,
        actionUrl: n.action_url,
        actionLabel: n.action_label,
        icon: n.icon,
        data: n.data,
        expiresAt: n.expires_at ? new Date(n.expires_at) : undefined
      }))

      setNotifications(prev => {
        const combined = [...newNotifications, ...prev]
        // Keep only the most recent notifications
        return combined.slice(0, maxNotifications)
      })

      // Trigger notification callback for the latest one
      if (newNotifications.length > 0 && onNotification) {
        onNotification(newNotifications[0])
      }

      // Play sound for new notifications
      if (playSound && preferences.soundEnabled && audioRef.current) {
        audioRef.current.play().catch(console.error)
      }

      // Show desktop notification if enabled
      if (showDesktop && preferences.desktopEnabled && newNotifications.length > 0) {
        showDesktopNotification(newNotifications[0])
      }
    }
  }, [wsNotifications, onNotification, playSound, showDesktop, preferences, maxNotifications])

  // Request desktop notification permission
  useEffect(() => {
    if (showDesktop && preferences.desktopEnabled && 'Notification' in window) {
      Notification.requestPermission()
    }
  }, [showDesktop, preferences.desktopEnabled])

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length
  const hasUnread = unreadCount > 0

  // Mark notification as read
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    )

    // Sync with WebSocket
    if (isSubscribed) {
      wsMarkAsRead(notificationId)
    }
  }, [isSubscribed, wsMarkAsRead])

  // Mark all notifications as read
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))

    // Sync with WebSocket by marking each one
    if (isSubscribed) {
      notifications.filter(n => !n.read).forEach(n => {
        wsMarkAsRead(n.id)
      })
    }
  }, [isSubscribed, notifications, wsMarkAsRead])

  // Delete a notification
  const deleteNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
  }, [])

  // Clear all notifications
  const clearAll = useCallback(() => {
    setNotifications([])

    // Sync with WebSocket
    if (isSubscribed) {
      wsClearAll()
    }
  }, [isSubscribed, wsClearAll])

  // Update preferences
  const updatePreferences = useCallback((newPreferences: Partial<NotificationPreferences>) => {
    setPreferences(prev => ({ ...prev, ...newPreferences }))

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('notification-preferences', JSON.stringify({ ...preferences, ...newPreferences }))
    }
  }, [preferences])

  // Load preferences from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('notification-preferences')
      if (saved) {
        try {
          setPreferences(JSON.parse(saved))
        } catch (e) {
          console.error('Failed to load notification preferences:', e)
        }
      }
    }
  }, [])

  // Send test notification
  const sendTestNotification = useCallback(() => {
    const testNotification: Notification = {
      id: `test-${Date.now()}`,
      type: 'system',
      title: 'Test Notification',
      message: 'This is a test notification to verify your settings',
      priority: 'medium',
      timestamp: new Date(),
      read: false,
      icon: '🔔'
    }

    setNotifications(prev => [testNotification, ...prev].slice(0, maxNotifications))

    if (onNotification) {
      onNotification(testNotification)
    }

    if (playSound && preferences.soundEnabled && audioRef.current) {
      audioRef.current.play().catch(console.error)
    }

    if (showDesktop && preferences.desktopEnabled) {
      showDesktopNotification(testNotification)
    }
  }, [maxNotifications, onNotification, playSound, showDesktop, preferences])

  // Remove expired notifications
  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications(prev => prev.filter(n => !n.expiresAt || n.expiresAt > new Date()))
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [])

  return {
    notifications,
    unreadCount,
    hasUnread,
    preferences,
    isConnected: isSubscribed,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    updatePreferences,
    sendTestNotification
  }
}

/**
 * Show desktop notification
 */
function showDesktopNotification(notification: Notification) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return
  }

  const desktopNotification = new Notification(notification.title, {
    body: notification.message,
    icon: notification.icon || '/icon-192.png',
    badge: '/icon-72.png',
    tag: notification.id,
    requireInteraction: notification.priority === 'high',
    silent: false
  })

  desktopNotification.onclick = () => {
    if (notification.actionUrl) {
      window.open(notification.actionUrl, '_blank')
    }
    desktopNotification.close()
  }

  // Auto-close after 5 seconds for non-high priority
  if (notification.priority !== 'high') {
    setTimeout(() => desktopNotification.close(), 5000)
  }
}

/**
 * Hook for notification badge display
 */
export function useNotificationBadge() {
  const { unreadCount, hasUnread } = useNotifications({ autoConnect: true })

  useEffect(() => {
    // Update browser tab title with unread count
    if (hasUnread && unreadCount > 0) {
      document.title = `(${unreadCount}) Quality Control`
    } else {
      document.title = 'Quality Control'
    }
  }, [hasUnread, unreadCount])

  return { unreadCount, hasUnread }
}

/**
 * Hook for notification permissions
 */
export function useNotificationPermissions() {
  const [permission, setPermission] = useState<NotificationPermission>('default')

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = useCallback(async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission()
      setPermission(result)
      return result
    }
    return 'default' as NotificationPermission
  }, [])

  return { permission, requestPermission }
}