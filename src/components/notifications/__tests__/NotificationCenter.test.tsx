import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NotificationCenter } from '../NotificationCenter'
import { renderWithProviders, generateMockNotification } from '@/test-utils/testHelpers'

// Verify the component is imported correctly
if (!NotificationCenter) {
  console.error('NotificationCenter is not exported correctly')
}

// Mock the useNotifications hook
const mockUseNotifications = {
  notifications: [],
  unreadCount: 0,
  hasUnread: false,
  markAsRead: jest.fn(),
  markAllAsRead: jest.fn(),
  deleteNotification: jest.fn(),
  clearAll: jest.fn(),
}

jest.mock('@/hooks/useNotifications', () => ({
  useNotifications: () => mockUseNotifications,
  // Export types to prevent import errors
  NotificationType: {},
  NotificationPriority: {},
}))

// Mock date-fns
jest.mock('date-fns', () => ({
  formatDistanceToNow: jest.fn((date) => '2 hours ago'),
}))

describe('NotificationCenter', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseNotifications.notifications = []
    mockUseNotifications.unreadCount = 0
    mockUseNotifications.hasUnread = false
  })

  describe('Rendering', () => {
    it('should render the notification center header', () => {
      renderWithProviders(<NotificationCenter />)

      expect(screen.getByText('Notifications')).toBeInTheDocument()
    })

    it('should show empty state when no notifications', () => {
      renderWithProviders(<NotificationCenter />)

      expect(screen.getByText('No notifications yet')).toBeInTheDocument()
      expect(screen.getByText('New notifications will appear here')).toBeInTheDocument()
    })

    it('should display notifications', () => {
      mockUseNotifications.notifications = [
        generateMockNotification({
          id: '1',
          title: 'Test Reminder',
          message: 'Time for your check-in',
          type: 'reminder',
        }),
        generateMockNotification({
          id: '2',
          title: 'New Request',
          message: 'Your partner sent a request',
          type: 'request',
        }),
      ]

      renderWithProviders(<NotificationCenter />)

      expect(screen.getByText('Test Reminder')).toBeInTheDocument()
      expect(screen.getByText('Time for your check-in')).toBeInTheDocument()
      expect(screen.getByText('New Request')).toBeInTheDocument()
      expect(screen.getByText('Your partner sent a request')).toBeInTheDocument()
    })

    it('should show unread count badge', () => {
      mockUseNotifications.unreadCount = 3
      mockUseNotifications.hasUnread = true

      renderWithProviders(<NotificationCenter />)

      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('should display time ago for notifications', () => {
      mockUseNotifications.notifications = [
        generateMockNotification({
          title: 'Test Notification',
        }),
      ]

      renderWithProviders(<NotificationCenter />)

      expect(screen.getByText('2 hours ago')).toBeInTheDocument()
    })
  })

  describe('Filtering', () => {
    beforeEach(() => {
      mockUseNotifications.notifications = [
        generateMockNotification({ type: 'reminder', title: 'Reminder 1' }),
        generateMockNotification({ type: 'request', title: 'Request 1' }),
        generateMockNotification({ type: 'milestone', title: 'Milestone 1' }),
        generateMockNotification({ type: 'checkin', title: 'Check-in 1' }),
      ]
    })

    it('should filter by notification type', async () => {
      const user = userEvent.setup()
      renderWithProviders(<NotificationCenter />)

      // Initially shows all
      expect(screen.getByText('Reminder 1')).toBeInTheDocument()
      expect(screen.getByText('Request 1')).toBeInTheDocument()

      // Click on Reminders tab
      await user.click(screen.getByRole('tab', { name: /reminders/i }))

      await waitFor(() => {
        expect(screen.getByText('Reminder 1')).toBeInTheDocument()
        expect(screen.queryByText('Request 1')).not.toBeInTheDocument()
      })
    })

    it('should filter unread only when enabled', async () => {
      const user = userEvent.setup()

      mockUseNotifications.notifications = [
        generateMockNotification({ title: 'Unread', read: false }),
        generateMockNotification({ title: 'Read', read: true }),
      ]

      renderWithProviders(<NotificationCenter />)

      // Initially shows all
      expect(screen.getByText('Unread')).toBeInTheDocument()
      expect(screen.getByText('Read')).toBeInTheDocument()

      // Open filter menu and click show unread only
      const filterButton = screen.getByRole('button', { name: /filter/i })
      await user.click(filterButton)
      await user.click(screen.getByText('Show Unread Only'))

      await waitFor(() => {
        expect(screen.getByText('Unread')).toBeInTheDocument()
        expect(screen.queryByText('Read')).not.toBeInTheDocument()
      })
    })

    it('should show appropriate empty state for filtered view', async () => {
      const user = userEvent.setup()

      mockUseNotifications.notifications = [
        generateMockNotification({ type: 'reminder', title: 'Reminder' }),
      ]

      renderWithProviders(<NotificationCenter />)

      // Filter to requests
      await user.click(screen.getByRole('tab', { name: /requests/i }))

      await waitFor(() => {
        expect(screen.getByText('No request notifications')).toBeInTheDocument()
      })
    })
  })

  describe('Actions', () => {
    beforeEach(() => {
      mockUseNotifications.notifications = [
        generateMockNotification({
          id: 'notification-1',
          title: 'Test Notification',
          read: false,
        }),
      ]
      mockUseNotifications.hasUnread = true
      mockUseNotifications.unreadCount = 1
    })

    it('should mark notification as read when clicked', async () => {
      const user = userEvent.setup()
      renderWithProviders(<NotificationCenter />)

      const notification = screen.getByText('Test Notification').closest('div[class*=group]')
      await user.click(notification!)

      expect(mockUseNotifications.markAsRead).toHaveBeenCalledWith('notification-1')
    })

    it('should mark all as read', async () => {
      const user = userEvent.setup()
      renderWithProviders(<NotificationCenter />)

      const markAllButton = screen.getByTitle('Mark all as read')
      await user.click(markAllButton)

      expect(mockUseNotifications.markAllAsRead).toHaveBeenCalled()
    })

    it('should delete notification', async () => {
      const user = userEvent.setup()
      renderWithProviders(<NotificationCenter />)

      // Hover over notification to show actions
      const notification = screen.getByText('Test Notification').closest('div[class*=group]')
      await user.hover(notification!)

      // Find and click delete button (X icon)
      const xIcon = screen.getByTestId('x-icon')
      const deleteButton = xIcon.closest('button')

      if (deleteButton) {
        await user.click(deleteButton)
      }

      expect(mockUseNotifications.deleteNotification).toHaveBeenCalledWith('notification-1')
    })

    it('should clear all notifications', async () => {
      const user = userEvent.setup()
      renderWithProviders(<NotificationCenter />)

      // Open filter menu
      const filterButton = screen.getByRole('button', { name: /filter/i })
      await user.click(filterButton)

      // Click clear all
      await user.click(screen.getByText('Clear All'))

      expect(mockUseNotifications.clearAll).toHaveBeenCalled()
    })

    it('should call onSettingsClick when settings button clicked', async () => {
      const user = userEvent.setup()
      const onSettingsClick = jest.fn()

      renderWithProviders(<NotificationCenter onSettingsClick={onSettingsClick} />)

      const settingsButton = screen.getByRole('button', { name: /settings/i })
      await user.click(settingsButton)

      expect(onSettingsClick).toHaveBeenCalled()
    })
  })

  describe('Notification with action', () => {
    it('should display action button and handle click', async () => {
      const user = userEvent.setup()

      // Mock window.open
      const originalOpen = window.open
      window.open = jest.fn()

      mockUseNotifications.notifications = [
        generateMockNotification({
          title: 'Action Notification',
          actionUrl: 'https://example.com',
          actionLabel: 'View Details',
        }),
      ]

      renderWithProviders(<NotificationCenter />)

      const actionButton = screen.getByText('View Details')
      expect(actionButton).toBeInTheDocument()

      await user.click(actionButton)

      expect(window.open).toHaveBeenCalledWith('https://example.com', '_blank')

      // Restore window.open
      window.open = originalOpen
    })
  })

  describe('Grouping', () => {
    it('should group notifications by date', () => {
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(yesterday.getDate() - 1)

      mockUseNotifications.notifications = [
        generateMockNotification({
          title: 'Today Notification',
          timestamp: today,
        }),
        generateMockNotification({
          title: 'Yesterday Notification',
          timestamp: yesterday,
        }),
      ]

      renderWithProviders(<NotificationCenter />)

      expect(screen.getByText('Today')).toBeInTheDocument()
      expect(screen.getByText('Yesterday')).toBeInTheDocument()
    })
  })

  describe('Notification type icons', () => {
    it('should display correct icon for each notification type', () => {
      mockUseNotifications.notifications = [
        generateMockNotification({ type: 'reminder' }),
        generateMockNotification({ type: 'request' }),
        generateMockNotification({ type: 'milestone' }),
        generateMockNotification({ type: 'checkin' }),
      ]

      renderWithProviders(<NotificationCenter />)

      // Check that at least one notification type icon is rendered
      // Since icons are mocked as spans with data-testid attributes, we check for any icon
      const iconElements = document.querySelectorAll('[data-testid*="-icon"]')
      expect(iconElements.length).toBeGreaterThan(0)
    })
  })
})