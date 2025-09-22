import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { api } from '@services/api'

interface CheckInSession {
  id: number
  couple_id: number
  status: 'draft' | 'in_progress' | 'completed' | 'abandoned'
  started_at: string
  completed_at?: string
  current_step?: number
  categories?: string[]
  notes?: Array<{
    id: number
    content: string
    privacy_level: 'private' | 'shared'
    category?: string
  }>
  action_items?: Array<{
    id: number
    title: string
    assigned_to?: number
    due_date?: string
  }>
  partner1_presence?: boolean
  partner2_presence?: boolean
}

interface CheckInState {
  currentSession: CheckInSession | null
  recentSessions: CheckInSession[]
  isLoading: boolean
  error: string | null
  isSaving: boolean
}

const initialState: CheckInState = {
  currentSession: null,
  recentSessions: [],
  isLoading: false,
  error: null,
  isSaving: false,
}

// Async thunks
export const startCheckIn = createAsyncThunk('checkIn/start', async (coupleId: number) => {
  const response = await api.post<CheckInSession>('/check_ins', { couple_id: coupleId })
  return response.data as CheckInSession
})

export const updateCheckIn = createAsyncThunk(
  'checkIn/update',
  async ({ sessionId, data }: { sessionId: number; data: Partial<CheckInSession> }) => {
    const response = await api.patch<CheckInSession>(`/check_ins/${sessionId}`, data)
    return response.data as CheckInSession
  }
)

export const completeCheckIn = createAsyncThunk('checkIn/complete', async (sessionId: number) => {
  const response = await api.post<CheckInSession>(`/check_ins/${sessionId}/complete`)
  return response.data as CheckInSession
})

export const fetchRecentCheckIns = createAsyncThunk(
  'checkIn/fetchRecent',
  async (coupleId: number) => {
    const response = await api.get<CheckInSession[]>(`/couples/${coupleId}/check_ins?limit=10`)
    return response.data as CheckInSession[]
  }
)

const checkInSlice = createSlice({
  name: 'checkIn',
  initialState,
  reducers: {
    updateSession: (state, action: PayloadAction<Partial<CheckInSession>>) => {
      if (state.currentSession) {
        state.currentSession = { ...state.currentSession, ...action.payload }
      }
    },
    addNote: (
      state,
      action: PayloadAction<{
        id: number
        content: string
        privacy_level: 'private' | 'shared'
        category?: string
      }>
    ) => {
      if (state.currentSession) {
        state.currentSession.notes = [...(state.currentSession.notes || []), action.payload]
      }
    },
    addActionItem: (
      state,
      action: PayloadAction<{
        id: number
        title: string
        assigned_to?: number
        due_date?: string
      }>
    ) => {
      if (state.currentSession) {
        state.currentSession.action_items = [
          ...(state.currentSession.action_items || []),
          action.payload,
        ]
      }
    },
    clearSession: state => {
      state.currentSession = null
      state.error = null
    },
  },
  extraReducers: builder => {
    // Start check-in
    builder
      .addCase(startCheckIn.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(startCheckIn.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentSession = action.payload
      })
      .addCase(startCheckIn.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to start check-in'
      })

    // Update check-in
    builder
      .addCase(updateCheckIn.pending, state => {
        state.isSaving = true
      })
      .addCase(updateCheckIn.fulfilled, (state, action) => {
        state.isSaving = false
        state.currentSession = action.payload
      })
      .addCase(updateCheckIn.rejected, state => {
        state.isSaving = false
      })

    // Complete check-in
    builder.addCase(completeCheckIn.fulfilled, state => {
      if (state.currentSession) {
        state.currentSession.status = 'completed'
        state.currentSession.completed_at = new Date().toISOString()
      }
    })

    // Fetch recent check-ins
    builder.addCase(fetchRecentCheckIns.fulfilled, (state, action) => {
      state.recentSessions = action.payload
    })
  },
})

export const { updateSession, addNote, addActionItem, clearSession } = checkInSlice.actions
export default checkInSlice.reducer
