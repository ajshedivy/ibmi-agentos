'use client'

import * as React from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { useStore } from '@/store'
import { deleteKnowledgeContentAPI, updateKnowledgeContentAPI } from '@/api/knowledge'
import type { KnowledgeContent } from '@/types/knowledge'

interface KnowledgeActionsProps {
  content: KnowledgeContent | null
  dbId: string
  editedName: string
  editedDescription: string
  editedMetadata: [string, string][]
  onSaveComplete: () => void
  onDeleteComplete: () => void
}

export function KnowledgeActions({
  content,
  dbId,
  editedName,
  editedDescription,
  editedMetadata,
  onSaveComplete,
  onDeleteComplete
}: KnowledgeActionsProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)

  const setKnowledgeDetailOpen = useStore((state) => state.setKnowledgeDetailOpen)
  const setActiveKnowledgeId = useStore((state) => state.setActiveKnowledgeId)
  const selectedEndpoint = useStore((state) => state.selectedEndpoint)
  const authToken = useStore((state) => state.authToken)

  const handleClose = () => {
    setKnowledgeDetailOpen(false)
    setActiveKnowledgeId(null)
  }

  const handleSave = async () => {
    if (!content) return

    setIsSaving(true)
    try {
      const metadataObj: Record<string, unknown> = {}
      for (const [key, value] of editedMetadata) {
        if (key.trim()) {
          metadataObj[key.trim()] = value
        }
      }

      const result = await updateKnowledgeContentAPI(
        selectedEndpoint,
        content.id,
        dbId,
        {
          name: editedName,
          description: editedDescription || undefined,
          metadata: Object.keys(metadataObj).length > 0 ? metadataObj : undefined
        },
        authToken
      )

      if (result) {
        toast.success('Content updated')
        onSaveComplete()
      }
    } catch {
      toast.error('Failed to update content')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!content) return

    setIsDeleting(true)
    try {
      const result = await deleteKnowledgeContentAPI(
        selectedEndpoint,
        content.id,
        dbId,
        authToken
      )

      if (result) {
        toast.success('Content deleted')
        setDeleteDialogOpen(false)
        handleClose()
        onDeleteComplete()
      }
    } catch {
      toast.error('Failed to delete content')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className="flex h-16 items-center justify-between rounded-b-lg border-t border-border bg-accent p-4">
        <Button
          variant="ghost"
          onClick={() => setDeleteDialogOpen(true)}
          disabled={!content}
          className="border border-border font-dmmono text-xs uppercase text-primary shadow-sm hover:bg-accent"
        >
          DELETE
        </Button>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={handleClose}
            className="bg-accent font-dmmono text-xs uppercase text-primary shadow-sm hover:bg-accent/80"
          >
            CLOSE
          </Button>
          <Button
            variant="ghost"
            onClick={handleSave}
            disabled={!content || isSaving}
            className="bg-primary font-dmmono text-xs uppercase text-primaryAccent shadow-sm hover:bg-primary/90 disabled:bg-primary/50"
          >
            {isSaving ? 'SAVING...' : 'SAVE'}
          </Button>
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Content</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this content? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
