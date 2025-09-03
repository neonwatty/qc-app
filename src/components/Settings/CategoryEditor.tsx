'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Save, 
  Plus, 
  Trash2, 
  Edit2,
  ChevronRight,
  Sparkles,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CategoryWithColor } from '@/hooks/useCategories'
import { cn } from '@/lib/utils'

interface CategoryEditorProps {
  category?: CategoryWithColor
  isOpen: boolean
  onClose: () => void
  onSave: (category: Omit<CategoryWithColor, 'id' | 'order'>) => void
  onUpdate?: (id: string, updates: Partial<CategoryWithColor>) => void
  availableIcons?: string[]
  availableColors?: Record<string, string>
}

export const CategoryEditor: React.FC<CategoryEditorProps> = ({
  category,
  isOpen,
  onClose,
  onSave,
  onUpdate,
  availableIcons = ['💕', '💬', '🤗', '🎯', '🙏', '🌉', '✨', '🌟', '💖', '🎨'],
  availableColors = {
    pink: 'pink',
    blue: 'blue',
    purple: 'purple',
    green: 'green',
    orange: 'orange'
  }
}) => {
  const isEditMode = !!category

  const [formData, setFormData] = useState<Omit<CategoryWithColor, 'id' | 'order'>>({
    name: '',
    icon: '✨',
    description: '',
    prompts: [''],
    isCustom: true,
    color: 'purple'
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        icon: category.icon,
        description: category.description,
        prompts: category.prompts,
        isCustom: category.isCustom,
        color: category.color || 'purple'
      })
    } else {
      setFormData({
        name: '',
        icon: '✨',
        description: '',
        prompts: [''],
        isCustom: true,
        color: 'purple'
      })
    }
    setErrors({})
  }, [category])

  const handleAddPrompt = () => {
    setFormData(prev => ({
      ...prev,
      prompts: [...prev.prompts, '']
    }))
  }

  const handleRemovePrompt = (index: number) => {
    setFormData(prev => ({
      ...prev,
      prompts: prev.prompts.filter((_, i) => i !== index)
    }))
  }

  const handleUpdatePrompt = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      prompts: prev.prompts.map((p, i) => i === index ? value : p)
    }))
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required'
    } else if (formData.name.length > 50) {
      newErrors.name = 'Category name must be less than 50 characters'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    } else if (formData.description.length > 200) {
      newErrors.description = 'Description must be less than 200 characters'
    }

    const validPrompts = formData.prompts.filter(p => p.trim())
    if (validPrompts.length === 0) {
      newErrors.prompts = 'At least one prompt is required'
    } else if (validPrompts.some(p => p.length > 300)) {
      newErrors.prompts = 'Prompts must be less than 300 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return

    const cleanedData = {
      ...formData,
      name: formData.name.trim(),
      description: formData.description.trim(),
      prompts: formData.prompts.filter(p => p.trim()).map(p => p.trim())
    }

    if (isEditMode && category && onUpdate) {
      onUpdate(category.id, cleanedData)
    } else {
      onSave(cleanedData)
    }
    onClose()
  }

  const colorStyles = {
    pink: 'bg-pink-100 text-pink-700 border-pink-300',
    blue: 'bg-blue-100 text-blue-700 border-blue-300',
    purple: 'bg-purple-100 text-purple-700 border-purple-300',
    green: 'bg-green-100 text-green-700 border-green-300',
    orange: 'bg-orange-100 text-orange-700 border-orange-300'
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            {isEditMode ? (
              <>
                <Edit2 className="h-6 w-6 text-purple-600" />
                Edit Category
              </>
            ) : (
              <>
                <Sparkles className="h-6 w-6 text-purple-600" />
                Create Custom Category
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Icon Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Icon
            </label>
            <div className="grid grid-cols-10 gap-2">
              {availableIcons.map((icon) => (
                <button
                  key={icon}
                  onClick={() => setFormData(prev => ({ ...prev, icon }))}
                  className={cn(
                    "p-3 text-2xl rounded-lg border-2 transition-all",
                    formData.icon === icon
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color Theme
            </label>
            <div className="flex gap-2">
              {Object.entries(availableColors).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setFormData(prev => ({ ...prev, color: key }))}
                  className={cn(
                    "px-4 py-2 rounded-lg border-2 font-medium capitalize transition-all",
                    formData.color === key
                      ? colorStyles[key as keyof typeof colorStyles]
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Quality Time"
              className={cn(
                "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent",
                errors.name ? "border-red-500" : "border-gray-200"
              )}
              maxLength={50}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.name}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formData.name.length}/50 characters
            </p>
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of what this category covers..."
              rows={3}
              className={cn(
                "w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none",
                errors.description ? "border-red-500" : "border-gray-200"
              )}
              maxLength={200}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.description}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formData.description.length}/200 characters
            </p>
          </div>

          {/* Prompts */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">
                Discussion Prompts
              </label>
              <button
                onClick={handleAddPrompt}
                className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                Add Prompt
              </button>
            </div>
            
            <AnimatePresence>
              {formData.prompts.map((prompt, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-3"
                >
                  <div className="flex items-start gap-2">
                    <ChevronRight className="h-4 w-4 text-gray-400 mt-2.5 flex-shrink-0" />
                    <textarea
                      value={prompt}
                      onChange={(e) => handleUpdatePrompt(index, e.target.value)}
                      placeholder={`Prompt ${index + 1}...`}
                      rows={2}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
                      maxLength={300}
                    />
                    {formData.prompts.length > 1 && (
                      <button
                        onClick={() => handleRemovePrompt(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 ml-6 mt-1">
                    {prompt.length}/300 characters
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>

            {errors.prompts && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.prompts}
              </p>
            )}
          </div>

          {/* Preview Card */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-600 font-medium mb-3">PREVIEW</p>
            <div className={cn(
              "bg-white rounded-lg border-2 p-4",
              formData.color ? `border-${formData.color}-300` : "border-gray-200"
            )}>
              <div className="flex items-start gap-3">
                <span className="text-3xl">{formData.icon}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {formData.name || 'Category Name'}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {formData.description || 'Category description...'}
                  </p>
                  {formData.prompts[0] && (
                    <p className="text-xs text-gray-500 italic mt-3">
                      &ldquo;{formData.prompts[0]}&rdquo;
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isEditMode ? 'Update' : 'Create'} Category
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}