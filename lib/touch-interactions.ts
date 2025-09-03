/**
 * Touch interaction utilities for enhanced mobile experience
 * Provides gesture recognition, touch feedback, and mobile-optimized interactions
 */

import { hapticFeedback } from '@/lib/haptics'

export interface TouchPosition {
  x: number
  y: number
}

export interface TouchEventData {
  startTime: number
  startPosition: TouchPosition
  currentPosition: TouchPosition
  deltaX: number
  deltaY: number
  distance: number
  velocity: number
  duration: number
}

export interface SwipeGestureOptions {
  threshold?: number
  velocityThreshold?: number
  preventDefaultOnSwipe?: boolean
  enableHapticFeedback?: boolean
}

export interface LongPressOptions {
  duration?: number
  threshold?: number
  enableHapticFeedback?: boolean
  preventContextMenu?: boolean
}

export interface PinchGestureOptions {
  threshold?: number
  enableHapticFeedback?: boolean
}

/**
 * Enhanced touch event manager for gesture recognition
 */
export class TouchInteractionManager {
  private startTouch: Touch | null = null
  private startTime: number = 0
  private longPressTimer: number | null = null
  private element: HTMLElement
  private options: {
    preventContextMenu?: boolean
    enableHapticFeedback?: boolean
  }

  constructor(element: HTMLElement, options = {}) {
    this.element = element
    this.options = options
    
    // Ensure touch-action is set for optimal touch handling
    if (!element.style.touchAction) {
      element.style.touchAction = 'manipulation'
    }
  }

  /**
   * Calculate touch event data from touch events
   */
  private calculateTouchData(startTouch: Touch, currentTouch: Touch): TouchEventData {
    const startPosition = { x: startTouch.clientX, y: startTouch.clientY }
    const currentPosition = { x: currentTouch.clientX, y: currentTouch.clientY }
    const deltaX = currentPosition.x - startPosition.x
    const deltaY = currentPosition.y - startPosition.y
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
    const duration = Date.now() - this.startTime
    const velocity = distance / (duration || 1)

    return {
      startTime: this.startTime,
      startPosition,
      currentPosition,
      deltaX,
      deltaY,
      distance,
      velocity,
      duration
    }
  }

  /**
   * Set up swipe gesture recognition
   */
  setupSwipeGesture(
    onSwipe: (direction: 'left' | 'right' | 'up' | 'down', data: TouchEventData) => void,
    options: SwipeGestureOptions = {}
  ) {
    const {
      threshold = 50,
      velocityThreshold = 0.3,
      preventDefaultOnSwipe = true,
      enableHapticFeedback = true
    } = options

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        this.startTouch = e.touches[0]
        this.startTime = Date.now()
        
        if (this.options.preventContextMenu) {
          e.preventDefault()
        }
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (!this.startTouch || e.changedTouches.length !== 1) return

      const endTouch = e.changedTouches[0]
      const touchData = this.calculateTouchData(this.startTouch, endTouch)

      // Determine swipe direction
      if (touchData.distance >= threshold && touchData.velocity >= velocityThreshold) {
        let direction: 'left' | 'right' | 'up' | 'down'
        
        if (Math.abs(touchData.deltaX) > Math.abs(touchData.deltaY)) {
          // Horizontal swipe
          direction = touchData.deltaX > 0 ? 'right' : 'left'
        } else {
          // Vertical swipe
          direction = touchData.deltaY > 0 ? 'down' : 'up'
        }

        if (preventDefaultOnSwipe) {
          e.preventDefault()
        }

        if (enableHapticFeedback) {
          hapticFeedback.swipe()
        }

        onSwipe(direction, touchData)
      }

      this.startTouch = null
    }

    this.element.addEventListener('touchstart', handleTouchStart, { passive: !this.options.preventContextMenu })
    this.element.addEventListener('touchend', handleTouchEnd, { passive: !preventDefaultOnSwipe })

