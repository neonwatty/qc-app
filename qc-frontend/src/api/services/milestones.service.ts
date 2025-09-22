import apiClient from '../client'
import type { Milestone } from '@/types'

export interface CreateMilestoneRequest {
  title: string
  description: string
  date: Date
  category?: string
  icon?: string
}

export interface UpdateMilestoneRequest {
  title?: string
  description?: string
  date?: Date
  category?: string
  icon?: string
}

export interface MilestonesFilter {
  category?: string
  startDate?: Date
  endDate?: Date
  limit?: number
  offset?: number
}

class MilestonesService {
  async createMilestone(coupleId: string, data: CreateMilestoneRequest): Promise<Milestone> {
    const response = await apiClient.post<{ milestone: Milestone }>('/milestones', {
      ...data,
      coupleId,
    })
    return response.data.milestone
  }

  async getMilestone(milestoneId: string): Promise<Milestone> {
    const response = await apiClient.get<{ milestone: Milestone }>(`/milestones/${milestoneId}`)
    return response.data.milestone
  }

  async updateMilestone(milestoneId: string, data: UpdateMilestoneRequest): Promise<Milestone> {
    const response = await apiClient.patch<{ milestone: Milestone }>(`/milestones/${milestoneId}`, data)
    return response.data.milestone
  }

  async deleteMilestone(milestoneId: string): Promise<void> {
    await apiClient.delete(`/milestones/${milestoneId}`)
  }

  async getMilestones(coupleId: string, filter?: MilestonesFilter): Promise<Milestone[]> {
    const response = await apiClient.get<{ milestones: Milestone[] }>('/milestones', {
      params: {
        coupleId,
        ...filter,
      },
    })
    return response.data.milestones
  }

  async getRecentMilestones(coupleId: string, limit = 5): Promise<Milestone[]> {
    const response = await apiClient.get<{ milestones: Milestone[] }>('/milestones/recent', {
      params: {
        coupleId,
        limit,
      },
    })
    return response.data.milestones
  }

  async getUpcomingMilestones(coupleId: string): Promise<Milestone[]> {
    const response = await apiClient.get<{ milestones: Milestone[] }>('/milestones/upcoming', {
      params: { coupleId },
    })
    return response.data.milestones
  }

  async celebrateMilestone(milestoneId: string): Promise<Milestone> {
    const response = await apiClient.post<{ milestone: Milestone }>(`/milestones/${milestoneId}/celebrate`)
    return response.data.milestone
  }

  async getCategories(coupleId: string): Promise<string[]> {
    const response = await apiClient.get<{ categories: string[] }>('/milestones/categories', {
      params: { coupleId },
    })
    return response.data.categories
  }

  async generateSuggestedMilestones(coupleId: string): Promise<Milestone[]> {
    const response = await apiClient.get<{ milestones: Milestone[] }>('/milestones/suggestions', {
      params: { coupleId },
    })
    return response.data.milestones
  }
}

export default new MilestonesService()