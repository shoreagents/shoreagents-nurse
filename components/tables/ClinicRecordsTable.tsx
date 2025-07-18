'use client'

import React, { useEffect, useState, useMemo, useCallback } from 'react'
import { format } from 'date-fns'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { DataTable, DataTableColumn, DataTableFilter } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { useToast } from '@/hooks/use-toast'
import { ClinicLog } from '@/lib/types'
import { clinicLogStorage, userStorage, activityStorage } from '@/lib/storage'
import { clinicLogFormSchema, type ClinicLogFormData } from '@/lib/validations'
import { Eye, Edit, Trash2, Calendar, User, Package, Users, FileText, UserCheck, Save, X, Plus, MoreHorizontal } from 'lucide-react'

// Medicine and Supply name mappings
const medicineNameMap: Record<string, string> = {
  'acetylcysteine_600mg': 'ACETYLCYSTEINE (600mg/SACHET) - FLUCYSTEINE 600',
  'advil': 'ADVIL',
  'ambroxol_hcl_30mg': 'AMBROXOL HCL 30mg - MUCOSOLVAN',
  'amlodipine_10mg': 'AMLODIPINE 10mg - RITEMED',
  'bactidol_lozenges': 'BACTIDOL LOZENGES',
  'betahistine_16mg': 'BETAHISTINE 16mg - SERC',
  'bioflu': 'BIOFLU',
  'biogesic': 'BIOGESIC',
  'buscopan_10mg': 'BUSCOPAN 10mg',
  'butamirate_citrate_50mg': 'BUTAMIRATE CITRATE 50mg - SINECOD FORTE',
  'catapres_75mcg': 'CATAPRES 75mcg',
  'celecoxib_200mg': 'CELECOXIB 200mg - RITEMED',
  'cetirizine_10mg': 'CETIRIZINE 10mg - VIRLIX',
  'cinnarizine_75mg': 'CINNARIZINE 75mg',
  'difflam': 'DIFFLAM',
  'domperidone_10mg': 'DOMPERIDONE 10mg - RITEMED',
  'gaviscon': 'GAVISCON (24 SACHETS/BOX)',
  'hidrasec': 'HIDRASEC',
  'kremil_s_advance': 'KREMIL-S ADVANCE',
  'loperamide_2mg': 'LOPERAMIDE 2mg - DIATABS',
  'loratadine_10mg': 'LORATADINE 10mg - ALLERTA',
  'losartan_potassium_50mg': 'LOSARTAN POTASSIUM 50mg - RITEMED',
  'mefenamic_acid_500mg': 'MEFENAMIC ACID 500mg - DOLFENAL',
  'metoclopramide_10mg': 'METOCLOPRAMIDE 10mg - PLASIL',
  'naproxen_sodium': 'NAPROXEN SODIUM - FLANAX',
  'neozep_z_non_drowsy': 'NEOZEP Z+ NON-DROWSY',
  'omeprazole_40mg': 'OMEPRAZOLE 40mg - RITEMED',
  'oral_rehydration_salts': 'ORAL REHYDRATION SALTS (APPLE FLAVOR) - HYDRITE',
  'salbutamol_nebule': 'SALBUTAMOL NEBULE (2.5ml) - HIVENT',
  'tranexamic_acid_500mg': 'TRANEXAMIC ACID 500mg - HEMOSTAN',
  'other_medicine': 'Other Medicine'
}

