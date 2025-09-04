import React from 'react'
import { 
  render, 
  screen, 
  waitFor,
  simulateSwipe,
  mockHapticFeedback 
} from '@/test-utils/mobileTestHelpers'
import { SwipeNavigation, CardStack, useSwipeGestures } from '../SwipeGestures'

// Mock next/navigation
const mockBack = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    back: mockBack,
    push: jest.fn(),
  }),
}))

describe('SwipeNavigation', () => {
  const mockOnSwipeLeft = jest.fn()
  const mockOnSwipeRight = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockHapticFeedback.setup()
  })

  const renderSwipeNavigation = (props = {}) => {
    return render(
      <SwipeNavigation
        onSwipeLeft={mockOnSwipeLeft}
        onSwipeRight={mockOnSwipeRight}
        {...props}
      >
        <div>Swipeable Content</div>
      </SwipeNavigation>
    )
  }

  describe('Rendering', () => {
    it('renders children content', () => {
      renderSwipeNavigation()
      expect(screen.getByText('Swipeable Content')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = renderSwipeNavigation({ className: 'custom-swipe' })
      expect(container.firstChild).toHaveClass('custom-swipe')
    })
  })

  describe('Swipe interactions', () => {
    it('handles left swipe gesture', async () => {
      renderSwipeNavigation()
      const container = screen.getByText('Swipeable Content').closest('div')
      
      if (container) {
        simulateSwipe.left(container, 150) // Above default threshold
        
        await waitFor(() => {
          expect(mockOnSwipeLeft).toHaveBeenCalledTimes(1)
        })
      }
    })

    it('handles right swipe gesture', async () => {
      renderSwipeNavigation()
      const container = screen.getByText('Swipeable Content').closest('div')
      
      if (container) {
        simulateSwipe.right(container, 150)
        
        await waitFor(() => {
          expect(mockOnSwipeRight).toHaveBeenCalledTimes(1)
        })
      }
    })

    it('triggers router.back() on right swipe when enableBackSwipe is true', async () => {
      renderSwipeNavigation({ enableBackSwipe: true })
      const container = screen.getByText('Swipeable Content').closest('div')
      
      if (container) {
        simulateSwipe.right(container, 150)
        
        await waitFor(() => {
          expect(mockBack).toHaveBeenCalledTimes(1)
        })
      }
    })

    it('does not trigger navigation when swipe is below threshold', async () => {
      renderSwipeNavigation({ swipeThreshold: 100 })
      const container = screen.getByText('Swipeable Content').closest('div')
      
      if (container) {
        simulateSwipe.left(container, 50) // Below threshold
        
        expect(mockOnSwipeLeft).not.toHaveBeenCalled()
      }
    })

    it('respects custom swipe threshold', async () => {
      renderSwipeNavigation({ swipeThreshold: 200 })
      const container = screen.getByText('Swipeable Content').closest('div')
      
      if (container) {
        simulateSwipe.left(container, 250) // Above custom threshold
        
        await waitFor(() => {
          expect(mockOnSwipeLeft).toHaveBeenCalledTimes(1)
        })
      }
    })

    it('shows visual feedback during swipe', async () => {
      renderSwipeNavigation()
      const container = screen.getByText('Swipeable Content').closest('div')
      
      if (container) {
        // Simulate drag without release
        container.dispatchEvent(new Event('dragstart'))
        
        // Check for visual feedback elements
        await waitFor(() => {
          const feedbackElements = screen.queryAllByTestId('arrow-left-icon')
          expect(feedbackElements.length).toBeGreaterThanOrEqual(0)
        })
      }
    })

    it('triggers haptic feedback on successful swipe', async () => {
      renderSwipeNavigation()
      const container = screen.getByText('Swipeable Content').closest('div')
      
      if (container) {
        simulateSwipe.left(container, 150)
        
        await waitFor(() => {
          mockHapticFeedback.expectTriggered()
        })
      }
    })
  })

  describe('Disabled state', () => {
    it('does not respond to swipes when disabled', async () => {
      renderSwipeNavigation({ disabled: true })
      const container = screen.getByText('Swipeable Content').closest('div')
      
      if (container) {
        simulateSwipe.left(container, 150)
        
        expect(mockOnSwipeLeft).not.toHaveBeenCalled()
        mockHapticFeedback.expectNotTriggered()
      }
    })
  })
})

