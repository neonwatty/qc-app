'use client'

import React from 'react'
import { Heart } from 'lucide-react'

interface HeaderProps {
  className?: string
}

export const Header: React.FC<HeaderProps> = ({ className = '' }) => {

  return (
    <header className={`bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 ${className}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* App Branding */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Heart className="w-6 h-6 text-pink-500 fill-current" />
                <span className="text-xl font-semibold text-gray-900">QC</span>
              </div>
              <span className="hidden sm:block text-sm text-gray-500">Quality Control</span>
              <span className="px-2 py-0.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-full border border-gray-200">
                Proof of Concept
              </span>
            </div>

            {/* User Avatar Pair */}
              <div className="flex items-center gap-2">
                <div className="flex items-center -space-x-2">
                  {/* First user avatar */}
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-medium ring-2 ring-white">
                    A
                  </div>
                  {/* Second user avatar */}
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white text-sm font-medium ring-2 ring-white">
                    B
                  </div>
                </div>
                <div className="hidden sm:block ml-2">
                  <p className="text-sm font-medium text-gray-900">Alex & Blake</p>
                  <p className="text-xs text-gray-500">Together since Jan 2023 (if they were real)</p>
                </div>
              </div>
          </div>
        </div>
      </header>
  )
}