'use client'

import * as React from 'react'
import { Wrench } from 'lucide-react'

import type { RunDetail } from '@/types/os'

interface RunMessagesProps {
  run: RunDetail
  mode: 'formatted' | 'text'
}

export function RunMessages({ run, mode }: RunMessagesProps) {
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp < 1e12 ? timestamp * 1000 : timestamp)
    if (isNaN(date.getTime())) return ''
    const month = date.toLocaleDateString('en-US', { month: 'short' })
    const day = date.getDate()
    const year = date.getFullYear()
    const time = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).toLowerCase()
    return `${month} ${day}, ${year}, ${time}`
  }

  if (mode === 'text') {
    return (
      <div className="space-y-4">
        <div>
          <div className="text-xs font-normal uppercase text-muted font-dmmono mb-1">USER INPUT</div>
          <pre className="text-sm bg-accent p-3 rounded-lg whitespace-pre-wrap">
            {typeof run.run_input === 'string' ? run.run_input : JSON.stringify(run.run_input, null, 2)}
          </pre>
        </div>
        <div>
          <div className="text-xs font-normal uppercase text-muted font-dmmono mb-1">AGENT RESPONSE</div>
          <pre className="text-sm bg-accent p-3 rounded-lg whitespace-pre-wrap">
            {typeof run.content === 'string' ? run.content : JSON.stringify(run.content, null, 2)}
          </pre>
        </div>
      </div>
    )
  }

  // Formatted mode - chat-style display
  return (
    <div className="space-y-6">
      {/* User message */}
      <div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-medium">
              U
            </div>
            <span className="font-dmmono text-xs uppercase text-muted">user</span>
          </div>
          <span className="font-dmmono text-xs uppercase text-muted">
            {formatDate(run.created_at)}
          </span>
        </div>
        <div className="mt-2 pl-8 text-sm">
          {typeof run.run_input === 'string' ? (
            <p className="whitespace-pre-wrap">{run.run_input}</p>
          ) : (
            <pre className="bg-accent p-2 rounded-lg text-xs overflow-auto">
              {JSON.stringify(run.run_input, null, 2)}
            </pre>
          )}
        </div>
      </div>

      {/* Tool calls section */}
      {run.tools && run.tools.length > 0 && (
        <div className="pl-0">
          <div className="flex items-center gap-2 mb-2">
            <Wrench className="h-4 w-4 text-muted" />
            <span className="font-dmmono text-xs uppercase text-muted">Tools</span>
          </div>
          <div className="flex flex-wrap gap-2 pl-6">
            {run.tools.map((tool, idx) => (
              <div key={idx} className="rounded-lg bg-accent px-2 py-0.5 text-xs text-white/80">
                {tool.tool_name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agent message */}
      <div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-medium text-brand">
              A
            </div>
            <span className="font-dmmono text-xs uppercase text-muted">agent</span>
          </div>
        </div>
        <div className="mt-2 pl-8 text-sm">
          {typeof run.content === 'string' ? (
            <p className="whitespace-pre-wrap">{run.content}</p>
          ) : (
            <pre className="bg-accent p-2 rounded-lg text-xs overflow-auto">
              {JSON.stringify(run.content, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  )
}
