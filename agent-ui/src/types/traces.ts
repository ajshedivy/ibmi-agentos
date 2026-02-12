export interface TraceSessionStats {
  session_id: string
  user_id: string | null
  agent_id: string | null
  team_id: string | null
  workflow_id: string | null
  total_traces: number
  first_trace_at: string
  last_trace_at: string
}

export interface TraceSummary {
  trace_id: string
  name: string | null
  status: string | null
  duration: number | null
  start_time: string
  end_time: string | null
  total_spans: number
  error_count: number
  input: string | null
  run_id: string | null
  session_id: string | null
  user_id: string | null
  agent_id: string | null
  team_id: string | null
  workflow_id: string | null
  created_at: string
}

export interface TraceNode {
  id: string
  name: string
  type: 'AGENT' | 'TEAM' | 'WORKFLOW' | 'LLM' | 'TOOL' | string
  duration: number | null
  start_time: string
  end_time: string | null
  status: string | null
  input: string | null
  output: string | null
  error: string | null
  spans: TraceNode[]
  step_type: string | null
  metadata: Record<string, unknown> | null
  extra_data: Record<string, unknown> | null
}

export interface TraceDetail extends TraceSummary {
  output: string | null
  error: string | null
  tree: TraceNode[]
}

export interface TracesDatabaseConfig {
  db_id: string
  db_name?: string
}

export interface TracesConfig {
  traces?: {
    dbs: TracesDatabaseConfig[]
  }
}
