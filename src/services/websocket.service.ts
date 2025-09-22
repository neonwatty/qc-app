import type { CheckInSession, CheckInStep, CategoryProgress } from '@/types/checkin'
import type { Note, ActionItem } from '@/types'

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'

export type WebSocketEventType =
  | 'session:started'
  | 'session:progress'
  | 'session:category_progress'
  | 'session:note_added'
  | 'session:note_updated'
  | 'session:note_removed'
  | 'session:action_item_added'
  | 'session:action_item_updated'
  | 'session:action_item_removed'
  | 'session:completed'
  | 'session:abandoned'
  | 'partner:joined'
  | 'partner:left'
  | 'partner:typing'
  | 'sync:request'
  | 'sync:response'
  | 'error'

export interface WebSocketMessage {
  type: WebSocketEventType
  sessionId: string
  userId: string
  timestamp: string
  data: any
}

export interface WebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Error) => void
  reconnectAttempts?: number
  reconnectDelay?: number
}

class WebSocketService {
  private socket: WebSocket | null = null
  private sessionId: string | null = null
  private userId: string | null = null
  private options: WebSocketOptions = {}
  private reconnectAttempts = 0
  private reconnectTimer: NodeJS.Timeout | null = null
  private heartbeatTimer: NodeJS.Timeout | null = null
  private messageQueue: WebSocketMessage[] = []
  private isConnected = false

  connect(sessionId: string, userId: string, options: WebSocketOptions = {}) {
    this.sessionId = sessionId
    this.userId = userId
    this.options = {
      reconnectAttempts: 5,
      reconnectDelay: 1000,
      ...options
    }

    this.createConnection()
  }

  private createConnection() {
    if (this.socket?.readyState === WebSocket.OPEN) {
      return
    }

    try {
      // Get auth token
      const token = this.getAuthToken()
      const wsUrl = `${WS_BASE_URL}/checkins?sessionId=${this.sessionId}&userId=${this.userId}&token=${token}`

      this.socket = new WebSocket(wsUrl)

      this.socket.onopen = () => {
        this.isConnected = true
        this.reconnectAttempts = 0
        this.options.onConnect?.()
        this.startHeartbeat()
        this.flushMessageQueue()
      }

      this.socket.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)

          // Handle ping/pong for heartbeat
          if (message.type === 'sync:request' && message.data?.ping) {
            this.sendMessage({
              type: 'sync:response',
              sessionId: this.sessionId!,
              userId: this.userId!,
              timestamp: new Date().toISOString(),
              data: { pong: true }
            })
            return
          }

          this.options.onMessage?.(message)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }

