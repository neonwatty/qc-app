'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Target, 
  Award, 
  Calendar,
  Sparkles,
  CheckCircle,
  X,
  Save,
  ArrowLeft
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PhotoUpload } from './PhotoUpload'
import { useMilestones, MilestoneInput } from '@/hooks/useMilestones'

interface MilestoneCreatorProps {
  isOpen: boolean
  onClose: () => void
  onMilestoneCreated?: (milestone: any) => void
  className?: string
}

const categoryOptions = [
  {
    id: 'communication',
    name: 'Communication',
    icon: '💬',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    description: 'Milestones related to how you talk and listen'
  },
  {
    id: 'trust',
    name: 'Trust',
    icon: '🤝',
    color: 'text-green-600', 
    bgColor: 'bg-green-100',
    description: 'Building confidence and reliability together'
  },
  {
    id: 'growth',
    name: 'Growth',
    icon: '🌱',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    description: 'Personal and relationship development achievements'
  },
  {
    id: 'celebration',
    name: 'Celebration',
    icon: '🎉',
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
    description: 'Special moments and occasions together'
  },
  {
    id: 'consistency',
    name: 'Consistency',
    icon: '⭐',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    description: 'Regular habits and sustained efforts'
  },
  {
    id: 'goals',
    name: 'Goals',
    icon: '🎯',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    description: 'Shared objectives and achievements'
  },
  {
    id: 'connection',
    name: 'Connection',
    icon: '❤️',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    description: 'Deepening intimacy and emotional bonds'
  }
]

const rarityOptions = [
  { id: 'common', name: 'Common', color: 'text-gray-600', icon: '⚪' },
  { id: 'rare', name: 'Rare', color: 'text-blue-600', icon: '🔵' },
  { id: 'epic', name: 'Epic', color: 'text-purple-600', icon: '🟣' },
  { id: 'legendary', name: 'Legendary', color: 'text-yellow-600', icon: '🟡' }
]

