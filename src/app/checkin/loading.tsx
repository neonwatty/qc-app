import { MessageCircle } from 'lucide-react'

export default function CheckinLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="text-center">
        <div className="bg-pink-100 rounded-full p-3 w-14 h-14 mx-auto mb-4" />
        <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4" />
        <div className="h-5 bg-gray-200 rounded w-96 mx-auto" />
      </div>

      <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-6 bg-gray-200 rounded w-48 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-32" />
          </div>
          <div className="h-10 bg-gray-200 rounded w-24" />
        </div>
      </div>

      <div>
        <div className="h-6 bg-gray-200 rounded w-64 mb-4" />
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg border-2 border-gray-200 p-6">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded" />
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded w-32 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}