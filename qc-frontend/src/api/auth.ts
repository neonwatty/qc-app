import authService from './services/auth.service'
import type { User } from '@/types'
import type { LoginRequest, RegisterRequest, AuthResponse, RefreshTokenResponse } from './services/auth.service'

// Token storage keys
const TOKEN_KEY = 'auth_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const USER_KEY = 'auth_user'
const TOKEN_EXPIRY_KEY = 'token_expiry'

// Secure token storage utilities
class TokenStorage {
  private isSecureContext(): boolean {
    return typeof window !== 'undefined' && window.isSecureContext
  }

  // Store tokens securely (using sessionStorage for better security than localStorage)
  setTokens(token: string, refreshToken: string, expiresIn?: number): void {
    if (typeof window === 'undefined') return

    // Use sessionStorage for tokens (cleared when browser closes)
    sessionStorage.setItem(TOKEN_KEY, token)
    sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)

    // Calculate and store expiry time
    if (expiresIn) {
      const expiryTime = Date.now() + expiresIn * 1000
      sessionStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString())
    }
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null
    return sessionStorage.getItem(TOKEN_KEY)
  }

  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    return sessionStorage.getItem(REFRESH_TOKEN_KEY)
  }

  isTokenExpired(): boolean {
    if (typeof window === 'undefined') return true

    const expiryTime = sessionStorage.getItem(TOKEN_EXPIRY_KEY)
    if (!expiryTime) return false

    return Date.now() > parseInt(expiryTime, 10)
  }

  clearTokens(): void {
    if (typeof window === 'undefined') return

    sessionStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(REFRESH_TOKEN_KEY)
    sessionStorage.removeItem(TOKEN_EXPIRY_KEY)
    sessionStorage.removeItem(USER_KEY)
  }

  // Store user data (can use localStorage as it's not sensitive)
  setUser(user: User): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  }

  getUser(): User | null {
    if (typeof window === 'undefined') return null

    const userStr = localStorage.getItem(USER_KEY)
    if (!userStr) return null

    try {
      return JSON.parse(userStr)
    } catch {
      return null
    }
  }

  clearUser(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(USER_KEY)
  }

  // Clear all auth data
  clearAll(): void {
    this.clearTokens()
    this.clearUser()
  }
}

// Export token storage instance
export const tokenStorage = new TokenStorage()

// Authentication manager class
class AuthManager {
  private refreshPromise: Promise<RefreshTokenResponse> | null = null
  private logoutCallbacks: Set<() => void> = new Set()

  // Register logout callback
  onLogout(callback: () => void): () => void {
    this.logoutCallbacks.add(callback)
    return () => this.logoutCallbacks.delete(callback)
  }

  // Trigger logout callbacks
  private triggerLogoutCallbacks(): void {
    this.logoutCallbacks.forEach(callback => callback())
  }

  // Login user
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await authService.login(credentials)

      // Store tokens and user data
      tokenStorage.setTokens(response.token, response.refreshToken)
      tokenStorage.setUser(response.user)

