'use client'

import React, { useState } from 'react'
import { Palette, Type, Eye, RotateCcw, Sliders } from 'lucide-react'
import { useTheme, ThemeColors } from '@/hooks/useTheme'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface ColorOption {
  name: string
  value: string
  label: string
}

const colorPresets: ColorOption[] = [
  { name: 'pink', value: '340 75% 55%', label: 'Pink (Default)' },
  { name: 'blue', value: '217 91% 60%', label: 'Blue' },
  { name: 'green', value: '142 76% 36%', label: 'Green' },
  { name: 'purple', value: '270 66% 60%', label: 'Purple' },
  { name: 'orange', value: '25 95% 53%', label: 'Orange' },
  { name: 'teal', value: '174 80% 40%', label: 'Teal' },
]

export function PersonalizationPanel() {
  const { 
    settings, 
    setCustomColor, 
    resetColors, 
    setFontSize, 
    setContrast, 
    setReducedMotion,
    defaultColors 
  } = useTheme()
  
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [selectedColor, setSelectedColor] = useState('pink')

  const handleColorPresetSelect = (color: ColorOption) => {
    setSelectedColor(color.name)
    setCustomColor('primary', color.value)
  }

  const handleCustomColorChange = (key: keyof ThemeColors, value: string) => {
    // Convert hex to HSL for consistency
    setCustomColor(key, value)
  }

  return (
    <div className="space-y-8">
      {/* Primary Color Selection */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Primary Color
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Choose your accent color for buttons and highlights
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {colorPresets.map((color) => (
            <button
              key={color.name}
              onClick={() => handleColorPresetSelect(color)}
              className={cn(
                'group relative h-20 rounded-lg border-2 transition-all',
                selectedColor === color.name
                  ? 'border-gray-900 dark:border-gray-100 shadow-lg scale-105'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
              )}
              style={{ backgroundColor: `hsl(${color.value})` }}
              title={color.label}
            >
              {selectedColor === color.name && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white dark:bg-gray-900 rounded-full p-1">
                    <Palette className="h-4 w-4 text-gray-900 dark:text-gray-100" />
                  </div>
                </div>
              )}
              <span className="sr-only">{color.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Font Size */}
      <div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Type className="h-5 w-5" />
            Text Size
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Adjust text size for better readability
          </p>
        </div>

        <div className="flex gap-2">
          {(['small', 'medium', 'large'] as const).map((size) => (
            <Button
              key={size}
              variant={settings.fontSize === size ? 'default' : 'outline'}
              onClick={() => setFontSize(size)}
              className={cn(
                'flex-1 capitalize',
                size === 'small' && 'text-sm',
                size === 'large' && 'text-lg'
              )}
            >
              {size}
            </Button>
          ))}
        </div>
      </div>

      {/* Accessibility Options */}
      <div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Accessibility
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Enhance visual comfort and reduce strain
          </p>
        </div>

        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">High Contrast</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Increase contrast for better visibility
                </p>
              </div>
              <button
                onClick={() => setContrast(settings.contrast === 'high' ? 'normal' : 'high')}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  settings.contrast === 'high' 
                    ? 'bg-pink-600 dark:bg-pink-500' 
                    : 'bg-gray-200 dark:bg-gray-700'
                )}
              >
                <span 
                  className={cn(
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                    settings.contrast === 'high' ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </button>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base">Reduce Motion</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Minimize animations and transitions
                </p>
              </div>
              <button
                onClick={() => setReducedMotion(!settings.reducedMotion)}
                className={cn(
                  'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                  settings.reducedMotion 
                    ? 'bg-pink-600 dark:bg-pink-500' 
                    : 'bg-gray-200 dark:bg-gray-700'
                )}
              >
                <span 
                  className={cn(
                    'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                    settings.reducedMotion ? 'translate-x-6' : 'translate-x-1'
                  )}
                />
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* Advanced Settings */}
      <div>
        <Button
          variant="outline"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full justify-between"
        >
          <span className="flex items-center gap-2">
            <Sliders className="h-4 w-4" />
            Advanced Customization
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {showAdvanced ? 'Hide' : 'Show'}
          </span>
        </Button>

        {showAdvanced && (
          <Card className="mt-4 p-4 space-y-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Fine-tune individual color values (HSL format)
            </div>
            
            {Object.entries(defaultColors).map(([key, value]) => (
              <div key={key} className="flex items-center gap-3">
                <Label className="w-24 text-sm capitalize">{key}</Label>
                <input
                  type="text"
                  value={settings.customColors[key as keyof ThemeColors] || value}
                  onChange={(e) => handleCustomColorChange(key as keyof ThemeColors, e.target.value)}
                  className="flex-1 px-3 py-1 text-sm border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-900"
                  placeholder={value}
                />
                <div 
                  className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600"
                  style={{ 
                    backgroundColor: `hsl(${settings.customColors[key as keyof ThemeColors] || value})` 
                  }}
                />
              </div>
            ))}
          </Card>
        )}
      </div>

      {/* Reset Button */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={resetColors}
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reset to Defaults
        </Button>
      </div>
    </div>
  )
}