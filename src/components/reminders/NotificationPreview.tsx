'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Smartphone, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useState } from 'react'

interface NotificationPreviewProps {
  title: string
  message: string
  onClose?: () => void
  type?: 'lockscreen' | 'banner' | 'badge'
}

export function NotificationPreview({ title, message, onClose, type = 'lockscreen' }: NotificationPreviewProps) {
  const [visible, setVisible] = useState(true)

  const handleClose = () => {
    setVisible(false)
    setTimeout(() => onClose?.(), 300)
  }

  if (type === 'lockscreen') {
    return (
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={handleClose}
          >
            <motion.div
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              className="w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="bg-white/95 backdrop-blur-xl border-gray-200 shadow-2xl">
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-pink-100 rounded-lg">
                      <Bell className="w-5 h-5 text-pink-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-500">QC - Relationship Reminders</span>
                        <span className="text-xs text-gray-400">now</span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                      <p className="text-sm text-gray-600">{message}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClose}
                      className="shrink-0 h-6 w-6 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="mt-3 pt-3 border-t flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={handleClose}>
                      Snooze
                    </Button>
                    <Button size="sm" className="flex-1 bg-pink-600 hover:bg-pink-700" onClick={handleClose}>
                      Complete
                    </Button>
                  </div>
                </div>
              </Card>
              <div className="text-center mt-3">
                <p className="text-xs text-white/70">Swipe up to open • Swipe away to dismiss</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  if (type === 'banner') {
    return (
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto"
          >
            <Card className="bg-white shadow-lg border-gray-200">
              <div className="p-3">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 bg-pink-100 rounded">
                    <Bell className="w-4 h-4 text-pink-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{title}</h4>
                    <p className="text-xs text-gray-600 mt-0.5">{message}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClose}
                    className="h-5 w-5 p-0"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  return null
}

export function NotificationDemo() {
  const [showLockscreen, setShowLockscreen] = useState(false)
  const [showBanner, setShowBanner] = useState(false)

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Smartphone className="w-5 h-5" />
          Notification Preview
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          See how your reminders will appear on your device
        </p>
        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowLockscreen(true)}
          >
            Lock Screen Preview
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowBanner(true)}
          >
            Banner Preview
          </Button>
        </div>
      </Card>

      {showLockscreen && (
        <NotificationPreview
          title="Daily Love Affirmation"
          message="Tell Jordan you love them today! A simple 'I love you' can make their whole day brighter. 💝"
          onClose={() => setShowLockscreen(false)}
          type="lockscreen"
        />
      )}

      {showBanner && (
        <NotificationPreview
          title="Check-in Reminder"
          message="Time for your weekly relationship check-in!"
          onClose={() => setShowBanner(false)}
          type="banner"
        />
      )}
    </div>
  )
}