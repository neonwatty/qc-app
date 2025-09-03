'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Lock, Users, Check } from 'lucide-react'
import { motion } from 'framer-motion'

interface NoteTabsProps {
  activeTab: 'private' | 'shared'
  onTabChange: (tab: 'private' | 'shared') => void
  hasPrivateContent?: boolean
  hasSharedContent?: boolean
  className?: string
}

export default function NoteTabs({
  activeTab,
  onTabChange,
  hasPrivateContent = false,
  hasSharedContent = false,
  className
}: NoteTabsProps) {
  const tabs = [
    {
      id: 'private' as const,
      label: 'Private Notes',
      icon: Lock,
      description: 'Only visible to you',
      hasContent: hasPrivateContent,
      color: 'indigo'
    },
    {
      id: 'shared' as const,
      label: 'Shared Notes',
      icon: Users,
      description: 'Visible to both partners',
      hasContent: hasSharedContent,
      color: 'emerald'
    }
  ]

  return (
    <div className={cn('bg-white rounded-lg shadow-sm border border-gray-200', className)}>
      <div className="flex p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'flex-1 relative group transition-all duration-200',
                'px-4 py-3 rounded-md',
                'focus:outline-none focus:ring-2 focus:ring-offset-2',
                isActive ? `focus:ring-${tab.color}-500` : 'focus:ring-gray-400'
              )}
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
            >
              {/* Background animation */}
              {isActive && (
                <motion.div
                  layoutId="activeTabBackground"
                  className={cn(
                    'absolute inset-0 rounded-md',
                    tab.id === 'private' 
                      ? 'bg-gradient-to-r from-indigo-500 to-indigo-600'
                      : 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                  )}
                  initial={false}
                  transition={{
                    type: 'spring',
                    stiffness: 380,
                    damping: 30
                  }}
                />
              )}

              {/* Tab content */}
              <div className={cn(
                'relative z-10 flex items-center justify-center space-x-2',
                'transition-colors duration-200',
                isActive ? 'text-white' : 'text-gray-600 group-hover:text-gray-900'
              )}>
                <Icon className={cn(
                  'h-4 w-4 transition-transform duration-200',
                  isActive && 'transform scale-110'
                )} />
                
                <div className="text-left">
                  <div className="font-medium">{tab.label}</div>
                  <div className={cn(
                    'text-xs transition-opacity duration-200',
                    isActive ? 'opacity-90' : 'opacity-60 group-hover:opacity-80'
                  )}>
                    {tab.description}
                  </div>
                </div>

                {/* Content indicator */}
                {tab.hasContent && (
                  <div className={cn(
                    'absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full',
                    'flex items-center justify-center',
                    isActive 
                      ? 'bg-white' 
                      : tab.id === 'private'
                        ? 'bg-indigo-500'
                        : 'bg-emerald-500',
                    'transition-all duration-200'
                  )}>
                    {isActive && (
                      <Check className="h-1.5 w-1.5 text-indigo-600" />
                    )}
                  </div>
                )}
              </div>

              {/* Hover effect */}
              {!isActive && (
                <div className={cn(
                  'absolute inset-0 rounded-md',
                  'bg-gray-100 opacity-0 group-hover:opacity-100',
                  'transition-opacity duration-200'
                )} />
              )}
            </button>
          )
        })}
      </div>

      {/* Tab indicator line */}
      <div className="relative h-0.5 bg-gray-200">
        <motion.div
          layoutId="tabIndicator"
          className={cn(
            'absolute h-full',
            activeTab === 'private' 
              ? 'bg-gradient-to-r from-indigo-500 to-indigo-600'
              : 'bg-gradient-to-r from-emerald-500 to-emerald-600'
          )}
          initial={false}
          animate={{
            x: activeTab === 'private' ? '0%' : '100%',
            width: '50%'
          }}
          transition={{
            type: 'spring',
            stiffness: 380,
            damping: 30
          }}
        />
      </div>

      {/* Visual privacy indicator */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-center space-x-4 text-xs">
          {activeTab === 'private' ? (
            <>
              <Lock className="h-3.5 w-3.5 text-indigo-600" />
              <span className="text-indigo-700 font-medium">
                This content is completely private to you
              </span>
            </>
          ) : (
            <>
              <Users className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-emerald-700 font-medium">
                This content will be shared with your partner
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}