const supplyNameMap: Record<string, string> = {
  'arm_sling': 'ARM SLING',
  'band_aid_standard': 'BAND AID (STANDARD STRIPS-100pcs/BOX) - MEDIPLAST',
  'blood_pressure_apparatus': 'BLOOD PRESSURE APPARATUS (DESK TYPE) - INDOPLAS',
  'blood_pressure_cuff_large': 'BLOOD PRESSURE CUFF (LARGE)',
  'burn_ointment_15g': 'BURN OINTMENT 15g - UNITED HOME',
  'calamine_lotion_30ml': 'CALAMINE LOTION 30ml - CALADRYL',
  'calmoseptine_ointment': 'CALMOSEPTINE OINTMENT 3.5g',
  'cotton_balls': 'COTTON BALLS',
  'cotton_buds': 'COTTON BUDS',
  'digital_thermometer': 'DIGITAL THERMOMETER',
  'disposable_vinyl_gloves_medium': 'DISPOSABLE VINYL GLOVES (MEDIUM, 100PCS/BOX) - SURE-GUARD',
  'efficascent_oil_100ml': 'EFFICASCENT OIL 100ml',
  'elastic_bandage_2inch': 'ELASTIC BANDAGE 2"',
  'elastic_bandage_4inch': 'ELASTIC BANDAGE 4"',
  'face_mask_50pcs': 'FACE MASK 50PCS/BOX - RX DR. CARE',
  'hot_bag_electric': 'HOT BAG (ELECTRIC)',
  'hydrogen_peroxide_120ml': 'HYDROGEN PEROXIDE 120ml - AGUAPER',
  'ice_bag_size_9': 'ICE BAG (SIZE 9) - INMED',
  'infrared_thermometer': 'INFRARED THERMOMETER',
  'micropore_tape': 'MICROPORE TAPE',
  'mupirocin_ointment_15g': 'MUPIROCIN OINTMENT (15g/TUBE)',
  'nebulizer_kit': 'NEBULIZER KIT',
  'omega_pain_killer_120ml': 'OMEGA PAIN KILLER 120ml',
  'oxygen_mask': 'OXYGEN MASK',
  'oxygen_nasal_cannula': 'OXYGEN NASAL CANNULA',
  'paper_cups': 'PAPER CUPS',
  'povidine_iodine_120ml': 'POVIDINE IODINE 120ml - BETADINE',
  'salonpas_20_patches': 'SALONPAS (20 PATCHES)',
  'silver_sulfadiazine_cream_20g': 'SILVER SULFADIAZINE CREAM 20g - MAZINE',
  'sterile_gauze_4x4': 'STERILE GAUZE 4x4 - RX DR. CARE',
  'sterile_tongue_depressor_6inch': 'STERILE TONGUE DEPRESSOR 6" - RX DR. CARE',
  'tears_naturale_ii': 'TEARS NATURALE II - ALCON',
  'tobramycin_eye_drops_5ml': 'TOBRAMYCIN EYE DROPS 5ml - TOBREX',
  'tourniquet': 'TOURNIQUET',
  'triangular_bandage': 'TRIANGULAR BANDAGE',
  'white_flower_20ml': 'WHITE FLOWER 20ml',
  'other_supply': 'Other Supply'
}

// Utility function to get display name for medicine
const getMedicineDisplayName = (name: string): string => {
  return medicineNameMap[name] || name
}

// Utility function to get display name for supply
const getSupplyDisplayName = (name: string): string => {
  return supplyNameMap[name] || name
}

// Medicine options for editing
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

// Supply options for editing
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

interface ClinicRecordsTableProps {
  className?: string
}

