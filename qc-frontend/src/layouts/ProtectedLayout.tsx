import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../hooks/redux'
import { fetchCurrentUser } from '../store/slices/authSlice'

const ProtectedLayout = () => {
  const location = useLocation()
  const dispatch = useAppDispatch()
  const { isAuthenticated, isLoading, user } = useAppSelector(state => state.auth)
  const token = localStorage.getItem('auth_token')

  useEffect(() => {
    // If we have a token but no user, fetch the current user
    if (token && !user && !isLoading) {
      dispatch(fetchCurrentUser())
    }
  }, [token, user, isLoading, dispatch])

  // Show loading while checking auth status
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Redirect to home if not authenticated
  if (!token || !isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      <Outlet />
    </main>
  )
}

export default ProtectedLayout