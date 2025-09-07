'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Calendar, Bell, User, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { mockUsers } from '@/lib/mock-data'
import { format } from 'date-fns'

interface ReminderRequestModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (request: any) => void
}

export function ReminderRequestModal({ isOpen, onClose, onSubmit }: ReminderRequestModalProps) {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [requestMessage, setRequestMessage] = useState('')
  const [frequency, setFrequency] = useState('once')
  const [assignTo, setAssignTo] = useState('partner')
  const [showPreview, setShowPreview] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Pre-filled example for demo
  const handleShowExample = () => {
    setTitle('Plan Anniversary Dinner')
    setMessage('Remember to make reservations at that Italian place we love')
    setRequestMessage("Hey love, can you handle the anniversary dinner plans? You're so good at picking special places!")
    setFrequency('once')
    setAssignTo('partner')
    setShowPreview(true)
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    // Simulate API call
    setTimeout(() => {
      onSubmit({
        title,
        message,
        requestMessage,
        frequency,
        assignTo,
        requestedBy: mockUsers[0].id,
        assignedTo: mockUsers[1].id
      })
      
      // Reset form
      setTitle('')
      setMessage('')
      setRequestMessage('')
      setFrequency('once')
      setAssignTo('partner')
      setShowPreview(false)
      setIsSubmitting(false)
      onClose()
    }, 1500)
  }

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
            <Card className="p-6 max-h-[80vh] overflow-y-auto bg-gradient-to-br from-white via-pink-50/30 to-purple-50/30 border-pink-100">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">Request a Reminder from Jeremy</h2>
                  <p className="text-gray-600 mt-1">Ask your partner to help you remember something important</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="hover:bg-pink-100"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </Button>
              </div>

              {/* Quick Example Button */}
              {!showPreview && (
                <Button
                  variant="outline"
                  onClick={handleShowExample}
                  className="mb-4 w-full border-dashed border-pink-300 hover:bg-pink-50 text-pink-700"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Try an example: Anniversary Dinner Planning
                </Button>
              )}

              {/* Form */}
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <Label htmlFor="title">What should Jeremy remind you about?</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Plan anniversary dinner"
                    className="mt-1 bg-white/70 border-pink-200 focus:border-pink-400"
                  />
                </div>

                {/* Message */}
                <div>
                  <Label htmlFor="message">Reminder details</Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="e.g., Make reservations at our favorite restaurant"
                    className="mt-1 bg-white/70 border-pink-200 focus:border-pink-400"
                    rows={3}
                  />
                </div>

                {/* Personal Message */}
                <div>
                  <Label htmlFor="requestMessage">Message to Jeremy (optional)</Label>
                  <Textarea
                    id="requestMessage"
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    placeholder="e.g., Hey love, can you help me remember this? You're better at planning these things!"
                    className="mt-1 bg-white/70 border-pink-200 focus:border-pink-400"
                    rows={2}
                  />
                  <p className="text-xs text-gray-500 mt-1">Add a personal note about why you need this reminder</p>
                </div>

                {/* Frequency */}
                <div>
                  <Label>How often?</Label>
                  <RadioGroup value={frequency} onValueChange={setFrequency} className="mt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="once" id="once" />
                      <Label htmlFor="once" className="font-normal">Just once</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="daily" id="daily" />
                      <Label htmlFor="daily" className="font-normal">Daily</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="weekly" id="weekly" />
                      <Label htmlFor="weekly" className="font-normal">Weekly</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Assign To */}
                <div>
                  <Label>Who should get this reminder?</Label>
                  <RadioGroup value={assignTo} onValueChange={setAssignTo} className="mt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="partner" id="partner" />
                      <Label htmlFor="partner" className="font-normal">
                        <span className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          Jeremy gets the reminder
                        </span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="me" id="me" />
                      <Label htmlFor="me" className="font-normal">
                        <span className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          I get the reminder (Jeremy just sets it up)
                        </span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="both" id="both" />
                      <Label htmlFor="both" className="font-normal">
                        <span className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          We both get reminded
                        </span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Preview */}
                {showPreview && title && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Label>Preview of request Jeremy will see:</Label>
                    <Card className="p-4 mt-2 bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-sm font-medium">
                          {mockUsers[0].name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Deb is requesting a reminder:</p>
                          <h4 className="font-semibold mt-1">{title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{message}</p>
                          {requestMessage && (
                            <div className="mt-3 p-3 bg-white/80 backdrop-blur-sm rounded-lg border border-pink-100">
                              <p className="text-sm italic text-gray-700">"{requestMessage}"</p>
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-3">
                            <Badge variant="outline" className="text-xs">
                              <Calendar className="w-3 h-3 mr-1" />
                              {frequency === 'once' ? 'One-time' : frequency}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              <Bell className="w-3 h-3 mr-1" />
                              {assignTo === 'partner' ? 'For Jeremy' : assignTo === 'me' ? 'For Deb' : 'For both'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <Button
                  className="flex-1 bg-pink-600 hover:bg-pink-700"
                  onClick={handleSubmit}
                  disabled={!title || !message || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Sending Request...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Request to Jeremy
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