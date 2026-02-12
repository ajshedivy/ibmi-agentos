'use client'

import * as React from 'react'
import { Trash2, X } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { useStore } from '@/store'
import { bulkDeleteSessionsAPI } from '@/api/os'

interface BulkActionsProps {
  onDeleteComplete: () => void
}

export function BulkActions({ onDeleteComplete }: BulkActionsProps) {
  const selectedSessionIds = useStore((state) => state.selectedSessionIds)
  const setSelectedSessionIds = useStore((state) => state.setSelectedSessionIds)
  const selectedEndpoint = useStore((state) => state.selectedEndpoint)
  const authToken = useStore((state) => state.authToken)

  const [isDeleting, setIsDeleting] = React.useState(false)

  if (selectedSessionIds.size === 0) return null

  const handleDelete = async () => {
    if (selectedSessionIds.size === 0) return

    const confirmed = confirm(
      `Delete ${selectedSessionIds.size} session${selectedSessionIds.size > 1 ? 's' : ''}? This action cannot be undone.`
    )

    if (!confirmed) return

    setIsDeleting(true)

    try {
      const response = await bulkDeleteSessionsAPI(
        selectedEndpoint,
        Array.from(selectedSessionIds),
        '', // dbId - using empty string for now as it's not clear which db_id to use for bulk operations
        authToken
      )

      if (response.ok) {
        toast.success(
          `Deleted ${selectedSessionIds.size} session${selectedSessionIds.size > 1 ? 's' : ''}`
        )
        setSelectedSessionIds(new Set())
        onDeleteComplete()
      } else {
        toast.error('Failed to delete sessions')
      }
    } catch (error) {
      toast.error('Error deleting sessions')
      console.error(error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex items-center justify-between rounded-md border bg-muted/50 p-3">
      <span className="text-sm font-medium">
        {selectedSessionIds.size} selected
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSelectedSessionIds(new Set())}
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
