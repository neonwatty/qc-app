'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import {
  websocketService,
  WebSocketEventType,
  WebSocketMessage,
  ConnectionState
} from '@/services/websocket'

export interface UseWebSocketOptions {
  autoConnect?: boolean
  reconnectOnMount?: boolean
  events?: WebSocketEventType[]
  onMessage?: (message: WebSocketMessage) => void
  onConnectionChange?: (state: ConnectionState) => void
}

export interface UseWebSocketReturn {
  connectionState: ConnectionState
  isConnected: boolean
  send: (type: WebSocketEventType, payload: any) => void
  connect: () => void
  disconnect: () => void
  subscribe: (eventType: WebSocketEventType, handler: (message: WebSocketMessage) => void) => () => void
  lastMessage: WebSocketMessage | null
  lastError: Error | null
}

/**
 * Custom hook for WebSocket connections in React components
 * Provides automatic cleanup, reconnection, and message handling
 */
export function useWebSocket(options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const {
    autoConnect = true,
    reconnectOnMount = true,
    events = [],
    onMessage,
    onConnectionChange
  } = options

  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected')
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null)
  const [lastError, setLastError] = useState<Error | null>(null)
  const unsubscribersRef = useRef<(() => void)[]>([])
  const isMountedRef = useRef(true)

  // Handle connection state changes
  useEffect(() => {
    const unsubscribe = websocketService.onConnectionChange((state) => {
      if (isMountedRef.current) {
        setConnectionState(state)
        onConnectionChange?.(state)

        // Track errors
        if (state === 'error') {
          setLastError(new Error('WebSocket connection error'))
        }
      }
    })

    unsubscribersRef.current.push(unsubscribe)
    return () => {
      unsubscribe()
    }
  }, [onConnectionChange])

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect && websocketService.getConnectionState() === 'disconnected') {
      websocketService.connect()
    }

    return () => {
      isMountedRef.current = false

      // Cleanup all subscriptions
      unsubscribersRef.current.forEach(unsub => unsub())
      unsubscribersRef.current = []

      // Optionally disconnect on unmount (you may want to keep connection alive)
      // websocketService.disconnect()
    }
  }, [autoConnect]) // Only run when autoConnect changes

  // Subscribe to specified events
  useEffect(() => {
    const eventUnsubscribers: (() => void)[] = []

    events.forEach(eventType => {
      const unsubscribe = websocketService.on(eventType, (message) => {
        if (isMountedRef.current) {
          setLastMessage(message)
          onMessage?.(message)
        }
      })
      eventUnsubscribers.push(unsubscribe)
    })

    return () => {
      eventUnsubscribers.forEach(unsub => unsub())
    }
  }, [events, onMessage])

  // Send message
  const send = useCallback((type: WebSocketEventType, payload: any) => {
    try {
      websocketService.send(type, payload)
    } catch (error) {
      console.error('Failed to send WebSocket message:', error)
      setLastError(error as Error)
    }
  }, [])

  // Connect manually
  const connect = useCallback(() => {
    websocketService.connect()
  }, [])

  // Disconnect manually
  const disconnect = useCallback(() => {
    websocketService.disconnect()
  }, [])

  // Subscribe to events dynamically
  const subscribe = useCallback((eventType: WebSocketEventType, handler: (message: WebSocketMessage) => void) => {
    const unsubscribe = websocketService.on(eventType, (message) => {
      if (isMountedRef.current) {
        handler(message)
      }
    })

    // Store unsubscriber for cleanup
    unsubscribersRef.current.push(unsubscribe)

    return unsubscribe
  }, [])

  return {
    connectionState,
    isConnected: connectionState === 'connected',
    send,
    connect,
    disconnect,
    subscribe,
    lastMessage,
    lastError
  }
}

/**
 * Hook for subscribing to specific WebSocket events
 */
