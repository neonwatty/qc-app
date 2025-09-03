'use client'

import React, { useRef, useEffect, useState } from 'react'
import { Search, X, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  resultCount?: number
  autoFocus?: boolean
  showSuggestions?: boolean
  suggestions?: string[]
  className?: string
  onSubmit?: () => void
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search...',
  resultCount,
  autoFocus = false,
  showSuggestions = true,
  suggestions = [],
  className,
  onSubmit
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isFocused, setIsFocused] = useState(false)
  const [showClearButton, setShowClearButton] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [showSearchTips, setShowSearchTips] = useState(false)

  useEffect(() => {
    setShowClearButton(value.length > 0)
  }, [value])

  useEffect(() => {
    // Load recent searches from localStorage
    const stored = localStorage.getItem('notes-recent-searches')
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored))
      } catch (e) {
        setRecentSearches([])
      }
    }
  }, [])

  const handleClear = () => {
    onChange('')
    inputRef.current?.focus()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim()) {
      // Save to recent searches
      const newRecentSearches = [
        value.trim(),
        ...recentSearches.filter(s => s !== value.trim())
      ].slice(0, 5)
      setRecentSearches(newRecentSearches)
      localStorage.setItem('notes-recent-searches', JSON.stringify(newRecentSearches))
      onSubmit?.()
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion)
    inputRef.current?.focus()
    handleSubmit({ preventDefault: () => {} } as React.FormEvent)
  }

  const searchTips = [
    'Use quotes for exact phrases: "team meeting"',
    'Search by category: category:Communication',
    'Filter by type: type:shared or type:private',
    'Date ranges: date:today, date:week, date:month',
    'Combine filters: type:draft category:Goals'
  ]

  const getSuggestions = () => {
    if (!isFocused) return []
    
    if (!value) {
      return recentSearches.map(search => ({
        type: 'recent' as const,
        value: search
      }))
    }

    // Filter suggestions based on current input
    const filtered = suggestions.filter(s => 
      s.toLowerCase().includes(value.toLowerCase())
    ).slice(0, 5)

    return filtered.map(s => ({
      type: 'suggestion' as const,
      value: s
    }))
  }

  const currentSuggestions = getSuggestions()

  return (
    <div className={cn("relative", className)}>
      <form onSubmit={handleSubmit}>
        <div className={cn(
          "relative flex items-center transition-all duration-200",
          isFocused && "ring-2 ring-pink-500 ring-offset-2",
          "rounded-lg"
        )}>
          {/* Search Icon */}
          <div className="absolute left-3 flex items-center pointer-events-none">
            <Search className={cn(
              "h-5 w-5 transition-colors duration-200",
              isFocused ? "text-pink-500" : "text-gray-400"
            )} />
          </div>

          {/* Input Field */}
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder={placeholder}
            autoFocus={autoFocus}
            className={cn(
              "w-full pl-10 pr-24 py-3 text-gray-900",
              "border border-gray-200 rounded-lg",
              "focus:border-transparent focus:outline-none",
              "placeholder-gray-400",
              "transition-all duration-200"
            )}
          />

          {/* Right Side Actions */}
          <div className="absolute right-3 flex items-center gap-2">
            {/* Result Count */}
            <AnimatePresence>
              {resultCount !== undefined && value && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full"
                >
                  {resultCount} {resultCount === 1 ? 'result' : 'results'}
                </motion.span>
              )}
            </AnimatePresence>

            {/* Clear Button */}
            <AnimatePresence>
              {showClearButton && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={handleClear}
                  className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Tips Button */}
            <button
              type="button"
              onClick={() => setShowSearchTips(!showSearchTips)}
              className={cn(
                "p-1 rounded-md transition-colors",
                showSearchTips ? "bg-pink-100 text-pink-600" : "hover:bg-gray-100"
              )}
            >
              <Sparkles className="h-4 w-4" />
            </button>
          </div>
        </div>
      </form>

      {/* Search Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && currentSuggestions.length > 0 && isFocused && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden"
          >
            {currentSuggestions.map((suggestion, index) => (
              <button
                key={`${suggestion.type}-${suggestion.value}-${index}`}
                onClick={() => handleSuggestionClick(suggestion.value)}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                {suggestion.type === 'recent' && (
                  <span className="text-xs text-gray-400">Recent:</span>
                )}
                <span className="text-gray-700">{suggestion.value}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Tips */}
      <AnimatePresence>
        {showSearchTips && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute z-10 w-full mt-2 bg-gradient-to-br from-pink-50 to-purple-50 border border-pink-200 rounded-lg shadow-lg p-4"
          >
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                <Sparkles className="h-4 w-4 text-pink-500" />
                Search Tips
              </h4>
              <button
                onClick={() => setShowSearchTips(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <ul className="space-y-1">
              {searchTips.map((tip, index) => (
                <li key={index} className="text-xs text-gray-600 flex items-start gap-1">
                  <span className="text-pink-500 mt-0.5">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Search Overlay */}
      {isFocused && (
        <div 
          className="fixed inset-0 bg-black/20 z-0 sm:hidden"
          onClick={() => inputRef.current?.blur()}
        />
      )}
    </div>
  )
}