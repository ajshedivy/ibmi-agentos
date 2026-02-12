'use client'

import * as React from 'react'
import { Copy, Check } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Tabs } from '@/components/ui/tabs'
import MarkdownRenderer from '@/components/ui/typography/MarkdownRenderer'
import type { TraceNode } from '@/types/traces'

interface SpanDetailPanelProps {
  span: TraceNode | null
}

function formatDuration(value: unknown): string {
  if (value === null || value === undefined) return '-'
  const seconds = Number(value)
  if (isNaN(seconds)) return '-'
  if (seconds < 0.001) return '<1ms'
  if (seconds < 1) return `${Math.round(seconds * 1000)}ms`
  return `${seconds.toFixed(2)}s`
}

/**
 * Extract human-readable content from a raw JSON string.
 * For root spans (agent .arun): extract user message for INPUT, assistant content for OUTPUT.
 */
function extractReadableContent(raw: string, section: string): string {
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw

    if (parsed && parsed.messages && Array.isArray(parsed.messages)) {
      const messages = parsed.messages

      if (section === 'Input') {
        for (let i = messages.length - 1; i >= 0; i--) {
          if (messages[i].role === 'user' && messages[i].content) {
            return String(messages[i].content)
          }
        }
        for (let i = messages.length - 1; i >= 0; i--) {
          if (messages[i].role !== 'system' && messages[i].content) {
            return String(messages[i].content)
          }
        }
      }

      if (section === 'Output') {
        for (let i = messages.length - 1; i >= 0; i--) {
          if (messages[i].role === 'assistant' && messages[i].content) {
            return String(messages[i].content)
          }
        }
        for (let i = messages.length - 1; i >= 0; i--) {
          if (messages[i].content) {
            return String(messages[i].content)
          }
        }
      }
    }

    if (parsed && typeof parsed.content === 'string') {
      return parsed.content
    }

    return raw
  } catch {
    return raw
  }
}

/** Pretty-print a JSON string, or return as-is if not valid JSON. */
function prettyPrintJson(raw: string): string {
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    return JSON.stringify(parsed, null, 2)
  } catch {
    return raw
  }
}

/**
 * For root spans that have no input/output of their own,
 * synthesize from child spans:
 *  - INPUT: user message from first child's input
 *  - OUTPUT: assistant response from last child's output
 */
function synthesizeRootContent(
  span: TraceNode,
  section: string
): string | null {
  if (!span.spans || span.spans.length === 0) return null

  if (section === 'Input') {
    // Walk children front-to-back, find first input with a user message
    for (const child of span.spans) {
      if (child.input) {
        const readable = extractReadableContent(child.input, 'Input')
        if (readable && readable !== child.input) return readable
      }
    }
    // Fallback: return the raw input of the first child that has one
    for (const child of span.spans) {
      if (child.input) return child.input
    }
  }

  if (section === 'Output') {
    // Walk children back-to-front, find last output with assistant content
    for (let i = span.spans.length - 1; i >= 0; i--) {
      const child = span.spans[i]
      if (child.output) {
        const readable = extractReadableContent(child.output, 'Output')
        if (readable && readable !== child.output) return readable
      }
    }
    // Fallback: return the raw output of the last child that has one
    for (let i = span.spans.length - 1; i >= 0; i--) {
      if (span.spans[i].output) return span.spans[i].output
    }
  }

  return null
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="p-1 text-muted-foreground hover:text-primary transition-colors"
      title="Copy to clipboard"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  )
}

