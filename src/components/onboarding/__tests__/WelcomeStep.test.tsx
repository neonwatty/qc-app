import { render, screen, fireEvent } from '@testing-library/react'
import { WelcomeStep } from '../WelcomeStep'

describe('WelcomeStep', () => {
  const mockOnNext = jest.fn()

  beforeEach(() => {
    mockOnNext.mockClear()
  })

  it('renders welcome content correctly', () => {
    render(<WelcomeStep onNext={mockOnNext} />)
    
    expect(screen.getByText('Welcome to Quality Control')).toBeInTheDocument()
    expect(screen.getByText('Let\'s personalize your relationship check-in experience')).toBeInTheDocument()
    expect(screen.getByText(/Jeremy/)).toBeInTheDocument()
    expect(screen.getByText(/Deb/)).toBeInTheDocument()
  })

  it('displays feature previews', () => {
    render(<WelcomeStep onNext={mockOnNext} />)
    
    expect(screen.getByText('Communication')).toBeInTheDocument()
    expect(screen.getByText('Love Languages')).toBeInTheDocument()
    expect(screen.getByText('Reminders')).toBeInTheDocument()
  })

  it('displays setup information', () => {
    render(<WelcomeStep onNext={mockOnNext} />)
    
    expect(screen.getByText('5 minute setup')).toBeInTheDocument()
    expect(screen.getByText('Personalized experience')).toBeInTheDocument()
  })

  it('calls onNext when get started button is clicked', () => {
    render(<WelcomeStep onNext={mockOnNext} />)
    
    const getStartedButton = screen.getByRole('button', { name: /let's get started/i })
    fireEvent.click(getStartedButton)
    
    expect(mockOnNext).toHaveBeenCalledTimes(1)
  })

  it('renders heart icon in header', () => {
    render(<WelcomeStep onNext={mockOnNext} />)
    
    expect(screen.getByTestId('heart-icon')).toBeInTheDocument()
  })

  it('renders feature icons', () => {
    render(<WelcomeStep onNext={mockOnNext} />)
    
    expect(screen.getByTestId('users-icon')).toBeInTheDocument()
    expect(screen.getByTestId('sparkles-icon')).toBeInTheDocument()
  })
})