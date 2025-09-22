import apiClient from '../client'
import type { SessionSettings, SessionSettingsProposal, SessionSettingsTemplate } from '@/types'
import type {
  ApiResponse,
  CreateSessionSettingsRequest,
  UpdateSessionSettingsRequest
} from '../types'

class SessionSettingsService {
  // Get current session settings for a couple
  async getSessionSettings(coupleId: string): Promise<SessionSettings | null> {
    try {
      const response = await apiClient.get<ApiResponse<SessionSettings>>(`/couples/${coupleId}/session-settings`)
      return response.data.data
    } catch {
      // Return null if no settings exist yet
      return null
    }
  }

  // Create new session settings (requires agreement from both partners)
  async createSessionSettings(coupleId: string, data: CreateSessionSettingsRequest): Promise<SessionSettings> {
    const response = await apiClient.post<ApiResponse<SessionSettings>>(`/couples/${coupleId}/session-settings`, data)
    return response.data.data
  }

  // Update existing session settings (creates a proposal)
  async updateSessionSettings(
    coupleId: string,
    settingsId: string,
    data: UpdateSessionSettingsRequest
  ): Promise<SessionSettingsProposal> {
    const response = await apiClient.patch<ApiResponse<SessionSettingsProposal>>(
      `/couples/${coupleId}/session-settings/${settingsId}`,
      data
    )
    return response.data.data
  }

  // Get pending proposal for session settings changes
  async getPendingProposal(coupleId: string): Promise<SessionSettingsProposal | null> {
    try {
      const response = await apiClient.get<ApiResponse<SessionSettingsProposal>>(
        `/couples/${coupleId}/session-settings/proposal`
      )
      return response.data.data
    } catch {
      return null
    }
  }

  // Accept a session settings proposal
  async acceptProposal(coupleId: string, proposalId: string): Promise<SessionSettings> {
    const response = await apiClient.post<ApiResponse<SessionSettings>>(
      `/couples/${coupleId}/session-settings/proposal/${proposalId}/accept`
    )
    return response.data.data
  }

  // Reject a session settings proposal
  async rejectProposal(coupleId: string, proposalId: string, reason?: string): Promise<void> {
    await apiClient.post(`/couples/${coupleId}/session-settings/proposal/${proposalId}/reject`, {
      reason,
    })
  }

  // Get available session settings templates
  async getTemplates(): Promise<SessionSettingsTemplate[]> {
    const response = await apiClient.get<ApiResponse<SessionSettingsTemplate[]>>('/session-settings/templates')
    return response.data.data
  }

  // Apply a template to create new settings
  async applyTemplate(
    coupleId: string,
    templateType: 'quick' | 'standard' | 'deep-dive'
  ): Promise<SessionSettings> {
    const response = await apiClient.post<ApiResponse<SessionSettings>>(
      `/couples/${coupleId}/session-settings/apply-template`,
      { templateType }
    )
    return response.data.data
  }

  // Get session settings history
  async getSettingsHistory(coupleId: string): Promise<SessionSettings[]> {
    const response = await apiClient.get<ApiResponse<SessionSettings[]>>(
      `/couples/${coupleId}/session-settings/history`
    )
    return response.data.data
  }

  // Validate session settings before creation
  async validateSettings(data: CreateSessionSettingsRequest): Promise<{ valid: boolean; errors?: string[] }> {
    const response = await apiClient.post<ApiResponse<{ valid: boolean; errors?: string[] }>>(
      '/session-settings/validate',
      data
    )
    return response.data.data
  }

  // Get recommended settings based on couple's history
  async getRecommendedSettings(coupleId: string): Promise<CreateSessionSettingsRequest> {
    const response = await apiClient.get<ApiResponse<CreateSessionSettingsRequest>>(
      `/couples/${coupleId}/session-settings/recommendations`
    )
    return response.data.data
  }

  // Reset to default settings
  async resetToDefaults(coupleId: string): Promise<SessionSettings> {
    const response = await apiClient.post<ApiResponse<SessionSettings>>(
      `/couples/${coupleId}/session-settings/reset`
    )
    return response.data.data
  }

  // Temporary override for a specific session
  async createTemporaryOverride(
    coupleId: string,
    checkInId: string,
    overrides: Partial<SessionSettings>
  ): Promise<SessionSettings> {
    const response = await apiClient.post<ApiResponse<SessionSettings>>(
      `/couples/${coupleId}/session-settings/override`,
      {
        checkInId,
        overrides,
      }
    )
    return response.data.data
  }

  // Get statistics about session settings usage
  async getSettingsStatistics(coupleId: string): Promise<{
    averageSessionDuration: number
    timeoutUsageRate: number
    extensionUsageRate: number
    mostProductiveSettings: SessionSettings
    completionRateByTemplate: Record<string, number>
  }> {
    const response = await apiClient.get<
      ApiResponse<{
        averageSessionDuration: number
        timeoutUsageRate: number
        extensionUsageRate: number
        mostProductiveSettings: SessionSettings
        completionRateByTemplate: Record<string, number>
      }>
    >(`/couples/${coupleId}/session-settings/statistics`)
    return response.data.data
  }

  // Export settings configuration
  async exportSettings(coupleId: string): Promise<Blob> {
    const response = await apiClient.get(`/couples/${coupleId}/session-settings/export`, {
      responseType: 'blob',
    })
    return response.data
  }

  // Import settings configuration
  async importSettings(coupleId: string, file: File): Promise<SessionSettings> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await apiClient.post<ApiResponse<SessionSettings>>(
      `/couples/${coupleId}/session-settings/import`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data.data
  }
}

export default new SessionSettingsService()