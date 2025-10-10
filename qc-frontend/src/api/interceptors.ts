import type { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { store } from '@store/index'
import { logout, refreshTokens } from '@store/slices/authSlice'

// Types for interceptor management
export interface InterceptorManager {
  requestInterceptorId?: number
  responseInterceptorId?: number
}

// Token refresh queue management
class TokenRefreshManager {
  private isRefreshing = false
  private refreshSubscribers: Array<(token: string) => void> = []

  subscribeTokenRefresh(callback: (token: string) => void): void {
    this.refreshSubscribers.push(callback)
  }

  onTokenRefreshed(token: string): void {
    this.refreshSubscribers.forEach(callback => callback(token))
    this.refreshSubscribers = []
  }

  setRefreshing(status: boolean): void {
    this.isRefreshing = status
  }

  getRefreshing(): boolean {
    return this.isRefreshing
  }

  clearSubscribers(): void {
    this.refreshSubscribers = []
  }
}

export const tokenRefreshManager = new TokenRefreshManager()

// Request interceptor configuration
export const createRequestInterceptor = () => {
  return (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // Add auth token
    const state = store.getState()
    const token = state.auth.token

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Add request ID for tracking
    config.headers['X-Request-ID'] = generateRequestId()

    // Add timestamp
    config.headers['X-Request-Timestamp'] = new Date().toISOString()

    // Log in development
    if (import.meta.env.DEV) {
      console.log('📤 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        params: config.params,
        data: config.data,
        headers: config.headers,
      })
    }

    return config
  }
}

// Request error interceptor
export const createRequestErrorInterceptor = () => {
  return (error: AxiosError): Promise<AxiosError> => {
    if (import.meta.env.DEV) {
      console.error('❌ Request Error:', error.message)
    }
    return Promise.reject(error)
  }
}

// Response interceptor configuration
export const createResponseInterceptor = () => {
  return (response: AxiosResponse): AxiosResponse => {
    // Extract JWT token from Authorization header if present (from Devise JWT)
    const authHeader = response.headers['authorization']
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)

      // If this is a login/register response, add token to response data
      if (response.config.url?.includes('/sign_in') || response.config.url?.includes('/sign_up')) {
        if (response.data?.data) {
          response.data.data.token = token
        }
      }
    }

    // Log in development
    if (import.meta.env.DEV) {
      const requestDuration = calculateRequestDuration(response.config)
      console.log('📥 API Response:', {
        url: response.config.url,
        status: response.status,
        statusText: response.statusText,
        duration: `${requestDuration}ms`,
        data: response.data,
        headers: response.headers,
      })
    }

    // Transform response if needed
    return transformResponse(response)
  }
}

// Response error interceptor with token refresh
export const createResponseErrorInterceptor = (apiClient: AxiosInstance) => {
  return async (error: AxiosError): Promise<unknown> => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
      _retryCount?: number
    }

    // Handle network errors
    if (!error.response) {
      if (import.meta.env.DEV) {
        console.error('❌ Network Error:', error.message)
      }
      return Promise.reject(formatNetworkError(error))
    }

    // Handle 401 Unauthorized with token refresh
    if (error.response.status === 401 && originalRequest && !originalRequest._retry) {
      if (tokenRefreshManager.getRefreshing()) {
        // Queue request while refreshing
        return new Promise(resolve => {
          tokenRefreshManager.subscribeTokenRefresh((token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`
            }
            resolve(apiClient(originalRequest))
          })
        })
      }

      originalRequest._retry = true
      tokenRefreshManager.setRefreshing(true)

      try {
        const state = store.getState()
        const refreshToken = state.auth.refreshToken

        if (!refreshToken) {
          throw new Error('No refresh token available')
        }

        // Attempt token refresh
        const result = await store.dispatch(refreshTokens()).unwrap()

        if (result.token) {
          tokenRefreshManager.setRefreshing(false)
          tokenRefreshManager.onTokenRefreshed(result.token)

          // Retry original request
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${result.token}`
          }
          return apiClient(originalRequest)
        }
      } catch (refreshError) {
        tokenRefreshManager.setRefreshing(false)
        tokenRefreshManager.clearSubscribers()

        // Logout on refresh failure
        store.dispatch(logout())

        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }

        return Promise.reject(refreshError)
      }
    }

    // Handle rate limiting (429)
    if (error.response.status === 429 && shouldRetryRequest(originalRequest)) {
      const retryAfter = getRetryAfter(error.response)

      if (import.meta.env.DEV) {
        console.log(`⏳ Rate limited. Retrying after ${retryAfter}ms...`)
      }

      return new Promise(resolve => {
        setTimeout(() => {
          originalRequest._retryCount = (originalRequest._retryCount || 0) + 1
          resolve(apiClient(originalRequest))
        }, retryAfter)
      })
    }

    // Handle other error statuses
    const formattedError = formatApiError(error)

    if (import.meta.env.DEV) {
      console.error('❌ API Error:', {
        url: error.config?.url,
        status: error.response?.status,
        statusText: error.response?.statusText,
        message: formattedError.message,
        errors: formattedError.errors,
      })
    }

    return Promise.reject(formattedError)
  }
}

