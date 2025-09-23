/**
 * WebSocket and Action Cable Mocking Utilities for Testing
 * Provides comprehensive WebSocket and real-time communication mocks
 */

import { EventEmitter } from 'events'

// WebSocket states
export enum WS_STATES {
  CONNECTING = 0,
  OPEN = 1,
  CLOSING = 2,
  CLOSED = 3,
}

// WebSocket close codes
export const WS_CLOSE_CODES = {
  NORMAL: 1000,
  GOING_AWAY: 1001,
  PROTOCOL_ERROR: 1002,
  UNSUPPORTED_DATA: 1003,
  ABNORMAL_CLOSURE: 1006,
  INVALID_PAYLOAD: 1007,
  POLICY_VIOLATION: 1008,
  MESSAGE_TOO_BIG: 1009,
  MISSING_EXTENSION: 1010,
  INTERNAL_ERROR: 1011,
}

// Enhanced MockWebSocket class
export class MockWebSocket extends EventEmitter {
  public url: string
  public readyState: number = WS_STATES.CONNECTING
  public protocol: string = ''
  public binaryType: 'blob' | 'arraybuffer' = 'blob'

  // Event handlers
  public onopen: ((event: Event) => void) | null = null
  public onmessage: ((event: MessageEvent) => void) | null = null
  public onerror: ((event: Event) => void) | null = null
  public onclose: ((event: CloseEvent) => void) | null = null

  // Message queue for testing
  private messageQueue: any[] = []
  private autoResponses: Map<string, any> = new Map()

  constructor(url: string, protocols?: string | string[]) {
    super()
    this.url = url

    if (protocols) {
      this.protocol = Array.isArray(protocols) ? protocols[0] : protocols
    }

    // Auto-connect after construction
    setTimeout(() => this.simulateOpen(), 0)
  }

  // Simulate connection open
  simulateOpen() {
    this.readyState = WS_STATES.OPEN
    const event = new Event('open')

    if (this.onopen) {
      this.onopen(event)
    }
    this.emit('open', event)
  }

  // Simulate receiving a message
  simulateMessage(data: any) {
    if (this.readyState !== WS_STATES.OPEN) {
      throw new Error('WebSocket is not open')
    }

    const messageData = typeof data === 'string' ? data : JSON.stringify(data)
    const event = new MessageEvent('message', { data: messageData })

    this.messageQueue.push(data)

    if (this.onmessage) {
      this.onmessage(event)
    }
    this.emit('message', event)

    // Check for auto-responses
    this.checkAutoResponses(data)
  }

  // Simulate an error
  simulateError(error?: any) {
    const event = new Event('error')

    if (this.onerror) {
      this.onerror(event)
    }
    this.emit('error', event)
  }

  // Simulate connection close
  simulateClose(code = WS_CLOSE_CODES.NORMAL, reason = 'Normal closure') {
    this.readyState = WS_STATES.CLOSED
    const event = new CloseEvent('close', { code, reason, wasClean: code === WS_CLOSE_CODES.NORMAL })

    if (this.onclose) {
      this.onclose(event)
    }
    this.emit('close', event)
  }

  // Send data (mock implementation)
  send(data: string | ArrayBuffer | Blob) {
    if (this.readyState !== WS_STATES.OPEN) {
      throw new Error('WebSocket is not open')
    }

    const parsedData = typeof data === 'string' ? JSON.parse(data) : data
    this.emit('send', parsedData)

    // Trigger auto-responses if configured
    this.checkAutoResponses(parsedData)
  }

  // Close connection
  close(code?: number, reason?: string) {
    this.readyState = WS_STATES.CLOSING
    setTimeout(() => {
      this.simulateClose(code || WS_CLOSE_CODES.NORMAL, reason)
    }, 0)
  }

  // Test utilities
  setAutoResponse(trigger: any, response: any) {
    const triggerKey = JSON.stringify(trigger)
    this.autoResponses.set(triggerKey, response)
  }

