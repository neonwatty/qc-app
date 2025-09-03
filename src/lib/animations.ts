import { Variants } from 'framer-motion'

export const pageTransition: Variants = {
  initial: {
    opacity: 0,
    y: 20
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
      ease: 'easeIn'
    }
  }
}

export const fadeIn: Variants = {
  initial: {
    opacity: 0
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.4
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2
    }
  }
}

export const slideUp: Variants = {
  initial: {
    y: 60,
    opacity: 0
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: 'easeOut'
    }
  },
  exit: {
    y: -60,
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: 'easeIn'
    }
  }
}

export const slideInFromRight: Variants = {
  initial: {
    x: 100,
    opacity: 0
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  },
  exit: {
    x: -100,
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: 'easeIn'
    }
  }
}

export const scaleIn: Variants = {
  initial: {
    scale: 0.8,
    opacity: 0
  },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  },
  exit: {
    scale: 0.8,
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: 'easeIn'
    }
  }
}

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export const staggerItem: Variants = {
  initial: {
    y: 20,
    opacity: 0
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  }
}

export const spring = {
  type: 'spring',
  stiffness: 500,
  damping: 30
}

export const smoothSpring = {
  type: 'spring',
  stiffness: 300,
  damping: 25
}

// Enhanced animation variants for modern UX
export const slideDown: Variants = {
  initial: {
    y: -60,
    opacity: 0
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: 'easeOut'
    }
  },
  exit: {
    y: -60,
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: 'easeIn'
    }
  }
}

export const slideInFromLeft: Variants = {
  initial: {
    x: -100,
    opacity: 0
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  },
  exit: {
    x: 100,
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: 'easeIn'
    }
  }
}

export const bounceIn: Variants = {
  initial: {
    scale: 0.3,
    opacity: 0
  },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 10
    }
  },
  exit: {
    scale: 0.3,
    opacity: 0,
    transition: {
      duration: 0.2
    }
  }
}

export const rotateIn: Variants = {
  initial: {
    rotate: -180,
    opacity: 0,
    scale: 0.5
  },
  animate: {
    rotate: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut'
    }
  },
  exit: {
    rotate: 180,
    opacity: 0,
    scale: 0.5,
    transition: {
      duration: 0.3
    }
  }
}

export const flipIn: Variants = {
  initial: {
    rotateY: 90,
    opacity: 0
  },
  animate: {
    rotateY: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: 'easeOut'
    }
  },
  exit: {
    rotateY: -90,
    opacity: 0,
    transition: {
      duration: 0.3
    }
  }
}

// Advanced stagger patterns
export const fastStaggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
}

export const slowStaggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3
    }
  }
}

export const reverseStaggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: -0.1,
      staggerDirection: -1
    }
  }
}

// Enhanced stagger items
export const staggerFadeUp: Variants = {
  initial: {
    y: 30,
    opacity: 0
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: 'easeOut'
    }
  }
}

export const staggerScaleIn: Variants = {
  initial: {
    scale: 0.8,
    opacity: 0
  },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  }
}

// Modal and overlay animations
export const modalBackdrop: Variants = {
  initial: {
    opacity: 0
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.3
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2
    }
  }
}

export const modalContent: Variants = {
  initial: {
    opacity: 0,
    scale: 0.9,
    y: 50
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 50,
    transition: {
      duration: 0.2
    }
  }
}

// Navigation animations
export const navSlideIn: Variants = {
  initial: {
    x: '-100%'
  },
  animate: {
    x: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  },
  exit: {
    x: '-100%',
    transition: {
      duration: 0.2,
      ease: 'easeIn'
    }
  }
}

// Notification animations
export const notificationSlide: Variants = {
  initial: {
    x: 400,
    opacity: 0
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  },
  exit: {
    x: 400,
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: 'easeIn'
    }
  }
}

// Tab animations
export const tabContent: Variants = {
  initial: {
    opacity: 0,
    x: 10
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.2,
      ease: 'easeOut'
    }
  },
  exit: {
    opacity: 0,
    x: -10,
    transition: {
      duration: 0.1
    }
  }
}

// Card hover animations
export const cardHover = {
  hover: {
    y: -8,
    boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  }
}

// Button animations
export const buttonTap = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
  transition: spring
}

// Loading animations
export const spinner: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear'
    }
  }
}

export const pulse: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
}