'use client'

import React, { useState, useMemo } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'
import { clinicLogFormSchema, type ClinicLogFormData } from '@/lib/validations'
import { useAuth } from '@/hooks/useAuth'
import { clinicLogStorage, userStorage, activityStorage } from '@/lib/storage'
import { Calendar, Save, RotateCcw, FileText, Plus, Trash2, Pill, Package } from 'lucide-react'

// Medicine items
const medicines = [
  { value: 'acetylcysteine_600mg', label: 'ACETYLCYSTEINE (600mg/SACHET) - FLUCYSTEINE 600' },
  { value: 'advil', label: 'ADVIL' },
  { value: 'ambroxol_hcl_30mg', label: 'AMBROXOL HCL 30mg - MUCOSOLVAN' },
  { value: 'amlodipine_10mg', label: 'AMLODIPINE 10mg - RITEMED' },
  { value: 'bactidol_lozenges', label: 'BACTIDOL LOZENGES' },
  { value: 'betahistine_16mg', label: 'BETAHISTINE 16mg - SERC' },
  { value: 'bioflu', label: 'BIOFLU' },
  { value: 'biogesic', label: 'BIOGESIC' },
  { value: 'buscopan_10mg', label: 'BUSCOPAN 10mg' },
  { value: 'butamirate_citrate_50mg', label: 'BUTAMIRATE CITRATE 50mg - SINECOD FORTE' },
  { value: 'catapres_75mcg', label: 'CATAPRES 75mcg' },
  { value: 'celecoxib_200mg', label: 'CELECOXIB 200mg - RITEMED' },
  { value: 'cetirizine_10mg', label: 'CETIRIZINE 10mg - VIRLIX' },
  { value: 'cinnarizine_75mg', label: 'CINNARIZINE 75mg' },
  { value: 'difflam', label: 'DIFFLAM' },
  { value: 'domperidone_10mg', label: 'DOMPERIDONE 10mg - RITEMED' },
  { value: 'gaviscon', label: 'GAVISCON (24 SACHETS/BOX)' },
  { value: 'hidrasec', label: 'HIDRASEC' },
  { value: 'kremil_s_advance', label: 'KREMIL-S ADVANCE' },
  { value: 'loperamide_2mg', label: 'LOPERAMIDE 2mg - DIATABS' },
  { value: 'loratadine_10mg', label: 'LORATADINE 10mg - ALLERTA' },
  { value: 'losartan_potassium_50mg', label: 'LOSARTAN POTASSIUM 50mg - RITEMED' },
  { value: 'mefenamic_acid_500mg', label: 'MEFENAMIC ACID 500mg - DOLFENAL' },
  { value: 'metoclopramide_10mg', label: 'METOCLOPRAMIDE 10mg - PLASIL' },
  { value: 'naproxen_sodium', label: 'NAPROXEN SODIUM - FLANAX' },
  { value: 'neozep_z_non_drowsy', label: 'NEOZEP Z+ NON-DROWSY' },
  { value: 'omeprazole_40mg', label: 'OMEPRAZOLE 40mg - RITEMED' },
  { value: 'oral_rehydration_salts', label: 'ORAL REHYDRATION SALTS (APPLE FLAVOR) - HYDRITE' },
  { value: 'salbutamol_nebule', label: 'SALBUTAMOL NEBULE (2.5ml) - HIVENT' },
  { value: 'tranexamic_acid_500mg', label: 'TRANEXAMIC ACID 500mg - HEMOSTAN' },
  { value: 'other_medicine', label: 'Other Medicine (Enter Custom)' }
]