      this.socket.onclose = () => {
        this.isConnected = false
        this.stopHeartbeat()
        this.options.onDisconnect?.()
        this.attemptReconnect()
      }

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error)
        this.options.onError?.(new Error('WebSocket connection error'))
      }
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
      this.options.onError?.(error as Error)
      this.attemptReconnect()
    }
  }

  private getAuthToken(): string {
    const tokens = localStorage.getItem('auth_tokens')
    if (tokens) {
      const { accessToken } = JSON.parse(tokens)
      return accessToken
    }
    return ''
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= (this.options.reconnectAttempts || 5)) {
      console.error('Max reconnection attempts reached')
      return
    }

    this.reconnectAttempts++
    const delay = (this.options.reconnectDelay || 1000) * Math.pow(2, this.reconnectAttempts - 1)

    this.reconnectTimer = setTimeout(() => {
      console.log(`Attempting reconnection ${this.reconnectAttempts}...`)
      this.createConnection()
    }, delay)
  }

  private startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        this.sendMessage({
          type: 'sync:request',
          sessionId: this.sessionId!,
          userId: this.userId!,
          timestamp: new Date().toISOString(),
          data: { ping: true }
        })
      }
    }, 30000) // Send heartbeat every 30 seconds
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  private flushMessageQueue() {
    while (this.messageQueue.length > 0 && this.socket?.readyState === WebSocket.OPEN) {
      const message = this.messageQueue.shift()
      if (message) {
        this.socket.send(JSON.stringify(message))
      }
    }
  }

  sendMessage(message: WebSocketMessage) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message))
    } else {
      // Queue message for later
      this.messageQueue.push(message)
    }
  }

  // Send session events
  notifyProgressUpdate(step: CheckInStep, completedSteps: CheckInStep[]) {
    this.sendMessage({
      type: 'session:progress',
      sessionId: this.sessionId!,
      userId: this.userId!,
      timestamp: new Date().toISOString(),
      data: { currentStep: step, completedSteps }
    })
  }

  notifyCategoryProgressUpdate(categoryId: string, progress: Partial<CategoryProgress>) {
    this.sendMessage({
      type: 'session:category_progress',
      sessionId: this.sessionId!,
      userId: this.userId!,
      timestamp: new Date().toISOString(),
      data: { categoryId, progress }
    })
  }

  notifyNoteAdded(note: Note) {
    this.sendMessage({
      type: 'session:note_added',
      sessionId: this.sessionId!,
      userId: this.userId!,
      timestamp: new Date().toISOString(),
      data: { note }
    })
  }

  notifyNoteUpdated(noteId: string, updates: Partial<Note>) {
    this.sendMessage({
      type: 'session:note_updated',
      sessionId: this.sessionId!,
      userId: this.userId!,
      timestamp: new Date().toISOString(),
      data: { noteId, updates }
    })
  }

  notifyNoteRemoved(noteId: string) {
    this.sendMessage({
      type: 'session:note_removed',
      sessionId: this.sessionId!,
      userId: this.userId!,
      timestamp: new Date().toISOString(),
      data: { noteId }
    })
  }

  notifyActionItemAdded(actionItem: ActionItem) {
    this.sendMessage({
      type: 'session:action_item_added',
      sessionId: this.sessionId!,
      userId: this.userId!,
      timestamp: new Date().toISOString(),
      data: { actionItem }
    })
  }

  notifyActionItemUpdated(actionItemId: string, updates: Partial<ActionItem>) {
    this.sendMessage({
      type: 'session:action_item_updated',
      sessionId: this.sessionId!,
      userId: this.userId!,
      timestamp: new Date().toISOString(),
      data: { actionItemId, updates }
    })
  }

  notifyActionItemRemoved(actionItemId: string) {
    this.sendMessage({
      type: 'session:action_item_removed',
      sessionId: this.sessionId!,
      userId: this.userId!,
      timestamp: new Date().toISOString(),
      data: { actionItemId }
    })
  }

  notifyTyping(categoryId?: string) {
    this.sendMessage({
      type: 'partner:typing',
      sessionId: this.sessionId!,
      userId: this.userId!,
      timestamp: new Date().toISOString(),
      data: { categoryId, isTyping: true }
    })
  }

  notifyStoppedTyping(categoryId?: string) {
    this.sendMessage({
      type: 'partner:typing',
      sessionId: this.sessionId!,
      userId: this.userId!,
      timestamp: new Date().toISOString(),
      data: { categoryId, isTyping: false }
    })
  }

  notifySessionCompleted() {
    this.sendMessage({
      type: 'session:completed',
      sessionId: this.sessionId!,
      userId: this.userId!,
      timestamp: new Date().toISOString(),
      data: {}
    })
  }

  notifySessionAbandoned() {
    this.sendMessage({
      type: 'session:abandoned',
      sessionId: this.sessionId!,
      userId: this.userId!,
      timestamp: new Date().toISOString(),
      data: {}
    })
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    this.stopHeartbeat()

    if (this.socket) {
      this.socket.close()
      this.socket = null
    }

    this.isConnected = false
    this.sessionId = null
    this.userId = null
    this.messageQueue = []
  }

  getConnectionStatus(): boolean {
    return this.isConnected
  }
}

// Create singleton instance
export const webSocketService = new WebSocketService()

// Export hook for React components
export function useWebSocket(
  sessionId: string | null,
  userId: string | null,
  options: WebSocketOptions = {}
) {
  // This would be implemented as a proper React hook
  // For now, just return the service
  return webSocketService
}