import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '@services/api'

interface Notification {
  id: number
  user_id: number
  notification_type: string
  title: string
  body: string
  action_type?: string
  action_id?: number
  read: boolean
  delivered: boolean
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  created_at: string
  read_at?: string
}

interface NotificationState {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  error: string | null
}

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null
}

// Async thunks
export const fetchNotifications = createAsyncThunk(
  'notification/fetchAll',
  async ({ limit = 50, unreadOnly = false }: { limit?: number; unreadOnly?: boolean }) => {
    const params = new URLSearchParams()
    params.append('limit', limit.toString())
    if (unreadOnly) params.append('unread_only', 'true')

    const response = await api.get(`/notifications?${params.toString()}`)
    return response.data
  }
)

export const markAsRead = createAsyncThunk(
  'notification/markAsRead',
  async (notificationId: number) => {
    const response = await api.patch(`/notifications/${notificationId}/read`)
    return response.data
  }
)

export const markAllAsRead = createAsyncThunk('notification/markAllAsRead', async () => {
  const response = await api.patch('/notifications/mark_all_read')
  return response.data
})

export const dismissNotification = createAsyncThunk(
  'notification/dismiss',
  async (notificationId: number) => {
    await api.delete(`/notifications/${notificationId}`)
    return notificationId
  }
)

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload)
      if (!action.payload.read) {
        state.unreadCount += 1
      }
    },
    updateNotification: (state, action: PayloadAction<Notification>) => {
      const index = state.notifications.findIndex(n => n.id === action.payload.id)
      if (index !== -1) {
        const wasUnread = !state.notifications[index].read
        const isNowRead = action.payload.read

        state.notifications[index] = action.payload

        if (wasUnread && isNowRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1)
        }
      }
    },
    clearNotifications: state => {
      state.notifications = []
      state.unreadCount = 0
    }
  },
  extraReducers: builder => {
    // Fetch notifications
    builder
      .addCase(fetchNotifications.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false
        state.notifications = action.payload.notifications
        state.unreadCount = action.payload.unread_count
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Failed to fetch notifications'
      })

    // Mark as read
    builder.addCase(markAsRead.fulfilled, (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload.id)
      if (notification && !notification.read) {
        notification.read = true
        notification.read_at = action.payload.read_at
        state.unreadCount = Math.max(0, state.unreadCount - 1)
      }
    })

    // Mark all as read
    builder.addCase(markAllAsRead.fulfilled, state => {
      state.notifications.forEach(n => {
        n.read = true
        n.read_at = new Date().toISOString()
      })
      state.unreadCount = 0
    })

    // Dismiss notification
    builder.addCase(dismissNotification.fulfilled, (state, action) => {
      const index = state.notifications.findIndex(n => n.id === action.payload)
      if (index !== -1) {
        if (!state.notifications[index].read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1)
        }
        state.notifications.splice(index, 1)
      }
    })
  }
})

export const { addNotification, updateNotification, clearNotifications } = notificationSlice.actions
export default notificationSlice.reducer
