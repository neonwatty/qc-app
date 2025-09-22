import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { store } from '@store/index'
import { logout, refreshTokens } from '@store/slices/authSlice'

// Create axios instance with base configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true, // Important for CORS with cookies
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const state = store.getState()
    const token = state.auth.token

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Log request in development
    if (import.meta.env.DEV) {
      console.log('API Request:', {
        method: config.method,
        url: config.url,
        params: config.params,
        data: config.data,
      })
    }

    return config
  },
  (error: AxiosError) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor for error handling and token refresh
let isRefreshing = false
let refreshSubscribers: Array<(token: string) => void> = []

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb)
}

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach(cb => cb(token))
  refreshSubscribers = []
}

apiClient.interceptors.response.use(
  response => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log('API Response:', {
        url: response.config.url,
        status: response.status,
        data: response.data,
      })
    }
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise(resolve => {
          subscribeTokenRefresh((token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`
            }
            resolve(apiClient(originalRequest))
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Attempt to refresh tokens
        const state = store.getState()
        const refreshToken = state.auth.refreshToken

        if (!refreshToken) {
          throw new Error('No refresh token available')
        }

        // Dispatch refresh action
        const result = await store.dispatch(refreshTokens()).unwrap()

        if (result.token) {
          isRefreshing = false
          onTokenRefreshed(result.token)

          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${result.token}`
          }
          return apiClient(originalRequest)
        }
      } catch (refreshError) {
        isRefreshing = false
        refreshSubscribers = []

        // Refresh failed, logout user
        store.dispatch(logout())

        // Redirect to login page
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }

        return Promise.reject(refreshError)
      }
    }

    // Handle other error statuses
    if (error.response?.status === 403) {
      console.error('Forbidden: You do not have permission to access this resource')
    } else if (error.response?.status === 404) {
      console.error('Not Found: The requested resource does not exist')
    } else if (error.response?.status === 500) {
      console.error('Server Error: Something went wrong on the server')
    }

    // Log error in development
    if (import.meta.env.DEV) {
      console.error('API Error:', {
        url: error.config?.url,
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
      })
    }

    return Promise.reject(error)
  }
)

// Helper function to handle API errors
export interface ApiError {
  message: string
  status?: number
  errors?: Record<string, string[]>
}

export const handleApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; errors?: Record<string, string[]> }>

    return {
      message: axiosError.response?.data?.message || axiosError.message || 'An unexpected error occurred',
      status: axiosError.response?.status,
      errors: axiosError.response?.data?.errors,
    }
  }

  if (error instanceof Error) {
    return {
      message: error.message,
    }
  }

  return {
    message: 'An unexpected error occurred',
  }
}

// Export configured client
export default apiClient