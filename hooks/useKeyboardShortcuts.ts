import { useEffect } from 'react'
import { useRouter } from 'next/router'

export interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  metaKey?: boolean
  action: () => void
  description: string
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when user is typing in inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement ||
        (event.target as HTMLElement).contentEditable === 'true'
      ) {
        return
      }

      const shortcut = shortcuts.find(s => 
        s.key.toLowerCase() === event.key.toLowerCase() &&
        !!s.ctrlKey === event.ctrlKey &&
        !!s.shiftKey === event.shiftKey &&
        !!s.altKey === event.altKey &&
        !!s.metaKey === event.metaKey
      )

      if (shortcut) {
        event.preventDefault()
        shortcut.action()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])
}

export interface UseGlobalShortcutsOptions {
  onToggleSidebar?: () => void
}

export function useGlobalShortcuts(options: UseGlobalShortcutsOptions = {}) {
  const router = useRouter()
  const { onToggleSidebar } = options

      // Aggressively preload all routes for instant navigation
    useEffect(() => {
      const routesToPreload = [
        '/',
        '/health-checks',
        '/clinic-log-form',
        '/clinic-records',
        '/reimbursement-form',
        '/reimbursement-records',
        '/inventory',
        '/recent-activities'
      ]

    // Preload immediately and again after a short delay
    const preloadRoutes = () => {
      routesToPreload.forEach(route => {
        router.prefetch(route)
      })
    }

    preloadRoutes()
    
    // Preload again after 100ms to ensure they're cached
    const timer = setTimeout(preloadRoutes, 100)
    
    return () => clearTimeout(timer)
  }, [router])

  const navigateToRoute = (route: string) => {
    // Use replace instead of push for faster navigation if already on a page
    if (router.pathname !== route) {
      router.push(route)
    }
  }

  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'h',
      altKey: true,
      action: () => navigateToRoute('/'),
      description: 'Go to Dashboard'
    },
    {
      key: 'g',
      altKey: true,
      action: () => navigateToRoute('/health-checks'),
      description: 'Health Checks'
    },
    {
      key: 'c',
      altKey: true,
      action: () => navigateToRoute('/clinic-log-form'),
      description: 'New Clinic Log'
    },
    {
      key: 'r',
      altKey: true,
      action: () => navigateToRoute('/reimbursement-form'),
      description: 'New Reimbursement'
    },
    {
      key: 'l',
      altKey: true,
      action: () => navigateToRoute('/clinic-records'),
      description: 'View Clinic Records'
    },
    {
      key: 'p',
      altKey: true,
      action: () => navigateToRoute('/reimbursement-records'),
      description: 'View Reimbursement Records'
    },
    {
      key: 'i',
      altKey: true,
      action: () => navigateToRoute('/inventory'),
      description: 'Inventory Management'
    },
    {
      key: 'a',
      altKey: true,
      action: () => navigateToRoute('/recent-activities'),
      description: 'Recent Activities'
    },
    ...(onToggleSidebar ? [{
      key: 's',
      altKey: true,
      action: onToggleSidebar,
      description: 'Toggle Sidebar'
    }] : []),
    {
      key: 'k',
      ctrlKey: true,
      action: () => {
        // Focus on search input if available
        const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement
        if (searchInput) {
          searchInput.focus()
        }
      },
      description: 'Focus Search'
    }
  ]

  useKeyboardShortcuts(shortcuts)

  return shortcuts
}

export function formatShortcut(shortcut: KeyboardShortcut): string {
  const parts = []
  if (shortcut.ctrlKey) parts.push('Ctrl')
  if (shortcut.altKey) parts.push('Alt')
  if (shortcut.shiftKey) parts.push('Shift')
  if (shortcut.metaKey) parts.push('Cmd')
  parts.push(shortcut.key.toUpperCase())
  return parts.join(' + ')
} 