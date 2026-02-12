'use client'

import * as React from 'react'
import { Plus, Trash2, Globe, FileText, Type } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { KnowledgeContent } from '@/types/knowledge'

const inputClassName =
  'w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring'

interface KnowledgeDetailFormProps {
  content: KnowledgeContent | null
  editedName: string
  setEditedName: (name: string) => void
  editedDescription: string
  setEditedDescription: (desc: string) => void
  editedMetadata: [string, string][]
  setEditedMetadata: (meta: [string, string][]) => void
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return '-'
  const month = date.toLocaleDateString('en-US', { month: 'short' })
  const day = date.getDate()
  const year = date.getFullYear()
  const time = date
    .toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
    .toLowerCase()
  return `${month} ${day}, ${year}, ${time}`
}

function ContentTypeDisplay({ content }: { content: KnowledgeContent }) {
  if (content.linked_to) {
    return (
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4 text-muted-foreground" />
        <span>Web</span>
        <span className="ml-2 truncate text-xs text-muted-foreground">
          {content.linked_to}
        </span>
      </div>
    )
  }

  const t = (content.type || '').toLowerCase()
  if (t.includes('text') || t === 'text') {
    return (
      <div className="flex items-center gap-2">
        <Type className="h-4 w-4 text-muted-foreground" />
        <span>Text</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <FileText className="h-4 w-4 text-muted-foreground" />
      <span>File</span>
      {content.type && (
        <span className="ml-2 text-xs text-muted-foreground">{content.type}</span>
      )}
    </div>
  )
}

export function KnowledgeDetailForm({
  content,
  editedName,
  setEditedName,
  editedDescription,
  setEditedDescription,
  editedMetadata,
  setEditedMetadata
}: KnowledgeDetailFormProps) {
  if (!content) return null

  const handleAddMetadataRow = () => {
    setEditedMetadata([...editedMetadata, ['', '']])
  }

  const handleRemoveMetadataRow = (index: number) => {
    setEditedMetadata(editedMetadata.filter((_, i) => i !== index))
  }

  const handleMetadataKeyChange = (index: number, key: string) => {
    const updated = [...editedMetadata] as [string, string][]
    updated[index] = [key, updated[index][1]]
    setEditedMetadata(updated)
  }

  const handleMetadataValueChange = (index: number, value: string) => {
    const updated = [...editedMetadata] as [string, string][]
    updated[index] = [updated[index][0], value]
    setEditedMetadata(updated)
  }

  return (
    <div className="space-y-5 p-4">
      {/* Name */}
      <div className="space-y-1.5">
        <label className="font-dmmono text-xs uppercase text-muted">Name</label>
        <input
          value={editedName}
          onChange={(e) => setEditedName(e.target.value)}
          placeholder="Content name"
          className={inputClassName}
        />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label className="font-dmmono text-xs uppercase text-muted">
          Description
        </label>
        <textarea
          value={editedDescription}
          onChange={(e) => setEditedDescription(e.target.value)}
          placeholder="Optional description"
          rows={3}
          className="w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm text-primary placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>

      {/* Content Type (read-only) */}
      <div className="space-y-1.5">
        <label className="font-dmmono text-xs uppercase text-muted">
          Content Type
        </label>
        <div className="rounded-md border border-border px-3 py-2 text-sm">
          <ContentTypeDisplay content={content} />
        </div>
      </div>

      {/* Updated At (read-only) */}
      <div className="space-y-1.5">
        <label className="font-dmmono text-xs uppercase text-muted">
          Updated At
        </label>
        <div className="rounded-md border border-border px-3 py-2 text-sm text-muted-foreground">
          {formatDate(content.updated_at)}
        </div>
      </div>

      {/* Metadata key-value editor */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label className="font-dmmono text-xs uppercase text-muted">
            Metadata
          </label>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleAddMetadataRow}
            className="h-7 gap-1 text-xs"
          >
            <Plus className="h-3 w-3" />
            Add
          </Button>
        </div>
        {editedMetadata.length === 0 && (
          <p className="text-xs text-muted-foreground">No metadata</p>
        )}
        <div className="space-y-2">
          {editedMetadata.map(([key, value], index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                value={key}
                onChange={(e) => handleMetadataKeyChange(index, e.target.value)}
                placeholder="Key"
                className={`flex-1 ${inputClassName}`}
              />
              <input
                value={value}
                onChange={(e) =>
                  handleMetadataValueChange(index, e.target.value)
                }
                placeholder="Value"
                className={`flex-1 ${inputClassName}`}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveMetadataRow(index)}
                className="h-8 w-8 shrink-0"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
