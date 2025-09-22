import { createConsumer, Consumer, Subscription, Channel } from '@rails/actioncable'
import { authService } from './auth.service'

// Action Cable channel types
export interface CheckInChannel extends Channel {
  updateSession(data: any): void
  joinSession(sessionId: string): void
  leaveSession(sessionId: string): void
  sendTyping(isTyping: boolean): void
}

export interface NotificationChannel extends Channel {
  markAsRead(notificationId: string): void
}

export interface PresenceChannel extends Channel {
  updateStatus(status: 'online' | 'away' | 'offline'): void
}

// Subscription callback interface
export interface SubscriptionCallbacks<T extends Channel = Channel> {
  received?: (data: any) => void
  connected?: () => void
  disconnected?: () => void
  rejected?: () => void
  [key: string]: any
}

// Channel identifier
export interface ChannelIdentifier {
  channel: string
  [key: string]: any
}

class ActionCableService {
  private consumer: Consumer | null = null
  private subscriptions: Map<string, Subscription> = new Map()
  private connectionUrl: string = ''
  private isConnected: boolean = false
  private connectionHandlers: Set<(connected: boolean) => void> = new Set()

  constructor() {
    this.setupConnectionUrl()
  }

  // Initialize connection URL with authentication
  private setupConnectionUrl(): void {
    const baseUrl = process.env.NEXT_PUBLIC_WS_URL ||
                   process.env.NEXT_PUBLIC_API_URL?.replace('http', 'ws') ||
                   'ws://localhost:3000'

    const token = authService.getAccessToken()
    const cableUrl = `${baseUrl}/cable`

    // Add authentication token to URL if available
    this.connectionUrl = token ? `${cableUrl}?token=${token}` : cableUrl
  }

  // Connect to Action Cable
  connect(): void {
    if (this.consumer) {
      console.warn('Action Cable already connected')
      return
    }

    try {
      // Update URL with latest token
      this.setupConnectionUrl()

      // Create consumer
      this.consumer = createConsumer(this.connectionUrl)

      // Monitor connection state
      this.monitorConnection()

      console.log('Action Cable consumer created')
    } catch (error) {
      console.error('Failed to create Action Cable consumer:', error)
      throw error
    }
  }

  // Disconnect from Action Cable
  disconnect(): void {
    if (!this.consumer) return

    // Unsubscribe from all channels
    this.subscriptions.forEach((subscription, key) => {
      subscription.unsubscribe()
      this.subscriptions.delete(key)
    })

    // Disconnect consumer
    this.consumer.disconnect()
    this.consumer = null
    this.isConnected = false

    // Notify handlers
    this.notifyConnectionHandlers(false)

    console.log('Action Cable disconnected')
  }

  // Subscribe to a channel
  subscribe<T extends Channel = Channel>(
    identifier: ChannelIdentifier,
    callbacks: SubscriptionCallbacks<T>
  ): Subscription | null {
    if (!this.consumer) {
      console.error('Consumer not connected')
      return null
    }

    const key = this.getSubscriptionKey(identifier)

    // Check if already subscribed
    if (this.subscriptions.has(key)) {
      console.warn(`Already subscribed to ${key}`)
      return this.subscriptions.get(key)!
    }

    try {
      // Create subscription
      const subscription = this.consumer.subscriptions.create(identifier, {
        connected: () => {
          console.log(`Connected to ${identifier.channel}`)
          callbacks.connected?.()
        },
        disconnected: () => {
          console.log(`Disconnected from ${identifier.channel}`)
          callbacks.disconnected?.()
        },
        rejected: () => {
          console.error(`Subscription rejected for ${identifier.channel}`)
          callbacks.rejected?.()
        },
        received: (data: any) => {
          callbacks.received?.(data)
        },
        // Add any custom methods from callbacks
        ...Object.keys(callbacks)
          .filter(key => !['received', 'connected', 'disconnected', 'rejected'].includes(key))
          .reduce((acc, key) => {
            acc[key] = callbacks[key]
            return acc
          }, {} as any)
      })

      // Store subscription
      this.subscriptions.set(key, subscription)

      return subscription
    } catch (error) {
      console.error(`Failed to subscribe to ${identifier.channel}:`, error)
      return null
    }
  }

