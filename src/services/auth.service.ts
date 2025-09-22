import type {
  AuthUser,
  LoginCredentials,
  RegisterData,
  AuthTokens,
  AuthResponse,
  PasswordResetRequest,
  PasswordResetConfirm,
  PasswordChangeRequest
} from '@/types/auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

class AuthService {
  private accessToken: string | null = null
  private refreshToken: string | null = null
  private tokenExpiresAt: number | null = null

  constructor() {
    // Load tokens from storage on initialization
    if (typeof window !== 'undefined') {
      this.loadTokens()
    }
  }

  private loadTokens(): void {
    try {
      const storedTokens = localStorage.getItem('auth_tokens')
      if (storedTokens) {
        const tokens = JSON.parse(storedTokens)
        this.accessToken = tokens.accessToken
        this.refreshToken = tokens.refreshToken
        this.tokenExpiresAt = tokens.expiresAt
      }
    } catch (error) {
      console.error('Failed to load auth tokens:', error)
    }
  }

  private saveTokens(tokens: AuthTokens): void {
    this.accessToken = tokens.accessToken
    this.refreshToken = tokens.refreshToken
    this.tokenExpiresAt = Date.now() + tokens.expiresIn * 1000

    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_tokens', JSON.stringify({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: this.tokenExpiresAt
      }))
    }
  }

  private clearTokens(): void {
    this.accessToken = null
    this.refreshToken = null
    this.tokenExpiresAt = null

    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_tokens')
      localStorage.removeItem('auth_user')
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers
    }

    // Add auth token if available
    if (this.accessToken && !endpoint.includes('/auth/')) {
      headers['Authorization'] = `Bearer ${this.accessToken}`
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'An error occurred'
      }))
      throw new Error(error.message || `HTTP ${response.status}`)
    }

    return response.json()
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await this.makeRequest<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      })

      this.saveTokens(response.tokens)

      // Save user data
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_user', JSON.stringify(response.user))
      }

      return response
    } catch (error) {
      // For development, return mock data if API fails
      if (process.env.NODE_ENV === 'development') {
        return this.mockLogin(credentials)
      }
      throw error
    }
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await this.makeRequest<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data)
      })

      this.saveTokens(response.tokens)

      // Save user data
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_user', JSON.stringify(response.user))
      }

      return response
    } catch (error) {
      // For development, return mock data if API fails
      if (process.env.NODE_ENV === 'development') {
        return this.mockRegister(data)
      }
      throw error
    }
  }

  async logout(): Promise<void> {
    try {
      if (this.refreshToken) {
        await this.makeRequest('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken: this.refreshToken })
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      this.clearTokens()
    }
  }

  async refreshAccessToken(): Promise<AuthTokens> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available')
    }

    try {
      const response = await this.makeRequest<{ tokens: AuthTokens }>('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken: this.refreshToken })
      })

      this.saveTokens(response.tokens)
      return response.tokens
    } catch (error) {
      this.clearTokens()
      throw error
    }
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    // First check localStorage
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('auth_user')
      if (storedUser && this.accessToken) {
        try {
          // Verify token is still valid
          if (this.tokenExpiresAt && Date.now() < this.tokenExpiresAt) {
            return JSON.parse(storedUser)
          }

          // Try to refresh token
          await this.refreshAccessToken()
          return JSON.parse(storedUser)
        } catch {
          // Token refresh failed
          this.clearTokens()
          return null
        }
      }
    }

    if (!this.accessToken) {
      return null
    }

    try {
      const response = await this.makeRequest<{ user: AuthUser }>('/auth/me')

      // Update stored user
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_user', JSON.stringify(response.user))
      }

      return response.user
    } catch (error) {
      // For development, return mock user if API fails
      if (process.env.NODE_ENV === 'development') {
        return this.getMockUser()
      }
      return null
    }
  }

  async updateProfile(userId: string, data: Partial<AuthUser>): Promise<AuthUser> {
    const response = await this.makeRequest<{ user: AuthUser }>(`/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })

    // Update stored user
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_user', JSON.stringify(response.user))
    }

    return response.user
  }

  async changePassword(data: PasswordChangeRequest): Promise<void> {
    await this.makeRequest('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async requestPasswordReset(data: PasswordResetRequest): Promise<void> {
    await this.makeRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async confirmPasswordReset(data: PasswordResetConfirm): Promise<void> {
    await this.makeRequest('/auth/reset-password/confirm', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  isAuthenticated(): boolean {
    return !!this.accessToken && !!this.tokenExpiresAt && Date.now() < this.tokenExpiresAt
  }

  getAccessToken(): string | null {
    return this.accessToken
  }

  // Mock methods for development
  private mockLogin(credentials: LoginCredentials): AuthResponse {
    const mockUser: AuthUser = {
      id: 'user-1',
      email: credentials.email,
      firstName: 'Demo',
      lastName: 'User',
      displayName: 'Demo User',
      avatarUrl: '/avatars/demo.jpg',
      coupleId: 'couple-1',
      partnerId: 'user-2',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const mockTokens: AuthTokens = {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      expiresIn: 3600,
      tokenType: 'Bearer'
    }

    this.saveTokens(mockTokens)
    localStorage.setItem('auth_user', JSON.stringify(mockUser))

    return { user: mockUser, tokens: mockTokens }
  }

  private mockRegister(data: RegisterData): AuthResponse {
    const mockUser: AuthUser = {
      id: 'user-new',
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      displayName: `${data.firstName} ${data.lastName}`,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const mockTokens: AuthTokens = {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      expiresIn: 3600,
      tokenType: 'Bearer'
    }

    this.saveTokens(mockTokens)
    localStorage.setItem('auth_user', JSON.stringify(mockUser))

    return { user: mockUser, tokens: mockTokens }
  }

  private getMockUser(): AuthUser {
    return {
      id: 'user-1',
      email: 'demo@example.com',
      firstName: 'Demo',
      lastName: 'User',
      displayName: 'Demo User',
      avatarUrl: '/avatars/demo.jpg',
      coupleId: 'couple-1',
      partnerId: 'user-2',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }
}

export const authService = new AuthService()