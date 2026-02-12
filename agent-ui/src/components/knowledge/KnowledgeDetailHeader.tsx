'use client'

import * as React from 'react'
import { X, CheckCircle2, XCircle, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useStore } from '@/store'
import type { KnowledgeContent } from '@/types/knowledge'

interface KnowledgeDetailHeaderProps {
  content: KnowledgeContent | null
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
      return null
  }
}

export function KnowledgeDetailHeader({ content }: KnowledgeDetailHeaderProps) {
  const setKnowledgeDetailOpen = useStore((state) => state.setKnowledgeDetailOpen)
  const setActiveKnowledgeId = useStore((state) => state.setActiveKnowledgeId)

  const handleClose = () => {
    setKnowledgeDetailOpen(false)
    setActiveKnowledgeId(null)
  }

  return (
    <div className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {content && (
            <div className="mb-1">
              <StatusBadge status={content.status} />
            </div>
          )}
          <h2 className="mt-1 text-[26px] font-semibold text-primary">
            {content?.name || 'Untitled'}
          </h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="h-9 w-9 shrink-0 border border-border"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
