'use client'

import * as React from 'react'
import { Copy, Check } from 'lucide-react'

import type { SessionDetail } from '@/types/os'
import { toast } from 'sonner'

interface DetailsTabProps {
  sessionData: SessionDetail | null
}

export function DetailsTab({ sessionData }: DetailsTabProps) {
  const [copied, setCopied] = React.useState(false)

  if (!sessionData) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground text-sm">No session selected</p>
      </div>
    )
  }

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return '-'
    const date = new Date(timestamp < 1e12 ? timestamp * 1000 : timestamp)
    if (isNaN(date.getTime())) return '-'
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }) + ', ' + date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleCopySessionId = async () => {
    try {
      await navigator.clipboard.writeText(sessionData.session_id)
      setCopied(true)
      toast.success('Session ID copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Failed to copy session ID')
    }
  }

  const getAgentDisplay = () => {
    if (sessionData.agent_id) {
      return sessionData.agent_id
    }
    if (sessionData.team_id) {
      return `TEAM: ${sessionData.team_id}`
    }
    return '-'
  }

  const rows = [
    {
      key: 'AGENT',
      value: getAgentDisplay(),
      special: false
    },
    {
      key: 'MODEL',
      value: sessionData.model?.name || sessionData.model?.model || '-',
      special: false
    },
    {
      key: 'MODEL ID',
      value: sessionData.model_id || sessionData.model?.model || '-',
      special: false
    },
    {
      key: 'MODEL PROVIDER',
      value: sessionData.model_provider || sessionData.model?.provider || '-',
      special: false
    },
    {
      key: 'SESSION ID',
      value: sessionData.session_id,
      special: true,
      copyable: true
    },
    {
      key: 'CREATED AT',
      value: formatDate(sessionData.created_at),
      special: false
    },
    {
      key: 'LAST UPDATED',
      value: formatDate(sessionData.updated_at || sessionData.created_at),
      special: false
    }
  ]

  return (
    <div className="p-4">
      <div className="rounded-md border border-border">
        <table className="w-full">
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr key={row.key}>
                <td className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground whitespace-nowrap align-top">
                  {row.key}
                </td>
                <td className="px-4 py-3 text-sm text-foreground">
                  <div className="flex items-center gap-2">
                    <span className="break-all">{row.value}</span>
                    {row.copyable && (
                      <button
                        onClick={handleCopySessionId}
                        className="shrink-0 p-1 hover:bg-muted rounded transition-colors"
                        aria-label="Copy session ID"
                      >
                        {copied ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <Copy className="h-3 w-3 text-muted-foreground" />
                        )}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
