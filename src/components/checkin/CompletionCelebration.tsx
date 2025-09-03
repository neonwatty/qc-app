'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { 
  Sparkles, 
  Heart, 
  Star, 
  Trophy,
  CheckCircle,
  Share2,
  Download,
  Home,
  RefreshCw,
  Calendar
} from 'lucide-react'
import confetti from 'canvas-confetti'

interface CompletionCelebrationProps {
  show: boolean
  duration?: number
  categories?: string[]
  timeSpent?: number
  actionItemsCount?: number
  onClose?: () => void
  onShare?: () => void
  onDownload?: () => void
  onGoHome?: () => void
  onStartNew?: () => void
  className?: string
}

export default function CompletionCelebration({
  show,
  duration = 45,
  categories = [],
  timeSpent = 0,
  actionItemsCount = 0,
  onClose,
  onShare,
  onDownload,
  onGoHome,
  onStartNew,
  className
}: CompletionCelebrationProps) {
  const [isVisible, setIsVisible] = useState(show)
  const [showStats, setShowStats] = useState(false)

  // Trigger confetti animation
  const triggerConfetti = useCallback(() => {
    const count = 200
    const defaults = {
      origin: { y: 0.7 },
      zIndex: 9999
    }

    function fire(particleRatio: number, opts: any) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
        spread: 120,
        scalar: 1.2,
        colors: ['#ec4899', '#a855f7', '#f43f5e', '#fbbf24', '#34d399']
      })
    }

    // Fire multiple bursts for dramatic effect
    fire(0.25, {
      spread: 26,
      startVelocity: 55,
      origin: { x: 0.5, y: 0.6 }
    })
    
    fire(0.2, {
      spread: 60,
      decay: 0.91,
      origin: { x: 0.3, y: 0.7 }
    })
    
    fire(0.35, {
      spread: 100,
      decay: 0.92,
      scalar: 0.8,
      origin: { x: 0.7, y: 0.7 }
    })
    
    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
      origin: { x: 0.5, y: 0.8 }
    })
    
    fire(0.1, {
      spread: 120,
      startVelocity: 45,
      origin: { x: 0.5, y: 0.5 }
    })
  }, [])

  // Heart burst animation
  const triggerHearts = useCallback(() => {
    const scalar = 2
    const heart = confetti.shapeFromText({ text: '❤️', scalar })

    confetti({
      shapes: [heart],
      zIndex: 9999,
      particleCount: 30,
      spread: 90,
      origin: { x: 0.5, y: 0.6 },
      colors: ['#ec4899', '#f43f5e', '#fb7185'],
      scalar
    })
  }, [])

  useEffect(() => {
    if (show) {
      setIsVisible(true)
      // Trigger initial confetti
      setTimeout(triggerConfetti, 100)
      // Show stats after animation
      setTimeout(() => setShowStats(true), 1500)
      // Trigger hearts after a delay
      setTimeout(triggerHearts, 2000)
    } else {
      setIsVisible(false)
      setShowStats(false)
    }
  }, [show, triggerConfetti, triggerHearts])

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} minutes`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={cn(
            'fixed inset-0 z-50 flex items-center justify-center p-4',
            'bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100',
            className
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-full max-w-lg"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ 
              type: 'spring',
              stiffness: 200,
              damping: 20,
              delay: 0.2
            }}
          >
            {/* Main celebration card */}
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Header with animation */}
              <div className="relative bg-gradient-to-r from-pink-500 to-purple-600 p-8 text-white">
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.1 }}
                >
                  <Sparkles className="h-64 w-64" />
                </motion.div>
                
                <div className="relative z-10 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      type: 'spring',
                      delay: 0.5,
                      stiffness: 300
                    }}
                  >
                    <Trophy className="h-16 w-16 mx-auto mb-4 text-yellow-300" />
                  </motion.div>
                  
                  <motion.h2
                    className="text-3xl font-bold mb-2"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    Check-in Complete! 🎉
                  </motion.h2>
                  
                  <motion.p
                    className="text-lg opacity-95"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    Great job taking time for your relationship!
                  </motion.p>
                </div>

                {/* Floating hearts animation */}
                <FloatingHearts />
              </div>

              {/* Stats section */}
              <AnimatePresence>
                {showStats && (
                  <motion.div
                    className="p-6 bg-gray-50 border-t border-gray-100"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h3 className="text-sm font-medium text-gray-700 mb-3">
                      Session Summary
                    </h3>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-purple-600">
                          {categories.length}
                        </div>
                        <div className="text-xs text-gray-600">
                          Topics Discussed
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-pink-600">
                          {formatTime(timeSpent)}
                        </div>
                        <div className="text-xs text-gray-600">
                          Time Together
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-indigo-600">
                          {actionItemsCount}
                        </div>
                        <div className="text-xs text-gray-600">
                          Action Items
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Actions */}
              <div className="p-6 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {onShare && (
                    <Button
                      variant="outline"
                      onClick={onShare}
                      className="gap-2"
                    >
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                  )}
                  {onDownload && (
                    <Button
                      variant="outline"
                      onClick={onDownload}
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  )}
                </div>

                <div className="flex gap-3">
                  {onGoHome && (
                    <Button
                      variant="outline"
                      onClick={onGoHome}
                      className="flex-1 gap-2"
                    >
                      <Home className="h-4 w-4" />
                      Go Home
                    </Button>
                  )}
                  {onStartNew && (
                    <Button
                      onClick={onStartNew}
                      className="flex-1 gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Start Another
                    </Button>
                  )}
                </div>

                {onClose && (
                  <button
                    onClick={onClose}
                    className="w-full text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Close
                  </button>
                )}
              </div>
            </div>

            {/* Additional celebration elements */}
            <motion.div
              className="mt-6 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2 }}
            >
              <p className="text-sm text-gray-600">
                Your next check-in is recommended in
              </p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Calendar className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-purple-600">
                  7 days
                </span>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * Floating hearts background animation
 */
function FloatingHearts() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-2xl"
          initial={{ 
            x: Math.random() * 100 + '%',
            y: '110%',
            opacity: 0.7
          }}
          animate={{ 
            y: '-10%',
            opacity: 0
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            delay: i * 0.5,
            repeat: Infinity,
            repeatDelay: Math.random() * 2
          }}
        >
          {['❤️', '💕', '💖', '💗', '💝', '💞'][i]}
        </motion.div>
      ))}
    </div>
  )
}

/**
 * Simplified celebration for inline use
 */
export function MiniCelebration({
  show,
  message = 'Well done!',
  onComplete
}: {
  show: boolean
  message?: string
  onComplete?: () => void
}) {
  useEffect(() => {
    if (show) {
      // Simple confetti burst
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#ec4899', '#a855f7', '#fbbf24']
      })

      // Auto-hide after 3 seconds
      const timer = setTimeout(() => {
        onComplete?.()
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [show, onComplete])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
        >
          <div className="bg-white rounded-full shadow-lg px-6 py-3 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="font-medium text-gray-900">{message}</span>
            <Sparkles className="h-5 w-5 text-yellow-500" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/**
 * Star rating celebration
 */
export function StarRating({
  rating,
  maxRating = 5,
  size = 'md',
  animated = true,
  onRate
}: {
  rating: number
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
  onRate?: (rating: number) => void
}) {
  const sizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  }

  return (
    <div className="flex items-center gap-1">
      {[...Array(maxRating)].map((_, i) => {
        const filled = i < rating
        
        return (
          <motion.button
            key={i}
            onClick={() => onRate?.(i + 1)}
            disabled={!onRate}
            className={cn(
              'transition-colors',
              onRate && 'cursor-pointer hover:scale-110',
              !onRate && 'cursor-default'
            )}
            initial={animated ? { scale: 0, rotate: -180 } : false}
            animate={animated ? { scale: 1, rotate: 0 } : false}
            transition={{
              type: 'spring',
              delay: i * 0.1,
              stiffness: 300
            }}
            whileTap={onRate ? { scale: 0.9 } : undefined}
          >
            <Star
              className={cn(
                sizes[size],
                filled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
              )}
            />
          </motion.button>
        )
      })}
    </div>
  )
}