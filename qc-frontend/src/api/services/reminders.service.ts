import apiClient from '../client'
import type { Reminder, RelationshipRequest } from '@/types'
import type {
  ApiResponse,
  PaginatedResponse,
  CreateReminderRequest,
  UpdateReminderRequest,
  ReminderFilter,
  BaseFilter
} from '../types'

interface RelationshipRequestFilter extends BaseFilter {
  category?: string
  status?: 'pending' | 'accepted' | 'declined' | 'converted'
  priority?: 'low' | 'medium' | 'high'
  requestedBy?: string
  requestedFor?: string
}

interface CreateRelationshipRequestData {
  title: string
  description: string
  category: string
  requestedFor: string
  priority?: 'low' | 'medium' | 'high'
  suggestedDate?: Date | string
  suggestedFrequency?: 'once' | 'recurring'
  tags?: string[]
}

class RemindersService {
  // Reminder CRUD operations
  async createReminder(data: CreateReminderRequest): Promise<Reminder> {
    const response = await apiClient.post<ApiResponse<Reminder>>('/reminders', data)
    return response.data.data
  }

  async getReminder(reminderId: string): Promise<Reminder> {
    const response = await apiClient.get<ApiResponse<Reminder>>(`/reminders/${reminderId}`)
    return response.data.data
  }

  async updateReminder(reminderId: string, data: UpdateReminderRequest): Promise<Reminder> {
    const response = await apiClient.patch<ApiResponse<Reminder>>(`/reminders/${reminderId}`, data)
    return response.data.data
  }

  async deleteReminder(reminderId: string): Promise<void> {
    await apiClient.delete(`/reminders/${reminderId}`)
  }

  async getReminders(filter?: ReminderFilter): Promise<PaginatedResponse<Reminder>> {
    const response = await apiClient.get<PaginatedResponse<Reminder>>('/reminders', {
      params: filter,
    })
    return response.data
  }

  // Get upcoming reminders for a user
  async getUpcomingReminders(userId: string, days = 7): Promise<Reminder[]> {
    const response = await apiClient.get<ApiResponse<Reminder[]>>(`/users/${userId}/reminders/upcoming`, {
      params: { days },
    })
    return response.data.data
  }

  // Snooze a reminder
  async snoozeReminder(reminderId: string, snoozeUntil: Date | string): Promise<Reminder> {
    const response = await apiClient.post<ApiResponse<Reminder>>(`/reminders/${reminderId}/snooze`, {
      snoozeUntil,
    })
    return response.data.data
  }

  // Mark reminder as completed
  async completeReminder(reminderId: string): Promise<Reminder> {
    const response = await apiClient.post<ApiResponse<Reminder>>(`/reminders/${reminderId}/complete`)
    return response.data.data
  }

  // Activate/Deactivate reminder
  async toggleReminder(reminderId: string): Promise<Reminder> {
    const response = await apiClient.post<ApiResponse<Reminder>>(`/reminders/${reminderId}/toggle`)
    return response.data.data
  }

  // Relationship Request operations
  async createRelationshipRequest(data: CreateRelationshipRequestData): Promise<RelationshipRequest> {
    const response = await apiClient.post<ApiResponse<RelationshipRequest>>('/relationship-requests', data)
    return response.data.data
  }

  async getRelationshipRequest(requestId: string): Promise<RelationshipRequest> {
    const response = await apiClient.get<ApiResponse<RelationshipRequest>>(`/relationship-requests/${requestId}`)
    return response.data.data
  }

  async getRelationshipRequests(filter?: RelationshipRequestFilter): Promise<PaginatedResponse<RelationshipRequest>> {
    const response = await apiClient.get<PaginatedResponse<RelationshipRequest>>('/relationship-requests', {
      params: filter,
    })
    return response.data
  }

  // Respond to a relationship request
  async respondToRequest(
    requestId: string,
    status: 'accepted' | 'declined',
    response?: string
  ): Promise<RelationshipRequest> {
    const responseData = await apiClient.post<ApiResponse<RelationshipRequest>>(
      `/relationship-requests/${requestId}/respond`,
      {
        status,
        response,
      }
    )
    return responseData.data.data
  }

