import apiClient from '../client'
import type { User } from '@/types'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
}

export interface AuthResponse {
  user: User
  token: string
  refreshToken: string
}

export interface RefreshTokenResponse {
  token: string
  refreshToken: string
}

class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials)
    return response.data
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data)
    return response.data
  }

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout')
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<{ user: User }>('/auth/me')
    return response.data.user
  }

  async refreshTokens(refreshToken: string): Promise<RefreshTokenResponse> {
    const response = await apiClient.post<RefreshTokenResponse>('/auth/refresh', {
      refreshToken,
    })
    return response.data
  }

  async updateProfile(userId: string, data: Partial<User>): Promise<User> {
    const response = await apiClient.patch<{ user: User }>(`/users/${userId}`, data)
    return response.data.user
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await apiClient.post('/auth/change-password', {
      oldPassword,
      newPassword,
    })
  }

  async requestPasswordReset(email: string): Promise<void> {
    await apiClient.post('/auth/reset-password', { email })
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiClient.post('/auth/reset-password/confirm', {
      token,
      newPassword,
    })
  }
}

export default new AuthService()