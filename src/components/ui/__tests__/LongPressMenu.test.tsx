import React from 'react'
import { 
  render, 
  screen, 
  waitFor,
  simulateLongPress,
  mockHapticFeedback,
  waitForAnimation 
} from '@/test-utils/mobileTestHelpers'
import { LongPressMenu, LongPressCard, useLongPress } from '../LongPressMenu'

// Mock framer-motion for testing
jest.mock('framer-motion', () => ({
  ...jest.requireActual('framer-motion'),
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

// Mock the ActionSheet component
jest.mock('../MobileSheet', () => ({
  ActionSheet: ({ open, onClose, actions, title, description }: any) => {
    if (!open) return null
    return (
      <div data-testid="action-sheet">
        {title && <div data-testid="action-sheet-title">{title}</div>}
        {description && <div data-testid="action-sheet-description">{description}</div>}
        {actions.map((action: any) => (
          <button
            key={action.id}
            data-testid={`action-${action.id}`}
            onClick={() => {
              action.onClick()
              onClose()
            }}
            disabled={action.disabled}
            className={action.variant === 'destructive' ? 'destructive' : ''}
          >
            {action.icon}
            {action.label}
          </button>
        ))}
        <button data-testid="close-action-sheet" onClick={onClose}>Close</button>
      </div>
    )
  },
}))

describe('LongPressMenu', () => {
  const mockActions = [
    { id: 'edit', label: 'Edit', onClick: jest.fn() },
    { id: 'share', label: 'Share', onClick: jest.fn() },
    { id: 'delete', label: 'Delete', variant: 'destructive' as const, onClick: jest.fn() },
    { id: 'disabled', label: 'Disabled', disabled: true, onClick: jest.fn() },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    mockHapticFeedback.setup()
  })

  const renderLongPressMenu = (props = {}) => {
    return render(
      <LongPressMenu actions={mockActions} {...props}>
        <div>Long press me</div>
      </LongPressMenu>
    )
  }

  describe('Rendering', () => {
    it('renders children content', () => {
      renderLongPressMenu()
      expect(screen.getByText('Long press me')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = renderLongPressMenu({ className: 'custom-class' })
      expect(container.firstChild?.firstChild).toHaveClass('custom-class')
    })

    it('does not show menu by default', () => {
      renderLongPressMenu()
      expect(screen.queryByTestId('action-sheet')).not.toBeInTheDocument()
    })
  })

  describe('Long press interaction', () => {
    it('shows menu after long press duration', async () => {
      renderLongPressMenu({ longPressDuration: 300 })
      const element = screen.getByText('Long press me').closest('div')
      
      if (element) {
        await simulateLongPress(element, 350)
        
        await waitFor(() => {
          expect(screen.getByTestId('action-sheet')).toBeInTheDocument()
        })
      }
    })

    it('does not show menu if press is too short', async () => {
      renderLongPressMenu({ longPressDuration: 500 })
      const element = screen.getByText('Long press me').closest('div')
      
      if (element) {
        await simulateLongPress(element, 200) // Too short
        
        expect(screen.queryByTestId('action-sheet')).not.toBeInTheDocument()
      }
    })

    it('triggers haptic feedback on long press', async () => {
      renderLongPressMenu()
      const element = screen.getByText('Long press me').closest('div')
      
      if (element) {
        await simulateLongPress(element, 600)
        
        await waitFor(() => {
          mockHapticFeedback.expectTriggered()
        })
      }
    })

    it('handles right click to show menu immediately', async () => {
      renderLongPressMenu()
      const element = screen.getByText('Long press me').closest('div')
      
      if (element) {
        // Simulate right click
        element.dispatchEvent(new MouseEvent('mousedown', { button: 2 }))
        
        await waitFor(() => {
          expect(screen.getByTestId('action-sheet')).toBeInTheDocument()
        })
      }
    })

    it('handles context menu event', async () => {
      renderLongPressMenu()
      const element = screen.getByText('Long press me').closest('div')
      
      if (element) {
        element.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }))
        
        await waitFor(() => {
          expect(screen.getByTestId('action-sheet')).toBeInTheDocument()
        })
      }
    })
  })

  describe('Action execution', () => {
    it('executes action when clicked', async () => {
      renderLongPressMenu()
      const element = screen.getByText('Long press me').closest('div')
      
      if (element) {
        await simulateLongPress(element, 600)
        
        await waitFor(() => {
          expect(screen.getByTestId('action-edit')).toBeInTheDocument()
        })
        
        screen.getByTestId('action-edit').click()
        
        expect(mockActions[0].onClick).toHaveBeenCalledTimes(1)
      }
    })

    it('does not execute disabled actions', async () => {
      renderLongPressMenu()
      const element = screen.getByText('Long press me').closest('div')
      
      if (element) {
        await simulateLongPress(element, 600)
        
        await waitFor(() => {
          expect(screen.getByTestId('action-disabled')).toBeInTheDocument()
        })
        
        const disabledAction = screen.getByTestId('action-disabled')
        expect(disabledAction).toBeDisabled()
        
        disabledAction.click()
        expect(mockActions[3].onClick).not.toHaveBeenCalled()
      }
    })

    it('closes menu after action execution', async () => {
      renderLongPressMenu()
      const element = screen.getByText('Long press me').closest('div')
      
      if (element) {
        await simulateLongPress(element, 600)
        
        await waitFor(() => {
          expect(screen.getByTestId('action-edit')).toBeInTheDocument()
        })
        
        screen.getByTestId('action-edit').click()
        
        await waitFor(() => {
          expect(screen.queryByTestId('action-sheet')).not.toBeInTheDocument()
        })
      }
    })
  })

  describe('Menu closing', () => {
    it('closes menu when close button is clicked', async () => {
      renderLongPressMenu()
      const element = screen.getByText('Long press me').closest('div')
      
      if (element) {
        await simulateLongPress(element, 600)
        
        await waitFor(() => {
          expect(screen.getByTestId('close-action-sheet')).toBeInTheDocument()
        })
        
        screen.getByTestId('close-action-sheet').click()
        
        await waitFor(() => {
          expect(screen.queryByTestId('action-sheet')).not.toBeInTheDocument()
        })
      }
    })
  })

  describe('Custom props', () => {
    it('shows title and description in action sheet', async () => {
      renderLongPressMenu({ 
        title: 'Menu Title',
        description: 'Menu description' 
      })
      const element = screen.getByText('Long press me').closest('div')
      
      if (element) {
        await simulateLongPress(element, 600)
        
        await waitFor(() => {
          expect(screen.getByTestId('action-sheet-title')).toHaveTextContent('Menu Title')
          expect(screen.getByTestId('action-sheet-description')).toHaveTextContent('Menu description')
        })
      }
    })

    it('respects custom long press duration', async () => {
      renderLongPressMenu({ longPressDuration: 100 })
      const element = screen.getByText('Long press me').closest('div')
      
      if (element) {
        await simulateLongPress(element, 150)
        
        await waitFor(() => {
          expect(screen.getByTestId('action-sheet')).toBeInTheDocument()
        })
      }
    })
  })

  describe('Disabled state', () => {
    it('does not respond to long press when disabled', async () => {
      renderLongPressMenu({ disabled: true })
      const element = screen.getByText('Long press me').closest('div')
      
      if (element) {
        await simulateLongPress(element, 600)
        
        expect(screen.queryByTestId('action-sheet')).not.toBeInTheDocument()
        mockHapticFeedback.expectNotTriggered()
      }
    })

    it('does not respond to context menu when disabled', async () => {
      renderLongPressMenu({ disabled: true })
      const element = screen.getByText('Long press me').closest('div')
      
      if (element) {
        element.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true }))
        
        expect(screen.queryByTestId('action-sheet')).not.toBeInTheDocument()
      }
    })
  })

  describe('Touch cancellation', () => {
    it('cancels long press on touch end', async () => {
      renderLongPressMenu()
      const element = screen.getByText('Long press me').closest('div')
      
      if (element) {
        // Start long press
        element.dispatchEvent(new TouchEvent('touchstart', {
          touches: [{ clientX: 100, clientY: 100 } as any]
        }))
        
        // End touch before duration completes
        setTimeout(() => {
          element.dispatchEvent(new TouchEvent('touchend'))
        }, 200)
        
        await waitFor(() => {
          expect(screen.queryByTestId('action-sheet')).not.toBeInTheDocument()
        }, { timeout: 600 })
      }
    })

    it('cancels long press on touch cancel', async () => {
      renderLongPressMenu()
      const element = screen.getByText('Long press me').closest('div')
      
      if (element) {
        element.dispatchEvent(new TouchEvent('touchstart', {
          touches: [{ clientX: 100, clientY: 100 } as any]
        }))
        
        setTimeout(() => {
          element.dispatchEvent(new TouchEvent('touchcancel'))
        }, 200)
        
        await waitFor(() => {
          expect(screen.queryByTestId('action-sheet')).not.toBeInTheDocument()
        }, { timeout: 600 })
      }
    })
  })
})

