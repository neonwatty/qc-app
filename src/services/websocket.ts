import { authService } from './auth.service'
import { actionCableService, ChannelIdentifier, SubscriptionCallbacks } from './actioncable'

// WebSocket event types
export type WebSocketEventType =
  | 'check_in_update'
  | 'partner_joined'
  | 'partner_left'
  | 'note_created'
  | 'note_updated'
  | 'action_item_updated'
  | 'milestone_achieved'
  | 'reminder_triggered'
  | 'typing_start'
  | 'typing_stop'
  | 'presence_update'

export interface WebSocketMessage {
  type: WebSocketEventType
  payload: any
  timestamp: Date
  userId?: string
  sessionId?: string
}

export interface WebSocketOptions {
  reconnectInterval?: number
  maxReconnectAttempts?: number
  heartbeatInterval?: number
  messageQueueSize?: number
}

export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'error'

type MessageHandler = (message: WebSocketMessage) => void
type ConnectionHandler = (state: ConnectionState) => void

class WebSocketService {
  private ws: WebSocket | null = null
  private url: string = ''
  private options: Required<WebSocketOptions>
  private messageHandlers: Map<WebSocketEventType, Set<MessageHandler>> = new Map()
  private connectionHandlers: Set<ConnectionHandler> = new Set()
  private reconnectAttempts = 0
  private reconnectTimer: NodeJS.Timeout | null = null
  private heartbeatTimer: NodeJS.Timeout | null = null
  private messageQueue: WebSocketMessage[] = []
  private connectionState: ConnectionState = 'disconnected'
  private isIntentionallyClosed = false

  constructor(options: WebSocketOptions = {}) {
    this.options = {
      reconnectInterval: options.reconnectInterval || 5000,
      maxReconnectAttempts: options.maxReconnectAttempts || 10,
      heartbeatInterval: options.heartbeatInterval || 30000,
      messageQueueSize: options.messageQueueSize || 100
    }
  }

  // Connect to WebSocket server
  connect(url?: string): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.warn('WebSocket is already connected')
      return
    }

    this.isIntentionallyClosed = false
    const token = authService.getAccessToken()

    // Build WebSocket URL with authentication
    const wsUrl = url || this.getWebSocketUrl()
    this.url = token ? `${wsUrl}?token=${token}` : wsUrl

    this.updateConnectionState('connecting')

    try {
      this.ws = new WebSocket(this.url)
      this.setupEventListeners()
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
      this.updateConnectionState('error')
      this.scheduleReconnect()
    }
  }

  // Disconnect from WebSocket server
  disconnect(): void {
    this.isIntentionallyClosed = true
    this.cleanup()
    this.updateConnectionState('disconnected')
  }

  // Send message through WebSocket
  send(type: WebSocketEventType, payload: any): void {
    const message: WebSocketMessage = {
      type,
      payload,
      timestamp: new Date(),
      userId: authService.getCurrentUserId()
    }

    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(message))
      } catch (error) {
        console.error('Failed to send WebSocket message:', error)
        this.queueMessage(message)
      }
    } else {
      // Queue message if not connected
      this.queueMessage(message)
    }
  }

  // Subscribe to specific event type
  on(eventType: WebSocketEventType, handler: MessageHandler): () => void {
    if (!this.messageHandlers.has(eventType)) {
      this.messageHandlers.set(eventType, new Set())
    }

    this.messageHandlers.get(eventType)!.add(handler)

    // Return unsubscribe function
    return () => {
      this.messageHandlers.get(eventType)?.delete(handler)
    }
  }

  // Subscribe to connection state changes
  onConnectionChange(handler: ConnectionHandler): () => void {
    this.connectionHandlers.add(handler)

    // Immediately call with current state
    handler(this.connectionState)

    return () => {
      this.connectionHandlers.delete(handler)
    }
  }

  // Get current connection state
  getConnectionState(): ConnectionState {
    return this.connectionState
  }

  // Check if connected
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  // Private methods
  private setupEventListeners(): void {
    if (!this.ws) return

    this.ws.onopen = () => {
      console.log('WebSocket connected')
      this.updateConnectionState('connected')
      this.reconnectAttempts = 0
      this.startHeartbeat()
      this.flushMessageQueue()
    }

    this.ws.onmessage = (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data)
        this.handleMessage(message)
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error)
      }
    }

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      this.updateConnectionState('error')
    }

    this.ws.onclose = (event) => {
      console.log('WebSocket disconnected', { code: event.code, reason: event.reason })
      this.cleanup()

      if (!this.isIntentionallyClosed) {
        this.updateConnectionState('disconnected')
        this.scheduleReconnect()
      }
    }
  }

  private handleMessage(message: WebSocketMessage): void {
    // Handle heartbeat/pong messages
    if (message.type === 'pong' as any) {
      return
    }

    // Notify specific event handlers
    const handlers = this.messageHandlers.get(message.type)
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(message)
        } catch (error) {
          console.error('Error in WebSocket message handler:', error)
        }
      })
    }

    // Notify wildcard handlers (if any)
    const wildcardHandlers = this.messageHandlers.get('*' as any)
    if (wildcardHandlers) {
      wildcardHandlers.forEach(handler => {
        try {
          handler(message)
        } catch (error) {
          console.error('Error in WebSocket wildcard handler:', error)
        }
      })
    }
  }

  private updateConnectionState(state: ConnectionState): void {
    if (this.connectionState === state) return

    this.connectionState = state
    this.connectionHandlers.forEach(handler => {
      try {
        handler(state)
      } catch (error) {
        console.error('Error in connection state handler:', error)
      }
    })
  }

  private scheduleReconnect(): void {
    if (this.isIntentionallyClosed) return

    if (this.reconnectAttempts >= this.options.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached')
      this.updateConnectionState('error')
      return
    }

    this.updateConnectionState('reconnecting')
    this.reconnectAttempts++

    const delay = Math.min(
      this.options.reconnectInterval * Math.pow(1.5, this.reconnectAttempts - 1),
      30000 // Max 30 seconds
    )

    console.log(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`)

    this.reconnectTimer = setTimeout(() => {
      this.connect()
    }, delay)
  }

  private startHeartbeat(): void {
    this.stopHeartbeat()

    this.heartbeatTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send('ping' as any, {})
      }
    }, this.options.heartbeatInterval)
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  private queueMessage(message: WebSocketMessage): void {
    this.messageQueue.push(message)

    // Limit queue size
    if (this.messageQueue.length > this.options.messageQueueSize) {
      this.messageQueue.shift()
    }
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.ws?.readyState === WebSocket.OPEN) {
      const message = this.messageQueue.shift()
      if (message) {
        try {
          this.ws.send(JSON.stringify(message))
        } catch (error) {
          console.error('Failed to send queued message:', error)
          this.messageQueue.unshift(message)
          break
        }
      }
    }
  }

  private cleanup(): void {
    this.stopHeartbeat()

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    if (this.ws) {
      this.ws.onopen = null
      this.ws.onmessage = null
      this.ws.onerror = null
      this.ws.onclose = null

      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.close()
      }

      this.ws = null
    }
  }

  private getWebSocketUrl(): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = process.env.NEXT_PUBLIC_WS_URL || window.location.host
    return `${protocol}//${host}/ws`
  }

  private getCurrentUserId(): string | undefined {
    // This would typically come from auth service
    return authService.getCurrentUserId()
  }
}

// Export singleton instance
export const websocketService = new WebSocketService()

// Export types and class for testing
export { WebSocketService }