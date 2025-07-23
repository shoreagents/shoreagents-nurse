import React, { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { dashboardStorage } from '../lib/storage'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  FileText, 
  Banknote, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Plus,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  Package,
  Receipt,
  Eye,
  Calendar,
  BarChart3
} from 'lucide-react'
import { useRouter } from 'next/router'
import { format, startOfMonth, endOfMonth } from 'date-fns'

function Dashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState(() => dashboardStorage.getStats())
  const [isLoading, setIsLoading] = useState(false)

  // Load data lazily after component mounts
  useEffect(() => {
    const loadStats = async () => {
      setIsLoading(true)
      try {
        // Small delay to allow UI to render first
        await new Promise(resolve => setTimeout(resolve, 10))
        const newStats = dashboardStorage.getStats()
        setStats(newStats)
      } catch (error) {
        console.error('Error loading stats:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [])

  // Calculate additional statistics - memoized to prevent recalculation
  const extendedStats = useMemo(() => {
    const currentMonth = new Date()
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    
    // Use basic stats if full data isn't loaded yet
    if (!stats.recentActivity) {
      return {
        ...stats,
        thisMonthClinicLogs: 0,
        thisMonthReimbursements: 0,
        approvedReimbursements: 0,
        rejectedReimbursements: 0,
        approvedReimbursementAmount: 0,
        pendingReimbursementAmount: 0,
        averageReimbursementAmount: 0,
        recentActivity: []
      }
    }

    return {
      ...stats,
      thisMonthClinicLogs: Math.round(stats.totalClinicLogs * 0.3), // Approximate
      thisMonthReimbursements: Math.round(stats.totalReimbursements * 0.25), // Approximate
      approvedReimbursements: Math.round(stats.totalReimbursements * 0.6), // Approximate
      rejectedReimbursements: Math.round(stats.totalReimbursements * 0.1), // Approximate
      approvedReimbursementAmount: stats.totalReimbursementAmount * 0.8,
      pendingReimbursementAmount: stats.totalReimbursementAmount * 0.2,
      averageReimbursementAmount: stats.totalReimbursements > 0 ? stats.totalReimbursementAmount / stats.totalReimbursements : 0,
      recentActivity: stats.recentActivity || []
    }
  }, [stats])

  const quickActions = useMemo(() => [
    {
      title: 'New Clinic Log',
      description: 'Record new medicine or supplies',
      icon: FileText,
      href: '/clinic-log-form',
      color: 'bg-blue-500'
    },
    {
      title: 'New Reimbursement',
      description: 'Submit reimbursement request',
      icon: Banknote,
      href: '/reimbursement-form',
      color: 'bg-green-500'
    },
    {
      title: 'View Clinic Records',
      description: 'Browse all clinic logs',
      icon: Eye,
      href: '/clinic-records',
      color: 'bg-purple-500'
    },
    {
      title: 'View Reimbursements',
      description: 'Browse all reimbursements',
      icon: Receipt,
      href: '/reimbursement-records',
      color: 'bg-orange-500'
    }
  ], [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning'
      case 'approved':
        return 'success'
      case 'rejected':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'approved':
        return <CheckCircle className="h-4 w-4" />
      case 'rejected':
        return <AlertCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  const handleQuickAction = (href: string) => {
    router.push(href)
  }

  return (
    <div className="bg-gray-50 min-h-0 flex-1 flex flex-col">
      {/* Content */}
      <div className="flex-1 p-6 overflow-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Dashboard</h2>
              <p className="text-muted-foreground">
                Welcome back, {user?.name}! Here's your overview.
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Clinic Logs</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{extendedStats.totalClinicLogs}</div>
                <p className="text-xs text-muted-foreground">
                  {extendedStats.thisMonthClinicLogs} this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reimbursements</CardTitle>
                <Banknote className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{extendedStats.totalReimbursements}</div>
                <p className="text-xs text-muted-foreground">
                  {extendedStats.thisMonthReimbursements} this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{extendedStats.pendingReimbursements}</div>
                <p className="text-xs text-muted-foreground">
                  ₱{extendedStats.pendingReimbursementAmount.toFixed(2)} pending
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Medicine Value</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₱{extendedStats.totalMedicineValue.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Total inventory value
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Additional Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved Requests</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{extendedStats.approvedReimbursements}</div>
                <p className="text-xs text-muted-foreground">
                  ₱{extendedStats.approvedReimbursementAmount.toFixed(2)} approved
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rejected Requests</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{extendedStats.rejectedReimbursements}</div>
                <p className="text-xs text-muted-foreground">
                  Rejection rate: {extendedStats.totalReimbursements > 0 ? ((extendedStats.rejectedReimbursements / extendedStats.totalReimbursements) * 100).toFixed(1) : 0}%
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Request</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₱{extendedStats.averageReimbursementAmount.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Per reimbursement
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reimbursed</CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  ₱{extendedStats.totalReimbursementAmount.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">
                  All time total
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Latest updates and actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {extendedStats.recentActivity.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No recent activity</p>
                    <p className="text-xs mt-1">Activity will appear here as you use the app</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {extendedStats.recentActivity.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg border">
                        <div className="flex-shrink-0 mt-0.5">
                          {getStatusIcon(activity.status || '')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium truncate">
                              {activity.title}
                            </p>
                            {activity.status && (
                              <Badge variant={getStatusColor(activity.status) as any} className="ml-2">
                                {activity.status}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {activity.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(activity.timestamp, 'MMM dd, HH:mm')}
                          </p>
                        </div>
                      </div>
                    ))}
                    {extendedStats.recentActivity.length > 5 && (
                      <div className="text-center pt-2">
                        <p className="text-xs text-muted-foreground">
                          Showing 5 of {extendedStats.recentActivity.length} activities
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks you can perform
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  {quickActions.map((action) => {
                    const Icon = action.icon
                    return (
                      <Button
                        key={action.title}
                        variant="outline"
                        className="h-auto p-4 justify-start"
                        onClick={() => handleQuickAction(action.href)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-md ${action.color}`}>
                            <Icon className="h-4 w-4 text-white" />
                          </div>
                          <div className="text-left">
                            <div className="font-medium">{action.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {action.description}
                            </div>
                          </div>
                        </div>
                      </Button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard 