'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Users, UserCheck, UserX, Eye, Edit3 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface Partner {
  id: string
  name: string
  avatar?: string
  initials?: string
}

export type PartnerStatus = 'online' | 'away' | 'offline' | 'typing' | 'viewing'

interface PartnerPresenceProps {
  partner: Partner
  status: PartnerStatus
  lastSeen?: Date
  currentActivity?: {
    type: 'viewing' | 'editing' | 'navigating'
    context?: string // e.g., "Category: Communication"
  }
  className?: string
  showDetails?: boolean
  compact?: boolean
}

export function PartnerPresence({
  partner,
  status,
  lastSeen,
  currentActivity,
  className,
  showDetails = true,
  compact = false
}: PartnerPresenceProps) {
  const [typingDots, setTypingDots] = useState(0)

  useEffect(() => {
    if (status === 'typing') {
      const interval = setInterval(() => {
        setTypingDots(prev => (prev + 1) % 4)
      }, 500)
      return () => clearInterval(interval)
    }
  }, [status])

  const getStatusColor = () => {
    switch (status) {
      case 'online':
      case 'viewing':
        return 'bg-green-500'
      case 'typing':
        return 'bg-blue-500'
      case 'away':
        return 'bg-yellow-500'
      case 'offline':
      default:
        return 'bg-gray-400'
    }
  }

  const getStatusLabel = () => {
    switch (status) {
      case 'online':
        return 'Active now'
      case 'typing':
        return `${partner.name} is typing${'.'.repeat(typingDots)}`
      case 'viewing':
        return `${partner.name} is viewing`
      case 'away':
        return 'Away'
      case 'offline':
        return lastSeen ? `Last seen ${formatLastSeen(lastSeen)}` : 'Offline'
      default:
        return ''
    }
  }

  const formatLastSeen = (date: Date) => {
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return date.toLocaleDateString()
  }

  const getActivityIcon = () => {
    if (!currentActivity) return null

    switch (currentActivity.type) {
      case 'viewing':
        return <Eye className="h-3 w-3" />
      case 'editing':
        return <Edit3 className="h-3 w-3" />
      default:
        return null
    }
  }

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn('relative inline-block', className)}>
              <Avatar className="h-8 w-8">
                <AvatarImage src={partner.avatar} alt={partner.name} />
                <AvatarFallback className="text-xs">
                  {partner.initials || partner.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span
                className={cn(
                  'absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-background',
                  getStatusColor()
                )}
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-medium">{partner.name}</p>
              <p className="text-xs">{getStatusLabel()}</p>
              {currentActivity && (
                <p className="text-xs text-muted-foreground">
                  {currentActivity.context}
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <motion.div
      className={cn('flex items-center gap-3', className)}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative">
        <Avatar className="h-10 w-10">
          <AvatarImage src={partner.avatar} alt={partner.name} />
          <AvatarFallback>
            {partner.initials || partner.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <motion.span
          className={cn(
            'absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-background',
            getStatusColor()
          )}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </div>

      {showDetails && (
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium truncate">{partner.name}</p>
            {currentActivity && (
              <Badge variant="secondary" className="h-5 px-1.5 py-0">
                <span className="flex items-center gap-1">
                  {getActivityIcon()}
                  <span className="text-xs">{currentActivity.type}</span>
                </span>
              </Badge>
            )}
          </div>

          <AnimatePresence mode="wait">
            <motion.p
              key={status}
              className="text-xs text-muted-foreground"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.2 }}
            >
              {getStatusLabel()}
            </motion.p>
          </AnimatePresence>

          {currentActivity?.context && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {currentActivity.context}
            </p>
          )}
        </div>
      )}
    </motion.div>
  )
}

interface MultiplePartnersPresenceProps {
  partners: Array<{
    partner: Partner
    status: PartnerStatus
    lastSeen?: Date
  }>
  className?: string
  maxDisplay?: number
}

export function MultiplePartnersPresence({
  partners,
  className,
  maxDisplay = 3
}: MultiplePartnersPresenceProps) {
  const displayPartners = partners.slice(0, maxDisplay)
  const remainingCount = Math.max(0, partners.length - maxDisplay)

  return (
    <div className={cn('flex items-center -space-x-2', className)}>
      {displayPartners.map(({ partner, status }) => (
        <div
          key={partner.id}
          className="relative inline-block ring-2 ring-background rounded-full"
        >
          <Avatar className="h-8 w-8 border-2 border-background">
            <AvatarImage src={partner.avatar} alt={partner.name} />
            <AvatarFallback className="text-xs">
              {partner.initials || partner.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {status === 'online' && (
            <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 bg-green-500 rounded-full ring-2 ring-background" />
          )}
        </div>
      ))}

      {remainingCount > 0 && (
        <div className="relative inline-flex h-8 w-8 items-center justify-center rounded-full bg-muted ring-2 ring-background">
          <span className="text-xs font-medium">+{remainingCount}</span>
        </div>
      )}
    </div>
  )
}