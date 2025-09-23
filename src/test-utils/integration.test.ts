/**
 * Integration test to verify all testing utilities are properly configured
 */

import { MockApiClient } from './apiMocks'
import { MockWebSocket, createMockActionCable, installWebSocketMocks } from './websocketMocks'
import { renderWithProviders, mockLocalStorage, mockNotificationAPI } from './testHelpers'

describe('Testing Utilities Integration', () => {
  test('API mocking utilities are available', () => {
    const apiClient = new MockApiClient()
    expect(apiClient).toBeDefined()
    expect(apiClient.setupSuccessfulAuth).toBeDefined()
    expect(apiClient.setCustomResponse).toBeDefined()
    apiClient.reset()
  })

  test('WebSocket mocking utilities are available', () => {
    const ws = new MockWebSocket('ws://test')
    expect(ws).toBeDefined()
    expect(ws.simulateMessage).toBeDefined()
    expect(ws.simulateOpen).toBeDefined()

    const actionCable = createMockActionCable()
    expect(actionCable).toBeDefined()
    expect(actionCable.consumer).toBeDefined()
  })

  test('Test helpers are available', () => {
    expect(renderWithProviders).toBeDefined()
    expect(mockLocalStorage).toBeDefined()
    expect(mockNotificationAPI).toBeDefined()
  })

  test('WebSocket can be installed globally', () => {
    // Save original WebSocket if it exists
    const originalWebSocket = (global as any).WebSocket

    // Install mocks
    const cleanup = installWebSocketMocks()
    expect((global as any).WebSocket).toBeDefined()

    // Test that new WebSocket instances use our mock
    const ws = new (global as any).WebSocket('ws://test')
    expect(ws).toBeInstanceOf(MockWebSocket)

    // Cleanup
    cleanup()

    // Restore original if it existed
    if (originalWebSocket) {
      (global as any).WebSocket = originalWebSocket
    }
  })

  test('LocalStorage mock works', () => {
    const localStorage = mockLocalStorage()

    localStorage.setItem('test', 'value')
    expect(localStorage.setItem).toHaveBeenCalledWith('test', 'value')
    expect(localStorage.getItem('test')).toBe('value')
  })

  test('Notification API mock works', () => {
    const notificationAPI = mockNotificationAPI()

    expect(window.Notification).toBeDefined()
    expect(window.Notification.permission).toBe('granted')
    expect(window.Notification.requestPermission).toBeDefined()
  })
})