  private checkAutoResponses(data: any) {
    const dataKey = JSON.stringify(data)

    if (this.autoResponses.has(dataKey)) {
      const response = this.autoResponses.get(dataKey)
      setTimeout(() => this.simulateMessage(response), 10)
    }
  }

  getMessageHistory() {
    return [...this.messageQueue]
  }

  clearMessageHistory() {
    this.messageQueue = []
  }
}

// Action Cable Mock
export interface MockSubscription {
  identifier: string
  perform: jest.Mock
  send: jest.Mock
  unsubscribe: jest.Mock
  received?: (data: any) => void
  connected?: () => void
  disconnected?: () => void
  rejected?: () => void
}

export class MockActionCableConsumer {
  public subscriptions: Map<string, MockSubscription> = new Map()
  public connected: boolean = false
  private eventEmitter: EventEmitter = new EventEmitter()

  connect() {
    this.connected = true
    this.eventEmitter.emit('connected')

    // Notify all subscriptions
    this.subscriptions.forEach(sub => {
      if (sub.connected) sub.connected()
    })
  }

  disconnect() {
    this.connected = false
    this.eventEmitter.emit('disconnected')

    // Notify all subscriptions
    this.subscriptions.forEach(sub => {
      if (sub.disconnected) sub.disconnected()
    })
  }

  createSubscription(channel: any, callbacks?: any): MockSubscription {
    const identifier = typeof channel === 'string' ? channel : JSON.stringify(channel)

    const subscription: MockSubscription = {
      identifier,
      perform: jest.fn((action: string, data?: any) => {
        this.eventEmitter.emit('perform', { identifier, action, data })
      }),
      send: jest.fn((data: any) => {
        this.eventEmitter.emit('send', { identifier, data })
      }),
      unsubscribe: jest.fn(() => {
        this.subscriptions.delete(identifier)
      }),
      ...callbacks,
    }

    this.subscriptions.set(identifier, subscription)

    if (this.connected && subscription.connected) {
      setTimeout(() => subscription.connected!(), 0)
    }

    return subscription
  }

  // Simulate receiving data on a channel
  simulateReceive(channelIdentifier: string, data: any) {
    const subscription = this.subscriptions.get(channelIdentifier)

    if (subscription?.received) {
      subscription.received(data)
    }
  }

  // Simulate rejection of a subscription
  simulateRejection(channelIdentifier: string) {
    const subscription = this.subscriptions.get(channelIdentifier)

    if (subscription?.rejected) {
      subscription.rejected()
    }
  }

  // Test utility methods
  on(event: string, handler: (...args: any[]) => void) {
    this.eventEmitter.on(event, handler)
  }

  getSubscription(channelIdentifier: string): MockSubscription | undefined {
    return this.subscriptions.get(channelIdentifier)
  }

  getAllSubscriptions(): MockSubscription[] {
    return Array.from(this.subscriptions.values())
  }

  clearSubscriptions() {
    this.subscriptions.clear()
  }
}

// Factory for creating mock Action Cable
export const createMockActionCable = () => {
  const consumer = new MockActionCableConsumer()

  return {
    createConsumer: jest.fn(() => ({
      subscriptions: {
        create: jest.fn((channel: any, callbacks: any) =>
          consumer.createSubscription(channel, callbacks)
        ),
      },
      connect: jest.fn(() => consumer.connect()),
      disconnect: jest.fn(() => consumer.disconnect()),
    })),
    consumer,
  }
}

// Mock WebSocket server for testing
export class MockWebSocketServer {
  private clients: Set<MockWebSocket> = new Set()
  private messageHandlers: Map<string, (ws: MockWebSocket, data: any) => void> = new Map()

  // Add a client connection
  addClient(ws: MockWebSocket) {
    this.clients.add(ws)

    ws.on('send', (data) => {
      this.handleClientMessage(ws, data)
    })

    ws.on('close', () => {
      this.clients.delete(ws)
    })
  }

