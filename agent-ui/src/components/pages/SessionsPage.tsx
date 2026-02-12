'use client'

import * as React from 'react'

import { RefreshCw } from 'lucide-react'

import { cn } from '@/lib/utils'
import { SessionsFilterBar } from '@/components/sessions/SessionsFilterBar'
import { SessionsTable } from '@/components/sessions/SessionsTable'
import { BulkActions } from '@/components/sessions/BulkActions'
import { SessionDetailPanel } from '@/components/sessions/SessionDetailPanel'
import { Pagination } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { useStore } from '@/store'
import { getAllSessionsAPI } from '@/api/os'
import type { SessionEntry } from '@/types/os'

const ITEMS_PER_PAGE = 20

export default function SessionsPage() {
  const [currentPage, setCurrentPage] = React.useState(1)
  const [allSessions, setAllSessions] = React.useState<SessionEntry[]>([])

  const sessionsPageLoading = useStore((state) => state.sessionsPageLoading)
  const setSessionsPageLoading = useStore((state) => state.setSessionsPageLoading)
  const sessionsFilterType = useStore((state) => state.sessionsFilterType)
  const sessionsSortOrder = useStore((state) => state.sessionsSortOrder)
  const selectedEndpoint = useStore((state) => state.selectedEndpoint)
  const authToken = useStore((state) => state.authToken)
  const agents = useStore((state) => state.agents)
  const teams = useStore((state) => state.teams)
  // Fetch sessions from all agents and teams
  const fetchAllSessions = React.useCallback(async () => {
    setSessionsPageLoading(true)

    try {
      const allSessionsData: SessionEntry[] = []

      // Fetch sessions from all agents
      if (sessionsFilterType === 'agent') {
        for (const agent of agents) {
          if (agent.id && agent.db_id) {
            const response = await getAllSessionsAPI(
              selectedEndpoint,
              'agent',
              agent.id,
              agent.db_id,
              authToken
            )
            if (response.data && Array.isArray(response.data)) {
              allSessionsData.push(...response.data.map((s) => ({ ...s, agent_id: agent.id })))
            }
          }
        }
      }

      // Fetch sessions from all teams
      if (sessionsFilterType === 'team') {
        for (const team of teams) {
          if (team.id && team.db_id) {
            const response = await getAllSessionsAPI(
              selectedEndpoint,
              'team',
              team.id,
              team.db_id,
              authToken
            )
            if (response.data && Array.isArray(response.data)) {
              allSessionsData.push(...response.data.map((s) => ({ ...s, team_id: team.id })))
            }
          }
        }
      }

      // For workflow type, we don't have a way to fetch those yet
      // Leave empty for now
      if (sessionsFilterType === 'workflow') {
        // TODO: Implement workflow sessions fetching when API is available
      }

      setAllSessions(allSessionsData)
    } catch (error) {
      console.error('Error fetching sessions:', error)
      setAllSessions([])
    } finally {
      setSessionsPageLoading(false)
    }
  }, [
    selectedEndpoint,
    authToken,
    agents,
    teams,
    sessionsFilterType,
    setSessionsPageLoading
  ])

  // Fetch on mount and when filter type changes
  React.useEffect(() => {
    fetchAllSessions()
  }, [fetchAllSessions])

  // Normalize any timestamp (string, seconds-epoch, or ms-epoch) to ms-epoch
  const toMs = (ts: unknown): number => {
    if (!ts) return 0
    if (typeof ts === 'string') return new Date(ts).getTime() || 0
    if (typeof ts === 'number') return ts < 1e12 ? ts * 1000 : ts
    return 0
  }

  // Sort sessions based on sort order
  // Use updated_at (falling back to created_at) to match the displayed date column
  const sortedSessions = React.useMemo(() => {
    const sessions = [...allSessions]
    const getDate = (s: SessionEntry) => toMs(s.updated_at) || toMs(s.created_at)

    switch (sessionsSortOrder) {
      case 'date_desc':
        return sessions.sort((a, b) => getDate(b) - getDate(a))
      case 'date_asc':
        return sessions.sort((a, b) => getDate(a) - getDate(b))
      case 'name_asc':
        return sessions.sort((a, b) =>
          (a.session_name || '').localeCompare(b.session_name || '')
        )
      case 'name_desc':
        return sessions.sort((a, b) =>
          (b.session_name || '').localeCompare(a.session_name || '')
        )
      default:
        return sessions
    }
  }, [allSessions, sessionsSortOrder])

  // Paginate sessions
  const totalPages = Math.ceil(sortedSessions.length / ITEMS_PER_PAGE)
  const paginatedSessions = sortedSessions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Reset to page 1 when filter or sort changes
  React.useEffect(() => {
    setCurrentPage(1)
  }, [sessionsFilterType, sessionsSortOrder])

  const handleDeleteComplete = () => {
    fetchAllSessions()
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col min-h-0 min-w-0">
        <div className="flex flex-1 min-h-0 flex-col p-6 overflow-auto">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Sessions</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchAllSessions}
              disabled={sessionsPageLoading}
              className="gap-2 text-xs uppercase text-muted-foreground"
            >
              <RefreshCw className={cn('h-4 w-4', sessionsPageLoading && 'animate-spin')} />
              Refresh
            </Button>
          </div>

          <div className="flex flex-1 flex-col gap-4">
            <SessionsFilterBar />
            <BulkActions onDeleteComplete={handleDeleteComplete} />
            <SessionsTable
              sessions={paginatedSessions}
              loading={sessionsPageLoading}
              totalCount={sortedSessions.length}
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
      <SessionDetailPanel sessions={allSessions} onDeleteComplete={handleDeleteComplete} />
    </div>
  )
}
