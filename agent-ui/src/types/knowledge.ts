export type ContentStatus = 'processing' | 'completed' | 'failed'

export type ContentType = 'file' | 'web' | 'text' | string

export interface KnowledgeContent {
  id: string
  name: string | null
  description: string | null
  type: string | null
  size: number | null
  linked_to: string | null
  metadata: Record<string, unknown> | null
  access_count: number | null
  status: ContentStatus
  status_message: string | null
  created_at: string
  updated_at: string
}

export interface KnowledgeDatabaseConfig {
  db_id: string
  domain_config?: {
    display_name?: string
  }
}
