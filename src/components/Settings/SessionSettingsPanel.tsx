'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, Timer, RotateCcw, Bell, Save, HelpCircle, Users, Pause, Coffee, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useSessionSettings } from '@/contexts/SessionSettingsContext'
import { SessionTemplate } from '@/types'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export function SessionSettingsPanel() {
  const { 
    currentSettings, 
    pendingProposal,
    templates,
    proposeSettings, 
    applyTemplate,
    getActiveSettings 
  } = useSessionSettings()

  const [localSettings, setLocalSettings] = useState(() => getActiveSettings())
  const [hasChanges, setHasChanges] = useState(false)

  const handleChange = (key: string, value: number | boolean) => {
    setLocalSettings(prev => ({
      ...prev!,
      [key]: value
    }))
    setHasChanges(true)
  }

  const handleSave = () => {
    if (!localSettings) return
    
    const {
      id,
      coupleId,
      agreedAt,
      agreedBy,
      version,
      ...settingsToPropose
    } = localSettings
    
    proposeSettings(settingsToPropose)
    setHasChanges(false)
  }

  const handleTemplateSelect = (templateType: SessionTemplate) => {
    applyTemplate(templateType)
    const template = templates.find(t => t.type === templateType)
    if (template) {
      setLocalSettings(prev => ({
        ...prev!,
        ...template.settings
      }))
      setHasChanges(true)
    }
  }

  if (!localSettings) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {pendingProposal && (
        <Card className="border-2 border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardHeader>
            <CardTitle className="text-yellow-700 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Pending Settings Change
            </CardTitle>
            <CardDescription className="text-yellow-600">
              Your partner has proposed changes to the session settings. Review and approve to apply them.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Session Rules</CardTitle>
          <CardDescription>
            Configure your check-in session preferences. Both partners must agree on changes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Templates - Updated to vertical layout */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Quick Templates</Label>
            <div className="flex flex-col space-y-3">
              {templates.map((template) => (
                <Button
                  key={template.type}
                  variant="outline"
                  className="h-auto min-h-[60px] p-4 justify-start text-left whitespace-normal hover:bg-pink-50 hover:border-pink-300 transition-colors w-full"
                  onClick={() => handleTemplateSelect(template.type)}
                >
                  <div className="w-full space-y-1">
                    <div className="font-semibold text-sm">{template.name}</div>
                    <div className="text-xs text-muted-foreground leading-relaxed">
                      {template.description}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          <Tabs defaultValue="timing" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-auto flex-wrap sm:flex-nowrap">
              <TabsTrigger value="timing" className="text-xs sm:text-sm">Timing</TabsTrigger>
              <TabsTrigger value="discussion" className="text-xs sm:text-sm">Discussion</TabsTrigger>
              <TabsTrigger value="features" className="text-xs sm:text-sm">Features</TabsTrigger>
            </TabsList>

            <TabsContent value="timing" className="space-y-6 mt-6">
              {/* Session Duration */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base">
                    <Clock className="w-4 h-4 inline mr-2" />
                    Session Duration
                  </Label>
                  <span className="text-sm font-medium">
                    {localSettings.sessionDuration} minutes
                  </span>
                </div>
                <Slider
                  value={[localSettings.sessionDuration]}
                  onValueChange={([value]: number[]) => handleChange('sessionDuration', value)}
                  min={5}
                  max={30}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>5 min</span>
                  <span>30 min</span>
                </div>
              </div>

              {/* Timeouts */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base">
                    <Pause className="w-4 h-4 inline mr-2" />
                    Timeouts per Partner
                  </Label>
                  <span className="text-sm font-medium">
                    {localSettings.timeoutsPerPartner} timeouts
                  </span>
                </div>
                <Slider
                  value={[localSettings.timeoutsPerPartner]}
                  onValueChange={([value]: number[]) => handleChange('timeoutsPerPartner', value)}
                  min={0}
                  max={3}
                  step={1}
                  className="w-full"
                />
              </div>

              {localSettings.timeoutsPerPartner > 0 && (
                <div className="space-y-3 pl-6">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Timeout Duration</Label>
                    <span className="text-sm font-medium">
                      {localSettings.timeoutDuration} minutes
                    </span>
                  </div>
                  <Slider
                    value={[localSettings.timeoutDuration]}
                    onValueChange={([value]: number[]) => handleChange('timeoutDuration', value)}
                    min={1}
                    max={5}
                    step={1}
                    className="w-full"
                  />
                </div>
              )}

              {/* Cool-down Time */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base">
                    <Coffee className="w-4 h-4 inline mr-2" />
                    Cool-down Reflection Time
                  </Label>
                  <span className="text-sm font-medium">
                    {localSettings.coolDownTime} minutes
                  </span>
                </div>
                <Slider
                  value={[localSettings.coolDownTime]}
                  onValueChange={([value]: number[]) => handleChange('coolDownTime', value)}
                  min={0}
                  max={5}
                  step={1}
                  className="w-full"
                />
              </div>
            </TabsContent>

            <TabsContent value="discussion" className="space-y-6 mt-6">
              {/* Turn-based Mode */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">
                    <Users className="w-4 h-4 inline mr-2" />
                    Turn-based Discussion
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Take turns speaking to ensure equal participation
                  </p>
                </div>
                <Switch
                  checked={localSettings.turnBasedMode}
                  onCheckedChange={(checked: boolean) => handleChange('turnBasedMode', checked)}
                />
              </div>

              {localSettings.turnBasedMode && (
                <div className="space-y-3 pl-6">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Turn Duration</Label>
                    <span className="text-sm font-medium">
                      {localSettings.turnDuration} seconds
                    </span>
                  </div>
                  <Slider
                    value={[localSettings.turnDuration || 90]}
                    onValueChange={([value]: number[]) => handleChange('turnDuration', value)}
                    min={30}
                    max={180}
                    step={30}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>30s</span>
                    <span>3 min</span>
                  </div>
                </div>
              )}

              {/* Warm-up Questions */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">
                    <HelpCircle className="w-4 h-4 inline mr-2" />
                    Warm-up Questions
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Start with ice-breaker questions
                  </p>
                </div>
                <Switch
                  checked={localSettings.warmUpQuestions}
                  onCheckedChange={(checked: boolean) => handleChange('warmUpQuestions', checked)}
                />
              </div>
            </TabsContent>

            <TabsContent value="features" className="space-y-6 mt-6">
              {/* Allow Extensions */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">
                    <Timer className="w-4 h-4 inline mr-2" />
                    Allow Session Extensions
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Option to extend time when needed
                  </p>
                </div>
                <Switch
                  checked={localSettings.allowExtensions}
                  onCheckedChange={(checked: boolean) => handleChange('allowExtensions', checked)}
                />
              </div>

              {/* Pause Notifications */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">
                    <Bell className="w-4 h-4 inline mr-2" />
                    Pause Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Silence interruptions during sessions
                  </p>
                </div>
                <Switch
                  checked={localSettings.pauseNotifications}
                  onCheckedChange={(checked: boolean) => handleChange('pauseNotifications', checked)}
                />
              </div>

              {/* Auto-save Drafts */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">
                    <Save className="w-4 h-4 inline mr-2" />
                    Auto-save Drafts
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically save notes as you type
                  </p>
                </div>
                <Switch
                  checked={localSettings.autoSaveDrafts}
                  onCheckedChange={(checked: boolean) => handleChange('autoSaveDrafts', checked)}
                />
              </div>
            </TabsContent>
          </Tabs>

          {hasChanges && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span className="text-sm">You have unsaved changes</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setLocalSettings(getActiveSettings())
                    setHasChanges(false)
                  }}
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Reset
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                >
                  Propose Changes
                </Button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}