  // Unsubscribe from a channel
  unsubscribe(identifier: ChannelIdentifier): void {
    const key = this.getSubscriptionKey(identifier)
    const subscription = this.subscriptions.get(key)

    if (!subscription) {
      console.warn(`No subscription found for ${key}`)
      return
    }

    subscription.unsubscribe()
    this.subscriptions.delete(key)
    console.log(`Unsubscribed from ${key}`)
  }

  // Perform action on a channel
  perform(
    identifier: ChannelIdentifier,
    action: string,
    data: any = {}
  ): void {
    const key = this.getSubscriptionKey(identifier)
    const subscription = this.subscriptions.get(key)

    if (!subscription) {
      console.error(`No subscription found for ${key}`)
      return
    }

    try {
      subscription.perform(action, data)
    } catch (error) {
      console.error(`Failed to perform action ${action} on ${key}:`, error)
    }
  }

  // Send data to a channel
  send(identifier: ChannelIdentifier, data: any): void {
    const key = this.getSubscriptionKey(identifier)
    const subscription = this.subscriptions.get(key)

    if (!subscription) {
      console.error(`No subscription found for ${key}`)
      return
    }

    try {
      subscription.send(data)
    } catch (error) {
      console.error(`Failed to send data to ${key}:`, error)
    }
  }

  // Get subscription by identifier
  getSubscription(identifier: ChannelIdentifier): Subscription | undefined {
    const key = this.getSubscriptionKey(identifier)
    return this.subscriptions.get(key)
  }

  // Check if subscribed to a channel
  isSubscribed(identifier: ChannelIdentifier): boolean {
    const key = this.getSubscriptionKey(identifier)
    return this.subscriptions.has(key)
  }

  // Monitor connection state
  private monitorConnection(): void {
    if (!this.consumer) return

    // Check connection periodically
    const checkConnection = () => {
      if (!this.consumer) return

      // Action Cable doesn't provide direct connection state
      // We'll monitor through subscription callbacks
      const wasConnected = this.isConnected
      this.isConnected = this.subscriptions.size > 0 &&
                        Array.from(this.subscriptions.values()).some(sub =>
                          (sub as any).consumer?.connection?.isOpen()
                        )

      if (wasConnected !== this.isConnected) {
        this.notifyConnectionHandlers(this.isConnected)
      }
    }

    // Check every 5 seconds
    setInterval(checkConnection, 5000)
  }

  // Register connection state handler
  onConnectionChange(handler: (connected: boolean) => void): () => void {
    this.connectionHandlers.add(handler)

    // Immediately notify current state
    handler(this.isConnected)

    // Return unsubscribe function
    return () => {
      this.connectionHandlers.delete(handler)
    }
  }

  // Notify connection handlers
  private notifyConnectionHandlers(connected: boolean): void {
    this.connectionHandlers.forEach(handler => {
      try {
        handler(connected)
      } catch (error) {
        console.error('Error in connection handler:', error)
      }
    })
  }

  // Generate subscription key
  private getSubscriptionKey(identifier: ChannelIdentifier): string {
    const params = Object.keys(identifier)
      .sort()
      .map(key => `${key}:${identifier[key]}`)
      .join('|')
    return params
  }

  // Reconnect with fresh token
  async reconnect(): Promise<void> {
    this.disconnect()

    // Wait a bit before reconnecting
    await new Promise(resolve => setTimeout(resolve, 1000))

    this.connect()
  }

  // Get consumer instance (for advanced usage)
  getConsumer(): Consumer | null {
    return this.consumer
  }

  // Check if connected
  get connected(): boolean {
    return this.isConnected
  }
}

// Export singleton instance
export const actionCableService = new ActionCableService()

// Export types
export type { Consumer, Subscription, Channel }
export { ActionCableService }