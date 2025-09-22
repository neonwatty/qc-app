export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  displayName: string
  avatarUrl?: string
  coupleId?: string
  partnerId?: string
  createdAt: Date
  updatedAt: Date
}

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterData {
  email: string
  password: string
  passwordConfirmation: string
  firstName: string
  lastName: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
  tokenType: string
}

export interface AuthResponse {
  user: AuthUser
  tokens: AuthTokens
}

export interface AuthError {
  message: string
  code?: string
  field?: string
}

export interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: AuthError | null
}

export interface PasswordResetRequest {
  email: string
}

export interface PasswordResetConfirm {
  token: string
  password: string
  passwordConfirmation: string
}

export interface PasswordChangeRequest {
  currentPassword: string
  newPassword: string
  passwordConfirmation: string
}