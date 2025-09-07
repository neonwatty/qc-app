'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  MessageCircle, 
  StickyNote, 
  TrendingUp, 
  Settings, 
  Menu,
  X,
  Sparkles,
  Bell
} from 'lucide-react'
import { MotionBox, MotionButton } from '@/components/ui/motion'
import { cn } from '@/lib/utils'

const navigationItems = [
  {
    name: 'Home',
    href: '/',
    icon: Sparkles,
    mobileOrder: 1,
    color: 'rose',
    gradient: 'from-rose-500 to-pink-500'
  },
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    mobileOrder: 2,
    color: 'purple',
    gradient: 'from-purple-500 to-purple-600'
  },
  {
    name: 'Check-in',
    href: '/checkin',
    icon: MessageCircle,
    mobileOrder: 3,
    color: 'pink',
    gradient: 'from-pink-500 to-rose-500'
  },
  {
    name: 'Notes',
    href: '/notes',
    icon: StickyNote,
    mobileOrder: 4,
    color: 'yellow',
    gradient: 'from-yellow-400 to-orange-400'
  },
  {
    name: 'Growth',
    href: '/growth',
    icon: TrendingUp,
    mobileOrder: 5,
    color: 'teal',
    gradient: 'from-teal-500 to-cyan-500'
  },
  {
    name: 'Reminders',
    href: '/reminders',
    icon: Bell,
    mobileOrder: 6,
    color: 'indigo',
    gradient: 'from-indigo-500 to-purple-500'
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    mobileOrder: 7,
    color: 'violet',
    gradient: 'from-violet-500 to-indigo-500'
  }
]

interface NavigationProps {
  className?: string
}

export const Navigation: React.FC<NavigationProps> = ({ className = '' }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  const isActive = (href: string) => {
    // During SSR, don't mark anything as active to avoid hydration mismatch
    if (!mounted) {
      return false
    }
    
    // Exact match for home page
    if (href === '/') {
      return pathname === '/'
    }
    
    // For all other pages, use startsWith to catch sub-routes
    return pathname === href || pathname?.startsWith(href + '/')
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <MotionBox 
        variant="slideRight" 
        delay={0.2}
        className={`hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:w-64 ${className}`}
      >
        <div className="flex flex-col flex-1 bg-white/95 backdrop-blur-md border-r border-rose-200/40 shadow-lg shadow-rose-100/50">
          <div className="flex flex-col flex-1 pt-20 pb-4 overflow-y-auto">
            <nav className="flex-1 px-4 space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-300 group hover-lift",
                      active
                        ? "gradient-primary text-white shadow-lg shadow-rose-200/50"
                        : "text-gray-600 hover:bg-rose-50/80 hover:shadow-md hover:text-rose-600"
                    )}
                  >
                    <Icon
                      className={cn(
                        "mr-3 h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110",
                        active ? "text-white" : "text-gray-400 group-hover:text-purple-500"
                      )}
                    />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </MotionBox>

      {/* Mobile Bottom Navigation */}
      <MotionBox 
        variant="slideUp" 
        delay={0.3}
        className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-rose-200/40 shadow-lg shadow-rose-100/30"
      >
        <nav className="flex justify-around items-center py-2 px-1">
          {navigationItems
            .sort((a, b) => a.mobileOrder - b.mobileOrder)
            .slice(0, 4) // Show only first 4 items on mobile
            .map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center px-3 py-2 text-xs font-medium transition-all duration-300 min-w-0 flex-1 rounded-2xl",
                    active 
                      ? "text-rose-600 bg-rose-50" 
                      : "text-gray-500 hover:bg-rose-50/60"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 mb-1 transition-transform",
                      active ? "text-rose-600 scale-110" : "text-gray-400"
                    )}
                  />
                  <span className="truncate">{item.name}</span>
                </Link>
              )
            })}
          
          {/* Menu button for Settings on mobile */}
          <MotionButton
            onClick={() => setIsSidebarOpen(true)}
            className="flex flex-col items-center justify-center px-3 py-2 text-xs font-medium text-gray-500 min-w-0 flex-1"
          >
            <Menu className="h-5 w-5 mb-1 text-gray-400" />
            <span className="truncate">More</span>
          </MotionButton>
        </nav>
      </MotionBox>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
          
          {/* Sidebar */}
          <MotionBox
            variant="slideRight"
            className="fixed inset-y-0 right-0 w-64 bg-white shadow-xl"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
                <MotionButton
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </MotionButton>
              </div>
              
              <nav className="flex-1 px-4 py-6 space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href)
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setIsSidebarOpen(false)}
                      className={cn(
                        "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors group",
                        active
                          ? "bg-pink-50 text-pink-700 border border-pink-200"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      )}
                    >
                      <Icon
                        className={cn(
                          "mr-3 h-5 w-5 flex-shrink-0",
                          active ? "text-pink-600" : "text-gray-400 group-hover:text-gray-500"
                        )}
                      />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </div>
          </MotionBox>
        </div>
      )}
    </>
  )
}