'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useActionCable, useCheckInChannel, useNotificationChannel, usePresenceChannel } from '@/hooks/useActionCable'
import { websocketService } from '@/services/websocket'
import { actionCableService } from '@/services/actioncable'

export default function TestWebSocketPage() {
  const [sessionId] = useState('test-session-123')
  const [messages, setMessages] = useState<string[]>([])

  // WebSocket hook
  const {
    connectionState,
    isConnected,
    send,
    connect: wsConnect,
    disconnect: wsDisconnect
  } = useWebSocket({
    autoConnect: false,
    onMessage: (msg) => {
      setMessages(prev => [...prev, `WS Message: ${JSON.stringify(msg)}`])
    }
  })

  // Action Cable hooks
  const {
    isConnected: cableConnected,
    connect: cableConnect,
    disconnect: cableDisconnect
  } = useActionCable({
    autoConnect: false
  })

  const {
    isSubscribed: checkInSubscribed,
    sessionData,
    partnerJoined,
    typingUsers,
    updateSession,
    sendTyping
  } = useCheckInChannel(sessionId)

  const {
    isSubscribed: notificationSubscribed,
    notifications,
    unreadCount,
    markAsRead
  } = useNotificationChannel()

  const {
    isSubscribed: presenceSubscribed,
    onlineUsers,
    userStatus,
    updateStatus
  } = usePresenceChannel('test-user-1')

  // Log state changes
  useEffect(() => {
    setMessages(prev => [...prev, `WS State: ${connectionState}`])
  }, [connectionState])

  useEffect(() => {
    setMessages(prev => [...prev, `Cable Connected: ${cableConnected}`])
  }, [cableConnected])

  const testWebSocket = () => {
    send('check_in_update', {
      checkInId: sessionId,
      data: { test: 'data' }
    })
    setMessages(prev => [...prev, 'Sent WS message'])
  }

  const testActionCable = () => {
    updateSession({ test: 'action cable data' })
    setMessages(prev => [...prev, 'Sent Action Cable message'])
  }

  const testTyping = () => {
    sendTyping(true)
    setMessages(prev => [...prev, 'Sent typing start'])
    setTimeout(() => {
      sendTyping(false)
      setMessages(prev => [...prev, 'Sent typing stop'])
    }, 2000)
  }

  const testPresence = () => {
    const newStatus = userStatus === 'online' ? 'away' : 'online'
    updateStatus(newStatus)
    setMessages(prev => [...prev, `Updated status to ${newStatus}`])
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">WebSocket & Action Cable Test</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* WebSocket Status */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">WebSocket Status</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Connection State:</span>
              <Badge variant={isConnected ? 'default' : 'secondary'}>
                {connectionState}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button onClick={wsConnect} disabled={isConnected}>
                Connect WS
              </Button>
              <Button onClick={wsDisconnect} disabled={!isConnected}>
                Disconnect WS
              </Button>
              <Button onClick={testWebSocket} disabled={!isConnected}>
                Test Send
              </Button>
            </div>
          </div>
        </Card>

        {/* Action Cable Status */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Action Cable Status</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Connected:</span>
              <Badge variant={cableConnected ? 'default' : 'secondary'}>
                {cableConnected ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button onClick={cableConnect} disabled={cableConnected}>
                Connect Cable
              </Button>
              <Button onClick={cableDisconnect} disabled={!cableConnected}>
                Disconnect Cable
              </Button>
              <Button onClick={testActionCable} disabled={!checkInSubscribed}>
                Test Send
              </Button>
            </div>
          </div>
        </Card>

        {/* Check-In Channel */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Check-In Channel</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Subscribed:</span>
              <Badge variant={checkInSubscribed ? 'default' : 'secondary'}>
                {checkInSubscribed ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Partner Joined:</span>
              <Badge variant={partnerJoined ? 'default' : 'secondary'}>
                {partnerJoined ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Typing Users:</span>
              <span>{typingUsers.length > 0 ? typingUsers.join(', ') : 'None'}</span>
            </div>
            <Button onClick={testTyping} disabled={!checkInSubscribed}>
              Test Typing
            </Button>
            {sessionData && (
              <div className="mt-2 p-2 bg-gray-100 rounded">
                <pre className="text-xs">{JSON.stringify(sessionData, null, 2)}</pre>
              </div>
            )}
          </div>
        </Card>

        {/* Notification Channel */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Notification Channel</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Subscribed:</span>
              <Badge variant={notificationSubscribed ? 'default' : 'secondary'}>
                {notificationSubscribed ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Unread Count:</span>
              <Badge>{unreadCount}</Badge>
            </div>
            <div>
              <span className="text-sm text-gray-600">Notifications: {notifications.length}</span>
            </div>
          </div>
        </Card>

        {/* Presence Channel */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Presence Channel</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Subscribed:</span>
              <Badge variant={presenceSubscribed ? 'default' : 'secondary'}>
                {presenceSubscribed ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>My Status:</span>
              <Badge variant={userStatus === 'online' ? 'default' : 'secondary'}>
                {userStatus}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Online Users:</span>
              <span>{onlineUsers.length}</span>
            </div>
            <Button onClick={testPresence} disabled={!presenceSubscribed}>
              Toggle Status
            </Button>
            {onlineUsers.length > 0 && (
              <div className="mt-2 space-y-1">
                {onlineUsers.map(user => (
                  <div key={user.userId} className="text-sm">
                    {user.userId}: {user.status}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Message Log */}
        <Card className="p-6 md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Message Log</h2>
          <div className="bg-gray-50 rounded p-4 h-64 overflow-y-auto">
            {messages.length === 0 ? (
              <p className="text-gray-500">No messages yet...</p>
            ) : (
              <div className="space-y-1">
                {messages.map((msg, i) => (
                  <div key={i} className="text-sm font-mono">{msg}</div>
                ))}
              </div>
            )}
          </div>
          <Button
            onClick={() => setMessages([])}
            className="mt-3"
            variant="outline"
          >
            Clear Log
          </Button>
        </Card>
      </div>
    </div>
  )
}