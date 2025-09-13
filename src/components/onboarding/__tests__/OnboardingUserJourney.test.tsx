import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import OnboardingPage from '../../../app/onboarding/page'
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

describe('Onboarding User Journey', () => {
  beforeEach(() => {
    clearLocalStorageMocks()
    mockPush.mockClear()
  })

  it('completes the full onboarding flow from start to finish', async () => {
    setupLocalStorageForOnboarding()
    
    render(<OnboardingPage />)
    
    // Step 1: Welcome
    expect(screen.getByText('Welcome to Quality Control')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /let's get started/i }))
    
    // Step 2: Quiz - Communication Style
    await waitFor(() => {
      expect(screen.getByText('Quick Relationship Quiz')).toBeInTheDocument()
    })
    
    fireEvent.click(screen.getByText('Face-to-face'))
    
    // Quiz automatically advances to frequency question
    await waitFor(() => {
      expect(screen.getByText(/how often would you like to check in/i)).toBeInTheDocument()
    })
    
    fireEvent.click(screen.getByText('Weekly'))
    
    // Quiz advances to session style question  
    await waitFor(() => {
      expect(screen.getByText(/what kind of check-in sessions work best/i)).toBeInTheDocument()
    })
    
    fireEvent.click(screen.getByText('Standard (20 min)'))
    
    // Continue to next step
    await waitFor(() => {
      const continueButton = screen.getByRole('button', { name: /continue/i })
      expect(continueButton).not.toBeDisabled()
    })
    
    fireEvent.click(screen.getByRole('button', { name: /continue/i }))
    
    // Step 3: Love Languages
    await waitFor(() => {
      expect(screen.getByText('What makes you feel most loved?')).toBeInTheDocument()
    })
    
    // Select 3 love languages
    fireEvent.click(screen.getByText('Words of Affirmation'))
    fireEvent.click(screen.getByText('Quality Time'))  
    fireEvent.click(screen.getByText('Acts of Service'))
    
    // When 3 languages are selected, button text changes to "See Deb's Languages"
    fireEvent.click(screen.getByRole('button', { name: /see deb's languages/i }))
    
    // Wait for partner view and then continue
    await waitFor(() => {
      expect(screen.getByText("Deb's Love Languages")).toBeInTheDocument()
    })
    
    fireEvent.click(screen.getByRole('button', { name: /continue/i }))
    
    // Step 4: Reminders
    await waitFor(() => {
      expect(screen.getByText('Set Your First Reminder')).toBeInTheDocument()
    })
    
    fireEvent.click(screen.getByRole('button', { name: /continue/i }))
    
    // Step 5: Tour
    await waitFor(() => {
      expect(screen.getByText('Discover Key Features')).toBeInTheDocument()
    })
    
    // Navigate through the tour features until we get to "Finish Tour"
    // The tour has 4 features, so click "Next Feature" 3 times to reach the last one
    fireEvent.click(screen.getByRole('button', { name: /next feature/i }))
    fireEvent.click(screen.getByRole('button', { name: /next feature/i }))
    fireEvent.click(screen.getByRole('button', { name: /next feature/i }))
    
    // Now on the last feature, button should be "Finish Tour"
    fireEvent.click(screen.getByRole('button', { name: /finish tour/i }))
    
    // Step 6: Complete
    await waitFor(() => {
      expect(screen.getByText(/you're all set/i)).toBeInTheDocument()
    })
    
    // Verify preferences were saved correctly
    const localStorage = window.localStorage as jest.Mocked<Storage>
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'qc-onboarding-data',
      expect.stringContaining('"communicationStyle":"face-to-face"')
    )
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'qc-onboarding-data', 
      expect.stringContaining('"checkInFrequency":"weekly"')
    )
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'qc-onboarding-data',
      expect.stringContaining('"sessionStyle":"standard"')
    )
    
    // Complete onboarding
    fireEvent.click(screen.getByRole('button', { name: /explore dashboard/i }))
    
    // Verify completion was saved and redirected
    expect(localStorage.setItem).toHaveBeenCalledWith('qc-onboarding-complete', 'true')
    expect(mockPush).toHaveBeenCalledWith('/dashboard')
  })
  
  it('allows user to navigate backwards through the flow', async () => {
    setupLocalStorageForOnboarding({ currentStep: 4 })
    
    render(<OnboardingPage />)
    
    // Should be on step 4 (reminders)
    expect(screen.getByText('Set Your First Reminder')).toBeInTheDocument()
    
    // Click back to step 3
    fireEvent.click(screen.getByRole('button', { name: /^back$/i }))
    
    await waitFor(() => {
      expect(screen.getByText('What makes you feel most loved?')).toBeInTheDocument()
    })
    
    // Click back to step 2
    fireEvent.click(screen.getByRole('button', { name: /^back$/i }))
    
    await waitFor(() => {
      expect(screen.getByText('Quick Relationship Quiz')).toBeInTheDocument()
    })
    
    // Click back to step 1
    fireEvent.click(screen.getByRole('button', { name: /^back$/i }))
    
    await waitFor(() => {
      expect(screen.getByText('Welcome to Quality Control')).toBeInTheDocument()
    })
  })
  
  it('preserves user progress when navigating back and forth', async () => {
    setupLocalStorageForOnboarding({
      currentStep: 3,
      preferences: { 
        communicationStyle: 'face-to-face',
        checkInFrequency: 'weekly',
        sessionStyle: 'standard'
      }
    })
    
    render(<OnboardingPage />)
    
    // Should be on step 3 with preserved selections
    expect(screen.getByText('What makes you feel most loved?')).toBeInTheDocument()
    
    // Go back to step 2 and verify quiz answers are preserved
    fireEvent.click(screen.getByRole('button', { name: /^back$/i }))
    
    await waitFor(() => {
      expect(screen.getByText('Quick Relationship Quiz')).toBeInTheDocument()
      // Face-to-face should still be selected
      expect(screen.getByText('Face-to-face').closest('button')).toHaveClass('border-pink-500')
    })
    
    // Navigate forward again
    fireEvent.click(screen.getByRole('button', { name: /continue/i }))
    
    await waitFor(() => {
      expect(screen.getByText('What makes you feel most loved?')).toBeInTheDocument()
    })
  })
  
  it('handles skip functionality at any step', async () => {
    setupLocalStorageForOnboarding({ currentStep: 3 })
    
    render(<OnboardingPage />)
    
    expect(screen.getByText('What makes you feel most loved?')).toBeInTheDocument()
    
    // Click skip button
    fireEvent.click(screen.getByRole('button', { name: /skip/i }))
    
    const localStorage = window.localStorage as jest.Mocked<Storage>
    expect(localStorage.setItem).toHaveBeenCalledWith('qc-onboarding-complete', 'true')
    expect(localStorage.setItem).toHaveBeenCalledWith('qc-onboarding-skipped', 'true')
    expect(mockPush).toHaveBeenCalledWith('/dashboard')
  })
  
  it('shows correct progress indicators throughout the flow', async () => {
    setupLocalStorageForOnboarding()
    
    render(<OnboardingPage />)
    
    // Step 1 - 17% complete
    expect(screen.getByText('17% complete')).toBeInTheDocument()
    
    // Advance to step 2
    fireEvent.click(screen.getByRole('button', { name: /let's get started/i }))
    
    await waitFor(() => {
      expect(screen.getByText('33% complete')).toBeInTheDocument()
    })
  })
  
  it('redirects to dashboard if already completed', () => {
    setupLocalStorageForOnboarding({ completed: true })
    
    render(<OnboardingPage />)
    
    expect(mockPush).toHaveBeenCalledWith('/dashboard')
  })
  
  it('shows check-in button on completion step', async () => {
    setupLocalStorageForOnboarding({ 
      currentStep: 6,
      preferences: mockOnboardingData.preferences
    })
    
    render(<OnboardingPage />)
    
    // Should be on completion step
    expect(screen.getByText(/you're all set/i)).toBeInTheDocument()
    
    // Should show check-in button
    expect(screen.getByRole('button', { name: /start first check-in/i })).toBeInTheDocument()
  })
})