import React from 'react'
import { 
  render, 
  screen, 
  waitFor,
  mockHapticFeedback,
  expectTouchTarget,
  createMobileUserEvent
} from '@/test-utils/mobileTestHelpers'
import { 
  TouchButton, 
  FAB, 
  IconButton, 
  PrimaryButton, 
  MobileButton, 
  TouchButtonProps 
} from '../TouchButton'
import { Heart, Plus } from 'lucide-react'

// Mock the touch-interactions module
jest.mock('../../../lib/touch-interactions', () => ({
  optimizeForTouch: jest.fn(() => jest.fn()), // Returns cleanup function
  ensureTouchTarget: jest.fn(),
}))

// Mock framer-motion for testing
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}))

describe('TouchButton', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockHapticFeedback.setup()
  })

  const renderTouchButton = (props: Partial<TouchButtonProps> = {}) => {
    return render(
      <TouchButton {...props}>
        Test Button
      </TouchButton>
    )
  }

  describe('Basic rendering', () => {
    it('renders button text', () => {
      renderTouchButton()
      expect(screen.getByRole('button', { name: 'Test Button' })).toBeInTheDocument()
    })

    it('applies default classes', () => {
      renderTouchButton()
      const button = screen.getByRole('button')
      expect(button).toHaveClass('inline-flex', 'items-center', 'justify-center')
    })

    it('applies custom className', () => {
      renderTouchButton({ className: 'custom-class' })
      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-class')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>()
      render(<TouchButton ref={ref}>Button</TouchButton>)
      
      expect(ref.current).toBeInstanceOf(HTMLButtonElement)
      expect(ref.current).toHaveTextContent('Button')
    })
  })

  describe('Size variants', () => {
    it('applies default size correctly', () => {
      renderTouchButton()
      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-11')
      expectTouchTarget(button)
    })

    it('applies small size but maintains touch target', () => {
      renderTouchButton({ size: 'sm' })
      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-11') // Still 44px for touch
      expectTouchTarget(button)
    })

    it('applies large size correctly', () => {
      renderTouchButton({ size: 'lg' })
      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-14')
      expectTouchTarget(button)
    })

    it('applies icon size correctly', () => {
      renderTouchButton({ size: 'icon' })
      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-11', 'w-11')
      expectTouchTarget(button)
    })

    it('applies FAB size correctly', () => {
      renderTouchButton({ size: 'fab' })
      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-14', 'w-14', 'rounded-full')
      expectTouchTarget(button)
    })
  })

  describe('Style variants', () => {
    it('applies default variant', () => {
      renderTouchButton()
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-primary', 'text-primary-foreground')
    })

    it('applies destructive variant', () => {
      renderTouchButton({ variant: 'destructive' })
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-destructive', 'text-destructive-foreground')
    })

    it('applies outline variant', () => {
      renderTouchButton({ variant: 'outline' })
      const button = screen.getByRole('button')
      expect(button).toHaveClass('border', 'border-input')
    })

    it('applies ghost variant', () => {
      renderTouchButton({ variant: 'ghost' })
      const button = screen.getByRole('button')
      expect(button).toHaveClass('hover:bg-accent')
    })
  })

  describe('Icons and content', () => {
    it('renders left icon', () => {
      renderTouchButton({ leftIcon: <Heart data-testid="left-icon" /> })
      
      expect(screen.getByTestId('left-icon')).toBeInTheDocument()
      expect(screen.getByText('Test Button')).toBeInTheDocument()
    })

    it('renders right icon', () => {
      renderTouchButton({ rightIcon: <Plus data-testid="right-icon" /> })
      
      expect(screen.getByTestId('right-icon')).toBeInTheDocument()
      expect(screen.getByText('Test Button')).toBeInTheDocument()
    })

    it('renders both left and right icons', () => {
      renderTouchButton({ 
        leftIcon: <Heart data-testid="left-icon" />,
        rightIcon: <Plus data-testid="right-icon" />
      })
      
      expect(screen.getByTestId('left-icon')).toBeInTheDocument()
      expect(screen.getByTestId('right-icon')).toBeInTheDocument()
    })

    it('shows loading spinner and hides left icon when loading', () => {
      renderTouchButton({ 
        loading: true,
        leftIcon: <Heart data-testid="left-icon" />
      })
      
      expect(screen.queryByTestId('left-icon')).not.toBeInTheDocument()
      const spinner = screen.getByRole('button').querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })
  })

  describe('Interaction behavior', () => {
    it('handles click events', async () => {
      const handleClick = jest.fn()
      renderTouchButton({ onClick: handleClick })
      
      const button = screen.getByRole('button')
      await createMobileUserEvent().click(button)
      
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('is disabled when loading', () => {
      renderTouchButton({ loading: true })
      const button = screen.getByRole('button')
      
      expect(button).toBeDisabled()
    })

    it('is disabled when disabled prop is true', () => {
      renderTouchButton({ disabled: true })
      const button = screen.getByRole('button')
      
      expect(button).toBeDisabled()
    })

    it('does not trigger onClick when disabled', async () => {
      const handleClick = jest.fn()
      renderTouchButton({ disabled: true, onClick: handleClick })
      
      const button = screen.getByRole('button')
      await createMobileUserEvent().click(button)
      
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('Haptic feedback', () => {
    it('triggers light haptic feedback', async () => {
      renderTouchButton({ hapticFeedback: 'light' })
      
      const button = screen.getByRole('button')
      await createMobileUserEvent().click(button)
      
      mockHapticFeedback.expectTriggered(10)
    })

    it('triggers medium haptic feedback', async () => {
      renderTouchButton({ hapticFeedback: 'medium' })
      
      const button = screen.getByRole('button')
      await createMobileUserEvent().click(button)
      
      mockHapticFeedback.expectTriggered(50)
    })

    it('triggers heavy haptic feedback', async () => {
      renderTouchButton({ hapticFeedback: 'heavy' })
      
      const button = screen.getByRole('button')
      await createMobileUserEvent().click(button)
      
      mockHapticFeedback.expectTriggered(100)
    })

    it('does not trigger haptic feedback when not specified', async () => {
      renderTouchButton()
      
      const button = screen.getByRole('button')
      await createMobileUserEvent().click(button)
      
      mockHapticFeedback.expectNotTriggered()
    })
  })

  describe('Press styles', () => {
    it('applies scale press style by default', () => {
      renderTouchButton()
      const button = screen.getByRole('button')
      expect(button).toHaveClass('active:scale-95')
    })

    it('applies lift press style', () => {
      renderTouchButton({ pressStyle: 'lift' })
      const button = screen.getByRole('button')
      expect(button).toHaveClass('hover:translate-y-[-1px]', 'active:translate-y-0')
    })

    it('applies press style', () => {
      renderTouchButton({ pressStyle: 'press' })
      const button = screen.getByRole('button')
      expect(button).toHaveClass('active:translate-y-[1px]')
    })

    it('applies no press style', () => {
      renderTouchButton({ pressStyle: 'none' })
      const button = screen.getByRole('button')
      expect(button).not.toHaveClass('active:scale-95')
    })
  })

  describe('asChild prop', () => {
    it('renders as child component when asChild is true', () => {
      render(
        <TouchButton asChild>
          <a href="/test">Link Button</a>
        </TouchButton>
      )
      
      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', '/test')
      expect(link).toHaveTextContent('Link Button')
    })
  })
})

describe('FAB (Floating Action Button)', () => {
  it('renders as floating action button', () => {
    render(<FAB>+</FAB>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('fixed', 'bottom-6', 'right-6', 'z-50', 'rounded-full')
    expectTouchTarget(button)
  })

  it('applies custom className', () => {
    render(<FAB className="bottom-4">+</FAB>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bottom-4')
  })
})

describe('IconButton', () => {
  it('renders as icon button', () => {
    render(<IconButton><Heart /></IconButton>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('h-11', 'w-11', 'flex-shrink-0')
    expectTouchTarget(button)
  })

  it('uses ghost variant by default', () => {
    render(<IconButton><Heart /></IconButton>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('hover:bg-accent')
  })
})

describe('PrimaryButton', () => {
  it('renders as primary button', () => {
    render(<PrimaryButton>Primary</PrimaryButton>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('h-14', 'font-semibold', 'bg-primary')
    expectTouchTarget(button)
  })

  it('has haptic feedback by default', async () => {
    render(<PrimaryButton>Primary</PrimaryButton>)
    
    const button = screen.getByRole('button')
    await createMobileUserEvent().click(button)
    
    mockHapticFeedback.expectTriggered(10) // Light haptic
  })
})

describe('MobileButton', () => {
  it('renders as full-width mobile button', () => {
    render(<MobileButton>Mobile</MobileButton>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('w-full', 'h-14')
    expectTouchTarget(button)
  })

  it('uses scale press style by default', () => {
    render(<MobileButton>Mobile</MobileButton>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('active:scale-95')
  })
})

describe('Accessibility', () => {
  it('maintains minimum touch target size across all variants', () => {
    const variants = ['default', 'sm', 'lg', 'xl', 'icon', 'iconLg', 'fab', 'wide'] as const
    
    variants.forEach(size => {
      render(<TouchButton size={size} key={size}>Button {size}</TouchButton>)
      const button = screen.getByRole('button', { name: `Button ${size}` })
      expectTouchTarget(button)
    })
  })

  it('supports keyboard navigation', () => {
    renderTouchButton()
    const button = screen.getByRole('button')
    
    button.focus()
    expect(button).toHaveFocus()
  })

  it('supports proper ARIA attributes', () => {
    renderTouchButton({ 'aria-label': 'Custom label', disabled: true })
    const button = screen.getByRole('button')
    
    expect(button).toHaveAttribute('aria-label', 'Custom label')
    expect(button).toBeDisabled()
  })

  it('prevents text selection with proper CSS', () => {
    renderTouchButton()
    const button = screen.getByRole('button')
    
    expect(button).toHaveClass('select-none', 'touch-manipulation')
  })
})