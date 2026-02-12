import { toast } from 'sonner'

import { APIRoutes } from './routes'

import type { PaginatedResponse } from '@/types/os'
import type { KnowledgeContent, KnowledgeDatabaseConfig } from '@/types/knowledge'

const createHeaders = (authToken?: string): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  }
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`
  }
  return headers
}

const createAuthHeaders = (authToken?: string): HeadersInit => {
  const headers: HeadersInit = {}
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`
  }
  return headers
}

export const getKnowledgeConfigAPI = async (
  endpoint: string,
  authToken?: string
): Promise<KnowledgeDatabaseConfig[] | null> => {
  try {
    const response = await fetch(APIRoutes.GetConfig(endpoint), {
      method: 'GET',
      headers: createHeaders(authToken)
    })
    if (!response.ok) {
      toast.error(`Failed to fetch config: ${response.statusText}`)
      return null
    }
    const config = await response.json()
    return config?.knowledge?.dbs ?? null
  } catch {
    toast.error('Error fetching knowledge config')
    return null
  }
}

export const listKnowledgeContentAPI = async (
  endpoint: string,
  params: {
    db_id: string
    page?: number
    limit?: number
    sort_by?: string
    sort_order?: string
  },
  authToken?: string
): Promise<PaginatedResponse<KnowledgeContent> | null> => {
  try {
    const url = new URL(APIRoutes.ListKnowledgeContent(endpoint))
    url.searchParams.set('db_id', params.db_id)
    if (params.page) url.searchParams.set('page', String(params.page))
    if (params.limit) url.searchParams.set('limit', String(params.limit))
    if (params.sort_by) url.searchParams.set('sort_by', params.sort_by)
    if (params.sort_order) url.searchParams.set('sort_order', params.sort_order)

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: createHeaders(authToken)
    })
    if (!response.ok) {
      toast.error(`Failed to fetch knowledge content: ${response.statusText}`)
      return null
    }
    return await response.json()
  } catch {
    toast.error('Error fetching knowledge content')
    return null
  }
}

export const getKnowledgeContentAPI = async (
  endpoint: string,
  contentId: string,
  dbId: string,
  authToken?: string
): Promise<KnowledgeContent | null> => {
  try {
    const url = new URL(APIRoutes.GetKnowledgeContent(endpoint, contentId))
    url.searchParams.set('db_id', dbId)

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: createHeaders(authToken)
    })
    if (!response.ok) {
      toast.error(`Failed to fetch content: ${response.statusText}`)
      return null
    }
    return await response.json()
  } catch {
    toast.error('Error fetching content')
    return null
  }
}

export const uploadKnowledgeContentAPI = async (
  endpoint: string,
  dbId: string,
  formData: FormData,
  authToken?: string
): Promise<KnowledgeContent | null> => {
  try {
    const url = new URL(APIRoutes.ListKnowledgeContent(endpoint))
    url.searchParams.set('db_id', dbId)

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: createAuthHeaders(authToken),
      body: formData
    })
    if (!response.ok) {
      toast.error(`Failed to upload content: ${response.statusText}`)
      return null
    }
    return await response.json()
  } catch {
    toast.error('Error uploading content')
    return null
  }
}

export const updateKnowledgeContentAPI = async (
  endpoint: string,
  contentId: string,
  dbId: string,
  data: { name?: string; description?: string; metadata?: Record<string, unknown> },
  authToken?: string
): Promise<KnowledgeContent | null> => {
  try {
    const url = new URL(APIRoutes.GetKnowledgeContent(endpoint, contentId))
    url.searchParams.set('db_id', dbId)

    const response = await fetch(url.toString(), {
      method: 'PATCH',
      headers: createHeaders(authToken),
      body: JSON.stringify(data)
    })
    if (!response.ok) {
      toast.error(`Failed to update content: ${response.statusText}`)
      return null
    }
    return await response.json()
  } catch {
    toast.error('Error updating content')
    return null
  }
}

export const deleteKnowledgeContentAPI = async (
  endpoint: string,
  contentId: string,
  dbId: string,
  authToken?: string
): Promise<Response | null> => {
  try {
    const url = new URL(APIRoutes.DeleteKnowledgeContent(endpoint, contentId))
    url.searchParams.set('db_id', dbId)

    const response = await fetch(url.toString(), {
      method: 'DELETE',
      headers: createHeaders(authToken)
    })
    if (!response.ok) {
      toast.error(`Failed to delete content: ${response.statusText}`)
      return null
    }
    return response
  } catch {
    toast.error('Error deleting content')
    return null
  }
}

export const bulkDeleteKnowledgeContentAPI = async (
  endpoint: string,
  contentIds: string[],
  dbId: string,
  authToken?: string
): Promise<Response | null> => {
  try {
    const url = new URL(APIRoutes.ListKnowledgeContent(endpoint))
    url.searchParams.set('db_id', dbId)

    const response = await fetch(url.toString(), {
      method: 'DELETE',
      headers: createHeaders(authToken),
      body: JSON.stringify({ content_ids: contentIds })
    })
    if (!response.ok) {
      toast.error(`Failed to delete content: ${response.statusText}`)
      return null
    }
    return response
  } catch {
    toast.error('Error deleting content')
    return null
  }
}
