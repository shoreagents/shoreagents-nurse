'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  inventoryMedicineStorage,
  inventorySupplyStorage,
  inventoryTransactionStorage
} from '@/lib/storage'
import { InventoryMedicine, InventorySupply } from '@/lib/types'

import { DataTable, DataTableColumn, DataTableFilter } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertTriangle, Package, Plus, Edit, Trash2, Eye, MoreHorizontal } from 'lucide-react'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'

// Validation schemas
const medicineSchema = z.object({
  name: z.string().min(1, 'Medicine name is required'),
  displayName: z.string().min(1, 'Display name is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  stock: z.number().min(0, 'Stock must be non-negative'),
  unit: z.string().min(1, 'Unit is required'),
  reorderLevel: z.number().min(0, 'Reorder level must be non-negative'),
  price: z.number().min(0, 'Price must be non-negative').optional(),
  supplier: z.string().optional(),
  expiryDate: z.date().optional()
})

const supplySchema = z.object({
  name: z.string().min(1, 'Supply name is required'),
  displayName: z.string().min(1, 'Display name is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  stock: z.number().min(0, 'Stock must be non-negative'),
  unit: z.string().min(1, 'Unit is required'),
  reorderLevel: z.number().min(0, 'Reorder level must be non-negative'),
  price: z.number().min(0, 'Price must be non-negative').optional(),
  supplier: z.string().optional(),
  expiryDate: z.date().optional()
})

interface InventoryTableProps {
  className?: string
}

const InventoryTable = React.memo(function InventoryTable({ className }: InventoryTableProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  
  // State for medicines and supplies
  const [medicines, setMedicines] = useState<InventoryMedicine[]>([])
  const [supplies, setSupplies] = useState<InventorySupply[]>([])
  const [loading, setLoading] = useState(true)
  
  // View toggle state
  const [currentView, setCurrentView] = useState<'medicines' | 'supplies'>('medicines')
  
  // Dialog states
  const [medicineDialogOpen, setMedicineDialogOpen] = useState(false)
  const [supplyDialogOpen, setSupplyDialogOpen] = useState(false)
  const [editingMedicine, setEditingMedicine] = useState<InventoryMedicine | null>(null)
  const [editingSupply, setEditingSupply] = useState<InventorySupply | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [viewingItem, setViewingItem] = useState<(InventoryMedicine | InventorySupply) | null>(null)

  // Forms
  const medicineForm = useForm<z.infer<typeof medicineSchema>>({
    resolver: zodResolver(medicineSchema),
    defaultValues: {
      name: '',
      displayName: '',
      description: '',
      category: '',
      stock: 0,
      unit: '',
      reorderLevel: 0,
      price: 0,
      supplier: '',
      expiryDate: undefined
    }
  })

  const supplyForm = useForm<z.infer<typeof supplySchema>>({
    resolver: zodResolver(supplySchema),
    defaultValues: {
      name: '',
      displayName: '',
      description: '',
      category: '',
      stock: 0,
      unit: '',
      reorderLevel: 0,
      price: 0,
      supplier: '',
      expiryDate: undefined
    }
  })

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [medicineData, supplyData] = await Promise.all([
          Promise.resolve(inventoryMedicineStorage.getAll()),
          Promise.resolve(inventorySupplyStorage.getAll())
        ])
        setMedicines(medicineData)
        setSupplies(supplyData)
      } catch (error) {
        console.error('Error loading inventory:', error)
        toast({
          title: 'Error',
          description: 'Failed to load inventory data.',
          variant: 'destructive'
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [toast])

  // Refresh handlers
  const handleRefreshMedicines = async () => {
    setLoading(true)
    try {
      const data = inventoryMedicineStorage.getAll()
      setMedicines(data)
      toast({
        title: 'Refreshed',
        description: 'Medicine inventory has been updated.',
        variant: 'default'
      })
    } catch (error) {
      console.error('Error refreshing medicines:', error)
      toast({
        title: 'Error',
        description: 'Failed to refresh medicine data.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRefreshSupplies = async () => {
    setLoading(true)
    try {
      const data = inventorySupplyStorage.getAll()
      setSupplies(data)
      toast({
        title: 'Refreshed',
        description: 'Supply inventory has been updated.',
        variant: 'default'
      })
    } catch (error) {
      console.error('Error refreshing supplies:', error)
      toast({
        title: 'Error',
        description: 'Failed to refresh supply data.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  // Export handlers
  const handleExportMedicines = async () => {
    try {
      const csvHeaders = [
        'Name',
        'Display Name',
        'Category',
        'Stock',
        'Unit',
        'Reorder Level',
        'Price',
        'Supplier',
        'Expiry Date',
        'Created At'
      ]

      const csvData = medicines.map(medicine => [
        medicine.name,
        medicine.displayName,
        medicine.category,
        medicine.stock,
        medicine.unit,
        medicine.reorderLevel,
        medicine.price || 0,
        medicine.supplier || '',
        medicine.expiryDate ? new Date(medicine.expiryDate).toLocaleDateString() : '',
        new Date(medicine.createdAt).toLocaleDateString()
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
      link.setAttribute('download', `medicine-inventory-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: 'Exported',
        description: 'Medicine inventory has been exported to CSV.',
        variant: 'default'
      })
    } catch (error) {
      console.error('Error exporting medicines:', error)
      toast({
        title: 'Error',
        description: 'Failed to export medicine data.',
        variant: 'destructive'
      })
    }
  }

  const handleExportSupplies = async () => {
    try {
      const csvHeaders = [
        'Name',
        'Display Name',
        'Category',
        'Stock',
        'Unit',
        'Reorder Level',
        'Price',
        'Supplier',
        'Expiry Date',
        'Created At'
      ]

      const csvData = supplies.map(supply => [
        supply.name,
        supply.displayName,
        supply.category,
        supply.stock,
        supply.unit,
        supply.reorderLevel,
        supply.price || 0,
        supply.supplier || '',
        supply.expiryDate ? new Date(supply.expiryDate).toLocaleDateString() : '',
        new Date(supply.createdAt).toLocaleDateString()
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
      link.setAttribute('download', `supply-inventory-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: 'Exported',
        description: 'Supply inventory has been exported to CSV.',
        variant: 'default'
      })
    } catch (error) {
      console.error('Error exporting supplies:', error)
      toast({
        title: 'Error',
        description: 'Failed to export supply data.',
        variant: 'destructive'
      })
    }
  }

  // Submit handlers
  const onSubmitMedicine = async (data: z.infer<typeof medicineSchema>) => {
    try {
      if (editingMedicine) {
        // Update existing medicine
        const updatedMedicine: InventoryMedicine = {
          ...editingMedicine,
          ...data,
          updatedAt: new Date()
        }
        inventoryMedicineStorage.save(updatedMedicine)
        setMedicines(prev => prev.map(m => m.id === editingMedicine.id ? updatedMedicine : m))
        toast({
          title: 'Success',
          description: 'Medicine updated successfully.',
          variant: 'default'
        })
      } else {
        // Add new medicine
        const newMedicine: InventoryMedicine = {
          ...data,
          id: crypto.randomUUID(),
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        inventoryMedicineStorage.save(newMedicine)
        setMedicines(prev => [...prev, newMedicine])
        
        // Record initial stock transaction
        if (user && data.stock > 0) {
          inventoryTransactionStorage.add({
            type: 'stock_in',
            itemType: 'medicine',
            itemId: newMedicine.id,
            itemName: newMedicine.displayName,
            quantity: data.stock,
            previousStock: 0,
            newStock: data.stock,
            reason: 'Initial stock entry',
            userId: user.id,
            userName: user.name
          })
        }
        
        toast({
          title: 'Success',
          description: 'Medicine added successfully.',
          variant: 'default'
        })
      }
      
      medicineForm.reset()
      setMedicineDialogOpen(false)
      setEditingMedicine(null)
    } catch (error) {
      console.error('Error saving medicine:', error)
      toast({
        title: 'Error',
        description: 'Failed to save medicine.',
        variant: 'destructive'
      })
    }
  }

  const onSubmitSupply = async (data: z.infer<typeof supplySchema>) => {
    try {
      if (editingSupply) {
        // Update existing supply
        const updatedSupply: InventorySupply = {
          ...editingSupply,
          ...data,
          updatedAt: new Date()
        }
        inventorySupplyStorage.save(updatedSupply)
        setSupplies(prev => prev.map(s => s.id === editingSupply.id ? updatedSupply : s))
        toast({
          title: 'Success',
          description: 'Supply updated successfully.',
          variant: 'default'
        })
      } else {
        // Add new supply
        const newSupply: InventorySupply = {
          ...data,
          id: crypto.randomUUID(),
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        inventorySupplyStorage.save(newSupply)
        setSupplies(prev => [...prev, newSupply])
        
        // Record initial stock transaction
        if (user && data.stock > 0) {
          inventoryTransactionStorage.add({
            type: 'stock_in',
            itemType: 'supply',
            itemId: newSupply.id,
            itemName: newSupply.displayName,
            quantity: data.stock,
            previousStock: 0,
            newStock: data.stock,
            reason: 'Initial stock entry',
            userId: user.id,
            userName: user.name
          })
        }
        
        toast({
          title: 'Success',
          description: 'Supply added successfully.',
          variant: 'default'
        })
      }
      
      supplyForm.reset()
      setSupplyDialogOpen(false)
      setEditingSupply(null)
    } catch (error) {
      console.error('Error saving supply:', error)
      toast({
        title: 'Error',
        description: 'Failed to save supply.',
        variant: 'destructive'
      })
    }
  }

  // Edit handlers
  const handleEditMedicine = (medicine: InventoryMedicine) => {
    setEditingMedicine(medicine)
    medicineForm.reset({
      name: medicine.name,
      displayName: medicine.displayName,
      description: medicine.description || '',
      category: medicine.category,
      stock: medicine.stock,
      unit: medicine.unit,
      reorderLevel: medicine.reorderLevel,
      price: medicine.price || 0,
      supplier: medicine.supplier || '',
      expiryDate: medicine.expiryDate ? new Date(medicine.expiryDate) : undefined
    })
    setMedicineDialogOpen(true)
  }

  const handleEditSupply = (supply: InventorySupply) => {
    setEditingSupply(supply)
    supplyForm.reset({
      name: supply.name,
      displayName: supply.displayName,
      description: supply.description || '',
      category: supply.category,
      stock: supply.stock,
      unit: supply.unit,
      reorderLevel: supply.reorderLevel,
      price: supply.price || 0,
      supplier: supply.supplier || '',
      expiryDate: supply.expiryDate ? new Date(supply.expiryDate) : undefined
    })
    setSupplyDialogOpen(true)
  }

  // View handler
  const handleView = (item: InventoryMedicine | InventorySupply) => {
    setViewingItem(item)
    setViewDialogOpen(true)
  }

  // Delete handlers
  const handleDeleteMedicine = (id: string) => {
    try {
      inventoryMedicineStorage.delete(id)
      setMedicines(prev => prev.filter(m => m.id !== id))
      toast({
        title: 'Success',
        description: 'Medicine deleted successfully.',
        variant: 'default'
      })
    } catch (error) {
      console.error('Error deleting medicine:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete medicine.',
        variant: 'destructive'
      })
    }
  }

  const handleDeleteSupply = (id: string) => {
    try {
      inventorySupplyStorage.delete(id)
      setSupplies(prev => prev.filter(s => s.id !== id))
      toast({
        title: 'Success',
        description: 'Supply deleted successfully.',
        variant: 'default'
      })
    } catch (error) {
      console.error('Error deleting supply:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete supply.',
        variant: 'destructive'
      })
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
      key: 'displayName',
      header: 'Name',
      sortable: true,
      render: (value, record) => (
        <div>
          <div className="font-medium">{String(value)}</div>
          <div className="text-sm text-gray-500">{record.name}</div>
        </div>
      )
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      render: (value) => (
        <Badge variant="outline">{String(value)}</Badge>
      )
    },
    {
      key: 'stock',
      header: 'Stock',
      sortable: true,
      render: (value, record) => (
        <div className="flex items-center gap-2">
          <span>{String(value)}</span>
          {Number(value) <= record.reorderLevel && (
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          )}
        </div>
      )
    },
    {
      key: 'stock',
      header: 'Status',
      render: (value, record) => {
        const stockStatus = getStockStatus(Number(value), record.reorderLevel)
        return <Badge variant={stockStatus.variant}>{stockStatus.status}</Badge>
      }
    },
    {
      key: 'unit',
      header: 'Unit',
      sortable: true
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
            <DropdownMenuItem onClick={() => handleEditMedicine(record)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => handleDeleteMedicine(String(value))}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ], [handleDeleteMedicine, handleEditMedicine])

  // Supply columns for DataTable
  const supplyColumns: DataTableColumn<InventorySupply>[] = useMemo(() => [
    {
      key: 'displayName',
      header: 'Name',
      sortable: true,
      render: (value, record) => (
        <div>
          <div className="font-medium">{String(value)}</div>
          <div className="text-sm text-gray-500">{record.name}</div>
        </div>
      )
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      render: (value) => (
        <Badge variant="outline">{String(value)}</Badge>
      )
    },
    {
      key: 'stock',
      header: 'Stock',
      sortable: true,
      render: (value, record) => (
        <div className="flex items-center gap-2">
          <span>{String(value)}</span>
          {Number(value) <= record.reorderLevel && (
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          )}
        </div>
      )
    },
    {
      key: 'stock',
      header: 'Status',
      render: (value, record) => {
        const stockStatus = getStockStatus(Number(value), record.reorderLevel)
        return <Badge variant={stockStatus.variant}>{stockStatus.status}</Badge>
      }
    },
    {
      key: 'unit',
      header: 'Unit',
      sortable: true
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
            <DropdownMenuItem onClick={() => handleEditSupply(record)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => handleDeleteSupply(String(value))}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ], [handleDeleteSupply, handleEditSupply])

  // Filters for medicines
  const medicineFilters: DataTableFilter[] = useMemo(() => [
    {
      key: 'category',
      label: 'Category',
      options: [
        { value: 'Analgesics', label: 'Analgesics' },
        { value: 'Antibiotics', label: 'Antibiotics' },
        { value: 'Antihistamines', label: 'Antihistamines' },
        { value: 'Antispasmodics', label: 'Antispasmodics' },
        { value: 'Bronchodilators', label: 'Bronchodilators' },
        { value: 'Cardiovascular', label: 'Cardiovascular' },
        { value: 'Digestive', label: 'Digestive' },
        { value: 'Respiratory', label: 'Respiratory' },
        { value: 'Topical', label: 'Topical' },
        { value: 'Vitamins', label: 'Vitamins' },
        { value: 'Other', label: 'Other' }
      ]
    },
    {
      key: 'unit',
      label: 'Unit',
      options: [
        { value: 'pieces', label: 'Pieces' },
        { value: 'tablets', label: 'Tablets' },
        { value: 'capsules', label: 'Capsules' },
        { value: 'bottles', label: 'Bottles' },
        { value: 'boxes', label: 'Boxes' },
        { value: 'sachets', label: 'Sachets' },
        { value: 'vials', label: 'Vials' }
      ]
    }
  ], [])

  // Filters for supplies
  const supplyFilters: DataTableFilter[] = useMemo(() => [
    {
      key: 'category',
      label: 'Category',
      options: [
        { value: 'Protective Equipment', label: 'Protective Equipment' },
        { value: 'Bandages', label: 'Bandages' },
        { value: 'Instruments', label: 'Instruments' },
        { value: 'Consumables', label: 'Consumables' },
        { value: 'Emergency', label: 'Emergency' },
        { value: 'Diagnostic', label: 'Diagnostic' },
        { value: 'Cleaning', label: 'Cleaning' },
        { value: 'Topical', label: 'Topical' },
        { value: 'Other', label: 'Other' }
      ]
    },
    {
      key: 'unit',
      label: 'Unit',
      options: [
        { value: 'pieces', label: 'Pieces' },
        { value: 'pairs', label: 'Pairs' },
        { value: 'boxes', label: 'Boxes' },
        { value: 'bottles', label: 'Bottles' },
        { value: 'packs', label: 'Packs' },
        { value: 'rolls', label: 'Rolls' },
        { value: 'tubes', label: 'Tubes' },
        { value: 'kits', label: 'Kits' },
        { value: 'units', label: 'Units' }
      ]
    }
  ], [])

  return (
    <div className={className}>
      {/* View Toggle and Add Button */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          {/* Type Toggle */}
          <Select value={currentView} onValueChange={(value: 'medicines' | 'supplies') => setCurrentView(value)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="medicines">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Medicines ({medicines.length})
                </div>
              </SelectItem>
              <SelectItem value="supplies">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Supplies ({supplies.length})
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Add Button */}
        {currentView === 'medicines' ? (
          <Dialog open={medicineDialogOpen} onOpenChange={setMedicineDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Medicine
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingMedicine ? 'Edit Medicine' : 'Add New Medicine'}
                </DialogTitle>
                <DialogDescription>
                  {editingMedicine ? 'Update medicine information' : 'Enter medicine details to add to inventory'}
                </DialogDescription>
              </DialogHeader>
              <Form {...medicineForm}>
                <form onSubmit={medicineForm.handleSubmit(onSubmitMedicine)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={medicineForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Medicine Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., paracetamol_500mg" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={medicineForm.control}
                      name="displayName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Display Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Paracetamol 500mg" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={medicineForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter medicine description..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={medicineForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Analgesics">Analgesics</SelectItem>
                              <SelectItem value="Antibiotics">Antibiotics</SelectItem>
                              <SelectItem value="Antihistamines">Antihistamines</SelectItem>
                              <SelectItem value="Antispasmodics">Antispasmodics</SelectItem>
                              <SelectItem value="Bronchodilators">Bronchodilators</SelectItem>
                              <SelectItem value="Cardiovascular">Cardiovascular</SelectItem>
                              <SelectItem value="Digestive">Digestive</SelectItem>
                              <SelectItem value="Respiratory">Respiratory</SelectItem>
                              <SelectItem value="Topical">Topical</SelectItem>
                              <SelectItem value="Vitamins">Vitamins</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={medicineForm.control}
                      name="unit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select unit" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="pieces">Pieces</SelectItem>
                              <SelectItem value="tablets">Tablets</SelectItem>
                              <SelectItem value="capsules">Capsules</SelectItem>
                              <SelectItem value="bottles">Bottles</SelectItem>
                              <SelectItem value="boxes">Boxes</SelectItem>
                              <SelectItem value="sachets">Sachets</SelectItem>
                              <SelectItem value="vials">Vials</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={medicineForm.control}
                      name="stock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Stock *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              placeholder="0"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={medicineForm.control}
                      name="reorderLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reorder Level *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              placeholder="0"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={medicineForm.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price per Unit</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={medicineForm.control}
                      name="supplier"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Supplier</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter supplier name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={medicineForm.control}
                      name="expiryDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expiry Date</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              value={field.value ? field.value.toISOString().split('T')[0] : ''}
                              onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => {
                      setMedicineDialogOpen(false)
                      setEditingMedicine(null)
                      medicineForm.reset()
                    }}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingMedicine ? 'Update Medicine' : 'Add Medicine'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        ) : (
          <Dialog open={supplyDialogOpen} onOpenChange={setSupplyDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Supply
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingSupply ? 'Edit Supply' : 'Add New Supply'}
                </DialogTitle>
                <DialogDescription>
                  {editingSupply ? 'Update supply information' : 'Enter supply details to add to inventory'}
                </DialogDescription>
              </DialogHeader>
              <Form {...supplyForm}>
                <form onSubmit={supplyForm.handleSubmit(onSubmitSupply)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={supplyForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Supply Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., surgical_gloves" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={supplyForm.control}
                      name="displayName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Display Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Surgical Gloves" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={supplyForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter supply description..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={supplyForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Protective Equipment">Protective Equipment</SelectItem>
                              <SelectItem value="Bandages">Bandages</SelectItem>
                              <SelectItem value="Instruments">Instruments</SelectItem>
                              <SelectItem value="Consumables">Consumables</SelectItem>
                              <SelectItem value="Emergency">Emergency</SelectItem>
                              <SelectItem value="Diagnostic">Diagnostic</SelectItem>
                              <SelectItem value="Cleaning">Cleaning</SelectItem>
                              <SelectItem value="Topical">Topical</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={supplyForm.control}
                      name="unit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select unit" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="pieces">Pieces</SelectItem>
                              <SelectItem value="pairs">Pairs</SelectItem>
                              <SelectItem value="boxes">Boxes</SelectItem>
                              <SelectItem value="bottles">Bottles</SelectItem>
                              <SelectItem value="packs">Packs</SelectItem>
                              <SelectItem value="rolls">Rolls</SelectItem>
                              <SelectItem value="tubes">Tubes</SelectItem>
                              <SelectItem value="kits">Kits</SelectItem>
                              <SelectItem value="units">Units</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={supplyForm.control}
                      name="stock"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Stock *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              placeholder="0"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={supplyForm.control}
                      name="reorderLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reorder Level *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              placeholder="0"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={supplyForm.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price per Unit</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={supplyForm.control}
                      name="supplier"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Supplier</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter supplier name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={supplyForm.control}
                      name="expiryDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expiry Date</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              value={field.value ? field.value.toISOString().split('T')[0] : ''}
                              onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => {
                      setSupplyDialogOpen(false)
                      setEditingSupply(null)
                      supplyForm.reset()
                    }}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingSupply ? 'Update Supply' : 'Add Supply'}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* DataTable - conditionally render based on current view */}
      {currentView === 'medicines' ? (
        <DataTable
          data={medicines}
          columns={medicineColumns}
          filters={medicineFilters}
          searchPlaceholder="Search medicines by name or category..."
          loading={loading}
          onRefresh={handleRefreshMedicines}
          onExport={handleExportMedicines}
          emptyMessage="No medicines found"
          title="Medicine Inventory"
        />
      ) : (
        <DataTable
          data={supplies}
          columns={supplyColumns}
          filters={supplyFilters}
          searchPlaceholder="Search supplies by name or category..."
          loading={loading}
          onRefresh={handleRefreshSupplies}
          onExport={handleExportSupplies}
          emptyMessage="No supplies found"
          title="Supply Inventory"
        />
      )}

      {/* View Item Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {viewingItem && 'stock' in viewingItem ? 'Medicine Details' : 'Supply Details'}
            </DialogTitle>
          </DialogHeader>
          {viewingItem && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Name</Label>
                <p className="text-sm">{viewingItem.displayName}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Category</Label>
                <p className="text-sm">{viewingItem.category}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Stock</Label>
                  <p className="text-sm">{viewingItem.stock} {viewingItem.unit}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Reorder Level</Label>
                  <p className="text-sm">{viewingItem.reorderLevel} {viewingItem.unit}</p>
                </div>
              </div>
              {viewingItem.description && (
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm">{viewingItem.description}</p>
                </div>
              )}
              {viewingItem.supplier && (
                <div>
                  <Label className="text-sm font-medium">Supplier</Label>
                  <p className="text-sm">{viewingItem.supplier}</p>
                </div>
              )}
              {viewingItem.price && (
                <div>
                  <Label className="text-sm font-medium">Price per Unit</Label>
                  <p className="text-sm">₱{viewingItem.price.toFixed(2)}</p>
                </div>
              )}
              {viewingItem.expiryDate && (
                <div>
                  <Label className="text-sm font-medium">Expiry Date</Label>
                  <p className="text-sm">{new Date(viewingItem.expiryDate).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
})

InventoryTable.displayName = 'InventoryTable'

export default InventoryTable 