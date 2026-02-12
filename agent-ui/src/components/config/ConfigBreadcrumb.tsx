'use client'

import { useStore } from '@/store'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select'
import Icon from '@/components/ui/icon'
import { ArrowLeft } from 'lucide-react'

export function ConfigBreadcrumb() {
  const {
    configEntityId,
    configEntityType,
    setConfigEntityId,
    setActiveSection,
    agents,
    teams
  } = useStore()

  const entities = configEntityType === 'team' ? teams : agents
  const currentEntity = entities.find((e) => e.id === configEntityId)
  const entityLabel = currentEntity?.name || currentEntity?.id || 'Unknown'

  const handleBack = () => {
    setActiveSection('home')
    setConfigEntityId(null)
  }

  const handleEntityChange = (value: string) => {
    setConfigEntityId(value)
  }

  return (
    <div className="flex items-center gap-1 font-dmmono">
      <button
        onClick={handleBack}
        className="flex items-center gap-1 text-xs text-muted hover:text-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span className="font-medium uppercase">Home</span>
      </button>

      <span className="text-xs text-muted/50">/</span>

      {entities.length > 1 ? (
        <Select value={configEntityId || ''} onValueChange={handleEntityChange}>
          <SelectTrigger className="h-7 w-auto gap-1 border-none bg-transparent px-2 text-xs font-medium uppercase text-primary shadow-none hover:text-primary/80">
            <SelectValue>{entityLabel}</SelectValue>
          </SelectTrigger>
          <SelectContent className="min-w-32 border-none bg-primaryAccent font-dmmono shadow-lg">
            {entities.map((entity, index) => (
              <SelectItem
                className="cursor-pointer"
                key={`${entity.id}-${index}`}
                value={entity.id}
              >
                <div className="flex items-center gap-2 text-xs font-medium uppercase">
                  <Icon type="user" size="xxs" />
                  {entity.name || entity.id}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <span className="px-2 text-xs font-medium uppercase text-primary">
          {entityLabel}
        </span>
      )}
    </div>
  )
}
