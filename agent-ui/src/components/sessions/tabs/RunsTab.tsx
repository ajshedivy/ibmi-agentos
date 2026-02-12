'use client'

import * as React from 'react'

import type { SessionDetail } from '@/types/os'
import { RunItem } from './RunItem'

interface RunsTabProps {
  sessionData: SessionDetail | null
  loading: boolean
}

export function RunsTab({ sessionData, loading }: RunsTabProps) {
  const [expandedRunId, setExpandedRunId] = React.useState<string | null>(null)

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    )
  }

  if (!sessionData) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground text-sm">No session selected</p>
      </div>
    )
  }

  const runs = sessionData.runs || []

  if (runs.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground text-sm">No runs in this session</p>
      </div>
    )
  }

  return (
    <div>
      <div className="border-b border-border px-4 py-3">
        <p className="text-muted-foreground text-sm font-medium">
          {runs.length} Run{runs.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div>
        {runs.map((run, index) => (
          <RunItem
            key={run.run_id}
            run={run}
            index={index}
            isExpanded={expandedRunId === run.run_id}
            onToggle={() => setExpandedRunId(expandedRunId === run.run_id ? null : run.run_id)}
          />
        ))}
      </div>
    </div>
  )
}
