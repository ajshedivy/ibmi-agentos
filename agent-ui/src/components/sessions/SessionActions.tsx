'use client'

import * as React from 'react'

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
import { deleteSessionAPI } from '@/api/os'
import type { SessionDetail } from '@/types/os'
import { toast } from 'sonner'

interface SessionActionsProps {
  sessionData: SessionDetail | null
  onDeleteComplete: () => void
}

export function SessionActions({ sessionData, onDeleteComplete }: SessionActionsProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const setSessionDetailOpen = useStore((state) => state.setSessionDetailOpen)
  const setActiveSessionId = useStore((state) => state.setActiveSessionId)
  const selectedEndpoint = useStore((state) => state.selectedEndpoint)
  const authToken = useStore((state) => state.authToken)

  const handleClose = () => {
    setSessionDetailOpen(false)
    setActiveSessionId(null)
  }

  const handleDelete = async () => {
    if (!sessionData) return

    setIsDeleting(true)
    try {
      // Get db_id from URL query params
      const urlParams = new URLSearchParams(window.location.search)
      const dbId = urlParams.get('db_id') || ''

      await deleteSessionAPI(
        selectedEndpoint,
        dbId,
        sessionData.session_id,
        authToken
      )

      toast.success('Session deleted')
      setDeleteDialogOpen(false)
      handleClose()
      onDeleteComplete()
    } catch {
      toast.error('Failed to delete session')
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
          disabled={!sessionData}
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
            disabled={!sessionData}
            className="bg-primary font-dmmono text-xs uppercase text-primaryAccent shadow-sm hover:bg-primary/90 disabled:bg-primary/50"
          >
            SAVE
          </Button>
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Session</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this session? This action cannot be undone.
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
