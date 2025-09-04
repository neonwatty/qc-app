import React from 'react'
import { 
  render, 
  screen, 
  waitFor,
  simulateDrag,
  mockHapticFeedback 
} from '@/test-utils/mobileTestHelpers'
import { PullToRefresh, usePullToRefresh } from '../PullToRefresh'

// Mock framer-motion for testing
const mockSetY = jest.fn()
const mockUseMotionValue = jest.fn(() => ({
  set: mockSetY,
  get: jest.fn(() => 0)
}))

jest.mock('framer-motion', () => ({
  ...jest.requireActual('framer-motion'),
  useMotionValue: () => mockUseMotionValue(),
  useTransform: jest.fn(() => 0),
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}))

describe('PullToRefresh', () => {
  const mockOnRefresh = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockHapticFeedback.setup()
  })

  const renderPullToRefresh = (props = {}) => {
    return render(
      <PullToRefresh onRefresh={mockOnRefresh} {...props}>
        <div>Test Content</div>
      </PullToRefresh>
    )
  }

  describe('Rendering', () => {
    it('renders children content', () => {
      renderPullToRefresh()
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('renders refresh indicator', () => {
      renderPullToRefresh()
      expect(screen.getByTestId('refresh-icon')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = renderPullToRefresh({ className: 'custom-class' })
      expect(container.firstChild).toHaveClass('custom-class')
    })
  })

  describe('Pull-to-refresh interaction', () => {
    it('handles drag start at top of scroll', async () => {
      renderPullToRefresh()
      const container = screen.getByText('Test Content').closest('div')
      
      if (container) {
        // Mock scrollTop to 0 (at top)
        Object.defineProperty(container, 'scrollTop', {
          value: 0,
          writable: true
        })

        simulateDrag.start(container, { clientX: 100, clientY: 100 })
        
        // Should start pulling
        expect(container).toHaveClass('h-full')
      }
    })

    it('triggers refresh when dragged beyond threshold', async () => {
      renderPullToRefresh({ refreshThreshold: 60 })
      const container = screen.getByText('Test Content').closest('div')
      
      if (container) {
        Object.defineProperty(container, 'scrollTop', { value: 0 })
        
        await simulateDrag.pullDown(container, 70) // Beyond threshold
        
        await waitFor(() => {
          expect(mockOnRefresh).toHaveBeenCalledTimes(1)
        })
      }
    })

    it('does not trigger refresh when drag is below threshold', async () => {
      renderPullToRefresh({ refreshThreshold: 60 })
      const container = screen.getByText('Test Content').closest('div')
      
      if (container) {
        Object.defineProperty(container, 'scrollTop', { value: 0 })
        
        await simulateDrag.pullDown(container, 30) // Below threshold
        
        expect(mockOnRefresh).not.toHaveBeenCalled()
      }
    })

    it('shows loading overlay during refresh', async () => {
      const slowRefresh = () => new Promise(resolve => setTimeout(resolve, 100))
      renderPullToRefresh({ onRefresh: slowRefresh })
      
      const container = screen.getByText('Test Content').closest('div')
      
      if (container) {
        Object.defineProperty(container, 'scrollTop', { value: 0 })
        
        await simulateDrag.pullDown(container, 70)
        
        await waitFor(() => {
          expect(screen.getByText('Refreshing...')).toBeInTheDocument()
        })
      }
    })

    it('triggers haptic feedback on successful refresh', async () => {
      renderPullToRefresh()
      const container = screen.getByText('Test Content').closest('div')
      
      if (container) {
        Object.defineProperty(container, 'scrollTop', { value: 0 })
        
        await simulateDrag.pullDown(container, 70)
        
        await waitFor(() => {
          mockHapticFeedback.expectTriggered()
        })
      }
    })
  })

  describe('Disabled state', () => {
    it('does not respond to drag when disabled', async () => {
      renderPullToRefresh({ disabled: true })
      const container = screen.getByText('Test Content').closest('div')
      
      if (container) {
        await simulateDrag.pullDown(container, 70)
        expect(mockOnRefresh).not.toHaveBeenCalled()
      }
    })

    it('does not trigger haptic feedback when disabled', async () => {
      renderPullToRefresh({ disabled: true })
      const container = screen.getByText('Test Content').closest('div')
      
      if (container) {
        await simulateDrag.pullDown(container, 70)
        mockHapticFeedback.expectNotTriggered()
      }
    })
  })

  describe('Custom threshold', () => {
    it('respects custom refresh threshold', async () => {
      renderPullToRefresh({ refreshThreshold: 100 })
      const container = screen.getByText('Test Content').closest('div')
      
      if (container) {
        Object.defineProperty(container, 'scrollTop', { value: 0 })
        
        // Just below custom threshold
        await simulateDrag.pullDown(container, 90)
        expect(mockOnRefresh).not.toHaveBeenCalled()
        
        // Above custom threshold
        await simulateDrag.pullDown(container, 110)
        await waitFor(() => {
          expect(mockOnRefresh).toHaveBeenCalledTimes(1)
        })
      }
    })
  })

  describe('Error handling', () => {
    it('handles refresh errors gracefully', async () => {
      const failingRefresh = jest.fn().mockRejectedValue(new Error('Refresh failed'))
      renderPullToRefresh({ onRefresh: failingRefresh })
      
      const container = screen.getByText('Test Content').closest('div')
      
      if (container) {
        Object.defineProperty(container, 'scrollTop', { value: 0 })
        
        await simulateDrag.pullDown(container, 70)
        
        await waitFor(() => {
          expect(failingRefresh).toHaveBeenCalled()
        })
        
        // Should still reset state after error
        await waitFor(() => {
          expect(screen.queryByText('Refreshing...')).not.toBeInTheDocument()
        }, { timeout: 1000 })
      }
    })
  })
})

// Test the usePullToRefresh hook
describe('usePullToRefresh', () => {
  const TestComponent = ({ onRefresh, options = {} }: any) => {
    const { isRefreshing, handleRefresh } = usePullToRefresh(onRefresh, options)
    
    return (
      <div>
        <div data-testid="refreshing">{isRefreshing.toString()}</div>
        <button onClick={handleRefresh}>Refresh</button>
      </div>
    )
  }

  it('provides refresh state and handler', () => {
    const mockRefresh = jest.fn()
    render(<TestComponent onRefresh={mockRefresh} />)
    
    expect(screen.getByTestId('refreshing')).toHaveTextContent('false')
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('handles refresh through hook', async () => {
    const mockRefresh = jest.fn().mockResolvedValue(undefined)
    render(<TestComponent onRefresh={mockRefresh} />)
    
    const button = screen.getByRole('button')
    button.click()
    
    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalledTimes(1)
    })
  })

  it('respects disabled option', async () => {
    const mockRefresh = jest.fn()
    render(<TestComponent onRefresh={mockRefresh} options={{ disabled: true }} />)
    
    const button = screen.getByRole('button')
    button.click()
    
    expect(mockRefresh).not.toHaveBeenCalled()
  })
})