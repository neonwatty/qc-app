import type { CheckIn, Note, ActionItem } from '@/types'
import type { CheckInSession, CheckInStep, CategoryProgress } from '@/types/checkin'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export interface CheckInSessionResponse {
  session: CheckInSession
  checkIn: CheckIn
}

export interface CreateCheckInRequest {
  coupleId: string
  categories: string[]
}

export interface UpdateProgressRequest {
  currentStep: CheckInStep
  completedSteps: CheckInStep[]
  percentage: number
}

export interface UpdateCategoryProgressRequest {
  categoryId: string
  progress: Partial<CategoryProgress>
}

export interface AddNoteRequest {
  content: string
  isPrivate: boolean
  categoryId?: string
  tags?: string[]
}

export interface AddActionItemRequest {
  description: string
  assignedTo: string
  dueDate?: Date
  priority?: 'low' | 'medium' | 'high'
  category?: string
}

class CheckInService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_tokens')
    if (token) {
      const { accessToken } = JSON.parse(token)
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    }
    return { 'Content-Type': 'application/json' }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers
      }
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'An error occurred'
      }))
      throw new Error(error.message || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // Create a new check-in session
  async createSession(request: CreateCheckInRequest): Promise<CheckInSessionResponse> {
    try {
      return await this.makeRequest<CheckInSessionResponse>('/checkins/sessions', {
        method: 'POST',
        body: JSON.stringify(request)
      })
    } catch (error) {
      // For development, return mock data if API fails
      if (process.env.NODE_ENV === 'development') {
        return this.mockCreateSession(request)
      }
      throw error
    }
  }

  // Get current active session
  async getCurrentSession(coupleId: string): Promise<CheckInSessionResponse | null> {
    try {
      return await this.makeRequest<CheckInSessionResponse>(
        `/checkins/sessions/current?coupleId=${coupleId}`
      )
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return null
      }
      throw error
    }
  }

  // Update session progress
  async updateProgress(
    sessionId: string,
    progress: UpdateProgressRequest
  ): Promise<CheckInSession> {
    try {
      const response = await this.makeRequest<{ session: CheckInSession }>(
        `/checkins/sessions/${sessionId}/progress`,
        {
          method: 'PATCH',
          body: JSON.stringify(progress)
        }
      )
      return response.session
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return this.mockUpdateProgress(sessionId, progress)
      }
      throw error
    }
  }

  // Update category progress
  async updateCategoryProgress(
    sessionId: string,
    update: UpdateCategoryProgressRequest
  ): Promise<CategoryProgress[]> {
    try {
      const response = await this.makeRequest<{ categoryProgress: CategoryProgress[] }>(
        `/checkins/sessions/${sessionId}/categories/${update.categoryId}`,
        {
          method: 'PATCH',
          body: JSON.stringify(update.progress)
        }
      )
      return response.categoryProgress
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return []
      }
      throw error
    }
  }

  // Add a note to the session
  async addNote(sessionId: string, note: AddNoteRequest): Promise<Note> {
    try {
      const response = await this.makeRequest<{ note: Note }>(
        `/checkins/sessions/${sessionId}/notes`,
        {
          method: 'POST',
          body: JSON.stringify(note)
        }
      )
      return response.note
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return this.mockAddNote(note)
      }
      throw error
    }
  }

  // Update a note
  async updateNote(
    sessionId: string,
    noteId: string,
    updates: Partial<Note>
  ): Promise<Note> {
    try {
      const response = await this.makeRequest<{ note: Note }>(
        `/checkins/sessions/${sessionId}/notes/${noteId}`,
        {
          method: 'PATCH',
          body: JSON.stringify(updates)
        }
      )
      return response.note
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return { ...updates, id: noteId } as Note
      }
      throw error
    }
  }

  // Remove a note
  async removeNote(sessionId: string, noteId: string): Promise<void> {
    try {
      await this.makeRequest(`/checkins/sessions/${sessionId}/notes/${noteId}`, {
        method: 'DELETE'
      })
    } catch (error) {
      if (process.env.NODE_ENV !== 'development') {
        throw error
      }
    }
  }

  // Add an action item
  async addActionItem(
    sessionId: string,
    actionItem: AddActionItemRequest
  ): Promise<ActionItem> {
    try {
      const response = await this.makeRequest<{ actionItem: ActionItem }>(
        `/checkins/sessions/${sessionId}/action-items`,
        {
          method: 'POST',
          body: JSON.stringify(actionItem)
        }
      )
      return response.actionItem
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return this.mockAddActionItem(actionItem)
      }
      throw error
    }
  }

  // Update an action item
  async updateActionItem(
    sessionId: string,
    actionItemId: string,
    updates: Partial<ActionItem>
  ): Promise<ActionItem> {
    try {
      const response = await this.makeRequest<{ actionItem: ActionItem }>(
        `/checkins/sessions/${sessionId}/action-items/${actionItemId}`,
        {
          method: 'PATCH',
          body: JSON.stringify(updates)
        }
      )
      return response.actionItem
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return { ...updates, id: actionItemId } as ActionItem
      }
      throw error
    }
  }

  // Remove an action item
  async removeActionItem(sessionId: string, actionItemId: string): Promise<void> {
    try {
      await this.makeRequest(
        `/checkins/sessions/${sessionId}/action-items/${actionItemId}`,
        {
          method: 'DELETE'
        }
      )
    } catch (error) {
      if (process.env.NODE_ENV !== 'development') {
        throw error
      }
    }
  }

  // Complete the check-in session
  async completeSession(sessionId: string): Promise<CheckIn> {
    try {
      const response = await this.makeRequest<{ checkIn: CheckIn }>(
        `/checkins/sessions/${sessionId}/complete`,
        {
          method: 'POST'
        }
      )
      return response.checkIn
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return this.mockCompleteSession(sessionId)
      }
      throw error
    }
  }

  // Abandon the check-in session
  async abandonSession(sessionId: string): Promise<void> {
    try {
      await this.makeRequest(`/checkins/sessions/${sessionId}/abandon`, {
        method: 'POST'
      })
    } catch (error) {
      if (process.env.NODE_ENV !== 'development') {
        throw error
      }
    }
  }

  // Save session state
  async saveSession(session: CheckInSession): Promise<CheckInSession> {
    try {
      const response = await this.makeRequest<{ session: CheckInSession }>(
        `/checkins/sessions/${session.id}`,
        {
          method: 'PUT',
          body: JSON.stringify(session)
        }
      )
      return response.session
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        // Save to localStorage as fallback
        localStorage.setItem('qc_checkin_session', JSON.stringify(session))
        return session
      }
      throw error
    }
  }

  // Mock methods for development
  private mockCreateSession(request: CreateCheckInRequest): CheckInSessionResponse {
    const now = new Date()
    const checkIn: CheckIn = {
      id: `checkin_${Date.now()}`,
      coupleId: request.coupleId,
      participants: ['user-1', 'user-2'],
      startedAt: now,
      status: 'in-progress',
      categories: request.categories,
      notes: [],
      actionItems: []
    }

    const session: CheckInSession = {
      id: checkIn.id,
      baseCheckIn: checkIn,
      progress: {
        currentStep: 'welcome',
        completedSteps: [],
        totalSteps: 6,
        percentage: 0
      },
      selectedCategories: request.categories,
      categoryProgress: request.categories.map(categoryId => ({
        categoryId,
        isCompleted: false,
        notes: [],
        timeSpent: 0,
        lastUpdated: now
      })),
      draftNotes: [],
      startedAt: now,
      lastSavedAt: now
    }

    return { session, checkIn }
  }

  private mockUpdateProgress(
    sessionId: string,
    progress: UpdateProgressRequest
  ): CheckInSession {
    const stored = localStorage.getItem('qc_checkin_session')
    if (stored) {
      const session = JSON.parse(stored)
      session.progress = { ...session.progress, ...progress }
      localStorage.setItem('qc_checkin_session', JSON.stringify(session))
      return session
    }
    throw new Error('Session not found')
  }

  private mockAddNote(note: AddNoteRequest): Note {
    return {
      id: `note_${Date.now()}`,
      authorId: 'user-1',
      coupleId: 'couple-1',
      content: note.content,
      privacy: note.isPrivate ? 'private' : 'shared',
      isPrivate: note.isPrivate,
      categoryId: note.categoryId,
      tags: note.tags || [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  private mockAddActionItem(actionItem: AddActionItemRequest): ActionItem {
    return {
      id: `action_${Date.now()}`,
      title: actionItem.description,
      description: actionItem.description,
      checkInId: `checkin_${Date.now()}`,
      assignedTo: actionItem.assignedTo,
      createdBy: 'user-1',
      dueDate: actionItem.dueDate,
      priority: actionItem.priority || 'medium',
      completed: false,
      createdAt: new Date()
    }
  }

  private mockCompleteSession(sessionId: string): CheckIn {
    const stored = localStorage.getItem('qc_checkin_session')
    if (stored) {
      const session = JSON.parse(stored)
      const checkIn = session.baseCheckIn
      checkIn.completedAt = new Date()
      checkIn.status = 'completed'
      return checkIn
    }
    throw new Error('Session not found')
  }
}

export const checkInService = new CheckInService()