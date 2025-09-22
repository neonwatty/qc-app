import { renderHook, act, waitFor } from '@testing-library/react'
import { useNotifications, useNotificationBadge, useNotificationPermissions } from '../useNotifications'
import { mockLocalStorage, mockNotificationAPI, generateMockNotification } from '@/test-utils/testHelpers'

// Mock the Action Cable hook
jest.mock('../useActionCable', () => ({
  useNotificationChannel: jest.fn(() => ({
    isSubscribed: true,
    notifications: [],
    unreadCount: 0,
    markAsRead: jest.fn(),
    clearAll: jest.fn(),
  })),
}))

describe('useNotifications', () => {
  let localStorageMock: ReturnType<typeof mockLocalStorage>
  let notificationMock: ReturnType<typeof mockNotificationAPI>

  beforeEach(() => {
    localStorageMock = mockLocalStorage()
    notificationMock = mockNotificationAPI()

    // Mock audio
    global.Audio = jest.fn().mockImplementation(() => ({
      play: jest.fn().mockResolvedValue(undefined),
      pause: jest.fn(),
      volume: 0.5,
    })) as any
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Basic functionality', () => {
    it('should initialize with empty notifications', () => {
      const { result } = renderHook(() => useNotifications())

      expect(result.current.notifications).toEqual([])
      expect(result.current.unreadCount).toBe(0)
      expect(result.current.hasUnread).toBe(false)
    })

    it('should add test notification', () => {
      const { result } = renderHook(() => useNotifications())

      act(() => {
        result.current.sendTestNotification()
      })

      expect(result.current.notifications).toHaveLength(1)
      expect(result.current.notifications[0].title).toBe('Test Notification')
      expect(result.current.unreadCount).toBe(1)
      expect(result.current.hasUnread).toBe(true)
    })

    it('should mark notification as read', () => {
      const { result } = renderHook(() => useNotifications())

      act(() => {
        result.current.sendTestNotification()
      })

      const notificationId = result.current.notifications[0].id

      act(() => {
        result.current.markAsRead(notificationId)
      })

      expect(result.current.notifications[0].read).toBe(true)
      expect(result.current.unreadCount).toBe(0)
    })

    it('should mark all notifications as read', () => {
      const { result } = renderHook(() => useNotifications())

      act(() => {
        result.current.sendTestNotification()
        result.current.sendTestNotification()
        result.current.sendTestNotification()
      })

      expect(result.current.unreadCount).toBe(3)

      act(() => {
        result.current.markAllAsRead()
      })

      expect(result.current.unreadCount).toBe(0)
      result.current.notifications.forEach(n => {
        expect(n.read).toBe(true)
      })
    })

    it('should delete notification', () => {
      const { result } = renderHook(() => useNotifications())

      act(() => {
        result.current.sendTestNotification()
      })

      const notificationId = result.current.notifications[0].id

      act(() => {
        result.current.deleteNotification(notificationId)
      })

      expect(result.current.notifications).toHaveLength(0)
    })

    it('should clear all notifications', () => {
      const { result } = renderHook(() => useNotifications())

      act(() => {
        result.current.sendTestNotification()
        result.current.sendTestNotification()
        result.current.sendTestNotification()
      })

      act(() => {
        result.current.clearAll()
      })

      expect(result.current.notifications).toHaveLength(0)
    })
  })

  describe('Preferences', () => {
    it('should update preferences', () => {
      const { result } = renderHook(() => useNotifications())

      act(() => {
        result.current.updatePreferences({ soundEnabled: false })
      })

      expect(result.current.preferences.soundEnabled).toBe(false)
    })

    it('should persist preferences to localStorage', () => {
      const { result } = renderHook(() => useNotifications())

      act(() => {
        result.current.updatePreferences({ desktopEnabled: true })
      })

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'notification-preferences',
        expect.stringContaining('"desktopEnabled":true')
      )
    })

    it('should load preferences from localStorage', () => {
      const savedPreferences = {
        enabled: true,
        soundEnabled: false,
        vibrationEnabled: true,
        desktopEnabled: true,
        types: {
          reminder: true,
          request: true,
          milestone: false,
          checkin: true,
          system: true,
        },
      }

      localStorageMock.getItem.mockReturnValue(JSON.stringify(savedPreferences))

      const { result } = renderHook(() => useNotifications())

      expect(result.current.preferences.soundEnabled).toBe(false)
      expect(result.current.preferences.types.milestone).toBe(false)
    })
  })

  describe('Notifications with options', () => {
    it('should call onNotification callback', () => {
      const onNotification = jest.fn()
      const { result } = renderHook(() =>
        useNotifications({ onNotification })
      )

      act(() => {
        result.current.sendTestNotification()
      })

      expect(onNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Notification',
        })
      )
    })

    it('should play sound when enabled', () => {
      const audioMock = { play: jest.fn().mockResolvedValue(undefined), volume: 0.5 }
      global.Audio = jest.fn().mockImplementation(() => audioMock) as any

      const { result } = renderHook(() =>
        useNotifications({ playSound: true })
      )

      act(() => {
        result.current.sendTestNotification()
      })

      expect(audioMock.play).toHaveBeenCalled()
    })

    it('should not play sound when disabled', () => {
      const audioMock = { play: jest.fn(), volume: 0.5 }
      global.Audio = jest.fn().mockImplementation(() => audioMock) as any

      const { result } = renderHook(() =>
        useNotifications({ playSound: false })
      )

      act(() => {
        result.current.sendTestNotification()
      })

      expect(audioMock.play).not.toHaveBeenCalled()
    })

    it('should respect max notifications limit', () => {
      const { result } = renderHook(() =>
        useNotifications({ maxNotifications: 2 })
      )

      act(() => {
        result.current.sendTestNotification()
        result.current.sendTestNotification()
        result.current.sendTestNotification()
      })

      expect(result.current.notifications).toHaveLength(2)
    })
  })

  describe('Desktop notifications', () => {
    it('should request desktop notification permission', async () => {
      const { result } = renderHook(() =>
        useNotifications({ showDesktop: true })
      )

      act(() => {
        result.current.updatePreferences({ desktopEnabled: true })
      })

      await waitFor(() => {
        expect(window.Notification.requestPermission).toHaveBeenCalled()
      })
    })

    it('should show desktop notification when enabled', async () => {
      const { result } = renderHook(() =>
        useNotifications({ showDesktop: true })
      )

      act(() => {
        result.current.updatePreferences({ desktopEnabled: true })
      })

      // Wait for the preference update to take effect
      await waitFor(() => {
        expect(result.current.preferences.desktopEnabled).toBe(true)
      })

      act(() => {
        result.current.sendTestNotification()
      })

      await waitFor(() => {
        expect(window.Notification).toHaveBeenCalledWith(
          'Test Notification',
          expect.objectContaining({
            body: 'This is a test notification to verify your settings',
          })
        )
      })
    })

    it('should not show desktop notification when disabled', () => {
      const { result } = renderHook(() =>
        useNotifications({ showDesktop: false })
      )

      act(() => {
        result.current.sendTestNotification()
      })

      expect(window.Notification).not.toHaveBeenCalled()
    })
  })
})

