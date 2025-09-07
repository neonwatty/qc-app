'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, Edit2, MessageCircle, Calendar, Bell, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Reminder } from '@/types'
import { mockUsers } from '@/lib/mock-data'
import { format } from 'date-fns'

interface ReminderRequestNotificationProps {
  request: Reminder
  onAccept: (id: string) => void
  onDecline: (id: string) => void
  onModify: (id: string) => void
}

export function ReminderRequestNotification({
  request,
  onAccept,
  onDecline,
  onModify
}: ReminderRequestNotificationProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [action, setAction] = useState<'accept' | 'decline' | 'modify' | null>(null)

  const requestingPartner = mockUsers.find(u => u.id === request.requestedBy)

  const handleAccept = async () => {
    setIsProcessing(true)
    setAction('accept')
    
    // Simulate API call
    setTimeout(() => {
      onAccept(request.id)
      setIsProcessing(false)
      setIsExpanded(false)
    }, 1500)
  }

  const handleDecline = async () => {
    setIsProcessing(true)
    setAction('decline')
    
    setTimeout(() => {
      onDecline(request.id)
      setIsProcessing(false)
      setIsExpanded(false)
    }, 1500)
  }

  const handleModify = () => {
    onModify(request.id)
  }

  if (!isExpanded) {
    return (
      <motion.div
        initial={{ opacity: 1, height: 'auto' }}
        animate={{ opacity: 0, height: 0 }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
      />
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="mb-4"
      >
        <Card className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 border-pink-200">
          {/* Success Message (shown after action) */}
          {action && isProcessing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center py-4"
            >
              <div className="text-center">
                {action === 'accept' ? (
                  <>
                    <Sparkles className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="font-medium text-green-600">Reminder accepted and added!</p>
                  </>
                ) : (
                  <>
                    <Check className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                    <p className="font-medium text-gray-600">Request declined</p>
                  </>
                )}
              </div>
            </motion.div>
          )}

          {/* Main Content */}
          {!action && (
            <>
              {/* Header */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-sm font-medium shrink-0">
                  {requestingPartner?.name.charAt(0) || 'J'}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-gray-700">
                      {requestingPartner?.name || 'Jeremy'} requested a reminder
                    </p>
                    <Badge variant="outline" className="text-xs bg-white">
                      New
                    </Badge>
                  </div>
                  
                  {/* Request Details */}
                  <h3 className="font-semibold text-lg mb-1">{request.title}</h3>
                  <p className="text-gray-600 text-sm mb-3">{request.message}</p>
                  
                  {/* Personal Message */}
                  {request.requestMessage && (
                    <div className="bg-white rounded-lg p-3 mb-3 border border-pink-100">
                      <div className="flex items-start gap-2">
                        <MessageCircle className="w-4 h-4 text-pink-600 mt-0.5" />
                        <p className="text-sm italic text-gray-700">"{request.requestMessage}"</p>
                      </div>
                    </div>
                  )}
                  
                  {/* Metadata */}
                  <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      <Calendar className="w-3 h-3 mr-1" />
                      {format(new Date(request.scheduledFor), 'MMM d, h:mm a')}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <Bell className="w-3 h-3 mr-1" />
                      {request.frequency === 'once' ? 'One-time' : request.frequency}
                    </Badge>
                    {request.assignedTo === request.createdBy && (
                      <Badge variant="outline" className="text-xs bg-purple-50">
                        For you
                      </Badge>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      onClick={handleAccept}
                      disabled={isProcessing}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Accept
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleModify}
                      disabled={isProcessing}
                    >
                      <Edit2 className="w-4 h-4 mr-1" />
                      Modify
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleDecline}
                      disabled={isProcessing}
                      className="text-gray-600"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Decline
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}