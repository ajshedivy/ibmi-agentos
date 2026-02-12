'use client'
import { useStore } from '@/store'
import AppSidebar from '@/components/Sidebar/AppSidebar'
import { TopBar } from '@/components/TopBar/TopBar'
import HomePage from '@/components/pages/HomePage'
import ChatPage from '@/components/pages/ChatPage'
import SessionsPage from '@/components/pages/SessionsPage'
import KnowledgePage from '@/components/pages/KnowledgePage'
import TracesPage from '@/components/pages/TracesPage'
import MemoryPage from '@/components/pages/MemoryPage'
import MetricsPage from '@/components/pages/MetricsPage'
import SettingsPage from '@/components/pages/SettingsPage'
import EvaluationPage from '@/components/pages/EvaluationPage'
import ConfigPage from '@/components/pages/ConfigPage'

interface AppLayoutProps {
  hasEnvToken?: boolean
  envToken?: string
}

export default function AppLayout({ hasEnvToken, envToken }: AppLayoutProps) {
  const { activeSection } = useStore()

  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return <HomePage />
      case 'chat':
        return <ChatPage hasEnvToken={hasEnvToken} envToken={envToken} />
      case 'sessions':
        return <SessionsPage />
      case 'knowledge':
        return <KnowledgePage />
      case 'memory':
        return <MemoryPage />
      case 'evaluation':
        return <EvaluationPage />
      case 'traces':
        return <TracesPage />
      case 'metrics':
        return <MetricsPage />
      case 'settings':
        return <SettingsPage />
      case 'config':
        return <ConfigPage />
      default:
        return <HomePage />
    }
  }

  return (
    <div className="flex h-screen bg-background py-3 pr-3">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden rounded-lg border border-border bg-primaryAccent shadow-sm">
        <TopBar />
        <main className="flex-1 overflow-hidden">{renderContent()}</main>
      </div>
    </div>
  )
}
