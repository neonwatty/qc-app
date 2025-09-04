'use client'

import React, { useState } from 'react'
import { MotionBox } from '@/components/ui/motion'
import { 
  MobileInput, 
  SearchInput, 
  PasswordInput, 
  NumberInput, 
  PhoneInput, 
  EmailInput 
} from '@/components/ui/MobileInput'
import { TouchButton } from '@/components/ui/TouchButton'
import { User, Mail, Phone, Lock, Search, DollarSign } from 'lucide-react'

export default function MobileFormsTestPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    search: '',
    amount: '',
    message: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
  }

  return (
    <MotionBox variant="page" className="max-w-md mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mobile Form Inputs</h1>
        <p className="text-gray-600 mt-2">Optimized for mobile touch interfaces</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Input */}
        <MobileInput
          label="Full Name"
          placeholder="Enter your name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          leftIcon={<User className="h-4 w-4" />}
          autoComplete="name"
          size="lg"
        />

        {/* Email Input */}
        <EmailInput
          label="Email Address"
          placeholder="Enter your email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          leftIcon={<Mail className="h-4 w-4" />}
          size="lg"
        />

        {/* Phone Input */}
        <PhoneInput
          label="Phone Number"
          placeholder="(555) 123-4567"
          value={formData.phone}
          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          leftIcon={<Phone className="h-4 w-4" />}
          size="lg"
        />

        {/* Password Input */}
        <PasswordInput
          label="Password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
          leftIcon={<Lock className="h-4 w-4" />}
          size="lg"
        />

        {/* Search Input */}
        <SearchInput
          label="Search"
          placeholder="Search for something..."
          value={formData.search}
          onChange={(e) => setFormData(prev => ({ ...prev, search: e.target.value }))}
          leftIcon={<Search className="h-4 w-4" />}
          variant="filled"
          size="lg"
        />

        {/* Number Input */}
        <NumberInput
          label="Amount"
          placeholder="0.00"
          value={formData.amount}
          onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
          leftIcon={<DollarSign className="h-4 w-4" />}
          size="lg"
          min="0"
          step="0.01"
        />

        {/* Textarea */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Message</label>
          <textarea
            placeholder="Tell us more..."
            value={formData.message}
            onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
            className="w-full h-32 px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent mobile-input touch-manipulation resize-none"
            rows={4}
          />
        </div>

        {/* Form Controls */}
        <div className="space-y-3 pt-4">
          <TouchButton
            type="submit"
            size="xl"
            className="w-full bg-gradient-to-r from-pink-500 to-rose-500"
            hapticFeedback="medium"
          >
            Submit Form
          </TouchButton>
          
          <TouchButton
            type="button"
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => setFormData({
              name: '',
              email: '',
              phone: '',
              password: '',
              search: '',
              amount: '',
              message: ''
            })}
          >
            Clear Form
          </TouchButton>
        </div>
      </form>

      {/* Form Data Display */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">Form Data (Debug)</h3>
        <pre className="text-xs text-gray-600 overflow-x-auto">
          {JSON.stringify(formData, null, 2)}
        </pre>
      </div>

      {/* Mobile Input Features */}
      <div className="mt-8 space-y-4">
        <h3 className="font-semibold text-gray-900">Mobile Optimizations:</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>• 16px font size prevents iOS zoom</li>
          <li>• Proper input types for correct keyboards</li>
          <li>• Touch-friendly button sizes (44px minimum)</li>
          <li>• Haptic feedback on interactions</li>
          <li>• Autocomplete and input mode attributes</li>
          <li>• Visual feedback on focus and interaction</li>
        </ul>
      </div>
    </MotionBox>
  )
}