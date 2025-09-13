'use client'

import { useState } from 'react'
import { LoveLanguage, LoveLanguageCategory, LoveLanguageImportance, LoveLanguagePrivacy } from '@/types'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Badge } from '@/components/ui/badge'
import { Plus, X } from 'lucide-react'

interface AddLanguageDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (language: Omit<LoveLanguage, 'id' | 'createdAt' | 'updatedAt'>) => void
  initialLanguage?: LoveLanguage
}

const categoryOptions: { value: LoveLanguageCategory; label: string; emoji: string }[] = [
  { value: 'words', label: 'Words of Affirmation', emoji: '💬' },
  { value: 'acts', label: 'Acts of Service', emoji: '🤝' },
  { value: 'gifts', label: 'Receiving Gifts', emoji: '🎁' },
  { value: 'time', label: 'Quality Time', emoji: '⏰' },
  { value: 'touch', label: 'Physical Touch', emoji: '🤗' },
  { value: 'custom', label: 'Custom', emoji: '✨' },
]

export function AddLanguageDialog({
  open,
  onOpenChange,
  onSubmit,
  initialLanguage,
}: AddLanguageDialogProps) {
  const [title, setTitle] = useState(initialLanguage?.title || '')
  const [description, setDescription] = useState(initialLanguage?.description || '')
  const [category, setCategory] = useState<LoveLanguageCategory>(initialLanguage?.category || 'custom')
  const [importance, setImportance] = useState<LoveLanguageImportance>(initialLanguage?.importance || 'medium')
  const [privacy, setPrivacy] = useState<LoveLanguagePrivacy>(initialLanguage?.privacy || 'private')
  const [examples, setExamples] = useState<string[]>(initialLanguage?.examples || [''])
  const [tags, setTags] = useState<string[]>(initialLanguage?.tags || [])
  const [tagInput, setTagInput] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const filteredExamples = examples.filter(ex => ex.trim() !== '')
    
    onSubmit({
      userId: 'jeremy', // In real app, get from auth context
      title,
      description,
      category,
      importance,
      privacy,
      examples: filteredExamples,
      tags,
    })
    
    // Reset form
    setTitle('')
    setDescription('')
    setCategory('custom')
    setImportance('medium')
    setPrivacy('private')
    setExamples([''])
    setTags([])
    setTagInput('')
    onOpenChange(false)
  }

  const addExample = () => {
    setExamples([...examples, ''])
  }

  const updateExample = (index: number, value: string) => {
    const newExamples = [...examples]
    newExamples[index] = value
    setExamples(newExamples)
  }

  const removeExample = (index: number) => {
    setExamples(examples.filter((_, i) => i !== index))
  }

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{initialLanguage ? 'Edit' : 'Add'} Love Language</DialogTitle>
            <DialogDescription>
              Describe a specific way you feel loved and appreciated
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Morning words of encouragement"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this means to you..."
                rows={3}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={(value) => setCategory(value as LoveLanguageCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <span className="flex items-center gap-2">
                        <span>{option.emoji}</span>
                        <span>{option.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Importance</Label>
              <RadioGroup value={importance} onValueChange={(value) => setImportance(value as LoveLanguageImportance)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="low" id="low" />
                  <Label htmlFor="low">Low - Nice to have</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="medium" />
                  <Label htmlFor="medium">Medium - Important</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="high" id="high" />
                  <Label htmlFor="high">High - Very important</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="essential" id="essential" />
                  <Label htmlFor="essential">Essential - Critical for feeling loved</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid gap-2">
              <Label>Privacy</Label>
              <RadioGroup value={privacy} onValueChange={(value) => setPrivacy(value as LoveLanguagePrivacy)}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="private" id="private" />
                  <Label htmlFor="private">Private - Only visible to me</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="shared" id="shared" />
                  <Label htmlFor="shared">Shared - Visible to my partner</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid gap-2">
              <Label>Examples (optional)</Label>
              {examples.map((example, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={example}
                    onChange={(e) => updateExample(index, e.target.value)}
                    placeholder="Add a specific example..."
                  />
                  {examples.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeExample(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addExample}
                className="w-fit"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Example
              </Button>
            </div>

            <div className="grid gap-2">
              <Label>Tags (optional)</Label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  Add
                </Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title || !description}>
              {initialLanguage ? 'Save Changes' : 'Add Love Language'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}