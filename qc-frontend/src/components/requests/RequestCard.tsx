'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { RelationshipRequest } from '@/types'
import { mockUsers } from '@/lib/mock-data'
import { format } from 'date-fns'
import { 
  Calendar, 
  Clock, 
  Check, 
  X, 
  RefreshCw, 
  AlertCircle,
  Heart,
  Briefcase,
  MessageSquare,
  Bell,
  Sparkles,
  MoreHorizontal
} from 'lucide-react'

interface RequestCardProps {
  request: RelationshipRequest
  isReceived: boolean
  currentUserId: string
}

export function RequestCard({ request, isReceived, currentUserId }: RequestCardProps) {
  const sender = mockUsers.find(u => u.id === request.requestedBy)
  const receiver = mockUsers.find(u => u.id === request.requestedFor)
  const otherUser = isReceived ? sender : receiver

  const getCategoryIcon = (category: RelationshipRequest['category']) => {
    switch (category) {
      case 'activity':
        return <Heart className="w-4 h-4" />
      case 'task':
        return <Briefcase className="w-4 h-4" />
      case 'conversation':
        return <MessageSquare className="w-4 h-4" />
      case 'reminder':
        return <Bell className="w-4 h-4" />
      case 'date-night':
        return <Sparkles className="w-4 h-4" />
      default:
        return <MoreHorizontal className="w-4 h-4" />
    }
  }

  const getCategoryColor = (category: RelationshipRequest['category']) => {
    switch (category) {
      case 'activity':
        return 'bg-pink-100 text-pink-700'
      case 'task':
        return 'bg-blue-100 text-blue-700'
      case 'conversation':
        return 'bg-purple-100 text-purple-700'
      case 'reminder':
        return 'bg-amber-100 text-amber-700'
      case 'date-night':
        return 'bg-rose-100 text-rose-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
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

  const getPriorityColor = (priority: RelationshipRequest['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700'
      case 'medium':
        return 'bg-amber-100 text-amber-700'
      case 'low':
        return 'bg-green-100 text-green-700'
    }
  }

  return (
    <Card className="p-4 hover:shadow-lg transition-shadow bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 border-purple-100">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <Avatar className="w-10 h-10">
          <AvatarFallback className="bg-gradient-to-br from-purple-100 to-pink-100 text-purple-700">
            {otherUser?.name.charAt(0)}
          </AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 space-y-2">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">{request.title}</h3>
              <p className="text-sm text-gray-600 mt-1">
                {isReceived ? `From ${sender?.name}` : `To ${receiver?.name}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(request.status)}>
                {getStatusIcon(request.status)}
                <span className="ml-1 capitalize">{request.status}</span>
              </Badge>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-700 line-clamp-2">
            {request.description}
          </p>

          {/* Meta Info */}
          <div className="flex items-center gap-3 text-xs">
            <Badge variant="outline" className={getCategoryColor(request.category)}>
              {getCategoryIcon(request.category)}
              <span className="ml-1 capitalize">{request.category.replace('-', ' ')}</span>
            </Badge>

            <Badge variant="outline" className={getPriorityColor(request.priority)}>
              <AlertCircle className="w-3 h-3 mr-1" />
              {request.priority}
            </Badge>

            {request.suggestedDate && (
              <div className="flex items-center text-gray-500">
                <Calendar className="w-3 h-3 mr-1" />
                {format(request.suggestedDate, 'MMM d')}
              </div>
            )}

            {request.suggestedFrequency === 'recurring' && (
              <Badge variant="outline" className="bg-purple-50 text-purple-700">
                <RefreshCw className="w-3 h-3 mr-1" />
                Recurring
              </Badge>
            )}
          </div>

          {/* Response (if any) */}
          {request.response && (
            <div className="mt-2 p-2 bg-white/60 rounded-lg border border-purple-100">
              <p className="text-xs text-gray-600 italic">&ldquo;{request.response}&rdquo;</p>
            </div>
          )}

          {/* Tags */}
          {request.tags && request.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
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
  )
}