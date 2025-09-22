import React, { ReactElement, ReactNode } from 'react'
import { render as rtlRender, RenderOptions } from '@testing-library/react'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { AuthProvider } from '@/contexts/AuthContext'

// Mock WebSocket for tests
export class MockWebSocket {
  url: string
  readyState: number = WebSocket.CONNECTING
  onopen: ((event: Event) => void) | null = null
  onmessage: ((event: MessageEvent) => void) | null = null
  onerror: ((event: Event) => void) | null = null
  onclose: ((event: CloseEvent) => void) | null = null

  constructor(url: string) {
    this.url = url
    setTimeout(() => this.simulateOpen(), 0)
  }

  simulateOpen() {
    this.readyState = WebSocket.OPEN
    if (this.onopen) {
      this.onopen(new Event('open'))
    }
  }

  simulateMessage(data: any) {
    if (this.onmessage) {
      this.onmessage(new MessageEvent('message', { data: JSON.stringify(data) }))
    }
  }

  simulateError(error?: any) {
    this.readyState = WebSocket.CLOSED
    if (this.onerror) {
      this.onerror(new Event('error'))
    }
  }

  simulateClose(code = 1000, reason = '') {
    this.readyState = WebSocket.CLOSED
    if (this.onclose) {
      this.onclose(new CloseEvent('close', { code, reason }))
    }
  }

  send(data: any) {
    // Mock send - could emit events for testing
  }

  close() {
    this.simulateClose()
  }
}

// Mock Action Cable
export const mockActionCable = {
  createConsumer: jest.fn(() => ({
    subscriptions: {
      create: jest.fn((channel: any, callbacks: any) => ({
        perform: jest.fn(),
        send: jest.fn(),
        unsubscribe: jest.fn(),
      })),
    },
    connect: jest.fn(),
    disconnect: jest.fn(),
  })),
}

// Mock notification API
export const mockNotificationAPI = () => {
  const notificationMock = {
    permission: 'granted' as NotificationPermission,
    requestPermission: jest.fn().mockResolvedValue('granted' as NotificationPermission),
  }

  Object.defineProperty(window, 'Notification', {
    writable: true,
    value: jest.fn().mockImplementation(() => ({
      close: jest.fn(),
      addEventListener: jest.fn(),
    })),
  })

  Object.defineProperty(window.Notification, 'permission', {
    get: () => notificationMock.permission,
  })

  Object.defineProperty(window.Notification, 'requestPermission', {
    value: notificationMock.requestPermission,
  })

  return notificationMock
}

// Mock localStorage
export const mockLocalStorage = () => {
  const store: { [key: string]: string } = {}

  const localStorageMock = {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key]
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key])
    }),
  }

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
  })

  return localStorageMock
}

// Custom render function with providers
interface AllTheProvidersProps {
  children: ReactNode
}

function AllTheProviders({ children }: AllTheProvidersProps) {
  return (
    <ThemeProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </ThemeProvider>
  )
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return rtlRender(ui, { wrapper: AllTheProviders, ...options })
}

// Test data generators
export const generateMockNotification = (overrides?: Partial<any>) => ({
  id: `notification-${Date.now()}`,
  type: 'reminder',
  title: 'Test Notification',
  message: 'This is a test notification',
  priority: 'medium',
  timestamp: new Date(),
  read: false,
  ...overrides,
})

export const generateMockSession = (overrides?: Partial<any>) => ({
  id: `session-${Date.now()}`,
  userId: 'user-1',
  partnerId: 'partner-1',
  status: 'active',
  startedAt: new Date(),
  categories: [],
  notes: [],
  ...overrides,
})

// Async utilities
export const waitForAsync = (ms = 0) =>
  new Promise(resolve => setTimeout(resolve, ms))

// Mock timers helper
export const useFakeTimers = () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  return {
    advanceTime: (ms: number) => jest.advanceTimersByTime(ms),
    runAllTimers: () => jest.runAllTimers(),
    runPendingTimers: () => jest.runOnlyPendingTimers(),
  }
}

// Export everything from testing library for convenience
export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'