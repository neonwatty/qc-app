'use client'

import { User, CheckIn, Note, Category, Couple } from '@/types'
import { useLocalStorage, useDebounce } from '@/hooks'
import { mockUsers, mockCouple, mockCategories } from '@/lib/mock-data'
import { storage } from '@/lib/storage'
import { pageTransition, fadeIn } from '@/lib/animations'

export default function TestTypesPage() {
  // Test that all types are importable
  const testUser: User = mockUsers[0]
  const testCouple: Couple = mockCouple
  const testCategory: Category = mockCategories[0]
  
  // Test that hooks are importable
  const [testValue, setTestValue] = useLocalStorage('test', 'value')
  const debouncedValue = useDebounce(testValue, 500)
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="max-w-5xl w-full text-center">
        <h1 className="text-4xl font-bold mb-8">TypeScript Types Test</h1>
        
        <div className="text-left bg-gray-100 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Type Imports Working:</h2>
          <ul className="space-y-2">
            <li>✅ User type imported</li>
            <li>✅ CheckIn type imported</li>
            <li>✅ Note type imported</li>
            <li>✅ Category type imported</li>
            <li>✅ Couple type imported</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-6 mb-4">Hooks Working:</h2>
          <ul className="space-y-2">
            <li>✅ useLocalStorage hook imported</li>
            <li>✅ useDebounce hook imported</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-6 mb-4">Lib Utilities Working:</h2>
          <ul className="space-y-2">
            <li>✅ Storage utilities imported</li>
            <li>✅ Mock data imported</li>
            <li>✅ Animation presets imported</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-6 mb-4">Sample Data:</h2>
          <pre className="bg-white p-4 rounded overflow-x-auto">
            {JSON.stringify({ testUser, testCategory }, null, 2)}
          </pre>
        </div>
      </div>
    </main>
  )
}