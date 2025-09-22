import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { api } from '@services/api'

interface Partner {
  id: number
  name: string
  email: string
  role: 'partner1' | 'partner2'
  presence_status?: 'online' | 'offline' | 'idle' | 'away'
  last_seen_at?: string
}

interface Couple {
  id: number
  partner1: Partner
  partner2: Partner
  created_at: string
  updated_at: string
  settings?: Record<string, unknown>
  statistics?: {
    total_check_ins: number
    current_streak: number
    longest_streak: number
    total_notes: number
    completed_action_items: number
  }
}

interface CoupleState {
  couple: Couple | null
  isLoading: boolean
  error: string | null
}

const initialState: CoupleState = {
  couple: null,
  isLoading: false,
  error: null,
}

// Async thunks
export const fetchCouple = createAsyncThunk('couple/fetchCouple', async (coupleId: number) => {
  const response = await api.get(`/couples/${coupleId}`)
  return response.data
})

export const updateCoupleSettings = createAsyncThunk(
  'couple/updateSettings',
  async ({ coupleId, settings }: { coupleId: number; settings: Record<string, unknown> }) => {
    const response = await api.patch(`/couples/${coupleId}/settings`, { settings })
    return response.data
  }
)

const coupleSlice = createSlice({
  name: 'couple',
  initialState,
  reducers: {
    updatePartnerPresence: (
      state,
      action: PayloadAction<{ partnerId: number; status: string }>
    ) => {
      if (state.couple) {
        const { partnerId, status } = action.payload
        if (state.couple.partner1.id === partnerId) {
          state.couple.partner1.presence_status = status as 'online' | 'offline' | 'idle' | 'away'
        } else if (state.couple.partner2.id === partnerId) {
          state.couple.partner2.presence_status = status as 'online' | 'offline' | 'idle' | 'away'
        }
      }
    },
    updateStatistics: (
      state,
      action: PayloadAction<
        Partial<{
          total_check_ins: number
          current_streak: number
          longest_streak: number
          total_notes: number
          completed_action_items: number
        }>
      >
    ) => {
      if (state.couple && state.couple.statistics) {
        state.couple.statistics = {
          ...state.couple.statistics,
          ...action.payload,
        }
      }
    },
  },
  extraReducers: builder => {
    // Fetch couple
    builder
      .addCase(fetchCouple.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchCouple.fulfilled, (state, action) => {
        state.isLoading = false
        state.couple = action.payload
      })
      .addCase(fetchCouple.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to fetch couple data'
      })

    // Update settings
    builder.addCase(updateCoupleSettings.fulfilled, (state, action) => {
      if (state.couple) {
        state.couple.settings = action.payload.settings
      }
    })
  },
})

export const { updatePartnerPresence, updateStatistics } = coupleSlice.actions
export default coupleSlice.reducer
