'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { InventorySupply, MedicalCategory, MedicalSupplier } from '@/lib/types'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
import { showItemUpdatedToast, showItemAddedToast, showSaveErrorToast } from '@/lib/toast-utils'
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

// Validation schema - updated to match database fields
const supplySchema = z.object({
  name: z.string().min(1, 'Supply name is required'),
  description: z.string().optional(),
  category_id: z.number().optional(),
  stock: z.number().min(0, 'Stock must be non-negative').optional(),
  reorder_level: z.number().min(0, 'Reorder level must be non-negative').optional(),
  price: z.number().min(0, 'Price per unit must be non-negative').optional(),
  supplier_id: z.number().optional()
})

interface InventorySupplyFormProps {
  onSuccess: () => void
  trigger?: React.ReactNode
  editingSupply?: InventorySupply | null
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

export function InventorySupplyForm({ onSuccess, trigger, editingSupply }: InventorySupplyFormProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [categories, setCategories] = React.useState<MedicalCategory[]>([])
  const [suppliers, setSuppliers] = React.useState<MedicalSupplier[]>([])
  const [loading, setLoading] = React.useState(false)

  const form = useForm<z.infer<typeof supplySchema>>({
    resolver: zodResolver(supplySchema),
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

  // Load categories and suppliers when dialog opens
  React.useEffect(() => {
    if (dialogOpen) {
      loadCategories()
      loadSuppliers()
    }
  }, [dialogOpen])

  // Set form values when editing
  React.useEffect(() => {
    if (editingSupply && dialogOpen) {
      form.reset({
        name: editingSupply.name,
        description: editingSupply.description || '',
        category_id: editingSupply.category_id,
        stock: editingSupply.stock,
        reorder_level: editingSupply.reorder_level,
        price: editingSupply.price,
        supplier_id: editingSupply.supplier_id
      })
    } else if (dialogOpen) {
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
  }, [form, editingSupply, dialogOpen])

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/inventory/categories?type=supply')
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

  const onSubmit = async (data: z.infer<typeof supplySchema>) => {
    if (loading) return // Prevent double submission
    
    try {
      setLoading(true)
      
      if (editingSupply) {
        // Update existing supply
        const response = await fetch(`/api/inventory/supplies?id=${editingSupply.id}`, {
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
          throw new Error('Failed to update supply')
        }
        
        showItemUpdatedToast(data.name, "supply")
      } else {
        // Add new supply
        const response = await fetch('/api/inventory/supplies', {
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
          throw new Error('Failed to add supply')
        }
        
        showItemAddedToast(data.name, "supply")
      }
      
      setDialogOpen(false)
      form.reset()
      onSuccess()
    } catch (error) {
      console.error('Error saving supply:', error)
      showSaveErrorToast("supply")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {editingSupply ? 'Edit Supply' : 'Add Supply'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl [&>button]:hidden">
        <DialogHeader>
          <DialogTitle>
            {editingSupply ? 'Edit Supply' : 'Add New Supply'}
          </DialogTitle>
          <DialogDescription>
            {editingSupply ? 'Update supply details' : 'Enter supply details to add to inventory'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              {/* Supply Name - Full width */}
              <div className="md:col-span-3">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Supply Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Surgical Gloves Size M" {...field} />
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
                          placeholder="e.g., Disposable latex gloves, powder-free, sterile packaging"
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
                      <FormLabel>Category</FormLabel>
                      <Select 
                        value={field.value?.toString() || ""} 
                        onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <CustomSelectContent>
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
                      <FormLabel>Supplier</FormLabel>
                      <Select 
                        value={field.value?.toString() || ""} 
                        onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select supplier" />
                          </SelectTrigger>
                        </FormControl>
                        <CustomSelectContent>
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
                        placeholder="e.g., 50"
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
                        placeholder="e.g., 10"
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
                      <FormLabel>Price per Unit</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">₱</span>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="e.g., 12.75"
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
                onClick={() => setDialogOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : (editingSupply ? 'Update Supply' : 'Add Supply')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 