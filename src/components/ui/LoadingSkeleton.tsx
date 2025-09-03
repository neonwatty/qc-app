'use client'

import React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Heart, Loader2 } from 'lucide-react'

const skeletonVariants = cva(
  "animate-pulse bg-gray-200 rounded",
  {
    variants: {
      variant: {
        default: "",
        shimmer: "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent",
        pulse: "animate-pulse",
        wave: "animate-[wave_1.5s_ease-in-out_infinite]",
      },
      size: {
        sm: "h-4",
        default: "h-5",
        lg: "h-6",
        xl: "h-8",
      },
      shape: {
        default: "rounded",
        circle: "rounded-full",
        square: "rounded-sm",
        none: "rounded-none",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      shape: "default",
    },
  }
)

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  width?: string | number
  height?: string | number
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant, size, shape, width, height, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(skeletonVariants({ variant, size, shape }), className)}
        style={{
          width,
          height: height || undefined,
          ...style,
        }}
        {...props}
      />
    )
  }
)
Skeleton.displayName = "Skeleton"

// Branded loading spinner for QC app
export function LoadingSpinner({ 
  size = 'default',
  className,
  showBrand = false 
}: { 
  size?: 'sm' | 'default' | 'lg'
  className?: string
  showBrand?: boolean
}) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-8 w-8',
    lg: 'h-12 w-12'
  }

  if (showBrand) {
    return (
      <div className="flex flex-col items-center justify-center space-y-3">
        <div className="relative">
          <div className={cn(
            "animate-spin rounded-full border-4 border-pink-200 border-t-pink-600",
            sizeClasses[size]
          )} />
        </div>
        <div className="flex items-center space-x-2">
          <Heart className="h-4 w-4 text-pink-500 animate-pulse" />
          <span className="text-sm font-medium text-gray-700">Quality Control</span>
        </div>
      </div>
    )
  }

  return (
    <Loader2 className={cn(
      "animate-spin text-gray-600",
      sizeClasses[size],
      className
    )} />
  )
}

// Card skeleton matching existing card patterns
export function CardSkeleton({ 
  showHeader = true,
  showContent = true,
  showFooter = false,
  className,
  children
}: {
  showHeader?: boolean
  showContent?: boolean 
  showFooter?: boolean
  className?: string
  children?: React.ReactNode
}) {
  return (
    <div className={cn(
      "bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 space-y-4",
      className
    )}>
      {showHeader && (
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      )}
      
      {showContent && (
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      )}

      {children}

      {showFooter && (
        <div className="flex space-x-2 pt-2">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-24" />
        </div>
      )}
    </div>
  )
}

// List item skeleton
export function ListItemSkeleton({ 
  showAvatar = false,
  showActions = false,
  className 
}: {
  showAvatar?: boolean
  showActions?: boolean
  className?: string
}) {
  return (
    <div className={cn(
      "flex items-center space-x-3 p-3 border-b border-gray-100",
      className
    )}>
      {showAvatar && (
        <Skeleton shape="circle" className="h-10 w-10 flex-shrink-0" />
      )}
      
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>

      {showActions && (
        <div className="flex space-x-1">
          <Skeleton shape="circle" className="h-8 w-8" />
          <Skeleton shape="circle" className="h-8 w-8" />
        </div>
      )}
    </div>
  )
}

// Dashboard skeleton matching dashboard loading pattern
export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="text-center space-y-4">
        <Skeleton className="h-8 w-64 mx-auto" />
        <Skeleton className="h-4 w-48 mx-auto" />
      </div>

      {/* Quick actions skeleton */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <CardSkeleton key={i} showHeader showFooter />
        ))}
      </div>

      {/* Recent activity skeleton */}
      <CardSkeleton showHeader className="p-6">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <ListItemSkeleton key={i} showAvatar />
          ))}
        </div>
      </CardSkeleton>

      {/* Stats skeleton */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center space-y-2">
            <Skeleton className="h-8 w-12 mx-auto" />
            <Skeleton className="h-4 w-20 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}

// Check-in flow skeleton
export function CheckInSkeleton() {
  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <div className="flex justify-center space-x-2 mb-8">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} shape="circle" className="h-3 w-3" />
        ))}
      </div>

      {/* Main content */}
      <div className="text-center space-y-4">
        <Skeleton className="h-8 w-3/4 mx-auto" />
        <Skeleton className="h-5 w-1/2 mx-auto" />
      </div>

      {/* Options/categories */}
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-3">
            <Skeleton shape="circle" className="h-12 w-12 mx-auto" />
            <Skeleton className="h-5 w-3/4 mx-auto" />
            <Skeleton className="h-3 w-full" />
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex space-x-3 pt-6">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-32 flex-1" />
      </div>
    </div>
  )
}

// Notes skeleton
export function NotesSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-3">
          <div className="flex justify-between items-start">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton shape="circle" className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-3/4" />
          </div>
          <div className="flex justify-between items-center pt-2">
            <div className="flex space-x-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-12" />
            </div>
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Full page loading with branded spinner
export function FullPageLoading({ 
  message = "Loading...",
  showBrand = true 
}: {
  message?: string
  showBrand?: boolean
}) {
  return (
    <div className="flex items-center justify-center min-h-[400px] py-12">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" showBrand={showBrand} />
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  )
}

// Add shimmer animation to global CSS
const shimmerKeyframes = `
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes wave {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}
`

export { 
  Skeleton, 
  skeletonVariants,
  shimmerKeyframes 
}