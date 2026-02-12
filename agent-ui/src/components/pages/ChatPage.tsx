'use client'
import { useEffect } from 'react'
import { ChatArea } from '@/components/chat/ChatArea'
import { ToolCallPanel } from '@/components/chat/ToolCallPanel'
import { ChatSessionsPanel } from '@/components/chat/ChatSessionsPanel'
import { useStore } from '@/store'
import useChatActions from '@/hooks/useChatActions'
import { useChatSessions } from '@/hooks/useChatSessions'

export default function ChatPage({
  hasEnvToken,
  envToken
}: {
  hasEnvToken?: boolean
  envToken?: string
}) {
  const { selectedEndpoint, hydrated, mode, authToken, setAuthToken, savedEndpoints, setSavedEndpoints, activeEndpointId } = useStore()
  const { initialize } = useChatActions()

  // Initialize endpoint on mount/change (moved from Sidebar)
  useEffect(() => {
    if (hydrated) initialize()
  }, [selectedEndpoint, initialize, hydrated, mode])

  // Handle env token initialization - sync to active endpoint
  useEffect(() => {
    if (hasEnvToken && envToken && !authToken) {
      setAuthToken(envToken)
      // Also update the active endpoint's auth token
      if (activeEndpointId && savedEndpoints.length > 0) {
        const updated = savedEndpoints.map((ep) =>
          ep.id === activeEndpointId ? { ...ep, authToken: envToken } : ep
        )
        setSavedEndpoints(updated)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasEnvToken, envToken])

  // Load sessions
  useChatSessions()

  return (
    <div className="flex h-full bg-background/80">
      <ChatArea />
      <ToolCallPanel />
      <ChatSessionsPanel />
    </div>
  )
}
