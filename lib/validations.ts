import { z } from 'zod'

// Base validation schemas
export const emailSchema = z.string().email("Invalid email address")
export const passwordSchema = z.string().min(8, "Password must be at least 8 characters")
export const phoneSchema = z.string().regex(/^\+?[\d\s-()]+$/, "Invalid phone number format")
export const dateSchema = z.date({
  required_error: "Date is required",
  invalid_type_error: "Invalid date format"
})

// Authentication schemas
export const loginSchema = z.object({
  email: z.string().min(1, "Email is required"),
  password: z.string().min(1, "Password is required")
})

export const userSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must not exceed 100 characters"),
  email: emailSchema,
  role: z.enum(['nurse', 'admin', 'staff'], {
    required_error: "Role is required"
  }),
  nurseId: z.string().optional(),
  department: z.string().optional(),
  avatar: z.string().url().optional(),
  isActive: z.boolean().default(true),
  createdAt: dateSchema.optional(),
  updatedAt: dateSchema.optional()
})

// Clinic Log validation schemas
const medicineItemSchema = z.object({
  name: z.string().min(1, "Medicine name is required"),
  customName: z.string().optional(),
  quantity: z.number()
    .min(0.01, "Quantity must be greater than 0")
    .max(10000, "Quantity must not exceed 10,000")
})

const supplyItemSchema = z.object({
  name: z.string().min(1, "Supply name is required"),
  customName: z.string().optional(),
  quantity: z.number()
    .min(0.01, "Quantity must be greater than 0")
    .max(10000, "Quantity must not exceed 10,000")
})

const clinicLogFormBaseSchema = z.object({
  date: dateSchema.refine((date) => date <= new Date(), {
    message: "Date cannot be in the future"
  }),
  lastName: z.string()
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must not exceed 50 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Last name can only contain letters, spaces, apostrophes, and hyphens"),
  firstName: z.string()
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must not exceed 50 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "First name can only contain letters, spaces, apostrophes, and hyphens"),
  sex: z.enum(['Male', 'Female'], {
    required_error: "Sex is required"
  }),
  employeeNumber: z.string()
    .min(3, "Employee number must be at least 3 characters")
    .max(20, "Employee number must not exceed 20 characters")
    .regex(/^[A-Z0-9-]+$/, "Employee number can only contain uppercase letters, numbers, and hyphens"),
  client: z.string()
    .min(2, "Client must be at least 2 characters")
    .max(100, "Client must not exceed 100 characters"),
  chiefComplaint: z.string()
    .min(3, "Chief complaint must be at least 3 characters")
    .max(200, "Chief complaint must not exceed 200 characters"),
  medicines: z.array(medicineItemSchema).optional().default([]),
  supplies: z.array(supplyItemSchema).optional().default([]),
  issuedBy: z.string()
    .min(2, "Issued by must be at least 2 characters")
    .max(100, "Issued by must not exceed 100 characters")
})

export const clinicLogFormSchema = clinicLogFormBaseSchema.refine((data) => {
  return data.medicines && data.medicines.length > 0 || data.supplies && data.supplies.length > 0
}, {
  message: "At least one medicine or supply must be added",
  path: ["medicines"]
})

export const clinicLogSchema = clinicLogFormBaseSchema.extend({
  id: z.string().uuid(),
  nurseId: z.string().uuid(),
  nurseName: z.string().min(2, "Nurse name is required"),
  createdAt: dateSchema,
  updatedAt: dateSchema,
  status: z.enum(['active', 'archived']).default('active')
})

// Reimbursement validation schemas
export const reimbursementFormSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  employeeId: z.string().min(1, 'Employee ID is required'),
  fullNameEmployee: z.string().min(1, 'Full name of employee is required'),
  fullNameDependent: z.string().optional(),
  workLocation: z.enum(['Office', 'WFH'], {
    required_error: 'Work location is required'
  }),
  receiptDate: z.string().min(1, 'Receipt date is required'),
  amountRequested: z.number().min(0.01, 'Amount must be greater than 0'),
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
})

export const reimbursementSchema = reimbursementFormSchema.extend({
  id: z.string().uuid(),
  status: z.enum(['pending', 'approved', 'rejected']).default('pending'),
  createdAt: z.string(),
  updatedAt: z.string()
})

