'use client'

import * as React from "react"
import { motion, PanInfo, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { cn } from "@/lib/utils"
import { hapticFeedback } from '@/lib/haptics'
import { ArrowLeft, ArrowRight } from 'lucide-react'

interface SwipeNavigationProps {
  children: React.ReactNode
  className?: string
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  enableBackSwipe?: boolean
  swipeThreshold?: number
  disabled?: boolean
}

export const SwipeNavigation: React.FC<SwipeNavigationProps> = ({
  children,
  className,
  onSwipeLeft,
  onSwipeRight,
  enableBackSwipe = true,
  swipeThreshold = 100,
  disabled = false
}) => {
  const router = useRouter()
  const [dragOffset, setDragOffset] = React.useState(0)
  const [isDragging, setIsDragging] = React.useState(false)
  
  const handleDrag = (event: any, info: PanInfo) => {
    if (disabled) return
    setDragOffset(info.offset.x)
  }
  
  const handleDragStart = () => {
    if (disabled) return
    setIsDragging(true)
  }
  
  const handleDragEnd = (event: any, info: PanInfo) => {
    if (disabled) return
    
    setIsDragging(false)
    setDragOffset(0)
    
    const { offset, velocity } = info
    const swipeDistance = Math.abs(offset.x)
    const swipeVelocity = Math.abs(velocity.x)
    
    // Determine if swipe meets threshold
    const shouldTrigger = swipeDistance > swipeThreshold || swipeVelocity > 500
    
    if (!shouldTrigger) return
    
    if (offset.x > 0) {
      // Swipe right
      if (enableBackSwipe) {
        hapticFeedback.swipe()
        router.back()
      } else if (onSwipeRight) {
        hapticFeedback.swipe()
        onSwipeRight()
      }
    } else {
      // Swipe left
      if (onSwipeLeft) {
        hapticFeedback.swipe()
        onSwipeLeft()
      }
    }
  }
  
  return (
    <div className={cn("relative", className)}>
      <motion.div
        className="min-h-full"
        drag={disabled ? false : "x"}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.1}
        dragMomentum={false}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        style={{
          x: isDragging && !disabled ? dragOffset * 0.5 : 0,
          touchAction: 'pan-y'
        }}
        transition={{
          type: "spring",
          damping: 30,
          stiffness: 400
        }}
      >
        {children}
      </motion.div>
      
      {/* Visual feedback during drag */}
      {isDragging && Math.abs(dragOffset) > 20 && (
        <div className="absolute inset-0 pointer-events-none">
          {dragOffset > 0 && enableBackSwipe && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <div className={cn(
                "flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full transition-all",
                dragOffset > swipeThreshold ? "bg-green-100 text-green-600 scale-110" : "text-gray-400"
              )}>
                <ArrowLeft className="h-6 w-6" />
              </div>
            </div>
          )}
          
          {dragOffset < 0 && onSwipeLeft && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className={cn(
                "flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full transition-all",
                Math.abs(dragOffset) > swipeThreshold ? "bg-green-100 text-green-600 scale-110" : "text-gray-400"
              )}>
                <ArrowRight className="h-6 w-6" />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Card Stack Component for Tinder-like swiping
interface SwipeableCard {
  id: string
  content: React.ReactNode
}

interface CardStackProps {
  cards: SwipeableCard[]
  onSwipeLeft: (card: SwipeableCard) => void
  onSwipeRight: (card: SwipeableCard) => void
  className?: string
  maxVisible?: number
}

export const CardStack: React.FC<CardStackProps> = ({
  cards,
  onSwipeLeft,
  onSwipeRight,
  className,
  maxVisible = 3
}) => {
  const [currentCards, setCurrentCards] = React.useState(cards)
  const [exitDirection, setExitDirection] = React.useState<'left' | 'right' | null>(null)
  
  React.useEffect(() => {
    setCurrentCards(cards)
  }, [cards])
  
  const handleSwipeLeft = () => {
    if (currentCards.length === 0) return
    
    const card = currentCards[0]
    setExitDirection('left')
    onSwipeLeft(card)
    
    setTimeout(() => {
      setCurrentCards(prev => prev.slice(1))
      setExitDirection(null)
    }, 300)
  }
  
  const handleSwipeRight = () => {
    if (currentCards.length === 0) return
    
    const card = currentCards[0]
    setExitDirection('right')
    onSwipeRight(card)
    
    setTimeout(() => {
      setCurrentCards(prev => prev.slice(1))
      setExitDirection(null)
    }, 300)
  }
  
  const visibleCards = currentCards.slice(0, maxVisible)
  
  return (
    <div className={cn("relative w-full h-96", className)}>
      <AnimatePresence>
        {visibleCards.map((card, index) => (
          <motion.div
            key={card.id}
            style={{
              zIndex: visibleCards.length - index,
            }}
            initial={{
              scale: 1 - index * 0.05,
              y: index * 8,
              opacity: 1 - index * 0.2
            }}
            animate={{
              scale: 1 - index * 0.05,
              y: index * 8,
              opacity: 1 - index * 0.2
            }}
            exit={{
              x: exitDirection === 'left' ? -300 : 300,
              opacity: 0,
              transition: { duration: 0.3 }
            }}
            drag={index === 0 ? "x" : false}
            dragConstraints={{ left: -100, right: 100 }}
            dragElastic={0.1}
            onDragEnd={(event, info) => {
              if (index !== 0) return
              
              const threshold = 100
              const velocity = Math.abs(info.velocity.x)
              
              if (Math.abs(info.offset.x) > threshold || velocity > 500) {
                if (info.offset.x > 0) {
                  handleSwipeRight()
                } else {
                  handleSwipeLeft()
                }
              }
            }}
            whileDrag={{
              scale: 1.05,
              rotate: info => info.offset.x * 0.1,
            }}
            className="absolute inset-0 bg-white rounded-2xl shadow-lg border border-gray-200 cursor-grab active:cursor-grabbing"
          >
            {card.content}
          </motion.div>
        ))}
      </AnimatePresence>
      
      {currentCards.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <p className="text-lg font-medium">All done!</p>
            <p className="text-sm">No more cards to swipe</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Hook for swipe gestures
export const useSwipeGestures = (options?: {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  threshold?: number
}) => {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50
  } = options || {}
  
  const touchStart = React.useRef<{ x: number; y: number } | null>(null)
  const touchEnd = React.useRef<{ x: number; y: number } | null>(null)
  
  const onTouchStart = (e: React.TouchEvent) => {
    touchEnd.current = null
    touchStart.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    }
  }
  
  const onTouchMove = (e: React.TouchEvent) => {
    touchEnd.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    }
  }
  
  const onTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return
    
    const distanceX = touchStart.current.x - touchEnd.current.x
    const distanceY = touchStart.current.y - touchEnd.current.y
    const isLeftSwipe = distanceX > threshold
    const isRightSwipe = distanceX < -threshold
    const isUpSwipe = distanceY > threshold
    const isDownSwipe = distanceY < -threshold
    
    if (Math.abs(distanceX) > Math.abs(distanceY)) {
      // Horizontal swipe
      if (isLeftSwipe && onSwipeLeft) {
        hapticFeedback.swipe()
        onSwipeLeft()
      }
      if (isRightSwipe && onSwipeRight) {
        hapticFeedback.swipe()
        onSwipeRight()
      }
    } else {
      // Vertical swipe
      if (isUpSwipe && onSwipeUp) {
        hapticFeedback.swipe()
        onSwipeUp()
      }
      if (isDownSwipe && onSwipeDown) {
        hapticFeedback.swipe()
        onSwipeDown()
      }
    }
  }
  
  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd
  }
}

export default SwipeNavigation