'use client'

import React, { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'
import { reimbursementFormSchema, type ReimbursementFormData } from '@/lib/validations'
import { useAuth } from '@/hooks/useAuth'
import { reimbursementStorage, userStorage, activityStorage } from '@/lib/storage'
import type { Reimbursement } from '@/lib/types'
import { Banknote, Save, RotateCcw } from 'lucide-react'

const ReimbursementForm = React.memo(() => {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Optimize form initialization - use useMemo to prevent re-computation
  const defaultValues = useMemo(() => ({
    date: new Date().toISOString().split('T')[0],
    employeeId: '',
    fullNameEmployee: '',
    fullNameDependent: '',
    workLocation: 'Office' as 'Office' | 'WFH',
    receiptDate: '',
    amountRequested: 0,
    email: user?.email || '',
  }), [user?.email])

  const form = useForm<ReimbursementFormData>({
    resolver: zodResolver(reimbursementFormSchema),
    defaultValues
  })

  const { handleSubmit, reset, formState: { errors } } = form

  // Save reimbursement data
  const saveReimbursement = async (reimbursementData: Omit<Reimbursement, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newReimbursement: Reimbursement = {
        ...reimbursementData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      reimbursementStorage.save(newReimbursement)

      // Log activity
      const currentUser = userStorage.getCurrentUser()
      if (currentUser) {
        const activity = {
          type: 'reimbursement' as const,
          title: 'Reimbursement Request Submitted',
          description: `Medicine reimbursement request submitted for ₱${reimbursementData.amountRequested.toFixed(2)}`,
          userId: currentUser.id,
          userName: currentUser.name,
          metadata: {
            reimbursementId: newReimbursement.id,
            amount: reimbursementData.amountRequested,
            workLocation: reimbursementData.workLocation
          }
        }
        activityStorage.add(activity)
      }

      return newReimbursement
    } catch (error) {
      console.error('Error saving reimbursement:', error)
      throw error
    }
  }

  const onSubmit = async (data: ReimbursementFormData) => {
    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to submit a reimbursement request.',
        variant: 'destructive'
      })
      return
    }

    setIsSubmitting(true)

    try {
      await saveReimbursement({
        ...data,
        status: 'pending'
      })

      toast({
        title: 'Success',
        description: `Your reimbursement request for ₱${data.amountRequested.toFixed(2)} has been submitted successfully.`,
        variant: 'default'
      })

      // Reset form after successful submission
      reset(defaultValues)

    } catch (error) {
      console.error('Submit error:', error)
      toast({
        title: 'Error',
        description: 'There was an error submitting your reimbursement request. Please try again.',
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
              <Banknote className="h-6 w-6 text-blue-600" />
              Medicine Reimbursement Form
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
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Employee ID and Full Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="employeeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employee ID *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter employee ID" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="fullNameEmployee"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name of Employee *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Dependent Name */}
                <FormField
                  control={form.control}
                  name="fullNameDependent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name of Enrolled Dependent</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter dependent name (if applicable)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Work Location and Receipt Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="workLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Work Location *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select work location" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Office">Office</SelectItem>
                            <SelectItem value="WFH">WFH (Work From Home)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="receiptDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date on Receipt *</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Amount and Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="amountRequested"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount Requested *</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₱</span>
                            <Input
                              type="number"
                              min="1"
                              step="1"
                              placeholder="1"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              className="pl-8"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter email address"
                            {...field}
                          />
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
                    {isSubmitting ? 'Submitting...' : 'Submit Request'}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
})

ReimbursementForm.displayName = 'ReimbursementForm'

export default ReimbursementForm 