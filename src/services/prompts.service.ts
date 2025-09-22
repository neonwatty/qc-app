import { PromptTemplate, CustomPrompt } from '@/types'
import { authService } from './auth.service'

export interface CreatePromptTemplateRequest {
  title: string
  description: string
  prompts: string[]
  categoryId?: string
  tags: string[]
  isSystem?: boolean
}

export interface UpdatePromptTemplateRequest {
  title?: string
  description?: string
  prompts?: string[]
  categoryId?: string
  tags?: string[]
}

export interface CreateCustomPromptRequest {
  content: string
  categoryId: string
  order?: number
  isActive?: boolean
}

class PromptsService {
  private readonly basePath = '/api/prompts'

  private async makeRequest<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = authService.getAccessToken()

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers
      }
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`)
    }

    return response.json()
  }

  // Template CRUD operations
  async getTemplates(): Promise<PromptTemplate[]> {
    try {
      return await this.makeRequest<PromptTemplate[]>(`${this.basePath}/templates`)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return this.mockGetTemplates()
      }
      throw error
    }
  }

  async createTemplate(request: CreatePromptTemplateRequest): Promise<PromptTemplate> {
    try {
      return await this.makeRequest<PromptTemplate>(`${this.basePath}/templates`, {
        method: 'POST',
        body: JSON.stringify(request)
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return this.mockCreateTemplate(request)
      }
      throw error
    }
  }

  async updateTemplate(id: string, request: UpdatePromptTemplateRequest): Promise<PromptTemplate> {
    try {
      return await this.makeRequest<PromptTemplate>(`${this.basePath}/templates/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(request)
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return this.mockUpdateTemplate(id, request)
      }
      throw error
    }
  }

  async deleteTemplate(id: string): Promise<void> {
    try {
      await this.makeRequest<void>(`${this.basePath}/templates/${id}`, {
        method: 'DELETE'
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        this.mockDeleteTemplate(id)
        return
      }
      throw error
    }
  }

  async duplicateTemplate(id: string): Promise<PromptTemplate> {
    try {
      return await this.makeRequest<PromptTemplate>(`${this.basePath}/templates/${id}/duplicate`, {
        method: 'POST'
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return this.mockDuplicateTemplate(id)
      }
      throw error
    }
  }

  // Custom prompt operations
  async getCustomPrompts(categoryId?: string): Promise<CustomPrompt[]> {
    try {
      const params = categoryId ? `?categoryId=${categoryId}` : ''
      return await this.makeRequest<CustomPrompt[]>(`${this.basePath}/custom${params}`)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return this.mockGetCustomPrompts(categoryId)
      }
      throw error
    }
  }

  async createCustomPrompt(request: CreateCustomPromptRequest): Promise<CustomPrompt> {
    try {
      return await this.makeRequest<CustomPrompt>(`${this.basePath}/custom`, {
        method: 'POST',
        body: JSON.stringify(request)
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return this.mockCreateCustomPrompt(request)
      }
      throw error
    }
  }

  async updateCustomPrompt(id: string, updates: Partial<CustomPrompt>): Promise<CustomPrompt> {
    try {
      return await this.makeRequest<CustomPrompt>(`${this.basePath}/custom/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates)
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        return this.mockUpdateCustomPrompt(id, updates)
      }
      throw error
    }
  }

  async deleteCustomPrompt(id: string): Promise<void> {
    try {
      await this.makeRequest<void>(`${this.basePath}/custom/${id}`, {
        method: 'DELETE'
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        this.mockDeleteCustomPrompt(id)
        return
      }
      throw error
    }
  }

  async reorderCustomPrompts(categoryId: string, promptIds: string[]): Promise<void> {
    try {
      await this.makeRequest<void>(`${this.basePath}/custom/reorder`, {
        method: 'PUT',
        body: JSON.stringify({ categoryId, promptIds })
      })
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        this.mockReorderCustomPrompts(categoryId, promptIds)
        return
      }
      throw error
    }
  }

  // Mock implementations for development
  private mockGetTemplates(): PromptTemplate[] {
    const stored = localStorage.getItem('prompt-templates')
    if (!stored) return []

    try {
      const templates = JSON.parse(stored)
      return templates.map((t: any) => ({
        ...t,
        createdAt: new Date(t.createdAt),
        updatedAt: new Date(t.updatedAt)
      }))
    } catch {
      return []
    }
  }

  private mockCreateTemplate(request: CreatePromptTemplateRequest): PromptTemplate {
    const template: PromptTemplate = {
      id: `template_${Date.now()}`,
      ...request,
      isSystem: request.isSystem || false,
      usageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const stored = localStorage.getItem('prompt-templates')
    const templates = stored ? JSON.parse(stored) : []
    templates.push(template)
    localStorage.setItem('prompt-templates', JSON.stringify(templates))

    return template
  }

  private mockUpdateTemplate(id: string, request: UpdatePromptTemplateRequest): PromptTemplate {
    const stored = localStorage.getItem('prompt-templates')
    if (!stored) throw new Error('No templates found')

    const templates = JSON.parse(stored)
    const index = templates.findIndex((t: PromptTemplate) => t.id === id)

    if (index === -1) throw new Error('Template not found')

    templates[index] = {
      ...templates[index],
      ...request,
      updatedAt: new Date()
    }

    localStorage.setItem('prompt-templates', JSON.stringify(templates))
    return templates[index]
  }

  private mockDeleteTemplate(id: string): void {
    const stored = localStorage.getItem('prompt-templates')
    if (!stored) return

    const templates = JSON.parse(stored)
    const filtered = templates.filter((t: PromptTemplate) => t.id !== id)
    localStorage.setItem('prompt-templates', JSON.stringify(filtered))
  }

  private mockDuplicateTemplate(id: string): PromptTemplate {
    const stored = localStorage.getItem('prompt-templates')
    if (!stored) throw new Error('No templates found')

    const templates = JSON.parse(stored)
    const template = templates.find((t: PromptTemplate) => t.id === id)

    if (!template) throw new Error('Template not found')

    const duplicate: PromptTemplate = {
      ...template,
      id: `template_${Date.now()}`,
      title: `${template.title} (Copy)`,
      isSystem: false,
      usageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    templates.push(duplicate)
    localStorage.setItem('prompt-templates', JSON.stringify(templates))

    return duplicate
  }

  private mockGetCustomPrompts(categoryId?: string): CustomPrompt[] {
    const stored = localStorage.getItem('custom-prompts')
    if (!stored) return []

    try {
      const prompts = JSON.parse(stored)
      const result = categoryId
        ? prompts.filter((p: CustomPrompt) => p.categoryId === categoryId)
        : prompts

      return result.map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt)
      }))
    } catch {
      return []
    }
  }

  private mockCreateCustomPrompt(request: CreateCustomPromptRequest): CustomPrompt {
    const prompt: CustomPrompt = {
      id: `prompt_${Date.now()}`,
      content: request.content,
      categoryId: request.categoryId,
      order: request.order || Date.now(),
      isActive: request.isActive !== false,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const stored = localStorage.getItem('custom-prompts')
    const prompts = stored ? JSON.parse(stored) : []
    prompts.push(prompt)
    localStorage.setItem('custom-prompts', JSON.stringify(prompts))

    return prompt
  }

  private mockUpdateCustomPrompt(id: string, updates: Partial<CustomPrompt>): CustomPrompt {
    const stored = localStorage.getItem('custom-prompts')
    if (!stored) throw new Error('No prompts found')

    const prompts = JSON.parse(stored)
    const index = prompts.findIndex((p: CustomPrompt) => p.id === id)

    if (index === -1) throw new Error('Prompt not found')

    prompts[index] = {
      ...prompts[index],
      ...updates,
      updatedAt: new Date()
    }

    localStorage.setItem('custom-prompts', JSON.stringify(prompts))
    return prompts[index]
  }

  private mockDeleteCustomPrompt(id: string): void {
    const stored = localStorage.getItem('custom-prompts')
    if (!stored) return

    const prompts = JSON.parse(stored)
    const filtered = prompts.filter((p: CustomPrompt) => p.id !== id)
    localStorage.setItem('custom-prompts', JSON.stringify(filtered))
  }

  private mockReorderCustomPrompts(categoryId: string, promptIds: string[]): void {
    const stored = localStorage.getItem('custom-prompts')
    if (!stored) return

    const prompts = JSON.parse(stored)

    // Update order for specified prompts
    promptIds.forEach((id, index) => {
      const promptIndex = prompts.findIndex((p: CustomPrompt) => p.id === id)
      if (promptIndex !== -1) {
        prompts[promptIndex].order = index
      }
    })

    localStorage.setItem('custom-prompts', JSON.stringify(prompts))
  }
}

export const promptsService = new PromptsService()