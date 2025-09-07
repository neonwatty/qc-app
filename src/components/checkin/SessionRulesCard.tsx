'use client'

import { motion } from 'framer-motion'
import { Clock, Pause, Users, Coffee, Timer, Bell, Save, Sparkles } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { SessionSettings } from '@/types'

interface SessionRulesCardProps {
  settings: SessionSettings
  compact?: boolean
}

export function SessionRulesCard({ settings, compact = false }: SessionRulesCardProps) {
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
  }

  const formatTurnDuration = (seconds?: number) => {
    if (!seconds) return null
    if (seconds < 60) return `${seconds}s`
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`
  }

  if (compact) {
    return (
      <Card className="border-muted">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="gap-1">
              <Clock className="w-3 h-3" />
              {formatDuration(settings.sessionDuration)}
            </Badge>
            
            {settings.turnBasedMode && (
              <Badge variant="secondary" className="gap-1">
                <Users className="w-3 h-3" />
                Turn-based
              </Badge>
            )}
            
            {settings.timeoutsPerPartner > 0 && (
              <Badge variant="secondary" className="gap-1">
                <Pause className="w-3 h-3" />
                {settings.timeoutsPerPartner} timeout{settings.timeoutsPerPartner > 1 ? 's' : ''}
              </Badge>
            )}
            
            {settings.warmUpQuestions && (
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="w-3 h-3" />
                Warm-up
              </Badge>
            )}
            
            {settings.coolDownTime > 0 && (
              <Badge variant="secondary" className="gap-1">
                <Coffee className="w-3 h-3" />
                Cool-down
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Active Session Rules</CardTitle>
          <CardDescription>
            Agreed settings for your check-in sessions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Timing Rules */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground">Timing</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Session Duration</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDuration(settings.sessionDuration)}
                  </p>
                </div>
              </div>

              {settings.timeoutsPerPartner > 0 && (
                <div className="flex items-start gap-3">
                  <Pause className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Timeouts</p>
                    <p className="text-sm text-muted-foreground">
                      {settings.timeoutsPerPartner} per partner ({formatDuration(settings.timeoutDuration)} each)
                    </p>
                  </div>
                </div>
              )}

              {settings.coolDownTime > 0 && (
                <div className="flex items-start gap-3">
                  <Coffee className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Cool-down Time</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDuration(settings.coolDownTime)} reflection
                    </p>
                  </div>
                </div>
              )}

              {settings.allowExtensions && (
                <div className="flex items-start gap-3">
                  <Timer className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Extensions</p>
                    <p className="text-sm text-muted-foreground">
                      Allowed when needed
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Discussion Rules */}
          {(settings.turnBasedMode || settings.warmUpQuestions) && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground">Discussion</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {settings.turnBasedMode && (
                    <div className="flex items-start gap-3">
                      <Users className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Turn-based Mode</p>
                        <p className="text-sm text-muted-foreground">
                          {formatTurnDuration(settings.turnDuration)} per turn
                        </p>
                      </div>
                    </div>
                  )}

                  {settings.warmUpQuestions && (
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Warm-up</p>
                        <p className="text-sm text-muted-foreground">
                          Ice-breaker questions
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Features */}
          {(settings.pauseNotifications || settings.autoSaveDrafts) && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground">Features</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {settings.pauseNotifications && (
                    <div className="flex items-start gap-3">
                      <Bell className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Focus Mode</p>
                        <p className="text-sm text-muted-foreground">
                          Notifications paused
                        </p>
                      </div>
                    </div>
                  )}

                  {settings.autoSaveDrafts && (
                    <div className="flex items-start gap-3">
                      <Save className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Auto-save</p>
                        <p className="text-sm text-muted-foreground">
                          Notes saved automatically
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Agreement Info */}
          <Separator />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Version {settings.version}</span>
            <span>Agreed {new Date(settings.agreedAt).toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}