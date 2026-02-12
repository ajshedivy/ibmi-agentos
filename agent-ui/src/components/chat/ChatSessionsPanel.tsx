'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useQueryState } from 'nuqs'
import { useStore } from '@/store'
import useSessionLoader from '@/hooks/useSessionLoader'
import SessionItem from '@/components/chat/Sidebar/Sessions/SessionItem'
import SessionBlankState from '@/components/chat/Sidebar/Sessions/SessionBlankState'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import Icon from '@/components/ui/icon'
import { Button } from '@/components/ui/button'

function SkeletonList({ count }: { count: number }) {
  const list = useMemo(
    () => Array.from({ length: count }, (_, i) => i),
    [count]
  )
  return (
    <>
      {list.map((k, idx) => (
        <Skeleton
          key={k}
          className={cn(
            'mb-1 h-11 rounded-lg px-3 py-2',
            idx > 0 && 'bg-background-secondary'
          )}
        />
      ))}
    </>
  )
}

export function ChatSessionsPanel() {
  const chatSessionsPanelOpen = useStore((s) => s.chatSessionsPanelOpen)
  const setChatSessionsPanelOpen = useStore((s) => s.setChatSessionsPanelOpen)
  const sessionsData = useStore((s) => s.sessionsData)
  const isSessionsLoading = useStore((s) => s.isSessionsLoading)
  const isEndpointActive = useStore((s) => s.isEndpointActive)
  const isEndpointLoading = useStore((s) => s.isEndpointLoading)
  const mode = useStore((s) => s.mode)

  const [agentId] = useQueryState('agent')
  const [teamId] = useQueryState('team')
  const [dbId] = useQueryState('db_id')
  const [sessionId] = useQueryState('session')

  const { getSessions } = useSessionLoader()

  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [isScrolling, setIsScrolling] = useState(false)
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null)

  useEffect(() => {
    if (sessionId) setSelectedSessionId(sessionId)
  }, [sessionId])

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [])

  const handleScroll = () => {
    setIsScrolling(true)
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)
    scrollTimeoutRef.current = setTimeout(() => setIsScrolling(false), 1500)
  }

  const handleRefresh = () => {
    if (!(agentId || teamId || dbId)) return
    getSessions({ entityType: mode, agentId, teamId, dbId })
  }

  const handleSessionClick = useCallback(
    (id: string) => () => setSelectedSessionId(id),
    []
  )

  if (!chatSessionsPanelOpen) return null

  const loading = isSessionsLoading || isEndpointLoading

  return (
    <div
      className={cn(
        'flex h-full w-[320px] flex-shrink-0 flex-col border-l border-border bg-background',
        'animate-in slide-in-from-right duration-200'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-2">
          <Icon
            type="clock"
            size="sm"
            className="rounded-lg bg-background-secondary p-1"
          />
          <h2 className="text-sm font-medium uppercase text-primary">Sessions</h2>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={handleRefresh}
          >
            <Icon type="refresh" size="xs" className="text-muted" />
          </Button>
          <button
            onClick={() => setChatSessionsPanelOpen(false)}
            className="rounded-md p-1 transition-colors hover:bg-background-secondary"
            aria-label="Close sessions panel"
          >
            <Icon type="x" size="xs" className="text-secondary" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div
        className={cn(
          'flex-1 overflow-y-auto p-3 font-geist transition-all duration-300',
          '[&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar]:transition-opacity [&::-webkit-scrollbar]:duration-300',
          isScrolling
            ? '[&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-background [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar]:opacity-0'
            : '[&::-webkit-scrollbar]:opacity-100'
        )}
        onScroll={handleScroll}
        onMouseOver={() => setIsScrolling(true)}
        onMouseLeave={handleScroll}
      >
        {loading ? (
          <SkeletonList count={5} />
        ) : !isEndpointActive ||
          (!isSessionsLoading && (!sessionsData || sessionsData.length === 0)) ? (
          <SessionBlankState />
        ) : (
          <div className="flex flex-col gap-y-1">
            {sessionsData?.map((entry, idx) => (
              <SessionItem
                key={`${entry?.session_id}-${idx}`}
                currentSessionId={selectedSessionId}
                isSelected={selectedSessionId === entry?.session_id}
                onSessionClick={handleSessionClick(entry?.session_id)}
                session_name={entry?.session_name ?? '-'}
                session_id={entry?.session_id}
                created_at={entry?.created_at}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
