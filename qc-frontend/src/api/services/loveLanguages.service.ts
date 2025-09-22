import apiClient from '../client'
import type { LoveLanguage, LoveAction, LoveLanguageDiscovery } from '@/types'
import type {
  ApiResponse,
  PaginatedResponse,
  CreateLoveLanguageRequest,
  UpdateLoveLanguageRequest,
  CreateLoveActionRequest,
  UpdateLoveActionRequest,
  LoveLanguageFilter,
  BaseFilter
} from '../types'

interface LoveActionFilter extends BaseFilter {
  status?: 'suggested' | 'planned' | 'completed' | 'recurring'
  forUserId?: string
  linkedLanguageId?: string
  difficulty?: 'easy' | 'moderate' | 'challenging'
  plannedDateRange?: {
    start: Date | string
    end: Date | string
  }
}

class LoveLanguagesService {
  // Love Language CRUD operations
  async createLoveLanguage(userId: string, data: CreateLoveLanguageRequest): Promise<LoveLanguage> {
    const response = await apiClient.post<ApiResponse<LoveLanguage>>('/love-languages', {
      userId,
      ...data,
    })
    return response.data.data
  }

  async getLoveLanguage(languageId: string): Promise<LoveLanguage> {
    const response = await apiClient.get<ApiResponse<LoveLanguage>>(`/love-languages/${languageId}`)
    return response.data.data
  }

  async updateLoveLanguage(languageId: string, data: UpdateLoveLanguageRequest): Promise<LoveLanguage> {
    const response = await apiClient.patch<ApiResponse<LoveLanguage>>(`/love-languages/${languageId}`, data)
    return response.data.data
  }

  async deleteLoveLanguage(languageId: string): Promise<void> {
    await apiClient.delete(`/love-languages/${languageId}`)
  }

  async getLoveLanguages(filter?: LoveLanguageFilter): Promise<PaginatedResponse<LoveLanguage>> {
    const response = await apiClient.get<PaginatedResponse<LoveLanguage>>('/love-languages', {
      params: filter,
    })
    return response.data
  }

  // Get love languages for a specific user
  async getUserLoveLanguages(userId: string): Promise<LoveLanguage[]> {
    const response = await apiClient.get<ApiResponse<LoveLanguage[]>>(`/users/${userId}/love-languages`)
    return response.data.data
  }

  // Get partner's shared love languages
  async getPartnerLoveLanguages(userId: string, partnerId: string): Promise<LoveLanguage[]> {
    const response = await apiClient.get<ApiResponse<LoveLanguage[]>>(`/users/${partnerId}/love-languages/shared`, {
      params: { viewerId: userId },
    })
    return response.data.data
  }

  // Love Action CRUD operations
  async createLoveAction(data: CreateLoveActionRequest): Promise<LoveAction> {
    const response = await apiClient.post<ApiResponse<LoveAction>>('/love-actions', data)
    return response.data.data
  }

  async getLoveAction(actionId: string): Promise<LoveAction> {
    const response = await apiClient.get<ApiResponse<LoveAction>>(`/love-actions/${actionId}`)
    return response.data.data
  }

  async updateLoveAction(actionId: string, data: UpdateLoveActionRequest): Promise<LoveAction> {
    const response = await apiClient.patch<ApiResponse<LoveAction>>(`/love-actions/${actionId}`, data)
    return response.data.data
  }

  async deleteLoveAction(actionId: string): Promise<void> {
    await apiClient.delete(`/love-actions/${actionId}`)
  }

  async getLoveActions(filter?: LoveActionFilter): Promise<PaginatedResponse<LoveAction>> {
    const response = await apiClient.get<PaginatedResponse<LoveAction>>('/love-actions', {
      params: filter,
    })
    return response.data
  }

  // Mark action as completed
  async completeLoveAction(actionId: string, notes?: string): Promise<LoveAction> {
    const response = await apiClient.post<ApiResponse<LoveAction>>(`/love-actions/${actionId}/complete`, {
      notes,
      completedAt: new Date(),
    })
    return response.data.data
  }

