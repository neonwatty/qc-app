import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { authService } from '@/api'
import type { User } from '@/types'
import type { LoginRequest, RegisterRequest } from '@/api'

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('auth_token'),
  refreshToken: localStorage.getItem('refresh_token'),
  isAuthenticated: false,
  isLoading: false,
  error: null,
}

// Async thunks
export const login = createAsyncThunk('auth/login', async (credentials: LoginRequest) => {
  const response = await authService.login(credentials)
  return response
})

export const register = createAsyncThunk('auth/register', async (data: RegisterRequest) => {
  const response = await authService.register(data)
  return response
})

export const logout = createAsyncThunk('auth/logout', async () => {
  await authService.logout()
  localStorage.removeItem('auth_token')
  localStorage.removeItem('refresh_token')
})

export const fetchCurrentUser = createAsyncThunk('auth/fetchCurrentUser', async () => {
  const user = await authService.getCurrentUser()
  return user
})

export const refreshTokens = createAsyncThunk('auth/refreshTokens', async (_, { getState }) => {
  const state = getState() as { auth: AuthState }
  const refreshToken = state.auth.refreshToken
  if (!refreshToken) {
    throw new Error('No refresh token available')
  }
  const response = await authService.refreshTokens(refreshToken)
  return response
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload
      localStorage.setItem('auth_token', action.payload)
    },
    clearAuth: state => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.error = null
      localStorage.removeItem('auth_token')
    },
  },
  extraReducers: builder => {
    // Login
    builder
      .addCase(login.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        state.token = action.payload.token
        state.refreshToken = action.payload.refreshToken
        localStorage.setItem('auth_token', action.payload.token)
        localStorage.setItem('refresh_token', action.payload.refreshToken)
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Login failed'
      })

    // Register
    builder
      .addCase(register.pending, state => {
        state.isLoading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.user = action.payload.user
        state.token = action.payload.token
        state.refreshToken = action.payload.refreshToken
        localStorage.setItem('auth_token', action.payload.token)
        localStorage.setItem('refresh_token', action.payload.refreshToken)
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.error.message || 'Registration failed'
      })

    // Logout
    builder.addCase(logout.fulfilled, state => {
      state.user = null
      state.token = null
      state.refreshToken = null
      state.isAuthenticated = false
    })

    // Fetch current user
    builder
      .addCase(fetchCurrentUser.pending, state => {
        state.isLoading = true
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.isAuthenticated = true
        state.user = action.payload
      })
      .addCase(fetchCurrentUser.rejected, state => {
        state.isLoading = false
        state.isAuthenticated = false
      })

    // Refresh tokens
    builder
      .addCase(refreshTokens.fulfilled, (state, action) => {
        state.token = action.payload.token
        state.refreshToken = action.payload.refreshToken
        localStorage.setItem('auth_token', action.payload.token)
        localStorage.setItem('refresh_token', action.payload.refreshToken)
      })
      .addCase(refreshTokens.rejected, state => {
        state.user = null
        state.token = null
        state.refreshToken = null
        state.isAuthenticated = false
        localStorage.removeItem('auth_token')
        localStorage.removeItem('refresh_token')
      })
  },
})

export const { setToken, clearAuth } = authSlice.actions
export default authSlice.reducer
