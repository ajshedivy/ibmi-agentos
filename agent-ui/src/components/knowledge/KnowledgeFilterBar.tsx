'use client'

import * as React from 'react'
import { ChevronDown } from 'lucide-react'

import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useStore } from '@/store'
import type { KnowledgeDatabaseConfig } from '@/types/knowledge'

const SORT_OPTIONS = [
  { value: 'date_desc', label: 'Date descending' },
  { value: 'date_asc', label: 'Date ascending' },
  { value: 'name_asc', label: 'Name A-Z' },
  { value: 'name_desc', label: 'Name Z-A' }
] as const

interface KnowledgeFilterBarProps {
  databases: KnowledgeDatabaseConfig[]
  selectedDbId: string
  onDbChange: (dbId: string) => void
}

export function KnowledgeFilterBar({
  databases,
  selectedDbId,
  onDbChange
}: KnowledgeFilterBarProps) {
  const knowledgeSortOrder = useStore((state) => state.knowledgeSortOrder)
  const setKnowledgeSortOrder = useStore((state) => state.setKnowledgeSortOrder)

  const [dbDropdownOpen, setDbDropdownOpen] = React.useState(false)
  const dbDropdownRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        dbDropdownRef.current &&
        !dbDropdownRef.current.contains(e.target as Node)
      ) {
        setDbDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const selectedDb = databases.find((db) => db.db_id === selectedDbId)
  const dbDisplayName = selectedDb?.domain_config?.display_name || selectedDb?.db_id || 'No database'

  return (
    <div className="flex items-center justify-between pb-4">
      <div className="flex items-center gap-4">
        {databases.length > 0 && (
          <div className="relative" ref={dbDropdownRef}>
            <button
              onClick={() => setDbDropdownOpen(!dbDropdownOpen)}
              className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-xs font-dmmono"
            >
              <span className="text-muted-foreground">Database:</span>
              <span>{dbDisplayName}</span>
              {databases.length > 1 && (
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              )}
            </button>
            {dbDropdownOpen && databases.length > 1 && (
              <div className="absolute top-full left-0 mt-1 z-50 min-w-[200px] rounded-lg border border-border bg-background shadow-lg">
                {databases.map((db) => (
                  <button
                    key={db.db_id}
                    onClick={() => {
                      onDbChange(db.db_id)
                      setDbDropdownOpen(false)
                    }}
                    className={cn(
                      'block w-full px-3 py-2 text-left text-sm hover:bg-accent/50 transition-colors',
                      db.db_id === selectedDbId && 'bg-accent/30'
                    )}
                  >
                    {db.domain_config?.display_name || db.db_id}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Sort by:</span>
          <Select
            value={knowledgeSortOrder}
            onValueChange={(value) =>
              setKnowledgeSortOrder(
                value as 'date_desc' | 'date_asc' | 'name_asc' | 'name_desc'
              )
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
