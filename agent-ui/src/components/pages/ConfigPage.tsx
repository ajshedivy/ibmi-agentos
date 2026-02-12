'use client'

import { useEffect, useState, useCallback } from 'react'
import { useStore } from '@/store'
import { useQueryState } from 'nuqs'
import { getAgentConfigAPI } from '@/api/os'
import { AgentFullConfig } from '@/types/os'
import { ConfigBreadcrumb } from '@/components/config/ConfigBreadcrumb'
import { ConfigSection, ConfigRow } from '@/components/config/ConfigSection'
import { Button } from '@/components/ui/button'
import Icon from '@/components/ui/icon'
import { getProviderIcon } from '@/lib/modelProvider'
import { ExternalLink } from 'lucide-react'

export default function ConfigPage() {
  const {
    configEntityId,
    configEntityType,
    selectedEndpoint,
    authToken,
    agents,
    teams,
    setMode,
    setActiveSection,
    setMessages,
    setSelectedModel
  } = useStore()
  const [, setAgentId] = useQueryState('agent')
  const [, setTeamId] = useQueryState('team')
  const [, setSessionId] = useQueryState('session')

  const [config, setConfig] = useState<AgentFullConfig | null>(null)
  const [loading, setLoading] = useState(true)

  const entities = configEntityType === 'team' ? teams : agents
  const currentEntity = entities.find((e) => e.id === configEntityId)

  const fetchConfig = useCallback(async () => {
    if (!configEntityId) return
    setLoading(true)
    const data = await getAgentConfigAPI(selectedEndpoint, configEntityId, authToken)
    setConfig(data)
    setLoading(false)
  }, [configEntityId, selectedEndpoint, authToken])

  useEffect(() => {
    fetchConfig()
  }, [fetchConfig])

  const handleOpenInChat = () => {
    if (!configEntityId) return
    setMode(configEntityType === 'team' ? 'team' : 'agent')
    if (configEntityType === 'team') {
      setTeamId(configEntityId)
      setAgentId(null)
    } else {
      setAgentId(configEntityId)
      setTeamId(null)
    }
    setSelectedModel(currentEntity?.model?.model || '')
    setMessages([])
    setSessionId(null)
    setActiveSection('chat')
  }

  if (!configEntityId) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted">No entity selected.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="h-full overflow-y-auto p-6">
        <ConfigBreadcrumb />
        <div className="mt-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-12 animate-pulse rounded-lg border border-border bg-primaryAccent"
            />
          ))}
        </div>
      </div>
    )
  }

  const providerIcon = config?.model ? getProviderIcon(config.model.model) : null
  const toolsList = config?.tools?.tools || []
  const defaultTools = config?.default_tools || {}
  const defaultToolsEntries = Object.entries(defaultTools)

  return (
    <div className="h-full overflow-y-auto p-6">
      <ConfigBreadcrumb />

      {/* Header */}
      <div className="mt-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-primary">
          {config?.name || currentEntity?.name || configEntityId}
        </h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleOpenInChat}
            className="h-7 gap-1.5 text-xs font-medium uppercase"
          >
            Open in Chat
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('https://docs.agno.com', '_blank')}
            className="h-7 gap-1.5 text-xs font-medium uppercase"
          >
            <ExternalLink className="h-3 w-3" />
            Docs
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchConfig}
            className="h-7 text-xs font-medium uppercase"
          >
            <Icon type="refresh" size="xxs" />
          </Button>
        </div>
      </div>

      {/* Sections */}
      <div className="mt-6 space-y-3">
        {/* Agent Details */}
        <ConfigSection title="Agent Details" defaultOpen>
          <div className="space-y-1">
            <ConfigRow label="ID" value={config?.id || configEntityId} />
            {config?.name && <ConfigRow label="Name" value={config.name} />}
            {config?.db_id && <ConfigRow label="Database ID" value={config.db_id} />}
          </div>
        </ConfigSection>

        {/* Model */}
        {config?.model && (
          <ConfigSection title="Model" badge={config.model.provider} defaultOpen>
            <div className="space-y-1">
              <div className="flex items-start justify-between gap-4 py-1.5">
                <span className="shrink-0 text-xs font-medium uppercase text-muted">
                  Model
                </span>
                <div className="flex items-center gap-2 text-right">
                  {providerIcon && (
                    <Icon type={providerIcon} size="xxs" className="shrink-0" />
                  )}
                  <span className="text-xs text-primary">
                    {config.model.model || config.model.name || '-'}
                  </span>
                </div>
              </div>
              <ConfigRow label="Provider" value={config.model.provider || '-'} />
              {config.model.name && (
                <ConfigRow label="Name" value={config.model.name} />
              )}
            </div>
          </ConfigSection>
        )}

        {/* Tools */}
        {toolsList.length > 0 && (
          <ConfigSection title="Tools" badge={toolsList.length}>
            <div className="space-y-2">
              {toolsList.map((tool, i) => (
                <div key={i} className="rounded border border-border/50 px-3 py-2">
                  <p className="text-xs font-medium text-primary">{tool.name}</p>
                  {tool.description && (
                    <p className="mt-0.5 text-xs text-muted">{tool.description}</p>
                  )}
                </div>
              ))}
            </div>
          </ConfigSection>
        )}

        {/* Sessions */}
        {config?.sessions && (
          <ConfigSection title="Sessions">
            <div className="space-y-1">
              {config.sessions.session_table && (
                <ConfigRow label="Table" value={config.sessions.session_table} />
              )}
              <ConfigRow
                label="History in Context"
                value={config.sessions.add_history_to_context ? 'Yes' : 'No'}
              />
              {config.sessions.num_history_runs !== undefined && (
                <ConfigRow
                  label="History Runs"
                  value={String(config.sessions.num_history_runs)}
                />
              )}
            </div>
          </ConfigSection>
        )}

        {/* Knowledge */}
        {config?.knowledge && (
          <ConfigSection title="Knowledge">
            <div className="space-y-1">
              {config.knowledge.db_id && (
                <ConfigRow label="Database ID" value={config.knowledge.db_id} />
              )}
              {config.knowledge.knowledge_table && (
                <ConfigRow label="Table" value={config.knowledge.knowledge_table} />
              )}
            </div>
          </ConfigSection>
        )}

        {/* Memory */}
        {config?.memory && (
          <ConfigSection title="Memory">
            <div className="space-y-1">
              <ConfigRow
                label="Agentic Memory"
                value={config.memory.enable_agentic_memory ? 'Enabled' : 'Disabled'}
              />
              <ConfigRow
                label="User Memories"
                value={config.memory.enable_user_memories ? 'Enabled' : 'Disabled'}
              />
              {config.memory.model && (
                <ConfigRow label="Memory Model" value={config.memory.model.model || '-'} />
              )}
            </div>
          </ConfigSection>
        )}

        {/* Default Tools */}
        {defaultToolsEntries.length > 0 && (
          <ConfigSection title="Default Tools" badge={defaultToolsEntries.length}>
            <div className="space-y-1">
              {defaultToolsEntries.map(([key, value]) => (
                <ConfigRow key={key} label={key} value={value ? 'Enabled' : 'Disabled'} />
              ))}
            </div>
          </ConfigSection>
        )}

        {/* System Message */}
        {config?.system_message && (
          <ConfigSection title="System Message">
            <div className="space-y-2">
              {config.system_message.instructions && (
                <div>
                  <span className="text-xs font-medium uppercase text-muted">
                    Instructions
                  </span>
                  <pre className="mt-1 max-h-60 overflow-auto whitespace-pre-wrap rounded border border-border/50 bg-background p-3 text-xs text-primary">
                    {config.system_message.instructions}
                  </pre>
                </div>
              )}
              {config.system_message.markdown !== undefined && (
                <ConfigRow
                  label="Markdown"
                  value={config.system_message.markdown ? 'Yes' : 'No'}
                />
              )}
              {config.system_message.add_datetime_to_context !== undefined && (
                <ConfigRow
                  label="DateTime in Context"
                  value={config.system_message.add_datetime_to_context ? 'Yes' : 'No'}
                />
              )}
            </div>
          </ConfigSection>
        )}
      </div>
    </div>
  )
}
