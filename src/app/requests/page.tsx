'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RequestsInbox } from '@/components/requests/RequestsInbox'
import { mockRelationshipRequests } from '@/lib/mock-requests'
import { useRouter } from 'next/navigation'
import { RelationshipRequest } from '@/types'

export default function RequestsPage() {
  const router = useRouter()
  const [requests, setRequests] = useState<RelationshipRequest[]>(mockRelationshipRequests)

  useEffect(() => {
    // For demo purposes, always use the latest mock data
    // In a real app, you would load from localStorage or API
    localStorage.setItem('qc-requests', JSON.stringify(mockRelationshipRequests))
  }, [])

  const handleUpdateRequest = (updatedRequest: RelationshipRequest) => {
    setRequests(prev => prev.map(r => 
      r.id === updatedRequest.id ? updatedRequest : r
    ))
  }

  const handleCreateRequest = (newRequest: RelationshipRequest) => {
    setRequests(prev => [newRequest, ...prev])
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50"
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
              <h1 className="text-3xl font-bold text-gray-900">Relationship Requests</h1>
              <p className="text-gray-600 mt-2">
                Send and receive thoughtful requests with your partner
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <RequestsInbox 
          requests={requests}
          onUpdateRequest={handleUpdateRequest}
          onCreateRequest={handleCreateRequest}
        />
      </div>
    </motion.div>
  )
}