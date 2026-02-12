import * as React from 'react'

import { cn } from '@/lib/utils'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'

export interface Column<T> {
  key: string
  header: string
  render: (item: T) => React.ReactNode
  align?: 'left' | 'right' | 'center'
  width?: string
}

export interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  selectable?: boolean
  selectedIds?: Set<string>
  onSelectionChange?: (ids: Set<string>) => void
  getRowId: (item: T) => string
  onRowClick?: (item: T) => void
  activeRowId?: string | null
  emptyMessage?: string
  loading?: boolean
  itemCount?: number
}

export function DataTable<T>({
  columns,
  data,
  selectable = false,
  selectedIds = new Set(),
  onSelectionChange,
  getRowId,
  onRowClick,
  activeRowId,
  emptyMessage = 'No data available',
  loading = false,
  itemCount
}: DataTableProps<T>) {
  const allSelected =
    data.length > 0 && data.every((item) => selectedIds.has(getRowId(item)))
  const someSelected =
    data.some((item) => selectedIds.has(getRowId(item))) && !allSelected

  const handleSelectAll = () => {
    if (allSelected) {
      onSelectionChange?.(new Set())
    } else {
      onSelectionChange?.(new Set(data.map(getRowId)))
    }
  }

  const handleSelectRow = (item: T) => {
    const id = getRowId(item)
    const newSelection = new Set(selectedIds)
    if (newSelection.has(id)) {
      newSelection.delete(id)
    } else {
      newSelection.add(id)
    }
    onSelectionChange?.(newSelection)
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (!loading && data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="rounded-xl border border-border bg-primaryAccent">
        {itemCount !== undefined && (
          <div className="px-4 pt-3 pb-1 text-sm text-muted-foreground">
            {itemCount} {itemCount === 1 ? 'item' : 'items'} in table
          </div>
        )}
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {selectable && (
                <th className="w-12 border-b border-border px-4 py-3">
                  <Checkbox
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected
                    }}
                    onChange={handleSelectAll}
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'border-b border-border px-4 py-3 text-left font-dmmono text-xs font-normal uppercase text-muted',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right'
                  )}
                  style={{ width: column.width }}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => {
              const rowId = getRowId(item)
              const isSelected = selectedIds.has(rowId)
              const isActive = activeRowId === rowId

              return (
                <tr
                  key={rowId}
                  onClick={() => onRowClick?.(item)}
                  className={cn(
                    'border-b border-border transition-colors hover:bg-accent/20',
                    onRowClick && 'cursor-pointer',
                    isSelected && 'bg-accent/30',
                    isActive && 'bg-brand/10',
                    index === data.length - 1 && 'border-b-0'
                  )}
                >
                  {selectable && (
                    <td className="px-4 py-4">
                      <Checkbox
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation()
                          handleSelectRow(item)
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        'px-4 py-4 text-sm',
                        column.align === 'center' && 'text-center',
                        column.align === 'right' && 'text-right'
                      )}
                    >
                      {column.render(item)}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
