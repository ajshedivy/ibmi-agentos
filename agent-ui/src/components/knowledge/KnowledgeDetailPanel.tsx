'use client'

import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { GripVertical } from 'lucide-react'

import { useStore } from '@/store'
import { getKnowledgeContentAPI } from '@/api/knowledge'
import { KnowledgeDetailHeader } from './KnowledgeDetailHeader'
import { KnowledgeDetailForm } from './KnowledgeDetailForm'
import { KnowledgeActions } from './KnowledgeActions'
import type { KnowledgeContent } from '@/types/knowledge'

const MIN_WIDTH = 360
const MAX_WIDTH = 800
const DEFAULT_WIDTH = 480

interface KnowledgeDetailPanelProps {
  dbId: string
  onDeleteComplete: () => void
  onSaveComplete: () => void
}

export function KnowledgeDetailPanel({
  dbId,
  onDeleteComplete,
  onSaveComplete
}: KnowledgeDetailPanelProps) {
  const [panelWidth, setPanelWidth] = React.useState(DEFAULT_WIDTH)
  const [isResizing, setIsResizing] = React.useState(false)
  const [isHoveringHandle, setIsHoveringHandle] = React.useState(false)
  const [content, setContent] = React.useState<KnowledgeContent | null>(null)

  // Form state
  const [editedName, setEditedName] = React.useState('')
  const [editedDescription, setEditedDescription] = React.useState('')
  const [editedMetadata, setEditedMetadata] = React.useState<[string, string][]>([])

  const knowledgeDetailOpen = useStore((state) => state.knowledgeDetailOpen)
  const activeKnowledgeId = useStore((state) => state.activeKnowledgeId)
  const selectedEndpoint = useStore((state) => state.selectedEndpoint)
  const authToken = useStore((state) => state.authToken)

  // Fetch content detail when activeKnowledgeId changes
  React.useEffect(() => {
    if (!activeKnowledgeId || !dbId) {
      setContent(null)
      return
    }

    const fetchContent = async () => {
      const result = await getKnowledgeContentAPI(
        selectedEndpoint,
        activeKnowledgeId,
        dbId,
        authToken
      )
      if (result) {
        setContent(result)
        setEditedName(result.name || '')
        setEditedDescription(result.description || '')
        const metaEntries: [string, string][] = result.metadata
          ? Object.entries(result.metadata).map(([k, v]) => [k, String(v)])
          : []
        setEditedMetadata(metaEntries)
      }
    }

    fetchContent()
  }, [activeKnowledgeId, dbId, selectedEndpoint, authToken])

  // Resize drag handler
  const handleMouseDown = React.useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      setIsResizing(true)
      const startX = e.clientX
      const startWidth = panelWidth

      const handleMouseMove = (e: MouseEvent) => {
        const delta = startX - e.clientX
        const newWidth = Math.min(
          MAX_WIDTH,
          Math.max(MIN_WIDTH, startWidth + delta)
        )
        setPanelWidth(newWidth)
      }

      const handleMouseUp = () => {
        setIsResizing(false)
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }

      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    },
    [panelWidth]
  )

  const showHandle = isHoveringHandle || isResizing

  return (
    <AnimatePresence>
      {knowledgeDetailOpen && (
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: panelWidth }}
          exit={{ width: 0 }}
          transition={
            isResizing
              ? { duration: 0 }
              : { type: 'spring', damping: 25, stiffness: 300 }
          }
          className="relative h-full flex-shrink-0 overflow-hidden border-l border-border"
        >
          {/* Resize handle */}
          <div
            className="absolute left-0 top-0 z-50 flex h-full w-3 -translate-x-1/2 cursor-col-resize items-center justify-center"
            onMouseDown={handleMouseDown}
            onMouseEnter={() => setIsHoveringHandle(true)}
            onMouseLeave={() => !isResizing && setIsHoveringHandle(false)}
          >
            <div
              className={`flex h-8 w-5 items-center justify-center rounded-md border border-border bg-accent shadow-sm transition-opacity ${
                showHandle ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <GripVertical className="h-3.5 w-3.5 text-muted" />
            </div>
          </div>

          <div
            className="flex h-full flex-col"
            style={{ width: panelWidth }}
          >
            <KnowledgeDetailHeader content={content} />

            <div className="flex-1 overflow-auto">
              <KnowledgeDetailForm
                content={content}
                editedName={editedName}
                setEditedName={setEditedName}
                editedDescription={editedDescription}
                setEditedDescription={setEditedDescription}
                editedMetadata={editedMetadata}
                setEditedMetadata={setEditedMetadata}
              />
            </div>

            <KnowledgeActions
              content={content}
              dbId={dbId}
              editedName={editedName}
              editedDescription={editedDescription}
              editedMetadata={editedMetadata}
              onSaveComplete={onSaveComplete}
              onDeleteComplete={onDeleteComplete}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
