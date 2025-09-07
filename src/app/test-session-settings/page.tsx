'use client'

import { useState } from 'react'
import { SessionSettingsProvider, useSessionSettings } from '@/contexts/SessionSettingsContext'
import { SessionSettingsPanel } from '@/components/Settings/SessionSettingsPanel'
import { SessionRulesCard } from '@/components/checkin/SessionRulesCard'
import { SessionTimer } from '@/components/checkin/SessionTimer'
import { TurnIndicator } from '@/components/checkin/TurnIndicator'
import { SessionAgreementModal } from '@/components/Settings/SessionAgreementModal'
import { SessionSettingsDemo } from '@/components/demo/SessionSettingsDemo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { User, SessionSettings, SessionSettingsProposal } from '@/types'
import { Smartphone, Monitor, Settings } from 'lucide-react'

function TestContent() {
  const { getActiveSettings, pendingProposal, proposeSettings } = useSessionSettings()
  const [showAgreementModal, setShowAgreementModal] = useState(false)
  const [viewport, setViewport] = useState<'mobile' | 'desktop'>('desktop')
  
  const sessionSettings = getActiveSettings()
  
  // Mock users
  const currentUser: User = {
    id: 'user-1',
    name: 'Alex Chen',
    email: 'alex@example.com',
    createdAt: new Date(),
    updatedAt: new Date()
  }
  
  const partner: User = {
    id: 'user-2', 
    name: 'Jordan Smith',
    email: 'jordan@example.com',
    createdAt: new Date(),
    updatedAt: new Date()
  }

  // Create a mock proposal
  const createMockProposal = () => {
    if (sessionSettings) {
      proposeSettings({
        sessionDuration: 15,
        turnBasedMode: true,
        turnDuration: 120
      })
      setShowAgreementModal(true)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Session Settings Test Page</h1>
            <div className="flex gap-2">
              <Button
                variant={viewport === 'mobile' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewport('mobile')}
              >
                <Smartphone className="w-4 h-4 mr-1" />
                Mobile
              </Button>
              <Button
                variant={viewport === 'desktop' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewport('desktop')}
              >
                <Monitor className="w-4 h-4 mr-1" />
                Desktop
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`container mx-auto px-4 py-8 ${viewport === 'mobile' ? 'max-w-sm' : 'max-w-6xl'}`}>
        <Tabs defaultValue="demo" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="demo">Demo</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="agreement">Agreement</TabsTrigger>
          </TabsList>

          {/* Demo Tab */}
          <TabsContent value="demo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Interactive Demo</CardTitle>
                <CardDescription>
                  Walk through the Session Settings feature step by step
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SessionSettingsDemo />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Configuration Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configure Session Rules</CardTitle>
                <CardDescription>
                  Adjust settings and propose changes to your partner
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SessionSettingsPanel />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Active Session Tab */}
          <TabsContent value="active" className="space-y-6">
            {sessionSettings && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Current Rules</CardTitle>
                    <CardDescription>
                      These are your active session settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SessionRulesCard settings={sessionSettings} />
                  </CardContent>
                </Card>

                <div className={`grid gap-4 ${viewport === 'mobile' ? 'grid-cols-1' : 'lg:grid-cols-2'}`}>
                  <Card>
                    <CardHeader>
                      <CardTitle>Session Timer</CardTitle>
                      <CardDescription>
                        Live timer with timeout controls
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <SessionTimer 
                        settings={sessionSettings}
                        onTimeUp={() => alert('Time is up!')}
                        onExtension={() => alert('Session extended by 5 minutes')}
                        onTimeout={() => alert('Timeout activated')}
                      />
                    </CardContent>
                  </Card>

                  {sessionSettings.turnBasedMode && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Turn Indicator</CardTitle>
                        <CardDescription>
                          Manages turn-based discussions
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <TurnIndicator
                          settings={sessionSettings}
                          currentUser={currentUser}
                          partner={partner}
                          onTurnEnd={() => console.log('Turn ended')}
                        />
                      </CardContent>
                    </Card>
                  )}
                </div>
              </>
            )}
          </TabsContent>

          {/* Agreement Tab */}
          <TabsContent value="agreement" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Partner Agreement System</CardTitle>
                <CardDescription>
                  Test the proposal and agreement workflow
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-3">
                    When you propose changes to session settings, your partner must approve them before they take effect.
                  </p>
                  <Button onClick={createMockProposal}>
                    <Settings className="w-4 h-4 mr-2" />
                    Create Mock Proposal
                  </Button>
                </div>

                {pendingProposal && (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <h4 className="font-medium mb-2">Pending Proposal</h4>
                    <p className="text-sm text-muted-foreground">
                      Status: {pendingProposal.status}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Proposed at: {new Date(pendingProposal.proposedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Mobile/Desktop Preview Note */}
        <Card className="mt-6">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground text-center">
              Currently viewing in <strong>{viewport}</strong> mode. 
              {viewport === 'mobile' 
                ? ' Components are optimized for touch and smaller screens.'
                : ' Components utilize full screen width for better information display.'
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Agreement Modal */}
      {pendingProposal && sessionSettings && (
        <SessionAgreementModal
          open={showAgreementModal}
          onOpenChange={setShowAgreementModal}
          proposal={pendingProposal}
          currentSettings={sessionSettings}
        />
      )}
    </div>
  )
}

export default function TestSessionSettingsPage() {
  return (
    <SessionSettingsProvider>
      <TestContent />
    </SessionSettingsProvider>
  )
}