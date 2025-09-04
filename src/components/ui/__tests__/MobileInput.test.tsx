import React from 'react'
import { 
  render, 
  screen, 
  createMobileUserEvent,
  expectTouchTarget
} from '@/test-utils/mobileTestHelpers'
import { 
  MobileInput, 
  SearchInput, 
  PasswordInput, 
  NumberInput, 
  PhoneInput, 
  EmailInput,
  MobileInputProps 
} from '../MobileInput'
import { Search, Mail, Eye } from 'lucide-react'

describe('MobileInput', () => {
  const renderMobileInput = (props: Partial<MobileInputProps> = {}) => {
    return render(<MobileInput {...props} />)
  }

  describe('Basic rendering', () => {
    it('renders input element', () => {
      renderMobileInput({ placeholder: 'Test input' })
      expect(screen.getByPlaceholderText('Test input')).toBeInTheDocument()
    })

    it('applies default classes for touch optimization', () => {
      renderMobileInput({ 'data-testid': 'input' })
      const input = screen.getByTestId('input')
      expect(input).toHaveClass('touch-manipulation', 'transition-all')
    })

    it('applies custom className', () => {
      renderMobileInput({ className: 'custom-class', 'data-testid': 'input' })
      const input = screen.getByTestId('input')
      expect(input).toHaveClass('custom-class')
    })

    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLInputElement>()
      render(<MobileInput ref={ref} placeholder="Test" />)
      
      expect(ref.current).toBeInstanceOf(HTMLInputElement)
      expect(ref.current).toHaveAttribute('placeholder', 'Test')
    })
  })

  describe('Size variants', () => {
    it('applies default size with proper touch target', () => {
      renderMobileInput({ 'data-testid': 'input' })
      const input = screen.getByTestId('input')
      expect(input).toHaveClass('h-10')
      expectTouchTarget(input)
    })

    it('applies small size but maintains good usability', () => {
      renderMobileInput({ size: 'sm', 'data-testid': 'input' })
      const input = screen.getByTestId('input')
      expect(input).toHaveClass('h-9')
    })

    it('applies large size for better touch', () => {
      renderMobileInput({ size: 'lg', 'data-testid': 'input' })
      const input = screen.getByTestId('input')
      expect(input).toHaveClass('h-12')
      expectTouchTarget(input)
    })

    it('applies extra large size', () => {
      renderMobileInput({ size: 'xl', 'data-testid': 'input' })
      const input = screen.getByTestId('input')
      expect(input).toHaveClass('h-14')
      expectTouchTarget(input)
    })
  })

  describe('Style variants', () => {
    it('applies default variant', () => {
      renderMobileInput({ 'data-testid': 'input' })
      const input = screen.getByTestId('input')
      expect(input).toHaveClass('border-input', 'bg-background')
    })

    it('applies filled variant', () => {
      renderMobileInput({ variant: 'filled', 'data-testid': 'input' })
      const input = screen.getByTestId('input')
      expect(input).toHaveClass('bg-muted', 'border-transparent')
    })

    it('applies ghost variant', () => {
      renderMobileInput({ variant: 'ghost', 'data-testid': 'input' })
      const input = screen.getByTestId('input')
      expect(input).toHaveClass('border-transparent', 'bg-transparent')
    })
  })

  describe('Label functionality', () => {
    it('renders label when provided', () => {
      renderMobileInput({ label: 'Test Label' })
      expect(screen.getByText('Test Label')).toBeInTheDocument()
    })

    it('associates label with input using id', () => {
      renderMobileInput({ label: 'Test Label', id: 'test-input' })
      const label = screen.getByText('Test Label')
      const input = screen.getByRole('textbox')
      
      expect(label).toHaveAttribute('for', 'test-input')
      expect(input).toHaveAttribute('id', 'test-input')
    })

    it('generates id when not provided', () => {
      renderMobileInput({ label: 'Test Label' })
      const input = screen.getByRole('textbox')
      const label = screen.getByText('Test Label')
      
      expect(input).toHaveAttribute('id')
      expect(label).toHaveAttribute('for', input.getAttribute('id'))
    })
  })

  describe('Icon functionality', () => {
    it('renders left icon', () => {
      renderMobileInput({ 
        leftIcon: <Search data-testid="left-icon" />,
        'data-testid': 'input'
      })
      
      expect(screen.getByTestId('left-icon')).toBeInTheDocument()
      const input = screen.getByTestId('input')
      expect(input).toHaveClass('pl-10')
    })

    it('renders right icon', () => {
      renderMobileInput({ 
        rightIcon: <Mail data-testid="right-icon" />,
        'data-testid': 'input'
      })
      
      expect(screen.getByTestId('right-icon')).toBeInTheDocument()
      const input = screen.getByTestId('input')
      expect(input).toHaveClass('pr-10')
    })

    it('handles right icon click', async () => {
      const handleRightIconClick = jest.fn()
      renderMobileInput({ 
        rightIcon: <Mail data-testid="right-icon" />,
        onRightIconClick: handleRightIconClick
      })
      
      const rightIcon = screen.getByTestId('right-icon').closest('div')!
      await createMobileUserEvent().click(rightIcon)
      
      expect(handleRightIconClick).toHaveBeenCalledTimes(1)
    })

    it('applies clickable styles to right icon when onClick provided', () => {
      renderMobileInput({ 
        rightIcon: <Mail data-testid="right-icon" />,
        onRightIconClick: jest.fn()
      })
      
      const rightIconContainer = screen.getByTestId('right-icon').closest('div')
      expect(rightIconContainer).toHaveClass('cursor-pointer')
    })

    it('renders both left and right icons with proper padding', () => {
      renderMobileInput({ 
        leftIcon: <Search data-testid="left-icon" />,
        rightIcon: <Mail data-testid="right-icon" />,
        'data-testid': 'input'
      })
      
      expect(screen.getByTestId('left-icon')).toBeInTheDocument()
      expect(screen.getByTestId('right-icon')).toBeInTheDocument()
      
      const input = screen.getByTestId('input')
      expect(input).toHaveClass('pl-10', 'pr-10')
    })
  })

  describe('Error and helper text', () => {
    it('displays error message', () => {
      renderMobileInput({ error: 'This field is required' })
      expect(screen.getByText('This field is required')).toBeInTheDocument()
    })

    it('displays helper text', () => {
      renderMobileInput({ helperText: 'Enter your email address' })
      expect(screen.getByText('Enter your email address')).toBeInTheDocument()
    })

    it('prioritizes error over helper text', () => {
      renderMobileInput({ 
        error: 'Error message',
        helperText: 'Helper text'
      })
      
      expect(screen.getByText('Error message')).toBeInTheDocument()
      expect(screen.queryByText('Helper text')).not.toBeInTheDocument()
    })

    it('applies error styles to input', () => {
      renderMobileInput({ 
        error: 'Error message',
        'data-testid': 'input'
      })
      
      const input = screen.getByTestId('input')
      expect(input).toHaveClass('border-destructive', 'focus-visible:ring-destructive')
    })

    it('applies error text color', () => {
      renderMobileInput({ error: 'Error message' })
      const errorText = screen.getByText('Error message')
      expect(errorText).toHaveClass('text-destructive')
    })

    it('applies muted text color to helper text', () => {
      renderMobileInput({ helperText: 'Helper text' })
      const helperText = screen.getByText('Helper text')
      expect(helperText).toHaveClass('text-muted-foreground')
    })
  })

  describe('Input behavior', () => {
    it('handles user input', async () => {
      const user = createMobileUserEvent()
      renderMobileInput({ placeholder: 'Type here' })
      
      const input = screen.getByPlaceholderText('Type here')
      await user.type(input, 'Hello World')
      
      expect(input).toHaveValue('Hello World')
    })

    it('handles disabled state', () => {
      renderMobileInput({ disabled: true, placeholder: 'Disabled input' })
      const input = screen.getByPlaceholderText('Disabled input')
      
      expect(input).toBeDisabled()
      expect(input).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50')
    })

    it('handles onChange events', async () => {
      const handleChange = jest.fn()
      const user = createMobileUserEvent()
      
      renderMobileInput({ onChange: handleChange, placeholder: 'Test input' })
      
      const input = screen.getByPlaceholderText('Test input')
      await user.type(input, 'test')
      
      expect(handleChange).toHaveBeenCalled()
    })
  })
})

