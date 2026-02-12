'use client'

import * as React from 'react'
import { RefreshCw, ChevronDown } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Tabs } from '@/components/ui/tabs'
import { Pagination } from '@/components/ui/data-table'
import { TracesSessionsTable } from '@/components/traces/TracesSessionsTable'
import { TraceDetailView } from '@/components/traces/TraceDetailView'
import { useStore } from '@/store'
import { getOSConfigAPI, getTraceSessionStatsAPI } from '@/api/traces'
import type { TraceSessionStats, TracesDatabaseConfig } from '@/types/traces'
import type { PaginationInfo } from '@/types/os'

type TimeRange = 'all' | '24h' | '7d' | '30d'

const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  all: 'All Time',
  '24h': 'Last 24h',
  '7d': 'Last 7 days',
  '30d': 'Last 30 days'
}

function getTimeRangeParams(range: TimeRange) {
  if (range === 'all') return {}
  const now = new Date()
  const start = new Date()
  switch (range) {
    case '24h':
      start.setHours(start.getHours() - 24)
      break
    case '7d':
      start.setDate(start.getDate() - 7)
      break
    case '30d':
      start.setDate(start.getDate() - 30)
      break
  }
  return {
    start_time: start.toISOString(),
    end_time: now.toISOString()
  }
}

const ITEMS_PER_PAGE = 20

export default function TracesPage() {
  const selectedEndpoint = useStore((state) => state.selectedEndpoint)
  const authToken = useStore((state) => state.authToken)
  const tracesView = useStore((state) => state.tracesView)

  const [databases, setDatabases] = React.useState<TracesDatabaseConfig[]>([])
  const [selectedDbId, setSelectedDbId] = React.useState<string>('')
  const [timeRange, setTimeRange] = React.useState<TimeRange>('all')
  const [timeDropdownOpen, setTimeDropdownOpen] = React.useState(false)
  const [dbDropdownOpen, setDbDropdownOpen] = React.useState(false)
  const [currentPage, setCurrentPage] = React.useState(1)
  const [sessions, setSessions] = React.useState<TraceSessionStats[]>([])
  const [paginationMeta, setPaginationMeta] =
    React.useState<PaginationInfo | null>(null)
  const [loading, setLoading] = React.useState(true)

  const timeDropdownRef = React.useRef<HTMLDivElement>(null)
  const dbDropdownRef = React.useRef<HTMLDivElement>(null)

  // Close dropdowns on outside click
  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        timeDropdownRef.current &&
        !timeDropdownRef.current.contains(e.target as Node)
      ) {
        setTimeDropdownOpen(false)
      }
      if (
        dbDropdownRef.current &&
        !dbDropdownRef.current.contains(e.target as Node)
      ) {
        setDbDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Fetch config to get available databases
  React.useEffect(() => {
    const fetchConfig = async () => {
      const config = await getOSConfigAPI(selectedEndpoint, authToken)
      if (config?.traces?.dbs && config.traces.dbs.length > 0) {
        setDatabases(config.traces.dbs)
        setSelectedDbId(config.traces.dbs[0].db_id)
      }
    }
    fetchConfig()
  }, [selectedEndpoint, authToken])

  // Fetch session stats
  const fetchSessions = React.useCallback(async () => {
    if (!selectedDbId) return

    setLoading(true)
    const timeParams = getTimeRangeParams(timeRange)
    const result = await getTraceSessionStatsAPI(
      selectedEndpoint,
      {
        db_id: selectedDbId,
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        ...timeParams
      },
      authToken
    )

    if (result) {
      setSessions(result.data)
      setPaginationMeta(result.meta)
    } else {
      setSessions([])
      setPaginationMeta(null)
    }
    setLoading(false)
  }, [selectedDbId, currentPage, timeRange, selectedEndpoint, authToken])

  React.useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [selectedDbId, timeRange])

  const totalPages = paginationMeta?.total_pages ?? 1

  if (tracesView === 'detail' && selectedDbId) {
    return (
      <div className="flex h-full">
        <div className="flex-1 flex flex-col min-h-0 min-w-0">
          <TraceDetailView dbId={selectedDbId} />
        </div>
      </div>
    )
  }

  const selectedDb = databases.find((db) => db.db_id === selectedDbId)
  const dbDisplayName = selectedDb?.db_name || selectedDb?.db_id || 'No database'

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col min-h-0 min-w-0">
        <div className="flex flex-1 min-h-0 flex-col p-6 overflow-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold">Traces</h1>

          {/* Database selector */}
          {databases.length > 0 && (
            <div className="relative" ref={dbDropdownRef}>
              <button
                onClick={() => setDbDropdownOpen(!dbDropdownOpen)}
                className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-dmmono"
              >
                <span className="text-muted-foreground">Database:</span>
                <span>{dbDisplayName}</span>
                {databases.length > 1 && (
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                )}
              </button>
              {dbDropdownOpen && databases.length > 1 && (
                <div className="absolute top-full left-0 mt-1 z-50 min-w-[200px] rounded-lg border border-border bg-background shadow-lg">
                  {databases.map((db) => (
                    <button
                      key={db.db_id}
                      onClick={() => {
                        setSelectedDbId(db.db_id)
                        setDbDropdownOpen(false)
                      }}
                      className={cn(
                        'block w-full px-3 py-2 text-left text-sm hover:bg-accent/50 transition-colors',
                        db.db_id === selectedDbId && 'bg-accent/30'
                      )}
                    >
                      {db.db_name || db.db_id}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Time range dropdown */}
          <div className="relative" ref={timeDropdownRef}>
            <button
              onClick={() => setTimeDropdownOpen(!timeDropdownOpen)}
              className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-dmmono"
            >
              <span>{TIME_RANGE_LABELS[timeRange]}</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </button>
            {timeDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 z-50 min-w-[160px] rounded-lg border border-border bg-background shadow-lg">
                {(Object.entries(TIME_RANGE_LABELS) as [TimeRange, string][]).map(
                  ([key, label]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setTimeRange(key)
                        setTimeDropdownOpen(false)
                      }}
                      className={cn(
                        'block w-full px-3 py-2 text-left text-sm hover:bg-accent/50 transition-colors',
                        key === timeRange && 'bg-accent/30'
                      )}
                    >
                      {label}
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          {/* Sessions pill */}
          <Tabs
            tabs={[{ id: 'sessions', label: 'Sessions' }]}
            activeTab="sessions"
            onTabChange={() => {}}
          />
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={fetchSessions}
          disabled={loading}
          className="gap-2 text-xs uppercase text-muted-foreground"
        >
          <RefreshCw
            className={cn('h-4 w-4', loading && 'animate-spin')}
          />
          Refresh
        </Button>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-4">
        <TracesSessionsTable
          sessions={sessions}
          loading={loading}
          totalCount={paginationMeta?.total_count}
        />
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            className="mt-4"
          />
        )}
      </div>
        </div>
      </div>
    </div>
  )
}
