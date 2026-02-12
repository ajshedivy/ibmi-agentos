'use client'

import * as React from 'react'
import { Tabs, type TabItem } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useStore } from '@/store'

const TYPE_TABS: TabItem[] = [
  { id: 'agent', label: 'AGENT' },
  { id: 'team', label: 'TEAM' },
  { id: 'workflow', label: 'WORKFLOW' }
]

const SORT_OPTIONS = [
  { value: 'date_desc', label: 'Date descending' },
  { value: 'date_asc', label: 'Date ascending' },
  { value: 'name_asc', label: 'Name A-Z' },
  { value: 'name_desc', label: 'Name Z-A' }
] as const

export function SessionsFilterBar() {
  const sessionsFilterType = useStore((state) => state.sessionsFilterType)
  const setSessionsFilterType = useStore((state) => state.setSessionsFilterType)
  const sessionsSortOrder = useStore((state) => state.sessionsSortOrder)
  const setSessionsSortOrder = useStore((state) => state.setSessionsSortOrder)

  return (
    <div className="flex items-center justify-between pb-4">
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Sort by:</span>
        <Select
          value={sessionsSortOrder}
          onValueChange={(value) =>
            setSessionsSortOrder(
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
      <Tabs
        tabs={TYPE_TABS}
        activeTab={sessionsFilterType}
        onTabChange={(id) =>
          setSessionsFilterType(id as 'agent' | 'team' | 'workflow')
        }
      />
    </div>
  )
}
