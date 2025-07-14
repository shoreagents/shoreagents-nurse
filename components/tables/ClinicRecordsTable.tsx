'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { format } from 'date-fns'
import { DataTable, DataTableColumn, DataTableFilter } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { ClinicLog } from '@/lib/types'
import { clinicLogStorage } from '@/lib/storage'
import { Eye, Edit, Trash2, Calendar, User, Package, Users, FileText, UserCheck } from 'lucide-react'

interface ClinicRecordsTableProps {
  className?: string
}

const ClinicRecordsTable = React.memo(function ClinicRecordsTable({ className }: ClinicRecordsTableProps) {
  const { toast } = useToast()
  const [clinicLogs, setClinicLogs] = useState<ClinicLog[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<ClinicLog | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Load data lazily after component renders
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        // Small delay to allow UI to render first
        await new Promise(resolve => setTimeout(resolve, 10))
        const data = clinicLogStorage.getAll()
        setClinicLogs(data)
      } catch (error) {
        console.error('Error loading clinic logs:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleRefresh = async () => {
    setLoading(true)
    try {
      const data = clinicLogStorage.getAll()
      setClinicLogs(data)
      toast({
        title: 'Refreshed',
        description: 'Clinic records have been updated.',
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
      clinicLogStorage.delete(id)
      const updatedData = clinicLogStorage.getAll()
      setClinicLogs(updatedData)
      
      toast({
        title: 'Deleted',
        description: 'Clinic record has been deleted.',
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

  const handleExport = () => {
    try {
      const csvHeaders = [
        'Date',
        'Last Name',
        'First Name',
        'Sex',
        'Employee Number',
        'Client',
        'Chief Complaint/Illness',
        'Medicine/Supplies Issued',
        'Quantity',
        'Issued By',
        'Created At'
      ]

      const csvData = clinicLogs.map(record => [
        format(new Date(record.date), 'yyyy-MM-dd'),
        record.lastName,
        record.firstName,
        record.sex,
        record.employeeNumber,
        record.client,
        record.chiefComplaint,
        record.medicineIssued,
        record.quantity,
        record.issuedBy,
        format(new Date(record.createdAt), 'yyyy-MM-dd HH:mm:ss')
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
      link.setAttribute('download', `clinic-records-${format(new Date(), 'yyyy-MM-dd')}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: 'Exported',
        description: 'Clinic records have been exported to CSV.',
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

  const handleViewRecord = (record: ClinicLog) => {
    setSelectedRecord(record)
    setDialogOpen(true)
  }

  const columns: DataTableColumn<ClinicLog>[] = useMemo(() => [
    {
      key: 'date',
      header: 'Date',
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          {format(new Date(value as Date), 'MMM dd, yyyy')}
        </div>
      )
    },
    {
      key: 'lastName',
      header: 'Last Name',
      sortable: true,
      render: (value) => (
        <span className="font-medium">{String(value || '')}</span>
      )
    },
    {
      key: 'firstName',
      header: 'First Name',
      sortable: true,
      render: (value) => (
        <span className="font-medium">{String(value || '')}</span>
      )
    },
    {
      key: 'sex',
      header: 'Sex',
      sortable: true,
      render: (value) => (
        <Badge variant="outline">{String(value || '')}</Badge>
      )
    },
    {
      key: 'employeeNumber',
      header: 'Employee #',
      sortable: true,
      render: (value) => (
        <span className="font-mono text-sm">{String(value || '')}</span>
      )
    },
    {
      key: 'client',
      header: 'Client',
      sortable: true,
      render: (value) => (
        <span className="text-sm">{String(value || '')}</span>
      )
    },
    {
      key: 'chiefComplaint',
      header: 'Chief Complaint',
      sortable: true,
      render: (value) => (
        <span className="text-sm">{String(value || '').substring(0, 50)}{String(value || '').length > 50 ? '...' : ''}</span>
      )
    },
    {
      key: 'medicineIssued',
      header: 'Medicine/Supplies',
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-muted-foreground" />
          <Badge variant="secondary">{String(value || '')}</Badge>
        </div>
      )
    },
    {
      key: 'quantity',
      header: 'Quantity',
      sortable: true,
      align: 'right',
      render: (value) => (
        <span className="font-mono font-medium">{String(value || '')}</span>
      )
    },
    {
      key: 'issuedBy',
      header: 'Issued By',
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">{String(value || '')}</span>
        </div>
      )
    },
    {
      key: 'createdAt',
      header: 'Created',
      sortable: true,
      render: (value) => (
        <div className="text-sm text-muted-foreground">
          {format(new Date(value as Date), 'MMM dd, yyyy HH:mm')}
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
            onClick={() => handleDelete(String(value || ''))}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ], [handleDelete])

  const filters: DataTableFilter[] = useMemo(() => [
    {
      key: 'sex',
      label: 'Sex',
      options: [
        { value: 'Male', label: 'Male' },
        { value: 'Female', label: 'Female' }
      ]
    },
    {
      key: 'medicineIssued',
      label: 'Medicine/Supplies',
      options: [
        { value: 'biogesic', label: 'Biogesic' },
        { value: 'advil', label: 'Advil' },
        { value: 'salonpas', label: 'Salonpas' },
        { value: 'paracetamol', label: 'Paracetamol' },
        { value: 'ibuprofen', label: 'Ibuprofen' },
        { value: 'bandages', label: 'Bandages' },
        { value: 'alcohol', label: 'Alcohol' },
        { value: 'other', label: 'Other' }
      ]
    },
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'archived', label: 'Archived' }
      ]
    }
  ], [])

  return (
    <div className={className}>
      <DataTable
        data={clinicLogs}
        columns={columns}
        filters={filters}
        searchPlaceholder="Search by name, employee number, or medicine..."
        loading={loading}
        onRefresh={handleRefresh}
        onExport={handleExport}
        emptyMessage="No clinic records found"
        title="Clinic Medicines & Supplies Log"
      />

      {/* Record Detail Dialog using shadcn/ui Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Clinic Record Details</DialogTitle>
          </DialogHeader>
          
          {selectedRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date</label>
                  <p className="text-sm">{format(new Date(selectedRecord.date), 'MMMM dd, yyyy')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Employee Number</label>
                  <p className="text-sm font-mono">{selectedRecord.employeeNumber}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Name</label>
                  <p className="text-sm font-medium">{selectedRecord.lastName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">First Name</label>
                  <p className="text-sm font-medium">{selectedRecord.firstName}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Sex</label>
                  <p className="text-sm">{selectedRecord.sex}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Client</label>
                  <p className="text-sm">{selectedRecord.client}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Chief Complaint/Illness</label>
                <p className="text-sm mt-1 p-2 bg-muted rounded">{selectedRecord.chiefComplaint}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Medicine/Supplies Issued</label>
                <p className="text-sm">{selectedRecord.medicineIssued}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Quantity</label>
                <p className="text-sm font-mono">{selectedRecord.quantity}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Issued By</label>
                <p className="text-sm">{selectedRecord.issuedBy}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <p className="text-sm">
                  <Badge variant={selectedRecord.status === 'active' ? 'default' : 'secondary'}>
                    {selectedRecord.status}
                  </Badge>
                </p>
              </div>
              
              <div className="text-xs text-muted-foreground">
                <label className="font-medium">Created</label>
                <p>{format(new Date(selectedRecord.createdAt), 'MMM dd, yyyy HH:mm')}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
})

export { ClinicRecordsTable } 