import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

import {
  AgentDetails,
  SessionEntry,
  TeamDetails,
  ToolCall,
  type ChatMessage
} from '@/types/os'

export interface EndpointConfig {
  id: string
  name: string
  url: string
  authToken: string
}

interface Store {
  // Tool Call Panel State
  toolCallPanelOpen: boolean
  setToolCallPanelOpen: (open: boolean) => void
  selectedToolCalls: ToolCall[]
  setSelectedToolCalls: (toolCalls: ToolCall[]) => void
  // Streaming tool calls (live updates during streaming)
  streamingToolCalls: ToolCall[]
  setStreamingToolCalls: (toolCalls: ToolCall[]) => void
  // Track which tool calls are in progress (started but not completed)
  inProgressToolCallIds: Set<string>
  setInProgressToolCallIds: (
    ids: Set<string> | ((prevIds: Set<string>) => Set<string>)
  ) => void
  hydrated: boolean
  setHydrated: () => void
  streamingErrorMessage: string
  setStreamingErrorMessage: (streamingErrorMessage: string) => void
  endpoints: {
    endpoint: string
    id__endpoint: string
  }[]
  setEndpoints: (
    endpoints: {
      endpoint: string
      id__endpoint: string
    }[]
  ) => void
  isStreaming: boolean
  setIsStreaming: (isStreaming: boolean) => void
  isEndpointActive: boolean
  setIsEndpointActive: (isActive: boolean) => void
  isEndpointLoading: boolean
  setIsEndpointLoading: (isLoading: boolean) => void
  messages: ChatMessage[]
  setMessages: (
    messages: ChatMessage[] | ((prevMessages: ChatMessage[]) => ChatMessage[])
  ) => void
  chatInputRef: React.RefObject<HTMLTextAreaElement | null>
  selectedEndpoint: string
  setSelectedEndpoint: (selectedEndpoint: string) => void
  authToken: string
  setAuthToken: (authToken: string) => void

  // Named endpoints
  savedEndpoints: EndpointConfig[]
  setSavedEndpoints: (endpoints: EndpointConfig[]) => void
  activeEndpointId: string | null
  setActiveEndpointId: (id: string | null) => void

  // Chat sessions panel
  chatSessionsPanelOpen: boolean
  setChatSessionsPanelOpen: (open: boolean) => void
  agents: AgentDetails[]
  setAgents: (agents: AgentDetails[]) => void
  teams: TeamDetails[]
  setTeams: (teams: TeamDetails[]) => void
  selectedModel: string
  setSelectedModel: (model: string) => void
  mode: 'agent' | 'team'
  setMode: (mode: 'agent' | 'team') => void
  sessionsData: SessionEntry[] | null
  setSessionsData: (
    sessionsData:
      | SessionEntry[]
      | ((prevSessions: SessionEntry[] | null) => SessionEntry[] | null)
  ) => void
  isSessionsLoading: boolean
  setIsSessionsLoading: (isSessionsLoading: boolean) => void

  // Navigation state
  activeSection: string
  setActiveSection: (section: string) => void

  // Sessions page state (separate from existing sidebar sessions)
  sessionsPageData: SessionEntry[] | null
  setSessionsPageData: (
    data:
      | SessionEntry[]
      | ((prev: SessionEntry[] | null) => SessionEntry[] | null)
  ) => void
  sessionsPageLoading: boolean
  setSessionsPageLoading: (loading: boolean) => void
  selectedSessionIds: Set<string>
  setSelectedSessionIds: (
    ids: Set<string> | ((prev: Set<string>) => Set<string>)
  ) => void
  sessionDetailOpen: boolean
  setSessionDetailOpen: (open: boolean) => void
  activeSessionId: string | null
  setActiveSessionId: (id: string | null) => void
  sessionsFilterType: 'agent' | 'team' | 'workflow'
  setSessionsFilterType: (type: 'agent' | 'team' | 'workflow') => void
  sessionsSortOrder: 'date_desc' | 'date_asc' | 'name_asc' | 'name_desc'
  setSessionsSortOrder: (
    order: 'date_desc' | 'date_asc' | 'name_asc' | 'name_desc'
  ) => void

