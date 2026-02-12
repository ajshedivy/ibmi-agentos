'use client'

import * as React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { GripVertical } from 'lucide-react'

import { useStore } from '@/store'
import { useSessionDetail } from '@/hooks/useSessionDetail'
import { SessionDetailHeader } from './SessionDetailHeader'
import { SessionActions } from './SessionActions'
import { Tabs } from '@/components/ui/tabs'
import { RunsTab } from './tabs/RunsTab'
import { MetricsTab } from './tabs/MetricsTab'
import { DetailsTab } from './tabs/DetailsTab'
import type { SessionEntry } from '@/types/os'

const MIN_WIDTH = 360
const MAX_WIDTH = 800
const DEFAULT_WIDTH = 480

interface SessionDetailPanelProps {
  sessions: SessionEntry[]
  onDeleteComplete: () => void
}

export function SessionDetailPanel({ sessions, onDeleteComplete }: SessionDetailPanelProps) {
  const [activeTab, setActiveTab] = React.useState('runs')
  const [panelWidth, setPanelWidth] = React.useState(DEFAULT_WIDTH)
  const [isResizing, setIsResizing] = React.useState(false)
  const [isHoveringHandle, setIsHoveringHandle] = React.useState(false)

  const sessionDetailOpen = useStore((state) => state.sessionDetailOpen)
  const activeSessionId = useStore((state) => state.activeSessionId)

  // Look up the session entry from the sessions list for metadata (name, dates)
  const activeSessionEntry = React.useMemo(
    () => sessions.find((s) => s.session_id === activeSessionId) ?? null,
    [sessions, activeSessionId]
  )

  const { sessionData, loading, refetch } = useSessionDetail(activeSessionId, activeSessionEntry)

  // Reset tab when panel closes/opens
  React.useEffect(() => {
    if (sessionDetailOpen) {
      setActiveTab('runs')
    }
  }, [sessionDetailOpen])

  // Resize drag handler
  const handleMouseDown = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
    const startX = e.clientX
    const startWidth = panelWidth

    const handleMouseMove = (e: MouseEvent) => {
      const delta = startX - e.clientX
      const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth + delta))
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
  }, [panelWidth])

  const tabs = [
    { id: 'runs', label: 'RUNS' },
    { id: 'metrics', label: 'METRICS' },
    { id: 'details', label: 'DETAILS' }
  ]

  const showHandle = isHoveringHandle || isResizing

  return (
    <AnimatePresence>
      {sessionDetailOpen && (
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: panelWidth }}
          exit={{ width: 0 }}
          transition={isResizing ? { duration: 0 } : { type: 'spring', damping: 25, stiffness: 300 }}
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

          <div className="flex h-full flex-col" style={{ width: panelWidth }}>
            <SessionDetailHeader sessionData={sessionData} onRefetch={refetch} />

            <div className="px-4 py-2">
              <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} variant="underline" />
            </div>

            <div className="flex-1 overflow-auto">
              {activeTab === 'runs' && <RunsTab sessionData={sessionData} loading={loading} />}
              {activeTab === 'metrics' && <MetricsTab sessionData={sessionData} />}
              {activeTab === 'details' && <DetailsTab sessionData={sessionData} />}
            </div>

            <SessionActions sessionData={sessionData} onDeleteComplete={onDeleteComplete} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
