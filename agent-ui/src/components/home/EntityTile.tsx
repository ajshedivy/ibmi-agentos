'use client'

import { useStore } from '@/store'
import { useQueryState } from 'nuqs'
import { AgentDetails, TeamDetails } from '@/types/os'
import { Button } from '@/components/ui/button'
import Icon from '@/components/ui/icon'
import { getProviderIcon } from '@/lib/modelProvider'

interface EntityTileProps {
  entity: AgentDetails | TeamDetails
  entityType: 'agent' | 'team'
}

export function EntityTile({ entity, entityType }: EntityTileProps) {
  const {
    setMode,
    setActiveSection,
    setConfigEntityId,
    setConfigEntityType,
    setSelectedModel,
    setMessages
  } = useStore()
  const [, setAgentId] = useQueryState('agent')
  const [, setTeamId] = useQueryState('team')
  const [, setSessionId] = useQueryState('session')

  const providerIcon = entity.model ? getProviderIcon(entity.model.model) : null

  const handleChat = () => {
    setMode(entityType === 'team' ? 'team' : 'agent')
    if (entityType === 'team') {
      setTeamId(entity.id)
      setAgentId(null)
    } else {
      setAgentId(entity.id)
      setTeamId(null)
    }
    setSelectedModel(entity.model?.model || '')
    setMessages([])
    setSessionId(null)
    setActiveSection('chat')
  }

  const handleConfig = () => {
    setConfigEntityId(entity.id)
    setConfigEntityType(entityType)
    setActiveSection('config')
  }

  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-primaryAccent p-4">
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-background">
          <Icon type="agno" size="xs" />
        </div>
        <div className="overflow-hidden">
          <p className="truncate text-sm font-medium text-primary">
            {entity.name || entity.id}
          </p>
          {entity.model && (
            <div className="flex items-center gap-1.5 text-xs text-muted">
              {providerIcon && <Icon type={providerIcon} size="xxs" />}
              <span className="truncate">{entity.model.model || entity.model.provider}</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleChat}
          className="h-7 text-xs font-medium uppercase"
        >
          Chat
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleConfig}
          className="h-7 text-xs font-medium uppercase"
        >
          Config
        </Button>
      </div>
    </div>
  )
}
