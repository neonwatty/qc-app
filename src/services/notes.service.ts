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
}

export const notesService = new NotesService()