'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { SessionSettings, SessionSettingsProposal, SessionSettingsTemplate, SessionTemplate, Couple } from '@/types'
import { sessionSettingsService } from '@/services/session-settings.service'

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

  // Load settings from API on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [settings, proposal] = await Promise.all([
          sessionSettingsService.getCurrentSettings(),
          sessionSettingsService.getPendingProposal()
        ])

        if (settings) {
          setCurrentSettings(settings)
        } else if (couple) {
          // Initialize with default settings for the couple
          const initialSettings = {
            ...defaultSettings,
            coupleId: couple.id,
            agreedBy: couple.partners.map(p => p.id)
          }
          const newSettings = await sessionSettingsService.updateSettings(initialSettings)
          setCurrentSettings(newSettings)
        } else {
          setCurrentSettings({
            ...defaultSettings,
            coupleId: 'demo'
          })
        }

        if (proposal) {
          setPendingProposal(proposal)
        }
      } catch (error) {
        console.error('Failed to load session settings:', error)
        // Fallback to default settings
        setCurrentSettings({
          ...defaultSettings,
          coupleId: couple?.id || 'demo',
          agreedBy: couple ? couple.partners.map(p => p.id) : []
        })
      }
    }

    loadSettings()
  }, [couple])

  const proposeSettings = useCallback(async (settings: Partial<SessionSettings>) => {
    if (!couple) return

    try {
      const proposal = await sessionSettingsService.proposeSettings({ settings })
      setPendingProposal(proposal)
    } catch (error) {
      console.error('Failed to propose settings:', error)
    }
  }, [couple])

  const acceptProposal = useCallback(async (proposalId: string) => {
    if (!pendingProposal || pendingProposal.id !== proposalId || !couple) return

    try {
      const newSettings = await sessionSettingsService.reviewProposal(proposalId, { status: 'accepted' })
      if (newSettings) {
        setCurrentSettings(newSettings)
        setPendingProposal(null)
      }
    } catch (error) {
      console.error('Failed to accept proposal:', error)
    }
  }, [pendingProposal, couple])

  const rejectProposal = useCallback(async (proposalId: string) => {
    if (!pendingProposal || pendingProposal.id !== proposalId) return

    try {
      await sessionSettingsService.reviewProposal(proposalId, { status: 'rejected' })
      setPendingProposal(null)
    } catch (error) {
      console.error('Failed to reject proposal:', error)
    }
  }, [pendingProposal])

  const applyTemplate = useCallback((templateType: SessionTemplate) => {
    const template = defaultTemplates.find(t => t.type === templateType)
    if (!template) return

    proposeSettings(template.settings)
  }, [proposeSettings])

  const updateCurrentSettings = useCallback(async (settings: Partial<SessionSettings>) => {
    if (!currentSettings) return

    try {
      const updatedSettings = await sessionSettingsService.updateSettings({
        ...currentSettings,
        ...settings
      })
      setCurrentSettings(updatedSettings)
    } catch (error) {
      console.error('Failed to update settings:', error)
    }
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