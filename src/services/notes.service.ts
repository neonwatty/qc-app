import { Note } from '@/types'
import { authService } from './auth.service'

export interface SearchNotesRequest {
  query: string
  privacy?: 'private' | 'shared' | 'draft'
  categoryId?: string
  tags?: string[]
  limit?: number
}

export interface RecentSearch {
  query: string
  timestamp: Date
  resultCount: number
}

class NotesService {
  private readonly basePath = '/api/notes'

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

  async searchNotes(request: SearchNotesRequest): Promise<Note[]> {
    try {
      const params = new URLSearchParams()
      params.append('query', request.query)
      if (request.privacy) params.append('privacy', request.privacy)
      if (request.categoryId) params.append('categoryId', request.categoryId)
      if (request.tags) request.tags.forEach(tag => params.append('tags[]', tag))
      if (request.limit) params.append('limit', request.limit.toString())

      return await this.makeRequest<Note[]>(`${this.basePath}/search?${params}`)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return this.mockSearchNotes(request)
      }
      throw error
    }
  }

  async getRecentSearches(): Promise<RecentSearch[]> {
    try {
      return await this.makeRequest<RecentSearch[]>(`${this.basePath}/recent-searches`)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return this.mockGetRecentSearches()
      }
      throw error
    }
  }

  async saveRecentSearch(query: string, resultCount: number): Promise<void> {
    try {
      await this.makeRequest<void>(`${this.basePath}/recent-searches`, {
        method: 'POST',
        body: JSON.stringify({ query, resultCount })
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        this.mockSaveRecentSearch(query, resultCount)
        return
      }
      throw error
    }
  }

  async clearRecentSearches(): Promise<void> {
    try {
      await this.makeRequest<void>(`${this.basePath}/recent-searches`, {
        method: 'DELETE'
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        this.mockClearRecentSearches()
        return
      }
      throw error
    }
  }

  // CRUD Operations
  async getNotes(filters?: {
    privacy?: 'private' | 'shared' | 'draft'
    categoryId?: string
    tags?: string[]
    limit?: number
    offset?: number
  }): Promise<Note[]> {
    try {
      const params = new URLSearchParams()
      if (filters?.privacy) params.append('privacy', filters.privacy)
      if (filters?.categoryId) params.append('categoryId', filters.categoryId)
      if (filters?.tags) filters.tags.forEach(tag => params.append('tags[]', tag))
      if (filters?.limit) params.append('limit', filters.limit.toString())
      if (filters?.offset) params.append('offset', filters.offset.toString())

      const queryString = params.toString()
      const url = queryString ? `${this.basePath}?${queryString}` : this.basePath
      return await this.makeRequest<Note[]>(url)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return this.mockGetNotes(filters)
      }
      throw error
    }
  }

  async getNote(id: string): Promise<Note> {
    try {
      return await this.makeRequest<Note>(`${this.basePath}/${id}`)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return this.mockGetNote(id)
      }
      throw error
    }
  }

  async createNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> {
    try {
      return await this.makeRequest<Note>(this.basePath, {
        method: 'POST',
        body: JSON.stringify(note)
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return this.mockCreateNote(note)
      }
      throw error
    }
  }

  async updateNote(id: string, updates: Partial<Omit<Note, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Note> {
    try {
      return await this.makeRequest<Note>(`${this.basePath}/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates)
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return this.mockUpdateNote(id, updates)
      }
      throw error
    }
  }

  async deleteNote(id: string): Promise<void> {
    try {
      await this.makeRequest<void>(`${this.basePath}/${id}`, {
        method: 'DELETE'
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        this.mockDeleteNote(id)
        return
      }
      throw error
    }
  }

  async bulkUpdateNotes(ids: string[], updates: Partial<Omit<Note, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Note[]> {
    try {
      return await this.makeRequest<Note[]>(`${this.basePath}/bulk-update`, {
        method: 'PATCH',
        body: JSON.stringify({ ids, updates })
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return this.mockBulkUpdateNotes(ids, updates)
      }
      throw error
    }
  }

  async bulkDeleteNotes(ids: string[]): Promise<void> {
    try {
      await this.makeRequest<void>(`${this.basePath}/bulk-delete`, {
        method: 'DELETE',
        body: JSON.stringify({ ids })
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        this.mockBulkDeleteNotes(ids)
        return
      }
      throw error
    }
  }

  // Mock implementations for development
  private mockSearchNotes(request: SearchNotesRequest): Note[] {
    const stored = localStorage.getItem('qc_notes')
    if (!stored) return []

    const notes: Note[] = JSON.parse(stored)

    return notes.filter(note => {
      // Filter by query
      if (request.query && !note.content.toLowerCase().includes(request.query.toLowerCase())) {
        return false
      }

      // Filter by privacy
      if (request.privacy && note.privacy !== request.privacy) {
        return false
      }

      // Filter by category
      if (request.categoryId && note.categoryId !== request.categoryId) {
        return false
      }

      // Filter by tags
      if (request.tags && request.tags.length > 0) {
        if (!note.tags || !request.tags.some(tag => note.tags?.includes(tag))) {
          return false
        }
      }

      return true
    }).slice(0, request.limit || 20)
  }

  private mockGetRecentSearches(): RecentSearch[] {
    const stored = localStorage.getItem('notes-recent-searches')
    if (!stored) return []

    try {
      const searches = JSON.parse(stored)
      return searches.map((search: any) => ({
        ...search,
        timestamp: new Date(search.timestamp)
      }))
    } catch {
      return []
    }
  }

  private mockSaveRecentSearch(query: string, resultCount: number): void {
    const stored = localStorage.getItem('notes-recent-searches')
    let searches: RecentSearch[] = []

    if (stored) {
      try {
        searches = JSON.parse(stored)
      } catch {
        searches = []
      }
    }

    // Add new search at the beginning
    searches.unshift({
      query,
      resultCount,
      timestamp: new Date()
    })

    // Keep only last 10 searches
    searches = searches.slice(0, 10)

    localStorage.setItem('notes-recent-searches', JSON.stringify(searches))
  }

  private mockClearRecentSearches(): void {
    localStorage.removeItem('notes-recent-searches')
  }

  private mockGetNotes(filters?: any): Note[] {
    const stored = localStorage.getItem('qc_notes')
    if (!stored) return []

    let notes: Note[] = JSON.parse(stored)

    if (filters?.privacy) {
      notes = notes.filter(n => n.privacy === filters.privacy)
    }
    if (filters?.categoryId) {
      notes = notes.filter(n => n.categoryId === filters.categoryId)
    }
    if (filters?.tags && filters.tags.length > 0) {
      notes = notes.filter(n => n.tags?.some(tag => filters.tags.includes(tag)))
    }

    const offset = filters?.offset || 0
    const limit = filters?.limit || notes.length
    return notes.slice(offset, offset + limit)
  }

  private mockGetNote(id: string): Note {
    const stored = localStorage.getItem('qc_notes')
    if (!stored) throw new Error('Note not found')

    const notes: Note[] = JSON.parse(stored)
    const note = notes.find(n => n.id === id)
    if (!note) throw new Error('Note not found')

    return note
  }

  private mockCreateNote(noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Note {
    const stored = localStorage.getItem('qc_notes')
    const notes: Note[] = stored ? JSON.parse(stored) : []

    const newNote: Note = {
      ...noteData,
      id: `note-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    notes.push(newNote)
    localStorage.setItem('qc_notes', JSON.stringify(notes))

    return newNote
  }

  private mockUpdateNote(id: string, updates: Partial<Omit<Note, 'id' | 'createdAt' | 'updatedAt'>>): Note {
    const stored = localStorage.getItem('qc_notes')
    if (!stored) throw new Error('Note not found')

    const notes: Note[] = JSON.parse(stored)
    const index = notes.findIndex(n => n.id === id)
    if (index === -1) throw new Error('Note not found')

    notes[index] = {
      ...notes[index],
      ...updates,
      updatedAt: new Date()
    }

    localStorage.setItem('qc_notes', JSON.stringify(notes))
    return notes[index]
  }

  private mockDeleteNote(id: string): void {
    const stored = localStorage.getItem('qc_notes')
    if (!stored) return

    const notes: Note[] = JSON.parse(stored)
    const filtered = notes.filter(n => n.id !== id)
    localStorage.setItem('qc_notes', JSON.stringify(filtered))
  }

  private mockBulkUpdateNotes(ids: string[], updates: Partial<Omit<Note, 'id' | 'createdAt' | 'updatedAt'>>): Note[] {
    const stored = localStorage.getItem('qc_notes')
    if (!stored) return []

    const notes: Note[] = JSON.parse(stored)
    const updatedNotes: Note[] = []

    notes.forEach((note, index) => {
      if (ids.includes(note.id)) {
        notes[index] = {
          ...note,
          ...updates,
          updatedAt: new Date()
        }
        updatedNotes.push(notes[index])
      }
    })

    localStorage.setItem('qc_notes', JSON.stringify(notes))
    return updatedNotes
  }

  private mockBulkDeleteNotes(ids: string[]): void {
    const stored = localStorage.getItem('qc_notes')
    if (!stored) return

    const notes: Note[] = JSON.parse(stored)
    const filtered = notes.filter(n => !ids.includes(n.id))
    localStorage.setItem('qc_notes', JSON.stringify(filtered))
  }
}

export const notesService = new NotesService()