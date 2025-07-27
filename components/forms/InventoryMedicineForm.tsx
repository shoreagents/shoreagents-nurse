'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { InventoryMedicine, MedicalCategory, MedicalSupplier } from '@/lib/types'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import * as SelectPrimitive from "@radix-ui/react-select"
import { cn } from '@/lib/utils'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Plus } from 'lucide-react'
import { CategoryManagementModal } from '@/components/ui/category-management-modal'
import { SupplierManagementModal } from '@/components/ui/supplier-management-modal'
import { SelectSeparator } from '@/components/ui/select'

// Validation schema - updated to match database fields
const medicineSchema = z.object({
  name: z.string().min(1, 'Medicine name is required'),
  description: z.string().optional(),
  category_id: z.number().nullable().optional(),
  stock: z.number().min(0, 'Stock must be non-negative').optional(),
  reorder_level: z.number().min(0, 'Reorder level must be non-negative').optional(),
  price: z.number().min(0, 'Price per unit must be non-negative').optional(),
  supplier_id: z.number().nullable().optional()
})

interface InventoryMedicineFormProps {
  onSuccess: () => void
  trigger?: React.ReactNode
  editingMedicine?: InventoryMedicine | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

// Custom SelectContent without scroll arrows
const CustomSelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-[40vh] min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectPrimitive.Viewport
        className={cn(
          "p-1 max-h-[40vh] overflow-y-scroll",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgb(156 163 175) rgb(243 244 246)',
          scrollbarGutter: 'stable'
        }}
      >
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
CustomSelectContent.displayName = "CustomSelectContent"

export function InventoryMedicineForm({ onSuccess, trigger, editingMedicine, open, onOpenChange }: InventoryMedicineFormProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [categories, setCategories] = React.useState<MedicalCategory[]>([])
  const [suppliers, setSuppliers] = React.useState<MedicalSupplier[]>([])
  const [loading, setLoading] = React.useState(false)

  // Use external dialog control if provided, otherwise use internal state
  const isDialogOpen = open !== undefined ? open : dialogOpen
  const setIsDialogOpen = onOpenChange || setDialogOpen

  const form = useForm<z.infer<typeof medicineSchema>>({
    resolver: zodResolver(medicineSchema),
    defaultValues: {
      name: '',
      description: '',
      category_id: undefined,
      stock: undefined,
      reorder_level: undefined,
      price: undefined,
      supplier_id: undefined
    }
  })

  // Watch required fields to enable/disable submit button
  const watchedFields = form.watch(['name', 'stock', 'reorder_level', 'category_id', 'supplier_id'])
  const isFormValid = watchedFields[0] && 
                     watchedFields[1] !== undefined && 
                     watchedFields[2] !== undefined &&
                     watchedFields[3] !== undefined &&
                     watchedFields[4] !== undefined

  // Load categories and suppliers when dialog opens
  React.useEffect(() => {
    if (isDialogOpen) {
      loadCategories()
      loadSuppliers()
    }
  }, [isDialogOpen])

  // Set form values when editing
  React.useEffect(() => {
    if (editingMedicine && isDialogOpen) {
      form.reset({
        name: editingMedicine.name,
        description: editingMedicine.description || '',
        category_id: editingMedicine.category_id,
        stock: editingMedicine.stock,
        reorder_level: editingMedicine.reorder_level,
        price: editingMedicine.price,
        supplier_id: editingMedicine.supplier_id
      })
    } else if (isDialogOpen) {
      // Add mode - reset to empty form
      form.reset({
        name: '',
        description: '',
        category_id: undefined,
        stock: undefined,
        reorder_level: undefined,
        price: undefined,
        supplier_id: undefined
      })
    }
  }, [form, editingMedicine, isDialogOpen])

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/inventory/categories?type=Medicine')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      } else {
        console.error('Failed to load categories')
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const loadSuppliers = async () => {
    try {
      const response = await fetch('/api/inventory/suppliers')
      if (response.ok) {
        const data = await response.json()
        setSuppliers(data)
      }
    } catch (error) {
      console.error('Error loading suppliers:', error)
    }
  }

  const handleCategoriesChange = async () => {
    await loadCategories()
    // Reset category selection if the current category no longer exists
    const currentCategoryId = form.getValues('category_id')
    if (currentCategoryId && !categories.find(c => c.id === currentCategoryId)) {
      form.setValue('category_id', null)
    }
  }

  const handleSuppliersChange = async () => {
    await loadSuppliers()
    // Reset supplier selection if the current supplier no longer exists
    const currentSupplierId = form.getValues('supplier_id')
    if (currentSupplierId && !suppliers.find(s => s.id === currentSupplierId)) {
      form.setValue('supplier_id', null)
    }
  }

  const onSubmit = async (data: z.infer<typeof medicineSchema>) => {
    if (loading) return // Prevent double submission
    
    try {
      setLoading(true)
      
      if (editingMedicine) {
        // Update existing medicine
        const response = await fetch(`/api/inventory/medicines?id=${editingMedicine.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...data,
            stock: data.stock || 0,
            reorder_level: data.reorder_level || 10,
            userId: user?.id || 'system',
            userName: user?.name || 'System'
          }),
        })
        
        if (!response.ok) {
          throw new Error('Failed to update medicine')
        }
        
        toast({
          title: "Medicine Updated",
          description: `${data.name} has been updated successfully.`,
          variant: "success",
        })
      } else {
        // Add new medicine
        const response = await fetch('/api/inventory/medicines', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...data,
            stock: data.stock || 0,
            reorder_level: data.reorder_level || 10,
            userId: user?.id || 'system',
            userName: user?.name || 'System'
          }),
        })
        
        if (!response.ok) {
          throw new Error('Failed to add medicine')
        }
        
        toast({
          title: "Medicine Added",
          description: `${data.name} has been added to inventory.`,
          variant: "success",
        })
      }
      
      setIsDialogOpen(false)
      form.reset()
      onSuccess()
    } catch (error) {
      console.error('Error saving medicine:', error)
      toast({
        title: "Error",
        description: "Failed to save medicine. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      {trigger && (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      )}
      <DialogContent className="max-w-2xl [&>button]:hidden">
        <DialogHeader>
          <DialogTitle>
            {editingMedicine ? 'Edit Medicine' : 'Add New Medicine'}
          </DialogTitle>
          <DialogDescription>
            {editingMedicine ? 'Update medicine details' : 'Enter medicine details to add to inventory'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Medicine Name - Full width */}
              <div className="md:col-span-3">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medicine Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Paracetamol 500mg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Description - Full width */}
              <div className="md:col-span-3">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., Pain reliever and fever reducer, store in cool dry place"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

            </div>

            {/* Category and Supplier - 50/50 flex */}
            <div className="flex gap-4">
              <div className="flex-1">
                <FormField
                  control={form.control}
                  name="category_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select 
                        value={field.value === null ? "none" : (field.value ? field.value.toString() : "")} 
                        onValueChange={(value) => field.onChange(value === "none" ? null : (value ? parseInt(value) : undefined))}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Category">
                              {field.value === null ? "None" : (field.value ? categories.find(c => c.id === field.value)?.name : undefined)}
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <CustomSelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                          {categories.length === 0 && (
                            <SelectItem value="no-categories" disabled>
                              No categories available
                            </SelectItem>
                          )}
                          <SelectSeparator className="my-2" />
                          <div className="px-2 py-1.5">
                            <CategoryManagementModal
                              type="Medicine"
                              onCategoriesChange={handleCategoriesChange}
                              trigger={
                                <button className="w-full text-left text-sm px-2 py-1.5 hover:bg-accent hover:text-accent-foreground rounded-sm relative">
                                  Manage Categories
                                </button>
                              }
                            />
                          </div>
                        </CustomSelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex-1">
                <FormField
                  control={form.control}
                  name="supplier_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supplier *</FormLabel>
                      <Select 
                        value={field.value === null ? "none" : (field.value ? field.value.toString() : "")} 
                        onValueChange={(value) => field.onChange(value === "none" ? null : (value ? parseInt(value) : undefined))}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Supplier">
                              {field.value === null ? "None" : (field.value ? suppliers.find(s => s.id === field.value)?.name : undefined)}
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <CustomSelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {suppliers.map((supplier) => (
                            <SelectItem key={supplier.id} value={supplier.id.toString()}>
                              {supplier.name}
                            </SelectItem>
                          ))}
                          {suppliers.length === 0 && (
                            <SelectItem value="no-suppliers" disabled>
                              No suppliers available
                            </SelectItem>
                          )}
                          <SelectSeparator className="my-2" />
                          <div className="px-2 py-1.5">
                            <SupplierManagementModal
                              onSuppliersChange={handleSuppliersChange}
                              trigger={
                                <button className="w-full text-left text-sm px-2 py-1.5 hover:bg-accent hover:text-accent-foreground rounded-sm relative">
                                  Manage Suppliers
                                </button>
                              }
                            />
                          </div>
                        </CustomSelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Stock, Reorder Level, and Price per Unit - Same row */}
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Stock *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 100"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reorder_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reorder Level *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 20"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                                      <FormItem>
                      <FormLabel>Price (Per Item)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">₱</span>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="e.g., 25.50"
                            className="pl-8"
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                )}
              />
            </div>

            {/* Buttons with top spacing */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !isFormValid}>
                {loading ? 'Saving...' : (editingMedicine ? 'Update Medicine' : 'Add Medicine')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 
