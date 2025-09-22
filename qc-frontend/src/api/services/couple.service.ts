import apiClient from '../client'
import type { Couple, User } from '@/types'

export interface CreateCoupleRequest {
  partnerEmail: string
  relationshipStartDate?: Date
}

export interface InvitePartnerRequest {
  email: string
  message?: string
}

export interface CoupleStatistics {
  totalCheckIns: number
  currentStreak: number
  longestStreak: number
  totalNotes: number
  completedActionItems: number
  totalActionItems: number
  lastCheckInDate?: Date
}

class CoupleService {
  async createCouple(data: CreateCoupleRequest): Promise<Couple> {
    const response = await apiClient.post<{ couple: Couple }>('/couples', data)
    return response.data.couple
  }

  async getCouple(coupleId: string): Promise<Couple> {
    const response = await apiClient.get<{ couple: Couple }>(`/couples/${coupleId}`)
    return response.data.couple
  }

  async updateCouple(coupleId: string, data: Partial<Couple>): Promise<Couple> {
    const response = await apiClient.patch<{ couple: Couple }>(`/couples/${coupleId}`, data)
    return response.data.couple
  }

  async deleteCouple(coupleId: string): Promise<void> {
    await apiClient.delete(`/couples/${coupleId}`)
  }

  async invitePartner(coupleId: string, data: InvitePartnerRequest): Promise<void> {
    await apiClient.post(`/couples/${coupleId}/invite`, data)
  }

  async acceptInvite(inviteToken: string): Promise<Couple> {
    const response = await apiClient.post<{ couple: Couple }>('/couples/accept-invite', {
      token: inviteToken,
    })
    return response.data.couple
  }

  async getStatistics(coupleId: string): Promise<CoupleStatistics> {
    const response = await apiClient.get<CoupleStatistics>(`/couples/${coupleId}/statistics`)
    return response.data
  }

  async getPartner(coupleId: string): Promise<User> {
    const response = await apiClient.get<{ partner: User }>(`/couples/${coupleId}/partner`)
    return response.data.partner
  }

  async updatePartnerStatus(coupleId: string, status: 'online' | 'offline' | 'away'): Promise<void> {
    await apiClient.post(`/couples/${coupleId}/status`, { status })
  }

  async getMilestones(coupleId: string): Promise<Array<{ date: Date; milestone: string; description: string }>> {
    const response = await apiClient.get<{
      milestones: Array<{ date: Date; milestone: string; description: string }>
    }>(`/couples/${coupleId}/milestones`)
    return response.data.milestones
  }
}

export default new CoupleService()