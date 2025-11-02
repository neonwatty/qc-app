'use client'

import { useState } from 'react'
import { useLoveLanguages } from '@/contexts/LoveLanguagesContext'
import { LoveLanguageCard } from '@/components/love-languages/LoveLanguageCard'
import { AddLanguageDialog } from '@/components/love-languages/AddLanguageDialog'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Plus, Heart, Sparkles, Info } from 'lucide-react'
import { LoveLanguage } from '@/types'

export default function LoveLanguagesPage() {
  const {
    languages,
    partnerLanguages,
    addLanguage,
    updateLanguage,
    deleteLanguage,
    toggleLanguagePrivacy,
  } = useLoveLanguages()

  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingLanguage, setEditingLanguage] = useState<LoveLanguage | null>(null)

  const handleEdit = (language: LoveLanguage) => {
    setEditingLanguage(language)
    setShowAddDialog(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this love language?')) {
      deleteLanguage(id)
    }
  }

  const handleSubmit = (languageData: Omit<LoveLanguage, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingLanguage) {
      updateLanguage(editingLanguage.id, languageData)
      setEditingLanguage(null)
    } else {
      addLanguage(languageData)
    }
  }

  const handleDialogClose = (open: boolean) => {
    setShowAddDialog(open)
    if (!open) {
      setEditingLanguage(null)
    }
  }

  const sharedLanguages = languages.filter(l => l.privacy === 'shared')
  const privateLanguages = languages.filter(l => l.privacy === 'private')

  return (
    <div className="min-h-screen bg-background">
      <PageHeader
        title="Love Languages"
        description="Discover and share the unique ways you feel loved"
      />

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-6">
          <Alert className="border-rose-200 bg-rose-50/50">
            <Info className="h-4 w-4 text-rose-600" />
            <AlertDescription className="text-gray-700 font-medium">
              Love Languages help your partner understand what makes you feel most loved and appreciated. 
              Start with a few and refine them over time as you discover more about yourself.
            </AlertDescription>
          </Alert>
        </div>

        <Tabs defaultValue="mine" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList className="bg-white">
              <TabsTrigger value="mine" className="text-gray-700 data-[state=active]:text-gray-900">
                <Heart className="h-4 w-4 mr-2" />
                My Languages ({languages.length})
              </TabsTrigger>
              <TabsTrigger value="partner" className="text-gray-700 data-[state=active]:text-gray-900">
                <Sparkles className="h-4 w-4 mr-2" />
                Partner&apos;s Languages ({partnerLanguages.length})
              </TabsTrigger>
            </TabsList>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Language
            </Button>
          </div>

          <TabsContent value="mine" className="space-y-6">
            {languages.length === 0 ? (
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="text-gray-900">No Love Languages Yet</CardTitle>
                  <CardDescription className="text-gray-700">
                    Start by adding your first love language. Think about specific moments when you felt most loved.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => setShowAddDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Love Language
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {sharedLanguages.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      Shared with Partner
                      <Badge variant="secondary" className="text-gray-700">{sharedLanguages.length}</Badge>
                    </h3>
                    <div className="grid gap-4">
                      {sharedLanguages.map((language) => (
                        <LoveLanguageCard
                          key={language.id}
                          language={language}
                          onEdit={() => handleEdit(language)}
                          onDelete={() => handleDelete(language.id)}
                          onTogglePrivacy={() => toggleLanguagePrivacy(language.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {privateLanguages.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      Private
                      <Badge variant="outline" className="text-gray-700">{privateLanguages.length}</Badge>
                    </h3>
                    <div className="grid gap-4">
                      {privateLanguages.map((language) => (
                        <LoveLanguageCard
                          key={language.id}
                          language={language}
                          onEdit={() => handleEdit(language)}
                          onDelete={() => handleDelete(language.id)}
                          onTogglePrivacy={() => toggleLanguagePrivacy(language.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="partner" className="space-y-4">
            {partnerLanguages.length === 0 ? (
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="text-gray-900">No Shared Languages Yet</CardTitle>
                  <CardDescription className="text-gray-700">
                    Your partner hasn&apos;t shared any love languages yet. Encourage them to add and share theirs!
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : (
              <div className="grid gap-4">
                {partnerLanguages.map((language) => (
                  <LoveLanguageCard
                    key={language.id}
                    language={language}
                    isOwn={false}
                    onCreateAction={() => {
                      // Navigate to actions page with this language pre-selected
                      window.location.href = `/love-languages/actions?languageId=${language.id}`
                    }}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <AddLanguageDialog
        open={showAddDialog}
        onOpenChange={handleDialogClose}
        onSubmit={handleSubmit}
        initialLanguage={editingLanguage || undefined}
      />
    </div>
  )
}

// Add missing Badge import to the file
import { Badge } from '@/components/ui/badge'