  // Config page state
  configEntityId: string | null
  setConfigEntityId: (id: string | null) => void
  configEntityType: 'agent' | 'team'
  setConfigEntityType: (type: 'agent' | 'team') => void

  // Cancel state
  currentRunId: string | null
  setCurrentRunId: (runId: string | null) => void
  abortController: AbortController | null
  setAbortController: (controller: AbortController | null) => void

  // Traces page state
  tracesView: 'sessions' | 'detail'
  setTracesView: (view: 'sessions' | 'detail') => void
  tracesActiveSessionId: string | null
  setTracesActiveSessionId: (id: string | null) => void
  tracesActiveTraceId: string | null
  setTracesActiveTraceId: (id: string | null) => void
  tracesActiveSpanId: string | null
  setTracesActiveSpanId: (id: string | null) => void

  // Knowledge page state
  knowledgeDetailOpen: boolean
  setKnowledgeDetailOpen: (open: boolean) => void
  activeKnowledgeId: string | null
  setActiveKnowledgeId: (id: string | null) => void
  selectedKnowledgeIds: Set<string>
  setSelectedKnowledgeIds: (
    ids: Set<string> | ((prev: Set<string>) => Set<string>)
  ) => void
  knowledgeSortOrder: 'date_desc' | 'date_asc' | 'name_asc' | 'name_desc'
  setKnowledgeSortOrder: (
    order: 'date_desc' | 'date_asc' | 'name_asc' | 'name_desc'
  ) => void
}

