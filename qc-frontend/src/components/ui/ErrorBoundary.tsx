
import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertCircle, RefreshCw, Home, Bug } from 'lucide-react'
import { Button } from './button'
import Link from 'next/link'

interface Props {
  children?: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  level?: 'page' | 'component' | 'critical'
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  }

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo })
    
    // Log error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  public render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default fallback UI based on error level
      return this.renderDefaultFallback()
    }

    return this.props.children
  }

  private renderDefaultFallback() {
    const { level = 'component' } = this.props
    const { error, errorInfo } = this.state

    // Component-level error (minimal fallback)
    if (level === 'component') {
      return (
        <div className="flex items-center justify-center p-6 min-h-[120px]">
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <div className="bg-red-100 rounded-full p-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-3">Something went wrong</p>
            <Button 
              size="sm" 
              onClick={this.handleReset}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-3 w-3" />
              Try again
            </Button>
          </div>
        </div>
      )
    }

    // Page-level error (comprehensive fallback)
    if (level === 'page') {
      return (
        <div className="flex items-center justify-center min-h-[400px] p-6">
          <div className="text-center max-w-md">
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 rounded-full p-3">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Something went wrong
            </h2>
            
            <p className="text-gray-600 mb-6">
              We encountered an unexpected error. This has been logged and we&apos;ll look into it.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={this.handleReset} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Try again
              </Button>
              
              <Link href="/dashboard">
                <Button variant="outline" className="flex items-center gap-2 w-full">
                  <Home className="h-4 w-4" />
                  Go to Dashboard
                </Button>
              </Link>
            </div>
            
            {process.env.NODE_ENV === 'development' && error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                  <Bug className="inline h-4 w-4 mr-1" />
                  Debug Info (Dev Only)
                </summary>
                <div className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                  <div className="font-medium text-red-700">Error:</div>
                  <pre className="whitespace-pre-wrap">{error.toString()}</pre>
                  {errorInfo && (
                    <>
                      <div className="font-medium text-red-700 mt-2">Component Stack:</div>
                      <pre className="whitespace-pre-wrap">{errorInfo.componentStack}</pre>
                    </>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      )
    }

    // Critical error (full screen takeover)
    if (level === 'critical') {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-red-50">
          <div className="text-center max-w-lg">
            <div className="flex justify-center mb-6">
              <div className="bg-red-200 rounded-full p-4">
                <AlertCircle className="h-12 w-12 text-red-700" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-red-900 mb-4">
              Critical Error
            </h1>
            
            <p className="text-red-700 text-lg mb-8">
              The application encountered a critical error and cannot continue. 
              Please refresh the page or contact support if the problem persists.
            </p>
            
            <div className="space-y-4">
              <Button 
                onClick={() => window.location.reload()} 
                size="lg"
                className="bg-red-600 hover:bg-red-700 w-full"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                Reload Application
              </Button>
              
              <Link href="/">
                <Button variant="outline" size="lg" className="w-full">
                  <Home className="h-5 w-5 mr-2" />
                  Return to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )
    }

    return null
  }
}

// Convenience wrapper components
export function PageErrorBoundary({ children, onError }: { 
  children: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void 
}) {
  return (
    <ErrorBoundary level="page" onError={onError}>
      {children}
    </ErrorBoundary>
  )
}

export function ComponentErrorBoundary({ children, onError }: { 
  children: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void 
}) {
  return (
    <ErrorBoundary level="component" onError={onError}>
      {children}
    </ErrorBoundary>
  )
}

export function CriticalErrorBoundary({ children, onError }: { 
  children: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void 
}) {
  return (
    <ErrorBoundary level="critical" onError={onError}>
      {children}
    </ErrorBoundary>
  )
}