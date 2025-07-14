// User types
export interface User {
  id: string
  name: string
  email: string
  role: 'nurse' | 'admin' | 'staff'
  nurseId?: string
  department?: string
  avatar?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Authentication types
export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface LoginCredentials {
  email: string
  password: string
}

// Medicine and Supply item types
export interface MedicineItem {
  name: string
  customName?: string
  quantity: number
}

export interface SupplyItem {
  name: string
  customName?: string
  quantity: number
}

// Clinic Log types
export interface ClinicLog {
  id: string
  date: Date
  lastName: string
  firstName: string
  sex: 'Male' | 'Female'
  employeeNumber: string
  client: string
  chiefComplaint: string
  medicines: MedicineItem[]
  supplies: SupplyItem[]
  issuedBy: string
  nurseId: string
  nurseName: string
  createdAt: Date
  updatedAt: Date
  status: 'active' | 'archived'
}

export interface ClinicLogFormData {
  date: Date
  lastName: string
  firstName: string
  sex: 'Male' | 'Female'
  employeeNumber: string
  client: string
  chiefComplaint: string
  medicines: MedicineItem[]
  supplies: SupplyItem[]
  issuedBy: string
}

// Reimbursement types
export interface Reimbursement {
  id: string;
  date: string;
  employeeId: string;
  fullNameEmployee: string;
  fullNameDependent?: string;
  workLocation: 'Office' | 'WFH';
  receiptDate: string;
  amountRequested: number;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface ReimbursementFormData {
  date: Date
  employeeName: string
  employeeId: string
  medicineType: string
  amount: number
  receiptFile?: File
  purpose: string
}

// Form state types
export interface FormState<T> {
  data: T
  errors: Record<keyof T, string[]>
  isDirty: boolean
  isValid: boolean
  isSubmitting: boolean
  isSuccess: boolean
  errorMessage?: string
}

// Table and pagination types
export interface TableColumn<T> {
  key: keyof T
  label: string
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
  render?: (value: T[keyof T], record: T) => React.ReactNode
}

export interface TableData<T> {
  data: T[]
  columns: TableColumn<T>[]
  totalItems: number
  currentPage: number
  itemsPerPage: number
  totalPages: number
  isLoading: boolean
  error?: string
}

export interface PaginationState {
  currentPage: number
  itemsPerPage: number
  totalItems: number
  totalPages: number
}

export interface SortState {
  key: string
  direction: 'asc' | 'desc'
}

export interface FilterState {
  searchTerm: string
  dateRange?: {
    from: Date
    to: Date
  }
  status?: string
  medicineType?: string
  supplier?: string
}

// Dashboard types
export interface DashboardStats {
  totalClinicLogs: number
  totalReimbursements: number
  pendingReimbursements: number
  approvedReimbursements: number
  totalMedicineValue: number
  totalReimbursementAmount: number
  recentActivity: ActivityItem[]
}

export interface ActivityItem {
  id: string
  type: 'clinic_log' | 'reimbursement' | 'approval' | 'rejection'
  title: string
  description: string
  timestamp: Date
  userId: string
  userName: string
  status?: string
  metadata?: Record<string, any>
}

// Navigation types
export interface NavigationItem {
  id: string
  label: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  active?: boolean
  badge?: string | number
  children?: NavigationItem[]
}

// Storage types
export interface StorageData {
  clinicLogs: ClinicLog[]
  reimbursements: Reimbursement[]
  users: User[]
  currentUser: User | null
  settings: AppSettings
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system'
  language: string
  notifications: boolean
  autoSave: boolean
  itemsPerPage: number
  dateFormat: string
  currency: string
}

// API response types
export interface ApiResponse<T> {
  data: T
  message: string
  success: boolean
  timestamp: Date
}

export interface ApiError {
  message: string
  code: string
  details?: Record<string, any>
}

// Utility types
export type WithId<T> = T & { id: string }
export type WithTimestamps<T> = T & {
  createdAt: Date
  updatedAt: Date
}

export type CreateInput<T> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>
export type UpdateInput<T> = Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>

// Medicine types for dropdowns
export interface MedicineOption {
  value: string
  label: string
  category: string
  commonDosages?: string[]
}

export interface SupplierOption {
  value: string
  label: string
  contact?: string
  location?: string
}

// Export utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type Required<T, K extends keyof T> = T & RequiredFields<T, K>

type RequiredFields<T, K extends keyof T> = {
  [P in K]-?: T[P]
} 