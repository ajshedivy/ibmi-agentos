'use client'

import * as React from 'react'

import { DataTable, type Column } from '@/components/ui/data-table'
import { useStore } from '@/store'
import type { TraceSessionStats } from '@/types/traces'

interface TracesSessionsTableProps {
  sessions: TraceSessionStats[]
  loading: boolean
  totalCount?: number
}

export function TracesSessionsTable({
  sessions,
  loading,
  totalCount
}: TracesSessionsTableProps) {
  const setTracesView = useStore((state) => state.setTracesView)
  const setTracesActiveSessionId = useStore(
    (state) => state.setTracesActiveSessionId
  )

  const formatDate = (timestamp?: string | null) => {
    if (!timestamp) return '-'
    const date = new Date(timestamp)
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

  const getEntityLabel = (session: TraceSessionStats) => {
    return session.agent_id || session.team_id || session.workflow_id || '-'
  }

  const columns: Column<TraceSessionStats>[] = [
    {
      key: 'session_id',
      header: 'SESSION ID',
      render: (session) => (
        <div className="font-mono text-xs">
          {session.session_id.length > 12
            ? session.session_id.slice(0, 12) + '...'
            : session.session_id}
        </div>
      )
    },
    {
      key: 'user_id',
      header: 'USER',
      render: (session) => (
        <div className="text-muted-foreground">{session.user_id || '-'}</div>
      )
    },
    {
      key: 'entity',
      header: 'AGENT / TEAM / WORKFLOW',
      render: (session) => (
        <div className="text-muted-foreground">{getEntityLabel(session)}</div>
      )
    },
    {
      key: 'total_traces',
      header: 'TRACES',
      align: 'center',
      render: (session) => (
        <div className="text-center">{session.total_traces}</div>
      ),
      width: '100px'
    },
    {
      key: 'first_trace_at',
      header: 'FIRST TRACE',
      align: 'right',
      render: (session) => (
        <div className="text-muted-foreground">
          {formatDate(session.first_trace_at)}
        </div>
      ),
      width: '200px'
    },
    {
      key: 'last_trace_at',
      header: 'LAST TRACE',
      align: 'right',
      render: (session) => (
        <div className="text-muted-foreground">
          {formatDate(session.last_trace_at)}
        </div>
      ),
      width: '200px'
    }
  ]

  // Deduplicate by session_id (API may return duplicates)
  const uniqueSessions = React.useMemo(() => {
    const seen = new Set<string>()
    return sessions.filter((s) => {
      if (seen.has(s.session_id)) return false
      seen.add(s.session_id)
      return true
    })
  }, [sessions])

  const handleRowClick = (session: TraceSessionStats) => {
    setTracesActiveSessionId(session.session_id)
    setTracesView('detail')
  }

  return (
    <DataTable
      columns={columns}
      data={uniqueSessions}
      getRowId={(session) => session.session_id}
      onRowClick={handleRowClick}
      loading={loading}
      emptyMessage="No trace sessions found"
      itemCount={totalCount ?? sessions.length}
    />
  )
}
