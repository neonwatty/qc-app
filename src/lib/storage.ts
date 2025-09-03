import { CheckIn, Note, User, Couple, Milestone } from '@/types'

const STORAGE_KEYS = {
  USER: 'qc_current_user',
  COUPLE: 'qc_current_couple',
  CHECKINS: 'qc_checkins',
  NOTES: 'qc_notes',
  MILESTONES: 'qc_milestones',
  ACTIVE_CHECKIN: 'qc_active_checkin'
} as const

export const storage = {
  // User management
  getCurrentUser: (): User | null => {
    if (typeof window === 'undefined') return null
    const data = localStorage.getItem(STORAGE_KEYS.USER)
    return data ? JSON.parse(data) : null
  },
  
  setCurrentUser: (user: User | null) => {
    if (typeof window === 'undefined') return
    if (user) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER)
    }
  },
  
  // Couple management
  getCurrentCouple: (): Couple | null => {
    if (typeof window === 'undefined') return null
    const data = localStorage.getItem(STORAGE_KEYS.COUPLE)
    return data ? JSON.parse(data) : null
  },
  
  setCurrentCouple: (couple: Couple | null) => {
    if (typeof window === 'undefined') return
    if (couple) {
      localStorage.setItem(STORAGE_KEYS.COUPLE, JSON.stringify(couple))
    } else {
      localStorage.removeItem(STORAGE_KEYS.COUPLE)
    }
  },
  
  // Check-in management
  getCheckIns: (): CheckIn[] => {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem(STORAGE_KEYS.CHECKINS)
    return data ? JSON.parse(data) : []
  },
  
  saveCheckIn: (checkIn: CheckIn) => {
    if (typeof window === 'undefined') return
    const checkIns = storage.getCheckIns()
    const index = checkIns.findIndex(c => c.id === checkIn.id)
    
    if (index >= 0) {
      checkIns[index] = checkIn
    } else {
      checkIns.push(checkIn)
    }
    
    localStorage.setItem(STORAGE_KEYS.CHECKINS, JSON.stringify(checkIns))
  },
  
  getActiveCheckIn: (): CheckIn | null => {
    if (typeof window === 'undefined') return null
    const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_CHECKIN)
    return data ? JSON.parse(data) : null
  },
  
  setActiveCheckIn: (checkIn: CheckIn | null) => {
    if (typeof window === 'undefined') return
    if (checkIn) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_CHECKIN, JSON.stringify(checkIn))
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_CHECKIN)
    }
  },
  
  // Notes management
  getNotes: (): Note[] => {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem(STORAGE_KEYS.NOTES)
    return data ? JSON.parse(data) : []
  },
  
  saveNote: (note: Note) => {
    if (typeof window === 'undefined') return
    const notes = storage.getNotes()
    const index = notes.findIndex(n => n.id === note.id)
    
    if (index >= 0) {
      notes[index] = note
    } else {
      notes.push(note)
    }
    
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes))
  },
  
  deleteNote: (noteId: string) => {
    if (typeof window === 'undefined') return
    const notes = storage.getNotes().filter(n => n.id !== noteId)
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes))
  },
  
  // Milestones management
  getMilestones: (): Milestone[] => {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem(STORAGE_KEYS.MILESTONES)
    return data ? JSON.parse(data) : []
  },
  
  saveMilestone: (milestone: Milestone) => {
    if (typeof window === 'undefined') return
    const milestones = storage.getMilestones()
    milestones.push(milestone)
    localStorage.setItem(STORAGE_KEYS.MILESTONES, JSON.stringify(milestones))
  },
  
  // Clear all data
  clearAll: () => {
    if (typeof window === 'undefined') return
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
  }
}