    // Return cleanup function
    return () => {
      this.element.removeEventListener('touchstart', handleTouchStart)
      this.element.removeEventListener('touchend', handleTouchEnd)
    }
  }

  /**
   * Set up long press gesture recognition
   */
  setupLongPressGesture(
    onLongPress: (data: TouchEventData) => void,
    options: LongPressOptions = {}
  ) {
    const {
      duration = 500,
      threshold = 10,
      enableHapticFeedback = true,
      preventContextMenu = true
    } = options

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        this.startTouch = e.touches[0]
        this.startTime = Date.now()

        if (preventContextMenu) {
          e.preventDefault()
        }

        // Set long press timer
        this.longPressTimer = window.setTimeout(() => {
          if (this.startTouch) {
            const touchData = this.calculateTouchData(this.startTouch, this.startTouch)
            
            if (enableHapticFeedback) {
              hapticFeedback.longPress()
            }
            
            onLongPress(touchData)
          }
        }, duration)
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (this.startTouch && this.longPressTimer && e.touches.length === 1) {
        const currentTouch = e.touches[0]
        const touchData = this.calculateTouchData(this.startTouch, currentTouch)

        // Cancel long press if moved too far
        if (touchData.distance > threshold) {
          clearTimeout(this.longPressTimer)
          this.longPressTimer = null
        }
      }
    }

    const handleTouchEnd = () => {
      if (this.longPressTimer) {
        clearTimeout(this.longPressTimer)
        this.longPressTimer = null
      }
      this.startTouch = null
    }

    this.element.addEventListener('touchstart', handleTouchStart, { passive: !preventContextMenu })
    this.element.addEventListener('touchmove', handleTouchMove, { passive: true })
    this.element.addEventListener('touchend', handleTouchEnd, { passive: true })

    // Return cleanup function
    return () => {
      if (this.longPressTimer) {
        clearTimeout(this.longPressTimer)
      }
      this.element.removeEventListener('touchstart', handleTouchStart)
      this.element.removeEventListener('touchmove', handleTouchMove)
      this.element.removeEventListener('touchend', handleTouchEnd)
    }
  }

  /**
   * Set up pull-to-refresh gesture
   */
  setupPullToRefresh(
    onRefresh: () => void,
    options: { threshold?: number; enableHapticFeedback?: boolean } = {}
  ) {
    const { threshold = 70, enableHapticFeedback = true } = options
    let startY = 0
    let currentY = 0
    let isRefreshing = false

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1 && window.scrollY === 0) {
        startY = e.touches[0].clientY
        isRefreshing = false
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!startY || e.touches.length !== 1) return

      currentY = e.touches[0].clientY
      const deltaY = currentY - startY

      if (deltaY > 0 && window.scrollY === 0) {
        // Prevent default scrolling when pulling down at top
        e.preventDefault()
        
        // Visual feedback could be added here
        this.element.style.transform = `translateY(${Math.min(deltaY * 0.5, threshold)}px)`
      }
    }

    const handleTouchEnd = () => {
      if (!startY) return

      const deltaY = currentY - startY

      if (deltaY > threshold && !isRefreshing) {
        isRefreshing = true
        
        if (enableHapticFeedback) {
          hapticFeedback.success()
        }
        
        onRefresh()
      }

      // Reset transform
      this.element.style.transform = ''
      startY = 0
      currentY = 0
    }

    this.element.addEventListener('touchstart', handleTouchStart, { passive: false })
    this.element.addEventListener('touchmove', handleTouchMove, { passive: false })
    this.element.addEventListener('touchend', handleTouchEnd, { passive: true })

    // Return cleanup function
    return () => {
      this.element.removeEventListener('touchstart', handleTouchStart)
      this.element.removeEventListener('touchmove', handleTouchMove)
      this.element.removeEventListener('touchend', handleTouchEnd)
    }
  }
}

/**
 * Utility functions for touch interactions
 */

/**
 * Enhanced touch target size enforcement
 */
export const ensureTouchTarget = (element: HTMLElement, minSize = 44) => {
  const computedStyle = getComputedStyle(element)
  const currentHeight = parseInt(computedStyle.height)
  const currentWidth = parseInt(computedStyle.width)

  if (currentHeight < minSize) {
    element.style.minHeight = `${minSize}px`
  }
  
  if (currentWidth < minSize) {
    element.style.minWidth = `${minSize}px`
  }

  // Ensure touch-action is set
  if (!element.style.touchAction) {
    element.style.touchAction = 'manipulation'
  }
}

/**
 * Add touch ripple effect to elements
 */
export const addTouchRipple = (element: HTMLElement, color = 'rgba(255, 255, 255, 0.3)') => {
  element.style.position = 'relative'
  element.style.overflow = 'hidden'

  const handleTouch = (e: TouchEvent) => {
    const ripple = document.createElement('div')
    const rect = element.getBoundingClientRect()
    const size = Math.max(rect.width, rect.height)
    const x = e.touches[0].clientX - rect.left - size / 2
    const y = e.touches[0].clientY - rect.top - size / 2

    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      transform: scale(0);
      animation: ripple 0.6s ease-out;
      background-color: ${color};
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      pointer-events: none;
    `

    element.appendChild(ripple)

    // Remove ripple after animation
    setTimeout(() => {
      ripple.remove()
    }, 600)
  }

  // Add ripple animation keyframes if not already present
  if (!document.querySelector('#touch-ripple-keyframes')) {
    const style = document.createElement('style')
    style.id = 'touch-ripple-keyframes'
    style.textContent = `
      @keyframes ripple {
        to {
          transform: scale(4);
          opacity: 0;
        }
      }
    `
    document.head.appendChild(style)
  }

  element.addEventListener('touchstart', handleTouch, { passive: true })

  return () => {
    element.removeEventListener('touchstart', handleTouch)
  }
}

/**
 * Optimize element for touch interactions
 */
export const optimizeForTouch = (element: HTMLElement, options: {
  minTouchSize?: number
  enableRipple?: boolean
  rippleColor?: string
  preventContextMenu?: boolean
} = {}) => {
  const {
    minTouchSize = 44,
    enableRipple = false,
    rippleColor = 'rgba(255, 255, 255, 0.3)',
    preventContextMenu = false
  } = options

  // Ensure minimum touch target size
  ensureTouchTarget(element, minTouchSize)

  // Add ripple effect if enabled
  let rippleCleanup: (() => void) | undefined
  if (enableRipple) {
    rippleCleanup = addTouchRipple(element, rippleColor)
  }

  // Prevent context menu if requested
  if (preventContextMenu) {
    element.addEventListener('contextmenu', (e) => e.preventDefault())
  }

  // Set optimal touch styles
  element.style.cursor = 'pointer'
  element.style.userSelect = 'none'
  ;(element.style as any).webkitTapHighlightColor = 'transparent'

  return () => {
    if (rippleCleanup) {
      rippleCleanup()
    }
  }
}

/**
 * Debounce touch events to prevent multiple rapid triggers
 */
export const debounceTouchEvent = <T extends (...args: any[]) => void>(
  callback: T,
  delay = 100
): T => {
  let timeoutId: number | null = null

  return ((...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = window.setTimeout(() => {
      callback(...args)
      timeoutId = null
    }, delay)
  }) as T
}

/**
 * Throttle touch events to limit frequency
 */
export const throttleTouchEvent = <T extends (...args: any[]) => void>(
  callback: T,
  limit = 16 // 60fps default
): T => {
  let inThrottle = false

  return ((...args: Parameters<T>) => {
    if (!inThrottle) {
      callback(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }) as T
}

export default TouchInteractionManager