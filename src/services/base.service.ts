export class BaseService {
  protected async makeRequest<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json'
    }

    // Add auth token if available
    const token = this.getAuthToken()
    if (token) {
      ;(defaultHeaders as any)['Authorization'] = `Bearer ${token}`
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Request failed:', error)
      throw error
    }
  }

  private getAuthToken(): string | null {
    // Check if we're in browser environment
    if (typeof window === 'undefined') {
      return null
    }

    try {
      return localStorage.getItem('auth_token')
    } catch {
      return null
    }
  }
}