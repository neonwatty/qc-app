'use client'

import React, { ReactNode } from 'react'
import { 
  AlertCircle, 
  RefreshCw, 
  Home, 
  Wifi, 
  WifiOff, 
  AlertTriangle,
  FileX,
  UserX,
  Settings,
  HelpCircle,
  ChevronRight
} from 'lucide-react'
import { Button } from './button'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface FallbackUIProps {
  type: 
    | 'error' 
    | 'not-found' 
    | 'unauthorized' 
    | 'offline' 
    | 'maintenance' 
    | 'empty-state'
    | 'permission-denied'
    | 'rate-limited'
  title?: string
  message?: string
  action?: {
    label: string
    onClick?: () => void
    href?: string
  }
  showHomeButton?: boolean
  className?: string
  children?: ReactNode
}

export function FallbackUI({
  type,
  title,
  message,
  action,
  showHomeButton = true,
  className,
  children
}: FallbackUIProps) {
  const config = getFallbackConfig(type)
  
  const finalTitle = title || config.title
  const finalMessage = message || config.message
  const IconComponent = config.icon

  return (
    <div className={cn(
      "flex items-center justify-center min-h-[300px] p-6",
      className
    )}>
      <div className="text-center max-w-md space-y-6">
        <div className="flex justify-center">
          <div className={cn(
            "rounded-full p-3",
            config.iconBgClass
          )}>
            <IconComponent className={cn(
              "h-8 w-8",
              config.iconClass
            )} />
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-semibold text-gray-900">
            {finalTitle}
          </h2>
          <p className="text-gray-600">
            {finalMessage}
          </p>
        </div>

        {children}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {action && (
            action.href ? (
              <Link href={action.href}>
                <Button className="w-full sm:w-auto">
                  {action.label}
                </Button>
              </Link>
            ) : (
              <Button onClick={action.onClick} className="w-full sm:w-auto">
                {action.label}
              </Button>
            )
          )}
          
          {showHomeButton && (
            <Link href="/dashboard">
              <Button 
                variant="outline" 
                className="flex items-center gap-2 w-full sm:w-auto"
              >
                <Home className="h-4 w-4" />
                Go to Dashboard
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

// Specific fallback components for common scenarios
export function NotFoundFallback({ 
  resource = "page",
  suggestion,
  className 
}: {
  resource?: string
  suggestion?: string
  className?: string
}) {
  return (
    <FallbackUI
      type="not-found"
      title={`${resource} not found`}
      message={suggestion || `The ${resource.toLowerCase()} you're looking for doesn't exist or has been moved.`}
      action={{
        label: "Go Back",
        onClick: () => window.history.back()
      }}
      className={className}
    />
  )
}

export function OfflineFallback({ className }: { className?: string }) {
  return (
    <FallbackUI
      type="offline"
      action={{
        label: "Try Again",
        onClick: () => window.location.reload()
      }}
      showHomeButton={false}
      className={className}
    />
  )
}

export function UnauthorizedFallback({ className }: { className?: string }) {
  return (
    <FallbackUI
      type="unauthorized"
      action={{
        label: "Sign In",
        href: "/auth/signin"
      }}
      className={className}
    />
  )
}

export function MaintenanceFallback({ 
  estimatedTime,
  className 
}: {
  estimatedTime?: string
  className?: string
}) {
  return (
    <FallbackUI
      type="maintenance"
      message={`We're currently performing scheduled maintenance to improve your experience. ${estimatedTime ? `We'll be back ${estimatedTime}.` : "We'll be back shortly."}`}
      action={{
        label: "Check Status",
        href: "/status"
      }}
      showHomeButton={false}
      className={className}
    />
  )
}

// Empty state component for lists, tables, etc.
export function EmptyState({
  title,
  message,
  actionLabel,
  onAction,
  actionHref,
  icon: IconComponent = FileX,
  className
}: {
  title: string
  message: string
  actionLabel?: string
  onAction?: () => void
  actionHref?: string
  icon?: React.ComponentType<{ className?: string }>
  className?: string
}) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-12 px-6 text-center",
      className
    )}>
      <div className="bg-gray-100 rounded-full p-3 mb-4">
        <IconComponent className="h-8 w-8 text-gray-400" />
      </div>
      
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title}
      </h3>
      
      <p className="text-gray-500 mb-6 max-w-sm">
        {message}
      </p>

      {(actionLabel && (onAction || actionHref)) && (
        actionHref ? (
          <Link href={actionHref}>
            <Button>
              {actionLabel}
            </Button>
          </Link>
        ) : (
          <Button onClick={onAction}>
            {actionLabel}
          </Button>
        )
      )}
    </div>
  )
}

