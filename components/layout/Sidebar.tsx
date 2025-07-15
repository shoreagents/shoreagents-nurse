import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { 
  Home, 
  FileText, 
  Package,
  Receipt,
  Banknote,
  Plus,
  Database,
  Menu,
  X
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { permissions } from '@/lib/auth'
import { cn } from '@/lib/utils'

interface SidebarProps {
  collapsed?: boolean
}

interface NavigationItem {
  id: string
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  requiredPermission?: (user: any) => boolean
}

interface NavigationSection {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  items: NavigationItem[]
}

const navigationSections: NavigationSection[] = [
  {
    id: 'platform',
    label: 'Platform',
    icon: Home,
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        href: '/',
        icon: Home,
        requiredPermission: permissions.canViewDashboard
      }
    ]
  },
  {
    id: 'forms',
    label: 'Forms',
    icon: Plus,
    items: [
      {
        id: 'clinic-log-form',
        label: 'New Clinic Log',
        href: '/clinic-log-form',
        icon: FileText,
        requiredPermission: permissions.canCreateClinicLog
      },
      {
        id: 'reimbursement-form',
        label: 'New Reimbursement',
        href: '/reimbursement-form',
        icon: Banknote,
        requiredPermission: permissions.canCreateReimbursement
      }
    ]
  },
  {
    id: 'records',
    label: 'Records',
    icon: Database,
    items: [
      {
        id: 'clinic-records',
        label: 'Clinic Records',
        href: '/clinic-records',
        icon: Package,
        requiredPermission: permissions.canViewClinicLogs
      },
      {
        id: 'reimbursement-records',
        label: 'Reimbursement Records',
        href: '/reimbursement-records',
        icon: Receipt,
        requiredPermission: permissions.canViewReimbursements
      }
    ]
  }
]

const SidebarComponent = React.memo(function Sidebar({ collapsed = false }: SidebarProps) {
  const router = useRouter()
  const { user } = useAuth()

  const filteredSections = React.useMemo(() => {
    return navigationSections.map(section => ({
      ...section,
      items: section.items.filter(item => {
        if (!item.requiredPermission) return true
        return item.requiredPermission(user)
      })
    })).filter(section => section.items.length > 0)
  }, [user])

  return (
    <div className={cn(
      "bg-white border-r border-gray-200 flex flex-col h-full transition-all duration-300 ease-in-out",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Logo/Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">SA</span>
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-semibold text-gray-900">ShoreAgents</h1>
              <p className="text-xs text-gray-500">Nurse</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 overflow-y-auto">
        <div className="space-y-6">
          {filteredSections.map((section) => (
            <div key={section.id}>
              {!collapsed && (
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <section.icon className="w-3 h-3" />
                  {section.label}
                </div>
              )}
              
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const isActive = router.pathname === item.href
                  
                  return (
                    <Link 
                      key={item.id} 
                      href={item.href} 
                      prefetch={true}
                      className={cn(
                        "flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150",
                        "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                        collapsed ? "justify-center" : "justify-start",
                        isActive && "bg-gray-100 text-gray-900 font-semibold"
                      )}
                      title={collapsed ? item.label : undefined}
                    >
                      <Icon className={cn("h-4 w-4 flex-shrink-0", !collapsed && "mr-3")} />
                      {!collapsed && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>
    </div>
  )
})

export { SidebarComponent as Sidebar } 