import * as React from 'react'

import { cn } from '@/lib/utils'

export interface TabItem {
  id: string
  label: string
}

export interface TabsProps {
  tabs: TabItem[]
  activeTab: string
  onTabChange: (tabId: string) => void
  variant?: 'pill' | 'underline'
  className?: string
}

export function Tabs({ tabs, activeTab, onTabChange, variant = 'pill', className }: TabsProps) {
  if (variant === 'underline') {
    return (
      <div className={cn('inline-flex h-9 items-center', className)}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'px-5 py-2 text-xs font-normal uppercase font-dmmono transition-colors hover:text-primary',
              activeTab === tab.id
                ? 'border-b border-white text-white'
                : 'text-muted'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className={cn('inline-flex items-center gap-1 rounded-[10px] bg-accent p-1 h-9', className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            'px-4 py-1.5 text-xs font-medium uppercase font-dmmono rounded-lg transition-colors',
            activeTab === tab.id
              ? 'bg-background text-white shadow-sm'
              : 'bg-transparent text-white/80 hover:text-white'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
