'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import {
  actionCableService,
  ChannelIdentifier,
  SubscriptionCallbacks,
  CheckInChannel,
  NotificationChannel,
  PresenceChannel
} from '@/services/actioncable'
import { Subscription } from '@rails/actioncable'

export interface UseActionCableOptions {
  autoConnect?: boolean
  onConnected?: () => void
  onDisconnected?: () => void
}

export interface UseActionCableReturn {
  isConnected: boolean
  connect: () => void
  disconnect: () => void
  reconnect: () => Promise<void>
}

/**
 * Hook for managing Action Cable connection
 */
export function useActionCable(options: UseActionCableOptions = {}): UseActionCableReturn {
  const {
    autoConnect = true,
    onConnected,
    onDisconnected
  } = options

  const [isConnected, setIsConnected] = useState(false)
  const isMountedRef = useRef(true)

  // Monitor connection state
  useEffect(() => {
    const unsubscribe = actionCableService.onConnectionChange((connected) => {
      if (isMountedRef.current) {
        setIsConnected(connected)
        if (connected) {
          onConnected?.()
        } else {
          onDisconnected?.()
        }
      }
    })

    return unsubscribe
  }, [onConnected, onDisconnected])

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect && !actionCableService.connected) {
      actionCableService.connect()
    }

    return () => {
      isMountedRef.current = false
    }
  }, [autoConnect])

  const connect = useCallback(() => {
    actionCableService.connect()
  }, [])

  const disconnect = useCallback(() => {
    actionCableService.disconnect()
  }, [])

  const reconnect = useCallback(async () => {
    await actionCableService.reconnect()
  }, [])

  return {
    isConnected,
    connect,
    disconnect,
    reconnect
  }
}

/**
 * Hook for subscribing to Action Cable channels
 */
export function useChannel<T extends Record<string, any> = any>(
  identifier: ChannelIdentifier,
  callbacks: SubscriptionCallbacks = {},
  deps: React.DependencyList = []
) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const subscriptionRef = useRef<Subscription | null>(null)

  useEffect(() => {
    // Subscribe to channel
    subscriptionRef.current = actionCableService.subscribe(identifier, {
      received: (receivedData: T) => {
        setData(receivedData)
        setError(null)
        callbacks.received?.(receivedData)
      },
      connected: () => {
        setIsSubscribed(true)
        setError(null)
        callbacks.connected?.()
      },
      disconnected: () => {
        setIsSubscribed(false)
        callbacks.disconnected?.()
      },
      rejected: () => {
        setIsSubscribed(false)
        setError(new Error('Subscription rejected'))
        callbacks.rejected?.()
      }
    })

    return () => {
      if (subscriptionRef.current) {
        actionCableService.unsubscribe(identifier)
        subscriptionRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  const perform = useCallback((action: string, data: any = {}) => {
    actionCableService.perform(identifier, action, data)
  }, [identifier])

  const send = useCallback((data: any) => {
    actionCableService.send(identifier, data)
  }, [identifier])

  return {
    data,
    error,
    isSubscribed,
    perform,
    send
  }
}

/**
 * Hook for Check-in channel
 */
export function useCheckInChannel(sessionId: string) {
  const [sessionData, setSessionData] = useState<any>(null)
  const [partnerJoined, setPartnerJoined] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])

  const identifier: ChannelIdentifier = {
    channel: 'CheckInChannel',
    session_id: sessionId
  }

  const { perform, isSubscribed } = useChannel<any>(identifier, {
    received: (data) => {
      switch (data.type) {
        case 'session_update':
          setSessionData(data.payload)
          break
        case 'partner_joined':
          setPartnerJoined(true)
          break
        case 'partner_left':
          setPartnerJoined(false)
          break
        case 'typing_start':
          setTypingUsers(prev => [...prev.filter(u => u !== data.user_id), data.user_id])
          break
        case 'typing_stop':
          setTypingUsers(prev => prev.filter(u => u !== data.user_id))
          break
      }
    }
  }, [sessionId])

  const updateSession = useCallback((data: any) => {
    perform('update_session', data)
  }, [perform])

  const joinSession = useCallback(() => {
    perform('join_session', { session_id: sessionId })
  }, [perform, sessionId])

  const leaveSession = useCallback(() => {
    perform('leave_session', { session_id: sessionId })
  }, [perform, sessionId])

  const sendTyping = useCallback((isTyping: boolean) => {
    perform('send_typing', { is_typing: isTyping })
  }, [perform])

  return {
    isSubscribed,
    sessionData,
    partnerJoined,
    typingUsers,
    updateSession,
    joinSession,
    leaveSession,
    sendTyping
  }
}

/**
 * Hook for Notification channel
 */
export function useNotificationChannel() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  const identifier: ChannelIdentifier = {
    channel: 'NotificationChannel'
  }

  const { perform, isSubscribed } = useChannel<any>(identifier, {
    received: (data) => {
      switch (data.type) {
        case 'new_notification':
          setNotifications(prev => [data.notification, ...prev])
          setUnreadCount(prev => prev + 1)
          break
        case 'notification_read':
          setNotifications(prev =>
            prev.map(n => n.id === data.notification_id ? { ...n, read: true } : n)
          )
          setUnreadCount(prev => Math.max(0, prev - 1))
          break
        case 'notifications_cleared':
          setNotifications([])
          setUnreadCount(0)
          break
      }
    }
  })

  const markAsRead = useCallback((notificationId: string) => {
    perform('mark_as_read', { notification_id: notificationId })
  }, [perform])

  const clearAll = useCallback(() => {
    perform('clear_all', {})
  }, [perform])

  return {
    isSubscribed,
    notifications,
    unreadCount,
    markAsRead,
    clearAll
  }
}

/**
 * Hook for Presence channel
 */
export function usePresenceChannel(userId?: string) {
  const [onlineUsers, setOnlineUsers] = useState<Map<string, { status: string; lastSeen: Date }>>(new Map())
  const [userStatus, setUserStatus] = useState<'online' | 'away' | 'offline'>('offline')

  const identifier: ChannelIdentifier = {
    channel: 'PresenceChannel',
    user_id: userId
  }

  const { perform, isSubscribed } = useChannel<any>(identifier, {
    received: (data) => {
      switch (data.type) {
        case 'presence_update':
          setOnlineUsers(prev => {
            const updated = new Map(prev)
            updated.set(data.user_id, {
              status: data.status,
              lastSeen: new Date(data.timestamp)
            })
            return updated
          })
          break
        case 'user_offline':
          setOnlineUsers(prev => {
            const updated = new Map(prev)
            updated.delete(data.user_id)
            return updated
          })
          break
      }
    },
    connected: () => {
      // Automatically set online status when connected
      perform('update_status', { status: 'online' })
      setUserStatus('online')
    },
    disconnected: () => {
      setUserStatus('offline')
    }
  }, [userId])

  const updateStatus = useCallback((status: 'online' | 'away' | 'offline') => {
    perform('update_status', { status })
    setUserStatus(status)
  }, [perform])

  const isUserOnline = useCallback((checkUserId: string) => {
    const user = onlineUsers.get(checkUserId)
    return user?.status === 'online'
  }, [onlineUsers])

  return {
    isSubscribed,
    onlineUsers: Array.from(onlineUsers.entries()).map(([id, data]) => ({
      userId: id,
      ...data
    })),
    userStatus,
    updateStatus,
    isUserOnline
  }
}