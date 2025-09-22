import { createConsumer } from '@rails/actioncable'
import type { Consumer, Subscription } from '@rails/actioncable'

// WebSocket Configuration
const CABLE_URL = import.meta.env.VITE_CABLE_URL || 'ws://localhost:3000/cable'
const ENABLE_WEBSOCKETS = import.meta.env.VITE_ENABLE_WEBSOCKETS === 'true'

// Action Cable Consumer
let consumer: Consumer | null = null

// Initialize WebSocket connection
export const initWebSocket = (token?: string): Consumer | null => {
  if (!ENABLE_WEBSOCKETS) {
    console.warn('WebSockets are disabled')
    return null
  }

  if (!consumer) {
    const url = token ? `${CABLE_URL}?token=${token}` : CABLE_URL
    consumer = createConsumer(url)
  }

  return consumer
}

// Disconnect WebSocket
export const disconnectWebSocket = (): void => {
  if (consumer) {
    consumer.disconnect()
    consumer = null
  }
}

// Subscribe to a channel
interface ChannelCallbacks {
  connected?: () => void
  disconnected?: () => void
  received?: (data: unknown) => void
  rejected?: () => void
}

export const subscribeToChannel = (
  channelName: string,
  params: Record<string, unknown> = {},
  callbacks: ChannelCallbacks = {}
): Subscription | null => {
  if (!consumer) {
    console.error('WebSocket consumer not initialized')
    return null
  }

  return consumer.subscriptions.create(
    { channel: channelName, ...params },
    {
      connected: callbacks.connected || (() => {}),
      disconnected: callbacks.disconnected || (() => {}),
      received: callbacks.received || ((data: unknown) => console.log('Received:', data)),
      rejected: callbacks.rejected || (() => console.error('Subscription rejected')),
    }
  )
}

// Unsubscribe from a channel
export const unsubscribeFromChannel = (subscription: Subscription): void => {
  if (subscription) {
    subscription.unsubscribe()
  }
}

// Channel-specific subscriptions
export const channels = {
  // Presence Channel
  presence: (coupleId: number, callbacks: ChannelCallbacks) =>
    subscribeToChannel('PresenceChannel', { couple_id: coupleId }, callbacks),

  // Notification Channel
  notifications: (userId: number, callbacks: ChannelCallbacks) =>
    subscribeToChannel('NotificationChannel', { user_id: userId }, callbacks),

  // CheckIn Channel
  checkIn: (sessionId: number, callbacks: ChannelCallbacks) =>
    subscribeToChannel('CheckInChannel', { session_id: sessionId }, callbacks),
}

// Export consumer for direct access if needed
export const getConsumer = (): Consumer | null => consumer
