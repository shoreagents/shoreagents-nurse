'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
import { inventoryMedicineStorage } from '../../lib/storage'
import { InventoryMedicine, MedicalCategory, MedicalSupplier } from '../../lib/types'
import { showSuccessToast, showErrorToast, showItemDeletedToast } from '@/lib/toast-utils'

import { DataTable, DataTableColumn, DataTableFilter } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertTriangle, Package, Edit, Trash2, Eye, MoreHorizontal, Plus, Download } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { InventoryMedicineForm } from '@/components/forms/InventoryMedicineForm'
import { DeleteConfirmationDialog } from '@/components/ui/confirmation-dialog'

interface MedicineTableProps {
  className?: string
}

const MedicineTable = React.memo(function MedicineTable({ className }: MedicineTableProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  
  // State for medicines
  const [medicines, setMedicines] = useState<InventoryMedicine[]>([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<MedicalCategory[]>([])
  const [suppliers, setSuppliers] = useState<MedicalSupplier[]>([])
  
  // Dialog states
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [viewingItem, setViewingItem] = useState<InventoryMedicine | null>(null)

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [medicineData, categoriesData, suppliersData] = await Promise.all([
          inventoryMedicineStorage.getAll(),
          fetch('/api/inventory/categories?type=medicine').then(res => res.json()),
          fetch('/api/inventory/suppliers').then(res => res.json())
        ])
        
        setMedicines(medicineData)
        setCategories(categoriesData)
        setSuppliers(suppliersData)
      } catch (error) {
        console.error('Error loading data:', error)
        toast({
          title: 'Error',
          description: 'Failed to load medicines data.',
          variant: 'destructive'
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [toast])

  // Refresh handler
  const handleRefreshMedicines = async () => {
    setLoading(true)
    try {
      const data = await inventoryMedicineStorage.getAll()
      setMedicines(data)
      toast({
        title: 'Refreshed',
        description: 'Medicines inventory has been updated.',
        variant: 'default'
      })
    } catch (error) {
      console.error('Error refreshing medicines:', error)
      toast({
        title: 'Error',
        description: 'Failed to refresh medicines data.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  // Export handler
  const handleExportMedicines = async () => {
    try {
      const csvHeaders = [
        'Name',
        'Category',
        'Stock',
        'Reorder Level',
        'Price',
        'Supplier'
      ]

      const csvData = medicines.map(medicine => [
        medicine.name,
        medicine.category_name || medicine.category_id || '',
        medicine.stock,
        medicine.reorder_level,
        medicine.price || 0,
        medicine.supplier_name || medicine.supplier_id || ''
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
      link.setAttribute('download', `medicines-inventory-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: 'Exported',
        description: 'Medicines inventory has been exported to CSV.',
        variant: 'default'
      })
    } catch (error) {
      console.error('Error exporting medicines:', error)
      toast({
        title: 'Error',
        description: 'Failed to export medicines data.',
        variant: 'destructive'
      })
    }
  }

  // Success handler
  const handleMedicineSuccess = async () => {
    // Refresh medicines data
    const data = await inventoryMedicineStorage.getAll()
    setMedicines(data)
  }

  // View handler
  const handleView = (item: InventoryMedicine) => {
    setViewingItem(item)
    setViewDialogOpen(true)
  }

  // Delete handler
  const handleDeleteMedicine = async (id: number) => {
    try {
      const medicine = medicines.find(m => m.id === id)
      await inventoryMedicineStorage.delete(id.toString())
      setMedicines(prev => prev.filter(m => m.id !== id))
      showItemDeletedToast(medicine?.name || 'Medicine', 'medicine')
    } catch (error) {
      console.error('Error deleting medicine:', error)
      showErrorToast('Error', 'Failed to delete medicine.')
    }
  }

  // Stock status helper
  const getStockStatus = (stock: number, reorderLevel: number) => {
    if (stock === 0) return { status: 'Out of Stock', variant: 'destructive' as const }
    if (stock <= reorderLevel) return { status: 'Low Stock', variant: 'secondary' as const }
    return { status: 'In Stock', variant: 'default' as const }
  }

  // Medicine columns for DataTable
  const medicineColumns: DataTableColumn<InventoryMedicine>[] = useMemo(() => [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (value) => (
        <div className="font-medium">{String(value)}</div>
      )
    },
    {
      key: 'category_name',
      header: 'Category',
      sortable: true,
      render: (value) => (
        <Badge variant="outline">{String(value) || 'No Category'}</Badge>
      )
    },
    {
      key: 'stock',
      header: 'Stock',
      sortable: true,
      render: (value, record) => (
        <div className="flex items-center gap-2">
          <span>{String(value)}</span>
          {Number(value) <= record.reorder_level && (
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          )}
        </div>
      )
    },
    {
      key: 'reorder_level',
      header: 'Status',
      render: (value, record) => {
        const stockStatus = getStockStatus(record.stock, record.reorder_level)
        return <Badge variant={stockStatus.variant}>{stockStatus.status}</Badge>
      }
    },
    {
      key: 'supplier_name',
      header: 'Supplier',
      sortable: true,
      render: (value) => String(value) || 'No Supplier'
    },
    {
      key: 'price',
      header: 'Price',
      render: (value) => (
        value ? `₱${Number(value).toFixed(2)}` : 'N/A'
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
            <DropdownMenuItem onClick={() => handleView(record)}>
              <Eye className="w-4 h-4 mr-2" />
              View
            </DropdownMenuItem>
            <InventoryMedicineForm
              editingMedicine={record}
              onSuccess={handleMedicineSuccess}
              trigger={
                <DropdownMenuItem 

                  onSelect={(e) => e.preventDefault()}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
              }
            />
            <DropdownMenuSeparator />
            <DeleteConfirmationDialog
              trigger={
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600 cursor-pointer"
                  onSelect={(e) => e.preventDefault()}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              }
              itemName={record.name}
              itemType="medicine"
              onConfirm={() => handleDeleteMedicine(Number(value))}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ], [])

  // Filters for medicines
  const medicineFilters: DataTableFilter[] = useMemo(() => [
    {
      key: 'category_name',
      label: 'Category',
      options: categories
        .filter(category => category.item_type === 'medicine')
        .map(category => ({
          value: category.name,
          label: category.name
        }))
    },
    {
      key: 'supplier_name',
      label: 'Supplier',
      options: suppliers.map(supplier => ({
        value: supplier.name,
        label: supplier.name
      }))
    }
  ], [categories, suppliers])

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Medicine Inventory</h2>
          <p className="text-muted-foreground">
            Manage medicines and track stock levels.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Add Medicine Button */}
          <InventoryMedicineForm 
            onSuccess={handleMedicineSuccess}
            trigger={
              <Button size="sm" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Medicine
              </Button>
            }
          />
          
          {/* Export Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportMedicines}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        data={medicines}
        columns={medicineColumns}
        filters={medicineFilters}
        searchPlaceholder="Search all medicine data..."
        loading={loading}
        onRefresh={handleRefreshMedicines}
        emptyMessage="No medicines found"
        type="medicine"
      />

      {/* View Item Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Medicine Details</DialogTitle>
          </DialogHeader>
          {viewingItem && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Name</Label>
                <p className="text-sm">{viewingItem.name}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Category</Label>
                <p className="text-sm">{viewingItem.category_name || 'No Category'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Stock</Label>
                  <p className="text-sm">{viewingItem.stock} units</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Reorder Level</Label>
                  <p className="text-sm">{viewingItem.reorder_level} units</p>
                </div>
              </div>
              {viewingItem.description && (
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm">{viewingItem.description}</p>
                </div>
              )}
              {viewingItem.supplier_name && (
                <div>
                  <Label className="text-sm font-medium">Supplier</Label>
                  <p className="text-sm">{viewingItem.supplier_name}</p>
                </div>
              )}
              {viewingItem.price && (
                <div>
                  <Label className="text-sm font-medium">Price per Unit</Label>
                  <p className="text-sm">₱{viewingItem.price.toFixed(2)}</p>
                </div>
              )}

            </div>
          )}
        </DialogContent>
      </Dialog>


    </div>
  )
})

MedicineTable.displayName = 'MedicineTable'

export default MedicineTable 