describe('SearchInput', () => {
  it('renders as search input type', () => {
    render(<SearchInput placeholder="Search..." />)
    const input = screen.getByPlaceholderText('Search...')
    
    expect(input).toHaveAttribute('type', 'search')
    expect(input).toHaveClass('rounded-full', 'bg-muted')
  })
})

describe('PasswordInput', () => {
  it('renders as password input with show/hide toggle', () => {
    render(<PasswordInput placeholder="Password" />)
    
    const input = screen.getByPlaceholderText('Password')
    expect(input).toHaveAttribute('type', 'password')
    expect(screen.getByText('Show')).toBeInTheDocument()
  })

  it('toggles password visibility', async () => {
    const user = createMobileUserEvent()
    render(<PasswordInput placeholder="Password" />)
    
    const input = screen.getByPlaceholderText('Password')
    const toggleButton = screen.getByText('Show')
    
    expect(input).toHaveAttribute('type', 'password')
    
    await user.click(toggleButton)
    
    expect(input).toHaveAttribute('type', 'text')
    expect(screen.getByText('Hide')).toBeInTheDocument()
    
    await user.click(screen.getByText('Hide'))
    
    expect(input).toHaveAttribute('type', 'password')
    expect(screen.getByText('Show')).toBeInTheDocument()
  })
})

