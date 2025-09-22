import apiClient from '../client'
import type { Note } from '@/types'

export interface CreateNoteRequest {
  content: string
  isPrivate: boolean
  category?: string
  tags?: string[]
}

export interface UpdateNoteRequest {
  content?: string
  isPrivate?: boolean
  category?: string
  tags?: string[]
}

export interface NotesFilter {
  isPrivate?: boolean
  category?: string
  tags?: string[]
  searchTerm?: string
  startDate?: Date
  endDate?: Date
  limit?: number
  offset?: number
}

class NotesService {
  async createNote(coupleId: string, data: CreateNoteRequest): Promise<Note> {
    const response = await apiClient.post<{ note: Note }>('/notes', {
      ...data,
      coupleId,
    })
    return response.data.note
  }

  async getNote(noteId: string): Promise<Note> {
    const response = await apiClient.get<{ note: Note }>(`/notes/${noteId}`)
    return response.data.note
  }

  async updateNote(noteId: string, data: UpdateNoteRequest): Promise<Note> {
    const response = await apiClient.patch<{ note: Note }>(`/notes/${noteId}`, data)
    return response.data.note
  }

  async deleteNote(noteId: string): Promise<void> {
    await apiClient.delete(`/notes/${noteId}`)
  }

  async getNotes(coupleId: string, filter?: NotesFilter): Promise<Note[]> {
    const response = await apiClient.get<{ notes: Note[] }>('/notes', {
      params: {
        coupleId,
        ...filter,
      },
    })
    return response.data.notes
  }

  async searchNotes(coupleId: string, searchTerm: string): Promise<Note[]> {
    const response = await apiClient.get<{ notes: Note[] }>('/notes/search', {
      params: {
        coupleId,
        q: searchTerm,
      },
    })
    return response.data.notes
  }

  async getSharedNotes(coupleId: string, limit = 20): Promise<Note[]> {
    const response = await apiClient.get<{ notes: Note[] }>('/notes/shared', {
      params: {
        coupleId,
        limit,
      },
    })
    return response.data.notes
  }

  async getPrivateNotes(userId: string, limit = 20): Promise<Note[]> {
    const response = await apiClient.get<{ notes: Note[] }>('/notes/private', {
      params: {
        userId,
        limit,
      },
    })
    return response.data.notes
  }

  async togglePrivacy(noteId: string): Promise<Note> {
    const response = await apiClient.post<{ note: Note }>(`/notes/${noteId}/toggle-privacy`)
    return response.data.note
  }

  async addTag(noteId: string, tag: string): Promise<Note> {
    const response = await apiClient.post<{ note: Note }>(`/notes/${noteId}/tags`, { tag })
    return response.data.note
  }

  async removeTag(noteId: string, tag: string): Promise<Note> {
    const response = await apiClient.delete<{ note: Note }>(`/notes/${noteId}/tags/${tag}`)
    return response.data.note
  }

  async getTags(coupleId: string): Promise<string[]> {
    const response = await apiClient.get<{ tags: string[] }>('/notes/tags', {
      params: { coupleId },
    })
    return response.data.tags
  }

  async getCategories(coupleId: string): Promise<string[]> {
    const response = await apiClient.get<{ categories: string[] }>('/notes/categories', {
      params: { coupleId },
    })
    return response.data.categories
  }
}

export default new NotesService()