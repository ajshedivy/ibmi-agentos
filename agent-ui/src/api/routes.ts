export const APIRoutes = {
  GetAgents: (agentOSUrl: string) => `${agentOSUrl}/agents`,
  AgentRun: (agentOSUrl: string) => `${agentOSUrl}/agents/{agent_id}/runs`,
  Status: (agentOSUrl: string) => `${agentOSUrl}/health`,
  GetSessions: (agentOSUrl: string) => `${agentOSUrl}/sessions`,
  GetSession: (agentOSUrl: string, sessionId: string) =>
    `${agentOSUrl}/sessions/${sessionId}/runs`,

  DeleteSession: (agentOSUrl: string, sessionId: string) =>
    `${agentOSUrl}/sessions/${sessionId}`,

  GetAgent: (agentOSUrl: string, agentId: string) =>
    `${agentOSUrl}/agents/${agentId}`,

  GetTeams: (agentOSUrl: string) => `${agentOSUrl}/teams`,
  TeamRun: (agentOSUrl: string, teamId: string) =>
    `${agentOSUrl}/teams/${teamId}/runs`,
  DeleteTeamSession: (agentOSUrl: string, teamId: string, sessionId: string) =>
    `${agentOSUrl}/v1//teams/${teamId}/sessions/${sessionId}`,

  // Session CRUD
  CreateSession: (agentOSUrl: string) => `${agentOSUrl}/sessions`,
  RenameSession: (agentOSUrl: string, sessionId: string) =>
    `${agentOSUrl}/sessions/${sessionId}`,
  UpdateSessionMetadata: (agentOSUrl: string, sessionId: string) =>
    `${agentOSUrl}/sessions/${sessionId}/metadata`,
  BulkDeleteSessions: (agentOSUrl: string) => `${agentOSUrl}/sessions`,

  // Cancel run
  CancelAgentRun: (agentOSUrl: string, agentId: string, runId: string) =>
    `${agentOSUrl}/agents/${agentId}/runs/${runId}/cancel`,
  CancelTeamRun: (agentOSUrl: string, teamId: string, runId: string) =>
    `${agentOSUrl}/teams/${teamId}/runs/${runId}/cancel`,

  // Traces
  GetConfig: (agentOSUrl: string) => `${agentOSUrl}/config`,
  GetTraceSessionStats: (agentOSUrl: string) =>
    `${agentOSUrl}/trace_session_stats`,
  GetTraces: (agentOSUrl: string) => `${agentOSUrl}/traces`,
  GetTraceDetail: (agentOSUrl: string, traceId: string) =>
    `${agentOSUrl}/traces/${traceId}`,

  // Knowledge
  GetKnowledgeConfig: (agentOSUrl: string) =>
    `${agentOSUrl}/knowledge/config`,
  ListKnowledgeContent: (agentOSUrl: string) =>
    `${agentOSUrl}/knowledge/content`,
  GetKnowledgeContent: (agentOSUrl: string, contentId: string) =>
    `${agentOSUrl}/knowledge/content/${contentId}`,
  DeleteKnowledgeContent: (agentOSUrl: string, contentId: string) =>
    `${agentOSUrl}/knowledge/content/${contentId}`,
  GetContentStatus: (agentOSUrl: string, contentId: string) =>
    `${agentOSUrl}/knowledge/content/${contentId}/status`
}
