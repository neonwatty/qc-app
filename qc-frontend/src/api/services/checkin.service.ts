import apiClient from '../client'
import type { CheckIn, Note, ActionItem } from '@/types'

export interface CreateCheckInRequest {
  coupleId: string
  categories?: string[]
}

export interface UpdateCheckInRequest {
  categories?: string[]
  status?: 'in-progress' | 'completed' | 'abandoned'
}

export interface AddNoteRequest {
  content: string
  isPrivate: boolean
  category?: string
}

export interface AddActionItemRequest {
  description: string
  assignedTo: string
  dueDate?: Date
  priority?: 'low' | 'medium' | 'high'
}

class CheckInService {
  async createCheckIn(data: CreateCheckInRequest): Promise<CheckIn> {
    const response = await apiClient.post<{ checkIn: CheckIn }>('/check-ins', data)
    return response.data.checkIn
  }

  async getCheckIn(checkInId: string): Promise<CheckIn> {
    const response = await apiClient.get<{ checkIn: CheckIn }>(`/check-ins/${checkInId}`)
    return response.data.checkIn
  }

  async updateCheckIn(checkInId: string, data: UpdateCheckInRequest): Promise<CheckIn> {
    const response = await apiClient.patch<{ checkIn: CheckIn }>(`/check-ins/${checkInId}`, data)
    return response.data.checkIn
  }

  async completeCheckIn(checkInId: string): Promise<CheckIn> {
    const response = await apiClient.post<{ checkIn: CheckIn }>(`/check-ins/${checkInId}/complete`)
    return response.data.checkIn
  }

  async abandonCheckIn(checkInId: string): Promise<void> {
    await apiClient.post(`/check-ins/${checkInId}/abandon`)
  }

  async getCheckInHistory(coupleId: string, limit = 10, offset = 0): Promise<CheckIn[]> {
    const response = await apiClient.get<{ checkIns: CheckIn[] }>('/check-ins', {
      params: { coupleId, limit, offset },
    })
    return response.data.checkIns
  }

  async getCurrentCheckIn(coupleId: string): Promise<CheckIn | null> {
    try {
      const response = await apiClient.get<{ checkIn: CheckIn }>('/check-ins/current', {
        params: { coupleId },
      })
      return response.data.checkIn
    } catch {
      // Return null if no current check-in exists
      return null
    }
  }

  async addNote(checkInId: string, data: AddNoteRequest): Promise<Note> {
    const response = await apiClient.post<{ note: Note }>(`/check-ins/${checkInId}/notes`, data)
    return response.data.note
  }

  async updateNote(checkInId: string, noteId: string, content: string): Promise<Note> {
    const response = await apiClient.patch<{ note: Note }>(`/check-ins/${checkInId}/notes/${noteId}`, { content })
    return response.data.note
  }

  async deleteNote(checkInId: string, noteId: string): Promise<void> {
    await apiClient.delete(`/check-ins/${checkInId}/notes/${noteId}`)
  }

  async addActionItem(checkInId: string, data: AddActionItemRequest): Promise<ActionItem> {
    const response = await apiClient.post<{ actionItem: ActionItem }>(`/check-ins/${checkInId}/action-items`, data)
    return response.data.actionItem
  }

  async updateActionItem(checkInId: string, actionItemId: string, data: Partial<ActionItem>): Promise<ActionItem> {
    const response = await apiClient.patch<{ actionItem: ActionItem }>(
      `/check-ins/${checkInId}/action-items/${actionItemId}`,
      data
    )
    return response.data.actionItem
  }

  async completeActionItem(checkInId: string, actionItemId: string): Promise<ActionItem> {
    const response = await apiClient.post<{ actionItem: ActionItem }>(
      `/check-ins/${checkInId}/action-items/${actionItemId}/complete`
    )
    return response.data.actionItem
  }

  async deleteActionItem(checkInId: string, actionItemId: string): Promise<void> {
    await apiClient.delete(`/check-ins/${checkInId}/action-items/${actionItemId}`)
  }

  async getCategories(): Promise<string[]> {
    const response = await apiClient.get<{ categories: string[] }>('/check-ins/categories')
    return response.data.categories
  }

  async getPrompts(category: string): Promise<string[]> {
    const response = await apiClient.get<{ prompts: string[] }>('/check-ins/prompts', {
      params: { category },
    })
    return response.data.prompts
  }
}

export default new CheckInService()