function ContentSection({
  label,
  content,
  isRootSpan
}: {
  label: string
  content: string | null
  isRootSpan: boolean
}) {
  const [displayMode, setDisplayMode] = React.useState<'formatted' | 'text'>(
    'formatted'
  )
  const [collapsed, setCollapsed] = React.useState(false)

  if (!content) return null

  const rawText =
    typeof content === 'string' ? content : JSON.stringify(content, null, 2)

  // Root span: extract readable content (user msg / assistant response)
  // Child span: show raw JSON
  const readableContent = extractReadableContent(rawText, label)
  const prettyJson = prettyPrintJson(rawText)

  // What to display in each mode:
  // Root: FORMATTED = markdown-rendered readable content, TEXT = plain readable text
  // Child: FORMATTED = pretty-printed JSON, TEXT = raw JSON
  let displayContent: string
  let useMarkdown = false
  if (isRootSpan) {
    displayContent = readableContent
    useMarkdown = displayMode === 'formatted'
  } else {
    displayContent = displayMode === 'formatted' ? prettyJson : rawText
  }

  return (
    <div className="border-b border-border">
      <div className="flex items-center justify-between px-4 py-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-xs font-dmmono uppercase text-muted-foreground hover:text-primary transition-colors"
        >
          {collapsed ? '▸' : '▾'} {label}
        </button>
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1 rounded-[10px] bg-accent p-1 h-7">
            <button
              onClick={() => setDisplayMode('text')}
              className={cn(
                'px-2 py-1 text-[10px] font-normal uppercase font-dmmono rounded-lg transition-colors',
                displayMode === 'text'
                  ? 'bg-background text-white shadow-sm'
                  : 'text-white/80 hover:text-white'
              )}
            >
              TEXT
            </button>
            <button
              onClick={() => setDisplayMode('formatted')}
              className={cn(
                'px-2 py-1 text-[10px] font-normal uppercase font-dmmono rounded-lg transition-colors',
                displayMode === 'formatted'
                  ? 'bg-background text-white shadow-sm'
                  : 'text-white/80 hover:text-white'
              )}
            >
              FORMATTED
            </button>
          </div>
        </div>
      </div>
      {!collapsed && (
        <div className="px-4 pb-3">
          <div className="rounded-lg bg-accent/50 p-4 relative">
            {useMarkdown ? (
              <div className="text-sm pr-8">
                <MarkdownRenderer>{displayContent}</MarkdownRenderer>
              </div>
            ) : (
              <pre className="text-sm overflow-auto whitespace-pre-wrap break-words pr-8">
                {displayContent}
              </pre>
            )}
            <div className="absolute top-3 right-3">
              <CopyButton text={displayContent} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function MetadataPanel({ span }: { span: TraceNode }) {
  const entries: [string, unknown][] = []

  if (span.metadata) {
    Object.entries(span.metadata).forEach(([key, value]) => {
      entries.push([key, value])
    })
  }
  if (span.extra_data) {
    Object.entries(span.extra_data).forEach(([key, value]) => {
      entries.push([key, value])
    })
  }

  if (entries.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center">
        <p className="text-sm text-muted-foreground">No metadata available</p>
      </div>
    )
  }

  const formatKey = (key: string) =>
    key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())

  return (
    <div className="rounded-xl border border-border bg-primaryAccent">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border-b border-border px-4 py-3 text-left font-dmmono text-xs font-normal uppercase text-muted w-1/3">
              Key
            </th>
            <th className="border-b border-border px-4 py-3 text-left font-dmmono text-xs font-normal uppercase text-muted">
              Value
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([key, value], index) => (
            <tr
              key={key}
              className={cn(
                'border-b border-border',
                index === entries.length - 1 && 'border-b-0'
              )}
            >
              <td className="px-4 py-3 text-sm text-muted-foreground">
                {formatKey(key)}
              </td>
              <td className="px-4 py-3 text-sm font-mono">
                {typeof value === 'object'
                  ? JSON.stringify(value)
                  : String(value ?? '-')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function SpanDetailPanel({ span }: SpanDetailPanelProps) {
  const [activeTab, setActiveTab] = React.useState('info')

  if (!span) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Select a span to view details</p>
      </div>
    )
  }

  const statusOk = !span.error && span.status !== 'ERROR'
  const isRootSpan = !!(span.spans && span.spans.length > 0)

  // For root spans, synthesize input/output from children if not present
  const inputContent =
    span.input || (isRootSpan ? synthesizeRootContent(span, 'Input') : null)
  const outputContent =
    span.output || (isRootSpan ? synthesizeRootContent(span, 'Output') : null)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium truncate">{span.name}</h3>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs text-muted-foreground">
              LATENCY {formatDuration(span.duration)}
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

      {/* Tabs */}
      <div className="border-b border-border px-4">
        <Tabs
          tabs={[
            { id: 'info', label: 'Info' },
            { id: 'metadata', label: 'Metadata' }
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          variant="underline"
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'info' && (
          <div>
            <ContentSection label="Input" content={inputContent} isRootSpan={isRootSpan} />
            <ContentSection label="Output" content={outputContent} isRootSpan={isRootSpan} />
            {span.error && <ContentSection label="Error" content={span.error} isRootSpan={isRootSpan} />}
          </div>
        )}
        {activeTab === 'metadata' && (
          <div className="p-4">
            <MetadataPanel span={span} />
          </div>
        )}
      </div>
    </div>
  )
}
