import { TrendingUp } from 'lucide-react'

export default function GrowthLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="text-center">
        <div className="bg-green-100 rounded-full p-3 w-14 h-14 mx-auto mb-4" />
        <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4" />
        <div className="h-5 bg-gray-200 rounded w-96 mx-auto" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
            <div className="h-8 bg-gray-200 rounded w-12 mx-auto mb-2" />
            <div className="h-4 bg-gray-200 rounded w-20 mx-auto" />
          </div>
        ))}
      </div>

      <div className="flex justify-center">
        <div className="bg-gray-100 p-1 rounded-lg">
          <div className="flex gap-1">
            <div className="h-8 bg-gray-200 rounded w-24" />
            <div className="h-8 bg-gray-200 rounded w-24" />
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div>
          <div className="h-6 bg-gray-200 rounded w-48 mb-6" />
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-200 rounded-full" />
                </div>
                <div className="ml-4 flex-1">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="h-6 bg-gray-200 rounded w-48 mb-3" />
                    <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-32" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}