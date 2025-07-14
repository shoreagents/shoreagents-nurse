import React from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { Toaster } from '@/components/ui/toaster'
import { useGlobalShortcuts } from '@/hooks/useKeyboardShortcuts'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  // Enable global keyboard shortcuts with sidebar toggle
  useGlobalShortcuts({ onToggleSidebar: toggleSidebar })

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        {children}
        <Toaster />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Collapsible Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} />
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out">
        <Header onToggleSidebar={toggleSidebar} sidebarCollapsed={sidebarCollapsed} />
        
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
      
      <Toaster />
    </div>
  )
} 