      return response
    } catch (error) {
      this.clearAuth()
      throw error
    }
  }

  // Register new user
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await authService.register(data)

      // Store tokens and user data
      tokenStorage.setTokens(response.token, response.refreshToken)
      tokenStorage.setUser(response.user)

      return response
    } catch (error) {
      this.clearAuth()
      throw error
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      // Call logout endpoint to invalidate tokens on server
      await authService.logout()
    } finally {
      // Always clear local auth data
      this.clearAuth()
      this.triggerLogoutCallbacks()
    }
  }

  // Clear authentication data
  clearAuth(): void {
    tokenStorage.clearAll()
  }

  // Get current user
  async getCurrentUser(forceRefresh = false): Promise<User | null> {
    // Check cached user first
    if (!forceRefresh) {
      const cachedUser = tokenStorage.getUser()
      if (cachedUser) return cachedUser
    }

    // Check if we have a token
    const token = tokenStorage.getToken()
    if (!token) return null

    try {
      // Fetch user from API
      const user = await authService.getCurrentUser()
      tokenStorage.setUser(user)
      return user
    } catch (error) {
      // If unauthorized, clear auth
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } }
        if (axiosError.response?.status === 401) {
          this.clearAuth()
        }
      }
      throw error
    }
  }

  // Refresh tokens
  async refreshTokens(): Promise<RefreshTokenResponse | null> {
    // Prevent multiple simultaneous refresh requests
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    const refreshToken = tokenStorage.getRefreshToken()
    if (!refreshToken) {
      this.clearAuth()
      return null
    }

    this.refreshPromise = authService.refreshTokens(refreshToken)
      .then(response => {
        // Store new tokens
        tokenStorage.setTokens(response.token, response.refreshToken)
        return response
      })
      .catch(error => {
        // Clear auth on refresh failure
        this.clearAuth()
        this.triggerLogoutCallbacks()
        throw error
      })
      .finally(() => {
        this.refreshPromise = null
      })

    return this.refreshPromise
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = tokenStorage.getToken()
    const user = tokenStorage.getUser()
    return !!(token && user && !tokenStorage.isTokenExpired())
  }

  // Update user profile
  async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    const user = await authService.updateProfile(userId, data)
    tokenStorage.setUser(user)
    return user
  }

  // Change password
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await authService.changePassword(oldPassword, newPassword)
  }

  // Request password reset
  async requestPasswordReset(email: string): Promise<void> {
    await authService.requestPasswordReset(email)
  }

  // Reset password with token
  async resetPassword(token: string, newPassword: string): Promise<void> {
    await authService.resetPassword(token, newPassword)
  }

  // Validate token
  async validateToken(): Promise<boolean> {
    const token = tokenStorage.getToken()
    if (!token) return false

    // Check expiry
    if (tokenStorage.isTokenExpired()) {
      // Try to refresh
      try {
        await this.refreshTokens()
        return true
      } catch {
        return false
      }
    }

    return true
  }

  // Get authorization header
  getAuthHeader(): { Authorization: string } | Record<string, never> {
    const token = tokenStorage.getToken()
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  // Initialize auth from stored tokens
  async initialize(): Promise<User | null> {
    const token = tokenStorage.getToken()
    if (!token) return null

    try {
      // Validate and refresh if needed
      const isValid = await this.validateToken()
      if (!isValid) return null

      // Get current user
      return await this.getCurrentUser()
    } catch {
      this.clearAuth()
      return null
    }
  }
}

// Export auth manager instance
export const authManager = new AuthManager()

// JWT utilities
export class JWTUtils {
  // Decode JWT payload (without verification)
  static decodeToken(token: string): unknown {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
      return JSON.parse(jsonPayload)
    } catch {
      return null
    }
  }

  // Get token expiry date
  static getTokenExpiry(token: string): Date | null {
    const payload = this.decodeToken(token)
    if (!payload || !payload.exp) return null
    return new Date(payload.exp * 1000)
  }

  // Check if token is expired
  static isTokenExpired(token: string): boolean {
    const expiry = this.getTokenExpiry(token)
    if (!expiry) return true
    return expiry < new Date()
  }

  // Get time until token expires (in seconds)
  static getTimeUntilExpiry(token: string): number {
    const expiry = this.getTokenExpiry(token)
    if (!expiry) return 0
    return Math.max(0, Math.floor((expiry.getTime() - Date.now()) / 1000))
  }
}

// Auto-refresh setup
let refreshTimer: NodeJS.Timeout | null = null

export function setupAutoRefresh(): void {
  // Clear existing timer
  if (refreshTimer) {
    clearInterval(refreshTimer)
  }

  // Check token every 30 seconds
  refreshTimer = setInterval(async () => {
    const token = tokenStorage.getToken()
    if (!token) return

    // Check if token expires in next 5 minutes
    const timeUntilExpiry = JWTUtils.getTimeUntilExpiry(token)
    if (timeUntilExpiry > 0 && timeUntilExpiry < 300) {
      try {
        await authManager.refreshTokens()
      } catch (error) {
        console.error('Failed to auto-refresh token:', error)
      }
    }
  }, 30000) // 30 seconds
}

export function stopAutoRefresh(): void {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

// Initialize auto-refresh on module load
if (typeof window !== 'undefined') {
  setupAutoRefresh()

  // Clean up on page unload
  window.addEventListener('beforeunload', stopAutoRefresh)
}

// Export types
export type { LoginRequest, RegisterRequest, AuthResponse, RefreshTokenResponse }