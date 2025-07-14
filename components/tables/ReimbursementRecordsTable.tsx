'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { format } from 'date-fns'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { DataTable, DataTableColumn, DataTableFilter } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { Reimbursement } from '@/lib/types'
import { reimbursementStorage, userStorage, activityStorage } from '@/lib/storage'
import { reimbursementFormSchema, type ReimbursementFormData } from '@/lib/validations'
import { Eye, Edit, Trash2, Calendar, User, MapPin, Receipt, CheckCircle, XCircle, Clock, Mail, DollarSign, Save, X } from 'lucide-react'

interface ReimbursementRecordsTableProps {
  className?: string
}

const ReimbursementRecordsTable = React.memo(function ReimbursementRecordsTable({ className }: ReimbursementRecordsTableProps) {
  const { toast } = useToast()
  const [reimbursements, setReimbursements] = useState<Reimbursement[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<Reimbursement | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<Reimbursement | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const editForm = useForm<ReimbursementFormData>({
    resolver: zodResolver(reimbursementFormSchema),
    defaultValues: {
      date: '',
      employeeId: '',
      fullNameEmployee: '',
      fullNameDependent: '',
      workLocation: 'Office',
      receiptDate: '',
      amountRequested: 0,
      email: ''
    }
  })

  // Load data lazily after component renders
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        // Small delay to allow UI to render first
        await new Promise(resolve => setTimeout(resolve, 10))
        const data = reimbursementStorage.getAll()
        setReimbursements(data)
      } catch (error) {
        console.error('Error loading reimbursements:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleRefresh = async () => {
    setLoading(true)
    try {
      const data = reimbursementStorage.getAll()
      setReimbursements(data)
      toast({
        title: 'Refreshed',
        description: 'Reimbursement records have been updated.',
        variant: 'default'
      })
    } catch (error) {
      console.error('Error refreshing data:', error)
      toast({
        title: 'Error',
        description: 'Failed to refresh data. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      reimbursementStorage.delete(id)
      const updatedData = reimbursementStorage.getAll()
      setReimbursements(updatedData)
      
      // Log activity
      const currentUser = userStorage.getCurrentUser()
      if (currentUser) {
        activityStorage.add({
          type: 'reimbursement',
          title: 'Reimbursement Record Deleted',
          description: `Reimbursement record was deleted`,
          userId: currentUser.id,
          userName: currentUser.name
        })
      }

      toast({
        title: 'Deleted',
        description: 'Reimbursement record has been deleted.',
        variant: 'default'
      })
    } catch (error) {
      console.error('Error deleting record:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete record. Please try again.',
        variant: 'destructive'
      })
    }
  }

  const handleApprove = async (id: string) => {
    try {
      const record = reimbursements.find(r => r.id === id)
      if (record) {
        const updatedRecord = {
          ...record,
          status: 'approved' as const,
          updatedAt: new Date().toISOString()
        }
        
        // Update the record in storage
        const allRecords = reimbursementStorage.getAll()
        const updatedRecords = allRecords.map(r => r.id === id ? updatedRecord : r)
        reimbursementStorage.save(updatedRecord)
        setReimbursements(updatedRecords)

        // Log activity
        const currentUser = userStorage.getCurrentUser()
        if (currentUser) {
          activityStorage.add({
            type: 'approval',
            title: 'Reimbursement Approved',
            description: `Reimbursement request for ₱${record.amountRequested.toFixed(2)} approved for ${record.fullNameEmployee}`,
            userId: currentUser.id,
            userName: currentUser.name,
            metadata: {
              reimbursementId: record.id,
              amount: record.amountRequested
            }
          })
        }

        toast({
          title: 'Approved',
          description: 'Reimbursement request has been approved.',
          variant: 'default'
        })
      }
    } catch (error) {
      console.error('Error approving record:', error)
      toast({
        title: 'Error',
        description: 'Failed to approve record. Please try again.',
        variant: 'destructive'
      })
    }
  }

  const handleReject = async (id: string) => {
    try {
      const record = reimbursements.find(r => r.id === id)
      if (record) {
        const updatedRecord = {
          ...record,
          status: 'rejected' as const,
          updatedAt: new Date().toISOString()
        }
        
        // Update the record in storage
        const allRecords = reimbursementStorage.getAll()
        const updatedRecords = allRecords.map(r => r.id === id ? updatedRecord : r)
        reimbursementStorage.save(updatedRecord)
        setReimbursements(updatedRecords)

        // Log activity
        const currentUser = userStorage.getCurrentUser()
        if (currentUser) {
          activityStorage.add({
            type: 'rejection',
            title: 'Reimbursement Rejected',
            description: `Reimbursement request for ₱${record.amountRequested.toFixed(2)} rejected for ${record.fullNameEmployee}`,
            userId: currentUser.id,
            userName: currentUser.name,
            metadata: {
              reimbursementId: record.id,
              amount: record.amountRequested
            }
          })
        }

        toast({
          title: 'Rejected',
          description: 'Reimbursement request has been rejected.',
          variant: 'default'
        })
      }
    } catch (error) {
      console.error('Error rejecting record:', error)
      toast({
        title: 'Error',
        description: 'Failed to reject record. Please try again.',
        variant: 'destructive'
      })
    }
  }

  const handleExport = () => {
    try {
      const csvHeaders = [
        'Date',
        'Employee ID',
        'Full Name of Employee',
        'Full Name of Dependent',
        'Work Location',
        'Receipt Date',
        'Amount Requested',
        'Email',
        'Status',
        'Created At',
        'Updated At'
      ]

      const csvData = reimbursements.map(record => [
        record.date,
        record.employeeId,
        record.fullNameEmployee,
        record.fullNameDependent || '',
        record.workLocation,
        record.receiptDate,
        record.amountRequested.toFixed(2),
        record.email,
        record.status,
        record.createdAt,
        record.updatedAt
      ])

      const csvContent = [
        csvHeaders.join(','),
        ...csvData.map(row => 
          row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
        )
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `reimbursement-records-${format(new Date(), 'yyyy-MM-dd')}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: 'Exported',
        description: 'Reimbursement records have been exported to CSV.',
        variant: 'default'
      })
    } catch (error) {
      console.error('Error exporting data:', error)
      toast({
        title: 'Error',
        description: 'Failed to export data. Please try again.',
        variant: 'destructive'
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case 'approved':
        return <Badge variant="default" className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleViewRecord = (record: Reimbursement) => {
    setSelectedRecord(record)
    setDialogOpen(true)
  }

  const handleEditRecord = (record: Reimbursement) => {
    setEditingRecord(record)
    editForm.reset({
      date: record.date,
      employeeId: record.employeeId,
      fullNameEmployee: record.fullNameEmployee,
      fullNameDependent: record.fullNameDependent || '',
      workLocation: record.workLocation,
      receiptDate: record.receiptDate,
      amountRequested: record.amountRequested,
      email: record.email
    })
    setEditDialogOpen(true)
  }

  const handleSaveEdit = async (formData: ReimbursementFormData) => {
    if (!editingRecord) return

    setIsEditing(true)
    try {
      const updatedRecord: Reimbursement = {
        ...editingRecord,
        ...formData,
        updatedAt: new Date().toISOString()
      }

      reimbursementStorage.save(updatedRecord)
      const updatedData = reimbursementStorage.getAll()
      setReimbursements(updatedData)

      // Log activity
      const currentUser = userStorage.getCurrentUser()
      if (currentUser) {
        activityStorage.add({
          type: 'reimbursement',
          title: 'Reimbursement Record Updated',
          description: `Reimbursement record updated for ${formData.fullNameEmployee}`,
          userId: currentUser.id,
          userName: currentUser.name,
          metadata: {
            reimbursementId: editingRecord.id,
            amount: formData.amountRequested
          }
        })
      }

      toast({
        title: 'Updated',
        description: 'Reimbursement record has been updated successfully.',
        variant: 'default'
      })

      setEditDialogOpen(false)
      setEditingRecord(null)
    } catch (error) {
      console.error('Error updating record:', error)
      toast({
        title: 'Error',
        description: 'Failed to update record. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsEditing(false)
    }
  }

  const columns: DataTableColumn<Reimbursement>[] = useMemo(() => [
    {
      key: 'date',
      header: 'Date',
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          {format(new Date(value as string), 'MMM dd, yyyy')}
        </div>
      )
    },
    {
      key: 'employeeId',
      header: 'Employee ID',
      sortable: true,
      render: (value) => (
        <span className="font-mono font-medium">{String(value || '')}</span>
      )
    },
    {
      key: 'fullNameEmployee',
      header: 'Employee Name',
      sortable: true,
      render: (value, record) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{String(value || '')}</span>
          </div>
          {record.fullNameDependent && (
            <span className="text-sm text-muted-foreground">
              Dependent: {record.fullNameDependent}
            </span>
          )}
        </div>
      )
    },
    {
      key: 'workLocation',
      header: 'Work Location',
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          <Badge variant="outline">{String(value || '')}</Badge>
        </div>
      )
    },
    {
      key: 'receiptDate',
      header: 'Receipt Date',
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <Receipt className="w-4 h-4 text-muted-foreground" />
          {format(new Date(value as string), 'MMM dd, yyyy')}
        </div>
      )
    },
    {
      key: 'amountRequested',
      header: 'Amount',
      sortable: true,
      align: 'right',
      render: (value) => (
        <div className="flex items-center gap-2 justify-end">
          <DollarSign className="w-4 h-4 text-muted-foreground" />
          <span className="font-mono font-medium">
            ₱{(value as number).toFixed(2)}
          </span>
        </div>
      )
    },
    {
      key: 'email',
      header: 'Email',
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">{String(value || '')}</span>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value) => getStatusBadge(String(value || ''))
    },
    {
      key: 'createdAt',
      header: 'Submitted',
      sortable: true,
      render: (value) => (
        <div className="text-sm text-muted-foreground">
          {format(new Date(value as string), 'MMM dd, yyyy HH:mm')}
        </div>
      )
    },
    {
      key: 'id',
      header: 'Actions',
      align: 'center',
      render: (value, record) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewRecord(record)}
          >
            <Eye className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditRecord(record)}
            className="text-blue-600 hover:text-blue-700"
          >
            <Edit className="w-4 h-4" />
          </Button>
          
          {record.status === 'pending' && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleApprove(String(value || ''))}
                className="text-green-600 hover:text-green-700"
              >
                <CheckCircle className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleReject(String(value || ''))}
                className="text-red-600 hover:text-red-700"
              >
                <XCircle className="w-4 h-4" />
              </Button>
            </>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(String(value || ''))}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ], [handleApprove, handleDelete, handleReject, handleEditRecord])

  const filters: DataTableFilter[] = useMemo(() => [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' }
      ]
    },
    {
      key: 'workLocation',
      label: 'Work Location',
      options: [
        { value: 'Office', label: 'Office' },
        { value: 'WFH', label: 'Work From Home' }
      ]
    }
  ], [])

  return (
    <div className={className}>
      <DataTable
        data={reimbursements}
        columns={columns}
        filters={filters}
        searchPlaceholder="Search by employee name, ID, or email..."
        loading={loading}
        onRefresh={handleRefresh}
        onExport={handleExport}
        emptyMessage="No reimbursement records found"
        title="Medicine Reimbursement Records"
      />

      {/* Record Detail Dialog using shadcn/ui Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Reimbursement Details</DialogTitle>
          </DialogHeader>
          
          {selectedRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date</label>
                  <p className="text-sm">{format(new Date(selectedRecord.date), 'MMMM dd, yyyy')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Employee ID</label>
                  <p className="text-sm font-mono">{selectedRecord.employeeId}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Full Name of Employee</label>
                <p className="text-sm">{selectedRecord.fullNameEmployee}</p>
              </div>
              
              {selectedRecord.fullNameDependent && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Full Name of Dependent</label>
                  <p className="text-sm">{selectedRecord.fullNameDependent}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Work Location</label>
                  <p className="text-sm">{selectedRecord.workLocation}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Receipt Date</label>
                  <p className="text-sm">{format(new Date(selectedRecord.receiptDate), 'MMMM dd, yyyy')}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Amount Requested</label>
                  <p className="text-lg font-semibold">₱{selectedRecord.amountRequested.toFixed(2)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedRecord.status)}</div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-sm">{selectedRecord.email}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div>
                  <label className="font-medium">Created</label>
                  <p>{format(new Date(selectedRecord.createdAt), 'MMM dd, yyyy HH:mm')}</p>
                </div>
                <div>
                  <label className="font-medium">Updated</label>
                  <p>{format(new Date(selectedRecord.updatedAt), 'MMM dd, yyyy HH:mm')}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Record Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Reimbursement Record</DialogTitle>
          </DialogHeader>
          
          {editingRecord && (
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(handleSaveEdit)} className="space-y-4">
                {/* Date */}
                <FormField
                  control={editForm.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Employee ID and Full Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="employeeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employee ID *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter employee ID" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="fullNameEmployee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name of Employee *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Dependent Name */}
                <FormField
                  control={editForm.control}
                  name="fullNameDependent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name of Enrolled Dependent</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter dependent name (if applicable)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Work Location and Receipt Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="workLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Work Location *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select work location" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Office">Office</SelectItem>
                            <SelectItem value="WFH">WFH (Work From Home)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="receiptDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date on Receipt *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Amount and Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="amountRequested"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount Requested *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₱</span>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              className="pl-8"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={editForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="Enter email address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setEditDialogOpen(false)}
                    disabled={isEditing}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isEditing}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isEditing ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
})

export default ReimbursementRecordsTable 