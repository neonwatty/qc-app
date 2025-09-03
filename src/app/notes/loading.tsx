import { StickyNote } from 'lucide-react'

export default function NotesLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="h-8 bg-gray-200 rounded w-24 mb-2" />
          <div className="h-5 bg-gray-200 rounded w-72" />
        </div>
        <div className="h-10 bg-gray-200 rounded w-28 mt-4 sm:mt-0" />
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="h-10 bg-gray-200 rounded-lg" />
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 bg-gray-200 rounded w-16" />
          ))}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="h-5 bg-gray-200 rounded w-32" />
              <div className="h-6 bg-gray-200 rounded w-16" />
            </div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2" />
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
            <div className="flex items-center justify-between">
              <div className="h-5 bg-gray-200 rounded w-16" />
              <div className="h-4 bg-gray-200 rounded w-12" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}