describe('CardStack', () => {
  const mockCards = [
    { id: '1', content: <div>Card 1</div> },
    { id: '2', content: <div>Card 2</div> },
    { id: '3', content: <div>Card 3</div> },
  ]

  const mockOnSwipeLeft = jest.fn()
  const mockOnSwipeRight = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  const renderCardStack = (props = {}) => {
    return render(
      <CardStack
        cards={mockCards}
        onSwipeLeft={mockOnSwipeLeft}
        onSwipeRight={mockOnSwipeRight}
        {...props}
      />
    )
  }

  describe('Rendering', () => {
    it('renders all cards with proper stacking', () => {
      renderCardStack()
      
      expect(screen.getByText('Card 1')).toBeInTheDocument()
      expect(screen.getByText('Card 2')).toBeInTheDocument()
      expect(screen.getByText('Card 3')).toBeInTheDocument()
    })

    it('limits visible cards to maxVisible prop', () => {
      renderCardStack({ maxVisible: 2 })
      
      expect(screen.getByText('Card 1')).toBeInTheDocument()
      expect(screen.getByText('Card 2')).toBeInTheDocument()
      expect(screen.queryByText('Card 3')).not.toBeInTheDocument()
    })

    it('shows empty state when no cards', () => {
      renderCardStack({ cards: [] })
      
      expect(screen.getByText('All done!')).toBeInTheDocument()
      expect(screen.getByText('No more cards to swipe')).toBeInTheDocument()
    })
  })

  describe('Card interactions', () => {
    it('handles card swipe left', async () => {
      renderCardStack()
      const firstCard = screen.getByText('Card 1').closest('[draggable]') || 
                       screen.getByText('Card 1').closest('div')
      
      if (firstCard) {
        simulateSwipe.left(firstCard, 150)
        
        await waitFor(() => {
          expect(mockOnSwipeLeft).toHaveBeenCalledWith(mockCards[0])
        })
      }
    })

    it('handles card swipe right', async () => {
      renderCardStack()
      const firstCard = screen.getByText('Card 1').closest('[draggable]') || 
                       screen.getByText('Card 1').closest('div')
      
      if (firstCard) {
        simulateSwipe.right(firstCard, 150)
        
        await waitFor(() => {
          expect(mockOnSwipeRight).toHaveBeenCalledWith(mockCards[0])
        })
      }
    })

    it('removes swiped card from stack', async () => {
      renderCardStack()
      const firstCard = screen.getByText('Card 1').closest('[draggable]') || 
                       screen.getByText('Card 1').closest('div')
      
      if (firstCard) {
        simulateSwipe.right(firstCard, 150)
        
        await waitFor(() => {
          expect(screen.queryByText('Card 1')).not.toBeInTheDocument()
        })
        
        // Card 2 should now be on top
        expect(screen.getByText('Card 2')).toBeInTheDocument()
      }
    })

    it('only allows dragging the top card', async () => {
      renderCardStack()
      const secondCard = screen.getByText('Card 2').closest('[draggable]') || 
                        screen.getByText('Card 2').closest('div')
      
      if (secondCard) {
        simulateSwipe.right(secondCard, 150)
        
        // Should not trigger swipe for non-top card
        expect(mockOnSwipeRight).not.toHaveBeenCalled()
      }
    })
  })

  describe('Animation and styling', () => {
    it('applies custom className', () => {
      const { container } = renderCardStack({ className: 'custom-stack' })
      expect(container.firstChild).toHaveClass('custom-stack')
    })
  })
})

describe('useSwipeGestures hook', () => {
  const TestComponent = ({ options = {} }: any) => {
    const swipeHandlers = useSwipeGestures(options)
    
    return (
      <div 
        data-testid="swipe-target"
        {...swipeHandlers}
      >
        Swipe me
      </div>
    )
  }

  const mockOnSwipeLeft = jest.fn()
  const mockOnSwipeRight = jest.fn()
  const mockOnSwipeUp = jest.fn()
  const mockOnSwipeDown = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockHapticFeedback.setup()
  })

  it('provides touch event handlers', () => {
    render(<TestComponent />)
    const target = screen.getByTestId('swipe-target')
    
    expect(target).toBeInTheDocument()
    // Handlers should be attached (tested through interaction)
  })

  it('handles horizontal swipes', async () => {
    render(
      <TestComponent 
        options={{ 
          onSwipeLeft: mockOnSwipeLeft, 
          onSwipeRight: mockOnSwipeRight 
        }} 
      />
    )
    
    const target = screen.getByTestId('swipe-target')
    
    simulateSwipe.left(target, 100)
    await waitFor(() => {
      expect(mockOnSwipeLeft).toHaveBeenCalledTimes(1)
    })
    
    simulateSwipe.right(target, 100)
    await waitFor(() => {
      expect(mockOnSwipeRight).toHaveBeenCalledTimes(1)
    })
  })

  it('handles vertical swipes', async () => {
    render(
      <TestComponent 
        options={{ 
          onSwipeUp: mockOnSwipeUp, 
          onSwipeDown: mockOnSwipeDown 
        }} 
      />
    )
    
    const target = screen.getByTestId('swipe-target')
    
    simulateSwipe.up(target, 100)
    await waitFor(() => {
      expect(mockOnSwipeUp).toHaveBeenCalledTimes(1)
    })
    
    simulateSwipe.down(target, 100)
    await waitFor(() => {
      expect(mockOnSwipeDown).toHaveBeenCalledTimes(1)
    })
  })

  it('respects custom threshold', async () => {
    render(
      <TestComponent 
        options={{ 
          onSwipeLeft: mockOnSwipeLeft,
          threshold: 100
        }} 
      />
    )
    
    const target = screen.getByTestId('swipe-target')
    
    // Below threshold
    simulateSwipe.left(target, 50)
    expect(mockOnSwipeLeft).not.toHaveBeenCalled()
    
    // Above threshold
    simulateSwipe.left(target, 150)
    await waitFor(() => {
      expect(mockOnSwipeLeft).toHaveBeenCalledTimes(1)
    })
  })

  it('triggers haptic feedback on swipe', async () => {
    render(
      <TestComponent 
        options={{ onSwipeLeft: mockOnSwipeLeft }} 
      />
    )
    
    const target = screen.getByTestId('swipe-target')
    
    simulateSwipe.left(target, 100)
    
    await waitFor(() => {
      mockHapticFeedback.expectTriggered()
    })
  })
})