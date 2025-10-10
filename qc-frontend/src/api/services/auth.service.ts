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
    // Wrap credentials in 'user' object as expected by Devise
    const response = await apiClient.post<{ data: { user: User; token: string; refresh_token: string } }>('/auth/sign_in', {
      user: credentials
    })

    // Map Rails response to frontend AuthResponse format
    return {
      user: response.data.data.user,
      token: response.data.data.token,
      refreshToken: response.data.data.refresh_token, // Map refresh_token to refreshToken
    }
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    // Wrap data in 'user' object as expected by Devise
    const response = await apiClient.post<{ data: { user: User; token: string; refresh_token: string } }>('/auth/sign_up', {
      user: data
    })

    // Map Rails response to frontend AuthResponse format
    return {
      user: response.data.data.user,
      token: response.data.data.token,
      refreshToken: response.data.data.refresh_token, // Map refresh_token to refreshToken
    }
  }

  async logout(): Promise<void> {
    await apiClient.delete('/auth/sign_out')
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