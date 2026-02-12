'use client'
import { LucideIcon, ChevronDown } from 'lucide-react'
import { motion } from 'framer-motion'

interface SidebarNavItemProps {
  icon: LucideIcon
  label: string
  sectionId: string
  isActive: boolean
  onClick: () => void
  badge?: string
  collapsible?: boolean
  isExpanded?: boolean
  onToggle?: () => void
  isCollapsed?: boolean
}

export function SidebarNavItem({
  icon: Icon,
  label,
  isActive,
  onClick,
  badge,
  collapsible,
  isExpanded,
  onToggle,
  isCollapsed = false
}: SidebarNavItemProps) {
  return (
    <motion.button
      onClick={collapsible ? onToggle : onClick}
      className={`flex h-9 w-full items-center justify-between rounded-lg px-3 text-xs font-medium uppercase transition-colors ${
        isActive
          ? 'bg-primary/10 text-primary'
          : 'text-muted hover:bg-accent hover:text-foreground'
      }`}
      whileTap={{ scale: 0.98 }}
      title={isCollapsed ? label : undefined}
    >
      <div className="flex items-center gap-2 overflow-hidden">
        <Icon className="size-4 shrink-0" />
        {!isCollapsed && (
          <>
            <span className="truncate">{label}</span>
            {badge && (
              <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                {badge}
              </span>
            )}
          </>
        )}
      </div>
      {collapsible && !isCollapsed && (
        <motion.div
          animate={{ rotate: isExpanded ? 0 : -90 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="size-3" />
        </motion.div>
      )}
    </motion.button>
  )
}
