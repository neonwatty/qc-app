'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Filter, 
  Library, 
  GripVertical,
  Save,
  X,
  Copy,
  Check
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CustomPrompt, PromptTemplate, Category } from '@/types'
import { PromptEditor } from './PromptEditor'
import { cn } from '@/lib/utils'

interface PromptManagerProps {
  category: Category
  customPrompts: CustomPrompt[]
  templates: PromptTemplate[]
  onSavePrompts: (prompts: CustomPrompt[]) => void
  onApplyTemplate: (template: PromptTemplate) => void
  onCreateTemplate: (template: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void
  className?: string
}

export const PromptManager: React.FC<PromptManagerProps> = ({
  category,
  customPrompts,
  templates,
  onSavePrompts,
  onApplyTemplate,
  onCreateTemplate,
  className
}) => {
  const [prompts, setPrompts] = useState<CustomPrompt[]>(customPrompts)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [editingPrompt, setEditingPrompt] = useState<CustomPrompt | null>(null)
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<PromptTemplate | null>(null)
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null)

  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesTag = !selectedTag || template.tags.includes(selectedTag)
      const matchesCategory = !template.categoryId || template.categoryId === category.id
      
      return matchesSearch && matchesTag && matchesCategory
    })
  }, [templates, searchQuery, selectedTag, category.id])

  const allTags = useMemo(() => {
    const tags = new Set<string>()
    templates.forEach(template => {
      template.tags.forEach(tag => tags.add(tag))
    })
    return Array.from(tags)
  }, [templates])

  const handleAddPrompt = useCallback(() => {
    const newPrompt: CustomPrompt = {
      id: `prompt-${Date.now()}`,
      content: '',
      categoryId: category.id,
      order: prompts.length,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    setEditingPrompt(newPrompt)
    setIsCreatingNew(true)
  }, [category.id, prompts.length])

  const handleSavePrompt = useCallback((content: string) => {
    if (!editingPrompt) return

    const updatedPrompt = {
      ...editingPrompt,
      content,
      updatedAt: new Date()
    }

    if (isCreatingNew) {
      setPrompts([...prompts, updatedPrompt])
    } else {
      setPrompts(prompts.map(p => p.id === updatedPrompt.id ? updatedPrompt : p))
    }

    setEditingPrompt(null)
    setIsCreatingNew(false)
  }, [editingPrompt, isCreatingNew, prompts])

  const handleDeletePrompt = useCallback((promptId: string) => {
    setPrompts(prompts.filter(p => p.id !== promptId))
  }, [prompts])

  const handleReorderPrompts = useCallback((reorderedPrompts: CustomPrompt[]) => {
    const updatedPrompts = reorderedPrompts.map((prompt, index) => ({
      ...prompt,
      order: index
    }))
    setPrompts(updatedPrompts)
  }, [])

  const handleTogglePromptActive = useCallback((promptId: string) => {
    setPrompts(prompts.map(p => 
      p.id === promptId ? { ...p, isActive: !p.isActive } : p
    ))
  }, [prompts])

  const handleCopyPrompt = useCallback((prompt: CustomPrompt) => {
    navigator.clipboard.writeText(prompt.content)
    setCopiedPromptId(prompt.id)
    setTimeout(() => setCopiedPromptId(null), 2000)
  }, [])

  const handleDuplicatePrompt = useCallback((prompt: CustomPrompt) => {
    const duplicatedPrompt: CustomPrompt = {
      ...prompt,
      id: `prompt-${Date.now()}`,
      content: `${prompt.content} (copy)`,
      order: prompts.length,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    setPrompts([...prompts, duplicatedPrompt])
  }, [prompts])

  const handleApplyTemplate = useCallback((template: PromptTemplate) => {
    const newPrompts = template.prompts.map((content, index) => ({
      id: `prompt-${Date.now()}-${index}`,
      content,
      categoryId: category.id,
      order: prompts.length + index,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }))
    setPrompts([...prompts, ...newPrompts])
    setSelectedTemplate(template)
    onApplyTemplate(template)
  }, [category.id, prompts, onApplyTemplate])

  const handleCreateTemplate = useCallback(() => {
    const activePrompts = prompts.filter(p => p.isActive)
    if (activePrompts.length === 0) return

    const template: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'> = {
      title: `${category.name} Template`,
      description: `Custom template for ${category.name}`,
      prompts: activePrompts.map(p => p.content),
      categoryId: category.id,
      tags: [category.name.toLowerCase()],
      isSystem: false,
      usageCount: 0
    }
    
    onCreateTemplate(template)
  }, [prompts, category, onCreateTemplate])

  const handleSave = useCallback(() => {
    onSavePrompts(prompts)
  }, [prompts, onSavePrompts])

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Prompts for {category.name}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCreateTemplate}
              disabled={prompts.filter(p => p.isActive).length === 0}
            >
              <Save className="mr-2 h-4 w-4" />
              Save as Template
            </Button>
          </CardTitle>
          <CardDescription>
            Manage discussion prompts for this category
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="prompts" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="prompts">Custom Prompts</TabsTrigger>
              <TabsTrigger value="templates">Templates</TabsTrigger>
            </TabsList>

            <TabsContent value="prompts" className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={handleAddPrompt} className="w-full sm:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Prompt
                </Button>
              </div>

              <ScrollArea className="h-[400px]">
                <Reorder.Group
                  axis="y"
                  values={prompts}
                  onReorder={handleReorderPrompts}
                  className="space-y-2"
                >
                  <AnimatePresence mode="popLayout">
                    {prompts.map((prompt) => (
                      <Reorder.Item
                        key={prompt.id}
                        value={prompt}
                        className={cn(
                          'relative rounded-lg border p-4 transition-opacity',
                          !prompt.isActive && 'opacity-50'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className="cursor-grab pt-1">
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                          </div>
                          
                          <div className="flex-1">
                            <p className="text-sm">{prompt.content}</p>
                            <div className="mt-2 flex items-center gap-2">
                              <Badge variant={prompt.isActive ? 'default' : 'secondary'}>
                                {prompt.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                Order: {prompt.order + 1}
                              </span>
                            </div>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setEditingPrompt(prompt)}>
                                <Edit2 className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleTogglePromptActive(prompt.id)}>
                                <Check className="mr-2 h-4 w-4" />
                                {prompt.isActive ? 'Deactivate' : 'Activate'}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleCopyPrompt(prompt)}>
                                <Copy className="mr-2 h-4 w-4" />
                                {copiedPromptId === prompt.id ? 'Copied!' : 'Copy'}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDuplicatePrompt(prompt)}>
                                <Copy className="mr-2 h-4 w-4" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive"
                                onClick={() => handleDeletePrompt(prompt.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </Reorder.Item>
                    ))}
                  </AnimatePresence>
                </Reorder.Group>
              </ScrollArea>

              <div className="flex justify-end">
                <Button onClick={handleSave}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="templates" className="space-y-4">
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter by tag</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setSelectedTag(null)}>
                      All tags
                    </DropdownMenuItem>
                    {allTags.map(tag => (
                      <DropdownMenuItem 
                        key={tag}
                        onClick={() => setSelectedTag(tag)}
                      >
                        {tag}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {filteredTemplates.map((template) => (
                    <Card key={template.id} className="cursor-pointer transition-shadow hover:shadow-md">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base">{template.title}</CardTitle>
                            <CardDescription className="mt-1 text-sm">
                              {template.description}
                            </CardDescription>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleApplyTemplate(template)}
                          >
                            Apply
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex flex-wrap gap-1">
                          {template.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="mt-3 space-y-1">
                          <p className="text-xs font-medium text-muted-foreground">
                            {template.prompts.length} prompts
                          </p>
                          {template.isSystem && (
                            <Badge variant="outline" className="text-xs">
                              <Library className="mr-1 h-3 w-3" />
                              System Template
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <AnimatePresence>
        {editingPrompt && (
          <PromptEditor
            prompt={editingPrompt}
            isNew={isCreatingNew}
            onSave={handleSavePrompt}
            onCancel={() => {
              setEditingPrompt(null)
              setIsCreatingNew(false)
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}