import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import OnboardingPage from '../page'
import { 
  setupLocalStorageForOnboarding, 
  clearLocalStorageMocks,
  mockOnboardingData 
} from '@/test-utils/onboarding-helpers'

// Mock useRouter
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}))

describe('OnboardingPage', () => {
  beforeEach(() => {
    clearLocalStorageMocks()
    mockPush.mockClear()
  })

  it('renders initial welcome step by default', () => {
    setupLocalStorageForOnboarding()
    
    render(<OnboardingPage />)
    
    expect(screen.getByText('Welcome to Quality Control')).toBeInTheDocument()
    expect(screen.getByText('Step 1 of 6')).toBeInTheDocument()
  })

  it('loads saved progress from localStorage', () => {
    setupLocalStorageForOnboarding({ 
      currentStep: 3, 
      preferences: { communicationStyle: 'face-to-face' } 
    })
    
    render(<OnboardingPage />)
    
    expect(screen.getByText('Step 3 of 6')).toBeInTheDocument()
  })

  it('redirects to dashboard if onboarding is complete', () => {
    setupLocalStorageForOnboarding({ completed: true })
    
    render(<OnboardingPage />)
    
    expect(mockPush).toHaveBeenCalledWith('/dashboard')
  })

  it('saves progress to localStorage when advancing steps', async () => {
    setupLocalStorageForOnboarding()
    
    render(<OnboardingPage />)
    
    // Click "Let's Get Started" to advance to step 2
    const getStartedButton = screen.getByRole('button', { name: /let's get started/i })
    fireEvent.click(getStartedButton)
    
    await waitFor(() => {
      expect(screen.getByText('Step 2 of 6')).toBeInTheDocument()
    })
    
    // Check that localStorage was called to save progress
    const localStorage = window.localStorage as jest.Mocked<Storage>
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'qc-onboarding-data',
      expect.stringContaining('"currentStep":2')
    )
  })

  it('handles skip functionality', () => {
    setupLocalStorageForOnboarding()
    
    render(<OnboardingPage />)
    
    const skipButton = screen.getByRole('button', { name: /skip/i })
    fireEvent.click(skipButton)
    
    const localStorage = window.localStorage as jest.Mocked<Storage>
    expect(localStorage.setItem).toHaveBeenCalledWith('qc-onboarding-complete', 'true')
    expect(localStorage.setItem).toHaveBeenCalledWith('qc-onboarding-skipped', 'true')
    expect(mockPush).toHaveBeenCalledWith('/dashboard')
  })

  it('allows backward navigation through steps', async () => {
    setupLocalStorageForOnboarding({ currentStep: 3 })
    
    render(<OnboardingPage />)
    
    // Should be on step 3, find and click back button (use more specific selector)
    const backButton = screen.getByRole('button', { name: /^back$/i })
    fireEvent.click(backButton)
    
    await waitFor(() => {
      expect(screen.getByText('Step 2 of 6')).toBeInTheDocument()
    })
  })

  it('completes onboarding and redirects to dashboard', async () => {
    // Set up completed onboarding state
    setupLocalStorageForOnboarding({ 
      currentStep: 6,
      completed: false,
      preferences: mockOnboardingData.preferences
    })
    
    render(<OnboardingPage />)
    
    // Should be on final step - find and click "Explore Dashboard"
    const completeButton = screen.getByRole('button', { name: /explore dashboard/i })
    fireEvent.click(completeButton)
    
    const localStorage = window.localStorage as jest.Mocked<Storage>
    expect(localStorage.setItem).toHaveBeenCalledWith('qc-onboarding-complete', 'true')
    expect(mockPush).toHaveBeenCalledWith('/dashboard')
  })

  it('saves preferences correctly throughout the flow', async () => {
    setupLocalStorageForOnboarding()
    
    render(<OnboardingPage />)
    
    // Advance to quiz step
    fireEvent.click(screen.getByRole('button', { name: /let's get started/i }))
    
    await waitFor(() => {
      expect(screen.getByText('Quick Relationship Quiz')).toBeInTheDocument()
    })
    
    // Answer first question
    fireEvent.click(screen.getByText('Face-to-face'))
    
    // Check that preferences were saved
    const localStorage = window.localStorage as jest.Mocked<Storage>
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'qc-onboarding-data',
      expect.stringContaining('"communicationStyle":"face-to-face"')
    )
  })

  it('displays correct progress throughout the flow', async () => {
    setupLocalStorageForOnboarding()
    
    render(<OnboardingPage />)
    
    // Step 1
    expect(screen.getByText('Step 1 of 6')).toBeInTheDocument()
    expect(screen.getByText('17% complete')).toBeInTheDocument()
    
    // Advance to step 2
    fireEvent.click(screen.getByRole('button', { name: /let's get started/i }))
    
    await waitFor(() => {
      expect(screen.getByText('Step 2 of 6')).toBeInTheDocument()
      expect(screen.getByText('33% complete')).toBeInTheDocument()
    })
  })

  it('displays start first check-in button on completion step', async () => {
    setupLocalStorageForOnboarding({ 
      currentStep: 6,
      preferences: mockOnboardingData.preferences
    })
    
    render(<OnboardingPage />)
    
    // Should be on completion step and show the check-in button
    expect(screen.getByText(/you're all set/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /start first check-in/i })).toBeInTheDocument()
  })
})