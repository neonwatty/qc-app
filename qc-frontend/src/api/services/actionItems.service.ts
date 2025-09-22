import apiClient from '../client'
import type { ActionItem } from '@/types'

export interface CreateActionItemRequest {
  description: string
  assignedTo: string
  dueDate?: Date
  priority?: 'low' | 'medium' | 'high'
  category?: string
}

export interface UpdateActionItemRequest {
  description?: string
  assignedTo?: string
  dueDate?: Date
  priority?: 'low' | 'medium' | 'high'
  status?: 'pending' | 'in-progress' | 'completed' | 'cancelled'
  category?: string
}

export interface ActionItemsFilter {
  status?: 'pending' | 'in-progress' | 'completed' | 'cancelled'
  assignedTo?: string
  priority?: 'low' | 'medium' | 'high'
  category?: string
  dueBefore?: Date
  dueAfter?: Date
  limit?: number
  offset?: number
}

class ActionItemsService {
  async createActionItem(coupleId: string, data: CreateActionItemRequest): Promise<ActionItem> {
    const response = await apiClient.post<{ actionItem: ActionItem }>('/action-items', {
      ...data,
      coupleId,
    })
    return response.data.actionItem
  }

  async getActionItem(actionItemId: string): Promise<ActionItem> {
    const response = await apiClient.get<{ actionItem: ActionItem }>(`/action-items/${actionItemId}`)
    return response.data.actionItem
  }

  async updateActionItem(actionItemId: string, data: UpdateActionItemRequest): Promise<ActionItem> {
    const response = await apiClient.patch<{ actionItem: ActionItem }>(`/action-items/${actionItemId}`, data)
    return response.data.actionItem
  }

  async deleteActionItem(actionItemId: string): Promise<void> {
    await apiClient.delete(`/action-items/${actionItemId}`)
  }

  async getActionItems(coupleId: string, filter?: ActionItemsFilter): Promise<ActionItem[]> {
    const response = await apiClient.get<{ actionItems: ActionItem[] }>('/action-items', {
      params: {
        coupleId,
        ...filter,
      },
    })
    return response.data.actionItems
  }

  async completeActionItem(actionItemId: string): Promise<ActionItem> {
    const response = await apiClient.post<{ actionItem: ActionItem }>(`/action-items/${actionItemId}/complete`)
    return response.data.actionItem
  }

  async uncompleteActionItem(actionItemId: string): Promise<ActionItem> {
    const response = await apiClient.post<{ actionItem: ActionItem }>(`/action-items/${actionItemId}/uncomplete`)
    return response.data.actionItem
  }

  async assignActionItem(actionItemId: string, userId: string): Promise<ActionItem> {
    const response = await apiClient.post<{ actionItem: ActionItem }>(`/action-items/${actionItemId}/assign`, {
      userId,
    })
    return response.data.actionItem
  }

  async getMyActionItems(userId: string): Promise<ActionItem[]> {
    const response = await apiClient.get<{ actionItems: ActionItem[] }>('/action-items/my', {
      params: { userId },
    })
    return response.data.actionItems
  }

  async getOverdueActionItems(coupleId: string): Promise<ActionItem[]> {
    const response = await apiClient.get<{ actionItems: ActionItem[] }>('/action-items/overdue', {
      params: { coupleId },
    })
    return response.data.actionItems
  }

  async getUpcomingActionItems(coupleId: string, days = 7): Promise<ActionItem[]> {
    const response = await apiClient.get<{ actionItems: ActionItem[] }>('/action-items/upcoming', {
      params: {
        coupleId,
        days,
      },
    })
    return response.data.actionItems
  }

  async bulkUpdateStatus(
    actionItemIds: string[],
    status: 'pending' | 'in-progress' | 'completed' | 'cancelled'
  ): Promise<ActionItem[]> {
    const response = await apiClient.post<{ actionItems: ActionItem[] }>('/action-items/bulk-update', {
      ids: actionItemIds,
      status,
    })
    return response.data.actionItems
  }

  async getCategories(coupleId: string): Promise<string[]> {
    const response = await apiClient.get<{ categories: string[] }>('/action-items/categories', {
      params: { coupleId },
    })
    return response.data.categories
  }
}

export default new ActionItemsService()