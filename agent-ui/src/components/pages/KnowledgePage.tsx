'use client'

import * as React from 'react'
import { RefreshCw, Plus } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/data-table'
import { KnowledgeTable } from '@/components/knowledge/KnowledgeTable'
import { KnowledgeFilterBar } from '@/components/knowledge/KnowledgeFilterBar'
import { KnowledgeBulkActions } from '@/components/knowledge/KnowledgeBulkActions'
import { KnowledgeDetailPanel } from '@/components/knowledge/KnowledgeDetailPanel'
import { AddContentDialog } from '@/components/knowledge/AddContentDialog'
import { useStore } from '@/store'
import { getKnowledgeConfigAPI, listKnowledgeContentAPI } from '@/api/knowledge'
import type { KnowledgeContent, KnowledgeDatabaseConfig } from '@/types/knowledge'
import type { PaginationInfo } from '@/types/os'

const ITEMS_PER_PAGE = 20

const SORT_MAP: Record<string, { sort_by: string; sort_order: string }> = {
  date_desc: { sort_by: 'updated_at', sort_order: 'desc' },
  date_asc: { sort_by: 'updated_at', sort_order: 'asc' },
  name_asc: { sort_by: 'name', sort_order: 'asc' },
  name_desc: { sort_by: 'name', sort_order: 'desc' }
}

export default function KnowledgePage() {
  const selectedEndpoint = useStore((state) => state.selectedEndpoint)
  const authToken = useStore((state) => state.authToken)
  const knowledgeSortOrder = useStore((state) => state.knowledgeSortOrder)

  const [databases, setDatabases] = React.useState<KnowledgeDatabaseConfig[]>([])
  const [selectedDbId, setSelectedDbId] = React.useState<string>('')
  const [currentPage, setCurrentPage] = React.useState(1)
  const [content, setContent] = React.useState<KnowledgeContent[]>([])
  const [paginationMeta, setPaginationMeta] = React.useState<PaginationInfo | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [configLoaded, setConfigLoaded] = React.useState(false)
  const [addDialogOpen, setAddDialogOpen] = React.useState(false)

  // Fetch config to get available databases
  React.useEffect(() => {
    const fetchConfig = async () => {
      const dbs = await getKnowledgeConfigAPI(selectedEndpoint, authToken)
      if (dbs && dbs.length > 0) {
        setDatabases(dbs)
        setSelectedDbId(dbs[0].db_id)
      }
      setConfigLoaded(true)
    }
    fetchConfig()
  }, [selectedEndpoint, authToken])

  // Fetch content list
  const fetchContent = React.useCallback(async () => {
    if (!selectedDbId) {
      setContent([])
      setPaginationMeta(null)
      return
    }

    setLoading(true)
    const sortParams = SORT_MAP[knowledgeSortOrder] || SORT_MAP.date_desc

    const result = await listKnowledgeContentAPI(
      selectedEndpoint,
      {
        db_id: selectedDbId,
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        ...sortParams
      },
      authToken
    )

    if (result) {
      setContent(result.data)
      setPaginationMeta(result.meta)
    } else {
      setContent([])
      setPaginationMeta(null)
    }
    setLoading(false)
  }, [selectedDbId, currentPage, knowledgeSortOrder, selectedEndpoint, authToken])

  // Only fetch content once config has loaded and we have a dbId
  React.useEffect(() => {
    if (configLoaded) {
      fetchContent()
    }
  }, [configLoaded, fetchContent])

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [selectedDbId, knowledgeSortOrder])

  const totalPages = paginationMeta?.total_pages ?? 1

  const handleDeleteComplete = () => {
    fetchContent()
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col min-h-0 min-w-0">
        <div className="flex flex-1 min-h-0 flex-col p-6 overflow-auto">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Knowledge</h1>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAddDialogOpen(true)}
                disabled={!selectedDbId}
                className="gap-2 text-xs uppercase text-muted-foreground"
              >
                <Plus className="h-4 w-4" />
                Add Content
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchContent}
                disabled={loading}
                className="gap-2 text-xs uppercase text-muted-foreground"
              >
                <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col gap-4">
            <KnowledgeFilterBar
              databases={databases}
              selectedDbId={selectedDbId}
              onDbChange={setSelectedDbId}
            />
            <KnowledgeBulkActions
              dbId={selectedDbId}
              onDeleteComplete={handleDeleteComplete}
            />
            <KnowledgeTable
              content={content}
              loading={loading}
              totalCount={paginationMeta?.total_count}
            />
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                className="mt-4"
              />
            )}
          </div>
        </div>
      </div>
      <KnowledgeDetailPanel
        dbId={selectedDbId}
        onDeleteComplete={handleDeleteComplete}
        onSaveComplete={fetchContent}
      />

      <AddContentDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        dbId={selectedDbId}
        onUploadComplete={fetchContent}
      />
    </div>
  )
}
