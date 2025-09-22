import { LoveLanguage, LoveAction, LoveLanguageDiscovery } from '@/types'
import { authService } from './auth.service'

export interface CreateLanguageRequest {
  title: string
  description: string
  examples: string[]
  category: 'words' | 'acts' | 'gifts' | 'time' | 'touch' | 'custom'
  privacy: 'private' | 'shared'
  importance: 'low' | 'medium' | 'high' | 'essential'
  tags?: string[]
}

export interface UpdateLanguageRequest {
  title?: string
  description?: string
  examples?: string[]
  category?: 'words' | 'acts' | 'gifts' | 'time' | 'touch' | 'custom'
  privacy?: 'private' | 'shared'
  importance?: 'low' | 'medium' | 'high' | 'essential'
  tags?: string[]
}

export interface CreateActionRequest {
  title: string
  description: string
  linkedLanguageId: string
  suggestedBy: 'self' | 'partner' | 'ai'
  frequency?: 'once' | 'weekly' | 'monthly' | 'surprise'
  difficulty: 'easy' | 'moderate' | 'challenging'
  forUserId: string
  plannedFor?: Date
  notes?: string
}

export interface UpdateActionRequest {
  title?: string
  description?: string
  status?: 'suggested' | 'planned' | 'completed' | 'recurring'
  frequency?: 'once' | 'weekly' | 'monthly' | 'surprise'
  difficulty?: 'easy' | 'moderate' | 'challenging'
  plannedFor?: Date
  notes?: string
}

export interface CreateDiscoveryRequest {
  discovery: string
  checkInId?: string
}

class LoveLanguagesService {
  private readonly basePath = '/api/love-languages'

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