describe('NumberInput', () => {
  it('renders with proper attributes for numeric input', () => {
    render(<NumberInput placeholder="Enter number" />)
    
    const input = screen.getByPlaceholderText('Enter number')
    expect(input).toHaveAttribute('type', 'number')
    expect(input).toHaveAttribute('inputmode', 'numeric')
    expect(input).toHaveClass('tabular-nums')
  })
})

describe('PhoneInput', () => {
  it('renders with proper attributes for phone input', () => {
    render(<PhoneInput placeholder="Phone number" />)
    
    const input = screen.getByPlaceholderText('Phone number')
    expect(input).toHaveAttribute('type', 'tel')
    expect(input).toHaveAttribute('inputmode', 'tel')
    expect(input).toHaveClass('tabular-nums')
  })
})

describe('EmailInput', () => {
  it('renders with proper attributes for email input', () => {
    render(<EmailInput placeholder="Email address" />)
    
    const input = screen.getByPlaceholderText('Email address')
    expect(input).toHaveAttribute('type', 'email')
    expect(input).toHaveAttribute('inputmode', 'email')
    expect(input).toHaveAttribute('autocapitalize', 'none')
    expect(input).toHaveAttribute('autocomplete', 'email')
  })
})

describe('Accessibility', () => {
  it('maintains proper focus management', async () => {
    const user = createMobileUserEvent()
    render(
      <div>
        <MobileInput placeholder="First input" />
        <MobileInput placeholder="Second input" />
      </div>
    )
    
    const firstInput = screen.getByPlaceholderText('First input')
    const secondInput = screen.getByPlaceholderText('Second input')
    
    await user.tab()
    expect(firstInput).toHaveFocus()
    
    await user.tab()
    expect(secondInput).toHaveFocus()
  })

  it('supports ARIA attributes', () => {
    render(
      <MobileInput 
        aria-label="Custom label"
        aria-describedby="helper-text"
        placeholder="Test input"
      />
    )
    
    const input = screen.getByPlaceholderText('Test input')
    expect(input).toHaveAttribute('aria-label', 'Custom label')
    expect(input).toHaveAttribute('aria-describedby', 'helper-text')
  })

  it('ensures minimum touch targets for interactive elements', () => {
    render(
      <MobileInput 
        rightIcon={<Eye data-testid="icon" />}
        onRightIconClick={jest.fn()}
        size="lg"
        placeholder="Test input"
      />
    )
    
    const input = screen.getByPlaceholderText('Test input')
    expectTouchTarget(input)
  })

  it('provides proper keyboard support for specialized inputs', async () => {
    const user = createMobileUserEvent()
    
    render(<NumberInput placeholder="Number" />)
    
    const input = screen.getByPlaceholderText('Number')
    await user.type(input, '123')
    
    expect(input).toHaveValue(123)
  })

  it('announces errors to screen readers', () => {
    render(
      <MobileInput 
        label="Email"
        error="Invalid email format"
        placeholder="Email"
      />
    )
    
    const errorMessage = screen.getByText('Invalid email format')
    expect(errorMessage).toBeInTheDocument()
  })
})