const ClinicRecordsTable = React.memo(function ClinicRecordsTable({ className }: ClinicRecordsTableProps) {
  const { toast } = useToast()
  const [clinicLogs, setClinicLogs] = useState<ClinicLog[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<ClinicLog | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingRecord, setEditingRecord] = useState<ClinicLog | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  const editForm = useForm<ClinicLogFormData>({
    resolver: zodResolver(clinicLogFormSchema),
    defaultValues: {
      date: new Date(),
      lastName: '',
      firstName: '',
      sex: 'Male',
      employeeNumber: '',
      client: '',
      chiefComplaint: '',
      medicines: [],
      supplies: [],
      issuedBy: ''
    }
  })

  // Field arrays for medicines and supplies
  const { fields: medicineFields, append: appendMedicine, remove: removeMedicine } = useFieldArray({
    control: editForm.control,
    name: 'medicines'
  })

  const { fields: supplyFields, append: appendSupply, remove: removeSupply } = useFieldArray({
    control: editForm.control,
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

  // Load data lazily after component renders
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        // Small delay to allow UI to render first
        await new Promise(resolve => setTimeout(resolve, 10))
        const data = clinicLogStorage.getAll()
        setClinicLogs(data)
      } catch (error) {
        console.error('Error loading clinic logs:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleRefresh = async () => {
    setLoading(true)
    try {
      const data = clinicLogStorage.getAll()
      setClinicLogs(data)
      toast({
        title: 'Refreshed',
        description: 'Clinic records have been updated.',
        variant: 'default'
      })
    } catch (error) {
      console.error('Error refreshing data:', error)
      toast({
        title: 'Error',
        description: 'Failed to refresh data. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = useCallback(async (id: string) => {
    try {
      clinicLogStorage.delete(id)
      const updatedData = clinicLogStorage.getAll()
      setClinicLogs(updatedData)
      
      toast({
        title: 'Deleted',
        description: 'Clinic record has been deleted.',
        variant: 'default'
      })
    } catch (error) {
      console.error('Error deleting record:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete record. Please try again.',
        variant: 'destructive'
      })
    }
  }, [toast])

  const handleEditRecord = useCallback((record: ClinicLog) => {
    setEditingRecord(record)
    editForm.reset({
      date: new Date(record.date),
      lastName: record.lastName,
      firstName: record.firstName,
      sex: record.sex,
      employeeNumber: record.employeeNumber,
      client: record.client,
      chiefComplaint: record.chiefComplaint,
      medicines: record.medicines,
      supplies: record.supplies,
      issuedBy: record.issuedBy
    })
    setEditDialogOpen(true)
  }, [editForm])

  const handleSaveEdit = async (formData: ClinicLogFormData) => {
    if (!editingRecord) return

    setIsEditing(true)
    try {
      const updatedRecord: ClinicLog = {
        ...editingRecord,
        ...formData,
        updatedAt: new Date(),
        date: formData.date
      }

      clinicLogStorage.save(updatedRecord)
      const updatedData = clinicLogStorage.getAll()
      setClinicLogs(updatedData)

      // Log activity
      const currentUser = userStorage.getCurrentUser()
      if (currentUser) {
        activityStorage.add({
          type: 'clinic_log',
          title: 'Clinic Record Updated',
          description: `Clinic record updated for ${formData.firstName} ${formData.lastName}`,
          userId: currentUser.id,
          userName: currentUser.name,
          metadata: {
            clinicLogId: editingRecord.id,
            patient: `${formData.firstName} ${formData.lastName}`,
            employeeNumber: formData.employeeNumber
          }
        })
      }

      toast({
        title: 'Updated',
        description: 'Clinic record has been updated successfully.',
        variant: 'default'
      })

      setEditDialogOpen(false)
      setEditingRecord(null)
    } catch (error) {
      console.error('Error updating record:', error)
      toast({
        title: 'Error',
        description: 'Failed to update record. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsEditing(false)
    }
  }

  const handleExport = async () => {
    try {
      const csvHeaders = [
        'Date',
        'Last Name',
        'First Name',
        'Sex',
        'Employee Number',
        'Client',
        'Chief Complaint',
        'Medicines',
        'Supplies',
        'Issued By',
        'Created At'
      ]

      const csvData = clinicLogs.map(record => [
        format(new Date(record.date), 'yyyy-MM-dd'),
        record.lastName,
        record.firstName,
        record.sex,
        record.employeeNumber,
        record.client,
        record.chiefComplaint,
        record.medicines.map(m => `${getMedicineDisplayName(m.name)} (${m.quantity})`).join(', ') || 'None',
        record.supplies.map(s => `${getSupplyDisplayName(s.name)} (${s.quantity})`).join(', ') || 'None',
        record.issuedBy,
        format(new Date(record.createdAt), 'yyyy-MM-dd HH:mm:ss')
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
      link.setAttribute('download', `clinic-records-${format(new Date(), 'yyyy-MM-dd')}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: 'Exported',
        description: 'Clinic records have been exported to CSV.',
        variant: 'default'
      })
    } catch (error) {
      console.error('Error exporting data:', error)
      toast({
        title: 'Error',
        description: 'Failed to export data. Please try again.',
        variant: 'destructive'
      })
    }
  }

  const handleViewRecord = (record: ClinicLog) => {
    setSelectedRecord(record)
    setDialogOpen(true)
  }

  const columns: DataTableColumn<ClinicLog>[] = useMemo(() => [
    {
      key: 'date',
      header: 'Date',
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          {format(new Date(value as Date), 'MMM dd, yyyy')}
        </div>
      )
    },
    {
      key: 'lastName',
      header: 'Last Name',
      sortable: true,
      render: (value) => (
        <span className="font-medium">{String(value || '')}</span>
      )
    },
    {
      key: 'firstName',
      header: 'First Name',
      sortable: true,
      render: (value) => (
        <span className="font-medium">{String(value || '')}</span>
      )
    },
    {
      key: 'sex',
      header: 'Sex',
      sortable: true,
      render: (value) => (
        <Badge variant="outline">{String(value || '')}</Badge>
      )
    },
    {
      key: 'employeeNumber',
      header: 'Employee #',
      sortable: true,
      render: (value) => (
        <span className="font-mono text-sm">{String(value || '')}</span>
      )
    },
    {
      key: 'client',
      header: 'Client',
      sortable: true,
      render: (value) => (
        <span className="text-sm">{String(value || '')}</span>
      )
    },
    {
      key: 'chiefComplaint',
      header: 'Chief Complaint',
      sortable: true,
      render: (value) => (
        <span className="text-sm">{String(value || '').substring(0, 50)}{String(value || '').length > 50 ? '...' : ''}</span>
      )
    },
    {
      key: 'medicines',
      header: 'Medicines',
      sortable: false,
      render: (value, record) => (
        <div className="flex flex-col gap-1">
          {record.medicines.length > 0 ? (
            record.medicines.map((medicine, index) => (
              <div key={index} className="flex items-center gap-2">
                <Package className="w-3 h-3 text-blue-600" />
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {getMedicineDisplayName(medicine.name)}
                  </Badge>
                  <span className="text-xs font-medium text-blue-600">
                    Qty: {medicine.quantity}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <span className="text-xs text-muted-foreground">None</span>
          )}
        </div>
      )
    },
    {
      key: 'supplies',
      header: 'Supplies',
      sortable: false,
      render: (value, record) => (
        <div className="flex flex-col gap-1">
          {record.supplies.length > 0 ? (
            record.supplies.map((supply, index) => (
              <div key={index} className="flex items-center gap-2">
                <Package className="w-3 h-3 text-green-600" />
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {getSupplyDisplayName(supply.name)}
                  </Badge>
                  <span className="text-xs font-medium text-green-600">
                    Qty: {supply.quantity}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <span className="text-xs text-muted-foreground">None</span>
          )}
        </div>
      )
    },
    {
      key: 'issuedBy',
      header: 'Issued By',
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm">{String(value || '')}</span>
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
            <DropdownMenuItem onClick={() => handleViewRecord(record)}>
              <Eye className="w-4 h-4 mr-2" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEditRecord(record)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => handleDelete(String(value || ''))}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ], [handleDelete, handleEditRecord])

  const filters: DataTableFilter[] = useMemo(() => [
    {
      key: 'sex',
      label: 'Sex',
      options: [
        { value: 'Male', label: 'Male' },
        { value: 'Female', label: 'Female' }
      ]
    },
    {
      key: 'medicines',
      label: 'Medicines',
      options: Object.entries(medicineNameMap).map(([key, value]) => ({
        value: key,
        label: value
      }))
    },
    {
      key: 'supplies',
      label: 'Supplies',
      options: Object.entries(supplyNameMap).map(([key, value]) => ({
        value: key,
        label: value
      }))
    }
  ], [])

  return (
    <div className={className}>
      <DataTable
        data={clinicLogs}
        columns={columns}
        filters={filters}
        searchPlaceholder="Search by name, employee number, or medicine..."
        loading={loading}
        onRefresh={handleRefresh}
        onExport={handleExport}
        emptyMessage="No clinic records found"
        title="Clinic Medicines & Supplies Log"
      />

      {/* Record Detail Dialog using shadcn/ui Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Clinic Record Details</DialogTitle>
          </DialogHeader>
          
          {selectedRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date</label>
                  <p className="text-sm">{format(new Date(selectedRecord.date), 'MMMM dd, yyyy')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Employee Number</label>
                  <p className="text-sm font-mono">{selectedRecord.employeeNumber}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Name</label>
                  <p className="text-sm font-medium">{selectedRecord.lastName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">First Name</label>
                  <p className="text-sm font-medium">{selectedRecord.firstName}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Sex</label>
                  <p className="text-sm">{selectedRecord.sex}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Client</label>
                  <p className="text-sm">{selectedRecord.client}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Chief Complaint/Illness</label>
                <p className="text-sm mt-1 p-2 bg-muted rounded">{selectedRecord.chiefComplaint}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Medicines Issued</label>
                <div className="mt-1">
                  {selectedRecord.medicines.length > 0 ? (
                    <div className="space-y-1">
                      {selectedRecord.medicines.map((medicine, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-blue-50 rounded">
                          <Package className="w-4 h-4 text-blue-600" />
                          <span className="text-sm">{getMedicineDisplayName(medicine.name)}</span>
                          <Badge variant="secondary" className="text-xs">
                            Qty: {medicine.quantity}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No medicines issued</p>
                  )}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Supplies Issued</label>
                <div className="mt-1">
                  {selectedRecord.supplies.length > 0 ? (
                    <div className="space-y-1">
                      {selectedRecord.supplies.map((supply, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded">
                          <Package className="w-4 h-4 text-green-600" />
                          <span className="text-sm">{getSupplyDisplayName(supply.name)}</span>
                          <Badge variant="outline" className="text-xs">
                            Qty: {supply.quantity}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No supplies issued</p>
                  )}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Issued By</label>
                <p className="text-sm">{selectedRecord.issuedBy}</p>
              </div>
              
              <div className="text-xs text-muted-foreground">
                <label className="font-medium">Created</label>
                <p>{format(new Date(selectedRecord.createdAt), 'MMM dd, yyyy HH:mm')}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Record Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Clinic Record</DialogTitle>
          </DialogHeader>
          
          {editingRecord && (
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(handleSaveEdit)} className="space-y-4">
                {/* Date */}
                <FormField
                  control={editForm.control}
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
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
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
                    control={editForm.control}
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
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
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
                    control={editForm.control}
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
                  control={editForm.control}
                  name="client"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter client name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Chief Complaint */}
                <FormField
                  control={editForm.control}
                  name="chiefComplaint"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chief Complaint/Illness *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter chief complaint or illness"
                          {...field}
                          className="resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Medicines - Editable */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-blue-600" />
                      <FormLabel>Medicines Issued</FormLabel>
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
                          control={editForm.control}
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
                          control={editForm.control}
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

                {/* Supplies - Editable */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Package className="h-5 w-5 text-green-600" />
                      <FormLabel>Supplies Issued</FormLabel>
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
                          control={editForm.control}
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
                          control={editForm.control}
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
                  control={editForm.control}
                  name="issuedBy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issued By *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter name of issuer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Form Actions */}
                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setEditDialogOpen(false)}
                    disabled={isEditing}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isEditing}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isEditing ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
})

export { ClinicRecordsTable } 