'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { 
  clinicLogStorage, 
  activityStorage, 
  userStorage,
  inventoryMedicineStorage,
  inventorySupplyStorage,
  clientStorage,
  issuerStorage
} from '@/lib/storage'
import { clinicLogFormSchema } from '@/lib/validations'
import { ClinicLogFormData, MedicineItem, SupplyItem, InventoryMedicine, InventorySupply, Client, Issuer } from '@/lib/types'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { AlertTriangle, Package, Plus, Trash2, Calendar, User, MapPin, FileText, Pill } from 'lucide-react'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

const ClinicLogForm = React.memo(() => {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [medicines, setMedicines] = useState<InventoryMedicine[]>([])
  const [supplies, setSupplies] = useState<InventorySupply[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [issuers, setIssuers] = useState<Issuer[]>([])
  const [loading, setLoading] = useState(true)

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [medicineData, supplyData, clientData, issuerData] = await Promise.all([
          Promise.resolve(inventoryMedicineStorage.getActive()),
          Promise.resolve(inventorySupplyStorage.getActive()),
          Promise.resolve(clientStorage.getActive()),
          Promise.resolve(issuerStorage.getActive())
        ])
        setMedicines(medicineData)
        setSupplies(supplyData)
        setClients(clientData)
        setIssuers(issuerData)
      } catch (error) {
        console.error('Error loading data:', error)
        toast({
          title: 'Error',
          description: 'Failed to load form data',
          variant: 'destructive'
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [toast])

  // Helper function to get medicine display name
  const getMedicineDisplayName = (name: string): string => {
    const medicine = medicines.find(m => m.name === name)
    return medicine ? medicine.name : name
  }

  // Helper function to get supply display name
  const getSupplyDisplayName = (name: string): string => {
    const supply = supplies.find(s => s.name === name)
    return supply ? supply.name : name
  }

  // Helper function to get stock info
  const getMedicineStock = (name: string): { stock: number } => {
    const medicine = medicines.find(m => m.name === name)
    return medicine ? { stock: medicine.stock } : { stock: 0 }
  }

  const getSupplyStock = (name: string): { stock: number } => {
    const supply = supplies.find(s => s.name === name)
    return supply ? { stock: supply.stock } : { stock: 0 }
  }

  // Optimize form initialization - use useMemo to prevent re-computation
  const defaultValues = useMemo(() => ({
    date: new Date(),
    lastName: '',
    firstName: '',
    sex: 'Male' as const,
    employeeNumber: '',
    client: '',
    chiefComplaint: '',
    medicines: [] as MedicineItem[],
    supplies: [] as SupplyItem[],
    issuedBy: user?.name || ''
  }), [user])

  const form = useForm<ClinicLogFormData>({
    resolver: zodResolver(clinicLogFormSchema),
    defaultValues
  })

  const { handleSubmit, reset, formState: { errors }, control } = form

  // Field arrays for medicines and supplies
  const { fields: medicineFields, append: appendMedicine, remove: removeMedicine } = useFieldArray({
    control,
    name: 'medicines'
  })

  const { fields: supplyFields, append: appendSupply, remove: removeSupply } = useFieldArray({
    control,
    name: 'supplies'
  })

  // Add new medicine
  const addMedicine = () => {
    appendMedicine({ name: '', quantity: 1 })
  }

  // Add new supply
  const addSupply = () => {
    appendSupply({ name: '', quantity: 1 })
  }

  // Optimized save function - direct storage operation with stock deduction
  const saveClinicLog = async (data: ClinicLogFormData) => {
    const currentUser = userStorage.getCurrentUser()
    if (!currentUser) throw new Error('User not authenticated')

    // Check stock availability before saving
    for (const medicine of data.medicines) {
      const medicineStock = getMedicineStock(medicine.name)
      if (medicineStock.stock < medicine.quantity) {
        throw new Error(`Insufficient stock for ${getMedicineDisplayName(medicine.name)}. Available: ${medicineStock.stock}, Required: ${medicine.quantity}`)
      }
    }

    for (const supply of data.supplies) {
      const supplyStock = getSupplyStock(supply.name)
      if (supplyStock.stock < supply.quantity) {
        throw new Error(`Insufficient stock for ${getSupplyDisplayName(supply.name)}. Available: ${supplyStock.stock}, Required: ${supply.quantity}`)
      }
    }

    const newClinicLog = {
      ...data,
      id: '',
      nurseId: currentUser.id,
      nurseName: currentUser.name,
      status: 'active' as const,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    clinicLogStorage.save(newClinicLog)

    // Deduct stock for used medicines
    for (const medicine of data.medicines) {
      const inventoryMedicine = medicines.find(m => m.name === medicine.name)
      if (inventoryMedicine) {
        inventoryMedicineStorage.updateStock(
          inventoryMedicine.id.toString(),
          -medicine.quantity,
          `Used in clinic log for ${data.firstName} ${data.lastName}`,
          currentUser.id,
          currentUser.name
        )
      }
    }

    // Deduct stock for used supplies
    for (const supply of data.supplies) {
      const inventorySupply = supplies.find(s => s.name === supply.name)
      if (inventorySupply) {
        inventorySupplyStorage.updateStock(
          inventorySupply.id.toString(),
          -supply.quantity,
          `Used in clinic log for ${data.firstName} ${data.lastName}`,
          currentUser.id,
          currentUser.name
        )
      }
    }

    // Reload inventory after stock changes
    const [updatedMedicines, updatedSupplies] = await Promise.all([
      Promise.resolve(inventoryMedicineStorage.getActive()),
      Promise.resolve(inventorySupplyStorage.getActive())
    ])
    setMedicines(updatedMedicines)
    setSupplies(updatedSupplies)
    
    // Add activity log
    const medicinesList = data.medicines.map(m => `${getMedicineDisplayName(m.name)} (${m.quantity})`).join(', ')
    const suppliesList = data.supplies.map(s => `${getSupplyDisplayName(s.name)} (${s.quantity})`).join(', ')
    const itemsList = [medicinesList, suppliesList].filter(Boolean).join(', ')
    
    activityStorage.add({
      type: 'clinic_log',
      title: 'Clinic Log Created',
      description: `New clinic log for ${data.firstName} ${data.lastName} - ${itemsList || 'No items issued'}`,
      userId: currentUser.id,
      userName: currentUser.name,
      status: 'active'
    })

    return { success: true }
  }

  const onSubmit = async (data: ClinicLogFormData) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to submit a clinic log.',
        variant: 'destructive'
      })
      return
    }

    // Process medicines and supplies - handle custom names
    const processedMedicines = data.medicines.map(medicine => ({
      ...medicine,
      name: medicine.name === 'other_medicine' ? (medicine.customName || medicine.name) : medicine.name
    }))

    const processedSupplies = data.supplies.map(supply => ({
      ...supply,
      name: supply.name === 'other_supply' ? (supply.customName || supply.name) : supply.name
    }))

    const processedData = {
      ...data,
      medicines: processedMedicines,
      supplies: processedSupplies
    }

    setIsSubmitting(true)
    try {
      await saveClinicLog(processedData)
      
      toast({
        title: 'Success',
        description: 'Clinic log entry saved successfully.',
        variant: 'default'
      })
      
      // Reset form after successful submission
      reset(defaultValues)
    } catch (error) {
      console.error('Error saving clinic log:', error)
      toast({
        title: 'Error',
        description: 'Failed to save clinic log entry. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    reset(defaultValues)
    toast({
      title: 'Form Reset',
      description: 'All form fields have been cleared.',
      variant: 'default'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-6 w-6 text-blue-600" />
              Clinic Medicines and Supplies Log Form
            </CardTitle>
            <CardDescription>
              Log the medicines and supplies issued to patients during clinic visits.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <Form {...form}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Patient Information Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5 text-blue-600" />
                        Patient Information
                      </CardTitle>
                      <CardDescription>
                        Enter the patient's basic information and visit details.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Date */}
                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date *</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                {...field}
                                value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                                onChange={(e) => field.onChange(new Date(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Name Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter last name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name *</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter first name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Sex and Employee Number */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="sex"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sex *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select sex" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Male">Male</SelectItem>
                                  <SelectItem value="Female">Female</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="employeeNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Employee Number *</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter employee number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Client */}
                      <FormField
                        control={form.control}
                        name="client"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Client *</FormLabel>
                            <FormControl>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a client" />
                                </SelectTrigger>
                                <SelectContent>
                                  {clients.map((client) => (
                                    <SelectItem key={client.id} value={client.name}>
                                      {client.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Chief Complaint */}
                      <FormField
                        control={form.control}
                        name="chiefComplaint"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Chief Complaint/Illness *</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Enter chief complaint (Ex. Headache, Abdominal Pain, Cough, Colds)"
                                className="min-h-[80px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Issued By */}
                      <FormField
                        control={form.control}
                        name="issuedBy"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Issued By *</FormLabel>
                            <FormControl>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select an issuer" />
                                </SelectTrigger>
                                <SelectContent>
                                  {issuers.map((issuer) => (
                                    <SelectItem key={issuer.id} value={issuer.name}>
                                      {issuer.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Medicines Section */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Pill className="h-5 w-5 text-blue-600" />
                            Medicines
                          </CardTitle>
                          <CardDescription>
                            Add medicines issued to the patient.
                          </CardDescription>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addMedicine}
                          className="flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Add Medicine
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {medicineFields.map((field, index) => (
                        <div key={field.id} className="flex items-end gap-4 p-4 border rounded-lg bg-blue-50">
                          <div className="flex-1">
                            <FormField
                              control={control}
                              name={`medicines.${index}.name`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Medicine *</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select medicine" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="max-h-[200px] overflow-y-auto">
                                      {medicines.map((medicine: InventoryMedicine) => {
                                        const isOutOfStock = medicine.stock === 0
                                        const isLowStock = medicine.stock <= medicine.reorder_level
                                        return (
                                          <SelectItem 
                                            key={medicine.id} 
                                            value={medicine.name}
                                            disabled={isOutOfStock}
                                            className={isOutOfStock ? 'text-gray-400' : ''}
                                          >
                                            <div className="flex items-center justify-between w-full">
                                              <span>{medicine.name}</span>
                                              <div className="flex items-center gap-2 ml-2">
                                                <Badge 
                                                  variant={isOutOfStock ? 'destructive' : isLowStock ? 'secondary' : 'default'}
                                                  className="text-xs"
                                                >
                                                  {medicine.stock}
                                                </Badge>
                                                {isOutOfStock && (
                                                  <AlertTriangle className="h-3 w-3 text-red-500" />
                                                )}
                                              </div>
                                            </div>
                                          </SelectItem>
                                        )
                                      })}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="w-32">
                            <FormField
                              control={control}
                              name={`medicines.${index}.quantity`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Quantity *</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="1"
                                      step="1"
                                      placeholder="1"
                                      {...field}
                                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeMedicine(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Supplies Section */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-green-600" />
                            Supplies
                          </CardTitle>
                          <CardDescription>
                            Add supplies issued to the patient.
                          </CardDescription>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={addSupply}
                          className="flex items-center gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Add Supply
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {supplyFields.map((field, index) => (
                        <div key={field.id} className="flex items-end gap-4 p-4 border rounded-lg bg-green-50">
                          <div className="flex-1">
                            <FormField
                              control={control}
                              name={`supplies.${index}.name`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Supply *</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Select supply" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent className="max-h-[200px] overflow-y-auto">
                                      {supplies.map((supply: InventorySupply) => {
                                        const isOutOfStock = supply.stock === 0
                                        const isLowStock = supply.stock <= supply.reorder_level
                                        return (
                                          <SelectItem 
                                            key={supply.id} 
                                            value={supply.name}
                                            disabled={isOutOfStock}
                                            className={isOutOfStock ? 'text-gray-400' : ''}
                                          >
                                            <div className="flex items-center justify-between w-full">
                                              <span>{supply.name}</span>
                                              <div className="flex items-center gap-2 ml-2">
                                                <Badge 
                                                  variant={isOutOfStock ? 'destructive' : isLowStock ? 'secondary' : 'default'}
                                                  className="text-xs"
                                                >
                                                  {supply.stock}
                                                </Badge>
                                                {isOutOfStock && (
                                                  <AlertTriangle className="h-3 w-3 text-red-500" />
                                                )}
                                              </div>
                                            </div>
                                          </SelectItem>
                                        )
                                      })}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="w-32">
                            <FormField
                              control={control}
                              name={`supplies.${index}.quantity`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Quantity *</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      min="1"
                                      step="1"
                                      placeholder="1"
                                      {...field}
                                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeSupply(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-4 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleReset}
                      disabled={isSubmitting}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Reset
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      {isSubmitting ? 'Saving...' : 'Save Entry'}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
})

ClinicLogForm.displayName = 'ClinicLogForm'

export default ClinicLogForm 