export const useStore = create<Store>()(
  persist(
    (set) => ({
      // Tool Call Panel State
      toolCallPanelOpen: false,
      setToolCallPanelOpen: (open) =>
        set(() => ({
          toolCallPanelOpen: open,
          ...(open ? { chatSessionsPanelOpen: false } : {})
        })),
      selectedToolCalls: [],
      setSelectedToolCalls: (toolCalls) => set({ selectedToolCalls: toolCalls }),
      // Streaming tool calls (live updates during streaming)
      streamingToolCalls: [],
      setStreamingToolCalls: (toolCalls) => set({ streamingToolCalls: toolCalls }),
      // Track which tool calls are in progress (started but not completed)
      inProgressToolCallIds: new Set<string>(),
      setInProgressToolCallIds: (ids) =>
        set((state) => ({
          inProgressToolCallIds:
            typeof ids === 'function' ? ids(state.inProgressToolCallIds) : ids
        })),

      hydrated: false,
      setHydrated: () => set({ hydrated: true }),
      streamingErrorMessage: '',
      setStreamingErrorMessage: (streamingErrorMessage) =>
        set(() => ({ streamingErrorMessage })),
      endpoints: [],
      setEndpoints: (endpoints) => set(() => ({ endpoints })),
      isStreaming: false,
      setIsStreaming: (isStreaming) => set(() => ({ isStreaming })),
      isEndpointActive: false,
      setIsEndpointActive: (isActive) =>
        set(() => ({ isEndpointActive: isActive })),
      isEndpointLoading: true,
      setIsEndpointLoading: (isLoading) =>
        set(() => ({ isEndpointLoading: isLoading })),
      messages: [],
      setMessages: (messages) =>
        set((state) => ({
          messages:
            typeof messages === 'function' ? messages(state.messages) : messages
        })),
      chatInputRef: { current: null },
      selectedEndpoint: 'http://localhost:7777',
      setSelectedEndpoint: (selectedEndpoint) =>
        set(() => ({ selectedEndpoint })),
      authToken: '',
      setAuthToken: (authToken) => set(() => ({ authToken })),

      // Named endpoints
      savedEndpoints: [],
      setSavedEndpoints: (endpoints) => set({ savedEndpoints: endpoints }),
      activeEndpointId: null,
      setActiveEndpointId: (id) =>
        set((state) => {
          const endpoint = state.savedEndpoints.find((e) => e.id === id)
          if (endpoint) {
            return {
              activeEndpointId: id,
              selectedEndpoint: endpoint.url,
              authToken: endpoint.authToken
            }
          }
          return { activeEndpointId: id }
        }),

      // Chat sessions panel
      chatSessionsPanelOpen: false,
      setChatSessionsPanelOpen: (open) =>
        set(() => ({
          chatSessionsPanelOpen: open,
          ...(open ? { toolCallPanelOpen: false } : {})
        })),
      agents: [],
      setAgents: (agents) => set({ agents }),
      teams: [],
      setTeams: (teams) => set({ teams }),
      selectedModel: '',
      setSelectedModel: (selectedModel) => set(() => ({ selectedModel })),
      mode: 'agent',
      setMode: (mode) => set(() => ({ mode })),
      sessionsData: null,
      setSessionsData: (sessionsData) =>
        set((state) => ({
          sessionsData:
            typeof sessionsData === 'function'
              ? sessionsData(state.sessionsData)
              : sessionsData
        })),
      isSessionsLoading: false,
      setIsSessionsLoading: (isSessionsLoading) =>
        set(() => ({ isSessionsLoading })),

      // Navigation
      activeSection: 'chat',
      setActiveSection: (section) => set({ activeSection: section }),

      // Sessions page
      sessionsPageData: null,
      setSessionsPageData: (data) =>
        set((state) => ({
          sessionsPageData:
            typeof data === 'function' ? data(state.sessionsPageData) : data
        })),
      sessionsPageLoading: false,
      setSessionsPageLoading: (loading) =>
        set({ sessionsPageLoading: loading }),
      selectedSessionIds: new Set<string>(),
      setSelectedSessionIds: (ids) =>
        set((state) => ({
          selectedSessionIds:
            typeof ids === 'function' ? ids(state.selectedSessionIds) : ids
        })),
      sessionDetailOpen: false,
      setSessionDetailOpen: (open) => set({ sessionDetailOpen: open }),
      activeSessionId: null,
      setActiveSessionId: (id) => set({ activeSessionId: id }),
      sessionsFilterType: 'agent',
      setSessionsFilterType: (type) => set({ sessionsFilterType: type }),
      sessionsSortOrder: 'date_desc',
      setSessionsSortOrder: (order) => set({ sessionsSortOrder: order }),

      // Config page state
      configEntityId: null,
      setConfigEntityId: (id) => set({ configEntityId: id }),
      configEntityType: 'agent',
      setConfigEntityType: (type) => set({ configEntityType: type }),

      // Cancel state
      currentRunId: null,
      setCurrentRunId: (runId) => set({ currentRunId: runId }),
      abortController: null,
      setAbortController: (controller) => set({ abortController: controller }),

      // Traces page state
      tracesView: 'sessions',
      setTracesView: (view) => set({ tracesView: view }),
      tracesActiveSessionId: null,
      setTracesActiveSessionId: (id) => set({ tracesActiveSessionId: id }),
      tracesActiveTraceId: null,
      setTracesActiveTraceId: (id) => set({ tracesActiveTraceId: id }),
      tracesActiveSpanId: null,
      setTracesActiveSpanId: (id) => set({ tracesActiveSpanId: id }),

      // Knowledge page state
      knowledgeDetailOpen: false,
      setKnowledgeDetailOpen: (open) => set({ knowledgeDetailOpen: open }),
      activeKnowledgeId: null,
      setActiveKnowledgeId: (id) => set({ activeKnowledgeId: id }),
      selectedKnowledgeIds: new Set<string>(),
      setSelectedKnowledgeIds: (ids) =>
        set((state) => ({
          selectedKnowledgeIds:
            typeof ids === 'function' ? ids(state.selectedKnowledgeIds) : ids
        })),
      knowledgeSortOrder: 'date_desc',
      setKnowledgeSortOrder: (order) => set({ knowledgeSortOrder: order })
    }),
    {
      name: 'endpoint-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedEndpoint: state.selectedEndpoint,
        savedEndpoints: state.savedEndpoints,
        activeEndpointId: state.activeEndpointId
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated?.()
      }
    }
  )
)
