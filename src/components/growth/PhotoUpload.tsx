'use client'

import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Camera, 
  Upload, 
  X, 
  Image, 
  RefreshCw,
  Check,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface PhotoUploadProps {
  value?: string | null
  onPhotoChange: (photo: string | null) => void
  maxSizeMB?: number
  acceptedFormats?: string[]
  className?: string
  variant?: 'default' | 'compact' | 'minimal'
  showPreview?: boolean
  placeholder?: string
}

const mockPhotos = [
  '📸', '🌅', '🌺', '🎂', '🏖️', '🌟', '💐', '🎉', 
  '🌈', '🦋', '🌸', '🏔️', '🌊', '🍰', '🎈', '⭐'
]

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  value,
  onPhotoChange,
  maxSizeMB = 5,
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp'],
  className,
  variant = 'default',
  showPreview = true,
  placeholder = 'Add a photo to commemorate this milestone'
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showMockSelector, setShowMockSelector] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (file: File) => {
    try {
      setError(null)
      setIsUploading(true)

      // Validate file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        throw new Error(`File size must be less than ${maxSizeMB}MB`)
      }

      // Validate file type
      if (!acceptedFormats.includes(file.type)) {
        throw new Error('File format not supported')
      }

      // Simulate upload delay for demo purposes
      await new Promise(resolve => setTimeout(resolve, 1500))

      // In a real app, you would upload to a service here
      // For demo, we'll use a placeholder URL
      const mockUrl = `data:${file.type};base64,${btoa('mock-image-data')}`
      onPhotoChange(mockUrl)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      await handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      await handleFileSelect(files[0])
    }
  }

  const handleMockPhotoSelect = (emoji: string) => {
    onPhotoChange(emoji)
    setShowMockSelector(false)
  }

  const handleRemovePhoto = () => {
    onPhotoChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const openMockSelector = () => {
    setShowMockSelector(true)
  }

  if (variant === 'minimal') {
    return (
      <div className={cn('space-y-2', className)}>
        {value ? (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl">{value}</div>
            <span className="text-sm text-gray-600 flex-1">Photo selected</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemovePhoto}
              className="text-gray-500 hover:text-red-500"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={openFileDialog}
              disabled={isUploading}
              className="flex-1"
            >
              {isUploading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={openMockSelector}
              disabled={isUploading}
            >
              <Image className="h-4 w-4" />
            </Button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
        />

        <AnimatePresence>
          {showMockSelector && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border rounded-lg p-3 bg-white"
            >
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-medium">Choose an emoji</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMockSelector(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-8 gap-2">
                {mockPhotos.map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => handleMockPhotoSelect(emoji)}
                    className="aspect-square flex items-center justify-center text-xl rounded-lg border hover:bg-gray-50 transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={cn('space-y-3', className)}>
        {value && showPreview ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{value}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1 text-green-600 mb-1">
                      <Check className="h-4 w-4" />
                      <span className="text-sm font-medium">Photo added</span>
                    </div>
                    <p className="text-xs text-gray-500">Ready to create milestone</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemovePhoto}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={openFileDialog}
              disabled={isUploading}
              className="h-12"
            >
              {isUploading ? (
                <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <Upload className="h-5 w-5 mr-2" />
              )}
              {isUploading ? 'Uploading...' : 'Upload Photo'}
            </Button>
            <Button
              variant="outline"
              onClick={openMockSelector}
              disabled={isUploading}
              className="h-12"
            >
              <Image className="h-5 w-5 mr-2" />
              Choose Icon
            </Button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedFormats.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
        />

        <AnimatePresence>
          {showMockSelector && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-medium">Select an icon</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowMockSelector(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-8 gap-2">
                    {mockPhotos.map((emoji, index) => (
                      <motion.button
                        key={index}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleMockPhotoSelect(emoji)}
                        className="aspect-square flex items-center justify-center text-2xl rounded-lg border hover:bg-gray-50 transition-colors"
                      >
                        {emoji}
                      </motion.button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg"
          >
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </motion.div>
        )}
      </div>
    )
  }

  // Default variant
  return (
    <div className={cn('space-y-4', className)}>
      {value && showPreview ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
        >
          <Card>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <div className="text-6xl">{value}</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <Check className="h-5 w-5" />
                    <span className="font-medium">Photo selected</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    This will be associated with your milestone
                  </p>
                </div>
                <div className="flex justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openFileDialog}
                    disabled={isUploading}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Change Photo
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openMockSelector}
                    disabled={isUploading}
                  >
                    <Image className="h-4 w-4 mr-2" />
                    Choose Icon
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemovePhoto}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <Card
          className={cn(
            'border-2 border-dashed transition-colors',
            isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400',
            isUploading && 'border-blue-400 bg-blue-50'
          )}
        >
          <CardContent
            className="p-8"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="text-center space-y-4">
              {isUploading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <RefreshCw className="h-12 w-12 mx-auto text-blue-500 animate-spin" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Uploading photo...
                    </h3>
                    <p className="text-gray-600">Please wait while we process your image</p>
                  </div>
                </motion.div>
              ) : (
                <>
                  <div className="flex justify-center">
                    <div className="p-4 bg-gray-100 rounded-full">
                      <Camera className="h-8 w-8 text-gray-600" />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Add a photo
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {placeholder}
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-center gap-3">
                      <Button onClick={openFileDialog} className="px-6">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Photo
                      </Button>
                      <Button variant="outline" onClick={openMockSelector} className="px-6">
                        <Image className="h-4 w-4 mr-2" />
                        Choose Icon
                      </Button>
                    </div>
                    
                    <p className="text-xs text-gray-500">
                      Or drag and drop a photo here (max {maxSizeMB}MB)
                    </p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedFormats.join(',')}
        onChange={handleFileInputChange}
        className="hidden"
      />

      <AnimatePresence>
        {showMockSelector && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-medium">Choose an icon for your milestone</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMockSelector(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-8 gap-3">
                  {mockPhotos.map((emoji, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleMockPhotoSelect(emoji)}
                      className="aspect-square flex items-center justify-center text-3xl rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      {emoji}
                    </motion.button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <div>
                  <h4 className="text-sm font-medium text-red-800">Upload Error</h4>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setError(null)}
                  className="ml-auto text-red-500 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}