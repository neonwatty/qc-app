'use client'

import { storage } from './storage'
import { 
  mockUsers, 
  updatedMockCouple, 
  mockCheckIns, 
  mockNotes, 
  mockMilestones 
} from './mock-data'

export const initializeAppData = () => {
  try {
    // Check if data already exists
    const existingUser = storage.getCurrentUser()
    const existingCouple = storage.getCurrentCouple()
    
    // Only initialize if no data exists
    if (!existingUser || !existingCouple) {
      console.log('Initializing mock data...')
      
      // Set current user (Alex)
      storage.setCurrentUser(mockUsers[0])
      
      // Set current couple
      storage.setCurrentCouple(updatedMockCouple)
      
      // Initialize check-ins if none exist
      const existingCheckIns = storage.getCheckIns()
      if (existingCheckIns.length === 0) {
        mockCheckIns.forEach(checkIn => {
          storage.saveCheckIn(checkIn)
        })
        console.log(`Initialized ${mockCheckIns.length} mock check-ins`)
      }
      
      // Initialize notes if none exist
      const existingNotes = storage.getNotes()
      if (existingNotes.length === 0) {
        mockNotes.forEach(note => {
          storage.saveNote(note)
        })
        console.log(`Initialized ${mockNotes.length} mock notes`)
      }
      
      // Initialize milestones if none exist
      const existingMilestones = storage.getMilestones()
      if (existingMilestones.length === 0) {
        mockMilestones.forEach(milestone => {
          storage.saveMilestone(milestone)
        })
        console.log(`Initialized ${mockMilestones.length} mock milestones`)
      }
      
      console.log('Mock data initialization complete')
      return true
    } else {
      console.log('Data already exists, skipping initialization')
      return false
    }
  } catch (error) {
    console.error('Error initializing app data:', error)
    return false
  }
}

export const resetAppData = () => {
  try {
    console.log('Resetting all app data...')
    storage.clearAll()
    initializeAppData()
    console.log('App data reset complete')
    return true
  } catch (error) {
    console.error('Error resetting app data:', error)
    return false
  }
}

export const getDataSummary = () => {
  try {
    const user = storage.getCurrentUser()
    const couple = storage.getCurrentCouple()
    const checkIns = storage.getCheckIns()
    const notes = storage.getNotes()
    const milestones = storage.getMilestones()
    const activeCheckIn = storage.getActiveCheckIn()
    
    return {
      user: user ? { name: user.name, email: user.email } : null,
      couple: couple ? { name: couple.name, stats: couple.stats } : null,
      counts: {
        checkIns: checkIns.length,
        notes: notes.length,
        milestones: milestones.length
      },
      hasActiveCheckIn: !!activeCheckIn,
      storage: {
        keys: Object.keys(localStorage).filter(key => key.startsWith('qc_')),
        totalSize: JSON.stringify(localStorage).length
      }
    }
  } catch (error) {
    console.error('Error getting data summary:', error)
    return null
  }
}