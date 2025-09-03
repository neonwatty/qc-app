'use client'

import React, { useState } from 'react'
import { Bell, BellRing, Volume2, VolumeX, Smartphone, Mail, Calendar, Clock, ChevronRight, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'

interface NotificationType {
  id: string
  name: string
  description: string
  enabled: boolean
  icon: React.ElementType
  priority: 'high' | 'medium' | 'low'
  defaultTime?: string
  channels: ('push' | 'email' | 'sms')[]
}

interface NotificationSettings {
  globalEnabled: boolean
  soundEnabled: boolean
  vibrationEnabled: boolean
  quietHours: {
    enabled: boolean
    start: string
    end: string
  }
  notificationTypes: NotificationType[]
}

export function NotificationSettings() {
  const [settings, setSettings] = useState<NotificationSettings>({
    globalEnabled: true,
    soundEnabled: true,
    vibrationEnabled: true,
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    },
    notificationTypes: [
      {
        id: 'checkin-reminder',
        name: 'Check-in Reminders',
        description: 'Get reminders for your scheduled check-ins',
        enabled: true,
        icon: BellRing,
        priority: 'high',
        defaultTime: '19:00',
        channels: ['push', 'email']
      },
      {
        id: 'partner-checkin',
        name: 'Partner Check-ins',
        description: 'Notify when your partner completes a check-in',
        enabled: true,
        icon: Bell,
        priority: 'medium',
        channels: ['push']
      },
      {
        id: 'milestone-celebration',
        name: 'Milestone Celebrations',
        description: 'Celebrate relationship milestones together',
        enabled: true,
        icon: Calendar,
        priority: 'high',
        channels: ['push', 'email']
      },
      {
        id: 'action-items',
        name: 'Action Item Reminders',
        description: 'Get reminded about pending action items',
        enabled: false,
        icon: Clock,
        priority: 'medium',
        defaultTime: '09:00',
        channels: ['push']
      },
      {
        id: 'weekly-summary',
        name: 'Weekly Summaries',
        description: 'Receive weekly relationship health summaries',
        enabled: false,
        icon: Mail,
        priority: 'low',
        channels: ['email']
      }
    ]
  })

  const [previewNotification, setPreviewNotification] = useState<string | null>(null)

  const toggleNotificationType = (id: string) => {
    setSettings(prev => ({
      ...prev,
      notificationTypes: prev.notificationTypes.map(type =>
        type.id === id ? { ...type, enabled: !type.enabled } : type
      )
    }))
  }

  const toggleChannel = (notificationId: string, channel: 'push' | 'email' | 'sms') => {
    setSettings(prev => ({
      ...prev,
      notificationTypes: prev.notificationTypes.map(type => {
        if (type.id === notificationId) {
          const channels = type.channels.includes(channel)
            ? type.channels.filter(c => c !== channel)
            : [...type.channels, channel]
          return { ...type, channels }
        }
        return type
      })
    }))
  }

  const previewNotificationDemo = (notificationId: string) => {
    setPreviewNotification(notificationId)
    setTimeout(() => setPreviewNotification(null), 3000)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-blue-600 bg-blue-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Notification Settings
        </h2>
        <p className="text-sm text-gray-600">
          Configure how and when you receive notifications from Quality Control
        </p>
      </div>

      {/* Global Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Global Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="h-5 w-5 text-gray-400" />
              <div>
                <div className="font-medium text-gray-900">All Notifications</div>
                <div className="text-sm text-gray-600">
                  Master toggle for all notification types
                </div>
              </div>
            </div>
            <button
              onClick={() => setSettings(prev => ({ ...prev, globalEnabled: !prev.globalEnabled }))}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${settings.globalEnabled ? 'bg-pink-600' : 'bg-gray-200'}
              `}
            >
              <span className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${settings.globalEnabled ? 'translate-x-6' : 'translate-x-1'}
              `} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {settings.soundEnabled ? (
                <Volume2 className="h-5 w-5 text-gray-400" />
              ) : (
                <VolumeX className="h-5 w-5 text-gray-400" />
              )}
              <div>
                <div className="font-medium text-gray-900">Sound</div>
                <div className="text-sm text-gray-600">
                  Play sound for notifications
                </div>
              </div>
            </div>
            <button
              onClick={() => setSettings(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
              disabled={!settings.globalEnabled}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${settings.soundEnabled && settings.globalEnabled ? 'bg-pink-600' : 'bg-gray-200'}
                ${!settings.globalEnabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <span className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${settings.soundEnabled ? 'translate-x-6' : 'translate-x-1'}
              `} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Smartphone className="h-5 w-5 text-gray-400" />
              <div>
                <div className="font-medium text-gray-900">Vibration</div>
                <div className="text-sm text-gray-600">
                  Vibrate device for notifications
                </div>
              </div>
            </div>
            <button
              onClick={() => setSettings(prev => ({ ...prev, vibrationEnabled: !prev.vibrationEnabled }))}
              disabled={!settings.globalEnabled}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${settings.vibrationEnabled && settings.globalEnabled ? 'bg-pink-600' : 'bg-gray-200'}
                ${!settings.globalEnabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <span className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${settings.vibrationEnabled ? 'translate-x-6' : 'translate-x-1'}
              `} />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Types */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notification Types</CardTitle>
          <CardDescription>
            Choose which notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="enabled">Enabled</TabsTrigger>
              <TabsTrigger value="disabled">Disabled</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4 mt-4">
              {settings.notificationTypes.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  globalEnabled={settings.globalEnabled}
                  onToggle={() => toggleNotificationType(notification.id)}
                  onToggleChannel={(channel) => toggleChannel(notification.id, channel)}
                  onPreview={() => previewNotificationDemo(notification.id)}
                  isPreviewActive={previewNotification === notification.id}
                  getPriorityColor={getPriorityColor}
                />
              ))}
            </TabsContent>

            <TabsContent value="enabled" className="space-y-4 mt-4">
              {settings.notificationTypes
                .filter(n => n.enabled)
                .map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    globalEnabled={settings.globalEnabled}
                    onToggle={() => toggleNotificationType(notification.id)}
                    onToggleChannel={(channel) => toggleChannel(notification.id, channel)}
                    onPreview={() => previewNotificationDemo(notification.id)}
                    isPreviewActive={previewNotification === notification.id}
                    getPriorityColor={getPriorityColor}
                  />
                ))}
            </TabsContent>

            <TabsContent value="disabled" className="space-y-4 mt-4">
              {settings.notificationTypes
                .filter(n => !n.enabled)
                .map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    globalEnabled={settings.globalEnabled}
                    onToggle={() => toggleNotificationType(notification.id)}
                    onToggleChannel={(channel) => toggleChannel(notification.id, channel)}
                    onPreview={() => previewNotificationDemo(notification.id)}
                    isPreviewActive={previewNotification === notification.id}
                    getPriorityColor={getPriorityColor}
                  />
                ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Quiet Hours</CardTitle>
          <CardDescription>
            Set times when you don&apos;t want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-gray-400" />
              <div>
                <div className="font-medium text-gray-900">Enable Quiet Hours</div>
                <div className="text-sm text-gray-600">
                  Pause notifications during set times
                </div>
              </div>
            </div>
            <button
              onClick={() => setSettings(prev => ({ 
                ...prev, 
                quietHours: { ...prev.quietHours, enabled: !prev.quietHours.enabled }
              }))}
              disabled={!settings.globalEnabled}
              className={`
                relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                ${settings.quietHours.enabled && settings.globalEnabled ? 'bg-pink-600' : 'bg-gray-200'}
                ${!settings.globalEnabled ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <span className={`
                inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                ${settings.quietHours.enabled ? 'translate-x-6' : 'translate-x-1'}
              `} />
            </button>
          </div>

          {settings.quietHours.enabled && (
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  value={settings.quietHours.start}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    quietHours: { ...prev.quietHours, start: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  value={settings.quietHours.end}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    quietHours: { ...prev.quietHours, end: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

interface NotificationItemProps {
  notification: NotificationType
  globalEnabled: boolean
  onToggle: () => void
  onToggleChannel: (channel: 'push' | 'email' | 'sms') => void
  onPreview: () => void
  isPreviewActive: boolean
  getPriorityColor: (priority: string) => string
}

function NotificationItem({ 
  notification, 
  globalEnabled, 
  onToggle, 
  onToggleChannel, 
  onPreview,
  isPreviewActive,
  getPriorityColor 
}: NotificationItemProps) {
  const Icon = notification.icon

  return (
    <div className={`
      p-4 rounded-lg border transition-all
      ${isPreviewActive ? 'border-pink-500 bg-pink-50' : 'border-gray-200'}
      ${!globalEnabled ? 'opacity-50' : ''}
    `}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <Icon className="h-5 w-5 text-gray-400 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <div className="font-medium text-gray-900">{notification.name}</div>
              <Badge className={`text-xs ${getPriorityColor(notification.priority)}`}>
                {notification.priority}
              </Badge>
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {notification.description}
            </div>
            
            {notification.defaultTime && (
              <div className="text-xs text-gray-500 mt-2">
                Default time: {notification.defaultTime}
              </div>
            )}

            <div className="flex items-center space-x-4 mt-3">
              <span className="text-xs font-medium text-gray-700">Channels:</span>
              <div className="flex items-center space-x-2">
                {['push', 'email', 'sms'].map(channel => (
                  <button
                    key={channel}
                    onClick={() => onToggleChannel(channel as 'push' | 'email' | 'sms')}
                    disabled={!globalEnabled || !notification.enabled}
                    className={`
                      px-2 py-1 text-xs rounded-md capitalize transition-colors
                      ${notification.channels.includes(channel as any) 
                        ? 'bg-pink-100 text-pink-700' 
                        : 'bg-gray-100 text-gray-500'}
                      ${(!globalEnabled || !notification.enabled) ? 'cursor-not-allowed' : 'hover:bg-pink-200'}
                    `}
                  >
                    {channel}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPreview}
            disabled={!globalEnabled || !notification.enabled}
            className="text-xs"
          >
            Preview
          </Button>
          <button
            onClick={onToggle}
            disabled={!globalEnabled}
            className={`
              relative inline-flex h-6 w-11 items-center rounded-full transition-colors
              ${notification.enabled && globalEnabled ? 'bg-pink-600' : 'bg-gray-200'}
              ${!globalEnabled ? 'cursor-not-allowed' : ''}
            `}
          >
            <span className={`
              inline-block h-4 w-4 transform rounded-full bg-white transition-transform
              ${notification.enabled ? 'translate-x-6' : 'translate-x-1'}
            `} />
          </button>
        </div>
      </div>
    </div>
  )
}