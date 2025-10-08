import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QuizStep } from '../QuizStep'
import { mockStepProps, clearLocalStorageMocks } from '@/test-utils/onboarding-helpers'

describe('QuizStep', () => {
  beforeEach(() => {
    clearLocalStorageMocks()
    jest.clearAllMocks()
  })

  it('renders quiz title and description', () => {
    render(<QuizStep {...mockStepProps} />)
    
    expect(screen.getByText('Quick Relationship Quiz')).toBeInTheDocument()
    expect(screen.getByText('Help us understand your relationship style')).toBeInTheDocument()
  })

  it('displays first question by default', () => {
    render(<QuizStep {...mockStepProps} />)
    
    expect(screen.getByText(/How do you prefer to discuss important topics/)).toBeInTheDocument()
    expect(screen.getByText('Face-to-face')).toBeInTheDocument()
    expect(screen.getByText('Written notes')).toBeInTheDocument()
    expect(screen.getByText('During activities')).toBeInTheDocument()
    expect(screen.getByText('Mix of all')).toBeInTheDocument()
  })

  it('advances to next question when answer is selected', async () => {
    render(<QuizStep {...mockStepProps} />)
    
    // Answer first question
    fireEvent.click(screen.getByText('Face-to-face'))
    
    // Wait for question transition
    await waitFor(() => {
      expect(screen.getByText(/How often would you like to check in with Deb/)).toBeInTheDocument()
    }, { timeout: 1000 })
  })

  it('updates preferences when answer is selected', () => {
    render(<QuizStep {...mockStepProps} />)
    
    fireEvent.click(screen.getByText('Face-to-face'))
    
    expect(mockStepProps.updatePreferences).toHaveBeenCalledWith({
      communicationStyle: 'face-to-face',
      checkInFrequency: '',
      sessionStyle: ''
    })
  })

  it('enables continue button when all questions are answered', async () => {
    render(<QuizStep {...mockStepProps} />)
    
    // Answer all three questions
    fireEvent.click(screen.getByText('Face-to-face'))
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Weekly'))
    })
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Standard (20 min)'))
    })
    
    await waitFor(() => {
      const continueButton = screen.getByRole('button', { name: /continue/i })
      expect(continueButton).toBeEnabled()
    })
  })

  it('calls onNext when continue button is clicked and all questions answered', async () => {
    render(<QuizStep {...mockStepProps} />)
    
    // Answer all questions quickly
    fireEvent.click(screen.getByText('Face-to-face'))
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Weekly'))
    })
    
    await waitFor(() => {
      fireEvent.click(screen.getByText('Standard (20 min)'))
    })
    
    await waitFor(() => {
      const continueButton = screen.getByRole('button', { name: /continue/i })
      fireEvent.click(continueButton)
      expect(mockStepProps.onNext).toHaveBeenCalledTimes(1)
    })
  })

  it('calls onPrevious when back button is clicked', () => {
    render(<QuizStep {...mockStepProps} />)
    
    const backButton = screen.getByRole('button', { name: /back/i })
    fireEvent.click(backButton)
    
    expect(mockStepProps.onPrevious).toHaveBeenCalledTimes(1)
  })

  it('shows progress indicators for questions', () => {
    render(<QuizStep {...mockStepProps} />)
    
    const progressIndicators = screen.getAllByRole('generic')
    const indicators = progressIndicators.filter(el => 
      el.className.includes('h-2 w-16 rounded-full')
    )
    
    expect(indicators).toHaveLength(3) // 3 questions
  })

  it('allows navigation to previous question', async () => {
    render(<QuizStep {...mockStepProps} />)
    
    // Answer first question to go to second
    fireEvent.click(screen.getByText('Face-to-face'))
    
    await waitFor(() => {
      expect(screen.getByText(/How often would you like to check in with Deb/)).toBeInTheDocument()
    })
    
    // Click previous question button if available
    const prevQuestionButton = screen.queryByText('Previous Question')
    if (prevQuestionButton) {
      fireEvent.click(prevQuestionButton)
      await waitFor(() => {
        expect(screen.getByText(/How do you prefer to discuss important topics/)).toBeInTheDocument()
      })
    }
  })
})