import React, { useState, useEffect } from 'react'
import { NextPage } from 'next'
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


import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertTriangle, Package, Plus, Edit, Trash2, Search, Filter, Eye } from 'lucide-react'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

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

// Medicine categories
const medicineCategories = [
  'Analgesics',
  'Antibiotics',
  'Antihistamines',
  'Antispasmodics',
  'Bronchodilators',
  'Cardiovascular',
  'Digestive',
  'Respiratory',
  'Topical',
  'Vitamins',
  'Other'
]

// Supply categories
const supplyCategories = [
  'Bandages',
  'Instruments',
  'Protective Equipment',
  'Consumables',
  'Emergency',
  'Diagnostic',
  'Cleaning',
  'Other'
]

const InventoryPage: NextPage = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const [medicines, setMedicines] = useState<InventoryMedicine[]>([])
  const [supplies, setSupplies] = useState<InventorySupply[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isAddMedicineOpen, setIsAddMedicineOpen] = useState(false)
  const [isAddSupplyOpen, setIsAddSupplyOpen] = useState(false)

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
      supplier: ''
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
      supplier: ''
    }
  })

  // Load inventory data
  useEffect(() => {
    const loadInventory = async () => {
      setLoading(true)
      try {
        const [medicineData, supplyData] = await Promise.all([
          inventoryMedicineStorage.getAll(),
          inventorySupplyStorage.getAll()
        ])
        setMedicines(medicineData)
        setSupplies(supplyData)
      } catch (error) {
        console.error('Error loading inventory:', error)
        toast({
          title: 'Error',
          description: 'Failed to load inventory data',
          variant: 'destructive'
        })
      } finally {
        setLoading(false)
      }
    }

    loadInventory()
  }, [toast])

  // Add new medicine
  const onSubmitMedicine = async (data: z.infer<typeof medicineSchema>) => {
    if (!user) return

    try {
      const newMedicine: InventoryMedicine = {
        ...data,
        id: '',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      inventoryMedicineStorage.save(newMedicine)
      
      // Record initial stock transaction
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

      toast({
        title: 'Success',
        description: 'Medicine added to inventory successfully'
      })

      setMedicines(inventoryMedicineStorage.getAll())
      medicineForm.reset()
      setIsAddMedicineOpen(false)
    } catch (error) {
      console.error('Error adding medicine:', error)
      toast({
        title: 'Error',
        description: 'Failed to add medicine to inventory',
        variant: 'destructive'
      })
    }
  }

  // Add new supply
  const onSubmitSupply = async (data: z.infer<typeof supplySchema>) => {
    if (!user) return

    try {
      const newSupply: InventorySupply = {
        ...data,
        id: '',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      inventorySupplyStorage.save(newSupply)
      
      // Record initial stock transaction
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

      toast({
        title: 'Success',
        description: 'Supply added to inventory successfully'
      })

      setSupplies(inventorySupplyStorage.getAll())
      supplyForm.reset()
      setIsAddSupplyOpen(false)
    } catch (error) {
      console.error('Error adding supply:', error)
      toast({
        title: 'Error',
        description: 'Failed to add supply to inventory',
        variant: 'destructive'
      })
    }
  }

  // Filter medicines based on search and category
  const filteredMedicines = medicines.filter(medicine => {
    const matchesSearch = medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         medicine.displayName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || medicine.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Filter supplies based on search and category
  const filteredSupplies = supplies.filter(supply => {
    const matchesSearch = supply.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supply.displayName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || supply.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getStockStatus = (stock: number, reorderLevel: number) => {
    if (stock === 0) return { status: 'Out of Stock', variant: 'destructive' as const }
    if (stock <= reorderLevel) return { status: 'Low Stock', variant: 'secondary' as const }
    return { status: 'In Stock', variant: 'default' as const }
  }

  return (
    <div className="w-full min-h-screen px-8 py-6">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 mt-1">Manage medicines and supplies inventory with stock tracking</p>
        </div>
        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-1 gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search medicines or supplies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {[...medicineCategories, ...supplyCategories].map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Inventory Tabs */}
        <Tabs defaultValue="medicines" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="medicines">Medicines ({medicines.length})</TabsTrigger>
            <TabsTrigger value="supplies">Supplies ({supplies.length})</TabsTrigger>
          </TabsList>

          {/* Medicines Tab */}
          <TabsContent value="medicines" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Medicine Inventory</h3>
              <Dialog open={isAddMedicineOpen} onOpenChange={setIsAddMedicineOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Medicine
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Medicine</DialogTitle>
                    <DialogDescription>
                      Add a new medicine to your inventory with stock information
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
                                <Input placeholder="acetylcysteine_600mg" {...field} />
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
                                <Input placeholder="ACETYLCYSTEINE (600mg/SACHET)" {...field} />
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
                              <Textarea placeholder="Additional information about the medicine..." {...field} />
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
                                  {medicineCategories.map(category => (
                                    <SelectItem key={category} value={category}>
                                      {category}
                                    </SelectItem>
                                  ))}
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
                              <FormControl>
                                <Input placeholder="tablets, ml, sachets" {...field} />
                              </FormControl>
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
                              <FormLabel>Initial Stock *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
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
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
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
                              <FormLabel>Price (₱)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={medicineForm.control}
                        name="supplier"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Supplier</FormLabel>
                            <FormControl>
                              <Input placeholder="Supplier name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsAddMedicineOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">Add Medicine</Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Medicines Table */}
            <div className="bg-white rounded-lg border shadow-sm">
              <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medicine</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMedicines.map((medicine) => {
                      const stockStatus = getStockStatus(medicine.stock, medicine.reorderLevel)
                      return (
                        <TableRow key={medicine.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{medicine.displayName}</div>
                              <div className="text-sm text-gray-500">{medicine.name}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{medicine.category}</Badge>
                          </TableCell>
                          <TableCell>{medicine.stock}</TableCell>
                          <TableCell>{medicine.unit}</TableCell>
                          <TableCell>
                            <Badge variant={stockStatus.variant}>
                              {stockStatus.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {medicine.price ? `₱${medicine.price.toFixed(2)}` : '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
          </TabsContent>

          {/* Supplies Tab */}
          <TabsContent value="supplies" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Supply Inventory</h3>
              <Dialog open={isAddSupplyOpen} onOpenChange={setIsAddSupplyOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Supply
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Supply</DialogTitle>
                    <DialogDescription>
                      Add a new supply item to your inventory with stock information
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
                                <Input placeholder="arm_sling" {...field} />
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
                                <Input placeholder="ARM SLING" {...field} />
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
                              <Textarea placeholder="Additional information about the supply..." {...field} />
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
                                  {supplyCategories.map(category => (
                                    <SelectItem key={category} value={category}>
                                      {category}
                                    </SelectItem>
                                  ))}
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
                              <FormControl>
                                <Input placeholder="pieces, boxes, meters" {...field} />
                              </FormControl>
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
                              <FormLabel>Initial Stock *</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
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
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
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
                              <FormLabel>Price (₱)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={supplyForm.control}
                        name="supplier"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Supplier</FormLabel>
                            <FormControl>
                              <Input placeholder="Supplier name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsAddSupplyOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit">Add Supply</Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Supplies Table */}
            <div className="bg-white rounded-lg border shadow-sm">
              <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Supply</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Stock</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSupplies.map((supply) => {
                      const stockStatus = getStockStatus(supply.stock, supply.reorderLevel)
                      return (
                        <TableRow key={supply.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{supply.displayName}</div>
                              <div className="text-sm text-gray-500">{supply.name}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{supply.category}</Badge>
                          </TableCell>
                          <TableCell>{supply.stock}</TableCell>
                          <TableCell>{supply.unit}</TableCell>
                          <TableCell>
                            <Badge variant={stockStatus.variant}>
                              {stockStatus.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {supply.price ? `₱${supply.price.toFixed(2)}` : '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default InventoryPage 