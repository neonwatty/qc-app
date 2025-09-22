import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { checkInService } from '@/api'
import type { CheckIn } from '@/types'
import type { CreateCheckInRequest, UpdateCheckInRequest, AddNoteRequest, AddActionItemRequest } from '@/api'

interface CheckInState {
  currentCheckIn: CheckIn | null
  checkInHistory: CheckIn[]
  categories: string[]
  prompts: Record<string, string[]>
  isLoading: boolean
  error: string | null
  isSaving: boolean
}

const initialState: CheckInState = {
  currentCheckIn: null,
  checkInHistory: [],
  categories: [],
  prompts: {},
  isLoading: false,
  error: null,
  isSaving: false,
}

// Async thunks
export const createCheckIn = createAsyncThunk('checkIn/create', async (data: CreateCheckInRequest) => {
  const checkIn = await checkInService.createCheckIn(data)
  return checkIn
})

export const fetchCheckIn = createAsyncThunk('checkIn/fetch', async (checkInId: string) => {
  const checkIn = await checkInService.getCheckIn(checkInId)
  return checkIn
})

export const updateCheckIn = createAsyncThunk(
  'checkIn/update',
  async ({ id, updates }: { id: string; updates: UpdateCheckInRequest }) => {
    const checkIn = await checkInService.updateCheckIn(id, updates)
    return checkIn
  }
)

export const completeCheckIn = createAsyncThunk('checkIn/complete', async (checkInId: string) => {
  const checkIn = await checkInService.completeCheckIn(checkInId)
  return checkIn
})

export const abandonCheckIn = createAsyncThunk('checkIn/abandon', async (checkInId: string) => {
  await checkInService.abandonCheckIn(checkInId)
  return checkInId
})

export const fetchCurrentCheckIn = createAsyncThunk('checkIn/fetchCurrent', async (coupleId: string) => {
  const checkIn = await checkInService.getCurrentCheckIn(coupleId)
  return checkIn
})

export const fetchCheckInHistory = createAsyncThunk(
  'checkIn/fetchHistory',
  async ({ coupleId, limit = 10, offset = 0 }: { coupleId: string; limit?: number; offset?: number }) => {
    const checkIns = await checkInService.getCheckInHistory(coupleId, limit, offset)
    return checkIns
  }
)

export const addNoteToCheckIn = createAsyncThunk(
  'checkIn/addNote',
  async ({ checkInId, data }: { checkInId: string; data: AddNoteRequest }) => {
    const note = await checkInService.addNote(checkInId, data)
    return note
  }
)

export const addActionItemToCheckIn = createAsyncThunk(
  'checkIn/addActionItem',
  async ({ checkInId, data }: { checkInId: string; data: AddActionItemRequest }) => {
    const actionItem = await checkInService.addActionItem(checkInId, data)
    return actionItem
  }
)

export const fetchCategories = createAsyncThunk('checkIn/fetchCategories', async () => {
  const categories = await checkInService.getCategories()
  return categories
})

export const fetchPrompts = createAsyncThunk('checkIn/fetchPrompts', async (category: string) => {
  const prompts = await checkInService.getPrompts(category)
  return { category, prompts }
})

const checkInSlice = createSlice({
  name: 'checkIn',
  initialState,
  reducers: {
    clearCurrentCheckIn: state => {
      state.currentCheckIn = null
      state.error = null
    },
    updateLocalCheckIn: (state, action: PayloadAction<Partial<CheckIn>>) => {
      if (state.currentCheckIn) {
        state.currentCheckIn = { ...state.currentCheckIn, ...action.payload }
      }
    },
  },
  extraReducers: builder => {
    // Create check-in
    builder
      .addCase(createCheckIn.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createCheckIn.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentCheckIn = action.payload
      })
      .addCase(createCheckIn.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to create check-in'
      })

    // Fetch check-in
    builder
      .addCase(fetchCheckIn.pending, state => {
        state.isLoading = true
      })
      .addCase(fetchCheckIn.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentCheckIn = action.payload
      })
      .addCase(fetchCheckIn.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to fetch check-in'
      })

    // Update check-in
    builder
      .addCase(updateCheckIn.pending, state => {
        state.isSaving = true
      })
      .addCase(updateCheckIn.fulfilled, (state, action) => {
        state.isSaving = false
        state.currentCheckIn = action.payload
      })
      .addCase(updateCheckIn.rejected, state => {
        state.isSaving = false
      })

    // Complete check-in
    builder.addCase(completeCheckIn.fulfilled, (state, action) => {
      state.currentCheckIn = action.payload
    })

    // Abandon check-in
    builder.addCase(abandonCheckIn.fulfilled, state => {
      state.currentCheckIn = null
    })

    // Fetch current check-in
    builder.addCase(fetchCurrentCheckIn.fulfilled, (state, action) => {
      state.currentCheckIn = action.payload
    })

    // Fetch check-in history
    builder.addCase(fetchCheckInHistory.fulfilled, (state, action) => {
      state.checkInHistory = action.payload
    })

    // Add note
    builder.addCase(addNoteToCheckIn.fulfilled, (state, action) => {
      if (state.currentCheckIn) {
        state.currentCheckIn.notes = [...(state.currentCheckIn.notes || []), action.payload]
      }
    })

    // Add action item
    builder.addCase(addActionItemToCheckIn.fulfilled, (state, action) => {
      if (state.currentCheckIn) {
        state.currentCheckIn.actionItems = [...(state.currentCheckIn.actionItems || []), action.payload]
      }
    })

    // Fetch categories
    builder.addCase(fetchCategories.fulfilled, (state, action) => {
      state.categories = action.payload
    })

    // Fetch prompts
    builder.addCase(fetchPrompts.fulfilled, (state, action) => {
      state.prompts[action.payload.category] = action.payload.prompts
    })
  },
})

export const { clearCurrentCheckIn, updateLocalCheckIn } = checkInSlice.actions
export default checkInSlice.reducer