import React, { useState } from 'react'
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
  X,
  Warehouse,
  Users,
  Activity,
  Heart,
  Pill
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { permissions } from '@/lib/auth'
import { cn } from '@/lib/utils'
import { SyringeIcon, FlaskIcon, FileStackIcon, BoxesIcon, PillAnimated, FoldersIcon, FileCheck2Icon, LayoutPanelTopIcon, MonitorCheckIcon, GripIcon, CircleDollarSignIcon, ThermometerIcon, ActivityIcon } from '@/components/icons'

interface SidebarProps {
  // Removed collapsed prop
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
        icon: GripIcon,
        requiredPermission: permissions.canViewDashboard
      }
    ]
  },
  {
    id: 'agents',
    label: 'Agents',
    icon: Users,
    items: [
      {
        id: 'health-checks',
        label: 'Health Checks',
        href: '/health-checks',
        icon: ActivityIcon,
        requiredPermission: permissions.canViewClinicLogs
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
        icon: MonitorCheckIcon,
        requiredPermission: permissions.canCreateClinicLog
      },
      {
        id: 'reimbursement-form',
        label: 'New Reimbursement',
        href: '/reimbursement-form',
        icon: CircleDollarSignIcon,
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
        icon: FoldersIcon,
        requiredPermission: permissions.canViewClinicLogs
      },
      {
        id: 'reimbursement-records',
        label: 'Reimbursement Records',
        href: '/reimbursement-records',
        icon: FileCheck2Icon,
        requiredPermission: permissions.canViewReimbursements
      }
    ]
  },
  {
    id: 'inventory',
    label: 'Inventory',
    icon: Warehouse,
    items: [
      {
        id: 'medicines',
        label: 'Medicines',
        href: '/medicines',
        icon: PillAnimated,
        requiredPermission: permissions.canViewInventory
      },
      {
        id: 'supplies',
        label: 'Supplies',
        href: '/supplies',
        icon: ThermometerIcon,
        requiredPermission: permissions.canViewInventory
      }
    ]
  },
  {
    id: 'management',
    label: 'Management',
    icon: Users,
    items: [
      {
        id: 'client-issuer-management',
        label: 'Clients & Issuers',
        href: '/client-issuer-management',
        icon: Users,
        requiredPermission: permissions.canCreateClinicLog // Using existing permission for now
      }
    ]
  }
]

const SidebarComponent = React.memo(function Sidebar({}: SidebarProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

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
    <div className="bg-white border-r border-gray-200 flex flex-col h-full w-64 overflow-x-hidden">
      {/* Logo/Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center h-16">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">SA</span>
          </div>
          <div className="flex flex-col items-start">
            <h1 className="font-semibold text-gray-900">ShoreAgents</h1>
            <p className="text-xs text-gray-500">Clinic Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 overflow-y-auto">
        <div className="space-y-6">
          {filteredSections.map((section) => (
            <div key={section.id}>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                {section.label}
              </div>
              
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const isActive = router.pathname === item.href
                  
                  return (
                    <Link 
                      key={item.id} 
                      href={item.href} 
                      prefetch={true}
                      onMouseEnter={() => setHoveredItem(item.id)}
                      onMouseLeave={() => setHoveredItem(null)}
                      className={cn(
                        "group flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150",
                        "text-gray-700 justify-start",
                        !isActive && "hover:bg-gray-100 hover:text-gray-900",
                        isActive && "bg-green-100 text-green-900"
                      )}
                    >
                      {Icon === ThermometerIcon ? (
                        <ThermometerIcon 
                          className="h-6 w-6 flex-shrink-0 mr-3" 
                          size={24}
                          animate={hoveredItem === item.id}
                        />
                      ) : Icon === PillAnimated ? (
                        <PillAnimated 
                          className="h-5 w-5 flex-shrink-0 mr-3" 
                          size={20}
                          animate={hoveredItem === item.id}
                        />
                      ) : Icon === FoldersIcon ? (
                        <FoldersIcon 
                          className="h-5 w-5 flex-shrink-0 mr-3" 
                          size={20}
                          animate={hoveredItem === item.id}
                        />
                      ) : Icon === FileCheck2Icon ? (
                        <FileCheck2Icon 
                          className="h-5 w-5 flex-shrink-0 mr-3" 
                          size={20}
                          animate={hoveredItem === item.id}
                        />
                      ) : Icon === GripIcon ? (
                        <GripIcon 
                          className="h-5 w-5 flex-shrink-0 mr-3" 
                          size={20}
                          animate={hoveredItem === item.id}
                        />
                      ) : Icon === MonitorCheckIcon ? (
                        <MonitorCheckIcon 
                          className="h-5 w-5 flex-shrink-0 mr-3" 
                          size={20}
                          animate={hoveredItem === item.id}
                        />
                      ) : Icon === CircleDollarSignIcon ? (
                        <CircleDollarSignIcon 
                          className="h-5 w-5 flex-shrink-0 mr-3" 
                          size={20}
                          animate={hoveredItem === item.id}
                        />
                      ) : Icon === ActivityIcon ? (
                        <ActivityIcon 
                          className="h-5 w-5 flex-shrink-0 mr-3" 
                          size={20}
                          animate={hoveredItem === item.id}
                        />
                      ) : (
                        <Icon className="h-5 w-5 flex-shrink-0 mr-3" />
                      )}
                      <span className="truncate">{item.label}</span>
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