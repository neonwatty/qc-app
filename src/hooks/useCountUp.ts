'use client'

import { useEffect, useState } from 'react'

interface UseCountUpOptions {
  end: number
  start?: number
  duration?: number
  decimals?: number
  delay?: number
  onComplete?: () => void
}

export function useCountUp({
  end,
  start = 0,
  duration = 2000,
  decimals = 0,
  delay = 0,
  onComplete
}: UseCountUpOptions) {
  const [count, setCount] = useState(start)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    let startTime: number
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime

      const elapsed = currentTime - startTime - delay
      
      if (elapsed < 0) {
        animationFrame = requestAnimationFrame(animate)
        return
      }

      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentCount = start + (end - start) * easeOutQuart
      
      const displayValue = parseFloat(currentCount.toFixed(decimals))
      setCount(displayValue)

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      } else {
        setCount(end)
        setIsComplete(true)
        onComplete?.()
      }
    }

    const timer = setTimeout(() => {
      animationFrame = requestAnimationFrame(animate)
    }, delay)

    return () => {
      clearTimeout(timer)
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [end, start, duration, decimals, delay, onComplete])

  const reset = () => {
    setCount(start)
    setIsComplete(false)
  }

  return {
    count,
    isComplete,
    reset
  }
}