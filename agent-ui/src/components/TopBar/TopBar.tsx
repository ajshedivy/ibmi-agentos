'use client'
import { AgentOSSelector } from './AgentOSSelector'
import { Breadcrumb } from './Breadcrumb'
import { ChatBreadcrumb } from './ChatBreadcrumb'
import { ChatActions } from './ChatActions'
import { ConfigBreadcrumb } from '@/components/config/ConfigBreadcrumb'
import { useStore } from '@/store'

export function TopBar() {
  const { activeSection } = useStore()

  return (
    <div className="flex h-12 items-center justify-between border-b border-border px-4">
      <div className="flex items-center gap-2">
        <AgentOSSelector />
        {activeSection === 'chat' ? (
          <>
            <span className="text-muted/50">/</span>
            <ChatBreadcrumb />
          </>
        ) : activeSection === 'config' ? (
          <>
            <span className="text-muted/50">/</span>
            <ConfigBreadcrumb />
          </>
        ) : (
          <Breadcrumb />
        )}
      </div>
      {activeSection === 'chat' && <ChatActions />}
    </div>
  )
}
