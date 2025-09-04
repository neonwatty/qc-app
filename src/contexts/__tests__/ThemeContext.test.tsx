import React from 'react'
import { 
  render, 
  screen, 
  waitFor,
  mockMatchMedia,
  act
} from '@/test-utils/mobileTestHelpers'
import { localStorageMock } from '@/test-utils/mockBrowserAPIs'
import { ThemeProvider, useTheme } from '../ThemeContext'

// Test component to access theme context
const TestComponent = () => {
  const { theme, setTheme, isDark, toggle } = useTheme()
  
  return (
    <div>
      <div data-testid="theme">{theme}</div>
      <div data-testid="isDark">{isDark.toString()}</div>
      <button onClick={() => setTheme('light')} data-testid="set-light">Set Light</button>
      <button onClick={() => setTheme('dark')} data-testid="set-dark">Set Dark</button>
      <button onClick={() => setTheme('system')} data-testid="set-system">Set System</button>
      <button onClick={toggle} data-testid="toggle">Toggle</button>
    </div>
  )
}

// Mock DOM methods
const mockSetAttribute = jest.fn()
const mockAddClass = jest.fn()
const mockRemoveClass = jest.fn()
const mockQuerySelector = jest.fn()

beforeEach(() => {
  jest.clearAllMocks()
  
  // Mock document.documentElement
  Object.defineProperty(document, 'documentElement', {
    value: {
      classList: {
        add: mockAddClass,
        remove: mockRemoveClass,
      },
      setAttribute: mockSetAttribute,
    },
    writable: true,
  })
  
  // Mock document.querySelector for theme-color meta tag
  Object.defineProperty(document, 'querySelector', {
    value: mockQuerySelector,
    writable: true,
  })
  
  mockQuerySelector.mockReturnValue({
    setAttribute: jest.fn(),
  })
  
  // Setup localStorage mock
  localStorageMock.getItem.mockReturnValue(null)
  localStorageMock.setItem.mockClear()
})