// Search and filter schemas
export const searchSchema = z.object({
  searchTerm: z.string().max(100, "Search term must not exceed 100 characters").optional(),
  dateRange: z.object({
    from: dateSchema,
    to: dateSchema
  }).optional().refine((data) => {
    if (data) {
      return data.from <= data.to
    }
    return true
  }, {
    message: "Start date must be before or equal to end date",
    path: ["to"]
  }),
  status: z.string().optional(),
  medicineType: z.string().optional(),
  supplier: z.string().optional()
})

export const paginationSchema = z.object({
  currentPage: z.number().min(1, "Page must be at least 1").default(1),
  itemsPerPage: z.number().min(5, "Items per page must be at least 5").max(100, "Items per page must not exceed 100").default(10),
  totalItems: z.number().min(0, "Total items must be non-negative").default(0),
  totalPages: z.number().min(0, "Total pages must be non-negative").default(0)
})

export const sortSchema = z.object({
  key: z.string().min(1, "Sort key is required"),
  direction: z.enum(['asc', 'desc']).default('asc')
})

// Settings schemas
export const appSettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).default('system'),
  language: z.string().min(2, "Language code must be at least 2 characters").default('en'),
  notifications: z.boolean().default(true),
  autoSave: z.boolean().default(true),
  itemsPerPage: z.number().min(5).max(100).default(10),
  dateFormat: z.string().default('MM/dd/yyyy'),
  currency: z.string().min(1, "Currency is required").default('PHP')
})

// Dashboard schemas
export const dashboardStatsSchema = z.object({
  totalClinicLogs: z.number().min(0).default(0),
  totalReimbursements: z.number().min(0).default(0),
  pendingReimbursements: z.number().min(0).default(0),
  approvedReimbursements: z.number().min(0).default(0),
  totalMedicineValue: z.number().min(0).default(0),
  totalReimbursementAmount: z.number().min(0).default(0),
  recentActivity: z.array(z.object({
    id: z.string().uuid(),
    type: z.enum(['clinic_log', 'reimbursement', 'approval', 'rejection']),
    title: z.string().min(1, "Activity title is required"),
    description: z.string().min(1, "Activity description is required"),
    timestamp: dateSchema,
    userId: z.string().uuid(),
    userName: z.string().min(1, "User name is required"),
    status: z.string().optional(),
    metadata: z.record(z.any()).optional()
  })).default([])
})

// File upload schemas
export const fileUploadSchema = z.object({
  file: z.instanceof(File),
  maxSize: z.number().default(5 * 1024 * 1024), // 5MB default
  allowedTypes: z.array(z.string()).default(['image/jpeg', 'image/png', 'image/gif', 'application/pdf'])
}).refine((data) => {
  return data.file.size <= data.maxSize
}, {
  message: "File size exceeds maximum allowed size",
  path: ["file"]
}).refine((data) => {
  return data.allowedTypes.includes(data.file.type)
}, {
  message: "File type is not allowed",
  path: ["file"]
})

// Export validation functions
export const validateClinicLogForm = (data: unknown) => {
  return clinicLogFormSchema.safeParse(data)
}

export const validateReimbursementForm = (data: unknown) => {
  return reimbursementFormSchema.safeParse(data)
}

export const validateLogin = (data: unknown) => {
  return loginSchema.safeParse(data)
}

export const validateUser = (data: unknown) => {
  return userSchema.safeParse(data)
}

export const validateSearch = (data: unknown) => {
  return searchSchema.safeParse(data)
}

export const validatePagination = (data: unknown) => {
  return paginationSchema.safeParse(data)
}

export const validateSort = (data: unknown) => {
  return sortSchema.safeParse(data)
}

export const validateSettings = (data: unknown) => {
  return appSettingsSchema.safeParse(data)
}

export const validateFileUpload = (data: unknown) => {
  return fileUploadSchema.safeParse(data)
}

// Type exports for form inference
export type LoginFormData = z.infer<typeof loginSchema>
export type UserFormData = z.infer<typeof userSchema>
export type ClinicLogFormData = z.infer<typeof clinicLogFormSchema>
export type ReimbursementFormData = z.infer<typeof reimbursementFormSchema>
export type SearchFormData = z.infer<typeof searchSchema>
export type PaginationData = z.infer<typeof paginationSchema>
export type SortData = z.infer<typeof sortSchema>
export type AppSettingsData = z.infer<typeof appSettingsSchema>
export type DashboardStatsData = z.infer<typeof dashboardStatsSchema>
export type FileUploadData = z.infer<typeof fileUploadSchema> 