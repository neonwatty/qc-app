'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Filter, Inbox, Send, Check, X, Clock, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RequestCard } from './RequestCard'
import { CreateRequestModal } from './CreateRequestModal'
import { RequestResponseModal } from './RequestResponseModal'
import { RelationshipRequest } from '@/types'
import { mockUsers } from '@/lib/mock-data'

interface RequestsInboxProps {
  requests: RelationshipRequest[]
  onUpdateRequest: (request: RelationshipRequest) => void
  onCreateRequest: (request: RelationshipRequest) => void
}

export function RequestsInbox({ requests, onUpdateRequest, onCreateRequest }: RequestsInboxProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<RelationshipRequest | null>(null)
  const [showResponseModal, setShowResponseModal] = useState(false)
  const [activeTab, setActiveTab] = useState('received')

  const currentUserId = mockUsers[0].id // Deb is the current user

  // Filter requests by sent/received
  const { sentRequests, receivedRequests } = useMemo(() => {
    const sent = requests.filter(r => r.requestedBy === currentUserId)
    const received = requests.filter(r => r.requestedFor === currentUserId)
    return { sentRequests: sent, receivedRequests: received }
  }, [requests, currentUserId])

  // Filter by search query
  const filteredSentRequests = sentRequests.filter(r =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredReceivedRequests = receivedRequests.filter(r =>
    r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Count pending requests
  const pendingReceivedCount = receivedRequests.filter(r => r.status === 'pending').length
  const pendingSentCount = sentRequests.filter(r => r.status === 'pending').length

  const handleRequestClick = (request: RelationshipRequest) => {
    setSelectedRequest(request)
    if (request.requestedFor === currentUserId && request.status === 'pending') {
      setShowResponseModal(true)
    }
  }

  const handleResponse = (updatedRequest: RelationshipRequest) => {
    onUpdateRequest(updatedRequest)
    setShowResponseModal(false)
    setSelectedRequest(null)
  }

  const getStatusIcon = (status: RelationshipRequest['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />
      case 'accepted':
        return <Check className="w-4 h-4" />
      case 'declined':
        return <X className="w-4 h-4" />
      case 'converted':
        return <RefreshCw className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: RelationshipRequest['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-700'
      case 'accepted':
        return 'bg-green-100 text-green-700'
      case 'declined':
        return 'bg-red-100 text-red-700'
      case 'converted':
        return 'bg-blue-100 text-blue-700'
    }
  }

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-white/70 border-purple-200 focus:border-purple-400"
          />
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Request
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="received" className="relative">
            <Inbox className="w-4 h-4 mr-2" />
            Received
            {pendingReceivedCount > 0 && (
              <Badge className="ml-2 bg-purple-600 text-white">
                {pendingReceivedCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="sent" className="relative">
            <Send className="w-4 h-4 mr-2" />
            Sent
            {pendingSentCount > 0 && (
              <Badge className="ml-2 bg-gray-600 text-white">
                {pendingSentCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Received Requests */}
        <TabsContent value="received" className="space-y-4 mt-6">
          {filteredReceivedRequests.length === 0 ? (
            <div className="text-center py-12">
              <Inbox className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No received requests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReceivedRequests.map((request) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => handleRequestClick(request)}
                  className="cursor-pointer"
                >
                  <RequestCard
                    request={request}
                    isReceived={true}
                    currentUserId={currentUserId}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Sent Requests */}
        <TabsContent value="sent" className="space-y-4 mt-6">
          {filteredSentRequests.length === 0 ? (
            <div className="text-center py-12">
              <Send className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No sent requests</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSentRequests.map((request) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => handleRequestClick(request)}
                  className="cursor-pointer"
                >
                  <RequestCard
                    request={request}
                    isReceived={false}
                    currentUserId={currentUserId}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CreateRequestModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={onCreateRequest}
        currentUserId={currentUserId}
      />

      {selectedRequest && (
        <RequestResponseModal
          isOpen={showResponseModal}
          onClose={() => {
            setShowResponseModal(false)
            setSelectedRequest(null)
          }}
          request={selectedRequest}
          onResponse={handleResponse}
          currentUserId={currentUserId}
        />
      )}
    </div>
  )
}