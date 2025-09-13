import { render, screen, fireEvent } from '@testing-library/react'
import { CompleteStep } from '../CompleteStep'
import { mockCompleteStepProps } from '@/test-utils/onboarding-helpers'

// Mock canvas-confetti
jest.mock('canvas-confetti', () => jest.fn())

describe('CompleteStep', () => {
  const mockConfetti = require('canvas-confetti')

  beforeEach(() => {
    jest.clearAllMocks()
    mockConfetti.mockClear()
  })

  it('renders completion content correctly', () => {
    render(<CompleteStep {...mockCompleteStepProps} />)
    
    expect(screen.getByText('You\'re All Set! 🎉')).toBeInTheDocument()
    expect(screen.getByText('Your personalized experience is ready')).toBeInTheDocument()
  })

  it('displays preferences summary', () => {
    const props = {
      ...mockCompleteStepProps,
      preferences: {
        communicationStyle: 'face-to-face',
        checkInFrequency: 'weekly',
        loveLanguages: ['words', 'time'],
        reminderTime: '20:00',
        reminderDay: 'sunday'
      }
    }
    
    render(<CompleteStep {...props} />)
    
    expect(screen.getByText('Your Preferences')).toBeInTheDocument()
    expect(screen.getByText('Face-to-face conversations')).toBeInTheDocument()
    expect(screen.getByText('Weekly check-ins')).toBeInTheDocument()
    expect(screen.getByText('2 love languages selected')).toBeInTheDocument()
    expect(screen.getByText('Reminder scheduled')).toBeInTheDocument()
  })

  it('displays welcome message', () => {
    render(<CompleteStep {...mockCompleteStepProps} />)
    
    expect(screen.getByText('Welcome to your journey!')).toBeInTheDocument()
    expect(screen.getByText(/Jeremy & Deb's relationship dashboard is ready/)).toBeInTheDocument()
  })

  it('shows action buttons', () => {
    render(<CompleteStep {...mockCompleteStepProps} />)
    
    expect(screen.getByRole('button', { name: /start first check-in/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /explore dashboard/i })).toBeInTheDocument()
  })

  it('calls onComplete when explore dashboard is clicked', () => {
    render(<CompleteStep {...mockCompleteStepProps} />)
    
    const exploreButton = screen.getByRole('button', { name: /explore dashboard/i })
    fireEvent.click(exploreButton)
    
    expect(mockCompleteStepProps.onComplete).toHaveBeenCalledTimes(1)
  })

  it('shows back button', () => {
    render(<CompleteStep {...mockCompleteStepProps} />)
    
    const backButton = screen.getByRole('button', { name: /go back/i })
    expect(backButton).toBeInTheDocument()
  })

  it('calls onPrevious when back button is clicked', () => {
    render(<CompleteStep {...mockCompleteStepProps} />)
    
    const backButton = screen.getByRole('button', { name: /go back/i })
    fireEvent.click(backButton)
    
    expect(mockCompleteStepProps.onPrevious).toHaveBeenCalledTimes(1)
  })

  it('triggers confetti animation on mount', () => {
    jest.useFakeTimers()
    
    render(<CompleteStep {...mockCompleteStepProps} />)
    
    // Fast-forward past the setTimeout delay
    jest.advanceTimersByTime(500)
    
    expect(mockConfetti).toHaveBeenCalledWith({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    })
    
    jest.useRealTimers()
  })

  it('renders check circle icon', () => {
    render(<CompleteStep {...mockCompleteStepProps} />)
    
    expect(screen.getByTestId('check-circle-icon')).toBeInTheDocument()
  })

  it('renders other icons correctly', () => {
    render(<CompleteStep {...mockCompleteStepProps} />)
    
    expect(screen.getByTestId('sparkles-icon')).toBeInTheDocument()
    expect(screen.getByTestId('heart-icon')).toBeInTheDocument()
    expect(screen.getByTestId('message-circle-icon')).toBeInTheDocument()
    expect(screen.getByTestId('layout-dashboard-icon')).toBeInTheDocument()
  })

  it('handles empty preferences gracefully', () => {
    const propsWithEmptyPreferences = {
      ...mockCompleteStepProps,
      preferences: {}
    }
    
    render(<CompleteStep {...propsWithEmptyPreferences} />)
    
    // Should still render without crashing
    expect(screen.getByText('You\'re All Set! 🎉')).toBeInTheDocument()
  })
})