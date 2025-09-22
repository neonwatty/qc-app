import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { coupleService } from '@/api'
import type { Couple } from '@/types'
import type { CreateCoupleRequest, InvitePartnerRequest } from '@/api'

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
export const createCouple = createAsyncThunk('couple/create', async (data: CreateCoupleRequest) => {
  const couple = await coupleService.createCouple(data)
  return couple
})

export const fetchCouple = createAsyncThunk('couple/fetchCouple', async (coupleId: string) => {
  const couple = await coupleService.getCouple(coupleId)
  return couple
})

export const invitePartner = createAsyncThunk(
  'couple/invitePartner',
  async ({ coupleId, data }: { coupleId: string; data: InvitePartnerRequest }) => {
    await coupleService.invitePartner(coupleId, data)
  }
)

export const acceptInvite = createAsyncThunk('couple/acceptInvite', async (inviteToken: string) => {
  const couple = await coupleService.acceptInvite(inviteToken)
  return couple
})

export const fetchStatistics = createAsyncThunk('couple/fetchStatistics', async (coupleId: string) => {
  const statistics = await coupleService.getStatistics(coupleId)
  return statistics
})

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
