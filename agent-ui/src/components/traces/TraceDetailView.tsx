'use client'

import * as React from 'react'
import { ArrowLeft, Copy, Check } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useStore } from '@/store'
import { getTracesAPI, getTraceDetailAPI } from '@/api/traces'
import { TraceSpanTree } from './TraceSpanTree'
import { SpanDetailPanel } from './SpanDetailPanel'
import type { TraceDetail, TraceNode } from '@/types/traces'

interface TraceDetailViewProps {
  dbId: string
}

function CopyChip({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 rounded-md bg-accent px-2 py-1 text-xs text-muted-foreground hover:text-primary transition-colors"
      title={`Copy ${label}: ${value}`}
    >
      <span className="font-dmmono uppercase">{label}</span>
      <span className="font-mono max-w-[100px] truncate">{value}</span>
      {copied ? (
        <Check className="h-3 w-3" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
    </button>
  )
}

function formatDuration(value: unknown): string {
  if (value === null || value === undefined) return '-'
  const seconds = Number(value)
  if (isNaN(seconds)) return '-'
  if (seconds < 0.001) return '<1ms'
  if (seconds < 1) return `${Math.round(seconds * 1000)}ms`
  return `${seconds.toFixed(2)}s`
}

function findNodeById(nodes: TraceNode[], id: string): TraceNode | null {
  for (const node of nodes) {
    if (node.id === id) return node
    if (node.spans) {
      const found = findNodeById(node.spans, id)
      if (found) return found
    }
  }
  return null
}

export function TraceDetailView({ dbId }: TraceDetailViewProps) {
  const selectedEndpoint = useStore((state) => state.selectedEndpoint)
  const authToken = useStore((state) => state.authToken)
  const tracesActiveSessionId = useStore(
    (state) => state.tracesActiveSessionId
  )
  const tracesActiveSpanId = useStore((state) => state.tracesActiveSpanId)
  const setTracesView = useStore((state) => state.setTracesView)
  const setTracesActiveSpanId = useStore(
    (state) => state.setTracesActiveSpanId
  )

  const [traceDetails, setTraceDetails] = React.useState<TraceDetail[]>([])
  const [loading, setLoading] = React.useState(true)

  // Fetch all traces for the session, then fetch details for each
  React.useEffect(() => {
    if (!tracesActiveSessionId || !dbId) return

    const fetchAllTraces = async () => {
      setLoading(true)
      const result = await getTracesAPI(
        selectedEndpoint,
        { session_id: tracesActiveSessionId, db_id: dbId },
        authToken
      )
      if (result && result.length > 0) {
        // Fetch details for all traces in parallel
        const details = await Promise.all(
          result.map((t) =>
            getTraceDetailAPI(
              selectedEndpoint,
              t.trace_id,
              { db_id: dbId },
              authToken
            )
          )
        )
        const validDetails = details.filter(Boolean) as TraceDetail[]
        setTraceDetails(validDetails)
        // Auto-select root span of first trace
        if (validDetails.length > 0 && validDetails[0].tree?.length > 0) {
          setTracesActiveSpanId(validDetails[0].tree[0].id)
        }
      } else {
        setTraceDetails([])
      }
      setLoading(false)
    }

    fetchAllTraces()
  }, [
    tracesActiveSessionId,
    dbId,
    selectedEndpoint,
    authToken,
    setTracesActiveSpanId
  ])

  const handleBack = () => {
    setTracesView('sessions')
  }

  // Combine all trace trees into one list for the span tree
  const combinedTree = React.useMemo(
    () => traceDetails.flatMap((d) => d.tree),
    [traceDetails]
  )

  // Find the active span across all traces
  const activeSpan = tracesActiveSpanId
    ? findNodeById(combinedTree, tracesActiveSpanId)
    : null

  // Find which trace contains the active span (for header info)
  const activeTrace = React.useMemo(() => {
    if (!tracesActiveSpanId) return traceDetails[0] ?? null
    for (const detail of traceDetails) {
      if (findNodeById(detail.tree, tracesActiveSpanId)) return detail
    }
    return traceDetails[0] ?? null
  }, [traceDetails, tracesActiveSpanId])

  const statusOk =
    activeTrace &&
    !activeTrace.error &&
    activeTrace.status !== 'ERROR'

  const formatDate = (timestamp?: string | null) => {
    if (!timestamp) return '-'
    const date = new Date(timestamp)
    if (isNaN(date.getTime())) return '-'
    return (
      date.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }) +
      ', ' +
      date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    )
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading trace details...</p>
      </div>
    )
  }

  if (traceDetails.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="border-b border-border px-4 py-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="gap-2 text-xs"
          >
            <ArrowLeft className="h-4 w-4" />
            Sessions
          </Button>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-muted-foreground">No trace data found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header bar */}
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="gap-2 text-xs shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
              Sessions
            </Button>

            {activeTrace && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground">
                  {formatDate(activeTrace.created_at)}
                </span>
                <CopyChip label="Trace" value={activeTrace.trace_id} />
                {activeTrace.run_id && (
                  <CopyChip label="Run" value={activeTrace.run_id} />
                )}
                {activeTrace.session_id && (
                  <CopyChip label="Session" value={activeTrace.session_id} />
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs text-muted-foreground">
              {activeTrace ? formatDuration(activeTrace.duration) : '-'}
            </span>
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium',
                statusOk
                  ? 'bg-green-500/10 text-green-400'
                  : 'bg-red-500/10 text-red-400'
              )}
            >
              {statusOk ? '✓ OK' : '✗ ERROR'}
            </span>
          </div>
        </div>
      </div>

      {/* Content: span tree + detail panel */}
      <div className="flex flex-1 min-h-0">
        {/* Left: Span Tree */}
        <div className="w-[45%] border-r border-border overflow-auto">
          <TraceSpanTree
            tree={combinedTree}
            traceCount={traceDetails.length}
          />
        </div>

        {/* Right: Span Detail */}
        <div className="w-[55%] overflow-auto">
          <SpanDetailPanel span={activeSpan} />
        </div>
      </div>
    </div>
  )
}