describe('useNotificationBadge', () => {
  beforeEach(() => {
    mockLocalStorage()
    mockNotificationAPI()
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should update document title with unread count', () => {
    // Mock the action cable hook to return notifications
    const mockUseNotificationChannel = require('../useActionCable').useNotificationChannel
    mockUseNotificationChannel.mockReturnValue({
      isSubscribed: true,
      notifications: [
        generateMockNotification({ read: false }),
        generateMockNotification({ read: false }),
        generateMockNotification({ read: false }),
        generateMockNotification({ read: false }),
        generateMockNotification({ read: false }),
      ],
      unreadCount: 5,
      markAsRead: jest.fn(),
      clearAll: jest.fn(),
    })

    renderHook(() => useNotificationBadge())

    expect(document.title).toBe('(5) Quality Control')
  })

  it('should reset document title when no unread', () => {
    document.title = '(5) Quality Control'

    // Mock the action cable hook to return no unread notifications
    const mockUseNotificationChannel = require('../useActionCable').useNotificationChannel
    mockUseNotificationChannel.mockReturnValue({
      isSubscribed: true,
      notifications: [],
      unreadCount: 0,
      markAsRead: jest.fn(),
      clearAll: jest.fn(),
    })

    renderHook(() => useNotificationBadge())

    expect(document.title).toBe('Quality Control')
  })
})

describe('useNotificationPermissions', () => {
  beforeEach(() => {
    mockNotificationAPI()
  })

  it('should return current permission status', () => {
    const { result } = renderHook(() => useNotificationPermissions())

    expect(result.current.permission).toBe('granted')
  })

  it('should request permission', async () => {
    const { result } = renderHook(() => useNotificationPermissions())

    let permissionResult: NotificationPermission = 'default'

    await act(async () => {
      permissionResult = await result.current.requestPermission()
    })

    expect(window.Notification.requestPermission).toHaveBeenCalled()
    expect(permissionResult).toBe('granted')
  })
})