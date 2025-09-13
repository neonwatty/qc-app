import { render, screen, fireEvent } from '@testing-library/react'
import { OnboardingFlow } from '../OnboardingFlow'

describe('OnboardingFlow', () => {
  const mockOnSkip = jest.fn()

  beforeEach(() => {
    mockOnSkip.mockClear()
  })

  it('renders progress bar correctly', () => {
    render(
      <OnboardingFlow currentStep={3} totalSteps={6} onSkip={mockOnSkip}>
        <div>Test content</div>
      </OnboardingFlow>
    )
    
    expect(screen.getByText('Step 3 of 6')).toBeInTheDocument()
    expect(screen.getByText('50% complete')).toBeInTheDocument()
  })

  it('renders skip button', () => {
    render(
      <OnboardingFlow currentStep={1} totalSteps={6} onSkip={mockOnSkip}>
        <div>Test content</div>
      </OnboardingFlow>
    )
    
    expect(screen.getByRole('button', { name: /skip/i })).toBeInTheDocument()
  })

  it('calls onSkip when skip button is clicked', () => {
    render(
      <OnboardingFlow currentStep={1} totalSteps={6} onSkip={mockOnSkip}>
        <div>Test content</div>
      </OnboardingFlow>
    )
    
    const skipButton = screen.getByRole('button', { name: /skip/i })
    fireEvent.click(skipButton)
    
    expect(mockOnSkip).toHaveBeenCalledTimes(1)
  })

  it('renders children content', () => {
    render(
      <OnboardingFlow currentStep={1} totalSteps={6} onSkip={mockOnSkip}>
        <div data-testid="child-content">Test content</div>
      </OnboardingFlow>
    )
    
    expect(screen.getByTestId('child-content')).toBeInTheDocument()
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('applies correct styling and layout', () => {
    render(
      <OnboardingFlow currentStep={1} totalSteps={6} onSkip={mockOnSkip}>
        <div>Test content</div>
      </OnboardingFlow>
    )
    
    // Check for background gradient class
    expect(document.querySelector('.bg-gradient-to-br')).toBeInTheDocument()
  })

  it('renders X icon in skip button', () => {
    render(
      <OnboardingFlow currentStep={1} totalSteps={6} onSkip={mockOnSkip}>
        <div>Test content</div>
      </OnboardingFlow>
    )
    
    expect(screen.getByTestId('x-icon')).toBeInTheDocument()
  })
})