// Utility functions
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function calculateRequestDuration(config: InternalAxiosRequestConfig): number {
  const timestamp = config.headers?.['X-Request-Timestamp']
  if (timestamp) {
    return Date.now() - new Date(timestamp as string).getTime()
  }
  return 0
}

function transformResponse(response: AxiosResponse): AxiosResponse {
  // Handle pagination metadata if present
  if (response.data?.meta) {
    response.data = {
      ...response.data,
      _pagination: {
        page: response.data.meta.page || 1,
        perPage: response.data.meta.per_page || 20,
        total: response.data.meta.total || 0,
        totalPages: response.data.meta.total_pages || 1,
      },
    }
  }

  // Transform snake_case to camelCase if needed (optional)
  // response.data = transformKeys(response.data, toCamelCase)

  return response
}

interface FormattedError {
  message: string
  code: string
  status?: number
  errors?: Record<string, string[]>
  requestId?: string
  originalError?: AxiosError
}

function formatNetworkError(error: AxiosError): FormattedError {
  return {
    message: 'Network error. Please check your internet connection.',
    code: 'NETWORK_ERROR',
    originalError: error,
  }
}

function formatApiError(error: AxiosError): FormattedError {
  const status = error.response?.status
  const data = error.response?.data as { message?: string; code?: string; errors?: Record<string, string[]> }

  // Standard error format
  const formattedError: FormattedError = {
    message: data?.message || getDefaultErrorMessage(status),
    status,
    code: data?.code || getErrorCode(status),
    errors: data?.errors || {},
  }

  // Add request tracking info
  if (error.config?.headers?.['X-Request-ID']) {
    formattedError.requestId = error.config.headers['X-Request-ID']
  }

  return formattedError
}

function getDefaultErrorMessage(status?: number): string {
  const messages: Record<number, string> = {
    400: 'Bad request. Please check your input.',
    401: 'Authentication required. Please log in.',
    403: 'You do not have permission to perform this action.',
    404: 'The requested resource was not found.',
    409: 'A conflict occurred. Please refresh and try again.',
    422: 'Validation failed. Please check your input.',
    429: 'Too many requests. Please try again later.',
    500: 'An internal server error occurred.',
    502: 'Bad gateway. Please try again later.',
    503: 'Service temporarily unavailable.',
  }
  return messages[status || 500] || 'An unexpected error occurred.'
}

function getErrorCode(status?: number): string {
  const codes: Record<number, string> = {
    400: 'BAD_REQUEST',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    409: 'CONFLICT',
    422: 'VALIDATION_ERROR',
    429: 'RATE_LIMITED',
    500: 'INTERNAL_ERROR',
    502: 'BAD_GATEWAY',
    503: 'SERVICE_UNAVAILABLE',
  }
  return codes[status || 500] || 'UNKNOWN_ERROR'
}

function shouldRetryRequest(config: InternalAxiosRequestConfig & { _retryCount?: number }): boolean {
  const maxRetries = 3
  const retryCount = config._retryCount || 0

  // Don't retry if max retries exceeded
  if (retryCount >= maxRetries) {
    return false
  }

  // Only retry idempotent methods
  const idempotentMethods = ['GET', 'HEAD', 'OPTIONS', 'DELETE', 'PUT']
  return idempotentMethods.includes(config.method?.toUpperCase() || '')
}

function getRetryAfter(response: AxiosResponse): number {
  // Check Retry-After header
  const retryAfter = response.headers['retry-after']

  if (retryAfter) {
    // If it's a number, it's seconds
    const seconds = parseInt(retryAfter, 10)
    if (!isNaN(seconds)) {
      return seconds * 1000
    }

    // If it's a date, calculate milliseconds until then
    const retryDate = new Date(retryAfter)
    if (!isNaN(retryDate.getTime())) {
      return Math.max(0, retryDate.getTime() - Date.now())
    }
  }

  // Default exponential backoff
  const retryCount = (response.config as InternalAxiosRequestConfig & { _retryCount?: number })?._retryCount || 0
  return 1000 * Math.pow(2, retryCount)
}

// Interceptor cleanup utilities
export function ejectInterceptors(
  axios: AxiosInstance,
  manager: InterceptorManager
): void {
  if (manager.requestInterceptorId !== undefined) {
    axios.interceptors.request.eject(manager.requestInterceptorId)
  }
  if (manager.responseInterceptorId !== undefined) {
    axios.interceptors.response.eject(manager.responseInterceptorId)
  }
}

// Setup all interceptors
export function setupInterceptors(apiClient: AxiosInstance): InterceptorManager {
  const requestInterceptorId = apiClient.interceptors.request.use(
    createRequestInterceptor(),
    createRequestErrorInterceptor()
  )

  const responseInterceptorId = apiClient.interceptors.response.use(
    createResponseInterceptor(),
    createResponseErrorInterceptor(apiClient)
  )

  return {
    requestInterceptorId,
    responseInterceptorId,
  }
}