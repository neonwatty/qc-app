'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Loader2, Heart, CheckCircle2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

// Base loading spinner component
export const LoadingSpinner: React.FC<{
  size?: 'sm' | 'md' | 'lg'
  className?: string
}> = ({ size = 'md', className }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className={cn('inline-block', className)}
    >
      <Loader2 className={cn('text-primary', sizeClasses[size])} />
    </motion.div>
  )
}

// Branded loading spinner with heart
export const BrandedLoader: React.FC<{
  size?: 'sm' | 'md' | 'lg'
  className?: string
}> = ({ size = 'md', className }) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <motion.div
      className={cn('flex items-center justify-center', className)}
      animate={{ scale: [1, 1.1, 1] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    >
      <Heart className={cn('text-primary fill-current', sizeClasses[size])} />
    </motion.div>
  )
}

// Dots loading animation
export const LoadingDots: React.FC<{
  className?: string
}> = ({ className }) => {
  return (
    <div className={cn('flex space-x-1', className)}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-primary rounded-full"
          animate={{ y: ['0%', '-50%', '0%'] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.1
          }}
        />
      ))}
    </div>
  )
}

// Progress bar with animation
export const ProgressBar: React.FC<{
  progress: number
  className?: string
  showPercentage?: boolean
}> = ({ progress, className, showPercentage = false }) => {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between mb-1">
        {showPercentage && (
          <span className="text-sm font-medium text-foreground">
            {Math.round(progress)}%
          </span>
        )}
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <motion.div
          className="bg-primary h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

// Loading card skeleton
export const LoadingCard: React.FC<{
  className?: string
  lines?: number
}> = ({ className, lines = 3 }) => {
  return (
    <div className={cn('p-4 space-y-3', className)}>
      <div className="animate-pulse">
        <div className="h-4 bg-muted rounded w-3/4 mb-2" />
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-3 bg-muted rounded',
              i === lines - 1 ? 'w-1/2' : 'w-full'
            )}
          />
        ))}
      </div>
    </div>
  )
}

// Full page loading state
export const PageLoader: React.FC<{
  message?: string
  className?: string
}> = ({ message = 'Loading...', className }) => {
  return (
    <motion.div
      className={cn(
        'fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50',
        className
      )}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="text-center">
        <BrandedLoader size="lg" className="mb-4" />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </motion.div>
  )
}

// Success state with animation
export const SuccessState: React.FC<{
  message?: string
  className?: string
  onComplete?: () => void
}> = ({ message = 'Success!', className, onComplete }) => {
  return (
    <motion.div
      className={cn('flex flex-col items-center text-center', className)}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        type: 'spring', 
        stiffness: 400, 
        damping: 25,
        delay: 0.1
      }}
      onAnimationComplete={onComplete}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 400 }}
      >
        <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
      </motion.div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{message}</h3>
    </motion.div>
  )
}

// Error state with animation
export const ErrorState: React.FC<{
  message?: string
  className?: string
  onRetry?: () => void
}> = ({ message = 'Something went wrong', className, onRetry }) => {
  return (
    <motion.div
      className={cn('flex flex-col items-center text-center', className)}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
      <h3 className="text-lg font-semibold text-foreground mb-2">{message}</h3>
      {onRetry && (
        <motion.button
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRetry}
        >
          Try Again
        </motion.button>
      )}
    </motion.div>
  )
}

// Inline loading state for buttons
export const ButtonLoader: React.FC<{
  isLoading: boolean
  children: React.ReactNode
  className?: string
}> = ({ isLoading, children, className }) => {
  return (
    <span className={cn('flex items-center justify-center gap-2', className)}>
      {isLoading && <LoadingSpinner size="sm" />}
      <motion.span
        animate={{ opacity: isLoading ? 0.7 : 1 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.span>
    </span>
  )
}

// Typing indicator (like in messaging apps)
export const TypingIndicator: React.FC<{
  className?: string
}> = ({ className }) => {
  return (
    <div className={cn('flex items-center space-x-1 px-3 py-2 bg-muted rounded-lg', className)}>
      <span className="text-sm text-muted-foreground">Typing</span>
      <LoadingDots />
    </div>
  )
}

// Staggered list loading
export const ListLoader: React.FC<{
  items?: number
  className?: string
}> = ({ items = 3, className }) => {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1, duration: 0.3 }}
        >
          <LoadingCard lines={2} />
        </motion.div>
      ))}
    </div>
  )
}