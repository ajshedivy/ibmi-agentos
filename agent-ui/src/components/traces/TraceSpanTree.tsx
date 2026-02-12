'use client'

import * as React from 'react'
import { Bot, Cpu, Wrench, Users, Workflow, ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useStore } from '@/store'
import type { TraceNode } from '@/types/traces'

interface TraceSpanTreeProps {
  tree: TraceNode[]
  traceCount: number
}

function getNodeIcon(type: string) {
  switch (type) {
    case 'AGENT':
      return <Bot className="h-3.5 w-3.5 text-orange-400" />
    case 'TEAM':
      return <Users className="h-3.5 w-3.5 text-orange-400" />
    case 'WORKFLOW':
      return <Workflow className="h-3.5 w-3.5 text-orange-400" />
    case 'LLM':
      return <Cpu className="h-3.5 w-3.5 text-purple-400" />
    case 'TOOL':
      return <Wrench className="h-3.5 w-3.5 text-blue-400" />
    default:
      return <Bot className="h-3.5 w-3.5 text-muted-foreground" />
  }
}

function formatDuration(value: unknown): string {
  if (value === null || value === undefined) return '-'
  const seconds = Number(value)
  if (isNaN(seconds)) return '-'
  if (seconds < 0.001) return '<1ms'
  if (seconds < 1) return `${Math.round(seconds * 1000)}ms`
  return `${seconds.toFixed(2)}s`
}

interface TraceSpanNodeProps {
  node: TraceNode
  depth: number
  defaultExpanded?: boolean
}

function TraceSpanNode({ node, depth, defaultExpanded = true }: TraceSpanNodeProps) {
  const [expanded, setExpanded] = React.useState(defaultExpanded)
  const tracesActiveSpanId = useStore((state) => state.tracesActiveSpanId)
  const setTracesActiveSpanId = useStore((state) => state.setTracesActiveSpanId)

  const hasChildren = node.spans && node.spans.length > 0
  const isActive = tracesActiveSpanId === node.id

  // Root/parent nodes: show total_output_tokens
  // Child/leaf nodes: show output_tokens (per-step)
  const outputTokens = (() => {
    if (!node.metadata || typeof node.metadata !== 'object') return null
    if (hasChildren) {
      // Root node — sum input + output for total tokens
      const input = Number(node.metadata.total_input_tokens) || 0
      const output = Number(node.metadata.total_output_tokens) || 0
      const total = input + output
      return total > 0 ? total : null
    }
    // Child node — use per-step output tokens, fall back to total
    const val =
      node.metadata.output_tokens ?? node.metadata.total_output_tokens
    return val ? Number(val) : null
  })()

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-2 text-sm cursor-pointer transition-colors hover:bg-accent/20',
          isActive && 'bg-brand/10'
        )}
        style={{ paddingLeft: `${depth * 20 + 12}px` }}
        onClick={() => setTracesActiveSpanId(node.id)}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setExpanded(!expanded)
            }}
            className="shrink-0"
          >
            <ChevronRight
              className={cn(
                'h-3.5 w-3.5 text-muted-foreground transition-transform',
                expanded && 'rotate-90'
              )}
            />
          </button>
        ) : (
          <span className="w-3.5 shrink-0" />
        )}

        {getNodeIcon(node.type)}

        <span className="truncate flex-1">{node.name}</span>

        {outputTokens !== null && (
          <span className="text-xs text-muted-foreground shrink-0">
            ⊙ {outputTokens.toLocaleString()}
          </span>
        )}

        <span className="text-xs text-muted-foreground shrink-0 ml-2">
          {formatDuration(node.duration)}
        </span>
      </div>

      {hasChildren && expanded && (
        <div className="relative">
          <div
            className="absolute top-0 bottom-0 border-l border-border"
            style={{ left: `${depth * 20 + 20}px` }}
          />
          {node.spans.map((child) => (
            <TraceSpanNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

export function TraceSpanTree({ tree, traceCount }: TraceSpanTreeProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-border">
        <span className="text-xs font-dmmono uppercase text-muted-foreground">
          {traceCount} {traceCount === 1 ? 'trace' : 'traces'}
        </span>
      </div>
      <div className="flex-1 overflow-auto">
        {tree.map((node, index) => (
          <TraceSpanNode key={node.id} node={node} depth={0} defaultExpanded={index === 0} />
        ))}
      </div>
    </div>
  )
}