// Supply items
const supplies = [
  { value: 'arm_sling', label: 'ARM SLING' },
  { value: 'band_aid_standard', label: 'BAND AID (STANDARD STRIPS-100pcs/BOX) - MEDIPLAST' },
  { value: 'blood_pressure_apparatus', label: 'BLOOD PRESSURE APPARATUS (DESK TYPE) - INDOPLAS' },
  { value: 'blood_pressure_cuff_large', label: 'BLOOD PRESSURE CUFF (LARGE)' },
  { value: 'burn_ointment_15g', label: 'BURN OINTMENT 15g - UNITED HOME' },
  { value: 'calamine_lotion_30ml', label: 'CALAMINE LOTION 30ml - CALADRYL' },
  { value: 'calmoseptine_ointment', label: 'CALMOSEPTINE OINTMENT 3.5g' },
  { value: 'cotton_balls', label: 'COTTON BALLS' },
  { value: 'cotton_buds', label: 'COTTON BUDS' },
  { value: 'digital_thermometer', label: 'DIGITAL THERMOMETER' },
  { value: 'disposable_vinyl_gloves_medium', label: 'DISPOSABLE VINYL GLOVES (MEDIUM, 100PCS/BOX) - SURE-GUARD' },
  { value: 'efficascent_oil_100ml', label: 'EFFICASCENT OIL 100ml' },
  { value: 'elastic_bandage_2inch', label: 'ELASTIC BANDAGE 2"' },
  { value: 'elastic_bandage_4inch', label: 'ELASTIC BANDAGE 4"' },
  { value: 'face_mask_50pcs', label: 'FACE MASK 50PCS/BOX - RX DR. CARE' },
  { value: 'hot_bag_electric', label: 'HOT BAG (ELECTRIC)' },
  { value: 'hydrogen_peroxide_120ml', label: 'HYDROGEN PEROXIDE 120ml - AGUAPER' },
  { value: 'ice_bag_size_9', label: 'ICE BAG (SIZE 9) - INMED' },
  { value: 'infrared_thermometer', label: 'INFRARED THERMOMETER' },
  { value: 'micropore_tape', label: 'MICROPORE TAPE' },
  { value: 'mupirocin_ointment_15g', label: 'MUPIROCIN OINTMENT (15g/TUBE)' },
  { value: 'nebulizer_kit', label: 'NEBULIZER KIT' },
  { value: 'omega_pain_killer_120ml', label: 'OMEGA PAIN KILLER 120ml' },
  { value: 'oxygen_mask', label: 'OXYGEN MASK' },
  { value: 'oxygen_nasal_cannula', label: 'OXYGEN NASAL CANNULA' },
  { value: 'paper_cups', label: 'PAPER CUPS' },
  { value: 'povidine_iodine_120ml', label: 'POVIDINE IODINE 120ml - BETADINE' },
  { value: 'salonpas_20_patches', label: 'SALONPAS (20 PATCHES)' },
  { value: 'silver_sulfadiazine_cream_20g', label: 'SILVER SULFADIAZINE CREAM 20g - MAZINE' },
  { value: 'sterile_gauze_4x4', label: 'STERILE GAUZE 4x4 - RX DR. CARE' },
  { value: 'sterile_tongue_depressor_6inch', label: 'STERILE TONGUE DEPRESSOR 6" - RX DR. CARE' },
  { value: 'tears_naturale_ii', label: 'TEARS NATURALE II - ALCON' },
  { value: 'tobramycin_eye_drops_5ml', label: 'TOBRAMYCIN EYE DROPS 5ml - TOBREX' },
  { value: 'tourniquet', label: 'TOURNIQUET' },
  { value: 'triangular_bandage', label: 'TRIANGULAR BANDAGE' },
  { value: 'white_flower_20ml', label: 'WHITE FLOWER 20ml' },
  { value: 'other_supply', label: 'Other Supply (Enter Custom)' }
]

// Utility functions to get display names
const getMedicineDisplayName = (name: string): string => {
  const medicine = medicines.find(m => m.value === name)
  return medicine ? medicine.label : name
}

const getSupplyDisplayName = (name: string): string => {
  const supply = supplies.find(s => s.value === name)
  return supply ? supply.label : name
}

interface MedicineItem {
  name: string
  customName?: string
  quantity: number
}

interface SupplyItem {
  name: string
  customName?: string
  quantity: number
}

export default function ClinicLogForm() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  // Optimized save function - direct storage operation
  const saveClinicLog = async (data: ClinicLogFormData) => {
    const currentUser = userStorage.getCurrentUser()
    if (!currentUser) throw new Error('User not authenticated')

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
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                        <Input placeholder="Enter client/company name" {...field} />
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

                {/* Medicines Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Pill className="h-5 w-5 text-blue-600" />
                      <h3 className="text-lg font-semibold">Medicines</h3>
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
                                  {medicines.map((medicine) => (
                                    <SelectItem key={medicine.value} value={medicine.value}>
                                      {medicine.label}
                                    </SelectItem>
                                  ))}
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
                </div>

                {/* Supplies Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-green-600" />
                      <h3 className="text-lg font-semibold">Supplies</h3>
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
                                  {supplies.map((supply) => (
                                    <SelectItem key={supply.value} value={supply.value}>
                                      {supply.label}
                                    </SelectItem>
                                  ))}
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
                </div>

                {/* Issued By */}
                <FormField
                  control={form.control}
                  name="issuedBy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issued By *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex. Nurse Ron / Thirdy" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleReset}
                    disabled={isSubmitting}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSubmitting ? 'Saving...' : 'Save Entry'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 