  // Get suggested actions based on love languages
  async getSuggestedActions(userId: string, forPartnerId: string): Promise<LoveAction[]> {
    const response = await apiClient.get<ApiResponse<LoveAction[]>>('/love-actions/suggestions', {
      params: {
        userId,
        forPartnerId,
      },
    })
    return response.data.data
  }

  // Schedule a recurring love action
  async scheduleRecurringAction(
    actionId: string,
    frequency: 'weekly' | 'monthly',
    startDate?: Date | string
  ): Promise<LoveAction> {
    const response = await apiClient.post<ApiResponse<LoveAction>>(`/love-actions/${actionId}/schedule`, {
      frequency,
      startDate: startDate || new Date(),
    })
    return response.data.data
  }

  // Love Language Discovery
  async startDiscoverySession(coupleId: string): Promise<LoveLanguageDiscovery> {
    const response = await apiClient.post<ApiResponse<LoveLanguageDiscovery>>('/love-languages/discovery/start', {
      coupleId,
    })
    return response.data.data
  }

  async submitDiscoveryAnswer(
    sessionId: string,
    questionId: string,
    answer: unknown
  ): Promise<LoveLanguageDiscovery> {
    const response = await apiClient.post<ApiResponse<LoveLanguageDiscovery>>(
      `/love-languages/discovery/${sessionId}/answer`,
      {
        questionId,
        answer,
      }
    )
    return response.data.data
  }

  async completeDiscoverySession(sessionId: string): Promise<{
    session: LoveLanguageDiscovery
    recommendations: LoveLanguage[]
  }> {
    const response = await apiClient.post<
      ApiResponse<{
        session: LoveLanguageDiscovery
        recommendations: LoveLanguage[]
      }>
    >(`/love-languages/discovery/${sessionId}/complete`)
    return response.data.data
  }

  // Analytics and insights
  async getLoveLanguageInsights(userId: string): Promise<{
    topLanguages: Array<{ language: LoveLanguage; score: number }>
    partnerAlignment: number
    actionCompletionRate: number
    mostEffectiveActions: LoveAction[]
    recommendations: string[]
  }> {
    const response = await apiClient.get<
      ApiResponse<{
        topLanguages: Array<{ language: LoveLanguage; score: number }>
        partnerAlignment: number
        actionCompletionRate: number
        mostEffectiveActions: LoveAction[]
        recommendations: string[]
      }>
    >(`/users/${userId}/love-languages/insights`)
    return response.data.data
  }

  // Track when a love language is discussed
  async markAsDiscussed(languageId: string, checkInId?: string): Promise<LoveLanguage> {
    const response = await apiClient.post<ApiResponse<LoveLanguage>>(`/love-languages/${languageId}/discussed`, {
      discussedAt: new Date(),
      checkInId,
    })
    return response.data.data
  }

  // Get love action history
  async getActionHistory(userId: string, limit = 50): Promise<LoveAction[]> {
    const response = await apiClient.get<ApiResponse<LoveAction[]>>(`/users/${userId}/love-actions/history`, {
      params: { limit },
    })
    return response.data.data
  }

  // Export love languages and actions
  async exportLoveData(userId: string): Promise<Blob> {
    const response = await apiClient.get(`/users/${userId}/love-languages/export`, {
      responseType: 'blob',
    })
    return response.data
  }

  // Get love language templates
  async getTemplates(): Promise<
    Array<{
      category: string
      title: string
      description: string
      examples: string[]
    }>
  > {
    const response = await apiClient.get<
      ApiResponse<
        Array<{
          category: string
          title: string
          description: string
          examples: string[]
        }>
      >
    >('/love-languages/templates')
    return response.data.data
  }

  // Rate an action's effectiveness
  async rateAction(
    actionId: string,
    rating: number,
    feedback?: string
  ): Promise<LoveAction> {
    const response = await apiClient.post<ApiResponse<LoveAction>>(`/love-actions/${actionId}/rate`, {
      rating,
      feedback,
    })
    return response.data.data
  }
}

export default new LoveLanguagesService()