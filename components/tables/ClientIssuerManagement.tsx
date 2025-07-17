'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { clientStorage, issuerStorage } from '@/lib/storage'
import { Client, Issuer, ClientFormData, IssuerFormData } from '@/lib/types'

import { DataTable, DataTableColumn } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Users, UserCheck, Plus, Edit, Trash2, Eye, Building, MoreHorizontal } from 'lucide-react'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'

// Validation schemas
const clientSchema = z.object({
  name: z.string().min(1, 'Client name is required')
})

const issuerSchema = z.object({
  name: z.string().min(1, 'Issuer name is required')
})

interface ClientIssuerManagementProps {
  className?: string
}

const ClientIssuerManagement = React.memo(function ClientIssuerManagement({ className }: ClientIssuerManagementProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  
  // State for clients and issuers
  const [clients, setClients] = useState<Client[]>([])
  const [issuers, setIssuers] = useState<Issuer[]>([])
  const [loading, setLoading] = useState(true)
  
  // View toggle state
  const [currentView, setCurrentView] = useState<'clients' | 'issuers'>('clients')
  
  // Dialog states
  const [clientDialogOpen, setClientDialogOpen] = useState(false)
  const [issuerDialogOpen, setIssuerDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [editingIssuer, setEditingIssuer] = useState<Issuer | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [viewingItem, setViewingItem] = useState<(Client | Issuer) | null>(null)

  // Forms
  const clientForm = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: ''
    }
  })

  const issuerForm = useForm<IssuerFormData>({
    resolver: zodResolver(issuerSchema),
    defaultValues: {
      name: ''
    }
  })

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [clientData, issuerData] = await Promise.all([
          Promise.resolve(clientStorage.getAll()),
          Promise.resolve(issuerStorage.getAll())
        ])
        setClients(clientData)
        setIssuers(issuerData)
      } catch (error) {
        console.error('Error loading data:', error)
        toast({
          title: 'Error',
          description: 'Failed to load client and issuer data',
          variant: 'destructive'
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [toast])

  // Helper functions
  const refreshData = () => {
    setClients(clientStorage.getAll())
    setIssuers(issuerStorage.getAll())
  }

  // Client CRUD operations
  const handleSaveClient = async (data: ClientFormData) => {
    try {
      if (!user) throw new Error('User not authenticated')

      if (editingClient) {
        // Update existing client
        const updated = clientStorage.update(editingClient.id, data)
        if (updated) {
          toast({
            title: 'Success',
            description: 'Client updated successfully'
          })
          refreshData()
        }
      } else {
        // Create new client
        clientStorage.save({
          ...data,
          isActive: true,
          createdBy: user.id
        })
        toast({
          title: 'Success',
          description: 'Client added successfully'
        })
        refreshData()
      }

      setClientDialogOpen(false)
      setEditingClient(null)
      clientForm.reset()
    } catch (error) {
      console.error('Error saving client:', error)
      toast({
        title: 'Error',
        description: 'Failed to save client',
        variant: 'destructive'
      })
    }
  }

  const handleDeleteClient = (id: string) => {
    try {
      const success = clientStorage.delete(id)
      if (success) {
        toast({
          title: 'Success',
          description: 'Client deleted successfully'
        })
        refreshData()
      }
    } catch (error) {
      console.error('Error deleting client:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete client',
        variant: 'destructive'
      })
    }
  }

  // Issuer CRUD operations
  const handleSaveIssuer = async (data: IssuerFormData) => {
    try {
      if (!user) throw new Error('User not authenticated')

      if (editingIssuer) {
        // Update existing issuer
        const updated = issuerStorage.update(editingIssuer.id, data)
        if (updated) {
          toast({
            title: 'Success',
            description: 'Issuer updated successfully'
          })
          refreshData()
        }
      } else {
        // Create new issuer
        issuerStorage.save({
          ...data,
          isActive: true,
          createdBy: user.id
        })
        toast({
          title: 'Success',
          description: 'Issuer added successfully'
        })
        refreshData()
      }

      setIssuerDialogOpen(false)
      setEditingIssuer(null)
      issuerForm.reset()
    } catch (error) {
      console.error('Error saving issuer:', error)
      toast({
        title: 'Error',
        description: 'Failed to save issuer',
        variant: 'destructive'
      })
    }
  }

  const handleDeleteIssuer = (id: string) => {
    try {
      const success = issuerStorage.delete(id)
      if (success) {
        toast({
          title: 'Success',
          description: 'Issuer deleted successfully'
        })
        refreshData()
      }
    } catch (error) {
      console.error('Error deleting issuer:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete issuer',
        variant: 'destructive'
      })
    }
  }

  // Dialog handlers
  const handleEditClient = (client: Client) => {
    setEditingClient(client)
    clientForm.reset({
      name: client.name
    })
    setClientDialogOpen(true)
  }

  const handleEditIssuer = (issuer: Issuer) => {
    setEditingIssuer(issuer)
    issuerForm.reset({
      name: issuer.name
    })
    setIssuerDialogOpen(true)
  }

  const handleView = (item: Client | Issuer) => {
    setViewingItem(item)
    setViewDialogOpen(true)
  }

  const handleAddNew = () => {
    if (currentView === 'clients') {
      setEditingClient(null)
      clientForm.reset()
      setClientDialogOpen(true)
    } else {
      setEditingIssuer(null)
      issuerForm.reset()
      setIssuerDialogOpen(true)
    }
  }

  // Client columns
  const clientColumns: DataTableColumn<Client>[] = useMemo(() => [
    {
      key: 'name',
      header: 'Client Name',
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 text-gray-500" />
          <div className="font-medium">{String(value)}</div>
        </div>
      )
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (value) => (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      key: 'createdAt',
      header: 'Created Date',
      sortable: true,
      render: (value) => (
        <div className="text-sm text-gray-600">
          {value instanceof Date ? value.toLocaleDateString() : new Date(value as string).toLocaleDateString()}
        </div>
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
            <DropdownMenuItem onClick={() => handleEditClient(record)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => handleDeleteClient(String(value || ''))}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ], [])

  // Issuer columns
  const issuerColumns: DataTableColumn<Issuer>[] = useMemo(() => [
    {
      key: 'name',
      header: 'Issuer Name',
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <UserCheck className="h-4 w-4 text-gray-500" />
          <div className="font-medium">{String(value)}</div>
        </div>
      )
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (value) => (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      key: 'createdAt',
      header: 'Created Date',
      sortable: true,
      render: (value) => (
        <div className="text-sm text-gray-600">
          {value instanceof Date ? value.toLocaleDateString() : new Date(value as string).toLocaleDateString()}
        </div>
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
            <DropdownMenuItem onClick={() => handleEditIssuer(record)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => handleDeleteIssuer(String(value || ''))}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ], [])

  return (
    <div className={className}>
      {/* View Toggle and Add Button */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          {/* Type Toggle */}
          <Select value={currentView} onValueChange={(value: 'clients' | 'issuers') => setCurrentView(value)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="clients">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Clients ({clients.length})
                </div>
              </SelectItem>
              <SelectItem value="issuers">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  Issuers ({issuers.length})
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Add Button */}
        <Button onClick={handleAddNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {currentView === 'clients' ? 'Add Client' : 'Add Issuer'}
        </Button>
      </div>

      {/* Data Table */}
      {currentView === 'clients' ? (
        <DataTable
          columns={clientColumns}
          data={clients}
          loading={loading}
          searchPlaceholder="Search clients..."
          emptyMessage="No clients found. Add your first client to get started."
        />
      ) : (
        <DataTable
          columns={issuerColumns}
          data={issuers}
          loading={loading}
          searchPlaceholder="Search issuers..."
          emptyMessage="No issuers found. Add your first issuer to get started."
        />
      )}

      {/* Client Dialog */}
      <Dialog open={clientDialogOpen} onOpenChange={setClientDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingClient ? 'Edit Client' : 'Add New Client'}
            </DialogTitle>
            <DialogDescription>
              {editingClient ? 'Update client information.' : 'Add a new client to your database.'}
            </DialogDescription>
          </DialogHeader>

          <Form {...clientForm}>
            <form onSubmit={clientForm.handleSubmit(handleSaveClient)} className="space-y-4">
              <FormField
                control={clientForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter client name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setClientDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingClient ? 'Update Client' : 'Add Client'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Issuer Dialog */}
      <Dialog open={issuerDialogOpen} onOpenChange={setIssuerDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingIssuer ? 'Edit Issuer' : 'Add New Issuer'}
            </DialogTitle>
            <DialogDescription>
              {editingIssuer ? 'Update issuer information.' : 'Add a new issuer to your database.'}
            </DialogDescription>
          </DialogHeader>

          <Form {...issuerForm}>
            <form onSubmit={issuerForm.handleSubmit(handleSaveIssuer)} className="space-y-4">
              <FormField
                control={issuerForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issuer Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter issuer name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIssuerDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingIssuer ? 'Update Issuer' : 'Add Issuer'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {viewingItem && 'name' in viewingItem ? 'Client Details' : 'Issuer Details'}
            </DialogTitle>
          </DialogHeader>

          {viewingItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Name</Label>
                  <p className="mt-1">{viewingItem.name}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Type</Label>
                  <p className="mt-1">{currentView === 'clients' ? 'Client' : 'Issuer'}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <p className="mt-1">
                    <Badge variant={viewingItem.isActive ? 'default' : 'secondary'}>
                      {viewingItem.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium text-gray-500">Created</Label>
                  <p className="mt-1">{viewingItem.createdAt.toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
})

export default ClientIssuerManagement 