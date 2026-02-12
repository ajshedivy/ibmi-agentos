import * as React from 'react'
import { useQueryState } from 'nuqs'

import { getSessionAPI } from '@/api/os'
import { useStore } from '@/store'
import type { SessionDetail, SessionEntry, RunDetail, RunMetrics } from '@/types/os'

interface UseSessionDetailReturn {
  sessionData: SessionDetail | null
  loading: boolean
  error: Error | null
  refetch: () => void
}

export function useSessionDetail(
  sessionId: string | null,
  sessionEntry: SessionEntry | null
): UseSessionDetailReturn {
  const [sessionData, setSessionData] = React.useState<SessionDetail | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<Error | null>(null)

  const selectedEndpoint = useStore((state) => state.selectedEndpoint)
  const authToken = useStore((state) => state.authToken)
  const mode = useStore((state) => state.mode)
  const agents = useStore((state) => state.agents)
  const teams = useStore((state) => state.teams)
  const [dbId] = useQueryState('db_id')

  const fetchSession = React.useCallback(async () => {
    if (!sessionId) {
      setSessionData(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await getSessionAPI(
        selectedEndpoint,
        mode,
        sessionId,
        dbId || undefined,
        authToken
      )

      // The API returns a flat array of run objects, not { runs: [...] }
      const runs: RunDetail[] = Array.isArray(response) ? response : []

      // Aggregate metrics across all runs
      const aggregatedMetrics: RunMetrics = runs.reduce(
        (acc, run) => {
          if (run.metrics) {
            acc.input_tokens = (acc.input_tokens || 0) + (run.metrics.input_tokens || 0)
            acc.output_tokens = (acc.output_tokens || 0) + (run.metrics.output_tokens || 0)
            acc.total_tokens = (acc.total_tokens || 0) + (run.metrics.total_tokens || 0)
          }
          return acc
        },
        { input_tokens: 0, output_tokens: 0, total_tokens: 0 } as RunMetrics
      )

      // Look up agent/team from store to get model info
      const agent = sessionEntry?.agent_id
        ? agents.find((a) => a.id === sessionEntry.agent_id)
        : undefined
      const team = sessionEntry?.team_id
        ? teams.find((t) => t.id === sessionEntry.team_id)
        : undefined
      const model = agent?.model || team?.model

      const sessionDetail: SessionDetail = {
        session_id: sessionId,
        session_name: sessionEntry?.session_name,
        agent_id: agent?.id,
        team_id: team?.id,
        model: model,
        model_id: model?.model,
        model_provider: model?.provider,
        created_at: sessionEntry?.created_at || 0,
        updated_at: sessionEntry?.updated_at,
        runs: runs,
        metrics: aggregatedMetrics
      }

      setSessionData(sessionDetail)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch session'))
    } finally {
      setLoading(false)
    }
  }, [sessionId, sessionEntry, selectedEndpoint, authToken, mode, dbId, agents, teams])

  React.useEffect(() => {
    fetchSession()
  }, [fetchSession])

  return {
    sessionData,
    loading,
    error,
    refetch: fetchSession
  }
}
