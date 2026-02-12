import { useEffect } from 'react'
import { useQueryState } from 'nuqs'
import { useStore } from '@/store'
import useSessionLoader from '@/hooks/useSessionLoader'

/**
 * Extracted session-fetching logic from Sessions.tsx.
 * Call this from ChatPage so sessions load regardless of panel visibility.
 */
export function useChatSessions() {
  const [agentId] = useQueryState('agent', {
    parse: (v: string | null) => v || undefined,
    history: 'push'
  })
  const [teamId] = useQueryState('team')
  const [sessionId] = useQueryState('session')
  const [dbId] = useQueryState('db_id')

  const {
    selectedEndpoint,
    mode,
    isEndpointLoading,
    hydrated,
    setSessionsData
  } = useStore()

  const { getSessions, getSession } = useSessionLoader()

  // Load a specific session when sessionId changes
  useEffect(() => {
    if (hydrated && sessionId && selectedEndpoint && (agentId || teamId)) {
      const entityType = agentId ? 'agent' : 'team'
      getSession({ entityType, agentId, teamId, dbId }, sessionId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, sessionId, selectedEndpoint, agentId, teamId, dbId])

  // Fetch sessions when agent/team/endpoint changes
  useEffect(() => {
    if (!selectedEndpoint || isEndpointLoading) return
    if (!(agentId || teamId || dbId)) {
      setSessionsData([])
      return
    }
    setSessionsData([])
    getSessions({
      entityType: mode,
      agentId,
      teamId,
      dbId
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedEndpoint,
    agentId,
    teamId,
    mode,
    isEndpointLoading,
    getSessions,
    dbId
  ])
}