  // Language CRUD operations
  async getLanguages(): Promise<LoveLanguage[]> {
    try {
      return await this.makeRequest<LoveLanguage[]>(`${this.basePath}/languages`)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return this.mockGetLanguages()
      }
      throw error
    }
  }

  async getPartnerLanguages(): Promise<LoveLanguage[]> {
    try {
      return await this.makeRequest<LoveLanguage[]>(`${this.basePath}/partner/languages`)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return this.mockGetPartnerLanguages()
      }
      throw error
    }
  }

  async createLanguage(request: CreateLanguageRequest): Promise<LoveLanguage> {
    try {
      return await this.makeRequest<LoveLanguage>(`${this.basePath}/languages`, {
        method: 'POST',
        body: JSON.stringify(request)
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return this.mockCreateLanguage(request)
      }
      throw error
    }
  }

  async updateLanguage(id: string, request: UpdateLanguageRequest): Promise<LoveLanguage> {
    try {
      return await this.makeRequest<LoveLanguage>(`${this.basePath}/languages/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(request)
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return this.mockUpdateLanguage(id, request)
      }
      throw error
    }
  }

  async deleteLanguage(id: string): Promise<void> {
    try {
      await this.makeRequest<void>(`${this.basePath}/languages/${id}`, {
        method: 'DELETE'
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return
      }
      throw error
    }
  }

  // Action CRUD operations
  async getActions(): Promise<LoveAction[]> {
    try {
      return await this.makeRequest<LoveAction[]>(`${this.basePath}/actions`)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return this.mockGetActions()
      }
      throw error
    }
  }

  async createAction(request: CreateActionRequest): Promise<LoveAction> {
    try {
      return await this.makeRequest<LoveAction>(`${this.basePath}/actions`, {
        method: 'POST',
        body: JSON.stringify(request)
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return this.mockCreateAction(request)
      }
      throw error
    }
  }

  async updateAction(id: string, request: UpdateActionRequest): Promise<LoveAction> {
    try {
      return await this.makeRequest<LoveAction>(`${this.basePath}/actions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(request)
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return this.mockUpdateAction(id, request)
      }
      throw error
    }
  }

  async completeAction(id: string): Promise<LoveAction> {
    try {
      return await this.makeRequest<LoveAction>(`${this.basePath}/actions/${id}/complete`, {
        method: 'POST'
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return this.mockCompleteAction(id)
      }
      throw error
    }
  }

  async deleteAction(id: string): Promise<void> {
    try {
      await this.makeRequest<void>(`${this.basePath}/actions/${id}`, {
        method: 'DELETE'
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return
      }
      throw error
    }
  }

  // Discovery operations
  async getDiscoveries(): Promise<LoveLanguageDiscovery[]> {
    try {
      return await this.makeRequest<LoveLanguageDiscovery[]>(`${this.basePath}/discoveries`)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return this.mockGetDiscoveries()
      }
      throw error
    }
  }

  async createDiscovery(request: CreateDiscoveryRequest): Promise<LoveLanguageDiscovery> {
    try {
      return await this.makeRequest<LoveLanguageDiscovery>(`${this.basePath}/discoveries`, {
        method: 'POST',
        body: JSON.stringify(request)
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return this.mockCreateDiscovery(request)
      }
      throw error
    }
  }

  async convertDiscovery(discoveryId: string, languageId: string): Promise<void> {
    try {
      await this.makeRequest<void>(`${this.basePath}/discoveries/${discoveryId}/convert`, {
        method: 'POST',
        body: JSON.stringify({ languageId })
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return
      }
      throw error
    }
  }

  // Mock implementations for development
  private mockGetLanguages(): LoveLanguage[] {
    const stored = localStorage.getItem('qc_love_languages')
    if (stored) {
      const data = JSON.parse(stored)
      return data.languages || []
    }
    return []
  }

  private mockGetPartnerLanguages(): LoveLanguage[] {
    const stored = localStorage.getItem('qc_love_languages')
    if (stored) {
      const data = JSON.parse(stored)
      return data.partnerLanguages || []
    }
    return []
  }

  private mockCreateLanguage(request: CreateLanguageRequest): LoveLanguage {
    const newLanguage: LoveLanguage = {
      id: `lang_${Date.now()}`,
      userId: 'user-1',
      ...request,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const stored = localStorage.getItem('qc_love_languages')
    const data = stored ? JSON.parse(stored) : { languages: [], partnerLanguages: [], actions: [], discoveries: [] }
    data.languages.push(newLanguage)
    localStorage.setItem('qc_love_languages', JSON.stringify(data))

    return newLanguage
  }

  private mockUpdateLanguage(id: string, request: UpdateLanguageRequest): LoveLanguage {
    const stored = localStorage.getItem('qc_love_languages')
    if (!stored) throw new Error('No languages found')

    const data = JSON.parse(stored)
    const index = data.languages.findIndex((l: LoveLanguage) => l.id === id)

    if (index === -1) throw new Error('Language not found')

    data.languages[index] = {
      ...data.languages[index],
      ...request,
      updatedAt: new Date()
    }

    localStorage.setItem('qc_love_languages', JSON.stringify(data))
    return data.languages[index]
  }

  private mockGetActions(): LoveAction[] {
    const stored = localStorage.getItem('qc_love_languages')
    if (stored) {
      const data = JSON.parse(stored)
      return data.actions || []
    }
    return []
  }

  private mockCreateAction(request: CreateActionRequest): LoveAction {
    const newAction: LoveAction = {
      id: `action_${Date.now()}`,
      ...request,
      linkedLanguageTitle: request.title,
      suggestedById: 'user-1',
      status: 'suggested',
      completedCount: 0,
      createdBy: 'user-1',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const stored = localStorage.getItem('qc_love_languages')
    const data = stored ? JSON.parse(stored) : { languages: [], partnerLanguages: [], actions: [], discoveries: [] }
    data.actions.push(newAction)
    localStorage.setItem('qc_love_languages', JSON.stringify(data))

    return newAction
  }

  private mockUpdateAction(id: string, request: UpdateActionRequest): LoveAction {
    const stored = localStorage.getItem('qc_love_languages')
    if (!stored) throw new Error('No actions found')

    const data = JSON.parse(stored)
    const index = data.actions.findIndex((a: LoveAction) => a.id === id)

    if (index === -1) throw new Error('Action not found')

    data.actions[index] = {
      ...data.actions[index],
      ...request,
      updatedAt: new Date()
    }

    localStorage.setItem('qc_love_languages', JSON.stringify(data))
    return data.actions[index]
  }

  private mockCompleteAction(id: string): LoveAction {
    const stored = localStorage.getItem('qc_love_languages')
    if (!stored) throw new Error('No actions found')

    const data = JSON.parse(stored)
    const index = data.actions.findIndex((a: LoveAction) => a.id === id)

    if (index === -1) throw new Error('Action not found')

    data.actions[index] = {
      ...data.actions[index],
      status: 'completed',
      completedCount: data.actions[index].completedCount + 1,
      lastCompletedAt: new Date(),
      updatedAt: new Date()
    }

    localStorage.setItem('qc_love_languages', JSON.stringify(data))
    return data.actions[index]
  }

  private mockGetDiscoveries(): LoveLanguageDiscovery[] {
    const stored = localStorage.getItem('qc_love_languages')
    if (stored) {
      const data = JSON.parse(stored)
      return data.discoveries || []
    }
    return []
  }

  private mockCreateDiscovery(request: CreateDiscoveryRequest): LoveLanguageDiscovery {
    const newDiscovery: LoveLanguageDiscovery = {
      id: `disc_${Date.now()}`,
      userId: 'user-1',
      ...request,
      createdAt: new Date()
    }

    const stored = localStorage.getItem('qc_love_languages')
    const data = stored ? JSON.parse(stored) : { languages: [], partnerLanguages: [], actions: [], discoveries: [] }
    data.discoveries.push(newDiscovery)
    localStorage.setItem('qc_love_languages', JSON.stringify(data))

    return newDiscovery
  }
}

export const loveLanguagesService = new LoveLanguagesService()