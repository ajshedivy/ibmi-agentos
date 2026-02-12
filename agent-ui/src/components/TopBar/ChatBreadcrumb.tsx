'use client'

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select'
import { useStore } from '@/store'
import { useQueryState } from 'nuqs'
import { useEffect } from 'react'
import Icon from '@/components/ui/icon'
import useChatActions from '@/hooks/useChatActions'

export function ChatBreadcrumb() {
  const {
    mode,
    setMode,
    agents,
    teams,
    setMessages,
    setSelectedModel,
    isEndpointActive,
    isEndpointLoading
  } = useStore()
  const { clearChat, focusChatInput } = useChatActions()
  const [agentId, setAgentId] = useQueryState('agent', {
    parse: (value) => value || undefined,
    history: 'push'
  })
  const [teamId, setTeamId] = useQueryState('team', {
    parse: (value) => value || undefined,
    history: 'push'
  })
  const [, setSessionId] = useQueryState('session')

  const currentEntities = mode === 'team' ? teams : agents
  const currentValue = mode === 'team' ? teamId : agentId

  // Restore model when entity changes (from EntitySelector logic)
  useEffect(() => {
    if (currentValue && currentEntities.length > 0) {
      const entity = currentEntities.find((item) => item.id === currentValue)
      if (entity) {
        setSelectedModel(entity.model?.model || '')
        if (mode === 'team') {
          setTeamId(entity.id)
        }
        if (entity.model?.model) {
          focusChatInput()
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentValue, currentEntities, setSelectedModel, mode])

  const handleModeChange = (newMode: 'agent' | 'team') => {
    if (newMode === mode) return
    setMode(newMode)
    setAgentId(null)
    setTeamId(null)
    setSelectedModel('')
    setMessages([])
    setSessionId(null)
    clearChat()
  }

  const handleEntityChange = (value: string) => {
    const newValue = value === currentValue ? null : value
    const selectedEntity = currentEntities.find((item) => item.id === newValue)

    setSelectedModel(selectedEntity?.model?.provider || '')

    if (mode === 'team') {
      setTeamId(newValue)
      setAgentId(null)
    } else {
      setAgentId(newValue)
      setTeamId(null)
    }

    setMessages([])
    setSessionId(null)

    if (selectedEntity?.model?.provider) {
      focusChatInput()
    }
  }

  if (!isEndpointActive || isEndpointLoading) return null

  const modeLabel = mode === 'team' ? 'Teams' : 'Agents'
  const entityLabel =
    currentEntities.find((e) => e.id === currentValue)?.name ||
    currentEntities.find((e) => e.id === currentValue)?.id ||
    `Select ${mode === 'team' ? 'Team' : 'Agent'}`

  return (
    <div className="flex items-center gap-1 font-dmmono">
      {/* Mode selector */}
      <Select
        value={mode === 'team' ? 'team' : 'agent'}
        onValueChange={(v) => handleModeChange(v as 'agent' | 'team')}
      >
        <SelectTrigger className="h-7 w-auto gap-1 border-none bg-transparent px-2 text-xs font-medium uppercase text-muted shadow-none hover:text-primary">
          <Icon type="user" size="xxs" className="text-muted" />
          <SelectValue>{modeLabel}</SelectValue>
        </SelectTrigger>
        <SelectContent className="min-w-24 border-none bg-primaryAccent font-dmmono shadow-lg">
          <SelectItem value="agent" className="cursor-pointer">
            <div className="text-xs font-medium uppercase">Agents</div>
          </SelectItem>
          <SelectItem value="team" className="cursor-pointer">
            <div className="text-xs font-medium uppercase">Teams</div>
          </SelectItem>
        </SelectContent>
      </Select>

      <span className="text-xs text-muted/50">/</span>

      {/* Entity selector */}
      {currentEntities.length > 0 ? (
        <Select
          value={currentValue || ''}
          onValueChange={handleEntityChange}
        >
          <SelectTrigger className="h-7 w-auto gap-1 border-none bg-transparent px-2 text-xs font-medium uppercase text-primary shadow-none hover:text-primary/80">
            <SelectValue>{entityLabel}</SelectValue>
          </SelectTrigger>
          <SelectContent className="min-w-32 border-none bg-primaryAccent font-dmmono shadow-lg">
            {currentEntities.map((entity, index) => (
              <SelectItem
                className="cursor-pointer"
                key={`${entity.id}-${index}`}
                value={entity.id}
              >
                <div className="flex items-center gap-2 text-xs font-medium uppercase">
                  <Icon type="user" size="xxs" />
                  {entity.name || entity.id}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <span className="px-2 text-xs text-muted/50">
          No {mode === 'team' ? 'teams' : 'agents'}
        </span>
      )}
    </div>
  )
}
