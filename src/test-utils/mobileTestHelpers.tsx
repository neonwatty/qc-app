import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from '@/contexts/ThemeContext'

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  theme?: 'light' | 'dark' | 'system'
}

export function renderWithProviders(
  ui: React.ReactElement,
  { theme = 'light', ...renderOptions }: CustomRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <ThemeProvider defaultTheme={theme}>
        {children}
      </ThemeProvider>
    )
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Mobile touch event helpers
export const createTouchEvent = (
  type: string,
  touches: Array<{ clientX: number; clientY: number }> = []
): TouchEvent => {
  const touchList = touches.map((touch, index) => ({
    identifier: index,
    target: document.body,
    ...touch,
  })) as any

  return new TouchEvent(type, {
    bubbles: true,
    cancelable: true,
    touches: touchList,
    targetTouches: touchList,
    changedTouches: touchList,
  })
}

// Gesture simulation helpers
export const simulateSwipe = {
  left: (element: Element, distance = 100) => {
    const startX = 200
    const endX = startX - distance
    const y = 100

    element.dispatchEvent(createTouchEvent('touchstart', [{ clientX: startX, clientY: y }]))
    element.dispatchEvent(createTouchEvent('touchmove', [{ clientX: endX, clientY: y }]))
    element.dispatchEvent(createTouchEvent('touchend', []))
  },

  right: (element: Element, distance = 100) => {
    const startX = 100
    const endX = startX + distance
    const y = 100

    element.dispatchEvent(createTouchEvent('touchstart', [{ clientX: startX, clientY: y }]))
    element.dispatchEvent(createTouchEvent('touchmove', [{ clientX: endX, clientY: y }]))
    element.dispatchEvent(createTouchEvent('touchend', []))
  },

  down: (element: Element, distance = 100) => {
    const x = 100
    const startY = 100
    const endY = startY + distance

    element.dispatchEvent(createTouchEvent('touchstart', [{ clientX: x, clientY: startY }]))
    element.dispatchEvent(createTouchEvent('touchmove', [{ clientX: x, clientY: endY }]))
    element.dispatchEvent(createTouchEvent('touchend', []))
  },

  up: (element: Element, distance = 100) => {
    const x = 100
    const startY = 200
    const endY = startY - distance

    element.dispatchEvent(createTouchEvent('touchstart', [{ clientX: x, clientY: startY }]))
    element.dispatchEvent(createTouchEvent('touchmove', [{ clientX: x, clientY: endY }]))
    element.dispatchEvent(createTouchEvent('touchend', []))
  },
}

// Long press simulation
export const simulateLongPress = async (
  element: Element,
  duration = 500,
  position = { clientX: 100, clientY: 100 }
) => {
  element.dispatchEvent(createTouchEvent('touchstart', [position]))
  
  await new Promise(resolve => setTimeout(resolve, duration + 10))
  
  element.dispatchEvent(createTouchEvent('touchend', []))
}

// Drag simulation for pull-to-refresh
export const simulateDrag = {
  start: (element: Element, position = { clientX: 100, clientY: 100 }) => {
    element.dispatchEvent(createTouchEvent('touchstart', [position]))
  },

  move: (element: Element, position = { clientX: 100, clientY: 100 }) => {
    element.dispatchEvent(createTouchEvent('touchmove', [position]))
  },

  end: (element: Element) => {
    element.dispatchEvent(createTouchEvent('touchend', []))
  },

  pullDown: async (element: Element, distance = 100) => {
    const x = 100
    const startY = 50
    
    simulateDrag.start(element, { clientX: x, clientY: startY })
    
    // Simulate progressive dragging
    for (let i = 0; i <= distance; i += 10) {
      simulateDrag.move(element, { clientX: x, clientY: startY + i })
      await new Promise(resolve => setTimeout(resolve, 10))
    }
    
    simulateDrag.end(element)
  },
}

// Mock viewport for responsive testing
export const setMobileViewport = () => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 375,
  })
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: 812,
  })
  window.dispatchEvent(new Event('resize'))
}

export const setDesktopViewport = () => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 1024,
  })
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: 768,
  })
  window.dispatchEvent(new Event('resize'))
}

// Haptic feedback testing
export const mockHapticFeedback = {
  setup: () => {
    ;(navigator.vibrate as jest.Mock).mockClear()
  },

  expectTriggered: (pattern?: number | number[]) => {
    if (pattern) {
      expect(navigator.vibrate).toHaveBeenCalledWith(pattern)
    } else {
      expect(navigator.vibrate).toHaveBeenCalled()
    }
  },

  expectNotTriggered: () => {
    expect(navigator.vibrate).not.toHaveBeenCalled()
  },
}

// Theme testing helpers
export const mockMatchMedia = (matches: boolean) => {
  ;(window.matchMedia as jest.Mock).mockImplementation((query) => ({
    matches,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }))
}

// Animation testing helpers
export const waitForAnimation = (duration = 300) => {
  return new Promise(resolve => setTimeout(resolve, duration))
}

// User event helpers with mobile-specific settings
export const createMobileUserEvent = () => {
  return userEvent.setup({
    // Simulate mobile touch behavior
    pointerEventsCheck: 0,
    delay: null,
  })
}

// Test data generators
export const generateMockNotes = (count = 5) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `note-${i}`,
    title: `Test Note ${i + 1}`,
    content: `This is test content for note ${i + 1}`,
    type: ['shared', 'private', 'draft'][i % 3] as 'shared' | 'private' | 'draft',
    date: `${i + 1} day${i === 0 ? '' : 's'} ago`,
    category: ['Communication', 'Goals', 'Appreciation'][i % 3],
  }))
}

export const generateMockCategories = () => [
  {
    id: 'emotional',
    name: 'Emotional Connection',
    description: 'How connected and understood do you feel?',
    color: 'pink',
    icon: '💕'
  },
  {
    id: 'communication',
    name: 'Communication',
    description: 'How well are you communicating with each other?',
    color: 'blue',
    icon: '💬'
  },
]

// Accessibility testing helpers
export const expectTouchTarget = (element: Element) => {
  const styles = window.getComputedStyle(element)
  const minSize = 44 // 44px minimum touch target
  
  const width = parseInt(styles.width) || element.getBoundingClientRect().width
  const height = parseInt(styles.height) || element.getBoundingClientRect().height
  
  expect(width).toBeGreaterThanOrEqual(minSize)
  expect(height).toBeGreaterThanOrEqual(minSize)
}

// Re-export everything from @testing-library/react
export * from '@testing-library/react'
export { userEvent }
export { renderWithProviders as render }