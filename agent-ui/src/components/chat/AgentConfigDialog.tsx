'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog'
import { useStore } from '@/store'
import { useQueryState } from 'nuqs'
import { getProviderIcon } from '@/lib/modelProvider'
import Icon from '@/components/ui/icon'

interface AgentConfigDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AgentConfigDialog({ open, onOpenChange }: AgentConfigDialogProps) {
  const { mode, agents, teams } = useStore()
  const [agentId] = useQueryState('agent')
  const [teamId] = useQueryState('team')

  const currentId = mode === 'team' ? teamId : agentId
  const entities = mode === 'team' ? teams : agents
  const entity = entities.find((e) => e.id === currentId)

  if (!entity) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configuration</DialogTitle>
            <DialogDescription>
              No {mode === 'team' ? 'team' : 'agent'} selected.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
  }

  const providerIcon = entity.model ? getProviderIcon(entity.model.model) : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="uppercase">
            {mode === 'team' ? 'Team' : 'Agent'} Configuration
          </DialogTitle>
          <DialogDescription>
            Details for the selected {mode === 'team' ? 'team' : 'agent'}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <ConfigRow label="Name" value={entity.name || entity.id} />
          <ConfigRow label="ID" value={entity.id} />
          {entity.model && (
            <>
              <div className="flex items-start justify-between gap-4">
                <span className="shrink-0 text-xs font-medium uppercase text-muted">
                  Model
                </span>
                <div className="flex items-center gap-2 text-right">
                  {providerIcon && (
                    <Icon type={providerIcon} size="xs" className="shrink-0" />
                  )}
                  <span className="text-xs text-primary">
                    {entity.model.model || entity.model.name || '-'}
                  </span>
                </div>
              </div>
              <ConfigRow label="Provider" value={entity.model.provider || '-'} />
            </>
          )}
          {entity.db_id && <ConfigRow label="Database ID" value={entity.db_id} />}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function ConfigRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="shrink-0 text-xs font-medium uppercase text-muted">
        {label}
      </span>
      <span className="text-right text-xs text-primary">{value}</span>
    </div>
  )
}
