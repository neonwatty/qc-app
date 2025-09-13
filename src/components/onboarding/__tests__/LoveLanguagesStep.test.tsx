import { render, screen, fireEvent } from '@testing-library/react'
import { LoveLanguagesStep } from '../LoveLanguagesStep'
import { mockStepProps, clearLocalStorageMocks } from '@/test-utils/onboarding-helpers'

describe('LoveLanguagesStep', () => {
  beforeEach(() => {
    clearLocalStorageMocks()
    jest.clearAllMocks()
  })

  it('renders love languages selection screen', () => {
    render(<LoveLanguagesStep {...mockStepProps} />)
    
    expect(screen.getByText('What makes you feel most loved?')).toBeInTheDocument()
    expect(screen.getByText('Select up to 3 love languages (choose at least 1)')).toBeInTheDocument()
  })

  it('displays all 5 love languages', () => {
    render(<LoveLanguagesStep {...mockStepProps} />)
    
    expect(screen.getByText('Words of Affirmation')).toBeInTheDocument()
    expect(screen.getByText('Quality Time')).toBeInTheDocument()
    expect(screen.getByText('Acts of Service')).toBeInTheDocument()
    expect(screen.getByText('Physical Touch')).toBeInTheDocument()
    expect(screen.getByText('Receiving Gifts')).toBeInTheDocument()
  })

  it('allows selecting love languages', () => {
    render(<LoveLanguagesStep {...mockStepProps} />)
    
    fireEvent.click(screen.getByText('Words of Affirmation'))
    fireEvent.click(screen.getByText('Quality Time'))
    
    expect(screen.getByText('2/3 selected')).toBeInTheDocument()
  })

  it('prevents selecting more than 3 languages', () => {
    render(<LoveLanguagesStep {...mockStepProps} />)
    
    // Select 3 languages
    fireEvent.click(screen.getByText('Words of Affirmation'))
    fireEvent.click(screen.getByText('Quality Time'))
    fireEvent.click(screen.getByText('Acts of Service'))
    
    expect(screen.getByText('3/3 selected')).toBeInTheDocument()
    
    // Try to select a 4th - button should be disabled
    const giftButton = screen.getByText('Receiving Gifts').closest('button')
    expect(giftButton).toBeDisabled()
  })

  it('shows check icons for selected languages', () => {
    render(<LoveLanguagesStep {...mockStepProps} />)
    
    fireEvent.click(screen.getByText('Words of Affirmation'))
    
    expect(screen.getByTestId('check-icon')).toBeInTheDocument()
  })

  it('allows deselecting languages', () => {
    render(<LoveLanguagesStep {...mockStepProps} />)
    
    // Select and then deselect
    fireEvent.click(screen.getByText('Words of Affirmation'))
    expect(screen.getByText('1/3 selected')).toBeInTheDocument()
    
    fireEvent.click(screen.getByText('Words of Affirmation'))
    expect(screen.getByText('0/3 selected')).toBeInTheDocument()
  })

  it('enables continue button when at least 1 language is selected', () => {
    render(<LoveLanguagesStep {...mockStepProps} />)
    
    const continueButton = screen.getByRole('button', { name: /continue/i })
    expect(continueButton).toBeDisabled()
    
    fireEvent.click(screen.getByText('Words of Affirmation'))
    expect(continueButton).toBeEnabled()
  })

  it('shows partner reveal when 3 languages selected and continue clicked', () => {
    render(<LoveLanguagesStep {...mockStepProps} />)
    
    // Select 3 languages
    fireEvent.click(screen.getByText('Words of Affirmation'))
    fireEvent.click(screen.getByText('Quality Time'))
    fireEvent.click(screen.getByText('Acts of Service'))
    
    // Click continue - should show "See Deb's Languages"
    const continueButton = screen.getByRole('button', { name: /see deb's languages/i })
    fireEvent.click(continueButton)
    
    expect(screen.getByText('Deb\'s Love Languages')).toBeInTheDocument()
    expect(screen.getByText('Here\'s what makes your partner feel most loved')).toBeInTheDocument()
  })

  it('displays Deb\'s love languages correctly', () => {
    render(<LoveLanguagesStep {...mockStepProps} />)
    
    // Select 3 languages and proceed to partner view
    fireEvent.click(screen.getByText('Words of Affirmation'))
    fireEvent.click(screen.getByText('Quality Time'))
    fireEvent.click(screen.getByText('Acts of Service'))
    
    const continueButton = screen.getByRole('button', { name: /see deb's languages/i })
    fireEvent.click(continueButton)
    
    // Should show Deb's languages: Physical Touch, Acts of Service, Quality Time
    expect(screen.getByText('Physical Touch')).toBeInTheDocument()
    expect(screen.getByText('Acts of Service')).toBeInTheDocument()
    expect(screen.getByText('Quality Time')).toBeInTheDocument()
  })

  it('shows tip in partner view', () => {
    render(<LoveLanguagesStep {...mockStepProps} />)
    
    // Navigate to partner view
    fireEvent.click(screen.getByText('Words of Affirmation'))
    fireEvent.click(screen.getByText('Quality Time'))
    fireEvent.click(screen.getByText('Acts of Service'))
    
    const continueButton = screen.getByRole('button', { name: /see deb's languages/i })
    fireEvent.click(continueButton)
    
    expect(screen.getByText(/Try expressing love in Deb's languages this week/)).toBeInTheDocument()
  })

  it('calls onNext when continuing from partner view', () => {
    render(<LoveLanguagesStep {...mockStepProps} />)
    
    // Navigate to partner view
    fireEvent.click(screen.getByText('Words of Affirmation'))
    fireEvent.click(screen.getByText('Quality Time'))  
    fireEvent.click(screen.getByText('Acts of Service'))
    
    fireEvent.click(screen.getByRole('button', { name: /see deb's languages/i }))
    
    // Click final continue
    const finalContinueButton = screen.getByRole('button', { name: /continue/i })
    fireEvent.click(finalContinueButton)
    
    expect(mockStepProps.onNext).toHaveBeenCalledTimes(1)
  })

  it('calls onPrevious when back button is clicked', () => {
    render(<LoveLanguagesStep {...mockStepProps} />)
    
    // Use a more specific selector to avoid conflict with "Back rubs" text in Physical Touch examples
    const backButton = screen.getByRole('button', { name: /^back$/i })
    fireEvent.click(backButton)
    
    expect(mockStepProps.onPrevious).toHaveBeenCalledTimes(1)
  })
})