'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, X as XIcon, RefreshCw, Bell, Calendar, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RelationshipRequest } from '@/types'
import { mockUsers } from '@/lib/mock-data'
import { format } from 'date-fns'

interface RequestResponseModalProps {
  isOpen: boolean
  onClose: () => void
  request: RelationshipRequest
  onResponse: (updatedRequest: RelationshipRequest) => void
  currentUserId: string
}

export function RequestResponseModal({ 
  isOpen, 
  onClose, 
  request, 
  onResponse,
  currentUserId 
}: RequestResponseModalProps) {
  const [response, setResponse] = useState('')
  const [action, setAction] = useState<'accept' | 'decline' | 'convert' | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const sender = mockUsers.find(u => u.id === request.requestedBy)

  const handleAccept = () => {
    setAction('accept')
  }

  const handleDecline = () => {
    setAction('decline')
  }

  const handleConvert = () => {
    setAction('convert')
  }

  const handleSubmit = async () => {
    if (!action) return

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      const updatedRequest: RelationshipRequest = {
        ...request,
        status: action === 'accept' ? 'accepted' : action === 'decline' ? 'declined' : 'converted',
        response: response || undefined,
        respondedAt: new Date(),
        updatedAt: new Date()
      }

      if (action === 'convert') {
        // In a real app, this would also create a reminder
        updatedRequest.convertedToReminderId = `reminder-${Date.now()}`
      }

      onResponse(updatedRequest)
      
      // Reset form
      setResponse('')
      setAction(null)
      setIsSubmitting(false)
      onClose()
    }, 1500)
  }

  const getCategoryIcon = (category: RelationshipRequest['category']) => {
    switch (category) {
      case 'activity':
        return '💕'
      case 'task':
        return '📋'
      case 'conversation':
        return '💬'
      case 'reminder':
        return '🔔'
      case 'date-night':
        return '✨'
      default:
        return '📌'
    }
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
            <Card className="p-6 max-h-[80vh] overflow-y-auto bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 border-purple-100">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Respond to Request
                  </h2>
                  <p className="text-gray-600 mt-1">From {sender?.name}</p>
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

              {/* Request Details */}
              <Card className="p-4 mb-6 bg-white/60 border-purple-100">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{getCategoryIcon(request.category)}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{request.title}</h3>
                    <p className="text-gray-700 mt-2">{request.description}</p>
                    
                    <div className="flex items-center gap-2 mt-4">
                      <Badge variant="outline" className="text-xs capitalize">
                        {request.category.replace('-', ' ')}
                      </Badge>
                      <Badge variant="outline" className="text-xs capitalize">
                        {request.priority} priority
                      </Badge>
                      {request.suggestedDate && (
                        <Badge variant="outline" className="text-xs">
                          <Calendar className="w-3 h-3 mr-1" />
                          {format(request.suggestedDate, 'MMM d, yyyy')}
                        </Badge>
                      )}
                      {request.suggestedFrequency === 'recurring' && (
                        <Badge variant="outline" className="text-xs">
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Recurring
                        </Badge>
                      )}
                    </div>

                    {request.tags && request.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {request.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>

              {/* Action Buttons */}
              {!action && (
                <div className="space-y-3 mb-6">
                  <Button
                    onClick={handleAccept}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Accept Request
                  </Button>
                  
                  <Button
                    onClick={handleConvert}
                    variant="outline"
                    className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
                  >
                    <Bell className="w-4 h-4 mr-2" />
                    Convert to Personal Reminder
                  </Button>
                  
                  <Button
                    onClick={handleDecline}
                    variant="outline"
                    className="w-full border-red-300 text-red-700 hover:bg-red-50"
                  >
                    <XIcon className="w-4 h-4 mr-2" />
                    Decline Request
                  </Button>
                </div>
              )}

              {/* Response Form */}
              {action && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="p-3 rounded-lg bg-white/60 border border-purple-100">
                    <p className="text-sm font-medium">
                      {action === 'accept' && '✅ You\'re accepting this request'}
                      {action === 'decline' && '❌ You\'re declining this request'}
                      {action === 'convert' && '🔄 You\'re converting this to a personal reminder'}
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="response">
                      Add a message (optional)
                      {action === 'decline' && (
                        <span className="text-xs text-gray-500 ml-2">
                          Let {sender?.name} know why or suggest an alternative
                        </span>
                      )}
                    </Label>
                    <Textarea
                      id="response"
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      placeholder={
                        action === 'accept' 
                          ? "e.g., I'd love to! Looking forward to it..."
                          : action === 'decline'
                          ? "e.g., I can't this week, but how about next weekend?"
                          : "e.g., Great idea! I'll set a reminder for myself..."
                      }
                      className="mt-1 bg-white/70 border-purple-200 focus:border-purple-400"
                      rows={3}
                    />
                  </div>

                  {action === 'convert' && (
                    <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                      <p className="text-sm text-blue-700">
                        <Bell className="w-4 h-4 inline mr-1" />
                        This will create a personal reminder based on this request. You can customize the reminder details after creation.
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button
                      className={`flex-1 ${
                        action === 'accept' ? 'bg-green-600 hover:bg-green-700' :
                        action === 'decline' ? 'bg-red-600 hover:bg-red-700' :
                        'bg-blue-600 hover:bg-blue-700'
                      }`}
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Confirm {action === 'accept' ? 'Accept' : action === 'decline' ? 'Decline' : 'Convert'}
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setAction(null)}
                      disabled={isSubmitting}
                    >
                      Back
                    </Button>
                  </div>
                </motion.div>
              )}
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}