// Loading fallback with retry capability
export function LoadingFallback({
  message = "Loading...",
  onRetry,
  showRetry = false,
  className
}: {
  message?: string
  onRetry?: () => void
  showRetry?: boolean
  className?: string
}) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-12 px-6 text-center space-y-4",
      className
    )}>
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-pink-200 border-t-pink-600" />
      
      <p className="text-gray-600">{message}</p>
      
      {showRetry && onRetry && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRetry}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-3 w-3" />
          Retry
        </Button>
      )}
    </div>
  )
}

// Help and support fallback
export function HelpFallback({
  issue,
  suggestions = [],
  contactSupport = true,
  className
}: {
  issue: string
  suggestions?: string[]
  contactSupport?: boolean
  className?: string
}) {
  return (
    <div className={cn(
      "max-w-2xl mx-auto p-6",
      className
    )}>
      <div className="text-center mb-8">
        <div className="bg-blue-100 rounded-full p-3 w-fit mx-auto mb-4">
          <HelpCircle className="h-8 w-8 text-blue-600" />
        </div>
        
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Need Help?
        </h2>
        
        <p className="text-gray-600">
          {issue}
        </p>
      </div>

      {suggestions.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Try these suggestions:</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start gap-3">
                <ChevronRight className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">{suggestion}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button onClick={() => window.history.back()} variant="outline">
          Go Back
        </Button>
        
        <Link href="/dashboard">
          <Button variant="outline" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Dashboard
          </Button>
        </Link>
        
        {contactSupport && (
          <Link href="/support">
            <Button>
              Contact Support
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}

// Configuration for different fallback types
function getFallbackConfig(type: FallbackUIProps['type']) {
  const configs = {
    error: {
      title: "Something went wrong",
      message: "We encountered an unexpected error. Please try again or contact support if the problem persists.",
      icon: AlertCircle,
      iconClass: "text-red-600",
      iconBgClass: "bg-red-100"
    },
    'not-found': {
      title: "Page not found", 
      message: "The page you're looking for doesn't exist or has been moved.",
      icon: FileX,
      iconClass: "text-gray-600",
      iconBgClass: "bg-gray-100"
    },
    unauthorized: {
      title: "Access denied",
      message: "You don't have permission to access this resource. Please sign in with the correct account.",
      icon: UserX,
      iconClass: "text-yellow-600", 
      iconBgClass: "bg-yellow-100"
    },
    offline: {
      title: "You're offline",
      message: "Please check your internet connection and try again.",
      icon: WifiOff,
      iconClass: "text-orange-600",
      iconBgClass: "bg-orange-100"
    },
    maintenance: {
      title: "Under maintenance",
      message: "We're currently performing scheduled maintenance. Please check back soon.",
      icon: Settings,
      iconClass: "text-blue-600",
      iconBgClass: "bg-blue-100"
    },
    'empty-state': {
      title: "Nothing here yet",
      message: "This area is empty. Start by adding some content.",
      icon: FileX,
      iconClass: "text-gray-400",
      iconBgClass: "bg-gray-100"
    },
    'permission-denied': {
      title: "Permission denied",
      message: "You don't have the required permissions to perform this action.",
      icon: AlertTriangle,
      iconClass: "text-red-600",
      iconBgClass: "bg-red-100"
    },
    'rate-limited': {
      title: "Too many requests",
      message: "You've made too many requests. Please wait a moment before trying again.",
      icon: AlertTriangle,
      iconClass: "text-orange-600", 
      iconBgClass: "bg-orange-100"
    }
  }

  return configs[type] || configs.error
}