  // Register message handler
  onMessage(type: string, handler: (ws: MockWebSocket, data: any) => void) {
    this.messageHandlers.set(type, handler)
  }

  // Handle incoming message from client
  private handleClientMessage(ws: MockWebSocket, data: any) {
    const messageType = data.type || data.action || 'default'
    const handler = this.messageHandlers.get(messageType)

    if (handler) {
      handler(ws, data)
    }
  }

  // Broadcast to all clients
  broadcast(data: any) {
    this.clients.forEach(ws => {
      if (ws.readyState === WS_STATES.OPEN) {
        ws.simulateMessage(data)
      }
    })
  }

  // Broadcast to all except sender
  broadcastExcept(sender: MockWebSocket, data: any) {
    this.clients.forEach(ws => {
      if (ws !== sender && ws.readyState === WS_STATES.OPEN) {
        ws.simulateMessage(data)
      }
    })
  }

  // Get all connected clients
  getClients() {
    return Array.from(this.clients)
  }

  // Disconnect all clients
  disconnectAll(code?: number, reason?: string) {
    this.clients.forEach(ws => {
      ws.simulateClose(code || WS_CLOSE_CODES.NORMAL, reason || 'Server shutdown')
    })
    this.clients.clear()
  }
}

// Helper to install WebSocket mocks globally
export const installWebSocketMocks = () => {
  // Store original WebSocket if it exists (avoiding direct access that might trigger constructor)
  let originalWebSocket: any
  try {
    originalWebSocket = (global as any).WebSocket
  } catch (e) {
    // WebSocket doesn't exist or can't be accessed
    originalWebSocket = undefined
  }

  // Install our mock
  (global as any).WebSocket = MockWebSocket

  // Return cleanup function
  return () => {
    if (originalWebSocket !== undefined) {
      (global as any).WebSocket = originalWebSocket
    } else {
      delete (global as any).WebSocket
    }
  }
}

// Common WebSocket test scenarios
export const wsTestScenarios = {
  // Connection failure scenario
  connectionFailure: (ws: MockWebSocket) => {
    ws.simulateError()
    ws.simulateClose(WS_CLOSE_CODES.ABNORMAL_CLOSURE, 'Connection failed')
  },

  // Intermittent connection scenario
  intermittentConnection: async (ws: MockWebSocket) => {
    ws.simulateOpen()
    await new Promise(resolve => setTimeout(resolve, 100))
    ws.simulateClose(WS_CLOSE_CODES.GOING_AWAY, 'Connection lost')
    await new Promise(resolve => setTimeout(resolve, 100))
    ws.simulateOpen()
  },

  // Heartbeat/ping-pong scenario
  heartbeat: (ws: MockWebSocket, interval = 30000) => {
    const pingInterval = setInterval(() => {
      if (ws.readyState === WS_STATES.OPEN) {
        ws.simulateMessage({ type: 'ping' })
      } else {
        clearInterval(pingInterval)
      }
    }, interval)

    return () => clearInterval(pingInterval)
  },

  // Rate limiting scenario
  rateLimiting: (ws: MockWebSocket, maxMessages = 10, windowMs = 1000) => {
    let messageCount = 0
    let windowStart = Date.now()

    ws.on('send', () => {
      const now = Date.now()

      if (now - windowStart > windowMs) {
        messageCount = 0
        windowStart = now
      }

      messageCount++

      if (messageCount > maxMessages) {
        ws.simulateClose(WS_CLOSE_CODES.POLICY_VIOLATION, 'Rate limit exceeded')
      }
    })
  },
}

// Export all for convenience
export default {
  MockWebSocket,
  MockActionCableConsumer,
  MockWebSocketServer,
  createMockActionCable,
  installWebSocketMocks,
  wsTestScenarios,
  WS_STATES,
  WS_CLOSE_CODES,
}