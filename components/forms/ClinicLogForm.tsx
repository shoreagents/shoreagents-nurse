'use client'

import React, { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
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
import { Calendar, Save, RotateCcw, FileText } from 'lucide-react'

// Common medicines and supplies for dropdown
const medicineSupplies = [
  { value: 'biogesic', label: 'Biogesic (Paracetamol)' },
  { value: 'advil', label: 'Advil (Ibuprofen)' },
  { value: 'salonpas', label: 'Salonpas (Pain Relief Patch)' },
  { value: 'paracetamol', label: 'Paracetamol' },
  { value: 'ibuprofen', label: 'Ibuprofen' },
  { value: 'aspirin', label: 'Aspirin' },
  { value: 'amoxicillin', label: 'Amoxicillin' },
  { value: 'cefalexin', label: 'Cefalexin' },
  { value: 'loperamide', label: 'Loperamide' },
  { value: 'omeprazole', label: 'Omeprazole' },
  { value: 'bandages', label: 'Bandages' },
  { value: 'gauze', label: 'Gauze' },
  { value: 'cotton', label: 'Cotton' },
  { value: 'alcohol', label: 'Alcohol' },
  { value: 'betadine', label: 'Betadine' },
  { value: 'hydrogen_peroxide', label: 'Hydrogen Peroxide' },
  { value: 'thermometer', label: 'Thermometer' },
  { value: 'blood_pressure_monitor', label: 'Blood Pressure Monitor' },
  { value: 'syringes', label: 'Syringes' },
  { value: 'masks', label: 'Face Masks' },
  { value: 'gloves', label: 'Medical Gloves' },
  { value: 'other', label: 'Other' }
]

// Common chief complaints
const chiefComplaints = [
  { value: 'headache', label: 'Headache' },
  { value: 'abdominal_pain', label: 'Abdominal Pain' },
  { value: 'cough', label: 'Cough' },
  { value: 'colds', label: 'Colds' },
  { value: 'fever', label: 'Fever' },
  { value: 'dizziness', label: 'Dizziness' },
  { value: 'back_pain', label: 'Back Pain' },
  { value: 'muscle_pain', label: 'Muscle Pain' },
  { value: 'chest_pain', label: 'Chest Pain' },
  { value: 'nausea', label: 'Nausea' },
  { value: 'fatigue', label: 'Fatigue' },
  { value: 'cut_wound', label: 'Cut/Wound' },
  { value: 'burn', label: 'Burn' },
  { value: 'sprain', label: 'Sprain' },
  { value: 'hypertension', label: 'Hypertension' },
  { value: 'diabetes', label: 'Diabetes' },
  { value: 'other', label: 'Other' }
]

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
    medicineIssued: '',
    quantity: 1,
    issuedBy: user?.name || ''
  }), [user])

  const form = useForm<ClinicLogFormData>({
    resolver: zodResolver(clinicLogFormSchema),
    defaultValues
  })

  const { handleSubmit, reset, formState: { errors } } = form

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
    activityStorage.add({
      type: 'clinic_log',
      title: 'Clinic Log Created',
      description: `New clinic log for ${data.firstName} ${data.lastName} - ${data.medicineIssued}`,
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

    setIsSubmitting(true)
    try {
      await saveClinicLog(data)
      
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

                {/* Medicine/Supplies Issued */}
                <FormField
                  control={form.control}
                  name="medicineIssued"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medicine/Supplies Issued *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select medicine/supplies (Ex. Biogesic, Advil, Salonpas)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {medicineSupplies.map((medicine) => (
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

                {/* Quantity and Issued By */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity *</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            min="0.01"
                            step="0.01"
                            placeholder="Enter quantity"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
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
                </div>

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