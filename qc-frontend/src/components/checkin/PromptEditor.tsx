'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Save, X, Type, Hash, AtSign, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { CustomPrompt } from '@/types'
import { cn } from '@/lib/utils'

interface PromptEditorProps {
  prompt: CustomPrompt
  isNew?: boolean
  onSave: (content: string) => void
  onCancel: () => void
  className?: string
}

const promptVariables = [
  { key: '{partner_name}', description: "Your partner's name" },
  { key: '{your_name}', description: 'Your name' },
  { key: '{date}', description: "Today's date" },
  { key: '{category}', description: 'Current category name' },
  { key: '{time_since_last}', description: 'Time since last check-in' },
]

const promptTips = [
  'Keep prompts open-ended to encourage discussion',
  'Focus on feelings and experiences rather than facts',
  'Use "we" language to promote partnership',
  'Avoid yes/no questions',
  'Include follow-up questions for deeper exploration',
]

export const PromptEditor: React.FC<PromptEditorProps> = ({
  prompt,
  isNew = false,
  onSave,
  onCancel,
  className
}) => {
  const [content, setContent] = useState(prompt.content)
  const [charCount, setCharCount] = useState(prompt.content.length)
  const [hasChanges, setHasChanges] = useState(false)
  const [showTips, setShowTips] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const maxCharCount = 500
  const minCharCount = 10

  useEffect(() => {
    if (textareaRef.current && isNew) {
      textareaRef.current.focus()
    }
  }, [isNew])

  useEffect(() => {
    setCharCount(content.length)
    setHasChanges(content !== prompt.content)
  }, [content, prompt.content])

  const handleSave = () => {
    if (content.length >= minCharCount && content.length <= maxCharCount) {
      onSave(content.trim())
    }
  }

  const handleInsertVariable = (variable: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const newContent = content.slice(0, start) + variable + content.slice(end)
    
    setContent(newContent)
    
    setTimeout(() => {
      textarea.selectionStart = start + variable.length
      textarea.selectionEnd = start + variable.length
      textarea.focus()
    }, 0)
  }

  const isValid = content.length >= minCharCount && content.length <= maxCharCount

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className={cn('sm:max-w-[600px]', className)}>
        <DialogHeader>
          <DialogTitle>
            {isNew ? 'Create New Prompt' : 'Edit Prompt'}
          </DialogTitle>
          <DialogDescription>
            Write a discussion prompt to guide meaningful conversations
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label htmlFor="prompt-content">Prompt Content</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowTips(!showTips)}
                    >
                      <HelpCircle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Click for writing tips</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <Textarea
              id="prompt-content"
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="E.g., 'How did we support each other this week? What moments stood out?'"
              className="min-h-[120px] resize-none"
              maxLength={maxCharCount}
            />
            
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className={cn(
                'text-muted-foreground',
                charCount < minCharCount && 'text-destructive',
                charCount > maxCharCount * 0.9 && 'text-warning'
              )}>
                {charCount}/{maxCharCount} characters
              </span>
              {hasChanges && (
                <Badge variant="outline" className="text-xs">
                  Unsaved changes
                </Badge>
              )}
            </div>
          </div>

          <AnimatePresence>
            {showTips && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-lg border bg-muted/50 p-3"
              >
                <p className="mb-2 text-sm font-medium">Writing Tips:</p>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {promptTips.map((tip, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <Label className="mb-2 block text-sm">Insert Variables</Label>
            <div className="flex flex-wrap gap-2">
              {promptVariables.map((variable) => (
                <TooltipProvider key={variable.key}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleInsertVariable(variable.key)}
                        className="h-7 text-xs"
                      >
                        <Hash className="mr-1 h-3 w-3" />
                        {variable.key}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{variable.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>

          <div className="rounded-lg border bg-muted/50 p-3">
            <p className="text-sm font-medium">Preview:</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {content.replace(/{partner_name}/g, 'Alex')
                .replace(/{your_name}/g, 'Sam')
                .replace(/{date}/g, new Date().toLocaleDateString())
                .replace(/{category}/g, 'Communication')
                .replace(/{time_since_last}/g, '3 days')
                || 'Your prompt will appear here...'}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!isValid || !hasChanges}
          >
            <Save className="mr-2 h-4 w-4" />
            Save Prompt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

