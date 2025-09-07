'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { SessionSettings, SessionSettingsProposal, SessionSettingsTemplate, SessionTemplate, Couple } from '@/types'

interface SessionSettingsContextType {
  currentSettings: SessionSettings | null
  pendingProposal: SessionSettingsProposal | null
  templates: SessionSettingsTemplate[]
  proposeSettings: (settings: Partial<SessionSettings>) => void
  acceptProposal: (proposalId: string) => void
  rejectProposal: (proposalId: string) => void
  applyTemplate: (templateType: SessionTemplate) => void
  updateCurrentSettings: (settings: Partial<SessionSettings>) => void
  getActiveSettings: () => SessionSettings | null
}

const defaultTemplates: SessionSettingsTemplate[] = [
  {
    name: 'Quick Check-in',
    type: 'quick',
    description: '5-minute focused session without timeouts',
    settings: {
      sessionDuration: 5,
      timeoutsPerPartner: 0,
      timeoutDuration: 0,
      turnBasedMode: false,
      allowExtensions: false,
      pauseNotifications: true,
      autoSaveDrafts: true,
      warmUpQuestions: false,
      coolDownTime: 0
    }
  },
  {
    name: 'Standard Session',
    type: 'standard',
    description: '10-minute balanced session with turn-based discussion',
    settings: {
      sessionDuration: 10,
      timeoutsPerPartner: 1,
      timeoutDuration: 2,
      turnBasedMode: true,
      turnDuration: 90,
      allowExtensions: true,
      pauseNotifications: true,
      autoSaveDrafts: true,
      warmUpQuestions: false,
      coolDownTime: 2
    }
  },
  {
    name: 'Deep Dive',
    type: 'deep-dive',
    description: '20-minute comprehensive session with warm-up and reflection',
    settings: {
      sessionDuration: 20,
      timeoutsPerPartner: 2,
      timeoutDuration: 3,
      turnBasedMode: true,
      turnDuration: 120,
      allowExtensions: true,
      pauseNotifications: true,
      autoSaveDrafts: true,
      warmUpQuestions: true,
      coolDownTime: 5
    }
  }
]

const defaultSettings: SessionSettings = {
  id: 'default',
  coupleId: '',
  sessionDuration: 10,
  timeoutsPerPartner: 1,
  timeoutDuration: 2,
  turnBasedMode: true,
  turnDuration: 90,
  allowExtensions: true,
  pauseNotifications: true,
  autoSaveDrafts: true,
  warmUpQuestions: false,
  coolDownTime: 2,
  agreedAt: new Date(),
  agreedBy: [],
  version: 1
}

const SessionSettingsContext = createContext<SessionSettingsContextType | undefined>(undefined)

export function SessionSettingsProvider({ 
  children,
  couple
}: { 
  children: React.ReactNode
  couple?: Couple | null
}) {
  const [currentSettings, setCurrentSettings] = useState<SessionSettings | null>(null)
  const [pendingProposal, setPendingProposal] = useState<SessionSettingsProposal | null>(null)

  // Load settings from localStorage on mount
  useEffect(() => {
    const loadedSettings = localStorage.getItem('sessionSettings')
    if (loadedSettings) {
      try {
        const parsed = JSON.parse(loadedSettings)
        setCurrentSettings({
          ...parsed,
          agreedAt: new Date(parsed.agreedAt)
        })
      } catch (error) {
        console.error('Failed to load session settings:', error)
        setCurrentSettings({
          ...defaultSettings,
          coupleId: couple?.id || 'demo'
        })
      }
    } else if (couple) {
      // Initialize with default settings for the couple
      const initialSettings = {
        ...defaultSettings,
        coupleId: couple.id,
        agreedBy: couple.partners.map(p => p.id)
      }
      setCurrentSettings(initialSettings)
      localStorage.setItem('sessionSettings', JSON.stringify(initialSettings))
    }

    // Load pending proposal
    const loadedProposal = localStorage.getItem('pendingSessionProposal')
    if (loadedProposal) {
      try {
        const parsed = JSON.parse(loadedProposal)
        setPendingProposal({
          ...parsed,
          proposedAt: new Date(parsed.proposedAt),
          reviewedAt: parsed.reviewedAt ? new Date(parsed.reviewedAt) : undefined
        })
      } catch (error) {
        console.error('Failed to load pending proposal:', error)
      }
    }
  }, [couple])

  const proposeSettings = useCallback((settings: Partial<SessionSettings>) => {
    if (!couple) return

    const proposal: SessionSettingsProposal = {
      id: `proposal-${Date.now()}`,
      proposedBy: couple.partners[0].id, // In real app, would be current user
      proposedAt: new Date(),
      settings,
      status: 'pending'
    }

    setPendingProposal(proposal)
    localStorage.setItem('pendingSessionProposal', JSON.stringify(proposal))
  }, [couple])

  const acceptProposal = useCallback((proposalId: string) => {
    if (!pendingProposal || pendingProposal.id !== proposalId || !couple) return

    const newSettings: SessionSettings = {
      ...defaultSettings,
      ...currentSettings,
      ...pendingProposal.settings,
      id: `settings-${Date.now()}`,
      coupleId: couple.id,
      agreedAt: new Date(),
      agreedBy: couple.partners.map(p => p.id),
      version: (currentSettings?.version || 0) + 1
    }

    setCurrentSettings(newSettings)
    setPendingProposal(null)
    
    localStorage.setItem('sessionSettings', JSON.stringify(newSettings))
    localStorage.removeItem('pendingSessionProposal')
  }, [pendingProposal, currentSettings, couple])

  const rejectProposal = useCallback((proposalId: string) => {
    if (!pendingProposal || pendingProposal.id !== proposalId) return

    setPendingProposal(null)
    localStorage.removeItem('pendingSessionProposal')
  }, [pendingProposal])

  const applyTemplate = useCallback((templateType: SessionTemplate) => {
    const template = defaultTemplates.find(t => t.type === templateType)
    if (!template) return

    proposeSettings(template.settings)
  }, [proposeSettings])

  const updateCurrentSettings = useCallback((settings: Partial<SessionSettings>) => {
    if (!currentSettings) return

    const updated = {
      ...currentSettings,
      ...settings
    }

    setCurrentSettings(updated)
    localStorage.setItem('sessionSettings', JSON.stringify(updated))
  }, [currentSettings])

  const getActiveSettings = useCallback(() => {
    return currentSettings || {
      ...defaultSettings,
      coupleId: couple?.id || 'demo'
    }
  }, [currentSettings, couple])

  return (
    <SessionSettingsContext.Provider
      value={{
        currentSettings,
        pendingProposal,
        templates: defaultTemplates,
        proposeSettings,
        acceptProposal,
        rejectProposal,
        applyTemplate,
        updateCurrentSettings,
        getActiveSettings
      }}
    >
      {children}
    </SessionSettingsContext.Provider>
  )
}

export function useSessionSettings() {
  const context = useContext(SessionSettingsContext)
  if (context === undefined) {
    throw new Error('useSessionSettings must be used within a SessionSettingsProvider')
  }
  return context
}