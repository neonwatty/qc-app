'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RemindersChat } from '@/components/reminders/RemindersChat'
import { mockReminders } from '@/lib/mock-data'
import { useRouter } from 'next/navigation'
import { Reminder } from '@/types'

export default function RemindersPage() {
  const router = useRouter()
  const [reminders, setReminders] = useState<Reminder[]>([])

  useEffect(() => {
    // Load reminders from localStorage or use mock data
    const storedReminders = localStorage.getItem('qc-reminders')
    if (storedReminders) {
      setReminders(JSON.parse(storedReminders))
    } else {
      setReminders(mockReminders)
      localStorage.setItem('qc-reminders', JSON.stringify(mockReminders))
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50"
    >
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Relationship Reminders</h1>
              <p className="text-gray-600 mt-2">
                Stay connected with thoughtful reminders for your relationship
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <RemindersChat reminders={reminders} />
      </div>
    </motion.div>
  )
}