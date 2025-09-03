/**
 * Demo reset functionality for QC relationship check-in app
 * Provides utilities to reset demo data and restore initial state
 */

import { storage } from './storage'
import { 
  mockCheckIns, 
  mockNotes, 
  mockMilestones,
  mockUsers,
  mockCouple
} from './mock-data'

/**
 * Reset all demo data to initial state
 */
export const resetDemoData = () => {
  try {
    // Clear all existing data
    storage.clearAll()
    
    // Restore initial demo user and couple
    storage.setCurrentUser(mockUsers[0]) // Use first user from mockUsers array
    storage.setCurrentCouple(mockCouple)
    
    // Restore initial check-ins
    mockCheckIns.forEach(checkIn => {
      storage.saveCheckIn(checkIn)
    })
    
    // Restore initial notes
    mockNotes.forEach(note => {
      storage.saveNote(note)
    })
    
    // Restore initial milestones
    mockMilestones.forEach(milestone => {
      storage.saveMilestone(milestone)
    })
    
    return {
      success: true,
      message: 'Demo data reset successfully'
    }
  } catch (error) {
    console.error('Error resetting demo data:', error)
    return {
      success: false,
      message: 'Failed to reset demo data',
      error
    }
  }
}

/**
 * Clear all data without restoring demo data
 */
export const clearAllData = () => {
  try {
    storage.clearAll()
    return {
      success: true,
      message: 'All data cleared successfully'
    }
  } catch (error) {
    console.error('Error clearing data:', error)
    return {
      success: false,
      message: 'Failed to clear data',
      error
    }
  }
}

/**
 * Check if demo data exists
 */
export const hasDemoData = (): boolean => {
  const user = storage.getCurrentUser()
  const couple = storage.getCurrentCouple()
  const checkIns = storage.getCheckIns()
  const notes = storage.getNotes()
  const milestones = storage.getMilestones()
  
  return !!(user || couple || checkIns.length || notes.length || milestones.length)
}

/**
 * Export current data for backup
 */
export const exportData = () => {
  return {
    user: storage.getCurrentUser(),
    couple: storage.getCurrentCouple(),
    checkIns: storage.getCheckIns(),
    notes: storage.getNotes(),
    milestones: storage.getMilestones(),
    exportedAt: new Date().toISOString()
  }
}

/**
 * Import data from backup
 */
export const importData = (data: ReturnType<typeof exportData>) => {
  try {
    // Clear existing data first
    storage.clearAll()
    
    // Restore user and couple
    if (data.user) storage.setCurrentUser(data.user)
    if (data.couple) storage.setCurrentCouple(data.couple)
    
    // Restore check-ins
    data.checkIns?.forEach(checkIn => {
      storage.saveCheckIn(checkIn)
    })
    
    // Restore notes
    data.notes?.forEach(note => {
      storage.saveNote(note)
    })
    
    // Restore milestones
    data.milestones?.forEach(milestone => {
      storage.saveMilestone(milestone)
    })
    
    return {
      success: true,
      message: 'Data imported successfully'
    }
  } catch (error) {
    console.error('Error importing data:', error)
    return {
      success: false,
      message: 'Failed to import data',
      error
    }
  }
}

/**
 * Get demo statistics
 */
export const getDemoStats = () => {
  const checkIns = storage.getCheckIns()
  const notes = storage.getNotes()
  const milestones = storage.getMilestones()
  const user = storage.getCurrentUser()
  const couple = storage.getCurrentCouple()
  
  return {
    hasUser: !!user,
    hasCouple: !!couple,
    checkInsCount: checkIns.length,
    completedCheckIns: checkIns.filter(c => c.status === 'completed').length,
    notesCount: notes.length,
    privateNotes: notes.filter(n => n.privacy === 'private').length,
    sharedNotes: notes.filter(n => n.privacy === 'shared').length,
    milestonesCount: milestones.length,
    dataSize: JSON.stringify(exportData()).length
  }
}