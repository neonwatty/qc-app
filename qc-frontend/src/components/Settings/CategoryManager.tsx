'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { 
  Plus, 
  Edit2, 
  Trash2, 
  GripVertical,
  RotateCcw,
  Save,
  AlertCircle,
  Sparkles,
  Settings2,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CategoryEditor } from './CategoryEditor'
import { useCategories, CategoryWithColor } from '@/hooks/useCategories'
import { cn } from '@/lib/utils'

export const CategoryManager: React.FC = () => {
  const {
    categories,
    isLoading,
    addCategory,
    updateCategory,
    deleteCategory,
    reorderCategories,
    resetToDefaults,
    availableIcons,
    availableColors,
    defaultCategories
  } = useCategories()

  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CategoryWithColor | undefined>()
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [isDragging, setIsDragging] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [showResetDialog, setShowResetDialog] = useState(false)

  const handleAddCategory = () => {
    setEditingCategory(undefined)
    setIsEditorOpen(true)
  }

  const handleEditCategory = (category: CategoryWithColor) => {
    setEditingCategory(category)
    setIsEditorOpen(true)
  }

  const handleSaveNewCategory = (category: Omit<CategoryWithColor, 'id' | 'order'>) => {
    addCategory(category)
    setHasChanges(true)
  }

  const handleUpdateCategory = (id: string, updates: Partial<CategoryWithColor>) => {
    updateCategory(id, updates)
    setHasChanges(true)
  }

  const handleDeleteCategory = (id: string) => {
    if (confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      deleteCategory(id)
      setHasChanges(true)
    }
  }

  const handleReorder = (newOrder: CategoryWithColor[]) => {
    // Find the changed indices
    const oldIndex = categories.findIndex(c => c.id === newOrder[0]?.id)
    const newIndex = newOrder.findIndex(c => c.id === categories[0]?.id)
    
    if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
      reorderCategories(oldIndex, newIndex)
      setHasChanges(true)
    }
  }

  const handleReset = () => {
    resetToDefaults()
    setHasChanges(false)
    setShowResetDialog(false)
  }

  const toggleExpanded = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId)
      } else {
        newSet.add(categoryId)
      }
      return newSet
    })
  }

  const colorStyles = {
    pink: 'border-pink-300 bg-pink-50',
    blue: 'border-blue-300 bg-blue-50',
    purple: 'border-purple-300 bg-purple-50',
    green: 'border-green-300 bg-green-50',
    orange: 'border-orange-300 bg-orange-50',
    gray: 'border-gray-300 bg-gray-50'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" />
      </div>
    )
  }

  const customCategories = categories.filter(c => c.isCustom)
  const systemCategories = categories.filter(c => !c.isCustom)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-purple-600" />
            Discussion Categories
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Customize the topics you discuss during check-ins
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {hasChanges && (
            <span className="text-xs text-orange-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Unsaved changes
            </span>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowResetDialog(true)}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
          
          <Button
            size="sm"
            onClick={handleAddCategory}
            className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <Sparkles className="h-4 w-4 text-purple-600 mt-0.5" />
          <div className="text-sm text-purple-700">
            <p className="font-medium mb-1">Customize your check-in experience</p>
            <p className="text-xs">
              Drag categories to reorder • Edit to modify prompts • Create custom categories for your unique needs
            </p>
          </div>
        </div>
      </div>

      {/* Categories List */}
      <div className="space-y-4">
        {/* System Categories */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            Default Categories
            <span className="text-xs text-gray-500">({systemCategories.length})</span>
          </h3>
          
          <Reorder.Group
            axis="y"
            values={systemCategories}
            onReorder={handleReorder}
            className="space-y-2"
          >
            <AnimatePresence>
              {systemCategories.map((category) => {
                const isExpanded = expandedCategories.has(category.id)
                const isDefault = defaultCategories.some(d => d.id === category.id)
                
                return (
                  <Reorder.Item
                    key={category.id}
                    value={category}
                    dragListener={false}
                    dragControls={undefined}
                    className="select-none"
                  >
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      whileHover={{ scale: isDragging ? 1 : 1.01 }}
                      className={cn(
                        "bg-white rounded-lg border-2 transition-all",
                        category.color ? colorStyles[category.color as keyof typeof colorStyles] : "border-gray-200",
                        isDragging && "shadow-lg"
                      )}
                    >
                      {/* Category Header */}
                      <div className="p-4">
                        <div className="flex items-start gap-3">
                          {/* Drag Handle */}
                          <button
                            onPointerDown={(e) => {
                              setIsDragging(true)
                              e.currentTarget.setPointerCapture(e.pointerId)
                            }}
                            onPointerUp={() => setIsDragging(false)}
                            className="mt-1 cursor-grab active:cursor-grabbing touch-none"
                          >
                            <GripVertical className="h-5 w-5 text-gray-400" />
                          </button>
                          
                          {/* Icon */}
                          <span className="text-2xl mt-0.5">{category.icon}</span>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-gray-900">{category.name}</h4>
                              {isDefault && (
                                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                            
                            {/* Prompts Count */}
                            <button
                              onClick={() => toggleExpanded(category.id)}
                              className="text-xs text-purple-600 hover:text-purple-700 mt-2 flex items-center gap-1"
                            >
                              {category.prompts.length} prompts
                              {isExpanded ? (
                                <ChevronUp className="h-3 w-3" />
                              ) : (
                                <ChevronDown className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                          
                          {/* Actions */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEditCategory(category)}
                              className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Expanded Prompts */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="ml-11 mt-3 space-y-2 border-t border-gray-100 pt-3">
                                {category.prompts.map((prompt, index) => (
                                  <div key={index} className="flex items-start gap-2">
                                    <span className="text-xs text-gray-400 mt-0.5">{index + 1}.</span>
                                    <p className="text-sm text-gray-700 italic">&ldquo;{prompt}&rdquo;</p>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  </Reorder.Item>
                )
              })}
            </AnimatePresence>
          </Reorder.Group>
        </div>

        {/* Custom Categories */}
        {customCategories.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              Custom Categories
              <span className="text-xs text-gray-500">({customCategories.length})</span>
            </h3>
            
            <Reorder.Group
              axis="y"
              values={customCategories}
              onReorder={handleReorder}
              className="space-y-2"
            >
              <AnimatePresence>
                {customCategories.map((category) => {
                  const isExpanded = expandedCategories.has(category.id)
                  
                  return (
                    <Reorder.Item
                      key={category.id}
                      value={category}
                      dragListener={false}
                      dragControls={undefined}
                      className="select-none"
                    >
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        whileHover={{ scale: isDragging ? 1 : 1.01 }}
                        className={cn(
                          "bg-white rounded-lg border-2 transition-all",
                          category.color ? colorStyles[category.color as keyof typeof colorStyles] : "border-gray-200",
                          isDragging && "shadow-lg"
                        )}
                      >
                        {/* Category Header */}
                        <div className="p-4">
                          <div className="flex items-start gap-3">
                            {/* Drag Handle */}
                            <button
                              onPointerDown={(e) => {
                                setIsDragging(true)
                                e.currentTarget.setPointerCapture(e.pointerId)
                              }}
                              onPointerUp={() => setIsDragging(false)}
                              className="mt-1 cursor-grab active:cursor-grabbing touch-none"
                            >
                              <GripVertical className="h-5 w-5 text-gray-400" />
                            </button>
                            
                            {/* Icon */}
                            <span className="text-2xl mt-0.5">{category.icon}</span>
                            
                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-gray-900">{category.name}</h4>
                                <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                                  Custom
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                              
                              {/* Prompts Count */}
                              <button
                                onClick={() => toggleExpanded(category.id)}
                                className="text-xs text-purple-600 hover:text-purple-700 mt-2 flex items-center gap-1"
                              >
                                {category.prompts.length} prompts
                                {isExpanded ? (
                                  <ChevronUp className="h-3 w-3" />
                                ) : (
                                  <ChevronDown className="h-3 w-3" />
                                )}
                              </button>
                            </div>
                            
                            {/* Actions */}
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleEditCategory(category)}
                                className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(category.id)}
                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          
                          {/* Expanded Prompts */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden"
                              >
                                <div className="ml-11 mt-3 space-y-2 border-t border-gray-100 pt-3">
                                  {category.prompts.map((prompt, index) => (
                                    <div key={index} className="flex items-start gap-2">
                                      <span className="text-xs text-gray-400 mt-0.5">{index + 1}.</span>
                                      <p className="text-sm text-gray-700 italic">&ldquo;{prompt}&rdquo;</p>
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </motion.div>
                    </Reorder.Item>
                  )
                })}
              </AnimatePresence>
            </Reorder.Group>
          </div>
        )}
      </div>

      {/* Category Editor Dialog */}
      <CategoryEditor
        category={editingCategory}
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false)
          setEditingCategory(undefined)
        }}
        onSave={handleSaveNewCategory}
        onUpdate={handleUpdateCategory}
        availableIcons={availableIcons}
        availableColors={availableColors}
      />

      {/* Reset Confirmation Dialog */}
      <AnimatePresence>
        {showResetDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowResetDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-3 mb-4">
                <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-gray-900">Reset to Default Categories?</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    This will remove all custom categories and reset the default categories to their original state. This action cannot be undone.
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowResetDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleReset}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  Reset Categories
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}