import { SessionSettings, SessionSettingsProposal } from '@/types'
import { authService } from './auth.service'

export interface ProposeSettingsRequest {
  settings: Partial<SessionSettings>
}

export interface ReviewProposalRequest {
  status: 'accepted' | 'rejected'
}

class SessionSettingsService {
  private readonly basePath = '/api/session-settings'

  private async makeRequest<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = authService.getAccessToken()

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers
      }
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }

    return response.json()
  }

  async getCurrentSettings(): Promise<SessionSettings | null> {
    try {
      return await this.makeRequest<SessionSettings>(`${this.basePath}/current`)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return this.mockGetCurrentSettings()
      }
      throw error
    }
  }

  async getPendingProposal(): Promise<SessionSettingsProposal | null> {
    try {
      return await this.makeRequest<SessionSettingsProposal>(`${this.basePath}/pending-proposal`)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return this.mockGetPendingProposal()
      }
      throw error
    }
  }

  async proposeSettings(request: ProposeSettingsRequest): Promise<SessionSettingsProposal> {
    try {
      return await this.makeRequest<SessionSettingsProposal>(`${this.basePath}/propose`, {
        method: 'POST',
        body: JSON.stringify(request)
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return this.mockProposeSettings(request)
      }
      throw error
    }
  }

  async reviewProposal(proposalId: string, request: ReviewProposalRequest): Promise<SessionSettings | null> {
    try {
      return await this.makeRequest<SessionSettings>(`${this.basePath}/proposals/${proposalId}/review`, {
        method: 'POST',
        body: JSON.stringify(request)
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return this.mockReviewProposal(proposalId, request)
      }
      throw error
    }
  }

  async updateSettings(settings: Partial<SessionSettings>): Promise<SessionSettings> {
    try {
      return await this.makeRequest<SessionSettings>(`${this.basePath}/update`, {
        method: 'PATCH',
        body: JSON.stringify(settings)
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return this.mockUpdateSettings(settings)
      }
      throw error
    }
  }

  // Mock implementations for development
  private mockGetCurrentSettings(): SessionSettings | null {
    const stored = localStorage.getItem('qc_session_settings')
    if (stored) {
      const data = JSON.parse(stored)
      return data.currentSettings || null
    }
    return null
  }

  private mockGetPendingProposal(): SessionSettingsProposal | null {
    const stored = localStorage.getItem('qc_session_settings')
    if (stored) {
      const data = JSON.parse(stored)
      return data.pendingProposal || null
    }
    return null
  }

  private mockProposeSettings(request: ProposeSettingsRequest): SessionSettingsProposal {
    const proposal: SessionSettingsProposal = {
      id: `prop_${Date.now()}`,
      proposedBy: 'user-1',
      proposedAt: new Date(),
      settings: request.settings,
      status: 'pending'
    }

    const stored = localStorage.getItem('qc_session_settings')
    const data = stored ? JSON.parse(stored) : { currentSettings: null, pendingProposal: null }
    data.pendingProposal = proposal
    localStorage.setItem('qc_session_settings', JSON.stringify(data))

    return proposal
  }

  private mockReviewProposal(proposalId: string, request: ReviewProposalRequest): SessionSettings | null {
    const stored = localStorage.getItem('qc_session_settings')
    if (!stored) return null

    const data = JSON.parse(stored)

    if (data.pendingProposal?.id === proposalId) {
      data.pendingProposal.status = request.status
      data.pendingProposal.reviewedBy = 'user-2'
      data.pendingProposal.reviewedAt = new Date()

      if (request.status === 'accepted') {
        const newSettings: SessionSettings = {
          id: `settings_${Date.now()}`,
          coupleId: 'couple-1',
          sessionDuration: 10,
          timeoutsPerPartner: 1,
          timeoutDuration: 2,
          turnBasedMode: false,
          allowExtensions: true,
          pauseNotifications: true,
          autoSaveDrafts: true,
          warmUpQuestions: false,
          coolDownTime: 2,
          ...data.pendingProposal.settings,
          agreedAt: new Date(),
          agreedBy: ['user-1', 'user-2'],
          version: (data.currentSettings?.version || 0) + 1
        }

        data.currentSettings = newSettings
        data.pendingProposal = null
        localStorage.setItem('qc_session_settings', JSON.stringify(data))
        return newSettings
      } else {
        data.pendingProposal = null
        localStorage.setItem('qc_session_settings', JSON.stringify(data))
      }
    }

    return null
  }

  private mockUpdateSettings(settings: Partial<SessionSettings>): SessionSettings {
    const stored = localStorage.getItem('qc_session_settings')
    const data = stored ? JSON.parse(stored) : { currentSettings: null, pendingProposal: null }

    const currentSettings = data.currentSettings || {
      id: `settings_${Date.now()}`,
      coupleId: 'couple-1',
      sessionDuration: 10,
      timeoutsPerPartner: 1,
      timeoutDuration: 2,
      turnBasedMode: false,
      allowExtensions: true,
      pauseNotifications: true,
      autoSaveDrafts: true,
      warmUpQuestions: false,
      coolDownTime: 2,
      agreedAt: new Date(),
      agreedBy: ['user-1'],
      version: 1
    }

    const updatedSettings = {
      ...currentSettings,
      ...settings,
      version: currentSettings.version + 1
    }

    data.currentSettings = updatedSettings
    localStorage.setItem('qc_session_settings', JSON.stringify(data))

    return updatedSettings
  }
}

export const sessionSettingsService = new SessionSettingsService()