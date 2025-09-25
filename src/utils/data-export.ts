/**
 * Utility functions for exporting localStorage data to Rails-compatible JSON format
 */

import { storage } from '@/lib/storage'

export interface ExportData {
  users: any[]
  couple: any
  categories: any[]
  checkins: any[]
  milestones: any[]
  notes: any[]
  actionItems: any[]
  reminders: any[]
  metadata: {
    exported_at: string
    app_version: string
    export_version: string
  }
}

/**
 * Export all localStorage data in a format compatible with Rails import
 */
export function exportLocalStorageData(): ExportData {
  const exportData: ExportData = {
    users: [],
    couple: null,
    categories: [],
    checkins: [],
    milestones: [],
    notes: [],
    actionItems: [],
    reminders: [],
    metadata: {
      exported_at: new Date().toISOString(),
      app_version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      export_version: '1.0'
    }
  }

  try {
    // Export current user
    const currentUser = storage.getCurrentUser()
    if (currentUser) {
      exportData.users.push({
        id: currentUser.id,
        email: currentUser.email,
        name: currentUser.name,
        pronouns: (currentUser as any).pronouns,
        loveLanguages: (currentUser as any).loveLanguages,
        createdAt: currentUser.createdAt,
        updatedAt: currentUser.updatedAt
      })
    }

    // Export couple data
    const couple = storage.getCurrentCouple()
    if (couple) {
      exportData.couple = {
        id: couple.id,
        name: couple.name,
        anniversary: (couple as any).anniversary,
        createdAt: couple.createdAt,
        updatedAt: (couple as any).updatedAt
      }

      // Add partners to users if exists
      if (couple.partners && couple.partners.length > 1) {
        const partner = couple.partners.find(p => p.id !== currentUser?.id)
        if (partner) {
          exportData.users.push({
            id: partner.id,
            email: partner.email,
            name: partner.name,
            pronouns: (partner as any).pronouns,
            loveLanguages: (partner as any).loveLanguages,
            createdAt: partner.createdAt,
            updatedAt: partner.updatedAt
          })
        }
      }
    }

    // Export categories from localStorage if stored separately
    const categoriesData = localStorage.getItem('qc_categories')
    if (categoriesData) {
      try {
        const categories = JSON.parse(categoriesData)
        exportData.categories = Array.isArray(categories) ? categories : []
      } catch (e) {
        console.error('Failed to parse categories:', e)
      }
    }

    // Export check-ins with nested data
    const checkIns = storage.getCheckIns()
    exportData.checkins = checkIns.map(checkIn => ({
      id: checkIn.id,
      participants: checkIn.participants || [],
      startedAt: checkIn.startedAt || (checkIn as any).createdAt,
      completedAt: checkIn.completedAt,
      status: checkIn.status || 'completed',
      categories: checkIn.categories || [],
      moodBefore: checkIn.mood?.before,
      moodAfter: checkIn.mood?.after,
      reflection: checkIn.reflection,
      notes: checkIn.notes || [],
      actionItems: checkIn.actionItems || [],
      createdAt: (checkIn as any).createdAt
    }))

    // Export standalone notes
    const notes = storage.getNotes()
    exportData.notes = notes.map(note => ({
      id: note.id,
      content: note.content,
      privacyLevel: note.privacy || 'private',
      categoryId: note.categoryId,
      userId: note.authorId || currentUser?.id,
      checkInId: note.checkInId,
      sentimentScore: (note as any).sentimentScore,
      createdAt: note.createdAt
    }))

    // Export milestones
    const milestones = storage.getMilestones()
    exportData.milestones = milestones.map(milestone => ({
      id: milestone.id,
      title: milestone.title,
      description: milestone.description,
      achievedAt: milestone.achievedAt || (milestone as any).date,
      category: milestone.category || 'general',
      createdAt: (milestone as any).createdAt
    }))

    // Export action items from localStorage if stored separately
    const actionItemsData = localStorage.getItem('qc_action_items')
    if (actionItemsData) {
      try {
        const actionItems = JSON.parse(actionItemsData)
        exportData.actionItems = Array.isArray(actionItems) ? actionItems.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          assignedToId: item.assignedToId || item.assignedTo,
          dueDate: item.dueDate,
          completed: item.completed || false,
          completedAt: item.completedAt,
          priority: item.priority || 'medium',
          category: item.category,
          createdById: item.createdById || currentUser?.id,
          checkInId: item.checkInId,
          createdAt: item.createdAt
        })) : []
      } catch (e) {
        console.error('Failed to parse action items:', e)
      }
    }

    // Export reminders from localStorage if stored
    const remindersData = localStorage.getItem('qc_reminders')
    if (remindersData) {
      try {
        const reminders = JSON.parse(remindersData)
        exportData.reminders = Array.isArray(reminders) ? reminders.map(reminder => ({
          id: reminder.id,
          userId: reminder.userId || currentUser?.id,
          reminderType: reminder.type || reminder.reminderType || 'check_in',
          frequency: reminder.frequency || 'weekly',
          dayOfWeek: reminder.dayOfWeek,
          timeOfDay: reminder.timeOfDay || reminder.time,
          enabled: reminder.enabled !== false,
          message: reminder.message,
          createdAt: reminder.createdAt
        })) : []
      } catch (e) {
        console.error('Failed to parse reminders:', e)
      }
    }

  } catch (error) {
    console.error('Error exporting localStorage data:', error)
    throw error
  }

  return exportData
}

/**
 * Download exported data as JSON file
 */
export function downloadExportData(data: ExportData, filename?: string): void {
  const jsonStr = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = filename || `qc-export-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Export and download localStorage data
 */
export function exportAndDownload(filename?: string): void {
  try {
    const data = exportLocalStorageData()
    downloadExportData(data, filename)
    console.log('Data exported successfully')
  } catch (error) {
    console.error('Export failed:', error)
    throw error
  }
}

/**
 * Get export data as JSON string
 */
export function getExportDataAsJson(): string {
  const data = exportLocalStorageData()
  return JSON.stringify(data, null, 2)
}

/**
 * Validate export data structure
 */
export function validateExportData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!data || typeof data !== 'object') {
    errors.push('Data must be an object')
    return { valid: false, errors }
  }

  // Check for required top-level fields
  const requiredFields = ['users', 'couple', 'categories', 'checkins', 'milestones', 'notes']
  for (const field of requiredFields) {
    if (!(field in data)) {
      errors.push(`Missing required field: ${field}`)
    }
  }

  // Validate users
  if (data.users && !Array.isArray(data.users)) {
    errors.push('Users must be an array')
  } else if (data.users) {
    data.users.forEach((user: any, index: number) => {
      if (!user.email) {
        errors.push(`User ${index} missing email`)
      }
      if (!user.name) {
        errors.push(`User ${index} missing name`)
      }
    })
  }

  // Validate couple
  if (data.couple && typeof data.couple !== 'object') {
    errors.push('Couple must be an object')
  }

  // Validate arrays
  const arrayFields = ['categories', 'checkins', 'milestones', 'notes', 'actionItems', 'reminders']
  for (const field of arrayFields) {
    if (data[field] && !Array.isArray(data[field])) {
      errors.push(`${field} must be an array`)
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}