import { BaseService } from './base.service'
import type { CheckIn, Note, ActionItem, Reminder, Milestone } from '@/types'

export interface DashboardStats {
  totalCheckIns: number
  currentStreak: number
  lastCheckIn?: Date
  completedActionItems: number
  totalActionItems: number
  upcomingReminders: number
  milestoneProgress: number
}

export interface ActivityItem {
  id: string
  type: 'checkin' | 'note' | 'action' | 'milestone' | 'reminder'
  title: string
  description?: string
  timestamp: Date
  metadata?: Record<string, any>
}

export interface DashboardData {
  stats: DashboardStats
  recentActivity: ActivityItem[]
  upcomingCheckIn?: CheckIn
  activeActionItems: ActionItem[]
  upcomingReminders: Reminder[]
  recentMilestones: Milestone[]
}

class DashboardService extends BaseService {
  private basePath = '/api/v1/dashboard'

  async getDashboardData(): Promise<DashboardData> {
    try {
      return await this.makeRequest<DashboardData>(`${this.basePath}`)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return this.getMockDashboardData()
      }
      throw error
    }
  }

  async getStats(): Promise<DashboardStats> {
    try {
      return await this.makeRequest<DashboardStats>(`${this.basePath}/stats`)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return this.getMockStats()
      }
      throw error
    }
  }

  async getRecentActivity(limit: number = 10): Promise<ActivityItem[]> {
    try {
      return await this.makeRequest<ActivityItem[]>(
        `${this.basePath}/activity?limit=${limit}`
      )
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return this.getMockRecentActivity(limit)
      }
      throw error
    }
  }

  async getUpcomingCheckIn(): Promise<CheckIn | null> {
    try {
      return await this.makeRequest<CheckIn | null>(`${this.basePath}/upcoming-checkin`)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return null
      }
      throw error
    }
  }

  async getActiveActionItems(): Promise<ActionItem[]> {
    try {
      return await this.makeRequest<ActionItem[]>(`${this.basePath}/action-items`)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return this.getMockActionItems()
      }
      throw error
    }
  }

  async getUpcomingReminders(): Promise<Reminder[]> {
    try {
      return await this.makeRequest<Reminder[]>(`${this.basePath}/reminders`)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return this.getMockReminders()
      }
      throw error
    }
  }

  // Mock data methods for development
  private getMockDashboardData(): DashboardData {
    return {
      stats: this.getMockStats(),
      recentActivity: this.getMockRecentActivity(5),
      upcomingCheckIn: undefined,
      activeActionItems: this.getMockActionItems(),
      upcomingReminders: this.getMockReminders(),
      recentMilestones: this.getMockMilestones()
    }
  }

  private getMockStats(): DashboardStats {
    return {
      totalCheckIns: 42,
      currentStreak: 7,
      lastCheckIn: new Date(Date.now() - 24 * 60 * 60 * 1000),
      completedActionItems: 18,
      totalActionItems: 25,
      upcomingReminders: 3,
      milestoneProgress: 0.65
    }
  }

  private getMockRecentActivity(limit: number): ActivityItem[] {
    const activities: ActivityItem[] = [
      {
        id: '1',
        type: 'checkin',
        title: 'Completed weekly check-in',
        description: 'Discussed communication and trust',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: '2',
        type: 'action',
        title: 'Action item completed',
        description: 'Plan weekend date night',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
      },
      {
        id: '3',
        type: 'milestone',
        title: 'New milestone achieved!',
        description: '7-day check-in streak',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
      },
      {
        id: '4',
        type: 'note',
        title: 'New shared note',
        description: 'Reflections on quality time',
        timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000)
      },
      {
        id: '5',
        type: 'reminder',
        title: 'Reminder set',
        description: 'Weekly check-in scheduled',
        timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000)
      }
    ]

    return activities.slice(0, limit)
  }

  private getMockActionItems(): ActionItem[] {
    return [
      {
        id: '1',
        title: 'Plan weekend date night',
        description: 'Research restaurants and make reservations',
        assignedTo: 'alex',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        priority: 'high',
        completed: false,
        checkInId: 'checkin-1',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
      },
      {
        id: '2',
        title: 'Schedule couples therapy session',
        description: 'Call to book next month appointment',
        assignedTo: 'jordan',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        priority: 'medium',
        completed: false,
        checkInId: 'checkin-1',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000)
      }
    ]
  }

  private getMockReminders(): Reminder[] {
    return [
      {
        id: '1',
        title: 'Weekly Check-In',
        message: 'Time for your weekly relationship check-in',
        category: 'check-in',
        frequency: 'weekly',
        scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000),
        notificationChannel: 'both',
        createdBy: 'system',
        isActive: true,
        isSnoozed: false,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      },
      {
        id: '2',
        title: 'Date Night Planning',
        message: 'Remember to plan this week&apos;s date night',
        category: 'custom',
        frequency: 'weekly',
        scheduledFor: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        notificationChannel: 'push',
        createdBy: 'alex',
        assignedTo: 'jordan',
        isActive: true,
        isSnoozed: false,
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
      }
    ]
  }

  private getMockMilestones(): Milestone[] {
    return [
      {
        id: '1',
        title: '7-Day Streak',
        description: 'Completed check-ins for 7 consecutive days',
        achievedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        icon: '🔥',
        category: 'consistency',
        coupleId: 'couple-1',
        achieved: true,
        points: 100,
        rarity: 'common'
      },
      {
        id: '2',
        title: 'Deep Conversation',
        description: 'Had a meaningful discussion about future goals',
        achievedAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
        icon: '💬',
        category: 'communication',
        coupleId: 'couple-1',
        achieved: true,
        points: 50,
        rarity: 'common'
      }
    ]
  }
}

export const dashboardService = new DashboardService()