import axios, { type AxiosInstance, type AxiosError, type AxiosRequestConfig } from 'axios'
import { setupInterceptors, ejectInterceptors, type InterceptorManager } from './interceptors'

// Configuration interface
export interface ApiClientConfig {
  baseURL?: string
  timeout?: number
  withCredentials?: boolean
  headers?: Record<string, string>
}

// Default configuration
const defaultConfig: ApiClientConfig = {
  baseURL: '/api',
  timeout: 30000,
  withCredentials: true, // Important for CORS with cookies
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
}

// Create axios instance with configuration
class ApiClient {
  private instance: AxiosInstance
  private interceptorManager: InterceptorManager | null = null

  constructor(config: ApiClientConfig = {}) {
    this.instance = axios.create({
      ...defaultConfig,
      ...config,
      headers: {
        ...defaultConfig.headers,
        ...config.headers,
      },
    })

    // Setup interceptors
    this.interceptorManager = setupInterceptors(this.instance)
  }

  // Expose axios instance methods
  get client(): AxiosInstance {
    return this.instance
  }

  // HTTP methods with proper typing
  async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.get<T>(url, config)
    return response.data
  }

  async post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.post<T>(url, data, config)
    return response.data
  }

  async put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.put<T>(url, data, config)
    return response.data
  }

  async patch<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.patch<T>(url, data, config)
    return response.data
  }

  async delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.delete<T>(url, config)
    return response.data
  }

  // Upload method with progress tracking
  async upload<T = unknown>(
    url: string,
    formData: FormData,
    onProgress?: (progressEvent: ProgressEvent) => void
  ): Promise<T> {
    const response = await this.instance.post<T>(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress,
    })
    return response.data
  }

  // Download method with progress tracking
  async download(
    url: string,
    onProgress?: (progressEvent: ProgressEvent) => void
  ): Promise<Blob> {
    const response = await this.instance.get<Blob>(url, {
      responseType: 'blob',
      onDownloadProgress: onProgress,
    })
    return response.data
  }

  // Cancel request support
  createCancelToken() {
    return axios.CancelToken.source()
  }

  isCancel(error: unknown): boolean {
    return axios.isCancel(error)
  }

  // Clean up interceptors
  cleanup(): void {
    if (this.interceptorManager) {
      ejectInterceptors(this.instance, this.interceptorManager)
      this.interceptorManager = null
    }
  }

  // Update base URL dynamically
  setBaseURL(baseURL: string): void {
    this.instance.defaults.baseURL = baseURL
  }

  // Update default headers
  setDefaultHeader(key: string, value: string): void {
    this.instance.defaults.headers.common[key] = value
  }

  // Remove default header
  removeDefaultHeader(key: string): void {
    delete this.instance.defaults.headers.common[key]
  }

  // Get current configuration
  getConfig(): AxiosRequestConfig {
    return this.instance.defaults
  }
}

// Create default instance
const apiClient = new ApiClient()

// Helper function to handle API errors
export interface ApiError {
  message: string
  status?: number
  code?: string
  errors?: Record<string, string[]>
  requestId?: string
}

export const handleApiError = (error: unknown): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; code?: string; errors?: Record<string, string[]> }>

    // Check if error was formatted by interceptor
    if (axiosError.code && axiosError.message) {
      return axiosError as unknown as ApiError
    }

    // Fallback formatting
    return {
      message: axiosError.response?.data?.message || axiosError.message || 'An unexpected error occurred',
      status: axiosError.response?.status,
      code: axiosError.response?.data?.code || 'UNKNOWN_ERROR',
      errors: axiosError.response?.data?.errors,
    }
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'CLIENT_ERROR',
    }
  }

  return {
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
  }
}

// Export for backward compatibility
export default apiClient.client

// Export class for custom instances
export { ApiClient }

// Export the configured instance
export { apiClient }