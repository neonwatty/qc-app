'use client'

import { useCallback, useMemo } from 'react'
import { useCheckInContext } from '@/contexts/CheckInContext'
import { ActionItem } from '@/types'

export function useActionItems() {
  const { 
    session, 
    addActionItem, 
    updateActionItem, 
    removeActionItem, 
    toggleActionItem 
  } = useCheckInContext()

  const actionItems = useMemo(() => {
    return session?.baseCheckIn?.actionItems || []
  }, [session])

  const completedCount = useMemo(() => {
    return actionItems.filter(item => item.completed).length
  }, [actionItems])

  const pendingCount = useMemo(() => {
    return actionItems.filter(item => !item.completed).length
  }, [actionItems])

  const overdueItems = useMemo(() => {
    const now = new Date()
    return actionItems.filter(item => {
      if (!item.dueDate || item.completed) return false
      return new Date(item.dueDate) < now
    })
  }, [actionItems])

  const upcomingItems = useMemo(() => {
    const now = new Date()
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    return actionItems.filter(item => {
      if (!item.dueDate || item.completed) return false
      const dueDate = new Date(item.dueDate)
      return dueDate >= now && dueDate <= nextWeek
    })
  }, [actionItems])

  const getItemsByAssignee = useCallback((assigneeId: string) => {
    return actionItems.filter(item => item.assignedTo === assigneeId)
  }, [actionItems])

  const getItemsByStatus = useCallback((completed: boolean) => {
    return actionItems.filter(item => item.completed === completed)
  }, [actionItems])

  const sortByDueDate = useCallback((items: ActionItem[]) => {
    return [...items].sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return 0
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    })
  }, [])

  const sortByPriority = useCallback((items: ActionItem[]) => {
    return [...items].sort((a, b) => {
      if (a.completed && !b.completed) return 1
      if (!a.completed && b.completed) return -1
      
      if (!a.dueDate && !b.dueDate) return 0
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    })
  }, [])

  const handleAddActionItem = useCallback((
    actionItem: Omit<ActionItem, 'id' | 'createdAt' | 'checkInId'>
  ) => {
    addActionItem(actionItem)
  }, [addActionItem])

  const handleUpdateActionItem = useCallback((
    actionItemId: string, 
    updates: Partial<ActionItem>
  ) => {
    updateActionItem(actionItemId, updates)
  }, [updateActionItem])

  const handleRemoveActionItem = useCallback((actionItemId: string) => {
    removeActionItem(actionItemId)
  }, [removeActionItem])

  const handleToggleActionItem = useCallback((actionItemId: string) => {
    toggleActionItem(actionItemId)
  }, [toggleActionItem])

  const handleCompleteAllItems = useCallback(() => {
    actionItems.forEach(item => {
      if (!item.completed) {
        toggleActionItem(item.id)
      }
    })
  }, [actionItems, toggleActionItem])

  const handleClearCompletedItems = useCallback(() => {
    actionItems.forEach(item => {
      if (item.completed) {
        removeActionItem(item.id)
      }
    })
  }, [actionItems, removeActionItem])

  return {
    actionItems,
    completedCount,
    pendingCount,
    overdueItems,
    upcomingItems,
    
    getItemsByAssignee,
    getItemsByStatus,
    sortByDueDate,
    sortByPriority,
    
    addActionItem: handleAddActionItem,
    updateActionItem: handleUpdateActionItem,
    removeActionItem: handleRemoveActionItem,
    toggleActionItem: handleToggleActionItem,
    completeAllItems: handleCompleteAllItems,
    clearCompletedItems: handleClearCompletedItems,
    
    hasActionItems: actionItems.length > 0,
    allCompleted: actionItems.length > 0 && completedCount === actionItems.length,
    hasOverdueItems: overdueItems.length > 0,
    hasUpcomingItems: upcomingItems.length > 0
  }
}