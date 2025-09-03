import { Settings } from 'lucide-react'

export default function SettingsLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 bg-gray-200 rounded w-32 mb-2" />
          <div className="h-5 bg-gray-200 rounded w-64" />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <nav className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center px-4 py-3 rounded-lg bg-gray-100">
                <div className="h-5 w-5 bg-gray-200 rounded mr-3" />
                <div>
                  <div className="h-4 bg-gray-200 rounded w-32 mb-1" />
                  <div className="h-3 bg-gray-200 rounded w-24 lg:hidden" />
                </div>
              </div>
            ))}
          </nav>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="space-y-6">
              <div className="h-6 bg-gray-200 rounded w-48 mb-4" />
              
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
                  <div className="h-10 bg-gray-200 rounded w-full" />
                </div>
                <div>
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
                  <div className="h-10 bg-gray-200 rounded w-full" />
                </div>
                <div className="sm:col-span-2">
                  <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
                  <div className="h-10 bg-gray-200 rounded w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}