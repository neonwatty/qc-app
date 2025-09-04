import '@testing-library/jest-dom'

// Mock framer-motion
jest.mock('framer-motion', () => {
  const React = require('react')
  return {
    motion: {
      div: React.forwardRef(function MotionDiv(props: any, ref: any) { 
        return React.createElement('div', { ...props, ref })
      }),
      button: React.forwardRef(function MotionButton(props: any, ref: any) { 
        return React.createElement('button', { ...props, ref })
      }),
      span: React.forwardRef(function MotionSpan(props: any, ref: any) { 
        return React.createElement('span', { ...props, ref })
      }),
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
  return {
    Heart: () => React.createElement('div', { 'data-testid': 'heart-icon' }),
    MessageCircle: () => React.createElement('div', { 'data-testid': 'message-circle-icon' }),
    Plus: () => React.createElement('div', { 'data-testid': 'plus-icon' }),
    Search: () => React.createElement('div', { 'data-testid': 'search-icon' }),
    RefreshCw: () => React.createElement('div', { 'data-testid': 'refresh-icon' }),
    ArrowLeft: () => React.createElement('div', { 'data-testid': 'arrow-left-icon' }),
    ArrowRight: () => React.createElement('div', { 'data-testid': 'arrow-right-icon' }),
    Sun: () => React.createElement('div', { 'data-testid': 'sun-icon' }),
    Moon: () => React.createElement('div', { 'data-testid': 'moon-icon' }),
    Menu: () => React.createElement('div', { 'data-testid': 'menu-icon' }),
    X: () => React.createElement('div', { 'data-testid': 'x-icon' }),
    GripHorizontal: () => React.createElement('div', { 'data-testid': 'grip-icon' }),
    Eye: () => React.createElement('div', { 'data-testid': 'eye-icon' }),
    Mail: () => React.createElement('div', { 'data-testid': 'mail-icon' }),
  }
})

// Mock CSS modules
jest.mock('@/app/globals.css', () => ({}))

// Increase timeout for longer running tests
jest.setTimeout(10000)