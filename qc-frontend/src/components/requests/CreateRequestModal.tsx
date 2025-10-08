'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Calendar, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RelationshipRequest, RequestCategory, RequestPriority } from '@/types'
import { mockUsers } from '@/lib/mock-data'
import { format } from 'date-fns'

interface CreateRequestModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (request: RelationshipRequest) => void
  currentUserId: string
}

export function CreateRequestModal({ isOpen, onClose, onSubmit, currentUserId }: CreateRequestModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<RequestCategory>('activity')
  const [priority, setPriority] = useState<RequestPriority>('medium')
  const [suggestedDate, setSuggestedDate] = useState('')
  const [frequency, setFrequency] = useState<'once' | 'recurring'>('once')
  const [tags, setTags] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const partner = mockUsers.find(u => u.id !== currentUserId)

  const handleShowExample = () => {
    setTitle('Weekend Getaway Planning')
    setDescription('Can you research and book that mountain cabin we talked about? You always find the coziest places with the best views!')
    setCategory('date-night')
    setPriority('medium')
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 14)
    setSuggestedDate(futureDate.toISOString().split('T')[0])
    setFrequency('once')
    setTags('vacation, relaxation')
    setShowPreview(true)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    const newRequest: RelationshipRequest = {
      id: `request-${Date.now()}`,
      title,
      description,
      category,
      requestedBy: currentUserId,
      requestedFor: partner?.id || '',
      priority,
      suggestedDate: suggestedDate ? new Date(suggestedDate) : undefined,
      suggestedFrequency: frequency,
      status: 'pending',
      tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Simulate API call
    setTimeout(() => {
      onSubmit(newRequest)
      
      // Reset form
      setTitle('')
      setDescription('')
      setCategory('activity')
      setPriority('medium')
      setSuggestedDate('')
      setFrequency('once')
      setTags('')
      setShowPreview(false)
      setIsSubmitting(false)
      onClose()
    }, 1500)
  }

  const categoryOptions: { value: RequestCategory; label: string }[] = [
    { value: 'activity', label: 'Activity' },
    { value: 'task', label: 'Task' },
    { value: 'conversation', label: 'Conversation' },
    { value: 'reminder', label: 'Reminder' },
    { value: 'date-night', label: 'Date Night' },
    { value: 'custom', label: 'Custom' }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-[10%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl z-50"
          >
            <Card className="p-6 max-h-[80vh] overflow-y-auto bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 border-purple-100">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Send Request to {partner?.name}
                  </h2>
                  <p className="text-gray-600 mt-1">Create a thoughtful request for your partner</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="hover:bg-purple-100"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </Button>
              </div>

              {/* Quick Example Button */}
              {!showPreview && (
                <Button
                  variant="outline"
                  onClick={handleShowExample}
                  className="mb-4 w-full border-dashed border-purple-300 hover:bg-purple-50 text-purple-700"
                >
                  Try an example: Weekend Getaway Planning
                </Button>
              )}

              {/* Form */}
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <Label htmlFor="title">Request Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Plan our anniversary dinner"
                    className="mt-1 bg-white/70 border-purple-200 focus:border-purple-400"
                  />
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">Details</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Explain what you're asking for and why..."
                    className="mt-1 bg-white/70 border-purple-200 focus:border-purple-400"
                    rows={3}
                  />
                </div>

                {/* Category and Priority */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category</Label>
                    <Select value={category} onValueChange={(v) => setCategory(v as RequestCategory)}>
                      <SelectTrigger className="mt-1 bg-white/70 border-purple-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categoryOptions.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Priority</Label>
                    <Select value={priority} onValueChange={(v) => setPriority(v as RequestPriority)}>
                      <SelectTrigger className="mt-1 bg-white/70 border-purple-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Suggested Date */}
                <div>
                  <Label htmlFor="date">Suggested Date (optional)</Label>
                  <Input
                    id="date"
                    type="date"
                    value={suggestedDate}
                    onChange={(e) => setSuggestedDate(e.target.value)}
                    className="mt-1 bg-white/70 border-purple-200 focus:border-purple-400"
                  />
                </div>

                {/* Frequency */}
                <div>
                  <Label>Frequency</Label>
                  <RadioGroup value={frequency} onValueChange={(v) => setFrequency(v as 'once' | 'recurring')} className="mt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="once" id="once" />
                      <Label htmlFor="once" className="font-normal">One-time request</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="recurring" id="recurring" />
                      <Label htmlFor="recurring" className="font-normal">
                        <span className="flex items-center gap-2">
                          <RefreshCw className="w-4 h-4" />
                          Recurring request
                        </span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Tags */}
                <div>
                  <Label htmlFor="tags">Tags (optional, comma-separated)</Label>
                  <Input
                    id="tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="e.g., vacation, planning, surprise"
                    className="mt-1 bg-white/70 border-purple-200 focus:border-purple-400"
                  />
                </div>

                {/* Preview */}
                {showPreview && title && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Label>Preview</Label>
                    <Card className="p-4 mt-2 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                      <h4 className="font-semibold">{title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{description}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant="outline" className="text-xs capitalize">
                          {category.replace('-', ' ')}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          {priority}
                        </Badge>
                        {suggestedDate && (
                          <Badge variant="outline" className="text-xs">
                            <Calendar className="w-3 h-3 mr-1" />
                            {format(new Date(suggestedDate), 'MMM d, yyyy')}
                          </Badge>
                        )}
                        {frequency === 'recurring' && (
                          <Badge variant="outline" className="text-xs">
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Recurring
                          </Badge>
                        )}
                      </div>
                      {tags && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {tags.split(',').map(tag => tag.trim()).filter(Boolean).map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </Card>
                  </motion.div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <Button
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                  onClick={handleSubmit}
                  disabled={!title || !description || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Sending Request...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Request
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}