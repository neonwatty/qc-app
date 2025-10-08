'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Library,
  Plus,
  Search,
  Filter,
  Star,
  Clock,
  ChevronRight,
  Copy,
  Edit2,
  Trash2,
  Tags,
  Grid3x3,
  List,
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Users
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
  DropdownMenuCheckboxItem
} from '@/components/ui/dropdown-menu'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { PromptTemplate, Category } from '@/types'
import { PromptTemplateEditor } from './PromptTemplateEditor'
import { cn } from '@/lib/utils'

interface PromptLibraryProps {
  templates: PromptTemplate[]
  categories: Category[]
  onCreateTemplate: (template: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void
  onUpdateTemplate: (id: string, updates: Partial<PromptTemplate>) => void
  onDeleteTemplate: (id: string) => void
  onApplyTemplate: (template: PromptTemplate) => void
  className?: string
}

type ViewMode = 'grid' | 'list'
type SortBy = 'name' | 'usage' | 'recent' | 'category'
type FilterTab = 'all' | 'system' | 'custom' | 'favorites'

export const PromptLibrary: React.FC<PromptLibraryProps> = ({
  templates,
  categories,
  onCreateTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
  onApplyTemplate,
  className
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortBy, setSortBy] = useState<SortBy>('usage')
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [isEditorOpen, setIsEditorOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<PromptTemplate | null>(null)
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([])
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null)
  const [favoriteTemplates, setFavoriteTemplates] = useState<string[]>([])

  // Extract all unique tags from templates
  const allTags = useMemo(() => {
    const tags = new Set<string>()
    templates.forEach(template => {
      template.tags.forEach(tag => tags.add(tag))
    })
    return Array.from(tags).sort()
  }, [templates])

  // Filter templates based on current filters
  const filteredTemplates = useMemo(() => {
    let filtered = templates

    // Tab filter
    switch (activeTab) {
      case 'system':
        filtered = filtered.filter(t => t.isSystem)
        break
      case 'custom':
        filtered = filtered.filter(t => !t.isSystem)
        break
      case 'favorites':
        filtered = filtered.filter(t => favoriteTemplates.includes(t.id))
        break
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(t => 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.prompts.some(p => p.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(t => t.categoryId === selectedCategory)
    }

    // Tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter(t => 
        selectedTags.every(tag => t.tags.includes(tag))
      )
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.title.localeCompare(b.title)
        case 'usage':
          return b.usageCount - a.usageCount
        case 'recent':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        case 'category':
          const catA = categories.find(c => c.id === a.categoryId)?.name || 'zz'
          const catB = categories.find(c => c.id === b.categoryId)?.name || 'zz'
          return catA.localeCompare(catB)
        default:
          return 0
      }
    })

    return filtered
  }, [templates, activeTab, searchQuery, selectedCategory, selectedTags, sortBy, favoriteTemplates, categories])

  // Template statistics
  const stats = useMemo(() => {
    const totalTemplates = templates.length
    const systemTemplates = templates.filter(t => t.isSystem).length
    const customTemplates = templates.filter(t => !t.isSystem).length
    const totalUsage = templates.reduce((sum, t) => sum + t.usageCount, 0)
    const avgPromptsPerTemplate = templates.length > 0
      ? Math.round(templates.reduce((sum, t) => sum + t.prompts.length, 0) / templates.length)
      : 0

    return {
      totalTemplates,
      systemTemplates,
      customTemplates,
      totalUsage,
      avgPromptsPerTemplate
    }
  }, [templates])

  const handleCreateTemplate = useCallback(() => {
    setEditingTemplate(null)
    setIsEditorOpen(true)
  }, [])

  const handleEditTemplate = useCallback((template: PromptTemplate) => {
    setEditingTemplate(template)
    setIsEditorOpen(true)
  }, [])

  const handleSaveTemplate = useCallback((template: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingTemplate) {
      onUpdateTemplate(editingTemplate.id, template)
    } else {
      onCreateTemplate(template)
    }
    setIsEditorOpen(false)
    setEditingTemplate(null)
  }, [editingTemplate, onCreateTemplate, onUpdateTemplate])

  const handleDeleteTemplate = useCallback(() => {
    if (templateToDelete) {
      onDeleteTemplate(templateToDelete)
      setTemplateToDelete(null)
      setShowDeleteDialog(false)
    }
  }, [templateToDelete, onDeleteTemplate])

  const handleToggleFavorite = useCallback((templateId: string) => {
    setFavoriteTemplates(prev => 
      prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    )
  }, [])

  const handleDuplicateTemplate = useCallback((template: PromptTemplate) => {
    const duplicated: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'> = {
      title: `${template.title} (Copy)`,
      description: template.description,
      prompts: [...template.prompts],
      categoryId: template.categoryId,
      tags: [...template.tags],
      isSystem: false,
      usageCount: 0
    }
    onCreateTemplate(duplicated)
  }, [onCreateTemplate])

  const handleBulkDelete = useCallback(() => {
    selectedTemplates.forEach(id => {
      const template = templates.find(t => t.id === id)
      if (template && !template.isSystem) {
        onDeleteTemplate(id)
      }
    })
    setSelectedTemplates([])
  }, [selectedTemplates, templates, onDeleteTemplate])

  const handleExportTemplates = useCallback(() => {
    const toExport = selectedTemplates.length > 0
      ? templates.filter(t => selectedTemplates.includes(t.id))
      : templates

    const data = JSON.stringify(toExport, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'prompt-templates.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [selectedTemplates, templates])

  const handleToggleTag = useCallback((tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }, [])

  const renderTemplateCard = (template: PromptTemplate) => {
    const category = categories.find(c => c.id === template.categoryId)
    const isFavorite = favoriteTemplates.includes(template.id)
    const isSelected = selectedTemplates.includes(template.id)

    return (
      <motion.div
        key={template.id}
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        <Card 
          className={cn(
            'relative h-full transition-all hover:shadow-lg cursor-pointer',
            isSelected && 'ring-2 ring-pink-500',
            viewMode === 'list' && 'flex'
          )}
          onClick={() => onApplyTemplate(template)}
        >
          <CardHeader className={cn(viewMode === 'list' && 'flex-1')}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-base flex items-center gap-2">
                  {template.title}
                  {template.isSystem && (
                    <Badge variant="secondary" className="text-xs">
                      System
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription className="mt-1 text-sm line-clamp-2">
                  {template.description}
                </CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation()
                    onApplyTemplate(template)
                  }}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Apply Template
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation()
                    handleToggleFavorite(template.id)
                  }}>
                    <Star className={cn('mr-2 h-4 w-4', isFavorite && 'fill-yellow-400')} />
                    {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation()
                    handleDuplicateTemplate(template)
                  }}>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicate
                  </DropdownMenuItem>
                  {!template.isSystem && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation()
                        handleEditTemplate(template)
                      }}>
                        <Edit2 className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          setTemplateToDelete(template.id)
                          setShowDeleteDialog(true)
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className={cn(viewMode === 'list' && 'flex items-center gap-4')}>
            <div className="space-y-3">
              {category && (
                <Badge variant="outline" className="text-xs">
                  {category.name}
                </Badge>
              )}
              <div className="flex flex-wrap gap-1">
                {template.tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {template.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{template.tags.length - 3} more
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <List className="h-3 w-3" />
                  {template.prompts.length} prompts
                </span>
                <span className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Used {template.usageCount} times
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header with Stats */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Library className="h-6 w-6" />
              Prompt Template Library
            </h2>
            <p className="text-muted-foreground mt-1">
              Browse and manage discussion prompt templates
            </p>
          </div>
          <Button onClick={handleCreateTemplate}>
            <Plus className="mr-2 h-4 w-4" />
            Create Template
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.totalTemplates}</div>
              <div className="text-sm text-muted-foreground">Total Templates</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.customTemplates}</div>
              <div className="text-sm text-muted-foreground">Custom Templates</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.totalUsage}</div>
              <div className="text-sm text-muted-foreground">Total Usage</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.avgPromptsPerTemplate}</div>
              <div className="text-sm text-muted-foreground">Avg Prompts</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setSelectedCategory(null)}>
                    All Categories
                  </DropdownMenuItem>
                  {categories.map(category => (
                    <DropdownMenuItem 
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      {category.name}
                      {selectedCategory === category.id && (
                        <CheckCircle className="ml-auto h-4 w-4" />
                      )}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Filter by Tags</DropdownMenuLabel>
                  {allTags.map(tag => (
                    <DropdownMenuCheckboxItem
                      key={tag}
                      checked={selectedTags.includes(tag)}
                      onCheckedChange={() => handleToggleTag(tag)}
                    >
                      {tag}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Tags className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setSortBy('name')}>
                    Name {sortBy === 'name' && <CheckCircle className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('usage')}>
                    Most Used {sortBy === 'usage' && <CheckCircle className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('recent')}>
                    Recently Updated {sortBy === 'recent' && <CheckCircle className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('category')}>
                    Category {sortBy === 'category' && <CheckCircle className="ml-auto h-4 w-4" />}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3x3 className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Active filters display */}
          {(selectedCategory || selectedTags.length > 0) && (
            <div className="flex flex-wrap gap-2">
              {selectedCategory && (
                <Badge variant="secondary" className="pr-1">
                  Category: {categories.find(c => c.id === selectedCategory)?.name}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 ml-1"
                    onClick={() => setSelectedCategory(null)}
                  >
                    ×
                  </Button>
                </Badge>
              )}
              {selectedTags.map(tag => (
                <Badge key={tag} variant="secondary" className="pr-1">
                  {tag}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 ml-1"
                    onClick={() => handleToggleTag(tag)}
                  >
                    ×
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Templates */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as FilterTab)}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
          </TabsList>

          {selectedTemplates.length > 0 && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExportTemplates}>
                <Download className="mr-2 h-4 w-4" />
                Export ({selectedTemplates.length})
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleBulkDelete}
                className="text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete ({selectedTemplates.length})
              </Button>
            </div>
          )}
        </div>

        <TabsContent value={activeTab} className="mt-4">
          <ScrollArea className="h-[600px]">
            {filteredTemplates.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No templates found</p>
                <Button variant="outline" className="mt-4" onClick={handleCreateTemplate}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Template
                </Button>
              </div>
            ) : (
              <div className={cn(
                'gap-4',
                viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'
              )}>
                <AnimatePresence mode="popLayout">
                  {filteredTemplates.map(template => renderTemplateCard(template))}
                </AnimatePresence>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Template Editor Dialog */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Edit Template' : 'Create New Template'}
            </DialogTitle>
            <DialogDescription>
              Create or modify a prompt template for discussions
            </DialogDescription>
          </DialogHeader>
          <PromptTemplateEditor
            template={editingTemplate || undefined}
            categories={categories}
            onSave={handleSaveTemplate}
            onCancel={() => setIsEditorOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this template? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTemplate}>
              Delete Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}