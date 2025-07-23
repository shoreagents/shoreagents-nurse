import React from 'react'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { useGlobalShortcuts } from '@/hooks/useKeyboardShortcuts'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  // Enable global keyboard shortcuts
  useGlobalShortcuts({})

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-hidden bg-gray-50 flex">
          {children}
        </main>
      </div>
    </div>
  )
} 