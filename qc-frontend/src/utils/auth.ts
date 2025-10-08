// Helper function to check if user is authenticated
export const isAuthenticated = (): boolean => {
  // Check for auth token in localStorage
  const token = localStorage.getItem('auth_token')
  return !!token
}

// Helper function to get default redirect path after login
export const getDefaultPath = (): string => {
  // Check if user has completed onboarding
  const hasCompletedOnboarding = localStorage.getItem('onboarding_complete')
  return hasCompletedOnboarding ? '/dashboard' : '/onboarding'
}