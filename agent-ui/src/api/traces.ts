import { toast } from 'sonner'

import { APIRoutes } from './routes'

import type { PaginatedResponse } from '@/types/os'
import type {
  TracesConfig,
  TraceSessionStats,
  TraceSummary,
  TraceDetail
} from '@/types/traces'

const createHeaders = (authToken?: string): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  }
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`
  }
  return headers
}

export const getOSConfigAPI = async (
  endpoint: string,
  authToken?: string
): Promise<TracesConfig | null> => {
  try {
    const response = await fetch(APIRoutes.GetConfig(endpoint), {
      method: 'GET',
      headers: createHeaders(authToken)
    })
    if (!response.ok) {
      toast.error(`Failed to fetch config: ${response.statusText}`)
      return null
    }
    return await response.json()
  } catch {
    toast.error('Error fetching config')
    return null
  }
}

export const getTraceSessionStatsAPI = async (
  endpoint: string,
  params: {
    db_id: string
    page?: number
    limit?: number
    start_time?: string
    end_time?: string
  },
  authToken?: string
): Promise<PaginatedResponse<TraceSessionStats> | null> => {
  try {
    const url = new URL(APIRoutes.GetTraceSessionStats(endpoint))
    url.searchParams.set('db_id', params.db_id)
    if (params.page) url.searchParams.set('page', String(params.page))
    if (params.limit) url.searchParams.set('limit', String(params.limit))
    if (params.start_time) url.searchParams.set('start_time', params.start_time)
    if (params.end_time) url.searchParams.set('end_time', params.end_time)

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: createHeaders(authToken)
    })
    if (!response.ok) {
      toast.error(`Failed to fetch trace sessions: ${response.statusText}`)
      return null
    }
    return await response.json()
  } catch {
    toast.error('Error fetching trace sessions')
    return null
  }
}

export const getTracesAPI = async (
  endpoint: string,
  params: {
    session_id: string
    db_id: string
  },
  authToken?: string
): Promise<TraceSummary[] | null> => {
  try {
    const url = new URL(APIRoutes.GetTraces(endpoint))
    url.searchParams.set('session_id', params.session_id)
    url.searchParams.set('db_id', params.db_id)

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: createHeaders(authToken)
    })
    if (!response.ok) {
      toast.error(`Failed to fetch traces: ${response.statusText}`)
      return null
    }
    const json = await response.json()
    // Handle both plain array and paginated { data: [...] } responses
    if (Array.isArray(json)) return json
    if (json && Array.isArray(json.data)) return json.data
    return []
  } catch {
    toast.error('Error fetching traces')
    return null
  }
}

export const getTraceDetailAPI = async (
  endpoint: string,
  traceId: string,
  params: { db_id: string },
  authToken?: string
): Promise<TraceDetail | null> => {
  try {
    const url = new URL(APIRoutes.GetTraceDetail(endpoint, traceId))
    url.searchParams.set('db_id', params.db_id)

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: createHeaders(authToken)
    })
    if (!response.ok) {
      toast.error(`Failed to fetch trace detail: ${response.statusText}`)
      return null
    }
    const json = await response.json()
    // Handle both direct object and wrapped { data: ... } responses
    if (json && json.trace_id) return json
    if (json && json.data && json.data.trace_id) return json.data
    return json
  } catch {
    toast.error('Error fetching trace detail')
    return null
  }
}
