'use client'

import React, { useState } from 'react'
import { Plus, Trash2, Check, Calendar, User, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TouchButton } from '@/components/ui/TouchButton'
import { Card } from '@/components/ui/card'
import { MobileInput } from '@/components/ui/MobileInput'
import { MotionBox, StaggerContainer, StaggerItem } from '@/components/ui/motion'
import { ActionItem } from '@/types'
import { format } from 'date-fns'

interface ActionItemsProps {
  actionItems: ActionItem[]
  onAddActionItem: (actionItem: Omit<ActionItem, 'id' | 'createdAt' | 'checkInId'>) => void
  onUpdateActionItem: (actionItemId: string, updates: Partial<ActionItem>) => void
  onRemoveActionItem: (actionItemId: string) => void
  onToggleActionItem: (actionItemId: string) => void
  partners?: Array<{ id: string; name: string }>
  onNext?: () => void
  onBack?: () => void
}

export function ActionItems({
  actionItems = [],
  onAddActionItem,
  onUpdateActionItem,
  onRemoveActionItem,
  onToggleActionItem,
  partners = [
    { id: 'demo-user-1', name: 'Partner 1' },
    { id: 'demo-user-2', name: 'Partner 2' }
  ],
  onNext,
  onBack
}: ActionItemsProps) {
  const [newItemTitle, setNewItemTitle] = useState('')
  const [newItemDescription, setNewItemDescription] = useState('')
  const [selectedAssignee, setSelectedAssignee] = useState<string>('')
  const [selectedDueDate, setSelectedDueDate] = useState<string>('')
  const [isAddingItem, setIsAddingItem] = useState(false)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)

  const handleAddItem = () => {
    if (newItemTitle.trim()) {
      onAddActionItem({
        title: newItemTitle.trim(),
        description: newItemDescription.trim() || undefined,
        assignedTo: selectedAssignee || undefined,
        dueDate: selectedDueDate ? new Date(selectedDueDate) : undefined,
        completed: false
      })
      
      setNewItemTitle('')
      setNewItemDescription('')
      setSelectedAssignee('')
      setSelectedDueDate('')
      setIsAddingItem(false)
    }
  }

  const handleToggleComplete = (itemId: string) => {
    onToggleActionItem(itemId)
  }

  const handleEditItem = (item: ActionItem) => {
    setEditingItemId(item.id)
    setNewItemTitle(item.title)
    setNewItemDescription(item.description || '')
    setSelectedAssignee(item.assignedTo || '')
    setSelectedDueDate(item.dueDate ? format(item.dueDate, 'yyyy-MM-dd') : '')
    setIsAddingItem(true)
  }

  const handleUpdateItem = () => {
    if (editingItemId && newItemTitle.trim()) {
      onUpdateActionItem(editingItemId, {
        title: newItemTitle.trim(),
        description: newItemDescription.trim() || undefined,
        assignedTo: selectedAssignee || undefined,
        dueDate: selectedDueDate ? new Date(selectedDueDate) : undefined
      })
      
      setNewItemTitle('')
      setNewItemDescription('')
      setSelectedAssignee('')
      setSelectedDueDate('')
      setIsAddingItem(false)
      setEditingItemId(null)
    }
  }

  const handleCancelEdit = () => {
    setNewItemTitle('')
    setNewItemDescription('')
    setSelectedAssignee('')
    setSelectedDueDate('')
    setIsAddingItem(false)
    setEditingItemId(null)
  }

  return (
    <MotionBox variant="page" className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Action Items</h2>
        <p className="text-gray-600">
          Create actionable next steps to strengthen your relationship
        </p>
      </div>

      {/* Action Items List */}
      <StaggerContainer className="space-y-3">
        {actionItems.map((item) => (
          <StaggerItem key={item.id}>
            <Card className="p-4">
              <div className="flex items-start gap-3">
                <button
                  onClick={() => handleToggleComplete(item.id)}
                  className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-full border-2 transition-colors ${
                    item.completed
                      ? 'bg-green-500 border-green-500'
                      : 'border-gray-300 hover:border-green-400'
                  }`}
                >
                  {item.completed && (
                    <Check className="w-full h-full text-white p-0.5" />
                  )}
                </button>
                
                <div className="flex-1 min-w-0">
                  <div className={`font-medium ${item.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                    {item.title}
                  </div>
                  
                  {item.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {item.description}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
                    {item.assignedTo && (
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>
                          {partners.find(p => p.id === item.assignedTo)?.name || 'Assigned'}
                        </span>
                      </div>
                    )}
                    
                    {item.dueDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {format(new Date(item.dueDate), 'MMM d, yyyy')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-start gap-1">
                  <button
                    onClick={() => handleEditItem(item)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Edit action item"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={() => onRemoveActionItem(item.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                    aria-label="Remove action item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* Add New Action Item */}
      {isAddingItem ? (
        <MotionBox variant="fade">
          <Card className="p-4 space-y-4">
            <MobileInput
              label="What needs to be done?"
              value={newItemTitle}
              onChange={(e) => setNewItemTitle(e.target.value)}
              placeholder="e.g., Plan a date night"
              autoFocus
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <textarea
                value={newItemDescription}
                onChange={(e) => setNewItemDescription(e.target.value)}
                placeholder="Add any helpful details..."
                rows={2}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-base transition-all"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assign to
                </label>
                <select
                  value={selectedAssignee}
                  onChange={(e) => setSelectedAssignee(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                >
                  <option value="">Both</option>
                  {partners.map(partner => (
                    <option key={partner.id} value={partner.id}>
                      {partner.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due date
                </label>
                <input
                  type="date"
                  value={selectedDueDate}
                  onChange={(e) => setSelectedDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                  min={format(new Date(), 'yyyy-MM-dd')}
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <TouchButton
                onClick={editingItemId ? handleUpdateItem : handleAddItem}
                disabled={!newItemTitle.trim()}
                className="flex-1"
              >
                {editingItemId ? 'Update' : 'Add'} Action Item
              </TouchButton>
              
              <TouchButton
                onClick={handleCancelEdit}
                variant="outline"
              >
                Cancel
              </TouchButton>
            </div>
          </Card>
        </MotionBox>
      ) : (
        <TouchButton
          onClick={() => setIsAddingItem(true)}
          variant="outline"
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Action Item
        </TouchButton>
      )}

      {/* Summary */}
      {actionItems.length > 0 && (
        <Card className="p-4 bg-pink-50 border-pink-200">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-gray-900">
                {actionItems.length} action {actionItems.length === 1 ? 'item' : 'items'} created
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {actionItems.filter(i => i.completed).length} completed, {actionItems.filter(i => !i.completed).length} remaining
              </div>
            </div>
            <div className="text-2xl">
              {actionItems.length === 0 ? '📝' : actionItems.every(i => i.completed) ? '✅' : '📋'}
            </div>
          </div>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex gap-3 pt-4">
        {onBack && (
          <TouchButton
            onClick={onBack}
            variant="outline"
            className="flex-1"
          >
            Back
          </TouchButton>
        )}
        
        {onNext && (
          <TouchButton
            onClick={onNext}
            className="flex-1"
          >
            Continue
            <ChevronRight className="w-4 h-4 ml-2" />
          </TouchButton>
        )}
      </div>
    </MotionBox>
  )
}