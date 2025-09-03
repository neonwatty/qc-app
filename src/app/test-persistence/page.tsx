'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { initializeAppData, resetAppData, getDataSummary } from '@/lib/data-init'
import { storage } from '@/lib/storage'

interface DataSummary {
  user: { name: string; email: string } | null
  couple: { name: string; stats: any } | null
  counts: {
    checkIns: number
    notes: number
    milestones: number
  }
  hasActiveCheckIn: boolean
  storage: {
    keys: string[]
    totalSize: number
  }
}

export default function TestPersistencePage() {
  const [dataSummary, setDataSummary] = useState<DataSummary | null>(null)
  const [lastAction, setLastAction] = useState<string>('')
  const [refreshCounter, setRefreshCounter] = useState(0)

  const refreshData = () => {
    const summary = getDataSummary()
    setDataSummary(summary)
    setRefreshCounter(prev => prev + 1)
  }

  const handleInitialize = () => {
    const initialized = initializeAppData()
    setLastAction(initialized ? 'Data initialized successfully' : 'Data already exists')
    setTimeout(refreshData, 100)
  }

  const handleReset = () => {
    const reset = resetAppData()
    setLastAction(reset ? 'Data reset successfully' : 'Error resetting data')
    setTimeout(refreshData, 100)
  }

  const handleClear = () => {
    storage.clearAll()
    setLastAction('All data cleared')
    setTimeout(refreshData, 100)
  }

  const handleRefresh = () => {
    window.location.reload()
  }

  useEffect(() => {
    refreshData()
  }, [])

  return (
    <main className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Local Storage Persistence Test</h1>
        <p className="text-muted-foreground">
          Test data persistence across browser refreshes and verify mock data initialization.
        </p>
      </div>

      <div className="grid gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Actions
              <span className="text-sm font-normal text-muted-foreground">
                Refreshed: {refreshCounter} times
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 flex-wrap">
              <Button onClick={handleInitialize}>Initialize Data</Button>
              <Button onClick={handleReset} variant="outline">Reset All Data</Button>
              <Button onClick={handleClear} variant="destructive">Clear All Data</Button>
              <Button onClick={handleRefresh} variant="secondary">Refresh Page</Button>
              <Button onClick={refreshData} variant="ghost">Refresh Data</Button>
            </div>
            {lastAction && (
              <div className="mt-4 p-3 bg-muted rounded-md">
                <p className="text-sm">{lastAction}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {dataSummary && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Current User & Couple</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">User</h3>
                    {dataSummary.user ? (
                      <div className="text-sm space-y-1">
                        <p><span className="font-medium">Name:</span> {dataSummary.user.name}</p>
                        <p><span className="font-medium">Email:</span> {dataSummary.user.email}</p>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">No user data</p>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Couple</h3>
                    {dataSummary.couple ? (
                      <div className="text-sm space-y-1">
                        <p><span className="font-medium">Name:</span> {dataSummary.couple.name}</p>
                        <p><span className="font-medium">Total Check-ins:</span> {dataSummary.couple.stats.totalCheckIns}</p>
                        <p><span className="font-medium">Current Streak:</span> {dataSummary.couple.stats.currentStreak}</p>
                        <p><span className="font-medium">Last Check-in:</span> {new Date(dataSummary.couple.stats.lastCheckIn).toLocaleDateString()}</p>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">No couple data</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Counts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{dataSummary.counts.checkIns}</div>
                    <div className="text-sm text-muted-foreground">Check-ins</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{dataSummary.counts.notes}</div>
                    <div className="text-sm text-muted-foreground">Notes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{dataSummary.counts.milestones}</div>
                    <div className="text-sm text-muted-foreground">Milestones</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${dataSummary.hasActiveCheckIn ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {dataSummary.hasActiveCheckIn ? '✓' : '✗'}
                    </div>
                    <div className="text-sm text-muted-foreground">Active Check-in</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Storage Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Storage Keys ({dataSummary.storage.keys.length})</h3>
                    <div className="flex flex-wrap gap-2">
                      {dataSummary.storage.keys.map(key => (
                        <span key={key} className="px-2 py-1 bg-muted text-sm rounded">
                          {key}
                        </span>
                      ))}
                    </div>
                    {dataSummary.storage.keys.length === 0 && (
                      <p className="text-muted-foreground text-sm">No QC storage keys found</p>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Total Storage Size</h3>
                    <p className="text-sm">
                      {(dataSummary.storage.totalSize / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <p><strong>1. Initialize Data:</strong> Click &quot;Initialize Data&quot; to populate localStorage with mock data.</p>
            <p><strong>2. Verify Persistence:</strong> Click &quot;Refresh Page&quot; and verify data persists after page reload.</p>
            <p><strong>3. Test Reset:</strong> Click &quot;Reset All Data&quot; to clear and re-initialize.</p>
            <p><strong>4. Test Clear:</strong> Click &quot;Clear All Data&quot; to remove all storage.</p>
            <p><strong>5. Monitor Counts:</strong> Data counts should remain consistent across page refreshes.</p>
            <p><strong>6. Storage Keys:</strong> Should show 5-6 QC-prefixed keys when data is loaded.</p>
          </div>
        </CardContent>
      </Card>
    </main>
  )
}