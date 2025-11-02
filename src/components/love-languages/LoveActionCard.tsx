'use client'

import { LoveAction } from '@/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Circle, Calendar, User, Sparkles, Heart, Clock, Edit2, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface LoveActionCardProps {
  action: LoveAction
  onComplete?: () => void
  onEdit?: () => void
  onDelete?: () => void
}

const statusColors = {
  suggested: 'bg-blue-100 text-blue-700',
  planned: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700',
  recurring: 'bg-purple-100 text-purple-700',
}

const difficultyColors = {
  easy: 'text-green-600',
  moderate: 'text-yellow-600',
  challenging: 'text-red-600',
}

const suggestedByIcons = {
  self: User,
  partner: Heart,
  ai: Sparkles,
}

export function LoveActionCard({ action, onComplete, onEdit, onDelete }: LoveActionCardProps) {
  const SuggestedIcon = suggestedByIcons[action.suggestedBy]
  const isCompleted = action.status === 'completed'

  return (
    <Card className={cn('bg-white hover:shadow-lg transition-all', isCompleted && 'opacity-75')}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {action.status === 'completed' ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <Circle className="h-5 w-5 text-gray-400" />
              )}
              <CardTitle className={cn('text-lg text-gray-900', isCompleted && 'line-through')}>
                {action.title}
              </CardTitle>
            </div>
            <CardDescription className="mt-1 text-gray-700">{action.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {action.linkedLanguageTitle && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Heart className="h-4 w-4" />
              <span>For: {action.linkedLanguageTitle}</span>
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={statusColors[action.status]}>
              {action.status}
            </Badge>
            
            {action.frequency && (
              <Badge variant="outline" className="text-gray-700">
                <Clock className="h-3 w-3 mr-1" />
                {action.frequency}
              </Badge>
            )}

            <Badge variant="secondary" className="flex items-center gap-1 text-gray-700">
              <SuggestedIcon className="h-3 w-3" />
              {action.suggestedBy === 'self' ? 'You' : action.suggestedBy === 'partner' ? 'Partner' : 'AI'}
            </Badge>

            <span className={cn('text-sm font-medium', difficultyColors[action.difficulty])}>
              {action.difficulty}
            </span>
          </div>

          {action.plannedFor && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Planned for {format(new Date(action.plannedFor), 'MMM d, yyyy')}</span>
            </div>
          )}

          {action.completedCount > 0 && (
            <div className="text-sm text-gray-600">
              Completed {action.completedCount} {action.completedCount === 1 ? 'time' : 'times'}
              {action.lastCompletedAt && (
                <span> • Last on {format(new Date(action.lastCompletedAt), 'MMM d')}</span>
              )}
            </div>
          )}

          {action.notes && (
            <p className="text-sm text-gray-600 italic">&ldquo;{action.notes}&rdquo;</p>
          )}

          <div className="flex items-center gap-2 pt-2">
            {!isCompleted && onComplete && (
              <Button onClick={onComplete} size="sm" className="flex-1">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Mark Complete
              </Button>
            )}
            {onEdit && (
              <Button onClick={onEdit} variant="outline" size="sm" className={!isCompleted ? '' : 'flex-1'}>
                <Edit2 className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button onClick={onDelete} variant="outline" size="sm">
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}