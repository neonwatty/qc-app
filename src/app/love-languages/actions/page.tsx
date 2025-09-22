'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useLoveLanguages } from '@/contexts/LoveLanguagesContext'
import { LoveActionCard } from '@/components/love-languages/LoveActionCard'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Heart, CheckCircle2, Calendar, Sparkles, Info } from 'lucide-react'
import { LoveAction, LoveActionStatus, LoveActionFrequency, LoveActionDifficulty } from '@/types'

export default function LoveActionsPage() {
  const searchParams = useSearchParams()
  const preselectedLanguageId = searchParams.get('languageId')
  
  const {
    languages,
    partnerLanguages,
    actions,
    addAction,
    updateAction,
    deleteAction,
    completeAction,
  } = useLoveLanguages()

  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingAction, setEditingAction] = useState<LoveAction | null>(null)
  
  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [linkedLanguageId, setLinkedLanguageId] = useState(preselectedLanguageId || '')
  const [status, setStatus] = useState<LoveActionStatus>('planned')
  const [frequency, setFrequency] = useState<LoveActionFrequency>('once')
  const [difficulty, setDifficulty] = useState<LoveActionDifficulty>('easy')
  const [notes, setNotes] = useState('')

  // Pre-select language if coming from language page
  useEffect(() => {
    if (preselectedLanguageId) {
      setLinkedLanguageId(preselectedLanguageId)
      setShowAddDialog(true)
    }
  }, [preselectedLanguageId])

  const allLanguages = [...languages, ...partnerLanguages]
  const pendingActions = actions.filter(a => a.status === 'planned' || a.status === 'suggested')
  const recurringActions = actions.filter(a => a.status === 'recurring')
  const completedActions = actions.filter(a => a.status === 'completed')

  const handleEdit = (action: LoveAction) => {
    setEditingAction(action)
    setTitle(action.title)
    setDescription(action.description)
    setLinkedLanguageId(action.linkedLanguageId)
    setStatus(action.status)
    setFrequency(action.frequency || 'once')
    setDifficulty(action.difficulty)
    setNotes(action.notes || '')
    setShowAddDialog(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this love action?')) {
      deleteAction(id)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const linkedLanguage = allLanguages.find(l => l.id === linkedLanguageId)
    
    const actionData = {
      title,
      description,
      linkedLanguageId,
      linkedLanguageTitle: linkedLanguage?.title,
      suggestedBy: 'self' as const,
      status,
      frequency,
      difficulty,
      notes: notes || undefined,
      forUserId: linkedLanguage?.userId || 'jeremy',
      createdBy: 'jeremy',
    }

    if (editingAction) {
      updateAction(editingAction.id, actionData)
      setEditingAction(null)
    } else {
      addAction(actionData)
    }
    
    // Reset form
    setTitle('')
    setDescription('')
    setLinkedLanguageId('')
    setStatus('planned')
    setFrequency('once')
    setDifficulty('easy')
    setNotes('')
    setShowAddDialog(false)
  }

  const handleDialogClose = (open: boolean) => {
    setShowAddDialog(open)
    if (!open) {
      setEditingAction(null)
      // Reset form
      setTitle('')
      setDescription('')
      setLinkedLanguageId('')
      setStatus('planned')
      setFrequency('once')
      setDifficulty('easy')
      setNotes('')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Love Actions"
        description="Turn love languages into meaningful actions"
      />

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-6">
          <Alert className="border-rose-200 bg-rose-50/50">
            <Info className="h-4 w-4 text-rose-600" />
            <AlertDescription className="text-gray-700 font-medium">
              Love Actions are specific ways to show love based on your partner&apos;s love languages. 
              Start small and build consistency over time.
            </AlertDescription>
          </Alert>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-700 font-medium">
              <span className="font-semibold text-gray-900">{actions.length}</span> total actions
            </div>
            <div className="text-sm text-gray-700 font-medium">
              <span className="font-semibold text-gray-900">{completedActions.length}</span> completed
            </div>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Action
          </Button>
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 bg-white">
            <TabsTrigger value="pending" className="text-gray-700 data-[state=active]:text-gray-900">
              <Calendar className="h-4 w-4 mr-2" />
              Pending ({pendingActions.length})
            </TabsTrigger>
            <TabsTrigger value="recurring" className="text-gray-700 data-[state=active]:text-gray-900">
              <Sparkles className="h-4 w-4 mr-2" />
              Recurring ({recurringActions.length})
            </TabsTrigger>
            <TabsTrigger value="completed" className="text-gray-700 data-[state=active]:text-gray-900">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Completed ({completedActions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingActions.length === 0 ? (
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="text-gray-900">No Pending Actions</CardTitle>
                  <CardDescription className="text-gray-700">
                    Add actions to show love in ways that matter to your partner.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => setShowAddDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Action
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {pendingActions.map((action) => (
                  <LoveActionCard
                    key={action.id}
                    action={action}
                    onComplete={() => completeAction(action.id)}
                    onEdit={() => handleEdit(action)}
                    onDelete={() => handleDelete(action.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="recurring" className="space-y-4">
            {recurringActions.length === 0 ? (
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="text-gray-900">No Recurring Actions</CardTitle>
                  <CardDescription className="text-gray-700">
                    Set up recurring actions for consistent expressions of love.
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : (
              <div className="grid gap-4">
                {recurringActions.map((action) => (
                  <LoveActionCard
                    key={action.id}
                    action={action}
                    onComplete={() => completeAction(action.id)}
                    onEdit={() => handleEdit(action)}
                    onDelete={() => handleDelete(action.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedActions.length === 0 ? (
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="text-gray-900">No Completed Actions Yet</CardTitle>
                  <CardDescription className="text-gray-700">
                    Complete your first action to start building your love action history.
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : (
              <div className="grid gap-4">
                {completedActions.map((action) => (
                  <LoveActionCard
                    key={action.id}
                    action={action}
                    onEdit={() => handleEdit(action)}
                    onDelete={() => handleDelete(action.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={showAddDialog} onOpenChange={handleDialogClose}>
        <DialogContent className="sm:max-w-[525px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingAction ? 'Edit' : 'Add'} Love Action</DialogTitle>
              <DialogDescription>
                Create a specific action to express love
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Action Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Leave a loving note in their lunch"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what you'll do..."
                  rows={3}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="language">Love Language *</Label>
                <Select value={linkedLanguageId} onValueChange={setLinkedLanguageId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a love language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.length > 0 && (
                      <>
                        <SelectItem value="header-mine" disabled>
                          <span className="font-semibold">My Languages</span>
                        </SelectItem>
                        {languages.map((lang) => (
                          <SelectItem key={lang.id} value={lang.id}>
                            {lang.title}
                          </SelectItem>
                        ))}
                      </>
                    )}
                    {partnerLanguages.length > 0 && (
                      <>
                        <SelectItem value="header-partner" disabled>
                          <span className="font-semibold">Partner&apos;s Languages</span>
                        </SelectItem>
                        {partnerLanguages.map((lang) => (
                          <SelectItem key={lang.id} value={lang.id}>
                            {lang.title}
                          </SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(value) => setStatus(value as LoveActionStatus)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="suggested">Suggested</SelectItem>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="recurring">Recurring</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Select value={frequency} onValueChange={(value) => setFrequency(value as LoveActionFrequency)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="once">Once</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="surprise">Surprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <Select value={difficulty} onValueChange={(value) => setDifficulty(value as LoveActionDifficulty)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy - Quick & simple</SelectItem>
                    <SelectItem value="moderate">Moderate - Some planning needed</SelectItem>
                    <SelectItem value="challenging">Challenging - Significant effort</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional notes..."
                  rows={2}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleDialogClose(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={!title || !description || !linkedLanguageId}>
                {editingAction ? 'Save Changes' : 'Add Action'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}