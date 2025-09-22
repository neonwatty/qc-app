import { apiClient } from '../client'
import type { ApiResponse } from '../types'

export interface UserPreferences {
  id: string
  userId: string
  theme: 'light' | 'dark'
  notificationsEnabled: boolean
  emailNotifications: boolean
  pushNotifications: boolean
  reminderTime?: string
  language: string
  timezone: string
  createdAt: string
  updatedAt: string
}

export interface UpdatePreferencesRequest {
  theme?: 'light' | 'dark'
  notificationsEnabled?: boolean
  emailNotifications?: boolean
  pushNotifications?: boolean
  reminderTime?: string
  language?: string
  timezone?: string
}

class PreferencesService {
  private readonly basePath = '/api/preferences'

  async getPreferences(): Promise<UserPreferences> {
    return apiClient.get<UserPreferences>(this.basePath)
  }

  async updatePreferences(data: UpdatePreferencesRequest): Promise<UserPreferences> {
    return apiClient.patch<UserPreferences>(this.basePath, data)
  }

  async updateTheme(theme: 'light' | 'dark'): Promise<UserPreferences> {
    return apiClient.patch<UserPreferences>(`${this.basePath}/theme`, { theme })
  }

  async resetPreferences(): Promise<UserPreferences> {
    return apiClient.post<UserPreferences>(`${this.basePath}/reset`)
  }
}

export const preferencesService = new PreferencesService()