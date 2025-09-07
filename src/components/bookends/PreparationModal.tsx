'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, GripVertical, Users, Sparkles, Clock } from 'lucide-react'
import { useBookends } from '@/contexts/BookendsContext'
import { QUICK_TOPICS } from '@/types/bookends'
import { cn } from '@/lib/utils'

export function PreparationModal() {
  const {
    preparation,
    isPreparationModalOpen,
    closePreparationModal,
    addMyTopic,
    removeMyTopic,
    reorderMyTopics,
    simulatePartnerTopics
  } = useBookends()

  const [customTopic, setCustomTopic] = useState('')
  const [showPartnerTopics, setShowPartnerTopics] = useState(false)
  const [partnerLoading, setPartnerLoading] = useState(false)

  // Simulate partner adding topics
  useEffect(() => {
    if (isPreparationModalOpen && !preparation?.partnerTopics?.length && !partnerLoading) {
      setPartnerLoading(true)
      simulatePartnerTopics()
      
      // Show partner section after delay
      setTimeout(() => {
        setShowPartnerTopics(true)
        setPartnerLoading(false)
      }, 3000)
    }
  }, [isPreparationModalOpen, preparation, simulatePartnerTopics, partnerLoading])

  const handleAddCustomTopic = () => {
    if (customTopic.trim()) {
      addMyTopic(customTopic.trim(), false)
      setCustomTopic('')
    }
  }

  const handleQuickTopicClick = (topic: typeof QUICK_TOPICS[0]) => {
    // Check if already added
    const isAdded = preparation?.myTopics.some(t => 
      t.isQuickTopic && t.content === topic.label
    )
    
    if (!isAdded) {
      addMyTopic(topic.label, true)
    }
  }

  const myTopics = preparation?.myTopics || []
  const partnerTopics = preparation?.partnerTopics || []

  return (
    <Dialog open={isPreparationModalOpen} onOpenChange={closePreparationModal}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-md border-rose-200/40">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
            Prepare for Your Check-In
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Select topics you&apos;d like to discuss. Your partner can add their own topics too.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Quick Topics */}
          <div>
            <h3 className="text-sm font-medium text-rose-700 mb-3">Quick Topics</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {QUICK_TOPICS.map((topic) => {
                const isAdded = myTopics.some(t => 
                  t.isQuickTopic && t.content === topic.label
                )
                return (
                  <motion.button
                    key={topic.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleQuickTopicClick(topic)}
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-lg border transition-all text-left",
                      isAdded 
                        ? "bg-pink-50 border-pink-300 text-pink-700"
                        : "bg-white border-gray-200 hover:border-gray-300"
                    )}
                    disabled={isAdded}
                  >
                    <span className="text-xl">{topic.icon}</span>
                    <span className="text-sm">{topic.label}</span>
                    {isAdded && <span className="text-xs ml-auto">✓</span>}
                  </motion.button>
                )
              })}
            </div>
          </div>

          {/* Custom Topic Input */}
          <div>
            <h3 className="text-sm font-medium text-rose-700 mb-3">Add Custom Topic</h3>
            <div className="flex gap-2">
              <Input
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCustomTopic()}
                placeholder="Something specific you want to discuss..."
                className="flex-1"
              />
              <Button 
                onClick={handleAddCustomTopic}
                disabled={!customTopic.trim()}
                size="sm"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* My Topics List */}
          {myTopics.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-rose-700 mb-3">
                Your Topics ({myTopics.length})
              </h3>
              <div className="space-y-2">
                <AnimatePresence>
                  {myTopics.map((topic) => (
                    <motion.div
                      key={topic.id}
                      layout
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="flex items-center gap-2 p-3 bg-pink-50 rounded-lg border border-pink-200"
                    >
                      <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
                      <span className="flex-1 text-sm">{topic.content}</span>
                      <button
                        onClick={() => removeMyTopic(topic.id)}
                        className="text-gray-500 hover:text-red-500 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Partner Topics */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-gray-500" />
              <h3 className="text-sm font-medium text-rose-700">
                Jordan&apos;s Topics
              </h3>
              {partnerLoading && (
                <span className="text-xs text-gray-500 ml-auto">
                  Jordan is preparing...
                </span>
              )}
            </div>

            {showPartnerTopics && partnerTopics.length > 0 ? (
              <div className="space-y-2">
                <AnimatePresence>
                  {partnerTopics.map((topic, index) => (
                    <motion.div
                      key={topic.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-3 bg-blue-50 rounded-lg border border-blue-200"
                    >
                      <span className="text-sm">{topic.content}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : partnerLoading ? (
              <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-center">
                  <Sparkles className="h-8 w-8 text-gray-400 mx-auto mb-2 animate-pulse" />
                  <p className="text-sm text-gray-500">Waiting for Jordan...</p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-500">No topics from Jordan yet</p>
              </div>
            )}
          </div>

          {/* Combined Agenda Preview */}
          {(myTopics.length > 0 || partnerTopics.length > 0) && (
            <Card className="p-4 bg-gradient-to-r from-pink-50 to-blue-50">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-gray-600" />
                <h3 className="text-sm font-medium text-rose-700">Session Agenda</h3>
                <span className="text-xs text-gray-500 ml-auto">
                  {myTopics.length + partnerTopics.length} topics total
                </span>
              </div>
              <div className="text-xs text-gray-600">
                <p>• {myTopics.length} topics from you</p>
                <p>• {partnerTopics.length} topics from Jordan</p>
                <p className="mt-2 text-gray-500">
                  Estimated time: {(myTopics.length + partnerTopics.length) * 3}-{(myTopics.length + partnerTopics.length) * 5} minutes
                </p>
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t border-rose-100">
            <Button 
              variant="outline" 
              onClick={closePreparationModal}
              className="border-rose-200 text-rose-600 hover:bg-rose-50"
            >
              Save for Later
            </Button>
            <Button 
              onClick={closePreparationModal}
              disabled={myTopics.length === 0}
              className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white border-0"
            >
              Start Check-In with Topics
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}