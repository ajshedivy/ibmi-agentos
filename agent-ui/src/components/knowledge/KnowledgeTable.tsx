'use client'

import * as React from 'react'
import { Globe, FileText, Type, CheckCircle2, XCircle, Loader2 } from 'lucide-react'

import { DataTable, type Column } from '@/components/ui/data-table'
import { useStore } from '@/store'
import type { KnowledgeContent } from '@/types/knowledge'

interface KnowledgeTableProps {
  content: KnowledgeContent[]
  loading: boolean
  totalCount?: number
}

function ContentTypeCell({ type, linkedTo }: { type: string | null; linkedTo: string | null }) {
  if (linkedTo) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Globe className="h-4 w-4 shrink-0" />
        <span>Web</span>
      </div>
    )
  }

  const t = (type || '').toLowerCase()
  if (t.includes('text') || t === 'text') {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Type className="h-4 w-4 shrink-0" />
        <span>Text</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <FileText className="h-4 w-4 shrink-0" />
      <span>File</span>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'completed':
      return (
        <div className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-500">
          <CheckCircle2 className="h-3 w-3" />
          COMPLETED
        </div>
      )
    case 'processing':
      return (
        <div className="inline-flex items-center gap-1.5 rounded-full bg-yellow-500/10 px-2.5 py-0.5 text-xs font-medium text-yellow-500">
          <Loader2 className="h-3 w-3 animate-spin" />
          PROCESSING
        </div>
      )
    case 'failed':
      return (
        <div className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-500">
          <XCircle className="h-3 w-3" />
          FAILED
        </div>
      )
    default:
      return <span className="text-xs text-muted-foreground">{status}</span>
  }
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '-'
  return (
    date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }) +
    ', ' +
    date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    })
  )
}

export function KnowledgeTable({ content, loading, totalCount }: KnowledgeTableProps) {
  const selectedKnowledgeIds = useStore((state) => state.selectedKnowledgeIds)
  const setSelectedKnowledgeIds = useStore((state) => state.setSelectedKnowledgeIds)
  const setActiveKnowledgeId = useStore((state) => state.setActiveKnowledgeId)
  const setKnowledgeDetailOpen = useStore((state) => state.setKnowledgeDetailOpen)
  const activeKnowledgeId = useStore((state) => state.activeKnowledgeId)
  const knowledgeDetailOpen = useStore((state) => state.knowledgeDetailOpen)

  const columns: Column<KnowledgeContent>[] = [
    {
      key: 'name',
      header: 'NAME',
      render: (item) => (
        <div className="font-medium">{item.name || 'Untitled'}</div>
      )
    },
    {
      key: 'type',
      header: 'CONTENT TYPE',
      render: (item) => <ContentTypeCell type={item.type} linkedTo={item.linked_to} />,
      width: '140px'
    },
    {
      key: 'status',
      header: 'STATUS',
      render: (item) => <StatusBadge status={item.status} />,
      width: '160px'
    },
    {
      key: 'updated_at',
      header: 'UPDATED AT',
      render: (item) => (
        <div className="text-muted-foreground">{formatDate(item.updated_at)}</div>
      ),
      align: 'right',
      width: '200px'
    }
  ]

  const handleRowClick = (item: KnowledgeContent) => {
    setActiveKnowledgeId(item.id)
    setKnowledgeDetailOpen(true)
  }

  return (
    <DataTable
      columns={columns}
      data={content}
      selectable
      selectedIds={selectedKnowledgeIds}
      onSelectionChange={setSelectedKnowledgeIds}
      getRowId={(item) => item.id}
      onRowClick={handleRowClick}
      activeRowId={knowledgeDetailOpen ? activeKnowledgeId : null}
      loading={loading}
      emptyMessage="No knowledge content found"
      itemCount={totalCount ?? content.length}
    />
  )
}
