import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom'
import { Suspense } from 'react'
import { Navigation } from '@components/Navigation'

const RootLayout = () => {
  const location = useLocation()
  const hideNavPaths = ['/', '/login', '/register', '/onboarding']
  const showNav = !hideNavPaths.includes(location.pathname)

  return (
    <div className="min-h-screen bg-background">
      <ScrollRestoration />
      {showNav && <Navigation />}
      <Suspense fallback={<LoadingScreen />}>
        <Outlet />
      </Suspense>
    </div>
  )
}

const LoadingScreen = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  )
}

export default RootLayout