  // Convert request to reminder
  async convertRequestToReminder(requestId: string, reminderData?: Partial<CreateReminderRequest>): Promise<Reminder> {
    const response = await apiClient.post<ApiResponse<Reminder>>(`/relationship-requests/${requestId}/convert`, {
      ...reminderData,
    })
    return response.data.data
  }

  // Batch operations
  async createBulkReminders(reminders: CreateReminderRequest[]): Promise<Reminder[]> {
    const response = await apiClient.post<ApiResponse<Reminder[]>>('/reminders/bulk', { reminders })
    return response.data.data
  }

  async updateBulkReminders(
    reminderIds: string[],
    updates: UpdateReminderRequest
  ): Promise<{ succeeded: string[]; failed: string[] }> {
    const response = await apiClient.patch<ApiResponse<{ succeeded: string[]; failed: string[] }>>(
      '/reminders/bulk',
      {
        ids: reminderIds,
        updates,
      }
    )
    return response.data.data
  }

  async deleteBulkReminders(reminderIds: string[]): Promise<{ succeeded: string[]; failed: string[] }> {
    const response = await apiClient.delete<ApiResponse<{ succeeded: string[]; failed: string[] }>>(
      '/reminders/bulk',
      {
        data: { ids: reminderIds },
      }
    )
    return response.data.data
  }

  // Get reminder templates
  async getReminderTemplates(category?: string): Promise<
    Array<{
      title: string
      message: string
      category: string
      frequency: string
      notificationChannel: string
    }>
  > {
    const response = await apiClient.get<
      ApiResponse<
        Array<{
          title: string
          message: string
          category: string
          frequency: string
          notificationChannel: string
        }>
      >
    >('/reminders/templates', {
      params: { category },
    })
    return response.data.data
  }

  // Get reminder statistics
  async getReminderStatistics(userId: string): Promise<{
    totalReminders: number
    activeReminders: number
    completedReminders: number
    snoozedReminders: number
    completionRate: number
    averageSnoozeTime: number
    mostCommonCategory: string
    upcomingThisWeek: number
  }> {
    const response = await apiClient.get<
      ApiResponse<{
        totalReminders: number
        activeReminders: number
        completedReminders: number
        snoozedReminders: number
        completionRate: number
        averageSnoozeTime: number
        mostCommonCategory: string
        upcomingThisWeek: number
      }>
    >(`/users/${userId}/reminders/statistics`)
    return response.data.data
  }

  // Smart reminder suggestions based on patterns
  async getSmartSuggestions(userId: string): Promise<
    Array<{
      title: string
      reason: string
      suggestedTime: Date
      category: string
      confidence: number
    }>
  > {
    const response = await apiClient.get<
      ApiResponse<
        Array<{
          title: string
          reason: string
          suggestedTime: Date
          category: string
          confidence: number
        }>
      >
    >(`/users/${userId}/reminders/suggestions`)
    return response.data.data
  }

  // Sync reminders with external calendar
  async syncWithCalendar(
    userId: string,
    provider: 'google' | 'apple' | 'outlook'
  ): Promise<{ synced: number; failed: number }> {
    const response = await apiClient.post<ApiResponse<{ synced: number; failed: number }>>(
      `/users/${userId}/reminders/sync`,
      { provider }
    )
    return response.data.data
  }

  // Export reminders
  async exportReminders(userId: string, format: 'ics' | 'csv' | 'json'): Promise<Blob> {
    const response = await apiClient.get(`/users/${userId}/reminders/export`, {
      params: { format },
      responseType: 'blob',
    })
    return response.data
  }

  // Import reminders
  async importReminders(userId: string, file: File, format: 'ics' | 'csv' | 'json'): Promise<{
    imported: number
    skipped: number
    errors: string[]
  }> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('format', format)

    const response = await apiClient.post<
      ApiResponse<{
        imported: number
        skipped: number
        errors: string[]
      }>
    >(`/users/${userId}/reminders/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data.data
  }
}

export default new RemindersService()