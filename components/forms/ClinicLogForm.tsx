'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useToast } from '@/hooks/use-toast'
import { showSuccessToast, showErrorToast, showFormResetToast } from '@/lib/toast-utils'
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
import { ClinicLogFormData, MedicineItem, SupplyItem, InventoryMedicine, InventorySupply, Client, Issuer, Patient, InternalUser } from '@/lib/types'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Combobox } from '@/components/ui/combobox'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { AlertTriangle, Package, Plus, Trash2, Calendar, User, MapPin, FileText, Pill, X, ClipboardList } from 'lucide-react'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'





// Helper function to format dates
const formatDate = (date: Date | null | undefined): string => {
  if (!date) return ''
  return new Intl.DateTimeFormat('en-US', { 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  }).format(new Date(date))
}

const ClinicLogForm = React.memo(() => {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [medicines, setMedicines] = useState<InventoryMedicine[]>([])
  const [supplies, setSupplies] = useState<InventorySupply[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [issuers, setIssuers] = useState<Issuer[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [internalUsers, setInternalUsers] = useState<InternalUser[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [recordsSidebarOpen, setRecordsSidebarOpen] = useState(false)

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [medicineData, supplyData, clientData, issuerData, patientData, internalUsersData] = await Promise.all([
          Promise.resolve(inventoryMedicineStorage.getActive()),
          Promise.resolve(inventorySupplyStorage.getActive()),
          Promise.resolve(clientStorage.getActive()),
          Promise.resolve(issuerStorage.getActive()),
          fetch('/api/patients').then(res => res.json()).then(data => data.success ? data.data : []),
          fetch('/api/internal-users').then(res => res.json()).then(data => data.success ? data.data : [])
        ])
        setMedicines(medicineData)
        setSupplies(supplyData)
        setClients(clientData)
        setIssuers(issuerData)
        setPatients(patientData)
        setInternalUsers(internalUsersData)
      } catch (error) {
        console.error('Error loading data:', error)
        showErrorToast('Error', 'Failed to load form data')
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

  // Optimize form initialization - use useMemo to prevent re-computation
  const defaultValues = useMemo(() => ({
    patientDiagnose: '',
    additionalNotes: '',
    medicines: [] as MedicineItem[],
    supplies: [] as SupplyItem[],
    issuedBy: user?.name || ''
  }), [user])

  const form = useForm<ClinicLogFormData>({
    resolver: zodResolver(clinicLogFormSchema),
    defaultValues
  })

  const { handleSubmit, reset, formState: { errors }, control, watch } = form

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

    // Prepare data for API
    const clinicLogData = {
      patientId: selectedPatient?.id.toString() || '',
      patientDiagnose: data.patientDiagnose,
      additionalNotes: data.additionalNotes,
      issuedBy: data.issuedBy,
      medicines: data.medicines.map(medicine => {
        // Find the medicine in the inventory to get its ID
        const inventoryMedicine = medicines.find(m => m.name === medicine.name)
        return {
          inventory_item_id: inventoryMedicine?.id,
          name: medicine.name,
          quantity: medicine.quantity
        }
      }),
      supplies: data.supplies.map(supply => {
        // Find the supply in the inventory to get its ID
        const inventorySupply = supplies.find(s => s.name === supply.name)
        return {
          inventory_item_id: inventorySupply?.id,
          name: supply.name,
          quantity: supply.quantity
        }
      })
    }

    // Send to API
    const response = await fetch('/api/clinic-logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(clinicLogData)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to create clinic log')
    }

    const result = await response.json()

    // Reload inventory after stock changes
    const [updatedMedicines, updatedSupplies] = await Promise.all([
      Promise.resolve(inventoryMedicineStorage.getActive()),
      Promise.resolve(inventorySupplyStorage.getActive())
    ])
    setMedicines(updatedMedicines)
    setSupplies(updatedSupplies)

    return { success: true, data: result.data }
  }

  const onSubmit = async (data: ClinicLogFormData) => {
    if (!user) {
      showErrorToast('Error', 'You must be logged in to submit a clinic log.')
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
      
      showSuccessToast('Success', 'Clinic log entry saved successfully.')
      
      // Reset form after successful submission
      reset(defaultValues)
      setSelectedPatient(null)
    } catch (error) {
      console.error('Error saving clinic log:', error)
      showErrorToast('Error', 'Failed to save clinic log entry. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Check if form is valid for submission
  const formValues = watch()
  const isFormValid = () => {
    const formValues = form.getValues()
    const hasPatient = selectedPatient !== null
    const hasPatientDiagnose = formValues.patientDiagnose && formValues.patientDiagnose.trim().length > 0
    const hasIssuedBy = formValues.issuedBy && formValues.issuedBy.trim().length >= 2
    const hasMedicines = formValues.medicines && formValues.medicines.length > 0
    const hasSupplies = formValues.supplies && formValues.supplies.length > 0
    const hasItems = hasMedicines || hasSupplies
    
    return hasPatient && hasPatientDiagnose && hasIssuedBy && hasItems
  }

  const handleReset = () => {
    reset(defaultValues)
    setSelectedPatient(null)
    showFormResetToast()
  }

      return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold">Clinic Medicines & Supplies Log</h2>
          <p className="text-muted-foreground">
            Record patient symptoms, medicines, and supplies issued during clinic visits.
          </p>
        </div>
      </div>

              <div className="flex space-x-6 flex-1">
          <div className="flex-1 h-full">
          {/* Main Card Container */}
                     <Card className="p-6 bg-white h-full">
         <CardContent className="p-0 h-full">
          <Form {...form}>
                                                   <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 h-full flex flex-col">
                               {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
                 
                 {/* First Column - Patient Information */}
                 <div className="space-y-6">
                                       <Card className="bg-gray-50 border-green-200 h-full">
                                             <CardHeader>
                         <div className="space-y-2">
                           <CardTitle className="flex items-center gap-2">
                             <User className="h-5 w-5 text-blue-600" />
                             Diagnostic Information
                           </CardTitle>
                           <CardDescription>
                             Record patient symptoms, complaints, and diagnostic observations.
                           </CardDescription>
                         </div>
                       </CardHeader>
                                                                                       <CardContent className="space-y-4">

                           {/* Patient Feelings */}
                           <FormField
                             control={form.control}
                             name="patientDiagnose"
                             render={({ field }) => (
                               <FormItem>
                                 <FormLabel>What does the patient feel? *</FormLabel>
                                 <FormControl>
                                   <Textarea 
                                     placeholder="e.g., Headache, Abdominal Pain, Cough, Colds"
                                     className="h-[60px] resize-none"
                                     {...field}
                                   />
                                 </FormControl>
                                 <FormMessage />
                               </FormItem>
                             )}
                           />

                           {/* Additional Notes */}
                           <FormField
                             control={form.control}
                             name="additionalNotes"
                             render={({ field }) => (
                               <FormItem>
                                 <FormLabel>Additional Notes</FormLabel>
                                 <FormControl>
                                   <Textarea 
                                     placeholder="Enter any additional notes or observations..."
                                     className="h-[60px] resize-none"
                                     {...field}
                                   />
                                 </FormControl>
                               </FormItem>
                             )}
                           />
                       </CardContent>
                   </Card>
                 </div>

                                                     {/* Second Column - Patient ID Card */}
                   <div className="space-y-4 h-full">
                                          <Card className="overflow-hidden bg-gray-50 border-green-200 h-full">
                                               <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="space-y-2">
                              <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5 text-green-600" />
                                Patient Record
                              </CardTitle>
                              <CardDescription>
                                Patient identification and additional information.
                              </CardDescription>
                            </div>
                                                         <div className="w-72">
                               <Combobox
                                 options={patients.map((patient) => ({
                                   value: patient.id.toString(),
                                   label: patient.full_name
                                 }))}
                                 value={selectedPatient?.id.toString() || ''}
                                 onValueChange={(value) => {
                                   const patient = patients.find(p => p.id.toString() === value)
                                   setSelectedPatient(patient || null)
                                 }}
                                 placeholder="Select patient *"
                                 searchPlaceholder="Search patients..."
                                 emptyText="No patients found."
                               />
                             </div>
                          </div>
                        </CardHeader>
                      <CardContent className="p-0 h-full">
                                                 <div className="bg-white p-6 h-full">
                                                    <div className="space-y-4 h-full flex flex-col">
                            {/* First Row - Photo and Basic Info */}
                            <div className="flex items-start gap-6">
                              {/* Patient Photo */}
                              <div className="flex-shrink-0">
                                <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                                  <User className="h-8 w-8 text-gray-400" />
                                </div>
                              </div>
                              
                                                            {/* Patient Basic Info */}
                              <div className="flex-1">
                                 <div className="space-y-4">
                                   {/* First Row - 3 columns */}
                                   <div className="flex gap-4">
                                     <div className="w-[25%]">
                                       <label className="text-xs font-medium text-gray-600">Birthday</label>
                                       <div className="text-sm font-medium text-gray-900 mt-0">
                                         {selectedPatient?.birthday ? formatDate(selectedPatient.birthday) : <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>}
                                       </div>
                                     </div>
                                     <div className="w-[25%]">
                                       <label className="text-xs font-medium text-gray-600">Age</label>
                                       <div className="text-sm font-medium text-gray-900 mt-0">
                                         {selectedPatient?.age || <div className="h-4 bg-gray-200 rounded animate-pulse w-8"></div>}
                                       </div>
                                     </div>
                                     <div className="w-[50%]">
                                       <label className="text-xs font-medium text-gray-600">Employee ID</label>
                                       <div className="text-sm font-medium text-gray-900 mt-0">
                                         {selectedPatient?.employee_id || <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>}
                                       </div>
                                     </div>
                                   </div>
                                   
                                   {/* Second Row - 3 columns */}
                                   <div className="flex gap-4">
                                     <div className="w-[25%]">
                                       <label className="text-xs font-medium text-gray-600">Last Visited</label>
                                       <div className="text-sm font-medium text-gray-900 mt-0">
                                         {selectedPatient?.last_visited ? formatDate(selectedPatient.last_visited) : <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>}
                                       </div>
                                     </div>
                                     <div className="w-[25%]">
                                       <label className="text-xs font-medium text-gray-600">Gender</label>
                                       <div className="text-sm font-medium text-gray-900 mt-0">
                                         {selectedPatient?.gender || <div className="h-4 bg-gray-200 rounded animate-pulse w-12"></div>}
                                       </div>
                                     </div>
                                     <div className="w-[50%]">
                                       <label className="text-xs font-medium text-gray-600">Company</label>
                                       <div className="mt-0">
                                         {selectedPatient?.company ? (
                                           <Badge 
                                             variant={getCompanyBadgeStyle(selectedPatient.badge_color, selectedPatient.user_type).variant} 
                                             className="text-xs"
                                             style={getCompanyBadgeStyle(selectedPatient.badge_color, selectedPatient.user_type).style}
                                           >
                                             {selectedPatient.company}
                                           </Badge>
                                         ) : (
                                           <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                                         )}
                                       </div>
                                     </div>
                                   </div>
                                 </div>
                              </div>
                            </div>
                            
                            {/* Second Row - Medical Records */}
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <div className="flex-1">
                                <label className="text-xs font-medium text-gray-600">Medical History</label>
                                <div className="text-sm font-medium text-gray-900 mt-0">
                                  {selectedPatient?.medical_history || <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>}
                                </div>
                              </div>
                            </div>
 
                          </div>
                         </div>
                      </CardContent>
                    </Card>
                  </div>
               </div>

               {/* Additional Row */}
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
                                   {/* Medicines Section */}
                                                                                                                 <Card className="bg-gray-50 border-green-200 h-full">
                     <CardHeader>
                       <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <CardTitle className="flex items-center gap-2">
                              <Pill className="h-5 w-5 text-indigo-600" />
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
                   <CardContent className="space-y-4 h-full flex flex-col">
                     {loading ? (
                       <div className="text-center py-4">
                       </div>
                     ) : medicineFields.length === 0 ? (
                       <div className="flex-1 flex items-start justify-center pt-8">
                         <div className="text-center">
                           <div className="text-sm text-gray-500">No medicines added yet</div>
                         </div>
                       </div>
                     ) : (
                       medicineFields.map((field, index) => (
                          <div key={field.id} className="p-4 border rounded-lg bg-white space-y-3">
                            {/* Row 1: Medicine Selector and Quantity */}
                            <div className="flex items-center gap-4">
                              <div className="flex-1">
                                <FormField
                                  control={control}
                                  name={`medicines.${index}.name`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-xs font-medium text-gray-700">Name</FormLabel>
                                      <FormControl>
                                        <Combobox
                                          options={medicines
                                            .filter((medicine: InventoryMedicine) => {
                                              // Get all currently selected medicine names
                                              const selectedMedicineNames = form.watch('medicines').map(m => m.name).filter(Boolean)
                                              // Only show medicines that are not already selected (or this current field)
                                              return !selectedMedicineNames.includes(medicine.name) || medicine.name === field.value
                                            })
                                            .map((medicine: InventoryMedicine) => ({
                                              value: medicine.name,
                                              label: medicine.name,
                                              category: medicine.category_name,
                                              disabled: medicine.stock === 0
                                            }))}
                                          value={field.value}
                                          onValueChange={field.onChange}
                                          placeholder="Select medicine"
                                          searchPlaceholder="Search medicines..."
                                          emptyText="No medicines found."
                                        />
                                      </FormControl>
                                    </FormItem>
                                  )}
                                />
                              </div>
                               <div className="w-24">
                                <FormField
                                  control={control}
                                  name={`medicines.${index}.quantity`}
                                  render={({ field }) => {
                                    const selectedMedicine = medicines.find(m => m.name === form.watch(`medicines.${index}.name`))
                                    const maxStock = selectedMedicine?.stock || 0
                                    return (
                                      <FormItem>
                                        <FormLabel className="text-xs font-medium text-gray-700">Quantity</FormLabel>
                                        <FormControl>
                                          <Input
                                            type="number"
                                            min="1"
                                            max={maxStock}
                                            step="1"
                                            placeholder="1"
                                            className="h-10 text-sm"
                                            {...field}
                                            onChange={(e) => {
                                              const value = parseFloat(e.target.value) || 0
                                              const clampedValue = Math.min(value, maxStock)
                                              field.onChange(clampedValue)
                                            }}
                                          />
                                        </FormControl>
                                      </FormItem>
                                    )
                                  }}
                                />
                              </div>
                            </div>
                           
                            {/* Row 2: Selected Medicine Details */}
                            {(() => {
                              const fieldValue = form.watch(`medicines.${index}.name`)
                              if (!fieldValue) return null
                              
                              const selectedMedicine = medicines.find(m => m.name === fieldValue)
                              if (!selectedMedicine) return null
                              
                               return (
                                <div className="space-y-2">
                                  <div className="text-xs font-medium text-gray-700">Description</div>
                                  {selectedMedicine.description && (
                                    <div className="p-3 bg-white rounded-md border">
                                      <div className="text-sm text-gray-600">
                                        {selectedMedicine.description}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )
                            })()}
                           
                                                         {/* Row 3: Stock Info and Delete */}
                            {(() => {
                              const fieldValue = form.watch(`medicines.${index}.name`)
                              const selectedMedicine = medicines.find(m => m.name === fieldValue)
                              
                              return (
                                <div className="flex items-center justify-between">
                                  <div className="text-base font-medium text-gray-900">
                                    {selectedMedicine ? `${selectedMedicine.stock} in stock` : ''}
                                  </div>
                                  <Trash2 
                                    className="h-5 w-5 text-red-600 hover:text-red-700 cursor-pointer" 
                                    onClick={() => removeMedicine(index)}
                                  />
                                </div>
                              )
                            })()}
                          </div>
                        ))
                      )}
                   </CardContent>
                 </Card>

                                   {/* Supplies Section */}
                                                                                                                 <Card className="bg-gray-50 border-green-200 h-full">
                     <CardHeader>
                       <div className="flex items-center justify-between">
                          <div className="space-y-2">
                            <CardTitle className="flex items-center gap-2">
                              <Package className="h-5 w-5 text-emerald-600" />
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
                   <CardContent className="space-y-4 h-full flex flex-col">
                     {supplyFields.length === 0 ? (
                       <div className="flex-1 flex items-start justify-center pt-8">
                         <div className="text-center">
                                                           <div className="text-sm text-gray-500">No supplies added yet</div>
                         </div>
                       </div>
                     ) : (
                       supplyFields.map((field, index) => (
                       <div key={field.id} className="p-4 border rounded-lg bg-white space-y-3">
                         {/* Row 1: Supply Selector and Quantity */}
                         <div className="flex items-center gap-4">
                           <div className="flex-1">
                             <FormField
                               control={control}
                               name={`supplies.${index}.name`}
                               render={({ field }) => (
                                 <FormItem>
                                   <FormLabel className="text-xs font-medium text-gray-700">Name</FormLabel>
                                   <FormControl>
                                     <Combobox
                                       options={supplies
                                         .filter((supply: InventorySupply) => {
                                           // Get all currently selected supply names
                                           const selectedSupplyNames = form.watch('supplies').map(s => s.name).filter(Boolean)
                                           // Only show supplies that are not already selected (or this current field)
                                           return !selectedSupplyNames.includes(supply.name) || supply.name === field.value
                                         })
                                         .map((supply: InventorySupply) => ({
                                           value: supply.name,
                                           label: supply.name,
                                           category: supply.category_name,
                                           disabled: supply.stock === 0
                                         }))}
                                       value={field.value}
                                       onValueChange={field.onChange}
                                       placeholder="Select supply"
                                       searchPlaceholder="Search supplies..."
                                       emptyText="No supplies found."
                                     />
                                   </FormControl>
                                 </FormItem>
                               )}
                             />
                           </div>
                            <div className="w-24">
                             <FormField
                               control={control}
                               name={`supplies.${index}.quantity`}
                               render={({ field }) => {
                                 const selectedSupply = supplies.find(s => s.name === form.watch(`supplies.${index}.name`))
                                 const maxStock = selectedSupply?.stock || 0
                                 return (
                                   <FormItem>
                                     <FormLabel className="text-xs font-medium text-gray-700">Quantity</FormLabel>
                                     <FormControl>
                                       <Input
                                         type="number"
                                         min="1"
                                         max={maxStock}
                                         step="1"
                                         placeholder="1"
                                         className="h-10 text-sm"
                                         {...field}
                                         onChange={(e) => {
                                           const value = parseFloat(e.target.value) || 0
                                           const clampedValue = Math.min(value, maxStock)
                                           field.onChange(clampedValue)
                                         }}
                                       />
                                     </FormControl>
                                   </FormItem>
                                 )
                               }}
                             />
                           </div>
                         </div>
                        
                         {/* Row 2: Selected Supply Details */}
                         {(() => {
                           const fieldValue = form.watch(`supplies.${index}.name`)
                           if (!fieldValue) return null
                           
                           const selectedSupply = supplies.find(s => s.name === fieldValue)
                           if (!selectedSupply) return null
                           
                            return (
                             <div className="space-y-2">
                               <div className="text-xs font-medium text-gray-700">Description</div>
                               {selectedSupply.description && (
                                 <div className="p-3 bg-white rounded-md border">
                                   <div className="text-sm text-gray-600">
                                     {selectedSupply.description}
                                   </div>
                                   </div>
                               )}
                             </div>
                           )
                         })()}
                        
                                                      {/* Row 3: Stock Info and Delete */}
                         {(() => {
                           const fieldValue = form.watch(`supplies.${index}.name`)
                           const selectedSupply = supplies.find(s => s.name === fieldValue)
                           
                           return (
                             <div className="flex items-center justify-between">
                               <div className="text-base font-medium text-gray-900">
                                 {selectedSupply ? `${selectedSupply.stock} in stock` : ''}
                               </div>
                               <Trash2 
                                 className="h-5 w-5 text-red-600 hover:text-red-700 cursor-pointer" 
                                 onClick={() => removeSupply(index)}
                               />
                                                      </div>
                       )
                     })()}
                   </div>
                 ))
               )}
             </CardContent>
                 </Card>
               </div>

                                                                                                                       {/* Form Actions */}
                 <div className="flex items-center justify-between">
                  {/* Issued By - Left Side */}
                  <div className="flex-1 max-w-xs">
                    <FormField
                      control={form.control}
                      name="issuedBy"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Issued By *</FormLabel>
                          <FormControl>
                            <Combobox
                              options={internalUsers.map((internalUser) => ({
                                value: internalUser.full_name,
                                label: internalUser.full_name
                              }))}
                              value={field.value}
                              onValueChange={field.onChange}
                              placeholder="Select an issuer"
                              searchPlaceholder="Search internal users..."
                              emptyText="No internal users found."
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Action Buttons - Right Side */}
                  <div className="flex space-x-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={handleReset}
                      disabled={isSubmitting}
                      className="flex items-center gap-2"
                    >
                      <Calendar className="h-4 w-4" />
                      Reset
                    </Button>
                    <Button 
                      type="submit" 
                      size="sm"
                      disabled={isSubmitting || !isFormValid()}
                      className="flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      {isSubmitting ? 'Saving...' : 'Save Entry'}
                    </Button>
                  </div>
                </div>
             </form>
           </Form>
         </CardContent>
       </Card>
       </div>
       </div>

               {/* Patient Records Sidebar */}
        {recordsSidebarOpen && (
                    <Card className="w-96 h-full overflow-y-auto transition-all duration-300 ease-in-out flex-shrink-0">
           <CardHeader className="p-6 border-b">
             <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                 </div>
               <Button
                 variant="ghost"
                 size="sm"
                 onClick={() => setRecordsSidebarOpen(false)}
                 className="h-8 w-8 p-0"
               >
                 <X className="h-4 w-4" />
               </Button>
             </div>
             {selectedPatient && (
               <Card className="mt-3 bg-muted/50">
                 <CardContent className="p-3">
                   <p className="text-sm font-medium">
                     {selectedPatient.full_name}
                   </p>
                   <p className="text-xs text-muted-foreground">
                     Employee ID: {selectedPatient.employee_id}
                   </p>
                 </CardContent>
               </Card>
             )}
           </CardHeader>
           <CardContent className="p-6 space-y-4">
                            <div className="text-center py-12">
                 <div className="inline-flex p-4 bg-muted rounded-full mb-4">
                   <FileText className="h-8 w-8 text-muted-foreground" />
                 </div>
                 <h3 className="text-lg font-medium mb-2">No Records Found</h3>
               </div>
               
               <div className="border-t pt-6">
                 <h4 className="text-lg font-medium mb-2">Clinic Logs</h4>
                 <div className="text-center py-12">
                   <div className="inline-flex p-4 bg-muted rounded-full mb-4">
                     <FileText className="h-8 w-8 text-muted-foreground" />
                   </div>
                   <p className="text-lg font-medium mb-2">No Clinic Logs</p>
                 </div>
               </div>
           </CardContent>
         </Card>
       )}
     </div>
   )
})

ClinicLogForm.displayName = 'ClinicLogForm'

export default ClinicLogForm 