export const MilestoneCreator: React.FC<MilestoneCreatorProps> = ({
  isOpen,
  onClose,
  onMilestoneCreated,
  className
}) => {
  const { createMilestone, isLoading } = useMilestones()
  
  const [formData, setFormData] = useState<{
    title: string
    description: string
    category: string
    photo: string | null
    rarity: string
    points: number
  }>({
    title: '',
    description: '',
    category: '',
    photo: null,
    rarity: 'common',
    points: 10
  })
  
  const [showCelebration, setShowCelebration] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    } else if (formData.title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters'
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters'
    }
    
    if (!formData.category) {
      newErrors.category = 'Please select a category'
    }
    
    if (!formData.photo) {
      newErrors.photo = 'Please add a photo or icon'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    try {
      const milestoneInput: MilestoneInput = {
        title: formData.title,
        description: formData.description,
        category: formData.category as any,
        icon: formData.photo || '🏆',
        rarity: formData.rarity as any,
        points: formData.points,
        photo: formData.photo ?? undefined
      }

      const createdMilestone = await createMilestone(milestoneInput)
      
      // Show celebration animation
      setShowCelebration(true)
      
      // Call callback after a delay to show celebration
      setTimeout(() => {
        onMilestoneCreated?.(createdMilestone)
        handleClose()
      }, 2000)
      
    } catch (error) {
      console.error('Failed to create milestone:', error)
      setErrors({ submit: 'Failed to create milestone. Please try again.' })
    }
  }

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      photo: null,
      rarity: 'common',
      points: 10
    })
    setErrors({})
    setShowCelebration(false)
    onClose()
  }

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const selectedCategory = categoryOptions.find(cat => cat.id === formData.category)

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && handleClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className={cn(
            'bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden',
            className
          )}
        >
          {/* Celebration Animation */}
          <AnimatePresence>
            {showCelebration && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gradient-to-r from-purple-500/90 to-pink-500/90 flex items-center justify-center z-10"
              >
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: [0, 1.2, 1],
                    opacity: 1,
                    rotate: [0, 360]
                  }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="text-center text-white"
                >
                  <motion.div
                    animate={{ 
                      scale: [1, 1.1, 1],
                    }}
                    transition={{ 
                      duration: 0.5, 
                      repeat: Infinity, 
                      repeatType: "reverse" 
                    }}
                    className="text-6xl mb-4"
                  >
                    🎉
                  </motion.div>
                  <h2 className="text-2xl font-bold mb-2">Milestone Created!</h2>
                  <p className="text-lg opacity-90">Congratulations on your achievement!</p>
                </motion.div>
                
                {/* Confetti particles */}
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ 
                      opacity: 0,
                      scale: 0,
                      x: 0,
                      y: 0
                    }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0.5],
                      x: Math.random() * 400 - 200,
                      y: Math.random() * 400 - 200,
                    }}
                    transition={{
                      duration: 2,
                      delay: Math.random() * 0.5,
                      ease: "easeOut"
                    }}
                    className="absolute text-2xl"
                  >
                    {['🎊', '✨', '🌟', '💫', '🎈'][Math.floor(Math.random() * 5)]}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="overflow-y-auto max-h-[90vh]">
            {/* Header */}
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                    <Plus className="h-6 w-6 text-purple-600" />
                  </div>
                  <CardTitle className="text-xl">Create New Milestone</CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              {/* Title Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Milestone Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateFormData('title', e.target.value)}
                  placeholder="e.g., First Month of Daily Check-ins"
                  className={cn(
                    'w-full px-4 py-3 rounded-lg border transition-colors',
                    errors.title ? 'border-red-300 bg-red-50' : 'border-gray-300 focus:border-blue-400',
                    'focus:outline-none focus:ring-2 focus:ring-blue-100'
                  )}
                />
                {errors.title && (
                  <p className="text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              {/* Description Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  placeholder="Describe what this milestone represents and why it's meaningful..."
                  rows={3}
                  className={cn(
                    'w-full px-4 py-3 rounded-lg border transition-colors resize-none',
                    errors.description ? 'border-red-300 bg-red-50' : 'border-gray-300 focus:border-blue-400',
                    'focus:outline-none focus:ring-2 focus:ring-blue-100'
                  )}
                />
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              {/* Category Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">
                  Category *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categoryOptions.map((category) => (
                    <motion.button
                      key={category.id}
                      type="button"
                      onClick={() => updateFormData('category', category.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        'p-3 rounded-lg border-2 text-left transition-all',
                        formData.category === category.id
                          ? `${category.bgColor} border-current ${category.color}`
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{category.icon}</span>
                        <span className="font-medium text-sm">{category.name}</span>
                      </div>
                      <p className="text-xs text-gray-600">{category.description}</p>
                    </motion.button>
                  ))}
                </div>
                {errors.category && (
                  <p className="text-sm text-red-600">{errors.category}</p>
                )}
              </div>

              {/* Photo Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Photo or Icon *
                </label>
                <PhotoUpload
                  value={formData.photo}
                  onPhotoChange={(photo) => updateFormData('photo', photo)}
                  variant="compact"
                  placeholder="Add a visual to represent this milestone"
                />
                {errors.photo && (
                  <p className="text-sm text-red-600">{errors.photo}</p>
                )}
              </div>

              {/* Rarity Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">
                  Significance Level
                </label>
                <div className="flex gap-2">
                  {rarityOptions.map((rarity) => (
                    <button
                      key={rarity.id}
                      type="button"
                      onClick={() => updateFormData('rarity', rarity.id)}
                      className={cn(
                        'flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-colors',
                        formData.rarity === rarity.id
                          ? 'border-blue-400 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>{rarity.icon}</span>
                        <span>{rarity.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Points Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Points Value
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.points}
                  onChange={(e) => updateFormData('points', parseInt(e.target.value) || 10)}
                  className="w-24 px-3 py-2 rounded-lg border border-gray-300 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
                <p className="text-xs text-gray-600">
                  Points reflect the significance of this milestone
                </p>
              </div>

              {/* Error Message */}
              {errors.submit && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
                >
                  {errors.submit}
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="flex-1"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {isLoading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="mr-2"
                      >
                        <Sparkles className="h-4 w-4" />
                      </motion.div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Milestone
                    </>
                  )}
                </Button>
              </div>

              {/* Preview Card */}
              {formData.title && formData.category && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border-t border-gray-100 pt-6"
                >
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Preview</h4>
                  <Card className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          'flex-shrink-0 p-2 rounded-lg',
                          selectedCategory?.bgColor || 'bg-gray-100'
                        )}>
                          <span className="text-xl">{formData.photo || '🏆'}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {formData.title || 'Milestone Title'}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {formData.description || 'Milestone description...'}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className={cn(
                              'text-sm capitalize font-medium',
                              selectedCategory?.color || 'text-gray-600'
                            )}>
                              {selectedCategory?.name || 'Category'}
                            </span>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Award className="h-4 w-4" />
                              {formData.points} pts
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </CardContent>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}