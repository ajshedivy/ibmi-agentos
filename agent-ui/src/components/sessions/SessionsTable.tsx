'use client'

import * as React from 'react'

import { DataTable, type Column } from '@/components/ui/data-table'
import { useStore } from '@/store'
import type { SessionEntry } from '@/types/os'

interface SessionsTableProps {
  sessions: SessionEntry[]
  loading: boolean
  totalCount?: number
}

export function SessionsTable({ sessions, loading, totalCount }: SessionsTableProps) {
  const selectedSessionIds = useStore((state) => state.selectedSessionIds)
  const setSelectedSessionIds = useStore((state) => state.setSelectedSessionIds)
  const setActiveSessionId = useStore((state) => state.setActiveSessionId)
  const setSessionDetailOpen = useStore((state) => state.setSessionDetailOpen)
  const activeSessionId = useStore((state) => state.activeSessionId)
  const sessionDetailOpen = useStore((state) => state.sessionDetailOpen)

  const formatDate = (timestamp?: number | string) => {
    if (!timestamp) return '-'
    // Handle both seconds and milliseconds epoch, and string dates
    let date: Date
    if (typeof timestamp === 'string') {
      date = new Date(timestamp)
    } else {
      // If timestamp is in seconds (< year 2100 in seconds), convert to ms
      date = new Date(timestamp < 1e12 ? timestamp * 1000 : timestamp)
    }
    if (isNaN(date.getTime())) return '-'
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }) + ', ' + date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const columns: Column<SessionEntry>[] = [
    {
      key: 'session_name',
      header: 'SESSION NAME',
      render: (session) => (
        <div className="font-medium">{session.session_name || 'Untitled'}</div>
      )
    },
    {
      key: 'updated_at',
      header: 'UPDATED AT',
      render: (session) => (
        <div className="text-muted-foreground">
          {formatDate((session.updated_at || session.created_at) as number | string)}
        </div>
      ),
      align: 'right',
      width: '200px'
    }
  ]

  const handleRowClick = (session: SessionEntry) => {
    setActiveSessionId(session.session_id)
    setSessionDetailOpen(true)
  }

  return (
    <DataTable
      columns={columns}
      data={sessions}
      selectable
      selectedIds={selectedSessionIds}
      onSelectionChange={setSelectedSessionIds}
      getRowId={(session) => session.session_id}
      onRowClick={handleRowClick}
      activeRowId={sessionDetailOpen ? activeSessionId : null}
      loading={loading}
      emptyMessage="No sessions found"
      itemCount={totalCount ?? sessions.length}
    />
  )
}
