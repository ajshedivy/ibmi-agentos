'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useStore } from '@/store'
import useChatActions from '@/hooks/useChatActions'
import Icon from '@/components/ui/icon'
import { AgentConfigDialog } from '@/components/chat/AgentConfigDialog'

export function ChatActions() {
  const {
    chatSessionsPanelOpen,
    setChatSessionsPanelOpen,
    isEndpointActive
  } = useStore()
  const { clearChat, focusChatInput } = useChatActions()
  const [configOpen, setConfigOpen] = useState(false)

  const handleNewSession = () => {
    clearChat()
    focusChatInput()
  }

  if (!isEndpointActive) return null

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="h-7 gap-1 rounded-lg border-border text-xs font-medium uppercase"
        onClick={() => setConfigOpen(true)}
      >
        <Icon type="settings" size="xxs" />
        See Config
      </Button>

      <Button
        variant="outline"
        size="sm"
        className={`h-7 gap-1 rounded-lg border-border text-xs font-medium uppercase ${
          chatSessionsPanelOpen ? 'bg-accent' : ''
        }`}
        onClick={() => setChatSessionsPanelOpen(!chatSessionsPanelOpen)}
      >
        <Icon type="clock" size="xxs" />
        Sessions
      </Button>

      <Button
        size="sm"
        className="h-7 gap-1 rounded-lg bg-primary text-xs font-medium uppercase text-background hover:bg-primary/80"
        onClick={handleNewSession}
      >
        <Icon type="plus" size="xxs" />
        New Session
      </Button>

      <AgentConfigDialog open={configOpen} onOpenChange={setConfigOpen} />
    </div>
  )
}
