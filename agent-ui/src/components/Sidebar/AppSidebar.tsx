'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Home,
  MessageSquare,
  BookOpen,
  Brain,
  History,
  Activity,
  BarChart3,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react'
import { useStore } from '@/store'
import Icon from '@/components/ui/icon'
import { SidebarNavItem } from './SidebarNavItem'
import { Button } from '@/components/ui/button'

const SidebarHeader = ({ isCollapsed }: { isCollapsed: boolean }) => (
  <div className="flex items-center gap-2">
    <Icon type="agno" size="xs" />
    {!isCollapsed && (
      <span className="text-xs font-medium uppercase text-white">iAssist UI</span>
    )}
  </div>
)

export default function AppSidebar() {
  const { activeSection, setActiveSection } = useStore()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const navItems = [
    { icon: Home, label: 'Home', sectionId: 'home' },
    { icon: MessageSquare, label: 'Chat', sectionId: 'chat' },
    { icon: BookOpen, label: 'Knowledge', sectionId: 'knowledge' },
    { icon: Brain, label: 'Memory', sectionId: 'memory' },
    { icon: History, label: 'Sessions', sectionId: 'sessions' },
    { icon: Activity, label: 'Traces', sectionId: 'traces' },
    { icon: BarChart3, label: 'Metrics', sectionId: 'metrics' }
  ]

  return (
    <motion.aside
      className="relative flex h-screen shrink-0 flex-col overflow-hidden bg-background px-2 py-3 font-dmmono"
      initial={{ width: '16rem' }}
      animate={{ width: isCollapsed ? '4rem' : '16rem' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <SidebarHeader isCollapsed={isCollapsed} />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="size-6 shrink-0 hover:bg-accent"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="size-4" />
            ) : (
              <PanelLeftClose className="size-4" />
            )}
          </Button>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1 overflow-y-auto">
          {navItems.map((item) => (
            <SidebarNavItem
              key={item.sectionId}
              icon={item.icon}
              label={item.label}
              sectionId={item.sectionId}
              isActive={activeSection === item.sectionId}
              onClick={() => setActiveSection(item.sectionId)}
              isCollapsed={isCollapsed}
            />
          ))}
        </nav>
      </div>

    </motion.aside>
  )
}
