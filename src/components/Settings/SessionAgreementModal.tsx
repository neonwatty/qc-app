'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, AlertCircle, Users, Clock, Pause, Coffee, Timer } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Card } from '@/components/ui/card'
import { SessionSettingsProposal, SessionSettings } from '@/types'
import { useSessionSettings } from '@/contexts/SessionSettingsContext'

interface SessionAgreementModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  proposal: SessionSettingsProposal
  currentSettings: SessionSettings | null
}

export function SessionAgreementModal({
  open,
  onOpenChange,
  proposal,
  currentSettings
}: SessionAgreementModalProps) {
  const { acceptProposal, rejectProposal } = useSessionSettings()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleAccept = async () => {
    setIsProcessing(true)
    await new Promise(resolve => setTimeout(resolve, 500)) // Simulate network delay
    acceptProposal(proposal.id)
    setIsProcessing(false)
    onOpenChange(false)
  }

  const handleReject = async () => {
    setIsProcessing(true)
    await new Promise(resolve => setTimeout(resolve, 500)) // Simulate network delay
    rejectProposal(proposal.id)
    setIsProcessing(false)
    onOpenChange(false)
  }

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

  const getChanges = () => {
    if (!currentSettings) return []
    
    const changes: { key: string; label: string; old: any; new: any; icon: any }[] = []
    const p = proposal.settings

    if (p.sessionDuration !== undefined && p.sessionDuration !== currentSettings.sessionDuration) {
      changes.push({
        key: 'sessionDuration',
        label: 'Session Duration',
        old: formatDuration(currentSettings.sessionDuration),
        new: formatDuration(p.sessionDuration),
        icon: Clock
      })
    }

    if (p.timeoutsPerPartner !== undefined && p.timeoutsPerPartner !== currentSettings.timeoutsPerPartner) {
      changes.push({
        key: 'timeoutsPerPartner',
        label: 'Timeouts per Partner',
        old: currentSettings.timeoutsPerPartner,
        new: p.timeoutsPerPartner,
        icon: Pause
      })
    }

    if (p.turnBasedMode !== undefined && p.turnBasedMode !== currentSettings.turnBasedMode) {
      changes.push({
        key: 'turnBasedMode',
        label: 'Turn-based Discussion',
        old: currentSettings.turnBasedMode ? 'Enabled' : 'Disabled',
        new: p.turnBasedMode ? 'Enabled' : 'Disabled',
        icon: Users
      })
    }

    if (p.turnDuration !== undefined && p.turnDuration !== currentSettings.turnDuration) {
      changes.push({
        key: 'turnDuration',
        label: 'Turn Duration',
        old: formatTurnDuration(currentSettings.turnDuration),
        new: formatTurnDuration(p.turnDuration),
        icon: Timer
      })
    }

    if (p.coolDownTime !== undefined && p.coolDownTime !== currentSettings.coolDownTime) {
      changes.push({
        key: 'coolDownTime',
        label: 'Cool-down Time',
        old: formatDuration(currentSettings.coolDownTime),
        new: formatDuration(p.coolDownTime),
        icon: Coffee
      })
    }

    return changes
  }

  const changes = getChanges()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            Session Settings Change Request
          </DialogTitle>
          <DialogDescription>
            Your partner has proposed changes to the session rules. Review and decide whether to accept.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Proposed by:</span>
            <Badge variant="secondary">Partner</Badge>
          </div>

          <Separator />

          {changes.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm font-medium">Proposed Changes:</p>
              {changes.map((change) => {
                const Icon = change.icon
                return (
                  <motion.div
                    key={change.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="relative"
                  >
                    <Card className="p-3">
                      <div className="flex items-start gap-3">
                        <Icon className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium">{change.label}</p>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground line-through">
                              {change.old}
                            </span>
                            <span className="text-muted-foreground">→</span>
                            <span className="font-medium text-primary">
                              {change.new}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No specific changes detected
            </p>
          )}

          <Separator />

          <div className="bg-muted/50 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">
              <strong>Note:</strong> Both partners must agree on session settings. 
              These rules will apply to all future check-in sessions until changed again.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleReject}
            disabled={isProcessing}
          >
            <X className="w-4 h-4 mr-2" />
            Decline
          </Button>
          <Button
            onClick={handleAccept}
            disabled={isProcessing}
          >
            <Check className="w-4 h-4 mr-2" />
            Accept Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}