describe('ThemeProvider', () => {
  const renderWithThemeProvider = (props = {}) => {
    return render(
      <ThemeProvider {...props}>
        <TestComponent />
      </ThemeProvider>
    )
  }

  describe('Initialization', () => {
    it('starts with system theme by default', () => {
      mockMatchMedia(false) // Light system theme
      renderWithThemeProvider()
      
      expect(screen.getByTestId('theme')).toHaveTextContent('system')
      expect(screen.getByTestId('isDark')).toHaveTextContent('false')
    })

    it('uses custom default theme', () => {
      renderWithThemeProvider({ defaultTheme: 'dark' })
      
      expect(screen.getByTestId('theme')).toHaveTextContent('dark')
      expect(screen.getByTestId('isDark')).toHaveTextContent('true')
    })

    it('loads theme from localStorage', async () => {
      localStorageMock.getItem.mockReturnValue('dark')
      renderWithThemeProvider()
      
      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('dark')
        expect(screen.getByTestId('isDark')).toHaveTextContent('true')
      })
    })

    it('uses custom storage key', async () => {
      localStorageMock.getItem.mockReturnValue('light')
      renderWithThemeProvider({ storageKey: 'custom-theme' })
      
      await waitFor(() => {
        expect(localStorageMock.getItem).toHaveBeenCalledWith('custom-theme')
      })
    })
  })

  describe('Theme setting', () => {
    it('sets light theme', async () => {
      renderWithThemeProvider()
      
      screen.getByTestId('set-light').click()
      
      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('light')
        expect(screen.getByTestId('isDark')).toHaveTextContent('false')
        expect(localStorageMock.setItem).toHaveBeenCalledWith('qc-theme', 'light')
      })
    })

    it('sets dark theme', async () => {
      renderWithThemeProvider()
      
      screen.getByTestId('set-dark').click()
      
      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('dark')
        expect(screen.getByTestId('isDark')).toHaveTextContent('true')
        expect(localStorageMock.setItem).toHaveBeenCalledWith('qc-theme', 'dark')
      })
    })

    it('sets system theme', async () => {
      mockMatchMedia(true) // Dark system theme
      renderWithThemeProvider()
      
      screen.getByTestId('set-system').click()
      
      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('system')
        expect(screen.getByTestId('isDark')).toHaveTextContent('true')
        expect(localStorageMock.setItem).toHaveBeenCalledWith('qc-theme', 'system')
      })
    })
  })

  describe('Theme toggle', () => {
    it('toggles from light to dark', async () => {
      renderWithThemeProvider({ defaultTheme: 'light' })
      
      screen.getByTestId('toggle').click()
      
      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('dark')
        expect(screen.getByTestId('isDark')).toHaveTextContent('true')
      })
    })

    it('toggles from dark to light', async () => {
      renderWithThemeProvider({ defaultTheme: 'dark' })
      
      screen.getByTestId('toggle').click()
      
      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('light')
        expect(screen.getByTestId('isDark')).toHaveTextContent('false')
      })
    })

    it('toggles from system dark to light', async () => {
      mockMatchMedia(true) // System is dark
      renderWithThemeProvider({ defaultTheme: 'system' })
      
      screen.getByTestId('toggle').click()
      
      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('light')
        expect(screen.getByTestId('isDark')).toHaveTextContent('false')
      })
    })

    it('toggles from system light to dark', async () => {
      mockMatchMedia(false) // System is light
      renderWithThemeProvider({ defaultTheme: 'system' })
      
      screen.getByTestId('toggle').click()
      
      await waitFor(() => {
        expect(screen.getByTestId('theme')).toHaveTextContent('dark')
        expect(screen.getByTestId('isDark')).toHaveTextContent('true')
      })
    })
  })

  describe('DOM manipulation', () => {
    it('adds dark class for dark theme', async () => {
      renderWithThemeProvider({ defaultTheme: 'dark' })
      
      await waitFor(() => {
        expect(mockAddClass).toHaveBeenCalledWith('dark')
        expect(mockSetAttribute).toHaveBeenCalledWith('data-theme', 'dark')
      })
    })

    it('removes dark class for light theme', async () => {
      renderWithThemeProvider({ defaultTheme: 'light' })
      
      await waitFor(() => {
        expect(mockRemoveClass).toHaveBeenCalledWith('dark')
        expect(mockSetAttribute).toHaveBeenCalledWith('data-theme', 'light')
      })
    })

    it('updates meta theme-color for mobile browsers', async () => {
      const mockMetaSetAttribute = jest.fn()
      mockQuerySelector.mockReturnValue({
        setAttribute: mockMetaSetAttribute,
      })
      
      renderWithThemeProvider({ defaultTheme: 'dark' })
      
      await waitFor(() => {
        expect(mockQuerySelector).toHaveBeenCalledWith('meta[name="theme-color"]')
        expect(mockMetaSetAttribute).toHaveBeenCalledWith('content', '#1f2937')
      })
    })

    it('handles missing meta theme-color gracefully', async () => {
      mockQuerySelector.mockReturnValue(null)
      
      expect(() => {
        renderWithThemeProvider({ defaultTheme: 'dark' })
      }).not.toThrow()
    })
  })

  describe('System theme changes', () => {
    it('responds to system theme changes when in system mode', async () => {
      mockMatchMedia(false) // Start with light
      renderWithThemeProvider({ defaultTheme: 'system' })
      
      await waitFor(() => {
        expect(screen.getByTestId('isDark')).toHaveTextContent('false')
      })
      
      // Simulate system theme change to dark
      act(() => {
        mockMatchMedia(true)
        // Trigger the media query change event
        const calls = (window.matchMedia as jest.Mock).mock.calls
        const lastCall = calls[calls.length - 1]
        const mediaQuery = lastCall[0]
        
        // Find and call the change handler
        const addEventListener = (window.matchMedia as jest.Mock).mock.results.find(
          result => result.value.addEventListener
        )
        if (addEventListener) {
          const handler = addEventListener.value.addEventListener.mock.calls.find(
            (call: any) => call[0] === 'change'
          )?.[1]
          if (handler) handler()
        }
      })
      
      await waitFor(() => {
        expect(screen.getByTestId('isDark')).toHaveTextContent('true')
      })
    })

    it('does not respond to system changes when not in system mode', async () => {
      mockMatchMedia(false)
      renderWithThemeProvider({ defaultTheme: 'dark' })
      
      await waitFor(() => {
        expect(screen.getByTestId('isDark')).toHaveTextContent('true')
      })
      
      // Simulate system theme change - should not affect dark mode
      act(() => {
        mockMatchMedia(true)
        const addEventListener = (window.matchMedia as jest.Mock).mock.results.find(
          result => result.value.addEventListener
        )
        if (addEventListener) {
          const handler = addEventListener.value.addEventListener.mock.calls.find(
            (call: any) => call[0] === 'change'
          )?.[1]
          if (handler) handler()
        }
      })
      
      // Should remain dark
      expect(screen.getByTestId('isDark')).toHaveTextContent('true')
    })
  })

  describe('System theme detection', () => {
    it('detects light system theme', async () => {
      mockMatchMedia(false)
      renderWithThemeProvider({ defaultTheme: 'system' })
      
      await waitFor(() => {
        expect(screen.getByTestId('isDark')).toHaveTextContent('false')
        expect(mockRemoveClass).toHaveBeenCalledWith('dark')
      })
    })

    it('detects dark system theme', async () => {
      mockMatchMedia(true)
      renderWithThemeProvider({ defaultTheme: 'system' })
      
      await waitFor(() => {
        expect(screen.getByTestId('isDark')).toHaveTextContent('true')
        expect(mockAddClass).toHaveBeenCalledWith('dark')
      })
    })
  })

  describe('Persistence', () => {
    it('persists theme changes to localStorage', async () => {
      renderWithThemeProvider()
      
      screen.getByTestId('set-dark').click()
      
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith('qc-theme', 'dark')
      })
    })

    it('uses custom storage key for persistence', async () => {
      renderWithThemeProvider({ storageKey: 'my-app-theme' })
      
      screen.getByTestId('set-light').click()
      
      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith('my-app-theme', 'light')
      })
    })
  })
})

