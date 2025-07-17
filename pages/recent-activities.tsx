import React, { useState, useEffect, useMemo } from 'react'
import { NextPage } from 'next'
import { useAuth } from '@/hooks/useAuth'
import { dashboardStorage } from '@/lib/storage'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Calendar,
  ArrowLeft
} from 'lucide-react'
import { useRouter } from 'next/router'
import { format } from 'date-fns'

const RecentActivitiesPage: NextPage = React.memo(() => {
  const { user } = useAuth()
  const router = useRouter()
  const [activities, setActivities] = useState<any[]>([])
  const [filteredActivities, setFilteredActivities] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)

  // Load activities
  useEffect(() => {
    const loadActivities = async () => {
      setIsLoading(true)
      try {
        const stats = dashboardStorage.getStats()
        const allActivities = stats.recentActivity || []
        setActivities(allActivities)
        setFilteredActivities(allActivities)
      } catch (error) {
        console.error('Error loading activities:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadActivities()
  }, [])

  // Filter activities based on search and status
  useEffect(() => {
    let filtered = activities

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(activity =>
        activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(activity => activity.status === statusFilter)
    }

    setFilteredActivities(filtered)
  }, [activities, searchTerm, statusFilter])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning'
      case 'approved':
        return 'success'
      case 'rejected':
        return 'destructive'
      case 'active':
        return 'default'
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
      case 'active':
        return <Activity className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('all')
  }

  return (
    <PageWrapper 
      title="Recent Activities"
      description="View all system activities and updates"
      showBack={true}
    >
      <div className="space-y-6">

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </CardTitle>
            <CardDescription>
              Search and filter activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={clearFilters}
                className="w-full md:w-auto"
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Activities List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              All Activities
            </CardTitle>
            <CardDescription>
              {filteredActivities.length} of {activities.length} activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Loading activities...</p>
              </div>
            ) : filteredActivities.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-muted-foreground">No activities found</p>
                <p className="text-xs mt-1">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your filters' 
                    : 'Activities will appear here as you use the app'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4 p-4 rounded-lg border hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0 mt-1">
                      {getStatusIcon(activity.status || '')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium truncate">
                          {activity.title}
                        </h3>
                        {activity.status && (
                          <Badge variant={getStatusColor(activity.status) as any} className="ml-2">
                            {activity.status}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {activity.description}
                      </p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        {format(activity.timestamp, 'MMM dd, yyyy HH:mm')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  )
})

RecentActivitiesPage.displayName = 'RecentActivitiesPage'

export default RecentActivitiesPage 