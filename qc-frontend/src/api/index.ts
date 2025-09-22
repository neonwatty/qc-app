// Export all API services and utilities
export { default as apiClient, handleApiError } from './client'
export type { ApiError } from './client'

// Export all service instances
export { default as authService } from './services/auth.service'
export { default as coupleService } from './services/couple.service'
export { default as checkInService } from './services/checkin.service'
export { default as notesService } from './services/notes.service'
export { default as actionItemsService } from './services/actionItems.service'
export { default as milestonesService } from './services/milestones.service'

// Export service types
export type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RefreshTokenResponse,
} from './services/auth.service'

export type {
  CreateCoupleRequest,
  InvitePartnerRequest,
  CoupleStatistics,
} from './services/couple.service'

export type {
  CreateCheckInRequest,
  UpdateCheckInRequest,
  AddNoteRequest,
  AddActionItemRequest,
} from './services/checkin.service'

export type {
  CreateNoteRequest,
  UpdateNoteRequest,
  NotesFilter,
} from './services/notes.service'

export type {
  CreateActionItemRequest,
  UpdateActionItemRequest,
  ActionItemsFilter,
} from './services/actionItems.service'

export type {
  CreateMilestoneRequest,
  UpdateMilestoneRequest,
  MilestonesFilter,
} from './services/milestones.service'