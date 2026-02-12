'use client'

import * as React from 'react'
import { ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { RunDetail } from '@/types/os'
import { RunMessages } from './RunMessages'

interface RunItemProps {
  run: RunDetail
  isExpanded: boolean
  onToggle: () => void
  index: number
}

export function RunItem({ run, isExpanded, onToggle, index }: RunItemProps) {
  const [showDetails, setShowDetails] = React.useState(false)
  const [displayMode, setDisplayMode] = React.useState<'formatted' | 'text'>('formatted')

  const formatDate = (timestamp: number) => {
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

  const getPreview = () => {
    const input = typeof run.run_input === 'string' ? run.run_input : JSON.stringify(run.run_input)
    return input.length > 50 ? input.slice(0, 50) + '...' : input
  }

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/10 transition-colors"
      >
        <div className="flex-1">
          <div className="font-medium text-sm">Run {index + 1}</div>
          <div className="text-muted text-xs mt-1">
            {formatDate(run.created_at)}
          </div>
          {!isExpanded && (
            <div className="text-muted text-xs mt-1 truncate">
              {getPreview()}
            </div>
          )}
        </div>
        <ChevronRight
          className={cn(
            'h-4 w-4 text-muted transition-transform',
            isExpanded && 'rotate-90'
          )}
        />
      </button>

      {isExpanded && (
        <div className="border-t border-border">
          <div className="flex items-center justify-between border-b border-border px-4 py-2">
            <div className="inline-flex items-center gap-1 rounded-[10px] bg-accent p-1 h-9">
              <button
                onClick={() => setDisplayMode('formatted')}
                className={cn(
                  'px-2 py-1.5 text-xs font-normal uppercase font-dmmono rounded-lg transition-colors',
                  displayMode === 'formatted'
                    ? 'bg-background text-white shadow-sm'
                    : 'text-white/80 hover:text-white'
                )}
              >
                FORMATTED
              </button>
              <button
                onClick={() => setDisplayMode('text')}
                className={cn(
                  'px-2 py-1.5 text-xs font-normal uppercase font-dmmono rounded-lg transition-colors',
                  displayMode === 'text'
                    ? 'bg-background text-white shadow-sm'
                    : 'text-white/80 hover:text-white'
                )}
              >
                TEXT
              </button>
            </div>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-muted hover:text-primary transition-colors"
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </button>
          </div>

          <div className="p-4">
            <RunMessages run={run} mode={displayMode} />

            {showDetails && (
              <div className="mt-4 border-t border-border pt-4">
                <h4 className="text-xs font-medium uppercase text-muted mb-2">
                  Raw Run Data
                </h4>
                <pre className="text-xs bg-accent p-3 rounded-lg overflow-auto max-h-64">
                  {JSON.stringify(run, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
