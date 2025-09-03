import { Heart } from 'lucide-react'

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-200 border-t-pink-600 mx-auto mb-4" />
        <div className="flex items-center justify-center mb-2">
          <Heart className="h-5 w-5 text-pink-500 mr-2 animate-pulse" />
          <span className="text-lg font-medium text-gray-900">Quality Control</span>
        </div>
        <p className="text-gray-600">Loading your relationship dashboard...</p>
      </div>
    </div>
  )
}