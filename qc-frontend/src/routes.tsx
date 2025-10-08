import type { RouteObject } from 'react-router-dom'

// Layout components
import RootLayout from './layouts/RootLayout'
import ProtectedLayout from './layouts/ProtectedLayout'

// Direct imports - no lazy loading
// Named exports
import { HomePage } from './pages/HomePage'
import { DashboardPage } from './pages/DashboardPage'
import { CheckInPage } from './pages/CheckInPage'
import { OnboardingPage } from './pages/OnboardingPage'

// Default exports
import NotesPage from './pages/NotesPage'
import GrowthPage from './pages/GrowthPage'
import RemindersPage from './pages/RemindersPage'
import RequestsPage from './pages/RequestsPage'
import SettingsPage from './pages/SettingsPage'
import LoveLanguagesPage from './pages/LoveLanguagesPage'
import LoveLanguageActionsPage from './pages/LoveLanguageActionsPage'

// Test pages (default exports)
import TestButtonPage from './pages/test/TestButtonPage'
import TestMobileFormsPage from './pages/test/TestMobileFormsPage'
import TestMotionPage from './pages/test/TestMotionPage'
import TestPersistencePage from './pages/test/TestPersistencePage'
import TestSessionSettingsPage from './pages/test/TestSessionSettingsPage'
import TestSkeletonsPage from './pages/test/TestSkeletonsPage'
import TestTypesPage from './pages/test/TestTypesPage'

// Error pages (default exports)
import NotFoundPage from './pages/NotFoundPage'
import ErrorPage from './pages/ErrorPage'

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