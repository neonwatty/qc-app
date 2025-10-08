'use client'

import React, { useState } from 'react'
import { Plus, X, Download, Share2, Heart, Calendar, MapPin, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { MotionBox, StaggerContainer, StaggerItem } from '@/components/ui/motion'
import { LazyImage } from '@/components/ui/LazyComponents'
import { format } from 'date-fns'

interface Memory {
  id: string
  imageUrl: string
  thumbnail: string
  title: string
  description: string
  date: Date
  location?: string
  tags: string[]
  isFavorite: boolean
  sharedWith: 'both' | 'private'
  milestone?: string
}

const mockMemories: Memory[] = [
  {
    id: '1',
    imageUrl: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=1200&h=800&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=400&h=300&fit=crop',
    title: 'First Date Anniversary',
    description: 'Recreating our first date at the same coffee shop where we met',
    date: new Date('2024-02-14'),
    location: 'Blue Bottle Coffee, Downtown',
    tags: ['anniversary', 'date night', 'special'],
    isFavorite: true,
    sharedWith: 'both',
    milestone: 'First Date Anniversary'
  },
  {
    id: '2',
    imageUrl: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=1200&h=800&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=300&fit=crop',
    title: 'Weekend Getaway',
    description: 'Our first trip together to the mountains',
    date: new Date('2024-03-22'),
    location: 'Yosemite National Park',
    tags: ['travel', 'adventure', 'nature'],
    isFavorite: false,
    sharedWith: 'both'
  },
  {
    id: '3',
    imageUrl: 'https://images.unsplash.com/photo-1529123202249-4d6224d352c8?w=1200&h=800&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1529123202249-4d6224d352c8?w=400&h=300&fit=crop',
    title: 'Cooking Together',
    description: 'First time making homemade pasta - it was a disaster but so much fun!',
    date: new Date('2024-04-15'),
    location: 'Home',
    tags: ['home', 'cooking', 'fun'],
    isFavorite: true,
    sharedWith: 'both'
  },
  {
    id: '4',
    imageUrl: 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=1200&h=800&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=400&h=300&fit=crop',
    title: 'Concert Night',
    description: 'Seeing our favorite band live together',
    date: new Date('2024-05-10'),
    location: 'The Fillmore',
    tags: ['music', 'concert', 'date night'],
    isFavorite: false,
    sharedWith: 'both'
  },
  {
    id: '5',
    imageUrl: 'https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=1200&h=800&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=400&h=300&fit=crop',
    title: 'Beach Day',
    description: 'Perfect sunset at our favorite beach spot',
    date: new Date('2024-06-20'),
    location: 'Santa Cruz Beach',
    tags: ['beach', 'summer', 'sunset'],
    isFavorite: true,
    sharedWith: 'both'
  },
  {
    id: '6',
    imageUrl: 'https://images.unsplash.com/photo-1516733968668-dbdce39c4651?w=1200&h=800&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1516733968668-dbdce39c4651?w=400&h=300&fit=crop',
    title: 'Game Night',
    description: 'Our monthly board game marathon with friends',
    date: new Date('2024-07-05'),
    location: 'Home',
    tags: ['friends', 'games', 'fun'],
    isFavorite: false,
    sharedWith: 'both'
  },
  {
    id: '7',
    imageUrl: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=1200&h=800&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=400&h=300&fit=crop',
    title: 'Hiking Adventure',
    description: 'Reached the summit after a challenging 5-hour hike',
    date: new Date('2024-08-12'),
    location: 'Mt. Tam State Park',
    tags: ['hiking', 'achievement', 'nature'],
    isFavorite: true,
    sharedWith: 'both',
    milestone: 'First Summit Together'
  },
  {
    id: '8',
    imageUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1200&h=800&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=400&h=300&fit=crop',
    title: 'Birthday Surprise',
    description: 'The surprise party we planned together for a friend',
    date: new Date('2024-08-28'),
    location: 'Downtown Restaurant',
    tags: ['celebration', 'friends', 'surprise'],
    isFavorite: false,
    sharedWith: 'both'
  },
  {
    id: '9',
    imageUrl: 'https://images.unsplash.com/photo-1481349518771-20055b2a7b24?w=1200&h=800&fit=crop',
    thumbnail: 'https://images.unsplash.com/photo-1481349518771-20055b2a7b24?w=400&h=300&fit=crop',
    title: 'Farmers Market',
    description: 'Our weekly tradition - Saturday morning farmers market',
    date: new Date('2024-09-01'),
    location: 'Ferry Building',
    tags: ['tradition', 'weekend', 'food'],
    isFavorite: false,
    sharedWith: 'both'
  }
]

interface PhotoGalleryProps {
  onAddMemory?: () => void
}

export function PhotoGallery({ onAddMemory }: PhotoGalleryProps) {
  const [memories] = useState<Memory[]>(mockMemories)
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null)
  const [filter, setFilter] = useState<'all' | 'favorites'>('all')

  const filteredMemories = filter === 'favorites' 
    ? memories.filter(m => m.isFavorite)
    : memories

  const handleMemoryClick = (memory: Memory) => {
    setSelectedMemory(memory)
  }

  const handleClose = () => {
    setSelectedMemory(null)
  }

  const handleShare = (memory: Memory) => {
    // Implement share functionality
    console.log('Sharing memory:', memory.title)
  }

  const handleDownload = (memory: Memory) => {
    // Implement download functionality
    const link = document.createElement('a')
    link.href = memory.imageUrl
    link.download = `${memory.title.replace(/\s+/g, '-').toLowerCase()}.jpg`
    link.click()
  }

  const toggleFavorite = (memory: Memory) => {
    // In a real app, this would update the database
    memory.isFavorite = !memory.isFavorite
    setSelectedMemory({ ...memory })
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            All Memories ({memories.length})
          </Button>
          <Button
            variant={filter === 'favorites' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('favorites')}
          >
            <Heart className="h-4 w-4 mr-1" />
            Favorites ({memories.filter(m => m.isFavorite).length})
          </Button>
        </div>
        <Button onClick={onAddMemory} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Memory
        </Button>
      </div>

      {/* Photo Grid */}
      <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredMemories.map((memory) => (
          <StaggerItem key={memory.id}>
            <div 
              className="group relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer bg-gray-100"
              onClick={() => handleMemoryClick(memory)}
            >
              <LazyImage
                src={memory.thumbnail}
                alt={memory.title}
                width={400}
                height={300}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                quality={85}
              />
              
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                  <p className="font-semibold text-sm line-clamp-1">{memory.title}</p>
                  <p className="text-xs opacity-90 mt-1">
                    {format(memory.date, 'MMM d, yyyy')}
                  </p>
                </div>
              </div>

              {/* Favorite indicator */}
              {memory.isFavorite && (
                <div className="absolute top-2 right-2">
                  <div className="bg-white/90 backdrop-blur-sm rounded-full p-1.5">
                    <Heart className="h-4 w-4 text-red-500 fill-red-500" />
                  </div>
                </div>
              )}

              {/* Milestone badge */}
              {memory.milestone && (
                <div className="absolute top-2 left-2">
                  <Badge className="bg-purple-500 text-white text-xs">
                    Milestone
                  </Badge>
                </div>
              )}
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* Lightbox Dialog */}
      <Dialog open={!!selectedMemory} onOpenChange={() => handleClose()}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          {selectedMemory && (
            <div className="relative">
              {/* Close button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm hover:bg-white"
                onClick={handleClose}
              >
                <X className="h-4 w-4" />
              </Button>

              {/* Image */}
              <div className="relative bg-black">
                <LazyImage
                  src={selectedMemory.imageUrl}
                  alt={selectedMemory.title}
                  width={1200}
                  height={800}
                  className="w-full max-h-[60vh] object-contain"
                  quality={95}
                  priority
                />
              </div>

              {/* Details */}
              <div className="p-6 space-y-4 bg-white">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {selectedMemory.title}
                    </h3>
                    <p className="text-gray-600 mt-2">
                      {selectedMemory.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleFavorite(selectedMemory)}
                    >
                      <Heart 
                        className={`h-5 w-5 ${selectedMemory.isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-400'}`}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleShare(selectedMemory)}
                    >
                      <Share2 className="h-5 w-5 text-gray-400" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDownload(selectedMemory)}
                    >
                      <Download className="h-5 w-5 text-gray-400" />
                    </Button>
                  </div>
                </div>

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1.5" />
                    {format(selectedMemory.date, 'MMMM d, yyyy')}
                  </div>
                  {selectedMemory.location && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1.5" />
                      {selectedMemory.location}
                    </div>
                  )}
                  {selectedMemory.milestone && (
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                      {selectedMemory.milestone}
                    </Badge>
                  )}
                </div>

                {/* Tags */}
                {selectedMemory.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedMemory.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}