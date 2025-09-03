import { Variants } from 'framer-motion'

// Page transition variants for consistent app-wide transitions
export const pageTransitions = {
  // Standard page transition - subtle and fast
  default: {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.3, 
        ease: 'easeOut',
        when: 'beforeChildren'
      }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { 
        duration: 0.2, 
        ease: 'easeIn',
        when: 'afterChildren'
      }
    }
  } as Variants,

  // Slide transitions for navigation
  slideLeft: {
    initial: { opacity: 0, x: 100 },
    animate: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.3, ease: 'easeOut' }
    },
    exit: { 
      opacity: 0, 
      x: -100,
      transition: { duration: 0.2, ease: 'easeIn' }
    }
  } as Variants,

  slideRight: {
    initial: { opacity: 0, x: -100 },
    animate: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.3, ease: 'easeOut' }
    },
    exit: { 
      opacity: 0, 
      x: 100,
      transition: { duration: 0.2, ease: 'easeIn' }
    }
  } as Variants,

  // Scale transition for modal-like pages
  scale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3, ease: 'easeOut' }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95,
      transition: { duration: 0.2, ease: 'easeIn' }
    }
  } as Variants,

  // Fade transition - simplest
  fade: {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { duration: 0.4 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.2 }
    }
  } as Variants,

  // Complex slide up - for check-in flows
  slideUp: {
    initial: { opacity: 0, y: 60, scale: 0.98 },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        duration: 0.4, 
        ease: 'easeOut',
        staggerChildren: 0.1
      }
    },
    exit: { 
      opacity: 0, 
      y: -60, 
      scale: 0.98,
      transition: { duration: 0.3, ease: 'easeIn' }
    }
  } as Variants,

  // Bounce for success/celebration pages
  bounce: {
    initial: { opacity: 0, scale: 0.3 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 400,
        damping: 20,
        duration: 0.6
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      transition: { duration: 0.2 }
    }
  } as Variants
}

// Route-specific transition mapping
export const routeTransitions: Record<string, keyof typeof pageTransitions> = {
  '/': 'fade',
  '/dashboard': 'default',
  '/checkin': 'slideUp',
  '/notes': 'slideLeft',
  '/growth': 'scale',
  '/settings': 'slideRight'
}

// Helper function to get transition for a route
export function getTransitionForRoute(pathname: string): Variants {
  const transitionKey = routeTransitions[pathname] || 'default'
  return pageTransitions[transitionKey]
}

// Transition timing constants for consistent behavior
export const transitionConfig = {
  duration: {
    fast: 0.2,
    normal: 0.3,
    slow: 0.4,
    verySlow: 0.6
  },
  easing: {
    easeIn: [0.4, 0, 1, 1],
    easeOut: [0, 0, 0.2, 1],
    easeInOut: [0.4, 0, 0.2, 1],
    bounce: [0.68, -0.55, 0.265, 1.55]
  } as Record<string, number[]>
}

// Page wrapper component variants
export const pageWrapperVariants = {
  initial: 'initial' as const,
  animate: 'animate' as const,
  exit: 'exit' as const
}

// Loading transition for async operations
export const loadingTransition: Variants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: { 
      duration: 0.2,
      when: 'beforeChildren',
      staggerChildren: 0.05
    }
  },
  exit: { 
    opacity: 0,
    transition: { 
      duration: 0.15,
      when: 'afterChildren'
    }
  }
}