export function useWebSocketEvent(
  eventType: WebSocketEventType,
  handler: (message: WebSocketMessage) => void,
  deps: React.DependencyList = []
) {
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  useEffect(() => {
    const unsubscribe = websocketService.on(eventType, (message) => {
      handlerRef.current(message)
    })

    return unsubscribe
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventType])
}

/**
 * Hook for tracking partner presence in real-time
 */
export function usePartnerPresence(partnerId?: string) {
  const [isOnline, setIsOnline] = useState(false)
  const [lastSeen, setLastSeen] = useState<Date | null>(null)
  const [activity, setActivity] = useState<string | null>(null)

  useWebSocketEvent('presence_update', (message) => {
    const { userId, status, activity: userActivity, timestamp } = message.payload

    if (userId === partnerId) {
      setIsOnline(status === 'online')
      setLastSeen(new Date(timestamp))
      setActivity(userActivity || null)
    }
  }, [partnerId])

  return { isOnline, lastSeen, activity }
}

/**
 * Hook for real-time typing indicators
 */
export function useTypingIndicator(sessionId: string) {
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())
  const typingTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map())

  useWebSocketEvent('typing_start', (message) => {
    if (message.sessionId === sessionId) {
      const userId = message.userId!

      setTypingUsers(prev => new Set([...prev, userId]))

      // Clear existing timer
      const existingTimer = typingTimersRef.current.get(userId)
      if (existingTimer) {
        clearTimeout(existingTimer)
      }

      // Set auto-clear after 3 seconds
      const timer = setTimeout(() => {
        setTypingUsers(prev => {
          const newSet = new Set(prev)
          newSet.delete(userId)
          return newSet
        })
        typingTimersRef.current.delete(userId)
      }, 3000)

      typingTimersRef.current.set(userId, timer)
    }
  }, [sessionId])

  useWebSocketEvent('typing_stop', (message) => {
    if (message.sessionId === sessionId) {
      const userId = message.userId!

      setTypingUsers(prev => {
        const newSet = new Set(prev)
        newSet.delete(userId)
        return newSet
      })

      // Clear timer
      const timer = typingTimersRef.current.get(userId)
      if (timer) {
        clearTimeout(timer)
        typingTimersRef.current.delete(userId)
      }
    }
  }, [sessionId])

  // Cleanup timers on unmount
  useEffect(() => {
    const timers = typingTimersRef.current
    return () => {
      timers.forEach(timer => clearTimeout(timer))
      timers.clear()
    }
  }, [])

  const sendTypingStart = useCallback(() => {
    websocketService.send('typing_start', { sessionId })
  }, [sessionId])

  const sendTypingStop = useCallback(() => {
    websocketService.send('typing_stop', { sessionId })
  }, [sessionId])

  return {
    typingUsers: Array.from(typingUsers),
    isAnyoneTyping: typingUsers.size > 0,
    sendTypingStart,
    sendTypingStop
  }
}

/**
 * Hook for real-time check-in session sync
 */
export function useCheckInSync(checkInId: string) {
  const [syncedData, setSyncedData] = useState<any>(null)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const [partnerJoined, setPartnerJoined] = useState(false)

  const { send, subscribe } = useWebSocket({
    autoConnect: true,
    events: ['check_in_update', 'partner_joined', 'partner_left']
  })

  useWebSocketEvent('check_in_update', (message) => {
    if (message.payload.checkInId === checkInId) {
      setSyncedData(message.payload.data)
      setLastSyncTime(new Date(message.timestamp))
    }
  }, [checkInId])

  useWebSocketEvent('partner_joined', (message) => {
    if (message.payload.checkInId === checkInId) {
      setPartnerJoined(true)
    }
  }, [checkInId])

  useWebSocketEvent('partner_left', (message) => {
    if (message.payload.checkInId === checkInId) {
      setPartnerJoined(false)
    }
  }, [checkInId])

  const sendUpdate = useCallback((data: any) => {
    send('check_in_update', {
      checkInId,
      data
    })
  }, [checkInId, send])

  return {
    syncedData,
    lastSyncTime,
    partnerJoined,
    sendUpdate
  }
}