describe('LongPressCard', () => {
  const mockHandlers = {
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    onShare: jest.fn(),
    onDuplicate: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  const renderLongPressCard = (props = {}) => {
    return render(
      <LongPressCard {...mockHandlers} {...props}>
        <div>Card content</div>
      </LongPressCard>
    )
  }

  it('renders card content', () => {
    renderLongPressCard()
    expect(screen.getByText('Card content')).toBeInTheDocument()
  })

  it('shows default actions when handlers are provided', async () => {
    renderLongPressCard()
    const element = screen.getByText('Card content').closest('div')
    
    if (element) {
      await simulateLongPress(element, 600)
      
      await waitFor(() => {
        expect(screen.getByTestId('action-edit')).toBeInTheDocument()
        expect(screen.getByTestId('action-share')).toBeInTheDocument()
        expect(screen.getByTestId('action-duplicate')).toBeInTheDocument()
        expect(screen.getByTestId('action-delete')).toBeInTheDocument()
      })
    }
  })

  it('executes edit action', async () => {
    renderLongPressCard()
    const element = screen.getByText('Card content').closest('div')
    
    if (element) {
      await simulateLongPress(element, 600)
      
      await waitFor(() => {
        screen.getByTestId('action-edit').click()
      })
      
      expect(mockHandlers.onEdit).toHaveBeenCalledTimes(1)
    }
  })

  it('shows delete action as destructive variant', async () => {
    renderLongPressCard()
    const element = screen.getByText('Card content').closest('div')
    
    if (element) {
      await simulateLongPress(element, 600)
      
      await waitFor(() => {
        const deleteAction = screen.getByTestId('action-delete')
        expect(deleteAction).toHaveClass('destructive')
      })
    }
  })

  it('includes custom actions', async () => {
    const customActions = [
      { id: 'custom', label: 'Custom Action', onClick: jest.fn() }
    ]
    
    renderLongPressCard({ customActions })
    const element = screen.getByText('Card content').closest('div')
    
    if (element) {
      await simulateLongPress(element, 600)
      
      await waitFor(() => {
        expect(screen.getByTestId('action-custom')).toBeInTheDocument()
      })
    }
  })

  it('only shows actions for provided handlers', async () => {
    renderLongPressCard({ 
      onEdit: mockHandlers.onEdit, 
      onDelete: undefined,
      onShare: undefined,
      onDuplicate: undefined 
    })
    const element = screen.getByText('Card content').closest('div')
    
    if (element) {
      await simulateLongPress(element, 600)
      
      await waitFor(() => {
        expect(screen.getByTestId('action-edit')).toBeInTheDocument()
        expect(screen.queryByTestId('action-delete')).not.toBeInTheDocument()
        expect(screen.queryByTestId('action-share')).not.toBeInTheDocument()
        expect(screen.queryByTestId('action-duplicate')).not.toBeInTheDocument()
      })
    }
  })
})

describe('useLongPress hook', () => {
  const TestComponent = ({ callback, options = {} }: any) => {
    const longPressHandlers = useLongPress(callback, options)
    
    return (
      <div 
        data-testid="long-press-target"
        {...longPressHandlers}
      >
        Long press target
      </div>
    )
  }

  const mockCallback = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockHapticFeedback.setup()
  })

  it('provides touch event handlers', () => {
    render(<TestComponent callback={mockCallback} />)
    const target = screen.getByTestId('long-press-target')
    
    expect(target).toBeInTheDocument()
  })

  it('triggers callback after duration', async () => {
    render(<TestComponent callback={mockCallback} options={{ duration: 300 }} />)
    const target = screen.getByTestId('long-press-target')
    
    await simulateLongPress(target, 350)
    
    await waitFor(() => {
      expect(mockCallback).toHaveBeenCalledTimes(1)
    })
  })

  it('triggers haptic feedback', async () => {
    render(<TestComponent callback={mockCallback} />)
    const target = screen.getByTestId('long-press-target')
    
    await simulateLongPress(target, 600)
    
    await waitFor(() => {
      mockHapticFeedback.expectTriggered()
    })
  })

  it('does not trigger when disabled', async () => {
    render(<TestComponent callback={mockCallback} options={{ disabled: true }} />)
    const target = screen.getByTestId('long-press-target')
    
    await simulateLongPress(target, 600)
    
    expect(mockCallback).not.toHaveBeenCalled()
    mockHapticFeedback.expectNotTriggered()
  })

  it('cancels on touch end', async () => {
    render(<TestComponent callback={mockCallback} />)
    const target = screen.getByTestId('long-press-target')
    
    // Start touch
    target.dispatchEvent(new TouchEvent('touchstart'))
    
    // End before duration
    setTimeout(() => {
      target.dispatchEvent(new TouchEvent('touchend'))
    }, 200)
    
    await waitFor(() => {
      expect(mockCallback).not.toHaveBeenCalled()
    }, { timeout: 600 })
  })

  it('respects custom duration', async () => {
    render(<TestComponent callback={mockCallback} options={{ duration: 100 }} />)
    const target = screen.getByTestId('long-press-target')
    
    await simulateLongPress(target, 150)
    
    await waitFor(() => {
      expect(mockCallback).toHaveBeenCalledTimes(1)
    })
  })
})