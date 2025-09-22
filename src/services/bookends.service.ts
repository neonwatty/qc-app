import { SessionPreparation, QuickReflection, PreparationTopic } from '@/types/bookends'
import { authService } from './auth.service'

export interface CreateTopicRequest {
  content: string
  isQuickTopic?: boolean
}

export interface CreateReflectionRequest {
  sessionId: string
  mood: 'better' | 'same' | 'worse'
  highlight?: string
  challenge?: string
  gratitude?: string
  tags?: string[]
}

class BookendsService {
  private readonly basePath = '/api/bookends'

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

  // Preparation operations
  async getPreparation(): Promise<SessionPreparation> {
    try {
      return await this.makeRequest<SessionPreparation>(`${this.basePath}/preparation`)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return this.mockGetPreparation()
      }
      throw error
    }
  }

  async getPartnerPreparation(): Promise<SessionPreparation | null> {
    try {
      return await this.makeRequest<SessionPreparation>(`${this.basePath}/partner/preparation`)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return this.mockGetPartnerPreparation()
      }
      throw error
    }
  }

  async addTopic(request: CreateTopicRequest): Promise<PreparationTopic> {
    try {
      return await this.makeRequest<PreparationTopic>(`${this.basePath}/topics`, {
        method: 'POST',
        body: JSON.stringify(request)
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return this.mockAddTopic(request)
      }
      throw error
    }
  }

  async removeTopic(topicId: string): Promise<void> {
    try {
      await this.makeRequest<void>(`${this.basePath}/topics/${topicId}`, {
        method: 'DELETE'
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        this.mockRemoveTopic(topicId)
        return
      }
      throw error
    }
  }

  async reorderTopics(topics: PreparationTopic[]): Promise<void> {
    try {
      await this.makeRequest<void>(`${this.basePath}/topics/reorder`, {
        method: 'PUT',
        body: JSON.stringify({ topics })
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        this.mockReorderTopics(topics)
        return
      }
      throw error
    }
  }

  async clearPreparation(): Promise<void> {
    try {
      await this.makeRequest<void>(`${this.basePath}/preparation/clear`, {
        method: 'DELETE'
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        this.mockClearPreparation()
        return
      }
      throw error
    }
  }

  // Reflection operations
  async getReflections(): Promise<QuickReflection[]> {
    try {
      return await this.makeRequest<QuickReflection[]>(`${this.basePath}/reflections`)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return this.mockGetReflections()
      }
      throw error
    }
  }

  async getPartnerReflection(sessionId: string): Promise<QuickReflection | null> {
    try {
      return await this.makeRequest<QuickReflection>(`${this.basePath}/partner/reflections/${sessionId}`)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return this.mockGetPartnerReflection(sessionId)
      }
      throw error
    }
  }

  async saveReflection(request: CreateReflectionRequest): Promise<QuickReflection> {
    try {
      return await this.makeRequest<QuickReflection>(`${this.basePath}/reflections`, {
        method: 'POST',
        body: JSON.stringify(request)
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return this.mockSaveReflection(request)
      }
      throw error
    }
  }

  // Mock implementations for development
  private mockGetPreparation(): SessionPreparation {
    const stored = localStorage.getItem('qc_session_bookends')
    if (stored) {
      const data = JSON.parse(stored)
      return data.preparation || {
        id: `prep_${Date.now()}`,
        myTopics: [],
        partnerTopics: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }
    return {
      id: `prep_${Date.now()}`,
      myTopics: [],
      partnerTopics: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  private mockGetPartnerPreparation(): SessionPreparation | null {
    const stored = localStorage.getItem('qc_session_bookends')
    if (stored) {
      const data = JSON.parse(stored)
      return data.partnerPreparation || null
    }
    return null
  }

  private mockAddTopic(request: CreateTopicRequest): PreparationTopic {
    const topic: PreparationTopic = {
      id: `topic_${Date.now()}`,
      content: request.content,
      authorId: 'user-1',
      isQuickTopic: request.isQuickTopic || false,
      createdAt: new Date()
    }

    const stored = localStorage.getItem('qc_session_bookends')
    const data = stored ? JSON.parse(stored) : { preparation: null }

    if (!data.preparation) {
      data.preparation = {
        id: `prep_${Date.now()}`,
        myTopics: [],
        partnerTopics: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }

    data.preparation.myTopics.push(topic)
    data.preparation.updatedAt = new Date()
    localStorage.setItem('qc_session_bookends', JSON.stringify(data))

    return topic
  }

  private mockRemoveTopic(topicId: string): void {
    const stored = localStorage.getItem('qc_session_bookends')
    if (!stored) return

    const data = JSON.parse(stored)
    if (data.preparation?.myTopics) {
      data.preparation.myTopics = data.preparation.myTopics.filter(
        (t: PreparationTopic) => t.id !== topicId
      )
      data.preparation.updatedAt = new Date()
      localStorage.setItem('qc_session_bookends', JSON.stringify(data))
    }
  }

  private mockReorderTopics(topics: PreparationTopic[]): void {
    const stored = localStorage.getItem('qc_session_bookends')
    const data = stored ? JSON.parse(stored) : { preparation: null }

    if (data.preparation) {
      data.preparation.myTopics = topics
      data.preparation.updatedAt = new Date()
      localStorage.setItem('qc_session_bookends', JSON.stringify(data))
    }
  }

  private mockClearPreparation(): void {
    const stored = localStorage.getItem('qc_session_bookends')
    if (!stored) return

    const data = JSON.parse(stored)
    if (data.preparation) {
      data.preparation.myTopics = []
      data.preparation.partnerTopics = []
      data.preparation.updatedAt = new Date()
      localStorage.setItem('qc_session_bookends', JSON.stringify(data))
    }
  }

  private mockGetReflections(): QuickReflection[] {
    const stored = localStorage.getItem('qc_session_bookends')
    if (stored) {
      const data = JSON.parse(stored)
      return data.reflection ? [data.reflection] : []
    }
    return []
  }

  private mockGetPartnerReflection(sessionId: string): QuickReflection | null {
    const stored = localStorage.getItem('qc_session_bookends')
    if (stored) {
      const data = JSON.parse(stored)
      return data.partnerReflection || null
    }
    return null
  }

  private mockSaveReflection(request: CreateReflectionRequest): QuickReflection {
    const reflection: QuickReflection = {
      id: `ref_${Date.now()}`,
      sessionId: request.sessionId,
      authorId: 'user-1',
      feelingBefore: 3,
      feelingAfter: request.mood === 'better' ? 4 : request.mood === 'worse' ? 2 : 3,
      gratitude: request.gratitude || '',
      keyTakeaway: request.highlight || '',
      shareWithPartner: true,
      createdAt: new Date()
    }

    const stored = localStorage.getItem('qc_session_bookends')
    const data = stored ? JSON.parse(stored) : { reflection: null }

    data.reflection = reflection
    localStorage.setItem('qc_session_bookends', JSON.stringify(data))

    return reflection
  }
}

export const bookendsService = new BookendsService()