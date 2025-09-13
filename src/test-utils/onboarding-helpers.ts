import { OnboardingData } from '@/app/onboarding/page'

export const mockOnboardingData: OnboardingData = {
  completed: false,
  preferences: {
    communicationStyle: 'face-to-face',
    checkInFrequency: 'weekly',
    sessionStyle: 'standard',
    loveLanguages: ['words', 'time', 'acts'],
    reminderTime: '20:00',
    reminderDay: 'sunday'
  },
  currentStep: 1
}

export const mockPartialOnboardingData: OnboardingData = {
  completed: false,
  preferences: {
    communicationStyle: 'face-to-face',
    checkInFrequency: 'weekly',
  },
  currentStep: 3
}

export const mockCompletedOnboardingData: OnboardingData = {
  completed: true,
  completedAt: new Date('2024-01-15T10:00:00Z'),
  preferences: {
    communicationStyle: 'face-to-face',
    checkInFrequency: 'weekly',
    sessionStyle: 'standard',
    loveLanguages: ['words', 'time', 'acts'],
    reminderTime: '20:00',
    reminderDay: 'sunday'
  },
  currentStep: 6
}

export const setupLocalStorageForOnboarding = (data?: Partial<OnboardingData>) => {
  const localStorage = window.localStorage as jest.Mocked<Storage>
  
  localStorage.getItem.mockImplementation((key: string) => {
    if (key === 'qc-onboarding-complete') {
      return data?.completed ? 'true' : null
    }
    if (key === 'qc-onboarding-data') {
      return data ? JSON.stringify({ ...mockOnboardingData, ...data }) : null
    }
    if (key === 'qc-onboarding-skipped') {
      return null
    }
    return null
  })
}

export const clearLocalStorageMocks = () => {
  const localStorage = window.localStorage as jest.Mocked<Storage>
  localStorage.getItem.mockClear()
  localStorage.setItem.mockClear()
  localStorage.removeItem.mockClear()
}

// Mock step prop helpers
export const mockStepProps = {
  onNext: jest.fn(),
  onPrevious: jest.fn(),
  preferences: {}, // Start with empty preferences for testing
  updatePreferences: jest.fn(),
}

export const mockStepPropsWithData = {
  onNext: jest.fn(),
  onPrevious: jest.fn(),
  preferences: mockOnboardingData.preferences,
  updatePreferences: jest.fn(),
}

export const mockCompleteStepProps = {
  onComplete: jest.fn(),
  onPrevious: jest.fn(),
  preferences: mockOnboardingData.preferences,
}