'use client'
import { Button } from '@/components/ui/button'
import { useStore, EndpointConfig } from '@/store'
import { useState, useEffect, useRef, useCallback } from 'react'
import Icon from '@/components/ui/icon'
import { isValidUrl } from '@/lib/utils'
import { toast } from 'sonner'
import { useQueryState } from 'nuqs'
import { truncateText } from '@/lib/utils'
import { cn } from '@/lib/utils'

function generateId() {
  return crypto.randomUUID()
}

export function AgentOSSelector() {
  const {
    savedEndpoints,
    setSavedEndpoints,
    activeEndpointId,
    setActiveEndpointId,
    selectedEndpoint,
    isEndpointActive,
    setSelectedEndpoint,
    setAgents,
    setSessionsData,
    setMessages,
    authToken,
    setAuthToken
  } = useStore()
  const [isOpen, setIsOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: '', url: '', authToken: '' })
  const [isAdding, setIsAdding] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [, setAgentId] = useQueryState('agent')
  const [, setSessionId] = useQueryState('session')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Migrate: if savedEndpoints is empty but selectedEndpoint exists, create one
  useEffect(() => {
    if (isMounted && savedEndpoints.length === 0 && selectedEndpoint) {
      const id = generateId()
      const initial: EndpointConfig = {
        id,
        name: 'Default',
        url: selectedEndpoint,
        authToken: authToken || ''
      }
      setSavedEndpoints([initial])
      setActiveEndpointId(id)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMounted])

  // Click-outside handler
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
        setEditingId(null)
        setIsAdding(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const activeEndpoint = savedEndpoints.find((e) => e.id === activeEndpointId)
  const displayName = activeEndpoint?.name || 'No Endpoint'

  const handleSelect = useCallback(
    (ep: EndpointConfig) => {
      setActiveEndpointId(ep.id)
      setSelectedEndpoint(ep.url)
      setAuthToken(ep.authToken)
      setAgentId(null)
      setSessionId(null)
      setAgents([])
      setSessionsData([])
      setMessages([])
      setIsOpen(false)
    },
    [setActiveEndpointId, setSelectedEndpoint, setAuthToken, setAgentId, setSessionId, setAgents, setSessionsData, setMessages]
  )

  const handleStartEdit = (ep: EndpointConfig, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingId(ep.id)
    setEditForm({ name: ep.name, url: ep.url, authToken: ep.authToken })
  }

  const handleSaveEdit = () => {
    if (!editForm.url || !isValidUrl(editForm.url)) {
      toast.error('Please enter a valid URL')
      return
    }
    const cleanUrl = editForm.url.replace(/\/$/, '').trim()
    const name = editForm.name.trim() || cleanUrl

    if (editingId) {
      const updated = savedEndpoints.map((ep) =>
        ep.id === editingId
          ? { ...ep, name, url: cleanUrl, authToken: editForm.authToken }
          : ep
      )
      setSavedEndpoints(updated)

      // If editing the active endpoint, sync store
      if (editingId === activeEndpointId) {
        setSelectedEndpoint(cleanUrl)
        setAuthToken(editForm.authToken)
      }
    }
    setEditingId(null)
  }

  const handleAddNew = () => {
    if (!editForm.url || !isValidUrl(editForm.url)) {
      toast.error('Please enter a valid URL')
      return
    }
    const cleanUrl = editForm.url.replace(/\/$/, '').trim()
    const name = editForm.name.trim() || cleanUrl
    const newEp: EndpointConfig = {
      id: generateId(),
      name,
      url: cleanUrl,
      authToken: editForm.authToken
    }
    setSavedEndpoints([...savedEndpoints, newEp])
    setIsAdding(false)
    setEditForm({ name: '', url: '', authToken: '' })
    // Auto-select the new endpoint
    handleSelect(newEp)
  }

  const handleDeleteEndpoint = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const remaining = savedEndpoints.filter((ep) => ep.id !== id)
    setSavedEndpoints(remaining)
    if (id === activeEndpointId && remaining.length > 0) {
      handleSelect(remaining[0])
    } else if (remaining.length === 0) {
      setActiveEndpointId(null)
    }
    setEditingId(null)
  }

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (isAdding) handleAddNew()
      else handleSaveEdit()
    } else if (e.key === 'Escape') {
      setEditingId(null)
      setIsAdding(false)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-9 items-center gap-2 rounded-lg border border-border bg-accent px-3 transition-colors hover:bg-accent/80"
      >
        <Icon type="monitor" size="xs" className="text-muted" />
        <span className="text-xs font-medium text-primary">
          {isMounted ? truncateText(displayName, 20) : 'Loading...'}
        </span>
        <div
          className={cn(
            'size-2 shrink-0 rounded-full',
            isEndpointActive ? 'bg-positive' : 'bg-destructive'
          )}
        />
        <Icon type="chevron-down" size="xxs" className="text-muted" />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1 w-72 rounded-lg border border-border bg-background shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <span className="text-xs font-medium uppercase text-muted">AgentOS</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => {
                setIsAdding(true)
                setEditForm({ name: '', url: '', authToken: '' })
                setEditingId(null)
              }}
            >
              <Icon type="plus" size="xxs" />
            </Button>
          </div>

          {/* Endpoint list */}
          <div className="max-h-64 overflow-y-auto p-1">
            {savedEndpoints.map((ep) => (
              <div key={ep.id}>
                {editingId === ep.id ? (
                  <div className="flex flex-col gap-1.5 rounded-md bg-accent p-2">
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                      onKeyDown={handleEditKeyDown}
                      placeholder="Name"
                      className="h-7 rounded border border-border bg-background px-2 text-xs text-primary"
                      autoFocus
                    />
                    <input
                      type="text"
                      value={editForm.url}
                      onChange={(e) => setEditForm((f) => ({ ...f, url: e.target.value }))}
                      onKeyDown={handleEditKeyDown}
                      placeholder="URL (e.g. http://localhost:7777)"
                      className="h-7 rounded border border-border bg-background px-2 text-xs text-primary"
                    />
                    <input
                      type="password"
                      value={editForm.authToken}
                      onChange={(e) => setEditForm((f) => ({ ...f, authToken: e.target.value }))}
                      onKeyDown={handleEditKeyDown}
                      placeholder="Auth token (optional)"
                      className="h-7 rounded border border-border bg-background px-2 text-xs text-primary"
                    />
                    <div className="flex items-center justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs text-destructive hover:text-destructive"
                        onClick={(e) => handleDeleteEndpoint(ep.id, e)}
                      >
                        Delete
                      </Button>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs text-primary"
                          onClick={handleSaveEdit}
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className={cn(
                      'flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 transition-colors hover:bg-accent',
                      ep.id === activeEndpointId && 'bg-accent'
                    )}
                    onClick={() => handleSelect(ep)}
                  >
                    <div className="flex items-center gap-2">
                      <Icon type="monitor" size="xxs" className="text-muted" />
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-primary">
                          {truncateText(ep.name, 24)}
                        </span>
                        <span className="text-[10px] text-muted">
                          {truncateText(ep.url, 30)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {ep.id === activeEndpointId && (
                        <Icon type="check" size="xxs" className="text-primary" />
                      )}
                      <button
                        className="rounded p-0.5 transition-colors hover:bg-background"
                        onClick={(e) => handleStartEdit(ep, e)}
                      >
                        <Icon type="edit" size="xxs" className="text-muted" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Add new form */}
            {isAdding && (
              <div className="flex flex-col gap-1.5 rounded-md bg-accent p-2">
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                  onKeyDown={handleEditKeyDown}
                  placeholder="Name (e.g. My AgentOS)"
                  className="h-7 rounded border border-border bg-background px-2 text-xs text-primary"
                  autoFocus
                />
                <input
                  type="text"
                  value={editForm.url}
                  onChange={(e) => setEditForm((f) => ({ ...f, url: e.target.value }))}
                  onKeyDown={handleEditKeyDown}
                  placeholder="URL (e.g. http://localhost:7777)"
                  className="h-7 rounded border border-border bg-background px-2 text-xs text-primary"
                />
                <input
                  type="password"
                  value={editForm.authToken}
                  onChange={(e) => setEditForm((f) => ({ ...f, authToken: e.target.value }))}
                  onKeyDown={handleEditKeyDown}
                  placeholder="Auth token (optional)"
                  className="h-7 rounded border border-border bg-background px-2 text-xs text-primary"
                />
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => {
                      setIsAdding(false)
                      setEditForm({ name: '', url: '', authToken: '' })
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs text-primary"
                    onClick={handleAddNew}
                  >
                    Add
                  </Button>
                </div>
              </div>
            )}

            {savedEndpoints.length === 0 && !isAdding && (
              <div className="px-3 py-4 text-center text-xs text-muted">
                No endpoints configured. Click + to add one.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
