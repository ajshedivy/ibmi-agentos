'use client'

interface UserProfileProps {
  isCollapsed?: boolean
}

export function UserProfile({ isCollapsed = false }: UserProfileProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border bg-accent p-2">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
        U
      </div>
      {!isCollapsed && (
        <div className="flex flex-col overflow-hidden text-left">
          <span className="truncate text-xs font-medium text-foreground">
            User
          </span>
          <span className="truncate text-[10px] text-muted">
            user@example.com
          </span>
        </div>
      )}
    </div>
  )
}
