import '@testing-library/jest-dom'

// Mock framer-motion
jest.mock('framer-motion', () => {
  const React = require('react')
  
  const createMotionComponent = (component: string) =>
    React.forwardRef(function MotionComponent(props: any, ref: any) {
      // Filter out framer-motion specific props
      const {
        initial,
        animate,
        exit,
        variants,
        transition,
        whileHover,
        whileTap,
        whileFocus,
        whileInView,
        drag,
        dragConstraints,
        dragElastic,
        dragMomentum,
        dragTransition,
        ...cleanProps
      } = props
      
      return React.createElement(component, { ...cleanProps, ref })
    })

  return {
    motion: {
      div: createMotionComponent('div'),
      button: createMotionComponent('button'),
      span: createMotionComponent('span'),
      section: createMotionComponent('section'),
      article: createMotionComponent('article'),
      h1: createMotionComponent('h1'),
      h2: createMotionComponent('h2'),
      h3: createMotionComponent('h3'),
      p: createMotionComponent('p'),
    },
    AnimatePresence: ({ children }: any) => children,
    useMotionValue: () => ({ set: jest.fn(), get: jest.fn() }),
    useTransform: () => 0,
    PanInfo: {},
  }
})

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/test-path',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock lucide-react icons  
jest.mock('lucide-react', () => {
  const React = require('react')
  // Use span instead of div to avoid HTML validation issues when icons are inside p tags
  return {
    Heart: () => React.createElement('span', { 'data-testid': 'heart-icon' }),
    MessageCircle: () => React.createElement('span', { 'data-testid': 'message-circle-icon' }),
    Plus: () => React.createElement('span', { 'data-testid': 'plus-icon' }),
    Search: () => React.createElement('span', { 'data-testid': 'search-icon' }),
    RefreshCw: () => React.createElement('span', { 'data-testid': 'refresh-icon' }),
    ArrowLeft: () => React.createElement('span', { 'data-testid': 'arrow-left-icon' }),
    ArrowRight: () => React.createElement('span', { 'data-testid': 'arrow-right-icon' }),
    Sun: () => React.createElement('span', { 'data-testid': 'sun-icon' }),
    Moon: () => React.createElement('span', { 'data-testid': 'moon-icon' }),
    Menu: () => React.createElement('span', { 'data-testid': 'menu-icon' }),
    X: () => React.createElement('span', { 'data-testid': 'x-icon' }),
    Bell: () => React.createElement('span', { 'data-testid': 'bell-icon' }),
    BellRing: () => React.createElement('span', { 'data-testid': 'bell-ring-icon' }),
    Check: () => React.createElement('span', { 'data-testid': 'check-icon' }),
    CheckCheck: () => React.createElement('span', { 'data-testid': 'check-check-icon' }),
    Trash2: () => React.createElement('span', { 'data-testid': 'trash2-icon' }),
    Settings: () => React.createElement('span', { 'data-testid': 'settings-icon' }),
    Calendar: () => React.createElement('span', { 'data-testid': 'calendar-icon' }),
    Users: () => React.createElement('span', { 'data-testid': 'users-icon' }),
    Trophy: () => React.createElement('span', { 'data-testid': 'trophy-icon' }),
    Info: () => React.createElement('span', { 'data-testid': 'info-icon' }),
    ChevronRight: () => React.createElement('span', { 'data-testid': 'chevron-right-icon' }),
    Filter: () => React.createElement('span', { 'data-testid': 'filter-icon' }),
    GripHorizontal: () => React.createElement('span', { 'data-testid': 'grip-icon' }),
    Eye: () => React.createElement('span', { 'data-testid': 'eye-icon' }),
    Mail: () => React.createElement('span', { 'data-testid': 'mail-icon' }),
    // Onboarding-specific icons
    Bell: () => React.createElement('span', { 'data-testid': 'bell-icon' }),
    Calendar: () => React.createElement('span', { 'data-testid': 'calendar-icon' }),
    Clock: () => React.createElement('span', { 'data-testid': 'clock-icon' }),
    Users: () => React.createElement('span', { 'data-testid': 'users-icon' }),
    Sparkles: () => React.createElement('span', { 'data-testid': 'sparkles-icon' }),
    Check: () => React.createElement('span', { 'data-testid': 'check-icon' }),
    Gift: () => React.createElement('span', { 'data-testid': 'gift-icon' }),
    Lock: () => React.createElement('span', { 'data-testid': 'lock-icon' }),
    TrendingUp: () => React.createElement('span', { 'data-testid': 'trending-up-icon' }),
    ChevronLeft: () => React.createElement('span', { 'data-testid': 'chevron-left-icon' }),
    ChevronRight: () => React.createElement('span', { 'data-testid': 'chevron-right-icon' }),
    CheckCircle: () => React.createElement('span', { 'data-testid': 'check-circle-icon' }),
    LayoutDashboard: () => React.createElement('span', { 'data-testid': 'layout-dashboard-icon' }),
  }
})

// Mock canvas-confetti
jest.mock('canvas-confetti', () => jest.fn())

// Mock CSS modules
jest.mock('@/app/globals.css', () => ({}))

// Enhanced localStorage mock for onboarding tests
const localStorageMock = {
  getItem: jest.fn((key: string) => {
    if (key === 'qc-onboarding-complete') return null
    if (key === 'qc-onboarding-data') return null
    if (key === 'qc-onboarding-skipped') return null
    return null
  }),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

// Increase timeout for longer running tests
jest.setTimeout(10000)