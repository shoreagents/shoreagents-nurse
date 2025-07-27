'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
import { inventorySupplyStorage } from '../../lib/storage'
import { InventorySupply, MedicalCategory, MedicalSupplier } from '../../lib/types'
import { showSuccessToast, showErrorToast, showItemDeletedToast } from '@/lib/toast-utils'

import { DataTable, DataTableColumn, DataTableFilter } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { AlertTriangle, Package, Edit, Trash2, Eye, MoreHorizontal, Plus, Download } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { InventorySupplyForm } from '@/components/forms/InventorySupplyForm'
import { DeleteConfirmationDialog } from '@/components/ui/confirmation-dialog'

interface SupplyTableProps {
  className?: string
  autoOpenForm?: boolean
}

const SupplyTable = React.memo(function SupplyTable({ className, autoOpenForm }: SupplyTableProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  
  // State for supplies
  const [supplies, setSupplies] = useState<InventorySupply[]>([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<MedicalCategory[]>([])
  const [suppliers, setSuppliers] = useState<MedicalSupplier[]>([])
  
  // Dialog states
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [viewingItem, setViewingItem] = useState<InventorySupply | null>(null)
  const [editingItem, setEditingItem] = useState<InventorySupply | null>(null)
  const [formDialogOpen, setFormDialogOpen] = useState(false)

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [supplyData, categoriesData, suppliersData] = await Promise.all([
          inventorySupplyStorage.getAll(),
          fetch('/api/inventory/categories?type=Supply').then(res => res.json()),
          fetch('/api/inventory/suppliers').then(res => res.json())
        ])
        
        setSupplies(supplyData)
        setCategories(categoriesData)
        setSuppliers(suppliersData)
      } catch (error) {
        console.error('Error loading data:', error)
        toast({
          title: 'Error',
          description: 'Failed to load supplies data.',
          variant: 'destructive'
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [toast])

  // Auto open form if requested
  useEffect(() => {
    if (autoOpenForm && !loading) {
      setFormDialogOpen(true)
    }
  }, [autoOpenForm, loading])

  // Refresh handler
  const handleRefreshSupplies = async () => {
    setLoading(true)
    try {
      const data = await inventorySupplyStorage.getAll()
      setSupplies(data)
      toast({
        title: 'Refreshed',
        description: 'Supplies inventory has been updated.',
        variant: 'default'
      })
    } catch (error) {
      console.error('Error refreshing supplies:', error)
      toast({
        title: 'Error',
        description: 'Failed to refresh supplies data.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  // Export handler
  const handleExportSupplies = async () => {
    try {
      const csvHeaders = [
        'Name',
        'Category',
        'Stock',
        'Reorder Level',
        'Price',
        'Supplier'
      ]

      const csvData = supplies.map(supply => [
        supply.name,
        supply.category_name || supply.category_id || '',
        supply.stock,
        supply.reorder_level,
        supply.price || 0,
        supply.supplier_name || supply.supplier_id || ''
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
      link.setAttribute('download', `supplies-inventory-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: 'Exported',
        description: 'Supplies inventory has been exported to CSV.',
        variant: 'default'
      })
    } catch (error) {
      console.error('Error exporting supplies:', error)
      toast({
        title: 'Error',
        description: 'Failed to export supplies data.',
        variant: 'destructive'
      })
    }
  }

  // Success handler
  const handleSupplySuccess = async () => {
    // Refresh supplies data
    const data = await inventorySupplyStorage.getAll()
    setSupplies(data)
  }

  // View handler
  const handleView = (item: InventorySupply) => {
    setViewingItem(item)
    setViewDialogOpen(true)
  }

  const handleEdit = (item: InventorySupply) => {
    setEditingItem(item)
    setFormDialogOpen(true)
  }

  // Delete handler
  const handleDeleteSupply = async (id: number) => {
    try {
      const supply = supplies.find(s => s.id === id)
      await inventorySupplyStorage.delete(id.toString())
      setSupplies(prev => prev.filter(s => s.id !== id))
      showItemDeletedToast(supply?.name || 'Supply', 'supply')
    } catch (error) {
      console.error('Error deleting supply:', error)
      showErrorToast('Error', 'Failed to delete supply.')
    }
  }

  // Stock status helper
  const getStockStatus = (stock: number, reorderLevel: number) => {
    if (stock === 0) return { status: 'Out of Stock', variant: 'destructive' as const }
    if (stock <= reorderLevel) return { status: 'Low Stock', variant: 'secondary' as const }
    return { status: 'In Stock', variant: 'default' as const }
  }

  // Supply columns for DataTable
  const supplyColumns: DataTableColumn<InventorySupply>[] = useMemo(() => [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (value) => (
        <div className="font-medium">
          {String(value || 'Not Assigned')}
        </div>
      )
    },
    {
      key: 'category_name',
      header: 'Category',
      sortable: true,
      render: (value) => (
        <div>
          {value && value !== 'null' ? String(value) : 'Not Assigned'}
        </div>
      )
    },
    {
      key: 'stock',
      header: 'Stock',
      sortable: true,
      render: (value, record) => {
        const { status, variant } = getStockStatus(Number(value), record.reorder_level)
        return (
          <div className="flex items-center gap-2">
            <span>{String(value || 0)}</span>
            <Badge 
              variant={variant} 
              className={`text-xs ${
                status === 'Out of Stock' ? 'bg-red-400 text-white hover:bg-red-400' : 
                status === 'Low Stock' ? 'hover:bg-secondary' : 
                'hover:bg-primary'
              }`}
            >
              {status}
            </Badge>
          </div>
        )
      }
    },
    {
      key: 'price',
      header: 'Price (Per Item)',
      sortable: true,
      render: (value) => (
        <div>
          {value ? `₱${Number(value).toFixed(2)}` : 'Not Set'}
        </div>
      )
    },
    {
      key: 'supplier_name',
      header: 'Supplier',
      sortable: true,
      render: (value) => (
        <div>
          {value && value !== 'null' ? String(value) : 'Not Assigned'}
        </div>
      )
    },
    {
      key: 'id',
      header: 'Actions',
      render: (_, record) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 cursor-pointer">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation()
                handleEdit(record)
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation()
                handleDeleteSupply(record.id)
              }}
              className="text-red-600 hover:text-red-600 hover:bg-red-50 focus:text-red-600 focus:bg-red-50 cursor-pointer"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ], [handleDeleteSupply])

  // Filters for supplies
  const supplyFilters: DataTableFilter[] = useMemo(() => [
    {
      key: 'category_name',
      label: 'Category',
      options: [
        { value: 'Not Assigned', label: 'Not Assigned' },
        ...categories
          .filter(category => category.item_type === 'Supply')
          .map(category => ({
            value: category.name,
            label: category.name
          }))
      ]
    },
    {
      key: 'supplier_name',
      label: 'Supplier',
      options: [
        { value: 'Not Assigned', label: 'Not Assigned' },
        ...suppliers.map(supplier => ({
          value: supplier.name,
          label: supplier.name
        }))
      ]
    }
  ], [categories, suppliers])

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Supply Inventory</h2>
          <p className="text-muted-foreground">
            Manage medical supplies and track stock levels
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Add Supply Button */}
          <InventorySupplyForm 
            onSuccess={handleSupplySuccess}
            trigger={
              <Button size="sm" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Supply
              </Button>
            }
          />
          
          {/* Export Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportSupplies}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        data={supplies}
        columns={supplyColumns}
        filters={supplyFilters}
        searchPlaceholder="Search all supply data..."
        loading={loading}
        onRefresh={handleRefreshSupplies}
        emptyMessage="No supplies found"
        type="Supply"
        onRowClick={(row) => handleView(row)}
      />

      {/* View Item Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Supply Details
            </DialogTitle>
            <DialogDescription>
              View detailed information about this supply item.
            </DialogDescription>
          </DialogHeader>
          {viewingItem && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Name</Label>
                  <div className="p-3 bg-gray-50 rounded-md border">
                    <p className="text-sm font-medium">{viewingItem.name}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Category</Label>
                  <div className="p-3 bg-gray-50 rounded-md border">
                    <p className="text-sm font-medium">{viewingItem.category_name && viewingItem.category_name !== 'null' ? viewingItem.category_name : 'Not Assigned'}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {viewingItem.description && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Description</Label>
                  <div className="p-3 bg-gray-50 rounded-md border min-h-[80px]">
                    <p className="text-sm">{viewingItem.description}</p>
                  </div>
                </div>
              )}

              {/* Stock Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Current Stock</Label>
                  <div className="p-3 bg-gray-50 rounded-md border">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{viewingItem.stock}</span>
                      {viewingItem.stock === 0 && (
                        <Badge variant="destructive" className="text-xs">Out of Stock</Badge>
                      )}
                      {viewingItem.stock > 0 && viewingItem.stock <= viewingItem.reorder_level && (
                        <Badge variant="secondary" className="text-xs">Low Stock</Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Reorder Level</Label>
                  <div className="p-3 bg-gray-50 rounded-md border">
                    <p className="text-sm font-medium">{viewingItem.reorder_level}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Price (Per Item)</Label>
                  <div className="p-3 bg-gray-50 rounded-md border">
                    <p className="text-sm font-medium">
                      {viewingItem.price ? `₱${viewingItem.price.toFixed(2)}` : 'Not Set'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Supplier Information */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Supplier</Label>
                <div className="p-3 bg-gray-50 rounded-md border">
                  <p className="text-sm font-medium">{viewingItem.supplier_name && viewingItem.supplier_name !== 'null' ? viewingItem.supplier_name : 'Not Assigned'}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Supply Form for Add/Edit */}
      <InventorySupplyForm
        editingSupply={editingItem}
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        onSuccess={() => {
          setEditingItem(null)
          setFormDialogOpen(false)
          handleRefreshSupplies()
        }}
      />

    </div>
  )
})

SupplyTable.displayName = 'SupplyTable'

export default SupplyTable 