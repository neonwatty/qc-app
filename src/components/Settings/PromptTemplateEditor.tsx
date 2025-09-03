'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { 
  Save,
  X,
  Plus,
  Trash2,
  GripVertical,
  Copy,
  Edit2,
  ChevronDown,
  ChevronUp,
  Tags,
  FileText,
  AlertCircle,
  CheckCircle,
  Wand2,
  Sparkles,
  RefreshCw,
  Eye,
  EyeOff
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { PromptTemplate, Category } from '@/types'
import { cn } from '@/lib/utils'

interface PromptTemplateEditorProps {
  template?: PromptTemplate
  categories: Category[]
  onSave: (template: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
  className?: string
}

interface PromptItem {
  id: string
  content: string
  isEditing: boolean
  isExpanded: boolean
}

// Predefined tag suggestions
const TAG_SUGGESTIONS = [
  'communication', 'trust', 'intimacy', 'goals', 'family', 'finances', 
  'career', 'health', 'fun', 'growth', 'conflict', 'appreciation',
  'values', 'boundaries', 'future', 'past', 'present', 'emotions',
  'support', 'challenges', 'celebration', 'daily', 'weekly', 'monthly'
]

// Prompt templates for quick start
const PROMPT_STARTERS = {
  reflection: [
    "What moment from this week made you feel most connected to each other?",
    "How have you grown individually and as a couple recently?",
    "What's one thing your partner did that you're grateful for?"
  ],
  communication: [
    "Is there something you've been wanting to share but haven't found the right moment?",
    "How can we improve our communication style?",
    "What topics feel difficult to discuss, and how can we make them easier?"
  ],
  goals: [
    "What's one shared goal we can work on together this month?",
    "How do our individual goals align with our relationship goals?",
    "What milestone would you like us to achieve by the end of the year?"
  ],
  appreciation: [
    "What qualities in your partner do you admire most?",
    "Share a specific moment when you felt proud of your partner",
    "What small gestures from your partner mean the most to you?"
  ]
}

export const PromptTemplateEditor: React.FC<PromptTemplateEditorProps> = ({
  template,
  categories,
  onSave,
  onCancel,
  className
}) => {
  const [title, setTitle] = useState(template?.title || '')
  const [description, setDescription] = useState(template?.description || '')
  const [selectedCategoryId, setSelectedCategoryId] = useState(template?.categoryId || '')
  const [tags, setTags] = useState<string[]>(template?.tags || [])
  const [tagInput, setTagInput] = useState('')
  const [prompts, setPrompts] = useState<PromptItem[]>(() => {
    if (template?.prompts.length) {
      return template.prompts.map((prompt, index) => ({
        id: `prompt-${Date.now()}-${index}`,
        content: prompt,
        isEditing: false,
        isExpanded: false
      }))
    }
    return []
  })
  const [showValidation, setShowValidation] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  const [showPromptStarters, setShowPromptStarters] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  // Validation state
  const validation = {
    title: title.trim().length > 0,
    description: description.trim().length > 0,
    prompts: prompts.length > 0 && prompts.every(p => p.content.trim().length > 0),
    hasMinPrompts: prompts.length >= 2
  }

  const isValid = validation.title && validation.description && validation.prompts && validation.hasMinPrompts

  const handleAddPrompt = useCallback(() => {
    const newPrompt: PromptItem = {
      id: `prompt-${Date.now()}`,
      content: '',
      isEditing: true,
      isExpanded: true
    }
    setPrompts([...prompts, newPrompt])
  }, [prompts])

  const handleUpdatePrompt = useCallback((id: string, content: string) => {
    setPrompts(prompts.map(p => 
      p.id === id ? { ...p, content } : p
    ))
  }, [prompts])

  const handleDeletePrompt = useCallback((id: string) => {
    setPrompts(prompts.filter(p => p.id !== id))
  }, [prompts])

  const handleToggleEditPrompt = useCallback((id: string) => {
    setPrompts(prompts.map(p => 
      p.id === id ? { ...p, isEditing: !p.isEditing } : p
    ))
  }, [prompts])

  const handleToggleExpandPrompt = useCallback((id: string) => {
    setPrompts(prompts.map(p => 
      p.id === id ? { ...p, isExpanded: !p.isExpanded } : p
    ))
  }, [prompts])

  const handleDuplicatePrompt = useCallback((id: string) => {
    const promptToDuplicate = prompts.find(p => p.id === id)
    if (promptToDuplicate) {
      const newPrompt: PromptItem = {
        id: `prompt-${Date.now()}`,
        content: promptToDuplicate.content,
        isEditing: false,
        isExpanded: false
      }
      const index = prompts.findIndex(p => p.id === id)
      const newPrompts = [...prompts]
      newPrompts.splice(index + 1, 0, newPrompt)
      setPrompts(newPrompts)
    }
  }, [prompts])

  const handleReorderPrompts = useCallback((reorderedPrompts: PromptItem[]) => {
    setPrompts(reorderedPrompts)
  }, [])

  const handleAddTag = useCallback(() => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim().toLowerCase()])
      setTagInput('')
    }
  }, [tagInput, tags])

  const handleRemoveTag = useCallback((tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }, [tags])

  const handleAddPromptStarter = useCallback((starterPrompts: string[]) => {
    const newPrompts = starterPrompts.map((prompt, index) => ({
      id: `prompt-${Date.now()}-${index}`,
      content: prompt,
      isEditing: false,
      isExpanded: false
    }))
    setPrompts([...prompts, ...newPrompts])
    setShowPromptStarters(false)
  }, [prompts])

  const handleGeneratePrompts = useCallback(() => {
    // Simulated AI prompt generation based on category
    const category = categories.find(c => c.id === selectedCategoryId)
    if (category) {
      const generatedPrompts = [
        `What aspects of ${category.name.toLowerCase()} would you like to explore together?`,
        `How has ${category.name.toLowerCase()} evolved in our relationship?`,
        `What are your hopes and concerns regarding ${category.name.toLowerCase()}?`
      ]
      handleAddPromptStarter(generatedPrompts)
    }
  }, [selectedCategoryId, categories, handleAddPromptStarter])

  const handleSave = useCallback(() => {
    if (!isValid) {
      setShowValidation(true)
      return
    }

    const templateData: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'> = {
      title: title.trim(),
      description: description.trim(),
      prompts: prompts.map(p => p.content.trim()),
      categoryId: selectedCategoryId || undefined,
      tags,
      isSystem: false,
      usageCount: template?.usageCount || 0
    }

    onSave(templateData)
  }, [title, description, prompts, selectedCategoryId, tags, isValid, template, onSave])

  // Auto-save draft
  useEffect(() => {
    const autoSaveTimer = setTimeout(() => {
      if (title || description || prompts.length > 0) {
        localStorage.setItem('promptTemplateDraft', JSON.stringify({
          title,
          description,
          prompts: prompts.map(p => p.content),
          categoryId: selectedCategoryId,
          tags
        }))
      }
    }, 1000)

    return () => clearTimeout(autoSaveTimer)
  }, [title, description, prompts, selectedCategoryId, tags])

  // Load draft on mount if no template provided
  useEffect(() => {
    if (!template) {
      const draft = localStorage.getItem('promptTemplateDraft')
      if (draft) {
        try {
          const parsed = JSON.parse(draft)
          setTitle(parsed.title || '')
          setDescription(parsed.description || '')
          setSelectedCategoryId(parsed.categoryId || '')
          setTags(parsed.tags || [])
          if (parsed.prompts?.length > 0) {
            setPrompts(parsed.prompts.map((p: string, i: number) => ({
              id: `prompt-${Date.now()}-${i}`,
              content: p,
              isEditing: false,
              isExpanded: false
            })))
          }
        } catch (e) {
          console.error('Failed to load draft', e)
        }
      }
    }
  }, [template])

  const renderPromptItem = (prompt: PromptItem, index: number) => (
    <Reorder.Item
      key={prompt.id}
      value={prompt}
      className="relative"
    >
      <Card className={cn(
        'transition-all',
        prompt.isExpanded ? 'shadow-md' : 'shadow-sm'
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="cursor-grab">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Prompt {index + 1}</span>
                {prompt.content && !prompt.isEditing && (
                  <Badge variant="secondary" className="text-xs">
                    {prompt.content.split(' ').length} words
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleToggleExpandPrompt(prompt.id)}
                    >
                      {prompt.isExpanded ? 
                        <ChevronUp className="h-4 w-4" /> : 
                        <ChevronDown className="h-4 w-4" />
                      }
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {prompt.isExpanded ? 'Collapse' : 'Expand'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleToggleEditPrompt(prompt.id)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Edit</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDuplicatePrompt(prompt.id)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Duplicate</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDeletePrompt(prompt.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </CardHeader>
        
        {(prompt.isEditing || prompt.isExpanded) && (
          <CardContent className="pt-0">
            {prompt.isEditing ? (
              <Textarea
                value={prompt.content}
                onChange={(e) => handleUpdatePrompt(prompt.id, e.target.value)}
                placeholder="Enter your discussion prompt..."
                className="min-h-[100px] resize-none"
                autoFocus
              />
            ) : (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {prompt.content || 'No content yet'}
              </p>
            )}
          </CardContent>
        )}
      </Card>
    </Reorder.Item>
  )

  return (
    <div className={cn('space-y-6', className)}>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="prompts">Prompts</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Template Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Weekly Relationship Check-in"
              className={cn(
                showValidation && !validation.title && 'border-destructive'
              )}
            />
            {showValidation && !validation.title && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Title is required
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this template is for and when to use it..."
              className={cn(
                'min-h-[80px]',
                showValidation && !validation.description && 'border-destructive'
              )}
            />
            {showValidation && !validation.description && (
              <p className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Description is required
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category (Optional)</Label>
            <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No specific category</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Link this template to a specific discussion category
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="Add a tag..."
                className="flex-1"
              />
              <Button type="button" variant="outline" onClick={handleAddTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <Badge key={tag} variant="secondary" className="pr-1">
                  {tag}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 ml-1"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    ×
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              <span className="text-xs text-muted-foreground mr-2">Suggestions:</span>
              {TAG_SUGGESTIONS.slice(0, 5).map(tag => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-xs cursor-pointer hover:bg-accent"
                  onClick={() => !tags.includes(tag) && setTags([...tags, tag])}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="prompts" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Discussion Prompts</h3>
              <p className="text-sm text-muted-foreground">
                Add at least 2 prompts for your template
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPromptStarters(!showPromptStarters)}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Quick Start
              </Button>
              {selectedCategoryId && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGeneratePrompts}
                >
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate
                </Button>
              )}
              <Button onClick={handleAddPrompt}>
                <Plus className="mr-2 h-4 w-4" />
                Add Prompt
              </Button>
            </div>
          </div>

          {showValidation && !validation.hasMinPrompts && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm">Please add at least 2 prompts to your template</p>
            </div>
          )}

          {showPromptStarters && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Start Templates</CardTitle>
                <CardDescription>
                  Choose a category to add starter prompts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(PROMPT_STARTERS).map(([key, starters]) => (
                    <Button
                      key={key}
                      variant="outline"
                      className="justify-start capitalize"
                      onClick={() => handleAddPromptStarter(starters)}
                    >
                      {key}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <ScrollArea className="h-[400px]">
            {prompts.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No prompts added yet</p>
                <Button onClick={handleAddPrompt}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Prompt
                </Button>
              </div>
            ) : (
              <Reorder.Group
                axis="y"
                values={prompts}
                onReorder={handleReorderPrompts}
                className="space-y-3"
              >
                <AnimatePresence mode="popLayout">
                  {prompts.map((prompt, index) => renderPromptItem(prompt, index))}
                </AnimatePresence>
              </Reorder.Group>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{title || 'Untitled Template'}</CardTitle>
              <CardDescription>
                {description || 'No description provided'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedCategoryId && (
                <div>
                  <Label className="text-xs">Category</Label>
                  <Badge variant="outline">
                    {categories.find(c => c.id === selectedCategoryId)?.name}
                  </Badge>
                </div>
              )}
              
              {tags.length > 0 && (
                <div>
                  <Label className="text-xs">Tags</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <Label className="text-xs">Prompts ({prompts.length})</Label>
                <div className="space-y-2 mt-2">
                  {prompts.map((prompt, index) => (
                    <div key={prompt.id} className="flex gap-2">
                      <span className="text-sm font-medium text-muted-foreground">
                        {index + 1}.
                      </span>
                      <p className="text-sm flex-1">
                        {prompt.content || <span className="text-muted-foreground italic">Empty prompt</span>}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {isValid ? (
            <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg">
              <CheckCircle className="h-4 w-4" />
              <p className="text-sm">Template is ready to save</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm font-medium text-destructive">Missing required fields:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {!validation.title && <li>• Template title</li>}
                {!validation.description && <li>• Template description</li>}
                {!validation.hasMinPrompts && <li>• At least 2 prompts</li>}
                {!validation.prompts && <li>• Some prompts are empty</li>}
              </ul>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? (
              <>
                <EyeOff className="mr-2 h-4 w-4" />
                Edit Mode
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </>
            )}
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!isValid}
          >
            <Save className="mr-2 h-4 w-4" />
            {template ? 'Update Template' : 'Create Template'}
          </Button>
        </div>
      </div>
    </div>
  )
}