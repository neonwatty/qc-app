import apiClient from '../client'
import type { Category, CustomPrompt, PromptTemplate } from '@/types'
import type {
  ApiResponse,
  PaginatedResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  BaseFilter
} from '../types'

interface CategoryFilter extends BaseFilter {
  isCustom?: boolean
  isActive?: boolean
}

interface PromptFilter extends BaseFilter {
  categoryId?: string
  tags?: string[]
  isSystem?: boolean
}

class CategoriesService {
  // Category CRUD operations
  async createCategory(data: CreateCategoryRequest): Promise<Category> {
    const response = await apiClient.post<ApiResponse<Category>>('/categories', data)
    return response.data.data
  }

  async getCategory(categoryId: string): Promise<Category> {
    const response = await apiClient.get<ApiResponse<Category>>(`/categories/${categoryId}`)
    return response.data.data
  }

  async updateCategory(categoryId: string, data: UpdateCategoryRequest): Promise<Category> {
    const response = await apiClient.patch<ApiResponse<Category>>(`/categories/${categoryId}`, data)
    return response.data.data
  }

  async deleteCategory(categoryId: string): Promise<void> {
    await apiClient.delete(`/categories/${categoryId}`)
  }

  async getCategories(coupleId: string, filter?: CategoryFilter): Promise<PaginatedResponse<Category>> {
    const response = await apiClient.get<PaginatedResponse<Category>>('/categories', {
      params: {
        coupleId,
        ...filter,
      },
    })
    return response.data
  }

  // Get default system categories
  async getDefaultCategories(): Promise<Category[]> {
    const response = await apiClient.get<ApiResponse<Category[]>>('/categories/defaults')
    return response.data.data
  }

  // Reorder categories
  async reorderCategories(coupleId: string, categoryOrder: string[]): Promise<Category[]> {
    const response = await apiClient.post<ApiResponse<Category[]>>('/categories/reorder', {
      coupleId,
      order: categoryOrder,
    })
    return response.data.data
  }

  // Prompt template operations
  async getPromptTemplates(filter?: PromptFilter): Promise<PaginatedResponse<PromptTemplate>> {
    const response = await apiClient.get<PaginatedResponse<PromptTemplate>>('/prompt-templates', {
      params: filter,
    })
    return response.data
  }

  async getPromptTemplate(templateId: string): Promise<PromptTemplate> {
    const response = await apiClient.get<ApiResponse<PromptTemplate>>(`/prompt-templates/${templateId}`)
    return response.data.data
  }

  async createPromptTemplate(data: Partial<PromptTemplate>): Promise<PromptTemplate> {
    const response = await apiClient.post<ApiResponse<PromptTemplate>>('/prompt-templates', data)
    return response.data.data
  }

  async updatePromptTemplate(templateId: string, data: Partial<PromptTemplate>): Promise<PromptTemplate> {
    const response = await apiClient.patch<ApiResponse<PromptTemplate>>(`/prompt-templates/${templateId}`, data)
    return response.data.data
  }

  async deletePromptTemplate(templateId: string): Promise<void> {
    await apiClient.delete(`/prompt-templates/${templateId}`)
  }

  // Custom prompt operations for a couple
  async getCustomPrompts(coupleId: string, categoryId?: string): Promise<CustomPrompt[]> {
    const response = await apiClient.get<ApiResponse<CustomPrompt[]>>('/custom-prompts', {
      params: {
        coupleId,
        categoryId,
      },
    })
    return response.data.data
  }

  async createCustomPrompt(data: Partial<CustomPrompt> & { coupleId: string }): Promise<CustomPrompt> {
    const response = await apiClient.post<ApiResponse<CustomPrompt>>('/custom-prompts', data)
    return response.data.data
  }

  async updateCustomPrompt(promptId: string, data: Partial<CustomPrompt>): Promise<CustomPrompt> {
    const response = await apiClient.patch<ApiResponse<CustomPrompt>>(`/custom-prompts/${promptId}`, data)
    return response.data.data
  }

  async deleteCustomPrompt(promptId: string): Promise<void> {
    await apiClient.delete(`/custom-prompts/${promptId}`)
  }

  async reorderCustomPrompts(categoryId: string, promptOrder: string[]): Promise<CustomPrompt[]> {
    const response = await apiClient.post<ApiResponse<CustomPrompt[]>>('/custom-prompts/reorder', {
      categoryId,
      order: promptOrder,
    })
    return response.data.data
  }

  // Toggle prompt active status
  async togglePromptActive(promptId: string): Promise<CustomPrompt> {
    const response = await apiClient.post<ApiResponse<CustomPrompt>>(`/custom-prompts/${promptId}/toggle-active`)
    return response.data.data
  }

  // Get suggested prompts based on usage
  async getSuggestedPrompts(coupleId: string, categoryId?: string): Promise<string[]> {
    const response = await apiClient.get<ApiResponse<string[]>>('/prompts/suggestions', {
      params: {
        coupleId,
        categoryId,
      },
    })
    return response.data.data
  }

  // Track prompt usage
  async trackPromptUsage(promptId: string, context?: { checkInId?: string; positive?: boolean }): Promise<void> {
    await apiClient.post('/prompts/track-usage', {
      promptId,
      ...context,
    })
  }

  // Import/Export categories and prompts
  async exportCategories(coupleId: string): Promise<Blob> {
    const response = await apiClient.get(`/categories/export`, {
      params: { coupleId },
      responseType: 'blob',
    })
    return response.data
  }

  async importCategories(coupleId: string, file: File): Promise<{ imported: number; skipped: number }> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('coupleId', coupleId)

    const response = await apiClient.post<ApiResponse<{ imported: number; skipped: number }>>(
      '/categories/import',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    return response.data.data
  }
}

export default new CategoriesService()