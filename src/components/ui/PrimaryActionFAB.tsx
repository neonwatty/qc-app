'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { FAB } from './TouchButton'
import { cn } from '@/lib/utils'
import { Plus, Heart, MessageCircle, Camera, Calendar } from 'lucide-react'
import Link from 'next/link'

interface PrimaryActionConfig {
  path: string | RegExp
  icon: React.ElementType
  label: string
  action: string | (() => void)
  color?: string
  gradient?: string
}

const actionConfigs: PrimaryActionConfig[] = [
  {
    path: '/dashboard',
    icon: MessageCircle,
    label: 'Start Check-in',
    action: '/checkin',
    gradient: 'from-pink-500 to-rose-500'
  },
  {
    path: '/notes',
    icon: Plus,
    label: 'New Note',
    action: () => console.log('New note'),
    gradient: 'from-blue-500 to-indigo-500'
  },
  {
    path: '/checkin',
    icon: Heart,
    label: 'Quick Gratitude',
    action: () => console.log('Quick gratitude'),
    gradient: 'from-purple-500 to-pink-500'
  },
  {
    path: '/growth',
    icon: Camera,
    label: 'Add Milestone',
    action: () => console.log('Add milestone'),
    gradient: 'from-green-500 to-teal-500'
  },
  {
    path: /\/settings/,
    icon: Calendar,
    label: 'Schedule Reminder',
    action: () => console.log('Schedule reminder'),
    gradient: 'from-orange-500 to-amber-500'
  }
]

interface PrimaryActionFABProps {
  className?: string
  disabled?: boolean
}

export const PrimaryActionFAB: React.FC<PrimaryActionFABProps> = ({
  className,
  disabled = false
}) => {
  const pathname = usePathname()
  
  // Find matching action config for current path
  const currentAction = actionConfigs.find(config => {
    if (typeof config.path === 'string') {
      return pathname === config.path
    }
    return config.path.test(pathname)
  })
  
  if (!currentAction || disabled) {
    return null
  }
  
  const Icon = currentAction.icon
  
  const handleAction = () => {
    if (typeof currentAction.action === 'string') {
      // It's a navigation path
      return
    } else {
      // It's a function
      currentAction.action()
    }
  }
  
  const FabContent = (
    <FAB
      className={cn(
        "group shadow-xl hover:shadow-2xl border-0",
        `bg-gradient-to-r ${currentAction.gradient}`,
        "hover:scale-105 active:scale-95 transition-transform",
        className
      )}
      hapticFeedback="medium"
      onClick={typeof currentAction.action === 'function' ? handleAction : undefined}
    >
      <motion.div
        whileHover={{ rotate: 15 }}
        whileTap={{ rotate: -15 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <Icon className="h-6 w-6 text-white group-hover:scale-110 transition-transform" />
      </motion.div>
    </FAB>
  )
  
  // If it's a navigation action, wrap with Link
  if (typeof currentAction.action === 'string') {
    return (
      <Link href={currentAction.action}>
        {FabContent}
      </Link>
    )
  }
  
  return FabContent
}

// Context-aware action bar for mobile
interface ActionBarProps {
  className?: string
}

export const MobileActionBar: React.FC<ActionBarProps> = ({ className }) => {
  const pathname = usePathname()
  
  // Different action sets based on page
  const getActionsForPage = () => {
    switch (pathname) {
      case '/dashboard':
        return [
          { icon: MessageCircle, label: 'Check-in', href: '/checkin', primary: true },
          { icon: Plus, label: 'Add Note', action: () => console.log('Add note') },
          { icon: Heart, label: 'Gratitude', action: () => console.log('Gratitude') }
        ]
      case '/notes':
        return [
          { icon: Plus, label: 'New Note', action: () => console.log('New note'), primary: true },
          { icon: Camera, label: 'Photo Note', action: () => console.log('Photo note') }
        ]
      case '/checkin':
        return [
          { icon: Heart, label: 'Quick Save', action: () => console.log('Quick save'), primary: true }
        ]
      case '/growth':
        return [
          { icon: Camera, label: 'Add Photo', action: () => console.log('Add photo'), primary: true },
          { icon: Plus, label: 'Milestone', action: () => console.log('Milestone') }
        ]
      default:
        return []
    }
  }
  
  const actions = getActionsForPage()
  
  if (actions.length === 0) {
    return null
  }
  
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className={cn(
        "fixed bottom-20 left-4 right-4 z-40 lg:hidden",
        "flex justify-center gap-3",
        className
      )}
    >
      {actions.map((action, index) => {
        const Icon = action.icon
        const isPrimary = action.primary
        
        const ActionButton = (
          <motion.button
            key={action.label}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "flex flex-col items-center justify-center h-16 px-4 rounded-2xl shadow-lg transition-all",
              isPrimary 
                ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white flex-1 max-w-40"
                : "bg-white text-gray-700 border border-gray-200 min-w-16"
            )}
            onClick={action.action}
          >
            <Icon className={cn(
              "h-5 w-5 mb-1",
              isPrimary ? "text-white" : "text-gray-600"
            )} />
            <span className={cn(
              "text-xs font-medium",
              isPrimary ? "text-white" : "text-gray-700"
            )}>
              {action.label}
            </span>
          </motion.button>
        )
        
        if ('href' in action && action.href) {
          return (
            <Link key={action.label} href={action.href} className="flex-1">
              {ActionButton}
            </Link>
          )
        }
        
        return ActionButton
      })}
    </motion.div>
  )
}

export default PrimaryActionFAB