describe('useTheme hook', () => {
  it('throws error when used outside ThemeProvider', () => {
    const TestComponentOutside = () => {
      useTheme()
      return null
    }
    
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    
    expect(() => {
      render(<TestComponentOutside />)
    }).toThrow('useTheme must be used within a ThemeProvider')
    
    consoleSpy.mockRestore()
  })

  it('returns theme context values', () => {
    render(
      <ThemeProvider defaultTheme="dark">
        <TestComponent />
      </ThemeProvider>
    )
    
    expect(screen.getByTestId('theme')).toHaveTextContent('dark')
    expect(screen.getByTestId('isDark')).toHaveTextContent('true')
  })

  it('provides working setTheme function', async () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )
    
    screen.getByTestId('set-light').click()
    
    await waitFor(() => {
      expect(screen.getByTestId('theme')).toHaveTextContent('light')
    })
  })

  it('provides working toggle function', async () => {
    render(
      <ThemeProvider defaultTheme="light">
        <TestComponent />
      </ThemeProvider>
    )
    
    screen.getByTestId('toggle').click()
    
    await waitFor(() => {
      expect(screen.getByTestId('theme')).toHaveTextContent('dark')
    })
  })
})

describe('Mobile-specific features', () => {
  it('updates mobile browser theme-color for light theme', async () => {
    const mockMetaSetAttribute = jest.fn()
    mockQuerySelector.mockReturnValue({
      setAttribute: mockMetaSetAttribute,
    })
    
    render(
      <ThemeProvider defaultTheme="light">
        <TestComponent />
      </ThemeProvider>
    )
    
    await waitFor(() => {
      expect(mockMetaSetAttribute).toHaveBeenCalledWith('content', '#ffffff')
    })
  })

  it('updates mobile browser theme-color for dark theme', async () => {
    const mockMetaSetAttribute = jest.fn()
    mockQuerySelector.mockReturnValue({
      setAttribute: mockMetaSetAttribute,
    })
    
    render(
      <ThemeProvider defaultTheme="dark">
        <TestComponent />
      </ThemeProvider>
    )
    
    await waitFor(() => {
      expect(mockMetaSetAttribute).toHaveBeenCalledWith('content', '#1f2937')
    })
  })

  it('sets proper data-theme attribute for CSS targeting', async () => {
    render(
      <ThemeProvider defaultTheme="dark">
        <TestComponent />
      </ThemeProvider>
    )
    
    await waitFor(() => {
      expect(mockSetAttribute).toHaveBeenCalledWith('data-theme', 'dark')
    })
  })
})