'use client'

import React, { useState } from 'react'
import { Settings, User, Bell, Shield, Palette, Clock, Heart, Save, Grid3x3, Users, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { MotionBox, StaggerContainer, StaggerItem } from '@/components/ui/motion'
import { Button } from '@/components/ui/button'
import { CategoryManager } from '@/components/Settings/CategoryManager'
import { NotificationSettings } from '@/components/Settings/NotificationSettings'
import { ReminderScheduler } from '@/components/Settings/ReminderScheduler'
import { ThemeSelector } from '@/components/Settings/ThemeSelector'
import { PersonalizationPanel } from '@/components/Settings/PersonalizationPanel'
import { SessionSettingsPanel } from '@/components/Settings/SessionSettingsPanel'
import { SessionSettingsProvider } from '@/contexts/SessionSettingsContext'

interface SettingsSection {
  id: string
  title: string
  description: string
  icon: React.ElementType
}

const settingSections: SettingsSection[] = [
  {
    id: 'profile',
    title: 'Profile & Relationship',
    description: 'Manage your couple profile and relationship details',
    icon: Heart
  },
  {
    id: 'session',
    title: 'Session Rules',
    description: 'Configure check-in session settings and rules',
    icon: Users
  },
  {
    id: 'categories',
    title: 'Discussion Categories',
    description: 'Customize categories and prompts for check-ins',
    icon: Grid3x3
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Configure check-in reminders and app notifications',
    icon: Bell
  },
  {
    id: 'privacy',
    title: 'Privacy & Sharing',
    description: 'Control what information is shared between partners',
    icon: Shield
  },
  {
    id: 'appearance',
    title: 'Appearance',
    description: 'Customize the app theme and display preferences',
    icon: Palette
  },
  {
    id: 'schedule',
    title: 'Check-in Schedule',
    description: 'Set up regular check-in reminders and frequency',
    icon: Clock
  }
]

export default function SettingsPage() {
  const router = useRouter()
  const [activeSection, setActiveSection] = useState<string>('profile')
  const [hasChanges, setHasChanges] = useState(false)

  // Mock settings state
  const [settings, setSettings] = useState({
    partnerNames: { first: 'Alex', second: 'Blake' },
    relationshipStart: '2023-01-15',
    reminderFrequency: 'weekly',
    reminderTime: '19:00',
    reminderDays: ['sunday'],
    theme: 'light',
    privateByDefault: false,
    shareProgress: true,
    emailNotifications: true,
    pushNotifications: true
  })

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  const saveSettings = () => {
    // Handle saving settings
    setHasChanges(false)
  }

  const handleRedoOnboarding = () => {
    // Clear onboarding completion flag
    localStorage.removeItem('qc-onboarding-complete')
    localStorage.removeItem('qc-onboarding-data')
    localStorage.removeItem('qc-onboarding-skipped')
    // Redirect to onboarding
    router.push('/onboarding')
  }

  return (
    <SessionSettingsProvider>
      <MotionBox variant="page" className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-gray-600">
            Customize your Quality Control experience
          </p>
        </div>
        {hasChanges && (
          <Button onClick={saveSettings} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <nav className="space-y-2">
            {settingSections.map((section) => {
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`
                    w-full flex items-center px-4 py-3 text-left text-sm font-medium rounded-lg transition-colors
                    ${activeSection === section.id
                      ? 'bg-pink-50 text-pink-700 border border-pink-200'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                  <div>
                    <div className="font-medium">{section.title}</div>
                    <div className="text-xs text-gray-500 lg:hidden">
                      {section.description}
                    </div>
                  </div>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          {/* Session Rules - No wrapper needed as SessionSettingsPanel has its own cards */}
          {activeSection === 'session' && (
            <SessionSettingsPanel />
          )}
          
          {activeSection !== 'session' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* Other sections keep the wrapper */}

            {/* Categories */}
            {activeSection === 'categories' && (
              <div className="space-y-6">
                <CategoryManager />
              </div>
            )}

            {/* Profile & Relationship */}
            {activeSection === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Profile & Relationship
                  </h2>

                  {/* Redo Onboarding Button */}
                  <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-start space-x-3">
                      <RefreshCw className="h-5 w-5 text-purple-600 mt-1" />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">Redo Onboarding</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Go through the personalization process again to update your preferences
                        </p>
                        <Button
                          onClick={handleRedoOnboarding}
                          variant="outline"
                          size="sm"
                          className="mt-3"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Start Onboarding
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Partner Name
                      </label>
                      <input
                        type="text"
                        value={settings.partnerNames.first}
                        onChange={(e) => updateSetting('partnerNames', { 
                          ...settings.partnerNames, 
                          first: e.target.value 
                        })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Second Partner Name
                      </label>
                      <input
                        type="text"
                        value={settings.partnerNames.second}
                        onChange={(e) => updateSetting('partnerNames', { 
                          ...settings.partnerNames, 
                          second: e.target.value 
                        })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Relationship Start Date
                      </label>
                      <input
                        type="date"
                        value={settings.relationshipStart}
                        onChange={(e) => updateSetting('relationshipStart', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeSection === 'notifications' && (
              <NotificationSettings />
            )}

            {/* Privacy */}
            {activeSection === 'privacy' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Privacy & Sharing
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Private Notes by Default</div>
                        <div className="text-sm text-gray-600">
                          Make new notes private by default instead of shared
                        </div>
                      </div>
                      <button
                        onClick={() => updateSetting('privateByDefault', !settings.privateByDefault)}
                        className={`
                          relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                          ${settings.privateByDefault ? 'bg-pink-600' : 'bg-gray-200'}
                        `}
                      >
                        <span className={`
                          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                          ${settings.privateByDefault ? 'translate-x-6' : 'translate-x-1'}
                        `} />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Share Progress</div>
                        <div className="text-sm text-gray-600">
                          Allow both partners to see growth and milestone progress
                        </div>
                      </div>
                      <button
                        onClick={() => updateSetting('shareProgress', !settings.shareProgress)}
                        className={`
                          relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                          ${settings.shareProgress ? 'bg-pink-600' : 'bg-gray-200'}
                        `}
                      >
                        <span className={`
                          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                          ${settings.shareProgress ? 'translate-x-6' : 'translate-x-1'}
                        `} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance */}
            {activeSection === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Appearance & Personalization
                  </h2>
                  
                  <div className="space-y-8">
                    <ThemeSelector />
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-8">
                      <PersonalizationPanel />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Schedule */}
            {activeSection === 'schedule' && (
              <ReminderScheduler />
            )}
            </div>
          )}
        </div>
      </div>
    </MotionBox>
    </SessionSettingsProvider>
  )
}