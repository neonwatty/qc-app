
import * as React from "react"
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import { RefreshCw } from 'lucide-react'
import { cn } from "@/lib/utils"
import { hapticFeedback } from '@/lib/haptics'

interface PullToRefreshProps {
  children: React.ReactNode
  onRefresh: () => Promise<void> | void
  className?: string
  refreshThreshold?: number
  disabled?: boolean
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  className,
  refreshThreshold = 60,
  disabled = false
}) => {
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [isPulling, setIsPulling] = React.useState(false)
  const [canRefresh, setCanRefresh] = React.useState(false)
  
  const y = useMotionValue(0)
  const opacity = useTransform(y, [0, refreshThreshold], [0, 1])
  const scale = useTransform(y, [0, refreshThreshold], [0.8, 1])
  const rotate = useTransform(y, [0, refreshThreshold * 2], [0, 180])
  
  const containerRef = React.useRef<HTMLDivElement>(null)
  
  const handleRefresh = React.useCallback(async () => {
    if (disabled || isRefreshing) return
    
    setIsRefreshing(true)
    hapticFeedback.success()
    
    try {
      await onRefresh()
    } finally {
      // Add a minimum delay for better UX
      setTimeout(() => {
        setIsRefreshing(false)
        setCanRefresh(false)
        y.set(0)
      }, 500)
    }
  }, [onRefresh, disabled, isRefreshing, y])
  
  const handleDragStart = (event?: any) => {
    if (disabled) return
    
    const container = containerRef.current
    if (!container) return
    
    // Only allow pull-to-refresh if we're at the top of the scroll
    const isAtTop = container.scrollTop <= 0
    if (isAtTop) {
      setIsPulling(true)
    }
  }
  
  const handleDrag = (event: any, info: PanInfo) => {
    if (disabled || !isPulling) return
    
    const newY = Math.max(0, info.offset.y)
    y.set(newY)
    
    if (newY >= refreshThreshold && !canRefresh) {
      setCanRefresh(true)
      hapticFeedback.select()
    } else if (newY < refreshThreshold && canRefresh) {
      setCanRefresh(false)
    }
  }
  
  const handleDragEnd = (event: any, info: PanInfo) => {
    if (disabled || !isPulling) return
    
    setIsPulling(false)
    
    if (info.offset.y >= refreshThreshold) {
      handleRefresh()
    } else {
      y.set(0)
      setCanRefresh(false)
    }
  }
  
  const refreshIndicatorY = useTransform(y, [0, refreshThreshold], [-40, 0])
  
  return (
    <div className={cn("relative overflow-hidden", className)}>
      {/* Refresh Indicator */}
      <motion.div
        className="absolute inset-x-0 top-0 z-10 flex items-center justify-center h-16 bg-gradient-to-b from-white dark:from-gray-900 to-transparent pointer-events-none"
        style={{ y: refreshIndicatorY, opacity }}
      >
        <motion.div
          className={cn(
            "flex items-center justify-center w-8 h-8 rounded-full transition-colors",
            canRefresh ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
          )}
          style={{ scale }}
        >
          <motion.div style={{ rotate: isRefreshing ? undefined : rotate }}>
            <RefreshCw 
              className={cn(
                "h-4 w-4",
                isRefreshing && "animate-spin"
              )} 
            />
          </motion.div>
        </motion.div>
      </motion.div>
      
      {/* Content */}
      <motion.div
        ref={containerRef}
        className="h-full overflow-auto"
        style={{ y }}
        drag="y"
        dragConstraints={{ top: 0, bottom: refreshThreshold * 2 }}
        dragElastic={0.2}
        dragMomentum={false}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        whileDrag={{ cursor: "grabbing" }}
      >
        {children}
      </motion.div>
      
      {/* Loading overlay */}
      {isRefreshing && (
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-start justify-center pt-16 pointer-events-none">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Refreshing...</span>
          </div>
        </div>
      )}
    </div>
  )
}

// Simplified hook version for custom implementations
export const usePullToRefresh = (onRefresh: () => Promise<void> | void, options?: {
  threshold?: number
  disabled?: boolean
}) => {
  const threshold = options?.threshold ?? 60
  const disabled = options?.disabled ?? false
  
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [isPulling, setIsPulling] = React.useState(false)
  const y = useMotionValue(0)
  
  const handleRefresh = React.useCallback(async () => {
    if (disabled || isRefreshing) return
    
    setIsRefreshing(true)
    hapticFeedback.success()
    
    try {
      await onRefresh()
    } finally {
      setTimeout(() => {
        setIsRefreshing(false)
        y.set(0)
      }, 500)
    }
  }, [onRefresh, disabled, isRefreshing, y])
  
  return {
    isRefreshing,
    isPulling,
    y,
    handleRefresh,
    setIsPulling
  }
}

export default PullToRefresh