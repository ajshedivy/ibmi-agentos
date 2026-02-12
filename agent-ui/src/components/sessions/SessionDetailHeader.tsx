'use client'

import * as React from 'react'
import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useStore } from '@/store'
import { renameSessionAPI } from '@/api/os'
import type { SessionDetail } from '@/types/os'
import { toast } from 'sonner'

interface SessionDetailHeaderProps {
  sessionData: SessionDetail | null
  onRefetch: () => void
}

export function SessionDetailHeader({ sessionData, onRefetch }: SessionDetailHeaderProps) {
  const [isEditing, setIsEditing] = React.useState(false)
  const [editedName, setEditedName] = React.useState('')
  const inputRef = React.useRef<HTMLInputElement>(null)

  const setSessionDetailOpen = useStore((state) => state.setSessionDetailOpen)
  const setActiveSessionId = useStore((state) => state.setActiveSessionId)
  const selectedEndpoint = useStore((state) => state.selectedEndpoint)
  const authToken = useStore((state) => state.authToken)

  const handleClose = () => {
    setSessionDetailOpen(false)
    setActiveSessionId(null)
  }

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return ''
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

  const handleNameClick = () => {
    if (sessionData) {
      setEditedName(sessionData.session_name || 'Untitled')
      setIsEditing(true)
    }
  }

  const handleSaveName = async () => {
    if (!sessionData || !editedName.trim()) {
      setIsEditing(false)
      return
    }

    try {
      await renameSessionAPI(
        selectedEndpoint,
        sessionData.session_id,
        editedName.trim(),
        authToken
      )
      toast.success('Session renamed')
      onRefetch()
      setIsEditing(false)
    } catch {
      toast.error('Failed to rename session')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveName()
    } else if (e.key === 'Escape') {
      setIsEditing(false)
    }
  }

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  return (
    <div className="p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          {sessionData && (
            <p className="font-dmmono text-xs uppercase tracking-tight text-muted">
              {formatDate(sessionData.created_at)}
            </p>
          )}
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onBlur={handleSaveName}
              onKeyDown={handleKeyDown}
              className="mt-1 w-full border-b border-border bg-transparent p-2 text-[26px] font-semibold text-primary focus:border-white focus:outline-none"
            />
          ) : (
            <h2
              className="mt-1 cursor-pointer text-[26px] font-semibold text-primary hover:text-primary/80"
              onClick={handleNameClick}
            >
              {sessionData?.session_name || 'Untitled'}
            </h2>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="h-9 w-9 shrink-0 border border-border"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
