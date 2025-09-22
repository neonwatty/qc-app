'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useCheckInChannel } from './useActionCable'
import { Note } from '@/types'
import { useCheckInContext } from '@/contexts/CheckInContext'

export interface SessionSyncState {
  isConnected: boolean
  partnerJoined: boolean
  partnerTyping: boolean
  syncStatus: 'idle' | 'syncing' | 'synced' | 'error'
  lastSyncTime: Date | null
  conflictResolution: 'local' | 'remote' | 'merge'
}

export interface UseSessionSyncOptions {
  sessionId: string
  userId: string
  autoJoin?: boolean
  conflictResolution?: 'local' | 'remote' | 'merge'
  onPartnerJoin?: () => void
  onPartnerLeave?: () => void
  onSyncConflict?: (local: any, remote: any) => any
}

export interface UseSessionSyncReturn extends SessionSyncState {
  joinSession: () => void
  leaveSession: () => void
  syncLocalChanges: (data: any) => void
  startTyping: () => void
  stopTyping: () => void
  resolveConflict: (resolution: 'local' | 'remote' | 'merge') => void
}

/**
 * Custom hook for real-time check-in session synchronization
 * Handles partner presence, typing indicators, and data sync
 */
export function useSessionSync(options: UseSessionSyncOptions): UseSessionSyncReturn {
  const {
    sessionId,
    userId,
    autoJoin = true,
    conflictResolution = 'merge',
    onPartnerJoin,
    onPartnerLeave,
    onSyncConflict
  } = options

  const { session: checkInState } = useCheckInContext()

  const [syncState, setSyncState] = useState<SessionSyncState>({
    isConnected: false,
    partnerJoined: false,
    partnerTyping: false,
    syncStatus: 'idle',
    lastSyncTime: null,
    conflictResolution
  })

  const typingTimerRef = useRef<NodeJS.Timeout | undefined>()
  const lastLocalUpdateRef = useRef<string>('')
  const pendingChangesRef = useRef<any>(null)

  // Use Action Cable channel
  const {
    isSubscribed,
    sessionData,
    partnerJoined,
    typingUsers,
    updateSession,
    joinSession: channelJoin,
    leaveSession: channelLeave,
    sendTyping
  } = useCheckInChannel(sessionId)

  // Update connection status
  useEffect(() => {
    setSyncState(prev => ({
      ...prev,
      isConnected: isSubscribed
    }))
  }, [isSubscribed])

  // Handle partner presence
  useEffect(() => {
    setSyncState(prev => ({
      ...prev,
      partnerJoined
    }))

    if (partnerJoined) {
      onPartnerJoin?.()
    } else {
      onPartnerLeave?.()
    }
  }, [partnerJoined, onPartnerJoin, onPartnerLeave])

  // Handle typing indicators
  useEffect(() => {
    const isPartnerTyping = typingUsers.some(id => id !== userId)
    setSyncState(prev => ({
      ...prev,
      partnerTyping: isPartnerTyping
    }))
  }, [typingUsers, userId])

  // Handle incoming session data
  useEffect(() => {
    if (!sessionData || sessionData.userId === userId) {
      return
    }

    setSyncState(prev => ({
      ...prev,
      syncStatus: 'syncing'
    }))

    // Check for conflicts
    const localDataHash = JSON.stringify(checkInState)
    const remoteDataHash = JSON.stringify(sessionData)

    if (lastLocalUpdateRef.current && lastLocalUpdateRef.current !== remoteDataHash) {
      // Conflict detected
      if (onSyncConflict) {
        const resolved = onSyncConflict(checkInState, sessionData)
        // Update local state with resolved data
        console.log('Conflict resolved:', resolved)
      } else {
        // Apply default conflict resolution
        switch (conflictResolution) {
          case 'local':
            // Keep local changes
            break
          case 'remote':
            // Accept remote changes
            console.log('Accepting remote changes:', sessionData)
            break
          case 'merge':
            // Merge changes (simple last-write-wins for now)
            const merged = {
              ...checkInState,
              ...sessionData,
              // Preserve local notes that are marked as draft
              notes: mergeNotes(checkInState?.notes || [], sessionData.notes || [])
            }
            console.log('Merged changes:', merged)
            break
        }
      }
    } else {
      // No conflict, apply remote changes
      console.log('No conflict, applying remote changes:', sessionData)
    }

    setSyncState(prev => ({
      ...prev,
      syncStatus: 'synced',
      lastSyncTime: new Date()
    }))
  }, [sessionData, checkInState, userId, conflictResolution, onSyncConflict])

  // Auto-join on mount if enabled
  useEffect(() => {
    if (autoJoin && isSubscribed) {
      channelJoin()
    }

    return () => {
      if (isSubscribed) {
        channelLeave()
      }
    }
  }, [autoJoin, isSubscribed, channelJoin, channelLeave])

  // Join session manually
  const joinSession = useCallback(() => {
    if (isSubscribed) {
      channelJoin()
    }
  }, [isSubscribed, channelJoin])

  // Leave session manually
  const leaveSession = useCallback(() => {
    if (isSubscribed) {
      channelLeave()
    }
  }, [isSubscribed, channelLeave])

  // Sync local changes to remote
  const syncLocalChanges = useCallback((data: any) => {
    if (!isSubscribed) {
      pendingChangesRef.current = data
      return
    }

    setSyncState(prev => ({
      ...prev,
      syncStatus: 'syncing'
    }))

    const syncData = {
      ...data,
      userId,
      timestamp: new Date().toISOString()
    }

    lastLocalUpdateRef.current = JSON.stringify(syncData)
    updateSession(syncData)

    setSyncState(prev => ({
      ...prev,
      syncStatus: 'synced',
      lastSyncTime: new Date()
    }))
  }, [isSubscribed, userId, updateSession])

  // Handle pending changes when connection is restored
  useEffect(() => {
    if (isSubscribed && pendingChangesRef.current) {
      syncLocalChanges(pendingChangesRef.current)
      pendingChangesRef.current = null
    }
  }, [isSubscribed, syncLocalChanges])

  // Typing indicator management
  const startTyping = useCallback(() => {
    if (!isSubscribed) return

    // Clear existing timer
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current)
    }

    sendTyping(true)

    // Auto-stop typing after 3 seconds
    typingTimerRef.current = setTimeout(() => {
      sendTyping(false)
    }, 3000)
  }, [isSubscribed, sendTyping])

  const stopTyping = useCallback(() => {
    if (!isSubscribed) return

    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current)
      typingTimerRef.current = undefined
    }

    sendTyping(false)
  }, [isSubscribed, sendTyping])

  // Cleanup typing timer on unmount
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current)
      }
    }
  }, [])

  // Resolve conflicts manually
  const resolveConflict = useCallback((resolution: 'local' | 'remote' | 'merge') => {
    setSyncState(prev => ({
      ...prev,
      conflictResolution: resolution
    }))
  }, [])

  return {
    ...syncState,
    joinSession,
    leaveSession,
    syncLocalChanges,
    startTyping,
    stopTyping,
    resolveConflict
  }
}

