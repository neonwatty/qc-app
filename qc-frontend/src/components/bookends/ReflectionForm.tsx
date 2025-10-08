'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Sparkles, TrendingUp, Share2, Lock, ChevronRight } from 'lucide-react'
import { useBookends } from '@/contexts/BookendsContext'
import { FEELING_EMOJIS } from '@/types/bookends'
import { cn } from '@/lib/utils'
import confetti from 'canvas-confetti'

interface ReflectionFormProps {
  sessionId: string
}

export function ReflectionForm({ sessionId }: ReflectionFormProps) {
  const {
    reflection,
    partnerReflection,
    isReflectionModalOpen,
    closeReflectionModal,
    saveReflection,
    simulatePartnerReflection
  } = useBookends()

  const [feelingBefore, setFeelingBefore] = useState(3)
  const [feelingAfter, setFeelingAfter] = useState(4)
  const [gratitude, setGratitude] = useState('')
  const [keyTakeaway, setKeyTakeaway] = useState('')
  const [shareWithPartner, setShareWithPartner] = useState(true)
  const [showPartnerReflection, setShowPartnerReflection] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Simulate partner reflection after saving
  useEffect(() => {
    if (reflection && !partnerReflection) {
      simulatePartnerReflection(sessionId)
      
      // Show partner reflection after delay
      setTimeout(() => {
        setShowPartnerReflection(true)
      }, 3000)
    }
  }, [reflection, partnerReflection, sessionId, simulatePartnerReflection])

  const handleSubmit = async () => {
    if (!gratitude.trim() || !keyTakeaway.trim()) return

    setIsSubmitting(true)
    
    // Save reflection
    saveReflection({
      sessionId,
      authorId: 'demo-user-1',
      feelingBefore,
      feelingAfter,
      gratitude: gratitude.trim(),
      keyTakeaway: keyTakeaway.trim(),
      shareWithPartner
    })

    // Trigger confetti if feeling improved
    if (feelingAfter > feelingBefore) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
    }

    setIsSubmitting(false)
  }

  const feelingImprovement = feelingAfter - feelingBefore

  return (
    <Dialog open={isReflectionModalOpen} onOpenChange={closeReflectionModal}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-md border-rose-200/40">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
            Reflect on Your Session
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Take a moment to capture your thoughts and feelings after the check-in.
          </DialogDescription>
        </DialogHeader>

        {!reflection ? (
          <div className="space-y-6 mt-4">
            {/* Mood Comparison */}
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-rose-700">
                  How did you feel before the session?
                </Label>
                <div className="flex gap-3 mt-3">
                  {FEELING_EMOJIS.map((emoji) => (
                    <motion.button
                      key={emoji.value}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setFeelingBefore(emoji.value)}
                      className={cn(
                        "flex flex-col items-center gap-1 p-3 rounded-lg transition-all",
                        feelingBefore === emoji.value
                          ? "bg-pink-100 border-2 border-pink-300"
                          : "bg-gray-50 border-2 border-transparent hover:bg-gray-100"
                      )}
                    >
                      <span className="text-2xl">{emoji.emoji}</span>
                      <span className="text-xs text-gray-600">{emoji.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-rose-700">
                  How do you feel after the session?
                </Label>
                <div className="flex gap-3 mt-3">
                  {FEELING_EMOJIS.map((emoji) => (
                    <motion.button
                      key={emoji.value}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setFeelingAfter(emoji.value)}
                      className={cn(
                        "flex flex-col items-center gap-1 p-3 rounded-lg transition-all",
                        feelingAfter === emoji.value
                          ? "bg-green-100 border-2 border-green-300"
                          : "bg-gray-50 border-2 border-transparent hover:bg-gray-100"
                      )}
                    >
                      <span className="text-2xl">{emoji.emoji}</span>
                      <span className="text-xs text-gray-600">{emoji.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Mood Change Indicator */}
              {feelingImprovement !== 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex items-center gap-2 p-3 rounded-lg",
                    feelingImprovement > 0 
                      ? "bg-green-50 text-green-700"
                      : "bg-orange-50 text-orange-700"
                  )}
                >
                  <TrendingUp className={cn(
                    "h-4 w-4",
                    feelingImprovement < 0 && "rotate-180"
                  )} />
                  <span className="text-sm">
                    {feelingImprovement > 0 
                      ? `Your mood improved by ${feelingImprovement} ${feelingImprovement === 1 ? 'level' : 'levels'}!`
                      : `Something to work through - your mood shifted by ${Math.abs(feelingImprovement)} ${Math.abs(feelingImprovement) === 1 ? 'level' : 'levels'}`
                    }
                  </span>
                </motion.div>
              )}
            </div>

            {/* Gratitude Input */}
            <div>
              <Label htmlFor="gratitude" className="text-sm font-medium text-rose-700">
                <Heart className="inline h-4 w-4 mr-1 text-pink-500" />
                One thing you appreciated about your partner today
              </Label>
              <Textarea
                id="gratitude"
                value={gratitude}
                onChange={(e) => setGratitude(e.target.value)}
                placeholder="I appreciated how you..."
                className="mt-2 min-h-[80px]"
                maxLength={200}
              />
              <p className="text-xs text-gray-500 mt-1">
                {gratitude.length}/200 characters
              </p>
            </div>

            {/* Key Takeaway */}
            <div>
              <Label htmlFor="takeaway" className="text-sm font-medium text-rose-700">
                <Sparkles className="inline h-4 w-4 mr-1 text-purple-500" />
                Your biggest insight from this session
              </Label>
              <Textarea
                id="takeaway"
                value={keyTakeaway}
                onChange={(e) => setKeyTakeaway(e.target.value)}
                placeholder="My main takeaway is..."
                className="mt-2 min-h-[80px]"
                maxLength={300}
              />
              <p className="text-xs text-gray-500 mt-1">
                {keyTakeaway.length}/300 characters
              </p>
            </div>

            {/* Privacy Toggle */}
            <Card className="p-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {shareWithPartner ? (
                    <Share2 className="h-4 w-4 text-blue-500" />
                  ) : (
                    <Lock className="h-4 w-4 text-gray-500" />
                  )}
                  <Label htmlFor="share" className="text-sm font-medium cursor-pointer">
                    Share reflection with Jordan
                  </Label>
                </div>
                <Switch
                  id="share"
                  checked={shareWithPartner}
                  onCheckedChange={setShareWithPartner}
                />
              </div>
              <p className="text-xs text-gray-600 mt-2">
                {shareWithPartner 
                  ? "Jordan will be able to see your reflection after they complete theirs"
                  : "Your reflection will be kept private"}
              </p>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-between pt-4 border-t border-rose-100">
              <Button 
                variant="outline" 
                onClick={closeReflectionModal}
                className="border-rose-200 text-rose-600 hover:bg-rose-50"
              >
                Skip for Now
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={!gratitude.trim() || !keyTakeaway.trim() || isSubmitting}
                className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white border-0"
              >
                Save Reflection
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 mt-4">
            {/* Success State */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-8"
            >
              <div className="text-5xl mb-4">🎉</div>
              <h3 className="text-lg font-semibold text-gray-900">
                Reflection Saved!
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                Great job taking time to reflect on your session.
              </p>
            </motion.div>

            {/* Your Reflection Summary */}
            <Card className="p-4 bg-pink-50 border-pink-200">
              <h4 className="text-sm font-medium text-rose-700 mb-3">Your Reflection</h4>
              <div className="space-y-2 text-sm">
                <div className="flex gap-2">
                  <span>Mood:</span>
                  <span>
                    {FEELING_EMOJIS[feelingBefore - 1].emoji} → {FEELING_EMOJIS[feelingAfter - 1].emoji}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Gratitude:</span>
                  <p className="mt-1">{gratitude}</p>
                </div>
                <div>
                  <span className="text-gray-600">Takeaway:</span>
                  <p className="mt-1">{keyTakeaway}</p>
                </div>
              </div>
            </Card>

            {/* Partner Reflection */}
            {showPartnerReflection && partnerReflection && (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <Card className="p-4 bg-blue-50 border-blue-200">
                    <h4 className="text-sm font-medium text-rose-700 mb-3">
                      Jordan&apos;s Reflection
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex gap-2">
                        <span>Mood:</span>
                        <span>
                          {FEELING_EMOJIS[partnerReflection.feelingBefore - 1].emoji} → {FEELING_EMOJIS[partnerReflection.feelingAfter - 1].emoji}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Gratitude:</span>
                        <p className="mt-1">{partnerReflection.gratitude}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Takeaway:</span>
                        <p className="mt-1">{partnerReflection.keyTakeaway}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </AnimatePresence>
            )}

            {/* Close Button */}
            <div className="flex justify-center pt-4 border-t border-rose-100">
              <Button 
                onClick={closeReflectionModal}
                className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white border-0"
              >
                Return to Dashboard
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}