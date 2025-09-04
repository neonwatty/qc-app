// Mock browser APIs that don't exist in Jest/jsdom environment

// Mock navigator.vibrate for haptic feedback tests
Object.defineProperty(navigator, 'vibrate', {
  writable: true,
  value: jest.fn(),
})

// Mock navigator.serviceWorker for PWA tests
Object.defineProperty(navigator, 'serviceWorker', {
  writable: true,
  value: {
    register: jest.fn(() => Promise.resolve()),
    ready: Promise.resolve({
      unregister: jest.fn(),
    }),
  },
})

// Mock window.matchMedia for responsive/theme tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock localStorage for theme persistence tests
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock ResizeObserver for responsive tests
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock IntersectionObserver for lazy loading tests
global.IntersectionObserver = jest.fn().mockImplementation((callback) => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
  thresholds: [0],
  root: null,
  rootMargin: '',
}))

// Mock requestAnimationFrame for animation tests
global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 16))
global.cancelAnimationFrame = jest.fn((id) => clearTimeout(id))

// Mock CSS.supports for feature detection
global.CSS = {
  supports: jest.fn(() => false),
} as any

// Mock window.screen for mobile viewport tests
Object.defineProperty(window, 'screen', {
  writable: true,
  value: {
    width: 375,
    height: 812,
    availWidth: 375,
    availHeight: 812,
    orientation: {
      angle: 0,
      type: 'portrait-primary',
    },
  },
})

// Mock touch events support
window.TouchEvent = class TouchEvent extends Event {
  constructor(type: string, options: TouchEventInit = {}) {
    super(type, options)
    this.touches = options.touches || []
    this.targetTouches = options.targetTouches || []
    this.changedTouches = options.changedTouches || []
  }
  touches: TouchList
  targetTouches: TouchList
  changedTouches: TouchList
} as any

// Export mocks for use in tests
export {
  localStorageMock,
}