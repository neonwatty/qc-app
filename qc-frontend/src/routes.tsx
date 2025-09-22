import type { RouteObject } from 'react-router-dom'

// Lazy load page components for better performance
import { lazy } from 'react'

// Layout components
import RootLayout from './layouts/RootLayout'
import ProtectedLayout from './layouts/ProtectedLayout'

// Lazy load pages
const HomePage = lazy(() => import('./pages/HomePage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const CheckInPage = lazy(() => import('./pages/CheckInPage'))
const NotesPage = lazy(() => import('./pages/NotesPage'))
const GrowthPage = lazy(() => import('./pages/GrowthPage'))
const RemindersPage = lazy(() => import('./pages/RemindersPage'))
const RequestsPage = lazy(() => import('./pages/RequestsPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const LoveLanguagesPage = lazy(() => import('./pages/LoveLanguagesPage'))
const LoveLanguageActionsPage = lazy(() => import('./pages/LoveLanguageActionsPage'))
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'))

// Test pages (development only)
const TestButtonPage = lazy(() => import('./pages/test/TestButtonPage'))
const TestMobileFormsPage = lazy(() => import('./pages/test/TestMobileFormsPage'))
const TestMotionPage = lazy(() => import('./pages/test/TestMotionPage'))
const TestPersistencePage = lazy(() => import('./pages/test/TestPersistencePage'))
const TestSessionSettingsPage = lazy(() => import('./pages/test/TestSessionSettingsPage'))
const TestSkeletonsPage = lazy(() => import('./pages/test/TestSkeletonsPage'))
const TestTypesPage = lazy(() => import('./pages/test/TestTypesPage'))

// Error pages
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))
const ErrorPage = lazy(() => import('./pages/ErrorPage'))

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: 'onboarding',
        element: <OnboardingPage />
      },
      {
        // Protected routes
        element: <ProtectedLayout />,
        children: [
          {
            path: 'dashboard',
            element: <DashboardPage />
          },
          {
            path: 'checkin',
            element: <CheckInPage />
          },
          {
            path: 'notes',
            element: <NotesPage />
          },
          {
            path: 'growth',
            element: <GrowthPage />
          },
          {
            path: 'reminders',
            element: <RemindersPage />
          },
          {
            path: 'requests',
            element: <RequestsPage />
          },
          {
            path: 'settings',
            element: <SettingsPage />
          },
          {
            path: 'love-languages',
            children: [
              {
                index: true,
                element: <LoveLanguagesPage />
              },
              {
                path: 'actions',
                element: <LoveLanguageActionsPage />
              }
            ]
          }
        ]
      },
      // Test routes (only in development)
      ...(process.env.NODE_ENV === 'development' ? [
        {
          path: 'test-button',
          element: <TestButtonPage />
        },
        {
          path: 'test-mobile-forms',
          element: <TestMobileFormsPage />
        },
        {
          path: 'test-motion',
          element: <TestMotionPage />
        },
        {
          path: 'test-persistence',
          element: <TestPersistencePage />
        },
        {
          path: 'test-session-settings',
          element: <TestSessionSettingsPage />
        },
        {
          path: 'test-skeletons',
          element: <TestSkeletonsPage />
        },
        {
          path: 'test-types',
          element: <TestTypesPage />
        }
      ] : []),
      {
        path: '*',
        element: <NotFoundPage />
      }
    ]
  }
]

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