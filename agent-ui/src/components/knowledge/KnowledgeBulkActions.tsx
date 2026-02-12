'use client'

import * as React from 'react'
import { Trash2, X } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { useStore } from '@/store'
import { bulkDeleteKnowledgeContentAPI } from '@/api/knowledge'

interface KnowledgeBulkActionsProps {
  dbId: string
  onDeleteComplete: () => void
}

export function KnowledgeBulkActions({ dbId, onDeleteComplete }: KnowledgeBulkActionsProps) {
  const selectedKnowledgeIds = useStore((state) => state.selectedKnowledgeIds)
  const setSelectedKnowledgeIds = useStore((state) => state.setSelectedKnowledgeIds)
  const selectedEndpoint = useStore((state) => state.selectedEndpoint)
  const authToken = useStore((state) => state.authToken)

  const [isDeleting, setIsDeleting] = React.useState(false)

  if (selectedKnowledgeIds.size === 0) return null

  const handleDelete = async () => {
    if (selectedKnowledgeIds.size === 0) return

    const confirmed = confirm(
      `Delete ${selectedKnowledgeIds.size} item${selectedKnowledgeIds.size > 1 ? 's' : ''}? This action cannot be undone.`
    )

    if (!confirmed) return

    setIsDeleting(true)

    try {
      const response = await bulkDeleteKnowledgeContentAPI(
        selectedEndpoint,
        Array.from(selectedKnowledgeIds),
        dbId,
        authToken
      )

      if (response) {
        toast.success(
          `Deleted ${selectedKnowledgeIds.size} item${selectedKnowledgeIds.size > 1 ? 's' : ''}`
        )
        setSelectedKnowledgeIds(new Set())
        onDeleteComplete()
      }
    } catch {
      toast.error('Error deleting content')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex items-center justify-between rounded-md border bg-muted/50 p-3">
      <span className="text-sm font-medium">
        {selectedKnowledgeIds.size} selected
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedKnowledgeIds(new Set())}
        >
          <X className="h-4 w-4" />
          Clear
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </div>
    </div>
  )
}
