import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { healthCheckStorage } from '@/lib/storage'
import { HealthCheckRequest } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  AlertCircle, 
  Bell, 
  UserCheck, 
  CheckCircle2, 
  Clock,
  Users,
  Calendar,
  Building2,
  Hash
} from 'lucide-react'

const HealthChecks = React.memo(() => {
  const { user } = useAuth()
  const { toast } = useToast()
  const [healthChecks, setHealthChecks] = useState<HealthCheckRequest[]>([])
  const [loading, setLoading] = useState(true)

  const loadHealthChecks = useCallback(() => {
    setLoading(true)
    try {
      const data = healthCheckStorage.getAll()
      setHealthChecks(Array.isArray(data) ? data : [])
    } catch (error) {
      setHealthChecks([]) // Set empty array as fallback
      toast({
        title: 'Error',
        description: 'Failed to load health check requests. Using default data.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadHealthChecks()
  }, [loadHealthChecks])

  const handleNotifyAgent = (request: HealthCheckRequest) => {
    try {
      healthCheckStorage.updateStatus(request.id, 'notified', {
        notifiedAt: new Date()
      })
      loadHealthChecks()
      
      toast({
        title: 'Agent Notified',
        description: `${request.agentName} has been notified to come to the clinic.`,
        variant: 'default'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to notify agent.',
        variant: 'destructive'
      })
    }
  }

  const handleAgentInClinic = (request: HealthCheckRequest) => {
    try {
      healthCheckStorage.updateStatus(request.id, 'in_clinic', {
        arrivedAt: new Date(),
        nurseId: user?.id,
        nurseName: user?.name
      })
      loadHealthChecks()
      
      toast({
        title: 'Agent Checked In',
        description: `${request.agentName} is now marked as in the clinic.`,
        variant: 'default'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to check in agent.',
        variant: 'destructive'
      })
    }
  }

  const handleHealthCheckCompleted = (request: HealthCheckRequest) => {
    try {
      healthCheckStorage.updateStatus(request.id, 'completed', {
        completedAt: new Date(),
        nurseId: user?.id,
        nurseName: user?.name
      })
      loadHealthChecks()
      
      toast({
        title: 'Health Check Completed',
        description: `Health check for ${request.agentName} has been completed.`,
        variant: 'default'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to complete health check.',
        variant: 'destructive'
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-300">Pending</Badge>
      case 'notified':
        return <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-300">Notified</Badge>
      case 'in_clinic':
        return <Badge variant="outline" className="bg-green-50 text-green-800 border-green-300">In Clinic</Badge>
      case 'completed':
        return <Badge variant="outline" className="bg-gray-50 text-gray-800 border-gray-300">Completed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'notified':
        return <Bell className="h-4 w-4 text-blue-600" />
      case 'in_clinic':
        return <UserCheck className="h-4 w-4 text-green-600" />
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-gray-600" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const safeHealthChecks = Array.isArray(healthChecks) ? healthChecks : []
  const pendingRequests = safeHealthChecks.filter(hc => hc?.status === 'pending')
  const notifiedRequests = safeHealthChecks.filter(hc => hc?.status === 'notified')
  const inClinicRequests = safeHealthChecks.filter(hc => hc?.status === 'in_clinic')
  const completedRequests = safeHealthChecks.filter(hc => hc?.status === 'completed')

  if (loading) {
    return (
      <PageWrapper title="Health Checks">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PageWrapper>
    )
  }

  return (
    <PageWrapper 
      title="Agent Health Checks" 
      description="Manage health check requests from agents"
    >
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingRequests.length}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Notified</p>
                  <p className="text-2xl font-bold text-blue-600">{notifiedRequests.length}</p>
                </div>
                <Bell className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">In Clinic</p>
                  <p className="text-2xl font-bold text-green-600">{inClinicRequests.length}</p>
                </div>
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-gray-600">{completedRequests.length}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                Pending Health Check Requests
              </CardTitle>
              <CardDescription>
                New requests waiting for notification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div 
                    key={request.id} 
                    className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50 border-yellow-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(request.status)}
                        {getStatusBadge(request.status)}
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium">{request.agentName}</p>
                                                 <div className="flex items-center gap-4 text-sm text-muted-foreground">
                           <div className="flex items-center gap-1">
                             <Building2 className="h-3 w-3" />
                             {request.client}
                           </div>
                           <div className="flex items-center gap-1">
                             <Hash className="h-3 w-3" />
                             {request.employeeId}
                           </div>
                           <div className="flex items-center gap-1">
                             <Calendar className="h-3 w-3" />
                             {new Date(request.requestDate).toLocaleDateString()}
                           </div>
                         </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-yellow-800 bg-yellow-100 px-3 py-1 rounded-full">
                        📞 Notify agent to come to clinic
                      </div>
                      <Button 
                        onClick={() => handleNotifyAgent(request)}
                        size="sm"
                        className="bg-yellow-600 hover:bg-yellow-700"
                      >
                        <Bell className="h-4 w-4 mr-2" />
                        Notify Agent
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notified Requests */}
        {notifiedRequests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-blue-600" />
                Notified Agents
              </CardTitle>
              <CardDescription>
                Agents who have been notified and are expected to arrive
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifiedRequests.map((request) => (
                  <div 
                    key={request.id} 
                    className="flex items-center justify-between p-4 border rounded-lg bg-blue-50 border-blue-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(request.status)}
                        {getStatusBadge(request.status)}
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium">{request.agentName}</p>
                                                 <div className="flex items-center gap-4 text-sm text-muted-foreground">
                           <div className="flex items-center gap-1">
                             <Building2 className="h-3 w-3" />
                             {request.client}
                           </div>
                           <div className="flex items-center gap-1">
                             <Hash className="h-3 w-3" />
                             {request.employeeId}
                           </div>
                           <div className="flex items-center gap-1">
                             <Calendar className="h-3 w-3" />
                             Notified: {request.notifiedAt ? new Date(request.notifiedAt).toLocaleString() : 'N/A'}
                           </div>
                         </div>
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleAgentInClinic(request)}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <UserCheck className="h-4 w-4 mr-2" />
                      Agent {request.agentName} is in clinic
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* In Clinic Requests */}
        {inClinicRequests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-green-600" />
                Agents in Clinic
              </CardTitle>
              <CardDescription>
                Agents currently in the clinic for health checks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inClinicRequests.map((request) => (
                  <div 
                    key={request.id} 
                    className="flex items-center justify-between p-4 border rounded-lg bg-green-50 border-green-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(request.status)}
                        {getStatusBadge(request.status)}
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium">{request.agentName}</p>
                                                 <div className="flex items-center gap-4 text-sm text-muted-foreground">
                           <div className="flex items-center gap-1">
                             <Building2 className="h-3 w-3" />
                             {request.client}
                           </div>
                           <div className="flex items-center gap-1">
                             <Hash className="h-3 w-3" />
                             {request.employeeId}
                           </div>
                           <div className="flex items-center gap-1">
                             <Calendar className="h-3 w-3" />
                             Arrived: {request.arrivedAt ? new Date(request.arrivedAt).toLocaleString() : 'N/A'}
                           </div>
                           {request.nurseName && (
                             <div className="flex items-center gap-1">
                               <Users className="h-3 w-3" />
                               Nurse: {request.nurseName}
                             </div>
                           )}
                         </div>
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleHealthCheckCompleted(request)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Health Check Completed
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Completed Requests */}
        {completedRequests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-gray-600" />
                Completed Health Checks
              </CardTitle>
              <CardDescription>
                Recently completed health check sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {completedRequests.slice(0, 5).map((request) => (
                  <div 
                    key={request.id} 
                    className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 border-gray-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(request.status)}
                        {getStatusBadge(request.status)}
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium">{request.agentName}</p>
                                                 <div className="flex items-center gap-4 text-sm text-muted-foreground">
                           <div className="flex items-center gap-1">
                             <Building2 className="h-3 w-3" />
                             {request.client}
                           </div>
                           <div className="flex items-center gap-1">
                             <Hash className="h-3 w-3" />
                             {request.employeeId}
                           </div>
                           <div className="flex items-center gap-1">
                             <Calendar className="h-3 w-3" />
                             Completed: {request.completedAt ? new Date(request.completedAt).toLocaleString() : 'N/A'}
                           </div>
                           {request.nurseName && (
                             <div className="flex items-center gap-1">
                               <Users className="h-3 w-3" />
                               By: {request.nurseName}
                             </div>
                           )}
                         </div>
                      </div>
                    </div>
                  </div>
                ))}
                {completedRequests.length > 5 && (
                  <p className="text-sm text-muted-foreground text-center py-2">
                    And {completedRequests.length - 5} more completed health checks...
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {healthChecks.length === 0 && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center space-y-4">
                <Users className="h-12 w-12 text-muted-foreground mx-auto" />
                <div>
                  <h3 className="text-lg font-semibold">No Health Check Requests</h3>
                  <p className="text-muted-foreground">
                    When agents request health checks, they will appear here.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageWrapper>
  )
})

HealthChecks.displayName = 'HealthChecks'

export default HealthChecks 