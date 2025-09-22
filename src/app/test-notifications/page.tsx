'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { NotificationCenter, NotificationToast, NotificationBadge } from '@/components/notifications'
import { useNotifications, useNotificationPermissions } from '@/hooks/useNotifications'
import { Bell, Send, Settings, TestTube } from 'lucide-react'

export default function TestNotificationsPage() {
  const [showToasts, setShowToasts] = useState(true)
  const [toastPosition, setToastPosition] = useState<'top-right' | 'bottom-right'>('top-right')

  const {
    notifications,
    unreadCount,
    preferences,
    sendTestNotification,
    updatePreferences,
    clearAll
  } = useNotifications()

  const { permission, requestPermission } = useNotificationPermissions()

  const sendCustomNotification = (type: string, priority: string) => {
    // This would normally come from the server via WebSocket
    // For testing, we'll use the sendTestNotification function
    sendTestNotification()
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Notification System Test</h1>

      {/* Toast Notifications */}
      {showToasts && <NotificationToast position={toastPosition} />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Total Notifications:</span>
              <Badge>{notifications.length}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Unread Count:</span>
              <Badge variant="destructive">{unreadCount}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Desktop Permission:</span>
              <Badge variant={permission === 'granted' ? 'default' : 'secondary'}>
                {permission}
              </Badge>
            </div>
            {permission !== 'granted' && (
              <Button onClick={requestPermission} className="w-full">
                Enable Desktop Notifications
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Test Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Test Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={sendTestNotification}
              className="w-full"
              variant="default"
            >
              <TestTube className="mr-2 h-4 w-4" />
              Send Test Notification
            </Button>

            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => sendCustomNotification('reminder', 'high')}
                size="sm"
                variant="outline"
              >
                Reminder
              </Button>
              <Button
                onClick={() => sendCustomNotification('request', 'medium')}
                size="sm"
                variant="outline"
              >
                Request
              </Button>
              <Button
                onClick={() => sendCustomNotification('milestone', 'low')}
                size="sm"
                variant="outline"
              >
                Milestone
              </Button>
              <Button
                onClick={() => sendCustomNotification('checkin', 'high')}
                size="sm"
                variant="outline"
              >
                Check-in
              </Button>
            </div>

            <Button
              onClick={clearAll}
              variant="destructive"
              className="w-full"
            >
              Clear All
            </Button>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={preferences.soundEnabled}
                onChange={(e) => updatePreferences({ soundEnabled: e.target.checked })}
              />
              <span>Sound Enabled</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={preferences.vibrationEnabled}
                onChange={(e) => updatePreferences({ vibrationEnabled: e.target.checked })}
              />
              <span>Vibration Enabled</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={preferences.desktopEnabled}
                onChange={(e) => updatePreferences({ desktopEnabled: e.target.checked })}
              />
              <span>Desktop Notifications</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showToasts}
                onChange={(e) => setShowToasts(e.target.checked)}
              />
              <span>Show Toast Popups</span>
            </label>
          </CardContent>
        </Card>
      </div>

      {/* Badge Variants */}
      <Card>
        <CardHeader>
          <CardTitle>Badge Variants</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            <NotificationBadge variant="default" />
            <NotificationBadge variant="icon" size="sm" />
            <NotificationBadge variant="icon" size="md" />
            <NotificationBadge variant="icon" size="lg" />
          </div>
        </CardContent>
      </Card>

      {/* Notification Center */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Center</CardTitle>
        </CardHeader>
        <CardContent>
          <NotificationCenter
            onSettingsClick={() => console.log('Settings clicked')}
          />
        </CardContent>
      </Card>

      {/* Floating Badge Demo */}
      <NotificationBadge variant="floating" />
    </div>
  )
}