
import * as React from "react"
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from "@/lib/utils"
import { hapticFeedback } from '@/lib/haptics'
import { ActionSheet } from './MobileSheet'

interface LongPressAction {
  id: string
  label: string
  icon?: React.ReactNode
  variant?: 'default' | 'destructive'
  disabled?: boolean
  onClick: () => void
}

interface LongPressMenuProps {
  children: React.ReactNode
  actions: LongPressAction[]
  className?: string
  disabled?: boolean
  longPressDuration?: number
  rippleEffect?: boolean
  showActionSheet?: boolean
  title?: string
  description?: string
}

export const LongPressMenu: React.FC<LongPressMenuProps> = ({
  children,
  actions,
  className,
  disabled = false,
  longPressDuration = 500,
  rippleEffect = true,
  showActionSheet = true,
  title,
  description
}) => {
  const [isPressed, setIsPressed] = React.useState(false)
  const [showMenu, setShowMenu] = React.useState(false)
  const [ripplePosition, setRipplePosition] = React.useState({ x: 0, y: 0 })
  
  const longPressTimer = React.useRef<NodeJS.Timeout | null>(null)
  const elementRef = React.useRef<HTMLDivElement>(null)
  
  const startLongPress = React.useCallback((event: React.TouchEvent | React.MouseEvent) => {
    if (disabled) return
    
    setIsPressed(true)
    
    // Set ripple position for visual feedback
    if (rippleEffect && elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect()
      const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX
      const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY
      
      setRipplePosition({
        x: clientX - rect.left,
        y: clientY - rect.top
      })
    }
    
    longPressTimer.current = setTimeout(() => {
      hapticFeedback.longPress()
      setShowMenu(true)
      setIsPressed(false)
    }, longPressDuration)
  }, [disabled, longPressDuration, rippleEffect])
  
  const cancelLongPress = React.useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
    setIsPressed(false)
  }, [])
  
  // Context menu handlers
  const handleTouchStart = React.useCallback((event: React.TouchEvent) => {
    event.preventDefault() // Prevent text selection
    startLongPress(event)
  }, [startLongPress])
  
  const handleMouseDown = React.useCallback((event: React.MouseEvent) => {
    // Only trigger on right click or long mouse press
    if (event.button === 2) {
      event.preventDefault()
      hapticFeedback.longPress()
      setShowMenu(true)
      return
    }
    startLongPress(event)
  }, [startLongPress])
  
  const handleContextMenu = React.useCallback((event: React.MouseEvent) => {
    event.preventDefault()
    if (!disabled) {
      hapticFeedback.longPress()
      setShowMenu(true)
    }
  }, [disabled])
  
  // Close menu
  const closeMenu = () => {
    setShowMenu(false)
  }
  
  // Clean up timer on unmount
  React.useEffect(() => {
    return () => {
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
      }
    }
  }, [])
  
  return (
    <>
      <div
        ref={elementRef}
        className={cn(
          "relative overflow-hidden select-none",
          isPressed && "transform scale-95 transition-transform",
          className
        )}
        onTouchStart={handleTouchStart}
        onTouchEnd={cancelLongPress}
        onTouchCancel={cancelLongPress}
        onMouseDown={handleMouseDown}
        onMouseUp={cancelLongPress}
        onMouseLeave={cancelLongPress}
        onContextMenu={handleContextMenu}
        style={{
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'none'
        }}
      >
        {children}
        
        {/* Long press ripple effect */}
        {isPressed && rippleEffect && (
          <div
            className="absolute pointer-events-none"
            style={{
              left: ripplePosition.x,
              top: ripplePosition.y,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <motion.div
              initial={{ scale: 0, opacity: 0.6 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: longPressDuration / 1000 }}
              className="w-8 h-8 bg-gray-400 rounded-full"
            />
          </div>
        )}
      </div>
      
      {/* Action Sheet */}
      {showActionSheet ? (
        <ActionSheet
          open={showMenu}
          onClose={closeMenu}
          actions={actions}
          title={title}
          description={description}
        />
      ) : (
        // Custom menu implementation
        <AnimatePresence>
          {showMenu && (
            <motion.div
              className="fixed inset-0 z-50 bg-black/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeMenu}
            >
              <motion.div
                className="absolute bg-white rounded-lg shadow-lg border border-gray-200 min-w-40 p-1"
                style={{
                  left: ripplePosition.x - 80,
                  top: ripplePosition.y + 20
                }}
                initial={{ scale: 0.8, opacity: 0, y: -10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: -10 }}
                onClick={(e) => e.stopPropagation()}
              >
                {actions.map((action) => (
                  <button
                    key={action.id}
                    className={cn(
                      "w-full text-left px-3 py-2 text-sm rounded-md flex items-center gap-2 transition-colors",
                      action.variant === 'destructive' 
                        ? "text-red-700 hover:bg-red-50"
                        : "text-gray-900 hover:bg-gray-100",
                      action.disabled && "opacity-50 cursor-not-allowed"
                    )}
                    onClick={() => {
                      if (!action.disabled) {
                        action.onClick()
                        closeMenu()
                      }
                    }}
                    disabled={action.disabled}
                  >
                    {action.icon && (
                      <span className="flex-shrink-0">{action.icon}</span>
                    )}
                    <span>{action.label}</span>
                  </button>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </>
  )
}

// Hook for long press functionality
export const useLongPress = (
  callback: () => void,
  options?: {
    duration?: number
    disabled?: boolean
  }
) => {
  const { duration = 500, disabled = false } = options || {}
  const timer = React.useRef<NodeJS.Timeout | null>(null)
  
  const start = React.useCallback(() => {
    if (disabled) return
    
    timer.current = setTimeout(() => {
      hapticFeedback.longPress()
      callback()
    }, duration)
  }, [callback, duration, disabled])
  
  const cancel = React.useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current)
      timer.current = null
    }
  }, [])
  
  React.useEffect(() => {
    return () => {
      if (timer.current) {
        clearTimeout(timer.current)
      }
    }
  }, [])
  
  return {
    onTouchStart: start,
    onTouchEnd: cancel,
    onTouchCancel: cancel,
    onMouseDown: start,
    onMouseUp: cancel,
    onMouseLeave: cancel
  }
}

// Specialized components
interface LongPressCardProps extends Omit<LongPressMenuProps, 'actions'> {
  onEdit?: () => void
  onDelete?: () => void
  onShare?: () => void
  onDuplicate?: () => void
  customActions?: LongPressAction[]
}

export const LongPressCard: React.FC<LongPressCardProps> = ({
  children,
  onEdit,
  onDelete,
  onShare,
  onDuplicate,
  customActions = [],
  ...props
}) => {
  const defaultActions: LongPressAction[] = []
  
  if (onEdit) {
    defaultActions.push({
      id: 'edit',
      label: 'Edit',
      onClick: onEdit
    })
  }
  
  if (onShare) {
    defaultActions.push({
      id: 'share',
      label: 'Share',
      onClick: onShare
    })
  }
  
  if (onDuplicate) {
    defaultActions.push({
      id: 'duplicate',
      label: 'Duplicate',
      onClick: onDuplicate
    })
  }
  
  if (onDelete) {
    defaultActions.push({
      id: 'delete',
      label: 'Delete',
      variant: 'destructive',
      onClick: onDelete
    })
  }
  
  const actions = [...defaultActions, ...customActions]
  
  return (
    <LongPressMenu actions={actions} {...props}>
      {children}
    </LongPressMenu>
  )
}

export default LongPressMenu