/**
 * Helper function to merge notes with conflict resolution
 */
function mergeNotes(localNotes: Note[], remoteNotes: Note[]): Note[] {
  const noteMap = new Map<string, Note>()

  // Add all local notes
  localNotes.forEach(note => {
    noteMap.set(note.id, note)
  })

  // Merge remote notes
  remoteNotes.forEach(remoteNote => {
    const localNote = noteMap.get(remoteNote.id)

    if (!localNote) {
      // New remote note
      noteMap.set(remoteNote.id, remoteNote)
    } else if (localNote.privacy === 'draft' && remoteNote.privacy !== 'draft') {
      // Keep local draft over remote non-draft
      // (user is still editing)
    } else if (new Date(remoteNote.updatedAt) > new Date(localNote.updatedAt)) {
      // Remote is newer
      noteMap.set(remoteNote.id, remoteNote)
    }
    // Otherwise keep local (local is newer or same)
  })

  return Array.from(noteMap.values())
}

/**
 * Hook for detecting and handling network reconnection
 */
export function useNetworkReconnection(onReconnect: () => void) {
  useEffect(() => {
    const handleOnline = () => {
      console.log('Network reconnected')
      onReconnect()
    }

    const handleOffline = () => {
      console.log('Network disconnected')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [onReconnect])
}

/**
 * Hook for session heartbeat to maintain connection
 */
export function useSessionHeartbeat(sessionId: string, interval = 30000) {
  const { updateSession } = useCheckInChannel(sessionId)

  useEffect(() => {
    const heartbeatTimer = setInterval(() => {
      updateSession({ heartbeat: new Date().toISOString() })
    }, interval)

    return () => {
      clearInterval(heartbeatTimer)
    }
  }, [sessionId, interval, updateSession])
}