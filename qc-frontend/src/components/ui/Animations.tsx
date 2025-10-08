
import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

// Hover lift effect for cards and interactive elements
export const HoverLift: React.FC<{
  children: React.ReactNode
  className?: string
  lift?: 'sm' | 'md' | 'lg'
}> = ({ children, className, lift = 'md' }) => {
  const liftValues = {
    sm: { y: -2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
    md: { y: -4, boxShadow: '0 8px 25px rgba(0,0,0,0.12)' },
    lg: { y: -8, boxShadow: '0 12px 40px rgba(0,0,0,0.15)' }
  }

  return (
    <motion.div
      className={className}
      whileHover={liftValues[lift]}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

// Tap animation for buttons and clickable elements
export const TapScale: React.FC<{
  children: React.ReactNode
  className?: string
  scale?: number
}> = ({ children, className, scale = 0.95 }) => {
  return (
    <motion.div
      className={className}
      whileTap={{ scale }}
      transition={{ duration: 0.1 }}
    >
      {children}
    </motion.div>
  )
}

// Combined hover and tap for interactive elements
export const InteractiveElement: React.FC<{
  children: React.ReactNode
  className?: string
  hoverScale?: number
  tapScale?: number
}> = ({ children, className, hoverScale = 1.05, tapScale = 0.95 }) => {
  return (
    <motion.div
      className={className}
      whileHover={{ scale: hoverScale }}
      whileTap={{ scale: tapScale }}
      transition={{ duration: 0.15, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

// Stagger children animation container
export const StaggerContainer: React.FC<{
  children: React.ReactNode
  className?: string
  staggerDelay?: number
}> = ({ children, className, staggerDelay = 0.1 }) => {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.1
          }
        }
      }}
    >
      {children}
    </motion.div>
  )
}

// Stagger child item
export const StaggerItem: React.FC<{
  children: React.ReactNode
  className?: string
}> = ({ children, className }) => {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: { duration: 0.4, ease: 'easeOut' }
        }
      }}
    >
      {children}
    </motion.div>
  )
}

// Slide in from direction
export const SlideIn: React.FC<{
  children: React.ReactNode
  direction: 'left' | 'right' | 'up' | 'down'
  className?: string
  distance?: number
}> = ({ children, direction, className, distance = 50 }) => {
  const directionMap = {
    left: { x: -distance, y: 0 },
    right: { x: distance, y: 0 },
    up: { x: 0, y: -distance },
    down: { x: 0, y: distance }
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, ...directionMap[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

// Notification slide in from side
export const NotificationSlide: React.FC<{
  children: React.ReactNode
  show: boolean
  side?: 'left' | 'right'
  className?: string
}> = ({ children, show, side = 'right', className }) => {
  const slideValue = side === 'right' ? 400 : -400

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className={className}
          initial={{ x: slideValue, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: slideValue, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Floating animation for elements
export const FloatingElement: React.FC<{
  children: React.ReactNode
  className?: string
  intensity?: 'gentle' | 'moderate' | 'strong'
}> = ({ children, className, intensity = 'gentle' }) => {
  const intensityMap = {
    gentle: { y: [-2, 2, -2], duration: 4 },
    moderate: { y: [-4, 4, -4], duration: 3 },
    strong: { y: [-8, 8, -8], duration: 2 }
  }

  const config = intensityMap[intensity]

  return (
    <motion.div
      className={className}
      animate={{ y: config.y }}
      transition={{
        duration: config.duration,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    >
      {children}
    </motion.div>
  )
}

// Pulsing animation for attention-grabbing elements
export const PulseGlow: React.FC<{
  children: React.ReactNode
  className?: string
  color?: string
}> = ({ children, className, color = 'rgb(59, 130, 246)' }) => {
  return (
    <motion.div
      className={className}
      animate={{
        boxShadow: [
          `0 0 0 0px ${color}00`,
          `0 0 0 8px ${color}20`,
          `0 0 0 0px ${color}00`
        ]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    >
      {children}
    </motion.div>
  )
}

// Reveal animation on scroll/intersection
export const RevealOnView: React.FC<{
  children: React.ReactNode
  className?: string
  threshold?: number
}> = ({ children, className, threshold = 0.1 }) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      viewport={{ once: true, amount: threshold }}
    >
      {children}
    </motion.div>
  )
}

// Count up animation for numbers
export const CountUp: React.FC<{
  from: number
  to: number
  duration?: number
  className?: string
}> = ({ from, to, duration = 1, className }) => {
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <motion.span
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration, ease: 'easeOut' }}
      >
        {to}
      </motion.span>
    </motion.span>
  )
}

// Magnetic hover effect
export const MagneticHover: React.FC<{
  children: React.ReactNode
  className?: string
  strength?: number
}> = ({ children, className, strength = 0.3 }) => {
  return (
    <motion.div
      className={className}
      whileHover={{ scale: 1 + strength * 0.1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      {children}
    </motion.div>
  )
}

// Shake animation for errors or attention
export const ShakeAnimation: React.FC<{
  children: React.ReactNode
  className?: string
  trigger: boolean
}> = ({ children, className, trigger }) => {
  return (
    <motion.div
      className={className}
      animate={trigger ? { x: [-10, 10, -10, 10, 0] } : {}}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  )
}

// Typewriter effect for text
export const TypewriterText: React.FC<{
  text: string
  className?: string
  speed?: number
}> = ({ text, className, speed = 50 }) => {
  const [displayedText, setDisplayedText] = React.useState('')

  React.useEffect(() => {
    let i = 0
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.slice(0, i + 1))
        i++
      } else {
        clearInterval(timer)
      }
    }, speed)

    return () => clearInterval(timer)
  }, [text, speed])

  return (
    <span className={className}>
      {displayedText}
      <motion.span
        animate={{ opacity: [1, 0] }}
        transition={{ duration: 0.8, repeat: Infinity }}
      >
        |
      </motion.span>
    </span>
  )
}

// Progress circle animation
export const ProgressCircle: React.FC<{
  progress: number
  size?: number
  strokeWidth?: number
  className?: string
}> = ({ progress, size = 60, strokeWidth = 4, className }) => {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = `${circumference} ${circumference}`
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className={cn('relative', className)} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-muted"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          strokeLinecap="round"
          className="text-primary"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-semibold">{Math.round(progress)}%</span>
      </div>
    </div>
  )
}