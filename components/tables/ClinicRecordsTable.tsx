'use client'

import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { format } from 'date-fns'
import { DataTable, DataTableColumn, DataTableFilter } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { MedicineSupplyDisplay } from '@/components/ui/medicine-supply-display'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { PillAnimated } from '@/components/icons/pill-animated'
import { BoxesIcon } from '@/components/icons/boxes'
import { useToast } from '@/hooks/use-toast'
import { DbClinicLog } from '@/lib/types'
import { Eye, Trash2, Download, MoreHorizontal } from 'lucide-react'

interface ClinicRecordsTableProps {
  className?: string
}

const ClinicRecordsTable = React.memo(function ClinicRecordsTable({ className }: ClinicRecordsTableProps) {
  const { toast } = useToast()
  const [clinicLogs, setClinicLogs] = useState<DbClinicLog[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<DbClinicLog | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Helper function to get company badge styling
  const getCompanyBadgeStyle = (badgeColor: string | undefined, userType: string) => {
    if (userType === 'Internal') {
      return {
        variant: 'default' as const,
        style: { backgroundColor: '#3b82f6', color: 'white' } // Blue for internal
      }
    }
    
    if (badgeColor) {
      return {
        variant: 'secondary' as const,
        style: { backgroundColor: badgeColor, color: 'white' }
      }
    }
    
    // Default fallback
    return {
      variant: 'secondary' as const,
      style: {}
    }
  }

  // Load data from API
  const loadClinicLogs = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/clinic-logs')
      if (!response.ok) {
        throw new Error('Failed to fetch clinic logs')
      }
      const result = await response.json()
      if (result.success) {
        setClinicLogs(result.data)
      } else {
        throw new Error(result.message || 'Failed to fetch clinic logs')
      }
    } catch (error) {
      console.error('Error loading clinic logs:', error)
      toast({
        title: 'Error',
        description: 'Failed to load clinic logs.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadClinicLogs()
  }, [loadClinicLogs])

  const handleRefresh = async () => {
    setLoading(true)
    try {
      await loadClinicLogs()
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

  const handleDelete = useCallback(async (id: number) => {
    try {
      const response = await fetch(`/api/clinic-logs/${id}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete clinic log')
      }
      
      await loadClinicLogs()
      
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
  }, [loadClinicLogs, toast])

  const handleExport = async () => {
    try {
             const csvHeaders = [
         'Date',
         'Patient Name',
         'Employee ID',
         'Company',
         'Patient Diagnosis',
         'Medicines',
         'Supplies',
         'Issued By',
         'Created At'
       ]

       const csvData = clinicLogs.map(record => [
         format(new Date(record.created_at), 'yyyy-MM-dd'),
         `${record.patient_full_name}${record.employee_id ? ` (ID: ${record.employee_id})` : ''}`,
         record.employee_id || 'N/A',
         record.company || 'N/A',
         record.patient_diagnose,
         record.medicines.map(m => `${m.name} (${m.quantity})`).join(', ') || 'None',
         record.supplies.map(s => `${s.name} (${s.quantity})`).join(', ') || 'None',
         record.issued_by,
         format(new Date(record.created_at), 'yyyy-MM-dd HH:mm:ss')
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

  const handleViewRecord = (record: DbClinicLog) => {
    setSelectedRecord(record)
    setDialogOpen(true)
  }

  const columns: DataTableColumn<DbClinicLog>[] = useMemo(() => [
    {
      key: 'created_at',
      header: 'Date',
      sortable: true,
      render: (value) => (
        <div className="font-medium">
          {format(new Date(value as Date), 'MMM dd, yyyy')}
        </div>
      )
    },
    {
      key: 'patient_full_name',
      header: 'Patient Info',
      sortable: true,
      render: (value, record) => (
        <div className="space-y-1">
          <div className="font-medium">{String(value)}</div>
          {record.employee_id && (
            <div className="text-xs text-muted-foreground">ID: {record.employee_id}</div>
          )}
        </div>
      )
    },
    {
      key: 'company',
      header: 'Company',
      sortable: true,
      render: (value, record) => (
        <div>
          {record.company ? (
            <Badge 
              variant={getCompanyBadgeStyle(record.badge_color, record.patient_user_type).variant}
              className="text-xs"
              style={getCompanyBadgeStyle(record.badge_color, record.patient_user_type).style}
            >
              {record.company}
            </Badge>
          ) : (
            <span className="text-sm text-muted-foreground">N/A</span>
          )}
        </div>
      )
    },
    {
      key: 'patient_diagnose',
      header: 'Patient Diagnosis',
      sortable: true,
      render: (value) => (
        <span className="text-sm">{String(value || '').substring(0, 50)}{String(value || '').length > 50 ? '...' : ''}</span>
      )
    },
    {
      key: 'medicines',
      header: 'Medicines',
      sortable: false,
      render: (value, record) => (
        <div className="flex flex-wrap gap-1">
          {record.medicines.length > 0 ? (
            record.medicines.map((medicine, index) => (
              <Tooltip key={`medicine-${index}`}>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 p-1 bg-orange-50 rounded border border-orange-200 cursor-pointer hover:bg-orange-100 transition-colors">
                    <PillAnimated size={12} className="text-orange-600" />
                    <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                      {medicine.quantity}
                    </Badge>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">{medicine.name}</p>
                </TooltipContent>
              </Tooltip>
            ))
          ) : (
            <span className="text-xs text-muted-foreground">None</span>
          )}
        </div>
      )
    },
    {
      key: 'supplies',
      header: 'Supplies',
      sortable: false,
      render: (value, record) => (
        <div className="flex flex-wrap gap-1">
          {record.supplies.length > 0 ? (
            record.supplies.map((supply, index) => (
              <Tooltip key={`supply-${index}`}>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 p-1 bg-yellow-50 rounded border border-yellow-200 cursor-pointer hover:bg-yellow-100 transition-colors">
                    <BoxesIcon size={12} className="text-yellow-600" />
                    <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300">
                      {supply.quantity}
                    </Badge>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">{supply.name}</p>
                </TooltipContent>
              </Tooltip>
            ))
          ) : (
            <span className="text-xs text-muted-foreground">None</span>
          )}
        </div>
      )
    },
    {
      key: 'issued_by',
      header: 'Issued By',
      sortable: true,
      render: (value) => (
        <span className="text-sm">{String(value || '')}</span>
      )
    },
    {
      key: 'id',
      header: 'Actions',
      align: 'center',
      render: (value, record) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleViewRecord(record)}>
              <Eye className="w-4 h-4 mr-2" />
              View
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => handleDelete(Number(value))}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ], [handleDelete])

  const filters: DataTableFilter[] = useMemo(() => [
    {
      key: 'patient_user_type',
      label: 'Patient Type',
      options: [
        { value: 'Agent', label: 'Agent' },
        { value: 'Client', label: 'Client' },
        { value: 'Internal', label: 'Internal' }
      ]
    }
  ], [])

  return (
    <TooltipProvider>
      <div className={className}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Clinic Records</h2>
            <p className="text-muted-foreground">
              View and manage clinic visit records
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Export Button */}
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={handleExport}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* DataTable */}
        <DataTable
          data={clinicLogs}
          columns={columns}
          filters={filters}
          searchPlaceholder="Search by patient name, employee ID, or diagnosis..."
          loading={loading}
          onRefresh={handleRefresh}
          emptyMessage="No clinic records found"
        />

      {/* View Item Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Clinic Record Details</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Date</Label>
                <p className="text-sm">{format(new Date(selectedRecord.created_at), 'MMMM dd, yyyy')}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Patient Name</Label>
                <p className="text-sm font-medium">{selectedRecord.patient_full_name}</p>
              </div>
                                                            <div>
                  <Label className="text-sm font-medium">Employee ID</Label>
                  <p className="text-sm">{selectedRecord.employee_id || 'N/A'}</p>
                </div>
                               <div>
                  <Label className="text-sm font-medium">Company</Label>
                  <div className="mt-1">
                    {selectedRecord.company ? (
                      <Badge 
                        variant={getCompanyBadgeStyle(selectedRecord.badge_color, selectedRecord.patient_user_type).variant}
                        className="text-xs"
                        style={getCompanyBadgeStyle(selectedRecord.badge_color, selectedRecord.patient_user_type).style}
                      >
                        {selectedRecord.company}
                      </Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">N/A</span>
                    )}
                  </div>
                </div>
               <div>
                 <Label className="text-sm font-medium">Patient Type</Label>
                 <p className="text-sm">{selectedRecord.patient_user_type}</p>
               </div>
              <div>
                <Label className="text-sm font-medium">Patient Diagnosis</Label>
                <p className="text-sm">{selectedRecord.patient_diagnose}</p>
              </div>
              {selectedRecord.additional_notes && (
                <div>
                  <Label className="text-sm font-medium">Additional Notes</Label>
                  <p className="text-sm">{selectedRecord.additional_notes}</p>
                </div>
              )}
              <div>
                <Label className="text-sm font-medium">Medicines & Supplies Issued</Label>
                <div className="mt-1">
                  <MedicineSupplyDisplay 
                    medicines={selectedRecord.medicines}
                    supplies={selectedRecord.supplies}
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Issued By</Label>
                <p className="text-sm">{selectedRecord.issued_by}</p>
              </div>
              <div className="text-xs text-muted-foreground">
                <Label className="font-medium">Created</Label>
                <p>{format(new Date(selectedRecord.created_at), 'MMM dd, yyyy HH:mm')}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </TooltipProvider>
  )
})

export { ClinicRecordsTable } 