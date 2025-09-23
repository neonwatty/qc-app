/**
 * API Mocking Utilities for Testing
 * Provides mock API responses and request handlers for testing
 */

// Mock API base configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

// Mock fetch implementation
export const createMockFetch = () => {
  const mockResponses = new Map<string, any>()

  const mockFetch = jest.fn(async (url: string, options?: RequestInit) => {
    const method = options?.method || 'GET'
    const key = `${method}:${url}`

    if (mockResponses.has(key)) {
      const response = mockResponses.get(key)

      if (response instanceof Error) {
        throw response
      }

      return {
        ok: response.ok ?? true,
        status: response.status ?? 200,
        statusText: response.statusText ?? 'OK',
        json: async () => response.data,
        text: async () => JSON.stringify(response.data),
        headers: new Headers(response.headers || {}),
      }
    }

    // Default 404 response
    return {
      ok: false,
      status: 404,
      statusText: 'Not Found',
      json: async () => ({ error: 'Not Found' }),
      text: async () => 'Not Found',
      headers: new Headers(),
    }
  })

  const setMockResponse = (method: string, url: string, response: any) => {
    mockResponses.set(`${method}:${url}`, response)
  }

  const clearMocks = () => {
    mockResponses.clear()
    mockFetch.mockClear()
  }

  return {
    mockFetch,
    setMockResponse,
    clearMocks,
  }
}

// Mock API responses
export const mockApiResponses = {
  // Auth endpoints
  login: {
    success: {
      data: {
        user: {
          id: '1',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          role: 'user',
        },
        token: 'mock-jwt-token',
      },
    },
    error: {
      ok: false,
      status: 401,
      data: {
        error: 'Invalid credentials',
      },
    },
  },

  signup: {
    success: {
      data: {
        user: {
          id: '2',
          email: 'new@example.com',
          firstName: 'New',
          lastName: 'User',
        },
        message: 'Verification email sent',
      },
    },
    error: {
      ok: false,
      status: 422,
      data: {
        errors: {
          email: ['has already been taken'],
        },
      },
    },
  },

  // Session endpoints
  createSession: {
    success: {
      data: {
        session: {
          id: 'session-1',
          status: 'active',
          startedAt: new Date().toISOString(),
          categories: [],
          notes: [],
        },
      },
    },
    error: {
      ok: false,
      status: 400,
      data: {
        error: 'Session already in progress',
      },
    },
  },

  // Check-in endpoints
  checkIns: {
    list: {
      data: {
        checkIns: [
          {
            id: 'checkin-1',
            date: '2024-01-01',
            completed: true,
            categories: ['communication', 'intimacy'],
            mood: 8,
          },
          {
            id: 'checkin-2',
            date: '2024-01-02',
            completed: true,
            categories: ['finances'],
            mood: 7,
          },
        ],
        meta: {
          total: 2,
          page: 1,
          perPage: 10,
        },
      },
    },
  },

  // Notes endpoints
  notes: {
    create: {
      success: {
        data: {
          note: {
            id: 'note-1',
            content: 'Test note content',
            privacy: 'private',
            createdAt: new Date().toISOString(),
          },
        },
      },
    },
    list: {
      data: {
        notes: [
          {
            id: 'note-1',
            content: 'Private note',
            privacy: 'private',
            createdAt: '2024-01-01T10:00:00Z',
          },
          {
            id: 'note-2',
            content: 'Shared note',
            privacy: 'shared',
            createdAt: '2024-01-01T11:00:00Z',
          },
        ],
      },
    },
  },

  // Categories
  categories: {
    list: {
      data: {
        categories: [
          {
            id: 'cat-1',
            name: 'Communication',
            icon: 'message-circle',
            color: '#blue',
          },
          {
            id: 'cat-2',
            name: 'Intimacy',
            icon: 'heart',
            color: '#red',
          },
          {
            id: 'cat-3',
            name: 'Finances',
            icon: 'dollar-sign',
            color: '#green',
          },
        ],
      },
    },
  },

  // Notifications
  notifications: {
    list: {
      data: {
        notifications: [
          {
            id: 'notif-1',
            type: 'reminder',
            title: 'Check-in Reminder',
            message: 'Time for your weekly check-in',
            read: false,
            createdAt: new Date().toISOString(),
          },
        ],
      },
    },
  },
}

// Mock API client
export class MockApiClient {
  private mockFetch: ReturnType<typeof createMockFetch>

  constructor() {
    this.mockFetch = createMockFetch()
    global.fetch = this.mockFetch.mockFetch as any
  }

  // Setup common successful responses
  setupSuccessfulAuth() {
    this.mockFetch.setMockResponse('POST', `${API_BASE_URL}/auth/login`, mockApiResponses.login.success)
    this.mockFetch.setMockResponse('POST', `${API_BASE_URL}/auth/signup`, mockApiResponses.signup.success)
  }

  setupFailedAuth() {
    this.mockFetch.setMockResponse('POST', `${API_BASE_URL}/auth/login`, mockApiResponses.login.error)
    this.mockFetch.setMockResponse('POST', `${API_BASE_URL}/auth/signup`, mockApiResponses.signup.error)
  }

  setupSessionEndpoints() {
    this.mockFetch.setMockResponse('POST', `${API_BASE_URL}/sessions`, mockApiResponses.createSession.success)
    this.mockFetch.setMockResponse('GET', `${API_BASE_URL}/check-ins`, mockApiResponses.checkIns.list)
  }

  setupNotesEndpoints() {
    this.mockFetch.setMockResponse('GET', `${API_BASE_URL}/notes`, mockApiResponses.notes.list)
    this.mockFetch.setMockResponse('POST', `${API_BASE_URL}/notes`, mockApiResponses.notes.create.success)
  }

  // Custom response setter
  setCustomResponse(method: string, endpoint: string, response: any) {
    this.mockFetch.setMockResponse(method, `${API_BASE_URL}${endpoint}`, response)
  }

  // Simulate network error
  simulateNetworkError(endpoint: string) {
    this.mockFetch.setMockResponse('GET', `${API_BASE_URL}${endpoint}`, new Error('Network error'))
    this.mockFetch.setMockResponse('POST', `${API_BASE_URL}${endpoint}`, new Error('Network error'))
  }

  // Clear all mocks
  reset() {
    this.mockFetch.clearMocks()
  }

  // Get fetch spy for assertions
  getFetchSpy() {
    return this.mockFetch.mockFetch
  }
}

// Helper to wait for async API calls in tests
export const waitForApiCall = async () => {
  await new Promise(resolve => setTimeout(resolve, 0))
  await new Promise(resolve => process.nextTick(resolve))
}

// Mock error responses
export const mockErrorResponses = {
  unauthorized: {
    ok: false,
    status: 401,
    data: { error: 'Unauthorized' },
  },
  forbidden: {
    ok: false,
    status: 403,
    data: { error: 'Forbidden' },
  },
  notFound: {
    ok: false,
    status: 404,
    data: { error: 'Not found' },
  },
  serverError: {
    ok: false,
    status: 500,
    data: { error: 'Internal server error' },
  },
  validationError: {
    ok: false,
    status: 422,
    data: {
      errors: {
        field: ['is required'],
      },
    },
  },
}

// Export for use in tests
export default MockApiClient