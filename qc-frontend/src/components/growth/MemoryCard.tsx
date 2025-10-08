'use client'

import React, { useState } from 'react'
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreVertical, 
  Calendar,
  MapPin,
  Tag,
  Edit3,
  Trash2,
  Download,
  Eye,
  EyeOff
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { LazyImage } from '@/components/ui/LazyComponents'
import { format, formatDistanceToNow } from 'date-fns'

interface MemoryCardProps {
  id: string
  imageUrl: string
  title: string
  description: string
  date: Date
  location?: string
  tags: string[]
  isFavorite: boolean
  isPrivate: boolean
  milestone?: string
  notes?: string
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onToggleFavorite?: () => void
  onTogglePrivacy?: () => void
  onShare?: () => void
  variant?: 'default' | 'compact'
}

export function MemoryCard({
  id,
  imageUrl,
  title,
  description,
  date,
  location,
  tags,
  isFavorite,
  isPrivate,
  milestone,
  notes,
  onView,
  onEdit,
  onDelete,
  onToggleFavorite,
  onTogglePrivacy,
  onShare,
  variant = 'default'
}: MemoryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const [localNotes, setLocalNotes] = useState(notes || '')
  const [isEditingNotes, setIsEditingNotes] = useState(false)

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleFavorite?.()
  }

  const handleSaveNotes = () => {
    // In a real app, this would save to the database
    setIsEditingNotes(false)
  }

  const timeAgo = formatDistanceToNow(date, { addSuffix: true })

  if (variant === 'compact') {
    return (
      <div 
        className="group relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer bg-gray-100"
        onClick={onView}
      >
        <LazyImage
          src={imageUrl}
          alt={title}
          width={400}
          height={300}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          quality={85}
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
            <p className="font-semibold text-sm line-clamp-1">{title}</p>
            <p className="text-xs opacity-90 mt-1">{timeAgo}</p>
          </div>
        </div>

        {isFavorite && (
          <div className="absolute top-2 right-2">
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-1.5">
              <Heart className="h-4 w-4 text-red-500 fill-red-500" />
            </div>
          </div>
        )}

        {milestone && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-purple-500 text-white text-xs">
              Milestone
            </Badge>
          </div>
        )}

        {isPrivate && (
          <div className="absolute top-2 right-2">
            <div className="bg-black/50 backdrop-blur-sm rounded-full p-1.5">
              <EyeOff className="h-4 w-4 text-white" />
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="p-0">
        <div className="relative">
          <div onClick={onView} className="cursor-pointer">
            <LazyImage
              src={imageUrl}
              alt={title}
              width={400}
              height={300}
              className="w-full h-48 object-cover"
              quality={85}
            />
          </div>
          
          {milestone && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-purple-500 text-white">
                {milestone}
              </Badge>
            </div>
          )}

          <div className="absolute top-3 right-3 flex items-center space-x-2">
            {isPrivate && (
              <div className="bg-black/50 backdrop-blur-sm rounded-full p-2">
                <EyeOff className="h-4 w-4 text-white" />
              </div>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="bg-white/90 backdrop-blur-sm hover:bg-white"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onView}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Full Size
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onEdit}>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onTogglePrivacy}>
                  {isPrivate ? (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Make Shared
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Make Private
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  // Download functionality
                  const link = document.createElement('a')
                  link.href = imageUrl
                  link.download = `${title.replace(/\s+/g, '-').toLowerCase()}.jpg`
                  link.click()
                }}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={onDelete}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Memory
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
              {title}
            </h3>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1.5" />
              {format(date, 'MMM d, yyyy')}
            </div>
            {location && (
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1.5" />
                {location}
              </div>
            )}
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
              {tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{tags.length - 3} more
                </Badge>
              )}
            </div>
          )}

          {/* Personal Notes Section */}
          <div className="pt-2 border-t border-gray-100">
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <MessageCircle className="h-4 w-4 mr-1.5" />
              {localNotes ? 'View notes' : 'Add notes'}
            </button>
            
            {showNotes && (
              <div className="mt-3">
                {isEditingNotes ? (
                  <div className="space-y-2">
                    <Textarea
                      value={localNotes}
                      onChange={(e) => setLocalNotes(e.target.value)}
                      placeholder="Add personal notes about this memory..."
                      className="min-h-[80px] text-sm"
                    />
                    <div className="flex justify-end space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setIsEditingNotes(false)
                          setLocalNotes(notes || '')
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveNotes}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {localNotes ? (
                      <p className="text-sm text-gray-600 whitespace-pre-wrap">
                        {localNotes}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400 italic">
                        No notes yet
                      </p>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsEditingNotes(true)}
                      className="text-xs"
                    >
                      <Edit3 className="h-3 w-3 mr-1" />
                      {localNotes ? 'Edit notes' : 'Add notes'}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleFavorite}
            className="hover:bg-transparent"
          >
            <Heart 
              className={`h-5 w-5 transition-colors ${
                isFavorite 
                  ? 'text-red-500 fill-red-500' 
                  : 'text-gray-400 hover:text-red-500'
              }`}
            />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onShare}
            className="hover:bg-transparent"
          >
            <Share2 className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </Button>
        </div>
        <span className="text-xs text-gray-500">
          {timeAgo}
        </span>
      </CardFooter>
    </Card>
  )
}