'use client'

import { useEffect } from 'react'
import { useStore } from '@/store'
import useChatActions from '@/hooks/useChatActions'
import { CollapsibleSection } from '@/components/home/CollapsibleSection'
import { EntityTile } from '@/components/home/EntityTile'

export default function HomePage() {
  const { agents, teams, hydrated, selectedEndpoint, isEndpointLoading } = useStore()
  const { initialize } = useChatActions()

  useEffect(() => {
    if (hydrated) initialize()
  }, [selectedEndpoint, initialize, hydrated])

  if (isEndpointLoading) {
    return (
      <div className="h-full overflow-y-auto p-6">
        <div className="space-y-6">
          <SkeletonSection count={3} />
          <SkeletonSection count={2} />
        </div>
      </div>
    )
  }

  const hasAgents = agents.length > 0
  const hasTeams = teams.length > 0

  if (!hasAgents && !hasTeams) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Home</h1>
          <p className="mt-2 text-sm text-muted">
            No agents or teams found. Connect an AgentOS endpoint to get started.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="space-y-6">
        {hasAgents && (
          <CollapsibleSection title="Agents" count={agents.length}>
            <div className="grid grid-cols-1 gap-3 pt-2 md:grid-cols-2 lg:grid-cols-3">
              {agents.map((agent) => (
                <EntityTile
                  key={agent.id}
                  entity={agent}
                  entityType="agent"
                />
              ))}
            </div>
          </CollapsibleSection>
        )}

        {hasTeams && (
          <CollapsibleSection title="Teams" count={teams.length}>
            <div className="grid grid-cols-1 gap-3 pt-2 md:grid-cols-2 lg:grid-cols-3">
              {teams.map((team) => (
                <EntityTile
                  key={team.id}
                  entity={team}
                  entityType="team"
                />
              ))}
            </div>
          </CollapsibleSection>
        )}
      </div>
    </div>
  )
}

function SkeletonSection({ count }: { count: number }) {
  return (
    <div>
      <div className="mb-3 h-4 w-20 animate-pulse rounded bg-muted/20" />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="h-[72px] animate-pulse rounded-lg border border-border bg-primaryAccent"
          />
        ))}
      </div>
    </div>
  )
}
